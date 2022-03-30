import { BigNumber, BigNumberish, Contract } from "ethers";
import { ethers } from "hardhat";

export interface BreedableNFTConstructorArgs {
    name: string
    symbol: string
    breedingFeeInWei: BigNumber
    fatherGeneChance: BigNumberish
    motherGeneChance: BigNumberish
    genotypeSize: BigNumberish
}

export async function deployBreedableNFT(args: BreedableNFTConstructorArgs): Promise<Contract> {
    const BreedableNFT = await ethers.getContractFactory("BreedableNFT");
    const breedableNFT = await BreedableNFT.deploy(
        args.name,
        args.symbol,
        args.breedingFeeInWei,
        args.fatherGeneChance,
        args.motherGeneChance,
        args.genotypeSize,
        []
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
        genotypeSize: 3
    });
    console.log(`Deployed BreedableNFT at ${breedableNFT.address}`);
}

main()
    .catch(console.error);