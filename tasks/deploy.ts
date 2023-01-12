import { subtask, task, types } from 'hardhat/config';
import type { TaskArguments } from 'hardhat/types';
import fs from 'fs';
import path from 'path';
import util from 'util';
const request = util.promisify(require('request'));
const appendFile = util.promisify(fs.appendFile);

import type { Greeter } from '../typechain-types/Greeter';
import type { Greeter__factory } from '../typechain-types/factories/Greeter__factory';

task('deploy:Greeter-Wallaby')
  .addOptionalParam(
    'greeting',
    'the greeting to print from contract',
    'Bonjour, le Monde!',
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
        explorerUrl: `https://explorer.glif.io/address/${greeter.address}/?network=wallabynet`,
      },
    });
  });

// TODO: typesafety and error checks - im not checking I have method or params
subtask('callRPC', 'callsWallabyRPC')
  .addParam('method', 'http method', 'POST', types.string)
  .addOptionalVariadicPositionalParam('params', 'http body params', [])
  .setAction(async (taskArguments: TaskArguments) => {
    console.log('callRPC', taskArguments);
    var options = {
      method: 'POST',
      url: 'https://wallaby.node.glif.io/rpc/v0', //addParam('rpc')
      headers: {
        'Content-Type': 'application/json', //addParam('content-type)
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
  });

// TODO: type safety and error checks
// won't worry about optimising with createWriteStream here since it's only a small about of data
subtask('logToFile', 'writes outputs to a file')
  .addParam('filePath', 'relative file path', './log.txt', types.string)
  .addParam('data', '{json obj data}', {}, types.json)
  .setAction(async (taskArguments: TaskArguments) => {
    console.log('writing to file', taskArguments.data);
    //addFileSync stops anything else that is executing while this runs
    //won't create the file if it does not exist though so using addFile
    await appendFile(
      path.resolve(__dirname, taskArguments.filePath),
      `${JSON.stringify(taskArguments.data)}\n`,
      'utf-8'
    );
  });
