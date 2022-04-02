import { BigNumber, BigNumberish, Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import { BreedableNFTDeployedEvent, BreedableNFTDeployer } from "../typechain-types/contracts/BreedableNFTDeployer";
import { BreedableNFT, BreedableNFTConstructorArgsStruct } from "../typechain-types/contracts/BreedableNFT";
import { Breeder } from "../typechain-types/contracts/Breeder";
import { getEvent, newDummyPicturePartCategory } from "./utils";
import BreedableNFTArtifact from "../artifacts/contracts/BreedableNFT.sol/BreedableNFT.json";

export async function deployBreedableNFTDeployer(signer?: Signer): Promise<BreedableNFTDeployer> {
    const BreedableNFTDeployer = await ethers.getContractFactory("BreedableNFTDeployer", signer);
    const breedableNFTDeployer = await BreedableNFTDeployer.deploy() as BreedableNFTDeployer;
    await breedableNFTDeployer.deployed();
    return breedableNFTDeployer;
}

export async function deployBreedableNFT(deployer: BreedableNFTDeployer, args: BreedableNFTConstructorArgsStruct): Promise<BreedableNFT> {
    const tx = await deployer.deploy(args);
    const receipt = await tx.wait();
    const event = getEvent(receipt.events, "BreedableNFTDeployed") as BreedableNFTDeployedEvent;
    const breedableNFT = await ethers.getContractAt(BreedableNFTArtifact.abi, event.args.contractAddress, deployer.signer) as BreedableNFT;
    return breedableNFT;
}

export async function deployBreeder(): Promise<Breeder> {
    const Breeder = await ethers.getContractFactory("Breeder");
    const breeder = await Breeder.deploy() as Breeder;
    await breeder.deployed();
    return breeder;
}

export async function deploySampleBreedableNFT(): Promise<{ breedableNFT: BreedableNFT, breeder: Breeder, deployer: BreedableNFTDeployer }> {
    const breeder = await deployBreeder();
    const deployer = await deployBreedableNFTDeployer();
    const breedableNFT = await deployBreedableNFT(deployer, {
        name: "Gremlin",
        symbol: "GREM",
        breedingFeeInWei: ethers.utils.parseEther("1"),
        fatherGeneChance: 45,
        motherGeneChance: 45,
        categories: ["Head", "Hat", "Eyes"].map(newDummyPicturePartCategory),
        breederContractAddress: breeder.address
    });
    return { breedableNFT, breeder, deployer };
}

async function main(): Promise<void> {
    const { breedableNFT, breeder } = await deploySampleBreedableNFT();
    console.log(`Deployed BreedableNFT at ${breedableNFT.address} and breeder at ${breeder.address}`);
}

main()
    .catch(console.error);