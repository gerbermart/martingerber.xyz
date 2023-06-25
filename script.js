const contractAddress = '0xbb1696ed7CE36a50a947e20F3785DE11460AEcEe'; // Replace with the actual contract address
import { contractABI } from './abi.js';

loadContractABI();
const ethereumProvider = window.ethereum;
let contract; // Declare the contract variable

async function mintAlbum() {
  const mintCount = 1; // Number of album mints
  const mintPrice = await contract.methods.mintPrice().call();
  const value = ethereumProvider.utils.toWei(String(mintPrice * mintCount));

  try {
    const accounts = await ethereumProvider.request({ method: 'eth_requestAccounts' });
    const from = accounts[0];

    const transactionParameters = {
      from: from,
      to: contractAddress,
      value: value,
      data: contract.methods.mintAlbum(ALBUM_ID, mintCount).encodeABI()
    };

    const txHash = await ethereumProvider.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters]
    });

    console.log('Mint Transaction Hash:', txHash);
  } catch (error) {
    console.log('Mint Failed:', error);
  }
}

async function initializeContract() {
  try {
    const accounts = await ethereumProvider.request({ method: 'eth_requestAccounts' });
    const from = accounts[0];

    const web3 = new Web3(ethereumProvider);
    contract = new web3.eth.Contract(contractABI, contractAddress, { from: from });
    console.log('Contract Initialized');
  } catch (error) {
    console.log('Contract Initialization Failed:', error);
  }
}

// Initialize the contract and enable minting button
initializeContract();

// Add event listener to the mint button
document.getElementById('mintButton').addEventListener('click', mintAlbum);
