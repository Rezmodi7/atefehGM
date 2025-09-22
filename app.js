// گرفتن ethers از window
const ethers = window.ethers;
if (!ethers) {
  alert("ethers library not found. Check CDN or console.");
  throw new Error("ethers is not defined");
}

const contractAddress = "0x667B5e00de8549bfcd9F966a11a0f3d483704463";
const abi = [
	{
		"anonymous": false,
		"inputs": [
			{ "indexed": true, "internalType": "address", "name": "from", "type": "address" },
			{ "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
		],
		"name": "NewGM",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "cooldown",
		"outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [{ "internalType": "uint256", "name": "count", "type": "uint256" }],
		"name": "getLastGMs",
		"outputs": [{
			"components": [
				{ "internalType": "address", "name": "sender", "type": "address" },
				{ "internalType": "uint256", "name": "timestamp", "type": "uint256" }
			],
			"internalType": "struct GMContract.GM[]",
			"name": "",
			"type": "tuple[]"
		}],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
		"name": "getRemainingCooldown",
		"outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
		"name": "gms",
		"outputs": [
			{ "internalType": "address", "name": "sender", "type": "address" },
			{ "internalType": "uint256", "name": "timestamp", "type": "uint256" }
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [{ "internalType": "address", "name": "", "type": "address" }],
		"name": "lastGM",
		"outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "sendGM",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalGMs",
		"outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
		"stateMutability": "view",
		"type": "function"
	}
];

let provider, signer, contract;

document.getElementById("connect").onclick = async () => {
  if (!window.ethereum) return alert("Please install MetaMask");

  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });

    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();

    await provider.send("wallet_addEthereumChain", [{
      chainId: "0x20d8", // 8408 in hex
      chainName: "ZenChain Testnet",
      nativeCurrency: { name: "ZenChain Token", symbol: "ZTC", decimals: 18 },
      rpcUrls: ["https://zenchain-testnet.api.onfinality.io/public"],
      blockExplorerUrls: ["https://zentrace.io/"]
    }]);

    contract = new ethers.Contract(contractAddress, abi, signer);
    alert("Wallet connected to ZenChain ✅");

    updateCooldown();
  } catch (err) {
    alert("Connection error: " + (err.message || err));
    console.error(err);
  }
};

document.getElementById("sendGM").onclick = async () => {
  if (!contract) return alert("Connect wallet first");

  try {
    const tx = await contract.sendGM();
    await tx.wait();
    alert("GM sent successfully 🚀");
    updateCooldown();
  } catch (err) {
    alert("Error: " + (err.message || err));
    console.error(err);
  }
};

async function updateCooldown() {
  if (!signer || !contract) return;

  try {
    const address = await signer.getAddress();
    const seconds = await contract.getRemainingCooldown(address);

    const secNum = seconds.toNumber();
    const hours = Math.floor(secNum / 3600);
    const mins = Math.floor((secNum % 3600) / 60);
    const secs = secNum % 60;

    document.getElementById("cooldown").innerText =
      secNum === 0
        ? "You can send GM now! 🌞"
        : `Next GM available in ${hours}h ${mins}m ${secs}s`;
  } catch (err) {
    document.getElementById("cooldown").innerText = "Error fetching cooldown";
    console.error(err);
  }
}
