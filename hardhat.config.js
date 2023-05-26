require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	solidity: "0.8.18",
	networks: {
		polygon_mumbai: {
			url: process.env.POLYGON_TESTNET_URL,
			accounts: [process.env.PRIVATE_KEY],
			saveDeployments: true,
			chainId: 80001,
		},
	},
	etherscan: {
		apiKey: process.env.POLYGONSCAN_APIKEY,
	},
};
