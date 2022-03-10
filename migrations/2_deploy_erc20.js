require('dotenv').config();
const verify = require("../scripts/verify");
const contracts = {
  token: 'SimpleToken'
};

const wait = async ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = async (deployer) => {

   // Ensure correct environment variables are declared
   [ 
     'TOKEN_NAME', 
     'TOKEN_SYMBOL', 
     'TEMPORARY_HOLDING_ADDRESS', 
     'ETHERSCAN_API_KEY' 
   ].forEach(i => {
    if (!process.env[i]) {
      throw new Error(
        `Environment variable ${i} is not defined.  Please add it to the ".env" file.`
      )
    }
  });

  const TOTAL_SUPPLY = web3.utils.toWei("1000000000", "ether"); // 1 Billion Tokens
  const { TOKEN_NAME, TOKEN_SYMBOL, TEMPORARY_HOLDING_ADDRESS } = process.env;

  // Step 1 - Deploy ERC-20 Token
  const SimpleTokenArtifact = artifacts.require(contracts.token);
  await deployer.deploy(SimpleTokenArtifact, TOKEN_NAME, TOKEN_SYMBOL, TOTAL_SUPPLY);
  const token = await SimpleTokenArtifact.deployed();

  // Step 2 - Transfer total supply to temporary holding address
  console.log(`Transferring ${TOTAL_SUPPLY} wei to ${TEMPORARY_HOLDING_ADDRESS}...`);
  await token.transfer(TEMPORARY_HOLDING_ADDRESS, TOTAL_SUPPLY);
  console.log('Transfer complete');

  // Step 3 - Verify Contract
  if (deployer.network !== 'development') {

    // Allow some time to pass for block confirmations
    console.log('Waiting 30 seconds before calling verify script...')
    await wait(30_000);

    const verifyScript = verify.buildVerifyScript('ERC-20', contracts.token, token.address, deployer.network);
    verify.logVerifyScript(verifyScript);
    await verify.verifyContract(verifyScript, 3);
  }

  // Step 4 - Log balance to check it is ok
  const balance = await token.balanceOf(TEMPORARY_HOLDING_ADDRESS);
  console.log(`Address: ${TEMPORARY_HOLDING_ADDRESS} Balance: ${balance}`);
}
