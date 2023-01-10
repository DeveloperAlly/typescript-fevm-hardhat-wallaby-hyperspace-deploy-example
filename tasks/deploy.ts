import type { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
// import { network } from 'hardhat';
import { subtask, task } from 'hardhat/config';
import type { TaskArguments } from 'hardhat/types';
const fa = require('@glif/filecoin-address');
const util = require('util');
const request = util.promisify(require('request'));

import type { Greeter } from '../typechain-types/Greeter';
import type { Greeter__factory } from '../typechain-types/factories/Greeter__factory';

task('deploy:Greeter')
  .addParam('greeting', 'Say hello, be nice')
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const provider = new ethers.providers.JsonRpcProvider(
      'https://wallaby.node.glif.io/rpc/v0'
    );
    //WORKS
    // const provider = new ethers.providers.JsonRpcProvider(
    //   process.env.GOERLI_RPC
    // );
    const signer = new ethers.Wallet(
      process.env.WALLET_PRIVATE_KEY ?? 'undefined',
      provider
    );

    console.log('signer', signer);
    const greeterFactory: Greeter__factory = <Greeter__factory>(
      await ethers.getContractFactory('Greeter')
    );
    // let contract_owner = await ethers.getSigner(network.config.from);
    const greeter: Greeter = <Greeter>(
      await greeterFactory.connect(signer).deploy(taskArguments.greeting)
    );
    await greeter.deployed();
    console.log('Greeter deployed to: ', greeter.address);
  });

task('deploy:Greeter-Wallaby-broken')
  .addParam('greeting', 'Bonjour, le Monde!')
  .setAction(async (taskArguments: TaskArguments, hre) => {
    // const provider = new hre.ethers.providers.JsonRpcProvider(
    //   'https://wallaby.node.glif.io/rpc/v0'
    // );

    //Deploys fine to GOERLI endpoint
    const provider = new hre.ethers.providers.JsonRpcProvider(
      process.env.GOERLI_RPC
    );
    const signer = new hre.ethers.Wallet(
      process.env.WALLET_PRIVATE_KEY ?? 'undefined',
      provider
    );

    //from fevm-hardhat-kit & Zondax: - WHAT DOES THIS DO?? SEEMS NOT NEEDED?
    const f4Address = fa.delegatedFromEthAddress(signer.address).toString();

    console.log('signer', signer);
    // console.log('deployer', deployer);
    console.log('provider', provider);
    // console.log('f4 addy', f4Address);

    const greeterFactory: Greeter__factory = <Greeter__factory>(
      await hre.ethers.getContractFactory('Greeter', signer)
    );

    console.log('factory', greeterFactory);
    const priorityFee = await hre.run('callRPC', {
      method: 'eth_maxPriorityFeePerGas',
      params: [],
    });

    const greeter: Greeter = <Greeter>(
      await greeterFactory.connect(signer).deploy(taskArguments.greeting, {
        maxPriorityFeePerGas: priorityFee,
      })
    );
    await greeter.deployed();
    console.log('greeter', greeter.address);
  });

task('deploy:Greeter-Wallaby')
  .addParam('greeting', 'Bonjour, le Monde!')
  .setAction(async (taskArguments: TaskArguments, hre) => {
    const greeterFactory: Greeter__factory = <Greeter__factory>(
      await hre.ethers.getContractFactory('Greeter')
    );

    console.log('factory', greeterFactory);
    const priorityFee = await hre.run('callRPC', {
      method: 'eth_maxPriorityFeePerGas',
      params: [],
    });

    const greeter: Greeter = <Greeter>await greeterFactory.deploy(
      taskArguments.greeting,
      {
        maxPriorityFeePerGas: priorityFee,
      }
    );
    await greeter.deployed();
    console.log('greeter address', greeter.address);
  });

subtask('callRPC', 'callsWallabyRPC').setAction(
  async (taskArguments: TaskArguments) => {
    console.log('callRPC', taskArguments);
    var options = {
      method: 'POST',
      url: 'https://wallaby.node.glif.io/rpc/v0',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: taskArguments.method,
        params: taskArguments.params,
        id: 1,
      }),
    };
    const res = await request(options);
    // console.log('res \n\n\n', JSON.parse(res.body).result);
    console.log('callRPC res', res.statusMessage);
    return JSON.parse(res.body).result;
  }
);
