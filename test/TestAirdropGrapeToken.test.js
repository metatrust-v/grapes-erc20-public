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

const zeroAddress = '0x0000000000000000000000000000000000000000'

contract("AirdropGrapesToken", (accounts) => {
    const [owner, alphaOwner, betaOwner, gammaOwner, alphaAndBetaOwner, alphaAndGammaOwner, betaAndGammaOwner, allOwner, other] = accounts

    let grapesToken
    let grapesTokenSettings
    let alpha
    let alphaSettings
    let beta
    let betaSettings
    let gamma
    let gammaSettings
    let airdrop
    let airdropSettings

    function toBN(number) {
        return web3.utils.toBN(number.toString())
    }

    beforeEach(async () => {
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

        alphaSettings = {
            name: "Alpha NFT",
            symbol: "ALPHA",
        }
        await Alpha.new(
            alphaSettings.name,
            alphaSettings.symbol,
        ).then((instance) => {
            alpha = instance
        })

        betaSettings = {
            name: "Beta NFT",
            symbol: "BETA",
        }
        await Beta.new(
            betaSettings.name,
            betaSettings.symbol,
        ).then((instance) => {
            beta = instance
        })

        gammaSettings = {
            name: "Gamma NFT",
            symbol: "GAMMA",
        }
        await Gamma.new(
            gammaSettings.name,
            gammaSettings.symbol,
        ).then((instance) => {
            gamma = instance
        })

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
    })

    describe("Ownable implementation", () => {
        it("sets owner on deploy", async () => {
            expect(await airdrop.owner()).to.equal(owner)
        })
    })

    describe("Contract references addresses can't be 0", () => {
        it("The Grapes token address can't be 0", async () => {
            await AirdropGrapesToken.new(
                zeroAddress,
                airdropSettings.alphaContractAddress,
                airdropSettings.betaContractAddress,
                airdropSettings.gammaContractAddress,
                airdropSettings.alphaDistribution,
                airdropSettings.betaDistribution,
                airdropSettings.gammaDistribution,
            ).then((instance) => {
                airdrop = instance
            }).then(assert.fail).catch((error) => {
                if (error.toString().indexOf("The Grapes token address can't be 0") === -1) {
                    assert(false, error.toString())
                }
            })
        })

        it("The Alpha contract address can't be 0", async () => {
            await AirdropGrapesToken.new(
                airdropSettings.grapesTokenAddress,
                zeroAddress,
                airdropSettings.betaContractAddress,
                airdropSettings.gammaContractAddress,
                airdropSettings.alphaDistribution,
                airdropSettings.betaDistribution,
                airdropSettings.gammaDistribution,
            ).then((instance) => {
                airdrop = instance
            }).then(assert.fail).catch((error) => {
                if (error.toString().indexOf("The Alpha contract address can't be 0") === -1) {
                    assert(false, error.toString())
                }
            })
        })

        it("The Beta contract address can't be 0", async () => {
            await AirdropGrapesToken.new(
                airdropSettings.grapesTokenAddress,
                airdropSettings.alphaContractAddress,
                zeroAddress,
                airdropSettings.gammaContractAddress,
                airdropSettings.alphaDistribution,
                airdropSettings.betaDistribution,
                airdropSettings.gammaDistribution,
            ).then((instance) => {
                airdrop = instance
            }).then(assert.fail).catch((error) => {
                if (error.toString().indexOf("The Beta contract address can't be 0") === -1) {
                    assert(false, error.toString())
                }
            })
        })

        it("The Gamma contract address can't be 0", async () => {
            await AirdropGrapesToken.new(
                airdropSettings.grapesTokenAddress,
                airdropSettings.alphaContractAddress,
                airdropSettings.betaContractAddress,
                zeroAddress,
                airdropSettings.alphaDistribution,
                airdropSettings.betaDistribution,
                airdropSettings.gammaDistribution,
            ).then((instance) => {
                airdrop = instance
            }).then(assert.fail).catch((error) => {
                if (error.toString().indexOf("The Gamma contract address can't be 0") === -1) {
                    assert(false, error.toString())
                }
            })
        })
    })

    describe("start claimable period", () => {
        it("Only owner can call start the claimable period", async () => {
            await airdrop.startClaimablePeriod(claimDuration, { from: other }).then(assert.fail).catch((error) => {
                if (error.toString().indexOf("Ownable: caller is not the owner") === -1) {
                    assert(false, error.toString())
                }
            })
        })

        it("claimable period cannot start again if it already begun", async () => {
            await airdrop.startClaimablePeriod(claimDuration)

            await airdrop.startClaimablePeriod(claimDuration).then(assert.fail).catch((error) => {
                if (error.toString().indexOf("Pausable: not paused") === -1) {
                    assert(false, error.toString())
                }
            })
        })

        it("test regular claimable period", async () => {
            await airdrop.startClaimablePeriod(claimDuration)

            expect(await airdrop.claimDuration()).to.eq.BN(toBN(claimDuration))
            expect(await airdrop.paused()).to.equal(false)
            expect(await airdrop.claimStartTime()).to.not.eq.BN(toBN(0))
        })
    })

    describe("pause claimable period", () => {
        it("Only owner can pause the claimable period", async () => {
            await airdrop.pauseClaimablePeriod({ from: other }).then(assert.fail).catch((error) => {
                if (error.toString().indexOf("Ownable: caller is not the owner") === -1) {
                    assert(false, error.toString())
                }
            })
        })

        it("Only pause if claimable period is active", async () => {
            await airdrop.startClaimablePeriod(claimDuration)
            await airdrop.pauseClaimablePeriod()
            await airdrop.pauseClaimablePeriod().then(assert.fail).catch((error) => {
                if (error.toString().indexOf("Pausable: paused") === -1) {
                    assert(false, error.toString())
                }
            })
        })

        it("test regular pause claimable period flow", async () => {
            await airdrop.startClaimablePeriod(claimDuration)
            await airdrop.pauseClaimablePeriod()
            expect(await airdrop.paused()).to.equal(true)
        })
    })

    describe("claim tokens and get claimable token amount", () => {
        it("cannot claim if claimable period is paused", async () => {
            await airdrop.startClaimablePeriod(claimDuration)
            await airdrop.pauseClaimablePeriod()

            await airdrop.claimTokens().then(assert.fail).catch((error) => {
                if (error.toString().indexOf("Pausable: paused") === -1) {
                    assert(false, error.toString())
                }
            })
        })

        it("cannot claim if claimable period finished", async () => {
            await airdrop.startClaimablePeriod(claimDuration)
            increaseTime(claimDuration)

            await airdrop.claimTokens().then(assert.fail).catch((error) => {
                if (error.toString().indexOf("Claimable period is finished") === -1) {
                    assert(false, error.toString())
                }
            })
        })

        it("cannot claim if owner doesn't have any NFT", async () => {
            await airdrop.startClaimablePeriod(claimDuration)

            await airdrop.claimTokens().then(assert.fail).catch((error) => {
                if (error.toString().indexOf("Nothing to claim") === -1) {
                    assert(false, error.toString())
                }
            })

            expect(await airdrop.getClaimableTokenAmount(owner)).to.eq.BN(toBN(0))
        })


        it("no token amount if owner have only gamma NFTs", async () => {
            await gamma.mint(gammaOwner, 1)
            await gamma.mint(gammaOwner, 2)

            await airdrop.startClaimablePeriod(claimDuration)

            await airdrop.claimTokens().then(assert.fail).catch((error) => {
                if (error.toString().indexOf("Nothing to claim") === -1) {
                    assert(false, error.toString())
                }
            })

            expect(await airdrop.getClaimableTokenAmount(gammaOwner)).to.eq.BN(toBN(0))
        })

        it("owner has only alpha NFTs", async () => {
            await alpha.mint(alphaOwner, 1)
            await alpha.mint(alphaOwner, 3)
            const expectedTokens = toBN(2).mul(toBN(alphaDistribution))

            await airdrop.startClaimablePeriod(claimDuration)
            expect(await airdrop.getClaimableTokenAmount(alphaOwner)).to.eq.BN(expectedTokens)

            await airdrop.claimTokens({from: alphaOwner})
            expect(await grapesToken.balanceOf(alphaOwner)).to.eq.BN(expectedTokens)
        })

        it("owner has only beta NFTs", async () => {
            await beta.mint(betaOwner, 2)
            await beta.mint(betaOwner, 4)
            await beta.mint(betaOwner, 5)
            const expectedTokens = toBN(3).mul(toBN(betaDistribution))

            await airdrop.startClaimablePeriod(claimDuration)
            expect(await airdrop.getClaimableTokenAmount(betaOwner)).to.eq.BN(expectedTokens)

            await airdrop.claimTokens({from: betaOwner})
            expect(await grapesToken.balanceOf(betaOwner)).to.eq.BN(expectedTokens)
        })

        it("owner has only alpha and beta NFTs", async () => {
            await alpha.mint(alphaAndBetaOwner, 1)
            await alpha.mint(alphaAndBetaOwner, 3)

            await beta.mint(alphaAndBetaOwner, 2)
            await beta.mint(alphaAndBetaOwner, 4)
            await beta.mint(alphaAndBetaOwner, 5)

            await airdrop.startClaimablePeriod(claimDuration)
            const expectedValueAlpha = toBN(2).mul(toBN(alphaDistribution))
            const expectedValueBeta = toBN(3).mul(toBN(betaDistribution))

            expect(await airdrop.getClaimableTokenAmount(alphaAndBetaOwner)).to.eq.BN(expectedValueAlpha.add(expectedValueBeta))

            await airdrop.claimTokens({from: alphaAndBetaOwner})
            expect(await grapesToken.balanceOf(alphaAndBetaOwner)).to.eq.BN(expectedValueAlpha.add(expectedValueBeta))
        })

        it("owner has alpha and gamma NFTs, and alpha > gamma", async () => {
            await alpha.mint(alphaAndGammaOwner, 1)
            await alpha.mint(alphaAndGammaOwner, 2)
            await alpha.mint(alphaAndGammaOwner, 4)

            await gamma.mint(alphaAndGammaOwner, 1)
            await gamma.mint(alphaAndGammaOwner, 2)

            await airdrop.startClaimablePeriod(claimDuration)
            const expectedValueAlpha = toBN(3).mul(toBN(alphaDistribution))
            const expectedValueGamma = toBN(2).mul(toBN(gammaDistribution))

            expect(await airdrop.getClaimableTokenAmount(alphaAndGammaOwner)).to.eq.BN(expectedValueAlpha.add(expectedValueGamma))

            await airdrop.claimTokens({from: alphaAndGammaOwner})
            expect(await grapesToken.balanceOf(alphaAndGammaOwner)).to.eq.BN(expectedValueAlpha.add(expectedValueGamma))
        })

        it("owner has alpha and gamma NFTs, and alpha < gamma", async () => {
            await alpha.mint(alphaAndGammaOwner, 1)
            await alpha.mint(alphaAndGammaOwner, 4)

            await gamma.mint(alphaAndGammaOwner, 1)
            await gamma.mint(alphaAndGammaOwner, 2)
            await gamma.mint(alphaAndGammaOwner, 3)
            await gamma.mint(alphaAndGammaOwner, 4)

            await airdrop.startClaimablePeriod(claimDuration)

            const expectedValueAlpha = toBN(2).mul(toBN(alphaDistribution))
            const expectedValueGamma = toBN(2).mul(toBN(gammaDistribution))
            expect(await airdrop.getClaimableTokenAmount(alphaAndGammaOwner)).to.eq.BN(expectedValueAlpha.add(expectedValueGamma))

            await airdrop.claimTokens({from: alphaAndGammaOwner})
            expect(await grapesToken.balanceOf(alphaAndGammaOwner)).to.eq.BN(expectedValueAlpha.add(expectedValueGamma))
            expect(await airdrop.gammaClaimed(1)).to.equal(true)
            expect(await airdrop.gammaClaimed(2)).to.equal(true)
            expect(await airdrop.gammaClaimed(3)).to.equal(false)
            expect(await airdrop.gammaClaimed(4)).to.equal(false)
        })

        it("owner has beta and gamma NFTs, and beta > gamma", async () => {
            await beta.mint(betaAndGammaOwner, 1)
            await beta.mint(betaAndGammaOwner, 2)
            await beta.mint(betaAndGammaOwner, 4)

            await gamma.mint(betaAndGammaOwner, 1)
            await gamma.mint(betaAndGammaOwner, 2)

            await airdrop.startClaimablePeriod(claimDuration)

            const expectedValueBeta = toBN(3).mul(toBN(betaDistribution))
            const expectedValueGamma = toBN(2).mul(toBN(gammaDistribution))

            expect(await airdrop.getClaimableTokenAmount(betaAndGammaOwner)).to.eq.BN(expectedValueBeta.add(expectedValueGamma))

            await airdrop.claimTokens({from: betaAndGammaOwner})
            expect(await grapesToken.balanceOf(betaAndGammaOwner)).to.eq.BN(expectedValueBeta.add(expectedValueGamma))
        })

        it("owner has beta and gamma NFTs, and beta < gamma", async () => {
            await beta.mint(betaAndGammaOwner, 1)
            await beta.mint(betaAndGammaOwner, 4)

            await gamma.mint(betaAndGammaOwner, 1)
            await gamma.mint(betaAndGammaOwner, 2)
            await gamma.mint(betaAndGammaOwner, 3)

            await airdrop.startClaimablePeriod(claimDuration)

            const expectedValueBeta = toBN(2).mul(toBN(betaDistribution))
            const expectedValueGamma = toBN(2).mul(toBN(gammaDistribution))

            expect(await airdrop.getClaimableTokenAmount(betaAndGammaOwner)).to.eq.BN(expectedValueBeta.add(expectedValueGamma))

            await airdrop.claimTokens({from: betaAndGammaOwner})
            expect(await grapesToken.balanceOf(betaAndGammaOwner)).to.eq.BN(expectedValueBeta.add(expectedValueGamma))
        })

        it("owner has alpha/beta/gamma NFTs, alpha + beta > gamma", async () => {
            await alpha.mint(allOwner, 1)
            await alpha.mint(allOwner, 2)

            await beta.mint(allOwner, 1)
            await beta.mint(allOwner, 4)

            await gamma.mint(allOwner, 1)
            await gamma.mint(allOwner, 2)
            await gamma.mint(allOwner, 3)

            await airdrop.startClaimablePeriod(claimDuration)

            const expectedValueAlpha = toBN(2).mul(toBN(alphaDistribution))
            const expectedValueBeta = toBN(2).mul(toBN(betaDistribution))
            const expectedValueGamma = toBN(3).mul(toBN(gammaDistribution))

            expect(await airdrop.getClaimableTokenAmount(allOwner)).to.eq.BN(expectedValueAlpha.add(expectedValueBeta).add(expectedValueGamma))

            await airdrop.claimTokens({from: allOwner})
            expect(await grapesToken.balanceOf(allOwner)).to.eq.BN(expectedValueAlpha.add(expectedValueBeta).add(expectedValueGamma))
        })

        it("owner has alpha/beta/gamma NFTs, alpha + beta < gamma", async () => {
            await alpha.mint(allOwner, 1)
            await alpha.mint(allOwner, 2)

            await beta.mint(allOwner, 1)
            await beta.mint(allOwner, 4)

            await gamma.mint(allOwner, 1)
            await gamma.mint(allOwner, 2)
            await gamma.mint(allOwner, 3)
            await gamma.mint(allOwner, 4)
            await gamma.mint(allOwner, 5)
            await gamma.mint(allOwner, 6)

            await airdrop.startClaimablePeriod(claimDuration)

            const expectedValueAlpha = toBN(2).mul(toBN(alphaDistribution))
            const expectedValueBeta = toBN(2).mul(toBN(betaDistribution))
            const expectedValueGamma = toBN(4).mul(toBN(gammaDistribution))

            expect(await airdrop.getClaimableTokenAmount(allOwner)).to.eq.BN(expectedValueAlpha.add(expectedValueBeta).add(expectedValueGamma))

            await airdrop.claimTokens({from: allOwner})
            expect(await grapesToken.balanceOf(allOwner)).to.eq.BN(expectedValueAlpha.add(expectedValueBeta).add(expectedValueGamma))
        })

        it("owner cannot claim tokens if tokens were already claimed for different owner", async () => {
            await alpha.mint(alphaOwner, 1)
            await alpha.mint(alphaOwner, 2)
            await gamma.mint(alphaOwner, 1)
            await gamma.mint(alphaOwner, 2)
            await gamma.mint(alphaOwner, 3)

            await airdrop.startClaimablePeriod(claimDuration)

            await airdrop.claimTokens({from: alphaOwner})
            expect(await grapesToken.balanceOf(alphaOwner)).to.eq.BN(toBN(2).mul(toBN(alphaDistribution)).add(toBN(2).mul(toBN(gammaDistribution))))

            await alpha.safeTransferFrom(alphaOwner, allOwner, 1, {from: alphaOwner})
            await alpha.safeTransferFrom(alphaOwner, allOwner, 2, {from: alphaOwner})
            await gamma.safeTransferFrom(alphaOwner, allOwner, 1, {from: alphaOwner})
            await gamma.safeTransferFrom(alphaOwner, allOwner, 2, {from: alphaOwner})
            await gamma.safeTransferFrom(alphaOwner, allOwner, 3, {from: alphaOwner})

            await alpha.mint(allOwner, 3)
            await gamma.mint(allOwner, 4)

            await airdrop.claimTokens({from: allOwner})
            expect(await grapesToken.balanceOf(allOwner)).to.eq.BN(toBN(alphaDistribution).add(toBN(gammaDistribution)))
        })
    })


    describe("claim unclaimed tokens", () => {
        it("cannot claim the unclaimed if not owner", async () => {
            await airdrop.claimUnclaimedTokens({ from: other }).then(assert.fail).catch((error) => {
                if (error.toString().indexOf("Ownable: caller is not the owner") === -1) {
                    assert(false, error.toString())
                }
            })
        })

        it("cannot claim if claimable period did not end", async () => {
            await airdrop.startClaimablePeriod(claimDuration)

            await airdrop.claimUnclaimedTokens({ from: owner }).then(assert.fail).catch((error) => {
                if (error.toString().indexOf("Claimable period is not finished yet") === -1) {
                    assert(false, error.toString())
                }
            })
        })

        it("Regular flow", async () => {
            await alpha.mint(allOwner, 1)
            await alpha.mint(allOwner, 2)
            await beta.mint(allOwner, 1)
            await beta.mint(allOwner, 2)
            await gamma.mint(allOwner, 1)
            await gamma.mint(allOwner, 2)
            await gamma.mint(allOwner, 3)

            await airdrop.startClaimablePeriod(claimDuration)
            await airdrop.claimTokens({from: allOwner})
            increaseTime(claimDuration + 1)

            await airdrop.claimUnclaimedTokens({ from: owner })

            const expectedClaimed = toBN(2).mul(toBN(alphaDistribution))
                .add(toBN(2).mul(toBN(betaDistribution)))
                .add(toBN(3).mul(toBN(gammaDistribution)))

            expect(await grapesToken.balanceOf(allOwner)).to.eq.BN(expectedClaimed)

            const total= toBN(await grapesToken.balanceOf(allOwner)).add(toBN(await grapesToken.balanceOf(owner)))
            expect(airdropSupply).to.eq.BN(total)
        })
    })
})