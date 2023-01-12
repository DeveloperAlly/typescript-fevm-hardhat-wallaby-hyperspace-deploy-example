// What I don't like about the inbuilt deploy script is the inability
// to pass args/params into the function from the terminal.
// This is why I default to a task for deployment
// could MAYBE something like npx hardhat run scripts/deploy.js --network rinkeby --constructor-args arguments/greeter.arguments.js
// but too much hassle for me

import hre from 'hardhat';
import path from 'path';

import type { SimpleCoin } from '../typechain-types/SimpleCoin';
import type { SimpleCoin__factory } from '../typechain-types/factories/SimpleCoin__factory';

const tokenToBeMinted: number = 12000;

async function main() {
  console.log('Greetings Fil-der! Im deploying SimpleCoin');
  const simpleCoinFactory: SimpleCoin__factory = <SimpleCoin__factory>(
    await hre.ethers.getContractFactory('SimpleCoin')
  );

  const priorityFee = await hre.run('callRPC', {
    method: 'eth_maxPriorityFeePerGas',
    params: [],
  });

  const simpleCoin: SimpleCoin = <SimpleCoin>await simpleCoinFactory.deploy(
    tokenToBeMinted,
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
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
