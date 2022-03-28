import { expect } from "chai";
import { ethers } from "hardhat";
import { deployBreedableNFT } from "../scripts/deploy";

describe("BreedableNFT", function () {
  const name = "Gremlins";
  const symbol = "GREM";
  const breedingFee = ethers.utils.parseEther("1");

  it("Should be deployed with the correct name, symbol and breeding fee", async () => {
    const breedableNFT = await deployBreedableNFT(name, symbol, breedingFee);

    expect(await breedableNFT.name()).to.eq(name);
    expect(await breedableNFT.symbol()).to.eq(symbol);
    expect(await breedableNFT.getBreedingFee()).to.eq(breedingFee);
  });
});
