const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("MyToken", function () {
	// We define a fixture to reuse the same setup in every test.
	// We use loadFixture to run this setup once, snapshot that state,
	// and reset Hardhat Network to that snapshot in every test.
	async function deployContracts() {
		// Contracts are deployed using the first signer/account by default
		const [depositor] = await ethers.getSigners();

		const MyToken = await ethers.getContractFactory("MyToken");
		const myToken = await MyToken.deploy();

		// Mint some tokens
		await myToken.mint("100000000000000000");
		return { myToken, depositor };
	}

	describe("stake", function () {
		describe("positive cases", function () {
			it("should stake token amount", async function () {
				const { myToken, depositor } = await loadFixture(deployContracts);
				const before = await myToken.balanceOf(depositor.address);
				await expect(myToken.stake("100000000000000000"))
					.to.emit(myToken, "Stake")
					.withArgs(depositor.address, anyValue, "100000000000000000");
				const after = await myToken.balanceOf(depositor.address);
				expect(await myToken.getStakedAmount()).to.equal("100000000000000000");
				expect(await myToken.balanceOf(myToken.address)).to.equal(
					"100000000000000000"
				);
				expect(before.sub(after)).to.equal("100000000000000000");
			});
		});
		describe("negative cases", function () {
			it("should revert if amount is 0", async function () {
				const { myToken, depositor } = await loadFixture(deployContracts);
				await expect(myToken.stake(0)).to.be.revertedWith("enter valid amount");
			});
			it("should revert if amount is greater than user balance", async function () {
				const { myToken, depositor } = await loadFixture(deployContracts);
				await expect(myToken.stake("1000000000000000000")).to.be.revertedWith(
					"amount is greater than token balance"
				);
			});
		});
	});

	describe("unstake", function () {
		describe("positive cases", function () {
			it("should unstake token amount", async function () {
				const { myToken, depositor } = await loadFixture(deployContracts);
				await myToken.stake("100000000000000000");
				const before = await myToken.balanceOf(depositor.address);
				await expect(myToken.unstake("100000000000000000"))
					.to.emit(myToken, "Unstake")
					.withArgs(depositor.address, anyValue, "100000000000000000");
				const after = await myToken.balanceOf(depositor.address);
				expect(await myToken.getStakedAmount()).to.equal("0");
				expect(await myToken.balanceOf(myToken.address)).to.equal("0");
				expect(after.sub(before)).gt("100000000000000000");
			});
		});
		describe("negative cases", function () {
			it("should revert if amount is 0", async function () {
				const { myToken, depositor } = await loadFixture(deployContracts);
				await expect(myToken.unstake(0)).to.be.revertedWith(
					"enter valid amount"
				);
			});
			it("should revert if amount is greater than staked balance", async function () {
				const { myToken, depositor } = await loadFixture(deployContracts);
				await expect(myToken.unstake("1000000000000000000")).to.be.revertedWith(
					"amount is greater than staked balance"
				);
			});
		});
	});

	describe("claim", function () {
		describe("positive cases", function () {
			it("should claim staking rewards", async function () {
				const { myToken, depositor } = await loadFixture(deployContracts);
				await myToken.stake("100000000000000000");
				expect(await myToken.balanceOf(depositor.address)).to.equal(0);
				const before = await myToken.balanceOf(depositor.address);
				await expect(myToken.claim())
					.to.emit(myToken, "Claim")
					.withArgs(depositor.address, anyValue, anyValue);
				const after = await myToken.balanceOf(depositor.address);
				expect(after.sub(before)).gt("0");
			});
		});
		describe("negative cases", function () {
			it("should revert if user havn't staked any amount", async function () {
				const { myToken, depositor } = await loadFixture(deployContracts);
				await expect(myToken.claim()).to.be.revertedWith(
					"staked amount is zero"
				);
			});
		});
	});

	describe("getStakedAmount", function () {
		it("should get staked amount", async function () {
			const { myToken, depositor } = await loadFixture(deployContracts);
			await myToken.stake("100000000000000000");
			expect(await myToken.getStakedAmount()).to.equal("100000000000000000");
		});
	});
});
