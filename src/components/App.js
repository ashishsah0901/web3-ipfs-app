import React, { useEffect, useState } from "react";
import Web3 from "web3";
import Meme from "../abis/Meme.json";

const ipfsClient = require("ipfs-http-client");
const ipfs = ipfsClient({ host: "ipfs.infura.io", port: 5001, protocol: "https" });

const App = () => {
  const [memeHash, setMemeHash] = useState("");
  const [contract, setContract] = useState(null);
  const [buffer, setBuffer] = useState(null);
  const [account, setAccount] = useState(null);

  const captureFile = (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      setBuffer(Buffer(reader.result));
    };
  };
  const onSubmit = (e) => {
    e.preventDefault();
    ipfs.add(buffer, (error, result) => {
      if (error) {
        console.error(error);
        return;
      }
      contract.methods
        .set(result[0].hash)
        .send({ from: account })
        .then(() => {
          return setMemeHash(result[0].hash);
        });
    });
  };

  useEffect(() => {
    const loadWeb3 = async () => {
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
      } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
      } else {
        window.alert("Non-Ethereum browser detected. You should consider trying MetaMask!");
      }
    };

    const loadBlockchainData = async () => {
      const web3 = window.web3;
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
      const networkId = await web3.eth.net.getId();
      const networkData = Meme.networks[networkId];
      if (networkData) {
        const contract = web3.eth.Contract(Meme.abi, networkData.address);
        setContract(contract);
        const memeHash = await contract.methods.get().call();
        setMemeHash(memeHash);
      } else {
        window.alert("Smart contract not deployed to detected network.");
      }
    };
    loadWeb3();
    loadBlockchainData();
  }, []);

  return (
    <div>
      <nav className="navbar navbar-light fixed-top bg-light flex-md-nowrap p-0 shadow">
        <a className="navbar-brand col-sm-3 col-md-2 mr-0" href="https://github.com/ashishsah0901" target="_blank" rel="noopener noreferrer">
          Meme of the Day
        </a>
      </nav>
      <div className="container-fluid mt-5">
        <div className="row">
          <main role="main" className="col-lg-12 d-flex text-center">
            <div className="content mr-auto ml-auto">
              <a href="https://github.com/ashishsah0901" target="_blank" rel="noopener noreferrer">
                <img src={`https://ipfs.infura.io/ipfs/${memeHash}`} alt="" />
              </a>
              <p>&nbsp;</p>
              <h2>Change Meme</h2>
              <form onSubmit={onSubmit}>
                <input type="file" onChange={captureFile} />
                <input type="submit" />
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;
