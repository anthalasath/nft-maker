import { BigNumber, BigNumberish, Contract, Signer } from "ethers";
import { BreedableNFTDeployedEvent, BreedableNFTDeployer } from "../typechain-types/contracts/BreedableNFTDeployer";
import { BreedableNFT, BreedableNFTConstructorArgsStruct } from "../typechain-types/contracts/BreedableNFT";
import { Breeder } from "../typechain-types/contracts/Breeder";
import { VRFCoordinatorV2Interface } from "../typechain-types/@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface";
import { getEvent, newDummyPicturePartCategory } from "./utils";
import BreedableNFTArtifact from "../artifacts/contracts/BreedableNFT.sol/BreedableNFT.json";
import Addresses from "../tasks/addresses.json";
import VRFCoordinatorV2InterfaceArtifact from "../artifacts/@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol/VRFCoordinatorV2Interface.json";
import * as hre from "hardhat";

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

export async function deployVRFCoordinatorV2Mock(): Promise<VRFCoordinatorV2Interface> {
    const VRFCoordinatorV2Mock = await hre.ethers.getContractFactory("VRFCoordinatorV2Mock");
    const vrfCoordinatorV2Mock = await VRFCoordinatorV2Mock.deploy(1, 1);
    return vrfCoordinatorV2Mock as VRFCoordinatorV2Interface;
}

const DEV_NETWORKS = (() => {
    const networks = new Set<string>();
    networks.add("hardhat");
    networks.add("unknown");
    networks.add("rinkeby");
    return networks;
})();

export async function getVRFCoordinatorV2(): Promise<VRFCoordinatorV2Interface> {
    if (DEV_NETWORKS.has(hre.network.name)) {
        return deployVRFCoordinatorV2Mock();
    }
    return await hre.ethers.getContractAt(VRFCoordinatorV2InterfaceArtifact.abi, getAddresses().VRFCoordinatorV2) as VRFCoordinatorV2Interface;
}

function getAddresses(): any {
    return Addresses;
}

export async function deployBreeder(): Promise<Breeder> {
    const vrfCoordinator = await getVRFCoordinatorV2();
    const Breeder = await hre.ethers.getContractFactory("Breeder");
    const keyHash = "0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311";
    const breeder = await Breeder.deploy(keyHash, vrfCoordinator.address) as Breeder;
    await breeder.deployed();
    return breeder;
}
export interface DeployBreedableNFTResult {
    breedableNFT: BreedableNFT
    vrfCoordinator: VRFCoordinatorV2Interface
    breeder: Breeder
    deployer: BreedableNFTDeployer
}

export async function deploySampleBreedableNFT(): Promise<{ breedableNFT: BreedableNFT, breeder: Breeder, deployer: BreedableNFTDeployer }> {
    const breeder = await deployBreeder();
    const deployer = await deployBreedableNFTDeployer();
    const breedableNFT = await deployBreedableNFT(deployer, {
        name: "Gremlin",
        symbol: "GREM",
        breedingFeeInWei: hre.ethers.utils.parseEther("1"),
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