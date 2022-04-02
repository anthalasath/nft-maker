import { task } from "hardhat/config";
import { deployBreedableNFTDeployer } from "../scripts/deploy";
import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { BreedableNFTDeployer } from "../typechain-types/contracts/BreedableNFTDeployer";
import { writeAddress } from "./taskUtils";

task("deployDeployer", "Deploys the deployer contract")
    .setAction(async (taskArgs, hre) => {
        const network = await hre.ethers.provider.getNetwork();
        const signers = await hre.ethers.getSigners();
        const signer = signers[0];
        const contractName = "BreedableNFTDeployer";
        const BreedableNFTDeployer = await hre.ethers.getContractFactory(contractName, signer);
        const breedableNFTDeployer = await BreedableNFTDeployer.deploy() as BreedableNFTDeployer;
        await breedableNFTDeployer.deployed();
        writeAddress(network.name, contractName, breedableNFTDeployer.address);
        console.log(`${contractName} deployed at ${breedableNFTDeployer.address}`);
    });