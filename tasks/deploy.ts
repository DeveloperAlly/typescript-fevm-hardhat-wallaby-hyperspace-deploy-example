import { task, types } from 'hardhat/config';
import type { TaskArguments } from 'hardhat/types';

import type { Greeter } from '../typechain-types/Greeter';
import type { Greeter__factory } from '../typechain-types/factories/Greeter__factory';

const explorerUrl = 'https://fvm.starboard.ventures/contracts/'; // alt: https://explorer.glif.io/address/{address}/wallaby

task('deploy:Greeter-Wallaby')
  .addOptionalParam(
    'greeting',
    'the greeting to print from contract',
    'Bonjour, le Monde!',
    types.string
  )
  .addOptionalParam(
    'explorerBaseLink',
    'url for the block explorer to write details to file',
    explorerUrl,
    types.string
  )
  .setAction(async (taskArguments: TaskArguments, hre) => {
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
    console.log('greeter address', greeter.address);
    await hre.run('logToFile', {
      data: {
        network: 'wallaby',
        chainId: greeter.deployTransaction.chainId,
        owner: greeter.deployTransaction.from,
        address: greeter.address,
        tx: greeter.deployTransaction.hash,
        explorerUrl: `${taskArguments.explorerBaseLink}${greeter.address}`,
      },
    });
  });
