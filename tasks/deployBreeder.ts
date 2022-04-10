import { task } from "hardhat/config";
import { createFundedSubcription, writeAddress } from "./taskUtils";
import { Breeder } from "../typechain-types/contracts/Breeder";
import { VRFCoordinatorV2Mock } from "../typechain-types/contracts/test/VRFCoordinatorV2Mock";
import { BigNumberish } from "ethers";
import LOCAL_NETWORKS from "./localNeworks";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import Addresses from "../tasks/addresses.json";
import config from "../hardhat.config";
import VRFCoordinatorV2InterfaceArtifact from "../artifacts/@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol/VRFCoordinatorV2Interface.json";

interface VRFCoordinatorV2Config {
    vrfCoordinatorV2Address: string
    subId: BigNumberish
    keyHash: string,
    mock?: VRFCoordinatorV2Mock
}


export async function deployVRFCoordinatorV2Mock(hre: HardhatRuntimeEnvironment): Promise<VRFCoordinatorV2Mock> {
    const VRFCoordinatorV2Mock = await hre.ethers.getContractFactory("VRFCoordinatorV2Mock");
    const vrfCoordinatorV2Mock = await VRFCoordinatorV2Mock.deploy(1, 1);
    return vrfCoordinatorV2Mock as VRFCoordinatorV2Mock;
}


function getAddresses(): any {
    return Addresses;
}

async function getVRFCoordinatorV2Config(hre: HardhatRuntimeEnvironment): Promise<VRFCoordinatorV2Config> {
    let vrfCoordinatorV2Address: string;
    let subId: BigNumberish;
    const keyHash = "0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311"; // TODO: Double check how to get this
    let mock: VRFCoordinatorV2Mock | undefined;
    if (LOCAL_NETWORKS.has(hre.network.name)) {
        mock = await deployVRFCoordinatorV2Mock(hre);
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

export async function deployBreeder(hre: HardhatRuntimeEnvironment): Promise<DeployBreederResult> {
    const Breeder = await hre.ethers.getContractFactory("Breeder");
    const vrfCoordinatorV2Config = await getVRFCoordinatorV2Config(hre);
    const breeder = await Breeder.deploy(vrfCoordinatorV2Config.vrfCoordinatorV2Address, vrfCoordinatorV2Config.keyHash, vrfCoordinatorV2Config.subId) as Breeder;
    await breeder.deployed();
    return { breeder, vrfCoordinatorV2Config };
}

task("deployBreeder", "Deploys the deployer contract")
    .setAction(async (taskArgs, hre) => {
        const contractName = "Breeder";
        const { breeder } = await deployBreeder(hre);
        writeAddress(hre.network.name, contractName, breeder.address);
        console.log(`${contractName} deployed at ${breeder.address}`);
    }); 