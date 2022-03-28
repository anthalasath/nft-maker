import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

async function deployBreedableNFT(name: string, symbol: string, breedingFeeInWei: BigNumber): Promise<Contract> {
    const BreedableNFT = await ethers.getContractFactory("BreedableNFT");
    const breedableNFT = await BreedableNFT.deploy(name, symbol, breedingFeeInWei);
    await breedableNFT.deployed();
    return breedableNFT;
}

async function main(): Promise<void> {
    const breedableNFT = await deployBreedableNFT("Gremlin", "GREM", ethers.utils.parseEther("1"));
    console.log(`Deployed BreedableNFT at ${breedableNFT.address}`);
}

main()
    .catch(console.error);