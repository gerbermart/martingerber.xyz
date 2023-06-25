const contractAddress = '0xbb1696ed7CE36a50a947e20F3785DE11460AEcEe'; // Replace with the actual contract address
const contractABI = [
    [
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "addr",
                    "type": "address"
                }
            ],
            "name": "AddressAllowed",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "operator",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "id",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "TransferSingle",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "value",
                    "type": "string"
                },
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "id",
                    "type": "uint256"
                }
            ],
            "name": "URI",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "mintCount",
                    "type": "uint256"
                }
            ],
            "name": "freeMint",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "mintCount",
                    "type": "uint256"
                }
            ],
            "name": "mintAlbum",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "uri_input",
                    "type": "string"
                }
            ],
            "name": "mintNewToken",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "addressInput",
                    "type": "address"
                }
            ],
            "name": "setAllow",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "newMintPrice",
                    "type": "uint256"
                }
            ],
            "name": "setMintPrice",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                },
                {
                    "internalType": "address",
                    "name": "addressInput",
                    "type": "address"
                }
            ],
            "name": "setPayout",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                },
                {
                    "internalType": "string",
                    "name": "uriInput",
                    "type": "string"
                }
            ],
            "name": "setTokenUri",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                },
                {
                    "internalType": "string",
                    "name": "uriInput",
                    "type": "string"
                }
            ],
            "name": "setURI",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "addresses",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "ALBUM_ID",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "allow_addresses",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "allowed_addresses",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "mintPrice",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "owner",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "totalMints",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "uri",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ]
]; // Replace with the actual contract ABI

const ethereumProvider = window.ethereum;

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

async function freeMint() {
  const mintCount = 1; // Number of album mints

  try {
    const accounts = await ethereumProvider.request({ method: 'eth_requestAccounts' });
    const from = accounts[0];

    const transactionParameters = {
      from: from,
      to: contractAddress,
      data: contract.methods.freeMint(ALBUM_ID, mintCount).encodeABI()
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

// Initialize the contract and enable minting buttons
initializeContract();
