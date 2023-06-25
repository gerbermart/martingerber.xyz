const contractAddress = '<contract_address>'; // Replace with your contract address

// Function to update the message text
function updateMessage(text) {
  const messageElement = document.getElementById('message');
  messageElement.innerText = text;
}

// Function to handle the button click event
async function mintAlbum() {
  try {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const from = accounts[0];
    const tokenId = 1;
    const mintCount = 1;

    // Call the contract's mintAlbum function
    const response = await fetch(`https://api.infura.io/v1/jsonrpc/mainnet/eth_call?params=[{"to": "${contractAddress}", "data": "0xd5a54fbf000000000000000000000000000000000000000000000000000000000000001"}]`);
    const result = await response.json();

    if (result.error) {
      updateMessage('Minting failed. Please try again.');
    } else {
      // Check if the transaction was successful
      if (result.result === '0x') {
        updateMessage('Minting in progress...');
      } else {
        updateMessage('MINT COMPLETE!');
      }
    }
  } catch (error) {
    console.error(error);
    updateMessage('An error occurred. Please try again.');
  }
}
