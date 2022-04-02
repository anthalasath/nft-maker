import { BigNumber, BigNumberish, Contract } from "ethers";
import { ethers } from "hardhat";
import { BreedableNFT, BreedableNFTConstructorArgsStruct } from "../typechain-types/contracts/BreedableNFT";
import { Breeder } from "../typechain-types/contracts/Breeder";
import { newDummyPicturePartCategory } from "./utils";

export async function deployBreedableNFT(args: BreedableNFTConstructorArgsStruct): Promise<BreedableNFT> {
    const BreedableNFT = await ethers.getContractFactory("BreedableNFT");
    const breedableNFT = await BreedableNFT.deploy(args) as BreedableNFT;
    await breedableNFT.deployed();
    return breedableNFT;
}

export async function deployBreeder(): Promise<Breeder> {
    const Breeder = await ethers.getContractFactory("Breeder");
    const breeder = await Breeder.deploy() as Breeder;
    await breeder.deployed();
    return breeder;
}

export async function deploySampleBreedableNFT(): Promise<{ breedableNFT: BreedableNFT, breeder: Breeder }> {
    const breeder = await deployBreeder();
    const breedableNFT = await deployBreedableNFT({
        name: "Gremlin",
        symbol: "GREM",
        breedingFeeInWei: ethers.utils.parseEther("1"),
        fatherGeneChance: 45,
        motherGeneChance: 45,
        categories: ["Head", "Hat", "Eyes"].map(newDummyPicturePartCategory),
        breederContractAddress: breeder.address
    });
    return { breedableNFT, breeder };
}

async function main(): Promise<void> {
    const { breedableNFT, breeder } = await deploySampleBreedableNFT();
    console.log(`Deployed BreedableNFT at ${breedableNFT.address} and breeder at ${breeder.address}`);
}

main()
    .catch(console.error);