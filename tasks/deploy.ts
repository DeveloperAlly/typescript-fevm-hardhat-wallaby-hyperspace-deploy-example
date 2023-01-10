import { subtask, task } from 'hardhat/config';
import type { TaskArguments } from 'hardhat/types';
const util = require('util');
const request = util.promisify(require('request'));

import type { Greeter } from '../typechain-types/Greeter';
import type { Greeter__factory } from '../typechain-types/factories/Greeter__factory';

task('deploy:Greeter-Wallaby')
  .addParam('greeting', 'Bonjour, le Monde!')
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
    console.log('callRPC res', res.statusMessage);
    return JSON.parse(res.body).result;
  }
);
