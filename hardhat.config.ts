import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import './tasks';
require('dotenv').config();

const config: HardhatUserConfig = {
  solidity: '0.8.17',
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {},
    paramsAvail: {
      url: 'https://wallaby.node.glif.io/rpc/v0',
      chainId: 31415,
      from: '',
      gas: 30000,
      gasPrice: 0,
      gasMultiplier: 1,
      // accounts: [
      //   // WALLET_PRIVATE_KEY,
      // ],
      // for HD wallets
      accounts: {
        mnemonic: 'test test test test test test test test test test test junk',
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
        passphrase: '',
      },
      httpHeaders: {
        /*use this field to set extra HTTP Headers to be used when 
        making JSON-RPC requests. It accepts a JavaScript object which 
        maps header names to their values. Default value: undefined */
      },
      timeout: 10000,
    },
    goerli: {
      url: process.env.GOERLI_RPC,
      chainId: 5,
      accounts: [process.env.WALLET_PRIVATE_KEY ?? 'undefined'],
    },
    wallaby: {
      url: 'https://wallaby.node.glif.io/rpc/v0',
      chainId: 31415,
      accounts: [process.env.WALLET_PRIVATE_KEY ?? 'undefined'],
      httpHeaders: {},
    },
  },
  paths: {
    // root: './pages/api/hardhat',
    // tests: './pages/api/hardhat/tests', //who names a directory in the singular?!!!
  },
  // hardhat-deploy extension only
  // namedAccounts: {
  //   deployer: 0,
  // },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
