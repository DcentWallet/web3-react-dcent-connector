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

function SignMessage ({ address }) {
  const [signMessage, setSignMessage] = useState('')
  const [signResult, setSignResult] = useState('')
  const { library, connector } = useWeb3React();

  const onChangeSignMessage = (e) => {
    setSignMessage(e.target.value)
  }
  const onClickSign = () => {
    console.log('[onClickSign] signMessage', signMessage)
    /** @type {import('../../src/provider/DcentSubProvider').default} */
    const subProvider = library.provider._providers[0]
    subProvider.signPersonalMessage({
      data: signMessage,
      from: address,
    }).then(setSignResult)
  }
  const onClickClear = () => {
    setSignMessage('')
    setSignResult('')
  }

  return (
    <>
      {
        (connector === dcentConnector) &&
        <div style={{
          marginTop: '20px',
        }}>
          signMessage: 
          <input onChange={onChangeSignMessage} value={signMessage}/>
          <button onClick={onClickSign}>SignMessage</button>
          <button onClick={onClickClear}>clear</button>
          <br />
          signResult: {signResult}
        </div>
      }
    </>
  )
}

function SignTransaction({address}) {
  const { library, connector } = useWeb3React();
  const defaultTxData = {
    from: '',
    to: '',
    gas: '21000',
    gasPrice: '0',
    nonce: '0',
    value: '0',
    data: '0x'
  }
  const [txData, setTxData] = useState(JSON.stringify(defaultTxData, null, 2))
  const [txResult, setTxResult] = useState('')

  useEffect(() => {
    const txDataObj = JSON.parse(txData)
    txDataObj.from = address
    txDataObj.to = address
    setTxData(JSON.stringify(txDataObj, null, 2))
  }, [address])

  const onClickSignTransaction = () => {
    /** @type {import('../../src/provider/DcentSubProvider').default} */
    const subProvider = library.provider._providers[0]
    subProvider.signTransaction(JSON.parse(txData)).then(setTxResult)
  }

  const onClickClear = () => {
    setTxResult('')
    setTxData(JSON.stringify(defaultTxData, null, 2))
  }

  const onChangeTxData = (e) => {
    setTxData(e.target.value)
  }

  return (
    <>
      {
        (connector === dcentConnector) &&
        <div style={{
          marginTop: '20px',
          marginBottom: '20px',
        }}>
          <textarea onChange={onChangeTxData} value={txData} style={{
            marginLeft: 'auto',
            marginRight: 'auto',
          }}/><br />
          <button onClick={onClickSignTransaction}>SignTransaction</button>
          <button onClick={onClickClear}>clear</button>
          <br />
          Transaction Result: {txResult}
        </div>
      }
    </>
  )
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
      <SignMessage address={account} />
      <SignTransaction address={account} />
      <button onClick={onClickNetworkActivate}>network activate</button>
      <button onClick={onClickDcentActivate}>dcent activate</button>
      {active && <button onClick={onClickDeactivate}>deactivate</button>}
    </div>
  );
}
