import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import './tasks';
require('dotenv').config();

const config: HardhatUserConfig = {
  solidity: '0.8.17',
  defaultNetwork: 'wallaby',
  networks: {
    wallaby: {
      url: 'https://wallaby.node.glif.io/rpc/v0',
      chainId: 31415,
      accounts: [process.env.WALLET_PRIVATE_KEY ?? 'undefined'],
    },
  },
};

export default config;
