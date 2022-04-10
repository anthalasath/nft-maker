import { expect } from "chai";
import { BigNumber, BigNumberish } from "ethers";
import { deploySampleBreedableNFT } from "../scripts/deploy";
import { getEvent, mintPromo, waitForTx } from "../scripts/utils";
import { BreedableNFT, CreatureStruct } from "../typechain-types/contracts/BreedableNFT";
import { BredByBirthEvent, RequestStruct } from "../typechain-types/contracts/Breeder";

describe("Breeder", function () {
  // TODO Test that the fee is deposited on the escrow smart contract
  // TODO Validate genes result once genes algo is done
  // TODO test that you cannot breed other ppl's nfts, although could allow it using a special function with for ex approval(this would be separate from BreedableNFT contract, built on top of it)
  it("Starts breeding a new creature if both parents exist, can breed and the breeding fee is supplied", async () => {
    const { breedableNFT, deployBreederResult } = await deploySampleBreedableNFT();
    const { breeder } = deployBreederResult;
    const father = await mintPromo(breedableNFT, [1, 2, 3]);
    const mother = await mintPromo(breedableNFT, [4, 5, 6]);
    const filter = breeder.filters.BreedingStarted(breedableNFT.address, father.tokenId, mother.tokenId);
    const breedingFeeInWei = await breedableNFT.getBreedingFee();
    const childReceiver = await breeder.signer.getAddress();

    const tx = await breeder.breed(
      {
        fatherId: father.tokenId,
        motherId: mother.tokenId,
        contractAddress: breedableNFT.address,
        childReceiver
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

  it("Breeds a new creature once the gene generation is completed after having called the breed function successfully", async () => {
    const { breedableNFT, deployBreederResult } = await deploySampleBreedableNFT();
    const { breeder, vrfCoordinatorV2Config } = deployBreederResult;
    if (!vrfCoordinatorV2Config.mock) { // sanity check
      expect(vrfCoordinatorV2Config.mock).to.not.be.undefined; // use expect to throw the expected way
      return;
    }
    const father = await mintPromo(breedableNFT, [1, 2, 3]);
    const mother = await mintPromo(breedableNFT, [4, 5, 6]);
    const expectedChildId = BigNumber.from(1).add(mother.tokenId);
    const randomWordsRequestedFilter = vrfCoordinatorV2Config.mock.filters.RandomWordsRequested(vrfCoordinatorV2Config.keyHash, null, null, vrfCoordinatorV2Config.subId);
    const bredByBirthFilter = breeder.filters.BredByBirth(breedableNFT.address, expectedChildId);
    const breedingFeeInWei = await breedableNFT.getBreedingFee();
    const childReceiver = await breeder.signer.getAddress();

    await waitForTx(breeder.breed(
      {
        fatherId: father.tokenId,
        motherId: mother.tokenId,
        contractAddress: breedableNFT.address,
        childReceiver
      }, {
      value: breedingFeeInWei
    }));

    const emittedRandomWordsRequestedEvents = await vrfCoordinatorV2Config.mock.queryFilter(randomWordsRequestedFilter);
    expect(emittedRandomWordsRequestedEvents.length).to.eq(1);
    const requestId = emittedRandomWordsRequestedEvents[0].args.requestId;
    await waitForTx(vrfCoordinatorV2Config.mock.fulfillRandomWords(requestId, breeder.address));
    const emittedBredByBirthEvents = await breeder.queryFilter(bredByBirthFilter);
    expect(emittedBredByBirthEvents.length).to.eq(1);
    const bredByBirthEvent = emittedBredByBirthEvents[0];
    expect(bredByBirthEvent.args.contractAddress).to.eq(breedableNFT.address);
    expect(bredByBirthEvent.args.childId).to.eq(expectedChildId);
    const child = await breedableNFT.getCreature(expectedChildId);
    expect(await breedableNFT.ownerOf(child.tokenId)).to.eq(childReceiver);
  });
});

// TODO: remove and put this in the smart contract instead to save gas costs & time
async function mintPromoMany(breedableNFT: BreedableNFT, genes: BigNumberish[][]): Promise<CreatureStruct[]> {
  return Promise.all(genes.map(g => mintPromo(breedableNFT, g)));
}

