import { BigNumber, BigNumberish, Contract } from "ethers";
import { ethers } from "hardhat";
import { BreedableNFT, PicturePartCategoryStruct } from "../typechain-types/contracts/BreedableNFT";
import { newDummyPicturePartCategory } from "./utils";

export interface BreedableNFTConstructorArgs {
    name: string
    symbol: string
    breedingFeeInWei: BigNumber
    fatherGeneChance: BigNumberish
    motherGeneChance: BigNumberish
    picturePartCategories: PicturePartCategoryStruct[]
}

export async function deployBreedableNFT(args: BreedableNFTConstructorArgs): Promise<BreedableNFT> {
    const BreedableNFT = await ethers.getContractFactory("BreedableNFT");
    const breedableNFT = await BreedableNFT.deploy(
        args.name,
        args.symbol,
        args.breedingFeeInWei,
        args.fatherGeneChance,
        args.motherGeneChance,
        args.picturePartCategories
    ) as BreedableNFT;
    await breedableNFT.deployed();
    return breedableNFT;
}

export async function deploySampleBreedableNFT(): Promise<BreedableNFT> {
    return deployBreedableNFT({
        name: "Gremlin",
        symbol: "GREM",
        breedingFeeInWei: ethers.utils.parseEther("1"),
        fatherGeneChance: 45,
        motherGeneChance: 45,
        picturePartCategories: ["Head", "Hat", "Eyes"].map(newDummyPicturePartCategory)
    });
}

async function main(): Promise<void> {
    const breedableNFT = await deploySampleBreedableNFT();
    console.log(`Deployed BreedableNFT at ${breedableNFT.address}`);
}

main()
    .catch(console.error);