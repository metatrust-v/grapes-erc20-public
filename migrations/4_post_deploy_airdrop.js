require('dotenv').config();
const contracts = {
    airdrop: 'AirdropGrapesToken'
};

module.exports = async (deployer) => {
    // Ensure correct environment variables are declared
    [
        'AIRDROP_CONTRACT_ADDRESS',
        'CORE_TEAM_OWNERSHIP_ADDRESS',
    ].forEach(i => {
        if (!process.env[i]) {
            throw new Error(
                `Environment variable ${i} is not defined.  Please add it to the ".env" file.`
            )
        }
    });

    const AirdropArtifact = artifacts.require(contracts.airdrop);
    const airdrop = await AirdropArtifact.at(process.env.AIRDROP_CONTRACT_ADDRESS);

    // Transfer ownership
    console.log("Transferring ownership of Airdrop..")
    await airdrop.transferOwnership(process.env.CORE_TEAM_OWNERSHIP_ADDRESS);
    console.log("Transferred ownership to " + process.env.CORE_TEAM_OWNERSHIP_ADDRESS)
}