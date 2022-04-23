import { task } from "hardhat/config";

import BreedableNFTArtifact from "../artifacts/contracts/BreedableNFT.sol/BreedableNFT.json";
import { BreedableNFT } from "../typechain-types/contracts/BreedableNFT";

task("getPictureData", "Prints data about a token's picture")
    .addPositionalParam("address")
    .addPositionalParam("tokenId")
    .setAction(async (taskArgs, hre) => {
        const breedableNFT = await hre.ethers.getContractAtFromArtifact(BreedableNFTArtifact, taskArgs.address) as BreedableNFT;
        const categoriesCount = await breedableNFT.getPicturePartCategoriesCount();
        const creature = await breedableNFT.getCreature(taskArgs.tokenId);
        const pictures = await Promise.all(Array(categoriesCount).fill(null).map((_, layer) => breedableNFT.getPicture(layer, creature.genes[layer])));
        console.log(pictures);
    });