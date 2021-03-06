import React from "react";
import styled, { css } from 'styled-components';
import Loader from 'react-loader-spinner'
import { Waypoint } from "react-waypoint";

import { useWeb3React } from '@web3-react/core'
import { addresses, abis } from "@project/contracts";
import EPNSCoreHelper from 'helpers/EPNSCoreHelper';
import { ethers } from "ethers";

import DisplayNotice from "components/DisplayNotice";
import ViewChannelItem from "components/ViewChannelItem";
import Faucets from "components/Faucets";

import ChannelsDataStore, { ChannelEvents } from "singletons/ChannelsDataStore";
import UsersDataStore, { UserEvents } from "singletons/UsersDataStore";

// Create Header
function ViewChannels({ epnsReadProvider, epnsWriteProvide }) {
  const { account, library } = useWeb3React();

  const [controlAt, setControlAt] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [channels, setChannels] = React.useState([]);
  const [paginatedChannels, setPaginatedChannels] = React.useState([]);
  const [user, setUser] = React.useState(null);
  const [owner, setOwner] = React.useState(null);

  const [page, setPage] = React.useState(0);
  const channelsPerPage = 2;
  const channelsVisited = page * channelsPerPage;

  React.useEffect(() => {
    fetchChannels();
  }, [account]);

  //update paginatedChannels array when scrolled till the end
  React.useEffect(() => {
    if(channels){
      setPaginatedChannels(prev => [...prev, ...channels.slice(channelsVisited, channelsVisited + channelsPerPage)])
    }
  }, [channels, page]);

  // handle user action at control center
  const userClickedAt = (controlIndex) => {
    setControlAt(controlIndex);
  }

  // to fetch channels
  const fetchChannels = async () => {
    // get and set user and owner first
    const userMeta = await UsersDataStore.instance.getUserMetaAsync();
    setUser(userMeta);

    const ownerAddr = await UsersDataStore.instance.getOwnerMetaAsync();
    setOwner(ownerAddr);

    // const channelsMeta = await EPNSCoreHelper.getChannelsMetaLatestToOldest(-1, -1, epnsReadProvider);
    const channelsMeta = await ChannelsDataStore.instance.getChannelsMetaAsync(-1, -1);

    // sort this again, this time with subscriber count
    // channelsMeta.sort((a, b) => {
    //   if (a.memberCount.toNumber() < b.memberCount.toNumber()) return -1;
    //   if (a.memberCount.toNumber() > b.memberCount.toNumber()) return 1;
    //   return 0;
    // });

    // Filter out channel

    setChannels(channelsMeta);
    setLoading(false);
  }

  

  return (
    <>
    <Container>
      {loading &&
        <ContainerInfo>
          <Loader
           type="Oval"
           color="#35c5f3"
           height={40}
           width={40}
          />
        </ContainerInfo>
      }

      {!loading && controlAt == 0 && channels.length == 0 &&
        <ContainerInfo>
          <DisplayNotice
            title="That's weird, No Channels in EPNS... world is ending... right?"
            theme="primary"
          />
        </ContainerInfo>
      }

      {!loading && controlAt == 0 && channels.length != 0 &&
        <Items id="scrollstyle-secondary">
          <Faucets/>

          {Object.keys(paginatedChannels).map(index => {
            const isOwner = (
              paginatedChannels[index].addr === account ||
              (account === owner && paginatedChannels[index].addr === "0x0000000000000000000000000000000000000000")
            );

            if (paginatedChannels[index].addr !== "0x0000000000000000000000000000000000000000") {
              return (
                <>
                {Number(index) === paginatedChannels.length -1 && (<Waypoint onEnter = { () => setPage(prev => prev + 1)}/>)}
                <ViewChannelItem
                  key={paginatedChannels[index].addr}
                  channelObject={paginatedChannels[index]}
                  isOwner={isOwner}
                  epnsReadProvider={epnsReadProvider}
                  epnsWriteProvide={epnsWriteProvide}
                />
                </>
              );
            }
            else if (paginatedChannels[index].addr === "0x0000000000000000000000000000000000000000" && user.channellized) {
              return (
                <>
                {Number(index) === paginatedChannels.length -1 && (<Waypoint onEnter = { () => setPage(prev => prev + 1)}/>)}
                <ViewChannelItem
                  key={paginatedChannels[index].addr}
                  channelObject={paginatedChannels[index]}
                  isOwner={isOwner}
                  epnsReadProvider={epnsReadProvider}
                  epnsWriteProvide={epnsWriteProvide}
                />
                </>
              );
            }
            else {
              return(
                <>
                {Number(index) === paginatedChannels.length -1 && (<Waypoint onEnter = { () => setPage(prev => prev + 1)}/>)}
                </>
              )
            }
          })}
        </Items>
      }
    </Container>
    </>
  );
}

// css styles
const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;

  font-weight: 200;
  align-content: center;
  align-items: center;
  justify-content: center;

  max-height: 80vh;
`

const ContainerInfo = styled.div`
  padding: 20px;
`

const Items = styled.div`
  display: block;
  align-self: stretch;
  padding: 10px 20px;
  overflow-y: scroll;
  background: #fafafa;
`

// Export Default
export default ViewChannels;
