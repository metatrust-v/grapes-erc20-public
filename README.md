# Grapes ERC-20
This repository contains the smart contracts related to the Grapes ERC-20 token.  The Grapes ERC-20 token will have all standard functionality to be interoperable in the Ethereum ecosystem.  There will be a fixed supply of one billion tokens.

Another related contract is also included in this repository to support the airdrop for Alpha/Beta/Gamma NFT holders.

## Contracts

### ERC-20
This contract follows the Open Zeppelin ERC-20 implementation.  It will support 18 decimal places, and will mint the total supply in the constructor.

### Airdrop/Claim
This contract will allow Alpha, Beta, and Gamma NFT holders to be rewarded with Grape tokens during a specified claim period.

## Local Development

### Dependencies
Install `Node.js v14.17.5`.

Run `npm install -g truffle` to install Truffle globally.

Run `npm install` to install dependencies.

### Environment Variables
Create a `.env` file at the root of the project, and add the following variables (also visible in `.env.example`):
```
PRIVATE_KEY= (needed for mainnet deployment)
PRIVATE_KEY_TESTNET= (needed for testnet deployment)
INFURA_KEY=<secret>
ETHERSCAN_API_KEY=
TOKEN_NAME=
TOKEN_SYMBOL=
TEMPORARY_HOLDING_ADDRESS=
ERC20_CONTRACT_ADDRESS=
ALPHA_CONTRACT_ADDRESS=
BETA_CONTRACT_ADDRESS=
GAMMA_CONTRACT_ADDRESS=
ALPHA_DISTRIBUTION_AMOUNT=
BETA_DISTRIBUTION_AMOUNT=
GAMMA_DISTRIBUTION_AMOUNT=
CORE_TEAM_OWNERSHIP_ADDRESS=
AIRDROP_CONTRACT_ADDRESS=
```

### Running Locally
In a separate terminal, run `npx hardhat node` to spin up a local Ethereum environment.

Run `npm run erc20:deploy:development` to compile and deploy the erc20 token contract to your local environment.

Run `npm run airdrop:deploy:development` to compile and deploy the airdrop contract to your local environment.

Run `npm run airdrop:script:development` to transfer ownership to core ownership address in local environment.

### Unit Testing

Run `npm test` to execute unit tests.

### Static Analysis

Slither is a Solidity static analysis tool.  To use it in this project, you must first install Python 3 and the the `slither-analyzer` package.

Step 1: Install Python 3 (which will include the `pip3` package manager)

Step 2: `pip3 install slither-analyzer`

Step 3: In the project root directory, run `slither .`

Optional: To exclude third party dependency contracts, run `slither . --filter-paths "node_modules"`

For more configuration options, see [the Slither documentation](https://github.com/crytic/slither).


## Deployment
Before deployment, be sure that you have completed the `Local Development` section, including installing dependencies and creating the `.env` file.

Deployment scripts are set up for deployment to local, Rinkeby Testnet, and Ethereum Mainnet.  Deployments are done using Truffle migrations.  See `truffle-config.js` and the `migrations` directory for configuration and deployment specifics.

### Deployment Commands
For Rinkeby testnet:  
`npm run erc20:deploy:rinkeby`  
`npm run airdrop:deploy:rinkeby`

For Mainnet:  
`npm run erc20:deploy:mainnet`  
`npm run airdrop:deploy:mainnet`

## Post Deployment

After deployment is succeeded, run post deployment script to transfer ownership of the Airdrop contract.

For Rinkeby testnet:  
`npm run airdrop:script:rinkeby`

For Mainnet:  
`npm run airdrop:script:mainnet`

## Audit

Audits were performed for both the ERC-20 and the Aidrop contracts.

* [Halborn - ERC-20 Audit](audits/ERC20_Smart_Contract_Security_Audit_Report_Halborn.pdf)
* [Halborn - Airdrop Audit](audits/Airdrop_Smart_Contract_Security_Audit_Report_Halborn.pdf)
* [CertiK - Airdrop Audit](audits/Airdrop_Smart_Contract_Security_Audit_Report_CertiK.pdf)