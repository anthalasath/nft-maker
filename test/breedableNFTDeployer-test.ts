import { expect } from "chai";
import { ethers } from "hardhat";
import { deployBreedableNFTDeployer, deployBreeder } from "../scripts/deploy";
import { getEvent, newDummyPicturePartCategory } from "../scripts/utils";
import { BreedableNFT } from "../typechain-types/contracts/BreedableNFT";
import { BreedableNFTDeployedEvent } from "../typechain-types/contracts/BreedableNFTDeployer";
import BreedableNFTArtifact from "../artifacts/contracts/BreedableNFT.sol/BreedableNFT.json";

describe("BreedableNFTDeployer", function () {
    it("Deploys the contract with the correct breeding fee receiver", async () => {
        const { breeder } = await deployBreeder();
        const deployer = await deployBreedableNFTDeployer();
        const tx = await deployer.deploy({
            name: "Gremlin",
            symbol: "GREM",
            breedingFeeInWei: ethers.utils.parseEther("1"),
            fatherGeneChance: 45,
            motherGeneChance: 45,
            categories: ["Head", "Hat", "Eyes"].map(newDummyPicturePartCategory),
            breederContractAddress: breeder.address
        });
        const receipt = await tx.wait();
        const event = getEvent(receipt.events, "BreedableNFTDeployed") as BreedableNFTDeployedEvent;
        const breedableNFT = await ethers.getContractAt(BreedableNFTArtifact.abi, event.args.contractAddress, deployer.signer) as BreedableNFT;

        const receiver = await breedableNFT.getBreedingFeeReceiver();
        expect(receiver).to.eq(await breedableNFT.signer.getAddress());
    });
});


