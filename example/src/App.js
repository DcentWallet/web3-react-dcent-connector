import "./styles.css";
import { useState, useEffect } from "react";
import { Web3ReactProvider, useWeb3React } from "@web3-react/core";
import { NetworkConnector } from "@web3-react/network-connector";
import { DcentConnector } from "dcent-connector"
import { Web3Provider } from "@ethersproject/providers";

import 'dotenv/config'

const networkConnector = new NetworkConnector({
  urls: {
    1: process.env.REACT_APP_RPC_URL_1,
  },
  defaultChainId: 1
});
const dcentConnector = new DcentConnector({
  chainId: 1,
  url: process.env.REACT_APP_RPC_URL_1,
})

export default function () {
  const getLibrary = (provider) => {
    console.log("[getLibrary] provider", provider);
    return new Web3Provider(provider);
  };

  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <App />
    </Web3ReactProvider>
  );
}
function App() {
  const [blockNumber, setBlockNumber] = useState(undefined);
  const { connector, library, activate, deactivate, active, account } = useWeb3React();

  useEffect(() => {
    console.log('[UseEffect] library', library);
    if (library) {
      library.getBlockNumber().then((bn) => {
        setBlockNumber(bn);
      });
      library.on("block", setBlockNumber);
      return () => {
        library.removeListener("block", setBlockNumber);
        setBlockNumber(undefined);
      };
    }
  }, [library]);
  const onClickNetworkActivate = () => {
    activate(networkConnector);
  };
  const onClickDcentActivate = () => {
    activate(dcentConnector, (error) => {
      console.error(error)
    })
  }
  const onClickDeactivate = () => {
    deactivate(connector);
  };

  return (
    <div className="App">
      <b>Current Block Number: </b>
      {blockNumber}
      <br />
      <b>Current Account: </b>
      {account}
      <br />
      <button onClick={onClickNetworkActivate}>network activate</button>
      <button onClick={onClickDcentActivate}>dcent activate</button>
      {active && <button onClick={onClickDeactivate}>deactivate</button>}
    </div>
  );
}
