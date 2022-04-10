import { BreedableNFTDeployedEvent, BreedableNFTDeployer } from "../typechain-types/contracts/BreedableNFTDeployer";
import { BreedableNFT, BreedableNFTConstructorArgsStruct } from "../typechain-types/contracts/BreedableNFT";
import { getEvent, newDummyPicturePartCategory } from "./utils";
import BreedableNFTArtifact from "../artifacts/contracts/BreedableNFT.sol/BreedableNFT.json";
import * as hre from "hardhat";
import { DeployBreederResult, deployBreeder } from "../tasks/deployBreeder";

export async function deployBreedableNFTDeployer(): Promise<BreedableNFTDeployer> {
    const BreedableNFTDeployer = await hre.ethers.getContractFactory("BreedableNFTDeployer");
    const breedableNFTDeployer = await BreedableNFTDeployer.deploy() as BreedableNFTDeployer;
    await breedableNFTDeployer.deployed();
    return breedableNFTDeployer;
}

export async function deployBreedableNFT(deployer: BreedableNFTDeployer, args: BreedableNFTConstructorArgsStruct): Promise<BreedableNFT> {
    const tx = await deployer.deploy(args);
    const receipt = await tx.wait();
    const event = getEvent(receipt.events, "BreedableNFTDeployed") as BreedableNFTDeployedEvent;
    const breedableNFT = await hre.ethers.getContractAt(BreedableNFTArtifact.abi, event.args.contractAddress, deployer.signer) as BreedableNFT;
    return breedableNFT;
}

export interface DeploySampleBreedableNFTResult {
    breedableNFT: BreedableNFT
    deployBreederResult: DeployBreederResult
    deployer: BreedableNFTDeployer
}

export async function deploySampleBreedableNFT(): Promise<DeploySampleBreedableNFTResult> {
    const deployBreederResult = await deployBreeder(hre);
    const deployer = await deployBreedableNFTDeployer();
    const breedableNFT = await deployBreedableNFT(deployer, {
        name: "Gremlin",
        symbol: "GREM",
        breedingFeeInWei: hre.ethers.utils.parseEther("1"),
        fatherGeneChance: 45,
        motherGeneChance: 45,
        categories: ["Head", "Hat", "Eyes"].map(newDummyPicturePartCategory),
        breederContractAddress: deployBreederResult.breeder.address
    });
    return { breedableNFT, deployBreederResult, deployer };
}

async function main(): Promise<void> {
    const { breedableNFT, deployBreederResult } = await deploySampleBreedableNFT();
    console.log(`Deployed BreedableNFT at ${breedableNFT.address} and breeder at ${deployBreederResult.breeder.address}`);
}

main()
    .catch(console.error);