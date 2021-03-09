import "./styles.css";
import { useState, useEffect } from "react";
import { Web3ReactProvider, useWeb3React } from "@web3-react/core";
import { NetworkConnector } from "@web3-react/network-connector";
import { Web3Provider } from "@ethersproject/providers";

import 'dotenv/config'

console.log(process.env.REACT_APP_RPC_URL_1);
const networkConnector = new NetworkConnector({
  urls: {
    1: process.env.REACT_APP_RPC_URL_1
  },
  defaultChainId: 1
});

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
  const { connector, library, activate, deactivate, active } = useWeb3React();

  useEffect(() => {
    console.log(library);
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
  const onClickActivate = () => {
    activate(networkConnector);
  };
  const onClickDeactivate = () => {
    deactivate(connector);
  };

  return (
    <div className="App">
      <b>Current Block Number: </b>
      {blockNumber}
      <br />
      <button onClick={onClickActivate}>activate</button>
      {active && <button onClick={onClickDeactivate}>deactivate</button>}
    </div>
  );
}
