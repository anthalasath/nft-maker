import { expect } from "chai";
import { BigNumberish } from "ethers";
import { deploySampleBreedableNFT } from "../scripts/deploy";
import { getEvent, mintPromo } from "../scripts/utils";
import { BreedableNFT, CreatureStruct } from "../typechain-types/contracts/BreedableNFT";
import { BredByBirthEvent } from "../typechain-types/contracts/Breeder";

describe("BreedableNFT", function () {
  // TODO Test that the fee is deposited on the escrow smart contract
  // TODO Validate genes result once genes algo is done
  // TODO test that you cannot breed other ppl's nfts, although could allow it using a special function with for ex approval(this would be separate from BreedableNFT contract, built on top of it)
  it("Breeds a new creature if both parents exist, can breed and the breeding fee is supplied", async () => {
    const { breedableNFT, breeder } = await deploySampleBreedableNFT();
    const [father, mother] = await mintPromoMany(breedableNFT, [[1, 2, 3], [4, 5, 6]]);

    const tx = await breeder.breed(breedableNFT.address, father.tokenId, mother.tokenId, { value: await breedableNFT.getBreedingFee() });
    const receipt = await tx.wait();

    const event: BredByBirthEvent = getEvent(receipt.events, "BredByBirth");
    expect(event.args.childId).to.eq(3);
    expect(event.args.contractAddress).to.eq(breedableNFT.address);
    const child = await breedableNFT.getCreature(event.args.childId);
    expect(child.tokenId).to.eq(event.args.childId);
    expect(child.breedingBlockedUntil).to.eq(0);
    expect(child.fatherId).to.eq(father.tokenId);
    expect(child.motherId).to.eq(mother.tokenId);
  });
});

async function mintPromoMany(breedableNFT: BreedableNFT, genes: BigNumberish[][]): Promise<CreatureStruct[]> {
  return Promise.all(genes.map(g => mintPromo(breedableNFT, g)));
}

