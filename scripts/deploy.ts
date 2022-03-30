import { BigNumber, BigNumberish, Contract } from "ethers";
import { ethers } from "hardhat";
import { CategoryStruct } from "../typechain-types/contracts/BreedableNFT";
import { newEmptyCategory } from "./utils";

export interface BreedableNFTConstructorArgs {
    name: string
    symbol: string
    breedingFeeInWei: BigNumber
    fatherGeneChance: BigNumberish
    motherGeneChance: BigNumberish
    categories: CategoryStruct[]
}

export async function deployBreedableNFT(args: BreedableNFTConstructorArgs): Promise<Contract> {
    const BreedableNFT = await ethers.getContractFactory("BreedableNFT");
    const breedableNFT = await BreedableNFT.deploy(
        args.name,
        args.symbol,
        args.breedingFeeInWei,
        args.fatherGeneChance,
        args.motherGeneChance,
        args.categories
    );
    await breedableNFT.deployed();
    return breedableNFT;
}

async function main(): Promise<void> {
    const breedableNFT = await deployBreedableNFT({
        name: "Gremlin",
        symbol: "GREM",
        breedingFeeInWei: ethers.utils.parseEther("1"),
        fatherGeneChance: 45,
        motherGeneChance: 45,
        categories: ["Head", "Hat", "Eyes"].map(newEmptyCategory)
    });
    console.log(`Deployed BreedableNFT at ${breedableNFT.address}`);
}

main()
    .catch(console.error);