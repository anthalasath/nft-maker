import { expect } from "chai";
import { BigNumber, BigNumberish } from "ethers";
import { deploySampleBreedableNFT } from "../scripts/deploy";
import { getEvent, mintPromo } from "../scripts/utils";
import { BreedableNFT, CreatureStruct } from "../typechain-types/contracts/BreedableNFT";
import { BredByBirthEvent, RequestStruct } from "../typechain-types/contracts/Breeder";

describe("Breeder", function () {
  // TODO Test that the fee is deposited on the escrow smart contract
  // TODO Validate genes result once genes algo is done
  // TODO test that you cannot breed other ppl's nfts, although could allow it using a special function with for ex approval(this would be separate from BreedableNFT contract, built on top of it)
  it("Starts breeding a new creature if both parents exist, can breed and the breeding fee is supplied", async () => {
    const { breedableNFT, breeder } = await deploySampleBreedableNFT();
    const father = await mintPromo(breedableNFT, [1, 2, 3]);
    const mother = await mintPromo(breedableNFT, [4, 5, 6]);
    const filter = breeder.filters.BreedingStarted(breedableNFT.address, father.tokenId, mother.tokenId);
    const breedingFeeInWei = await breedableNFT.getBreedingFee();

    const tx = await breeder.breed(
      {
        fatherId: father.tokenId,
        motherId: mother.tokenId,
        contractAddress: breedableNFT.address
      }, {
      value: breedingFeeInWei
    });
    await tx.wait();

    const emittedBreedingStartedEvents = await breeder.queryFilter(filter);
    expect(emittedBreedingStartedEvents.length).to.eq(1);
    const breedingStartedEvent = emittedBreedingStartedEvents[0];
    expect(breedingStartedEvent.args.contractAddress).to.eq(breedableNFT.address);
    expect(breedingStartedEvent.args.fatherId).to.eq(father.tokenId);
    expect(breedingStartedEvent.args.motherId).to.eq(mother.tokenId);
  });
});

async function mintPromoMany(breedableNFT: BreedableNFT, genes: BigNumberish[][]): Promise<CreatureStruct[]> {
  return Promise.all(genes.map(g => mintPromo(breedableNFT, g)));
}

