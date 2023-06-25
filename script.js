<!DOCTYPE html>
<html>
<head>
    <title>Mint Album</title>
    <script>
        async function mintAlbum() {
            try {
                const contractAddress = 'CONTRACT_ADDRESS'; // Replace with the actual contract address
                const contractABI = CONTRACT_ABI; // Replace with the actual contract ABI
                const contract = new window.ethereum.Contract(contractABI, contractAddress);

                const mintCount = 1; // Number of album mints

                const mintPrice = await contract.methods.mintPrice().call();
                const totalAmount = mintPrice * mintCount;

                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                const from = accounts[0];

                const options = {
                    from,
                    value: totalAmount,
                    gasPrice: '20000000000', // Replace with the desired gas price (optional)
                };

                await contract.methods.mintAlbum(1, mintCount).send(options);

                console.log('Mint transaction sent successfully!');
                alert('MINT COMPLETE!');
            } catch (error) {
                console.error('Error occurred while minting:', error);
                alert('Error occurred while minting: ' + error.message);
            }
        }

        async function freeMint() {
            try {
                const contractAddress = 'CONTRACT_ADDRESS'; // Replace with the actual contract address
                const contractABI = CONTRACT_ABI; // Replace with the actual contract ABI
                const contract = new window.ethereum.Contract(contractABI, contractAddress);

                const mintCount = 1; // Number of album mints

                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                const from = accounts[0];

                const options = {
                    from,
                };

                await contract.methods.freeMint(1, mintCount).send(options);

                console.log('Free Mint transaction sent successfully!');
                alert('MINT COMPLETE!');
            } catch (error) {
                console.error('Error occurred while free minting:', error);
                alert('Error occurred while free minting: ' + error.message);
            }
        }
    </script>
</head>
<body>
    <button onclick="mintAlbum()">Mint Album</button>
    <button onclick="freeMint()">Free Mint</button>
</body>
</html>
