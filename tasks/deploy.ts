import { task, types } from 'hardhat/config';
import type { TaskArguments } from 'hardhat/types';

import type { Greeter } from '../typechain-types/Greeter';
import type { Greeter__factory } from '../typechain-types/factories/Greeter__factory';
import { SimpleCoin__factory } from '../typechain-types/factories/SimpleCoin__factory';
import { SimpleCoin } from '../typechain-types/SimpleCoin';

import path from 'path';

const explorerUrl = 'https://fvm.starboard.ventures/contracts/'; // alt: https://explorer.glif.io/address/{address}/wallaby

task('deploy:Greeter-Wallaby')
  .addOptionalParam(
    'greeting',
    'the greeting to print from contract',
    'Bonjour, le Monde!',
    types.string
  )
  .addOptionalParam(
    'explorerBaseLink', //param name
    'url for the block explorer to write details to file', //description
    explorerUrl, //default if not supplied
    types.string
  )
  .setAction(async (taskArguments: TaskArguments, hre) => {
    console.log('Greetings fil-der! Im deploying Greeter');
    const greeterFactory: Greeter__factory = <Greeter__factory>(
      await hre.ethers.getContractFactory('Greeter')
    );

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
    console.log('Success! Greeter deployer to address:', greeter.address);

    await hre.run('logToFile', {
      filePath: path.resolve(__dirname, 'log.txt'),
      data: greeter,
    });
  });

task('deploy:SimpleCoin-Wallaby')
  .addOptionalParam(
    'tokenToBeMinted',
    'the number of tokens to mint',
    314,
    types.int
  )
  .addOptionalParam(
    'explorerBaseLink', //param name
    'url for the block explorer to write details to file', //description
    explorerUrl, //default if not supplied
    types.string
  )
  .setAction(async (taskArguments: TaskArguments, hre) => {
    console.log('Greetings fil-der! Im deploying SimpleCoin');

    const simpleCoinFactory: SimpleCoin__factory = <SimpleCoin__factory>(
      await hre.ethers.getContractFactory('SimpleCoin')
    );

    const priorityFee = await hre.run('callRPC', {
      method: 'eth_maxPriorityFeePerGas',
      params: [],
    });

    const simpleCoin: SimpleCoin = <SimpleCoin>await simpleCoinFactory.deploy(
      taskArguments.tokenToBeMinted,
      {
        maxPriorityFeePerGas: priorityFee,
      }
    );
    await simpleCoin.deployed();
    console.log('Success! SimpleCoin deployed to address:', simpleCoin.address);

    //Optional: Log to a file for reference
    await hre.run('logToFile', {
      filePath: path.resolve(__dirname, 'log.txt'),
      data: simpleCoin,
    });
  });
