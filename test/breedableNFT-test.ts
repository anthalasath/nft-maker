import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { deployBreedableNFT, deployBreeder } from "../scripts/deploy";
import { getEvent, newDummyPicturePartCategory } from "../scripts/utils";
import { BreedableNFT, PromoCreatureMintedEvent } from "../typechain-types/contracts/BreedableNFT";

describe("BreedableNFT", function () {
  const name = "Gremlins";
  const symbol = "GREM";
  const breedingFeeInWei = ethers.utils.parseEther("1");
  const fatherGeneChance = 45;
  const motherGeneChance = 45;
  const picturePartCategories = ["Head", "Hat", "Eyes"].map(newDummyPicturePartCategory);

  async function deploy(): Promise<BreedableNFT> {
    const breeder = await deployBreeder();
    return await deployBreedableNFT({
      name,
      symbol,
      breedingFeeInWei,
      fatherGeneChance,
      motherGeneChance,
      categories: picturePartCategories,
      breederContractAddress: breeder.address
    }) as BreedableNFT
  }

  it("Should be deployed with the correct name, symbol, picture parts categories and breeding fee", async () => {
    const breedableNFT: BreedableNFT = await deploy();

    expect(await breedableNFT.name()).to.eq(name);
    expect(await breedableNFT.symbol()).to.eq(symbol);
    expect(await breedableNFT.getBreedingFee()).to.eq(breedingFeeInWei);
    expect(await breedableNFT.getPicturePartCategoriesCount()).to.eq(picturePartCategories.length);
    for (let layer = 0; layer < picturePartCategories.length; layer++) {
      const cat = await breedableNFT.getPicturePartCategory(layer);
      expect(cat.name).to.eq(picturePartCategories[layer].name);
      expect(cat.position.x).to.eq(picturePartCategories[layer].position.x);
      expect(cat.position.y).to.eq(picturePartCategories[layer].position.y);
      expect(cat.picturesUris).to.deep.eq(picturePartCategories[layer].picturesUris);
    }
  });

  it("Should mint a creature with the specified genes, tokenId and breeding cooldown when calling mintPromo", async () => {
    const breedableNFT: BreedableNFT = await deploy();
    const genes = [1, 2, 3].map(x => BigNumber.from(x));

    const tx = await breedableNFT.mintPromo(genes, await breedableNFT.signer.getAddress());
    const receipt = await tx.wait();

    const expectedTokenId = 1;
    const event: PromoCreatureMintedEvent = getEvent(receipt.events, "PromoCreatureMinted");
    expect(event.args.tokenId).to.eq(expectedTokenId);
    const creature = await breedableNFT.getCreature(expectedTokenId);
    expect(creature.tokenId).to.eq(1);
    expect(creature.breedingBlockedUntil).to.eq(0);
    expect(creature.genes).to.deep.eq(genes);
  });
});

