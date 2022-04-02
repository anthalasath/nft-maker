import { task } from "hardhat/config";
import { deployBreedableNFTDeployer } from "../scripts/deploy";
import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { writeAddress } from "./taskUtils";
import { Breeder } from "../typechain-types/contracts/Breeder";

task("deployBreeder", "Deploys the deployer contract")
    .setAction(async (taskArgs, hre) => {
        const network = await hre.ethers.provider.getNetwork();
        const signers = await hre.ethers.getSigners();
        const signer = signers[0];
        const contractName = "Breeder";
        const Breeder = await hre.ethers.getContractFactory(contractName, signer);
        const breeder = await Breeder.deploy() as Breeder;
        await breeder.deployed();
        writeAddress(network.name, contractName, breeder.address);
        console.log(`${contractName} deployed at ${breeder.address}`);
    });