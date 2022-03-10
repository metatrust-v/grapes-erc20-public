require('dotenv').config();
const verify = require("../scripts/verify");
const contracts = {
    airdrop: 'AirdropGrapesToken'
};

const wait = async ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = async (deployer) => {

    // Ensure correct environment variables are declared
    [
        'ERC20_CONTRACT_ADDRESS',
        'ALPHA_CONTRACT_ADDRESS',
        'BETA_CONTRACT_ADDRESS',
        'GAMMA_CONTRACT_ADDRESS',
        'ALPHA_DISTRIBUTION_AMOUNT',
        'BETA_DISTRIBUTION_AMOUNT',
        'GAMMA_DISTRIBUTION_AMOUNT',
        'ETHERSCAN_API_KEY',
    ].forEach(i => {
        if (!process.env[i]) {
            throw new Error(
                `Environment variable ${i} is not defined.  Please add it to the ".env" file.`
            )
        }
    });

    // Step 1 - Deploy Airdrop Contract
    const AirdropArtifact = artifacts.require(contracts.airdrop);
    await deployer.deploy(AirdropArtifact,
        process.env.ERC20_CONTRACT_ADDRESS,
        process.env.ALPHA_CONTRACT_ADDRESS,
        process.env.BETA_CONTRACT_ADDRESS,
        process.env.GAMMA_CONTRACT_ADDRESS,
        process.env.ALPHA_DISTRIBUTION_AMOUNT,
        process.env.BETA_DISTRIBUTION_AMOUNT,
        process.env.GAMMA_DISTRIBUTION_AMOUNT,
    );
    const airdrop = await AirdropArtifact.deployed();

    // Step 2 - Verify Contract
    if (deployer.network !== 'development') {

        // Allow some time to pass for block confirmations
        console.log('Waiting 30 seconds before calling verify script...');
        await wait(30_000);

        const verifyScript = verify.buildVerifyScript('Airdrop', contracts.airdrop, airdrop.address, deployer.network);
        verify.logVerifyScript(verifyScript);
        await verify.verifyContract(verifyScript, 3);
    }
}