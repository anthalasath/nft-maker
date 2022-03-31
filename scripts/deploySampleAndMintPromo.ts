import { deploySampleBreedableNFT } from "./deploy";
import { mintPromo } from "./utils";


async function main(): Promise<void> {
    const breedableNFT = await deploySampleBreedableNFT();
    const tokenId = await mintPromo(breedableNFT, [1,2,3]);
    console.log(`Minted promo creature ${tokenId}`);
}

main()
    .catch(console.error);