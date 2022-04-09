import { BigNumber, BigNumberish, Contract, Signer } from "ethers";
import { BreedableNFTDeployedEvent, BreedableNFTDeployer } from "../typechain-types/contracts/BreedableNFTDeployer";
import { BreedableNFT, BreedableNFTConstructorArgsStruct } from "../typechain-types/contracts/BreedableNFT";
import { Breeder } from "../typechain-types/contracts/Breeder";
import { VRFCoordinatorV2Interface } from "../typechain-types/@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface";
import { createFundedSubcription, getEvent, newDummyPicturePartCategory } from "./utils";
import BreedableNFTArtifact from "../artifacts/contracts/BreedableNFT.sol/BreedableNFT.json";
import Addresses from "../tasks/addresses.json";
import VRFCoordinatorV2InterfaceArtifact from "../artifacts/@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol/VRFCoordinatorV2Interface.json";
import * as hre from "hardhat";
import { VRFCoordinatorV2Mock } from "../typechain-types/contracts/test/VRFCoordinatorV2Mock";
import config from "../hardhat.config";

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

export async function deployVRFCoordinatorV2Mock(): Promise<VRFCoordinatorV2Mock> {
    const VRFCoordinatorV2Mock = await hre.ethers.getContractFactory("VRFCoordinatorV2Mock");
    const vrfCoordinatorV2Mock = await VRFCoordinatorV2Mock.deploy(1, 1);
    return vrfCoordinatorV2Mock as VRFCoordinatorV2Mock;
}

const DEV_NETWORKS = (() => {
    const networks = new Set<string>();
    networks.add("hardhat");
    networks.add("unknown");
    networks.add("rinkeby");
    return networks;
})();

function getAddresses(): any {
    return Addresses;
}

interface VRFCoordinatorV2Config {
    vrfCoordinatorV2Address: string
    subId: BigNumberish
    keyHash: string,
    mock?: VRFCoordinatorV2Mock
}

async function getVRFCoordinatorV2Config(): Promise<VRFCoordinatorV2Config> {
    let vrfCoordinatorV2Address: string;
    let subId: BigNumberish;
    const keyHash = "0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311"; // TODO: Double check how to get this
    let mock: VRFCoordinatorV2Mock | undefined;
    if (DEV_NETWORKS.has(hre.network.name)) {
        mock = await deployVRFCoordinatorV2Mock();
        vrfCoordinatorV2Address = mock.address;
        subId = await createFundedSubcription(mock);
    } else {
        const vrfCoordinator = await hre.ethers.getContractAt(VRFCoordinatorV2InterfaceArtifact.abi, getAddresses().VRFCoordinatorV2);
        vrfCoordinatorV2Address = vrfCoordinator.address;
        const networkConfig: any = config.networks?.[hre.network.name];
        if (!networkConfig) {
            throw new Error(`Network ${hre.network.name} is not defined in hardhat config`);
        }
        if (!networkConfig.subId) {
            throw new Error(`subId for network ${hre.network.name} is not defined in hardhat config`);
        }
        subId = networkConfig.subId;
    }
    return { vrfCoordinatorV2Address, subId, keyHash, mock };
}

export interface DeployBreederResult {
    breeder: Breeder
    vrfCoordinatorV2Config: VRFCoordinatorV2Config
}

export async function deployBreeder(): Promise<DeployBreederResult> {
    const Breeder = await hre.ethers.getContractFactory("Breeder");
    const vrfCoordinatorV2Config = await getVRFCoordinatorV2Config();
    const breeder = await Breeder.deploy(vrfCoordinatorV2Config.vrfCoordinatorV2Address, vrfCoordinatorV2Config.keyHash, vrfCoordinatorV2Config.subId) as Breeder;
    await breeder.deployed();
    return { breeder, vrfCoordinatorV2Config };
}
export interface DeploySampleBreedableNFTResult {
    breedableNFT: BreedableNFT
    deployBreederResult: DeployBreederResult
    deployer: BreedableNFTDeployer
}

export async function deploySampleBreedableNFT(): Promise<DeploySampleBreedableNFTResult> {
    const deployBreederResult = await deployBreeder();
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