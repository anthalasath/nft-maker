import { task } from "hardhat/config";

import BreedableNFTArtifact from "../artifacts/contracts/BreedableNFT.sol/BreedableNFT.json";
import { BreedableNFT } from "../typechain-types/contracts/BreedableNFT";


task("overview", "Prints an overview of a deployed BreedableNFT contract")
    .addPositionalParam("address")
    .setAction(async (taskArgs, hre) => {
        const breedableNFT = await hre.ethers.getContractAtFromArtifact(BreedableNFTArtifact, taskArgs.address) as BreedableNFT;
        const name = await breedableNFT.name();
        const symbol = await breedableNFT.symbol();
        const breedingFeeInWei = await breedableNFT.getBreedingFee();
        const picturePartCategoriesCount = await breedableNFT.getPicturePartCategoriesCount();
        const picturePartCategories = [];
        for (let layer = 0; layer < picturePartCategoriesCount; layer++) {
          const cat = await breedableNFT.getPicturePartCategory(layer);
          picturePartCategories.push(cat);
        }
        console.log(`Name: ${name} - symbol ${symbol} - breedingFeeInWei ${breedingFeeInWei} - picturePartCategoriesCount ${picturePartCategoriesCount} - picturePartCategories: ${JSON.stringify(picturePartCategories, null, 1)}`);
    });