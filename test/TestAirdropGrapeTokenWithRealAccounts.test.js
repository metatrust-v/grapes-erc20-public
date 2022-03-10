const bnChai = require('bn-chai')
const chai = require("chai")
const chaiAsPromised = require("chai-as-promised")
const { increaseTime } = require("./time-travel")

chai.use(chaiAsPromised).use(bnChai(web3.utils.BN))
const { expect } = chai

const day = 24 * 60 * 60
const month = 30 * day
const claimDuration = 3 * month

const GrapesToken = artifacts.require("SimpleToken")
const Alpha = artifacts.require("SimpleERC721")
const Beta = artifacts.require("SimpleERC721")
const Gamma = artifacts.require("SimpleERC721")
const AirdropGrapesToken = artifacts.require("AirdropGrapesToken")

const airdropSupply = web3.utils.toWei("100000000", "ether")
const alphaDistribution = web3.utils.toWei('6520.054', 'ether')
const betaDistribution = web3.utils.toWei('1418.552', 'ether')
const gammaDistribution = web3.utils.toWei('669.627', 'ether')
const blockGasLimit = 30000000

contract("AirdropGrapesToken", (accounts) => {
    const [owner, other] = accounts

    let grapesToken
    let grapesTokenSettings
    let alpha
    let beta
    let gamma
    let airdrop
    let airdropSettings

    let alphaAddress = "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d";
    let betaAddress = "0x60e4d786628fea6478f785a6d7e704777c86a7c6";
    let gammaAddress = "0xba30E5F9Bb24caa003E9f2f0497Ad287FDF95623";

    let whaleAddress1 = "0x54BE3a794282C030b15E43aE2bB182E14c409C5e";
    let whaleAddress2 = "0x1b523dc90a79cf5ee5d095825e586e33780f7188";


    function toBN(number) {
        return web3.utils.toBN(number.toString())
    }

    beforeEach(async () => {

        alpha = await Alpha.at(alphaAddress);
        beta = await Beta.at(betaAddress);
        gamma = await Gamma.at(gammaAddress);

        grapesTokenSettings = {
            name: "Grapes NFT",
            symbol: "GRP",
            totalSupply: web3.utils.toWei("1000000000", "ether")
        }
        await GrapesToken.new(
            grapesTokenSettings.name,
            grapesTokenSettings.symbol,
            grapesTokenSettings.totalSupply
        ).then((instance) => {
            grapesToken = instance
        })
        await grapesToken.transfer(other, web3.utils.toWei("900000000", "ether"), {from: owner})


        airdropSettings = {
            grapesTokenAddress: grapesToken.address,
            alphaContractAddress: alpha.address,
            alphaDistribution: alphaDistribution,
            betaContractAddress: beta.address,
            betaDistribution: betaDistribution,
            gammaContractAddress: gamma.address,
            gammaDistribution: gammaDistribution,
        }
        await AirdropGrapesToken.new(
            airdropSettings.grapesTokenAddress,
            airdropSettings.alphaContractAddress,
            airdropSettings.betaContractAddress,
            airdropSettings.gammaContractAddress,
            airdropSettings.alphaDistribution,
            airdropSettings.betaDistribution,
            airdropSettings.gammaDistribution,
        ).then((instance) => {
            airdrop = instance
        })

        await grapesToken.transfer(airdrop.address, airdropSupply)

        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [whaleAddress1],
        });

        await network.provider.send("hardhat_setBalance", [
            whaleAddress1,
            "0x1000000000000000000",
        ]);

        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [whaleAddress2],
        });

        await network.provider.send("hardhat_setBalance", [
            whaleAddress2,
            "0x1000000000000000000",
        ]);
    })

    describe("Big owners can claim their tokens", () => {
        it("Account number 1", async () => {
            const alphaBalance = 105;
            const betaBalance = 97;
            const gammaBalance = 109;

            const expectedTokensForAlpha = toBN(alphaBalance).mul(toBN(alphaDistribution))
            const expectedTokensForBeta = toBN(betaBalance).mul(toBN(betaDistribution))
            const expectedTokensForGamma = toBN(gammaBalance).mul(toBN(gammaDistribution))

            await airdrop.startClaimablePeriod(claimDuration)

            const gasEstimate = await airdrop.claimTokens.estimateGas({from: whaleAddress1})
            expect(gasEstimate).to.be.lessThan(blockGasLimit/2)

            await airdrop.claimTokens({from: whaleAddress1})

            expect(await grapesToken.balanceOf(whaleAddress1)).to.eq.BN(
                expectedTokensForAlpha.add(expectedTokensForBeta).add(expectedTokensForGamma))
        })

        it("Account number 2", async () => {
            const alphaBalance = 103;
            const betaBalance = 51;
            const gammaBalance = 110;

            const expectedTokensForAlpha = toBN(alphaBalance).mul(toBN(alphaDistribution))
            const expectedTokensForBeta = toBN(betaBalance).mul(toBN(betaDistribution))
            const expectedTokensForGamma = toBN(gammaBalance).mul(toBN(gammaDistribution))

            await airdrop.startClaimablePeriod(claimDuration)
            const gasEstimate = await airdrop.claimTokens.estimateGas({from: whaleAddress2})
            expect(gasEstimate).to.be.lessThan(blockGasLimit/2)

            await airdrop.claimTokens({from: whaleAddress2})

            expect(await grapesToken.balanceOf(whaleAddress2)).to.eq.BN(
                expectedTokensForAlpha.add(expectedTokensForBeta).add(expectedTokensForGamma))
        })
    })


});