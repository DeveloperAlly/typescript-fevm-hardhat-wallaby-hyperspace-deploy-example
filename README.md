## Deploying to Filecoin Virtual Machine (FVM) Wallaby Testnet from Hardhat (also works for Hyperspace)

~~To deploy to Filecoin Virtual Machine Wallaby Testnet via hardhat the only caveat now (that distinguishes it from a regular deploy to an evm chain) is that you provide a value for **maxPriorityFeePerGas** in the deploy() method - see tasks/deploy.ts for this.~~

~~You do not need to sync your eth address to a filecoin address or any other sort of config.~~

***** UPDATE changes to the gas override as per https://github.com/filecoin-project/lotus/issues/9983

USE THE DEPLOY SCRIPT AND OVERRIDE THE DEFAULT WALLET (example from another project below of the deploy script.)
````
import hre from 'hardhat';

import type { BacalhauERC721 } from '../typechain-types/contracts/BacalhauERC721';
import type { BacalhauERC721__factory } from '../typechain-types/factories/contracts/BacalhauERC721__factory';

async function main() {
  console.log('Hello Fil-der! Bacalhau721 deploying....');

  const owner = new hre.ethers.Wallet(
    process.env.WALLET_PRIVATE_KEY || 'undefined',
    hre.ethers.provider
  );

  const bacalhauERC721Factory: Greeter__factory = <BacalhauERC721__factory> 
          await hre.ethers.getContractFactory('BacalhauERC721', owner);

  const bacalhauERC721: BacalhauERC721 = <BacalhauERC721>(
    await bacalhauERC721Factory
      .deploy {timeout: 180000}
      ()
  );

  await bacalhauERC721.deployed();
  console.log('bacalhauERC721 deployed to ', bacalhauERC721.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
````

For proxy deployments - override the default time to ensure it has enough time to complete
```
// example of open zeppelin upgradeable proxy
const deployment = await upgrades.deployProxy(contract, preparedArguments, {
    timeout: 180000
});
```



**Deploying to Wallaby or Hyperspace testnet**:
- Clone this and do an ```npm install``` (or create your own hardhat from scratch and config it and add contracts and tasks yourself)
- Add your metamask wallet private key either in a .env file or by doing it locally (.env.example has the name)
- [Add Wallaby Testnet to Metamask](https://docs.filecoin.io/developers/smart-contracts/how-tos/add-to-metamask/) (if you haven't already)
- Get some tFIL tokens from the [faucet](https://wallaby.network/#faucet) (just use your metamask address) - big thanks to Patrick of Factor8 for this & the testnet running
- Deploy from hardhat - run the deploy task ```npx hardhat deploy:Greeter-Wallaby --greeting "Your greeting"```) OR - run the deploy script ```npx hardhat run --network wallaby scripts/deployGreeter.ts```
- Wait for the address and paste into [starboard](https://fvm.starboard.ventures/contracts/0xd516Ddf008118BC7E09A7aB280177Dc005D180C7) or [glif](https://explorer.glif.io/{ADDRESS}/?network=wallaby) explorer: (hint: you can try this deployed contract out 0xd516Ddf008118BC7E09A7aB280177Dc005D180C7!)
- Try it out on either hardhat or remix if you want to interact with it. (I pasted the contract in and then deployed to the address above in remix using injected provider to deploy and chck functionality - but you could also test in hardhat env)


![image](https://user-images.githubusercontent.com/12529822/211539733-92c034d1-021e-464f-a670-2ba3b9aa2180.png)

I've added a task that outputs the deployment address and some handy details to a log.txt file inside whichever directory you deploy from too - comment this call out if you don't want it in the deploy script you're using

**Updates**:
- Added SimpleCoin deployment

**Todos:**

This code is far from perfect but hopefully its helpful -> PR's are always welcome!!!

 - [ ] This is not type checking or error checking everything
 - [x] Write address to a file for use in frontends

## Basics
There is no need for an f4address or any other special treatment of the network. My hardhat.config is simply as below (I'm using Typescript)
```
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
```

The working task for deploying my Greeter.sol contract to Wallaby looks like the below and is found in the **tasks/deploy.ts** script. I used tasks because I wanted to try their versatility out and also because you can pass arguments to tasks (unlike deploy). There's also a **scripts/deployGreeter.ts** script if thats more your jam. (To deploy use  ```npx hardhat run --network wallaby scripts/deployGreeter.ts```)

The task is run with ```npx hardhat deploy:Greeter-Wallaby --greeting "Bonjour, le Monde"``` I could probably extend this to add a network param in future too

```
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

```

## Questions?
Find me in filecoinproject.slack @AlisonWonderland (Ally)

Or twitter: @developerAlly


## Issues
NB: When deploying I occassionally get the below error - ususally if I just re-run the deploy it's fine though. If anyone can shed any light - would be happy to hear it! (me tired ;p)
```
for (let i = 0; i < block.transactions.length; i++) {
                                                       ^
TypeError: Cannot read properties of null (reading 'length')
    at EthersProviderWrapper.<anonymous> (/Users/developerally/Desktop/Code/bugs/fevm-hardhat/node_modules/@ethersproject/providers/src.ts/base-provider.ts:1814:56)
```


## Original Repository History
Leaving the below in the readme in case others encounter the same thing.

** Why I originally made this repo was as a reproducible error pack (it's since morphed into an example though :) ).
Note: I'm aware there is a "kit" for this - however, its very bloated code wise, and doesn't offer too much in the way of explanation of WHY certain code is part of the package - if you have insight on some of this - would love to know about it!

UPDATE: It appears this problem links to a problem with interacting with the ethers.js library and the way FVM handles indexes. See related issues: 
https://github.com/filecoin-project/lotus/issues/9839#issuecomment-1345802873
https://github.com/filecoin-project/lotus/issues/9839#issuecomment-1345802890

Jim Pick has a crazy hack workaround if you're adventurous:  https://observablehq.com/@jimpick/fvm-actor-code-playground-erc20-sans-events?collection=@jimpick/filecoin-virtual-machine


I'm using tasks to deploy the Greeter.sol contract.

After cloning & running an npm install ```npm install```

Run > ```npx hardhat deploy:Greeter-Wallaby --greeting "Bonjour, le Monde"```

This project deploys with no issue to goerli (try changing the provider to goerli in the deploy.ts file in tasks.)
```
callRPC { method: 'eth_maxPriorityFeePerGas', params: [] }
The Hardhat Network tracing engine could not be initialized. Run Hardhat with --verbose to learn more.
callRPC res OK
greeter 0xb8ed6F2bc0Edb5DCa6eE1Bf8543D747FdEe01F26
```

This project has the following error deploying to Wallaby:

```
  reason: 'Transaction hash mismatch from Provider.sendTransaction.',
  code: 'UNKNOWN_ERROR',
  expectedHash: '0xffcd7a99af979f8fb1fca6cabf3011fb11235dd86f3fe64628649c034c9e428e',
  returnedHash: '0x82ff2fdea753dae372b46e54daeea890fd233c8fe2a006ef99c0b37827701a62',
  transaction: {
    type: 2,
    chainId: 31415,
    nonce: 4,
    maxPriorityFeePerGas: BigNumber { value: "199992" },
    maxFeePerGas: BigNumber { value: "1500000200" },
    gasPrice: null,
    gasLimit: BigNumber { value: "27688676" },
    to: null,
    value: BigNumber { value: "0" },
    data: '0x60806040523480156200001157600080fd5b5060405162001155380380620011558339818101604052810190620000379190620002e2565b620000676040518060600160405280602281526020016200113360229139826200008060201b620002c51760201c565b80600090816200007891906200057e565b5050620006f2565b62000122828260405160240162000099929190620006b7565b6040516020818303038152906040527f4b5c4277000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050506200012660201b60201c565b5050565b60008151905060006a636f6e736f6c652e6c6f679050602083016000808483855afa5050505050565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b620001b8826200016d565b810181811067ffffffffffffffff82111715620001da57620001d96200017e565b5b80604052505050565b6000620001ef6200014f565b9050620001fd8282620001ad565b919050565b600067ffffffffffffffff82111562000220576200021f6200017e565b5b6200022b826200016d565b9050602081019050919050565b60005b83811015620002585780820151818401526020810190506200023b565b60008484015250505050565b60006200027b620002758462000202565b620001e3565b9050828152602081018484840111156200029a576200029962000168565b5b620002a784828562000238565b509392505050565b600082601f830112620002c757620002c662000163565b5b8151620002d984826020860162000264565b91505092915050565b600060208284031215620002fb57620002fa62000159565b5b600082015167ffffffffffffffff8111156200031c576200031b6200015e565b5b6200032a84828501620002af565b91505092915050565b600081519050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600060028204905060018216806200038657607f821691505b6020821081036200039c576200039b6200033e565b5b50919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b600060088302620004067fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82620003c7565b620004128683620003c7565b95508019841693508086168417925050509392505050565b6000819050919050565b6000819050919050565b60006200045f6200045962000453846200042a565b62000434565b6200042a565b9050919050565b6000819050919050565b6200047b836200043e565b620004936200048a8262000466565b848454620003d4565b825550505050565b600090565b620004aa6200049b565b620004b781848462000470565b505050565b5b81811015620004df57620004d3600082620004a0565b600181019050620004bd565b5050565b601f8211156200052e57620004f881620003a2565b6200050384620003b7565b8101602085101562000513578190505b6200052b6200052285620003b7565b830182620004bc565b50505b505050565b600082821c905092915050565b6000620005536000198460080262000533565b1980831691505092915050565b60006200056e838362000540565b9150826002028217905092915050565b620005898262000333565b67ffffffffffffffff811115620005a557620005a46200017e565b5b620005b182546200036d565b620005be828285620004e3565b600060209050601f831160018114620005f65760008415620005e1578287015190505b620005ed858262000560565b8655506200065d565b601f1984166200060686620003a2565b60005b82811015620006305784890151825560018201915060208501945060208101905062000609565b868310156200065057848901516200064c601f89168262000540565b8355505b6001600288020188555050505b505050505050565b600082825260208201905092915050565b6000620006838262000333565b6200068f818562000665565b9350620006a181856020860162000238565b620006ac816200016d565b840191505092915050565b60006040820190508181036000830152620006d3818562000676565b90508181036020830152620006e9818462000676565b90509392505050565b610a3180620007026000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c80632f7643a814610051578063a41368621461005b578063cfae321714610077578063ef690cc014610095575b600080fd5b6100596100b3565b005b61007560048036038101906100709190610583565b6100e5565b005b61007f6101a5565b60405161008c919061064b565b60405180910390f35b61009d610237565b6040516100aa919061064b565b60405180910390f35b6040517fc8508fc300000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6101926040518060600160405280602381526020016109d9602391396000805461010e9061069c565b80601f016020809104026020016040519081016040528092919081815260200182805461013a9061069c565b80156101875780601f1061015c57610100808354040283529160200191610187565b820191906000526020600020905b81548152906001019060200180831161016a57829003601f168201915b505050505083610361565b80600090816101a19190610883565b5050565b6060600080546101b49061069c565b80601f01602080910402602001604051908101604052809291908181526020018280546101e09061069c565b801561022d5780601f106102025761010080835404028352916020019161022d565b820191906000526020600020905b81548152906001019060200180831161021057829003601f168201915b5050505050905090565b600080546102449061069c565b80601f01602080910402602001604051908101604052809291908181526020018280546102709061069c565b80156102bd5780601f10610292576101008083540402835291602001916102bd565b820191906000526020600020905b8154815290600101906020018083116102a057829003601f168201915b505050505081565b61035d82826040516024016102db929190610955565b6040516020818303038152906040527f4b5c4277000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050610400565b5050565b6103fb8383836040516024016103799392919061098c565b6040516020818303038152906040527f2ced7cef000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050610400565b505050565b60008151905060006a636f6e736f6c652e6c6f679050602083016000808483855afa5050505050565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b61049082610447565b810181811067ffffffffffffffff821117156104af576104ae610458565b5b80604052505050565b60006104c2610429565b90506104ce8282610487565b919050565b600067ffffffffffffffff8211156104ee576104ed610458565b5b6104f782610447565b9050602081019050919050565b82818337600083830152505050565b6000610526610521846104d3565b6104b8565b90508281526020810184848401111561054257610541610442565b5b61054d848285610504565b509392505050565b600082601f83011261056a5761056961043d565b5b813561057a848260208601610513565b91505092915050565b60006020828403121561059957610598610433565b5b600082013567ffffffffffffffff8111156105b7576105b6610438565b5b6105c384828501610555565b91505092915050565b600081519050919050565b600082825260208201905092915050565b60005b838110156106065780820151818401526020810190506105eb565b60008484015250505050565b600061061d826105cc565b61062781856105d7565b93506106378185602086016105e8565b61064081610447565b840191505092915050565b600060208201905081810360008301526106658184610612565b905092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600060028204905060018216806106b457607f821691505b6020821081036106c7576106c661066d565b5b50919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b60006008830261072f7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff826106f2565b61073986836106f2565b95508019841693508086168417925050509392505050565b6000819050919050565b6000819050919050565b600061078061077b61077684610751565b61075b565b610751565b9050919050565b6000819050919050565b61079a83610765565b6107ae6107a682610787565b8484546106ff565b825550505050565b600090565b6107c36107b6565b6107ce818484610791565b505050565b5b818110156107f2576107e76000826107bb565b6001810190506107d4565b5050565b601f82111561083757610808816106cd565b610811846106e2565b81016020851015610820578190505b61083461082c856106e2565b8301826107d3565b50505b505050565b600082821c905092915050565b600061085a6000198460080261083c565b1980831691505092915050565b60006108738383610849565b9150826002028217905092915050565b61088c826105cc565b67ffffffffffffffff8111156108a5576108a4610458565b5b6108af825461069c565b6108ba8282856107f6565b600060209050601f8311600181146108ed57600084156108db578287015190505b6108e58582610867565b86555061094d565b601f1984166108fb866106cd565b60005b82811015610923578489015182556001820191506020850194506020810190506108fe565b86831015610940578489015161093c601f891682610849565b8355505b6001600288020188555050505b505050505050565b6000604082019050818103600083015261096f8185610612565b905081810360208301526109838184610612565b90509392505050565b600060608201905081810360008301526109a68186610612565b905081810360208301526109ba8185610612565b905081810360408301526109ce8184610612565b905094935050505056fe4368616e67696e67206772656574696e672066726f6d202725732720746f2027257327a26469706673582212203c9104557f2c114254c6df822cc6c3eeb1f3f0201b5ad2a46db76376107ec33e64736f6c634300081100334465706c6f79696e67206120477265657465722077697468206772656574696e673a00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011426f6e6a6f75722c206c65204d6f6e6465000000000000000000000000000000',
    accessList: [],
    hash: '0xffcd7a99af979f8fb1fca6cabf3011fb11235dd86f3fe64628649c034c9e428e',
    v: 0,
    r: '0xaae931c842fbbd42d6b3bbbd0f4e38e4f5c407e8ae083d240d528bf3d5defbb8',
    s: '0x70cf836edf63046124e2625876414d397cffe13a9394b7e8d6d4983505b216e6',
    from: '0x230115404c551Fcd0B6d447DE1DaD3afca230E07',
    confirmations: 0
  },
  transactionHash: '0xffcd7a99af979f8fb1fca6cabf3011fb11235dd86f3fe64628649c034c9e428e'
}
```
