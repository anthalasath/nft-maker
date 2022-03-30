import { expect } from "chai";
import { BigNumber, BigNumberish } from "ethers";
import { getCreate2Address } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { deployBreedableNFT } from "../scripts/deploy";
import { getEvent, newDummyPicturePartCategory } from "../scripts/utils";
import { BredByBirthEvent, BreedableNFT, CreatureStructOutput, PromoCreatureMintedEvent } from "../typechain-types/contracts/BreedableNFT";

describe("BreedableNFT", function () {
  const name = "Gremlins";
  const symbol = "GREM";
  const breedingFeeInWei = ethers.utils.parseEther("1");
  const fatherGeneChance = 45;
  const motherGeneChance = 45;
  const genotypeSize = 3;
  const picturePartCategories = ["Head", "Hat", "Eyes"].map(newDummyPicturePartCategory);
  
  async function deploy(): Promise<BreedableNFT> {
    return await deployBreedableNFT({name, symbol, breedingFeeInWei, fatherGeneChance, motherGeneChance, picturePartCategories}) as BreedableNFT
  }

  it("Should be deployed with the correct name, symbol and breeding fee", async () => {
    const breedableNFT: BreedableNFT = await deploy();

    expect(await breedableNFT.name()).to.eq(name);
    expect(await breedableNFT.symbol()).to.eq(symbol);
    expect(await breedableNFT.getBreedingFee()).to.eq(breedingFeeInWei);
  });

  it("Should mint a creature with the specified genes, tokenId and breeding cooldown when calling mintPromo", async () => {
    const breedableNFT: BreedableNFT = await deploy();
    const genes = [1, 2, 3].map(x => BigNumber.from(x));

    const tx = await breedableNFT.mintPromo(genes);
    const receipt = await tx.wait();

    const expectedTokenId = 1;
    const event: PromoCreatureMintedEvent = getEvent(receipt.events, "PromoCreatureMinted");
    expect(event.args.tokenId).to.eq(expectedTokenId);
    const creature = await breedableNFT.getCreature(expectedTokenId);
    expect(creature.tokenId).to.eq(1);
    expect(creature.breedingBlockedUntil).to.eq(0);
    expect(creature.genes).to.deep.eq(genes);
  });

  // TODO Test that the fee is deposited on the escrow smart contract
  // TODO Validate genes result once genes algo is done
  // TODO test that you cannot breed other ppl's nfts, although could allow it using a special function with for ex approval(this would be separate from BreedableNFT contract, built on top of it)
  it("Breeds a new creature if both parents exist, can breed and the breeding fee is supplied", async () => {
    const breedableNFT: BreedableNFT = await deploy();
    const [father, mother] = await mintPromoMany(breedableNFT, [[1,2,3], [4,5,6]]);

    const tx = await breedableNFT.breed(father.tokenId, mother.tokenId, { value: await breedableNFT.getBreedingFee() });
    const receipt = await tx.wait();

    const event: BredByBirthEvent = getEvent(receipt.events, "BredByBirth");
    expect(event.args.childId).to.eq(3);
    expect(event.args.fatherId).to.eq(father.tokenId);
    expect(event.args.motherId).to.eq(mother.tokenId);
    const child = await breedableNFT.getCreature(event.args.childId);
    expect(child.tokenId).to.eq(event.args.childId);
  });
});

async function mintPromoMany(breedableNFT: BreedableNFT, genes: BigNumberish[][]): Promise<CreatureStructOutput[]> {
  return Promise.all(genes.map(g => mintPromo(breedableNFT, g)));
}

async function mintPromo(breedableNFT: BreedableNFT, genes: BigNumberish[]): Promise<CreatureStructOutput> {
  const tx = await breedableNFT.mintPromo(genes);
  const receipt = await tx.wait();
  const event: PromoCreatureMintedEvent = getEvent(receipt.events, "PromoCreatureMinted");
  return breedableNFT.getCreature(event.args.tokenId);
}