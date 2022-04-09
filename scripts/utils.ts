import { BigNumber, BigNumberish } from "ethers";
import { ethers } from "hardhat";
import { VRFCoordinatorV2Mock } from "../typechain-types/contracts/test/VRFCoordinatorV2Mock";
import { BreedableNFT, CreatureStruct, PicturePartCategoryStruct, PromoCreatureMintedEvent, Vector2Struct } from "../typechain-types/contracts/BreedableNFT";

export function getEvent(events: any[] | undefined, eventName: string): any | null {
    if (!events) {
        return null;
    }
    const matches = events.filter(e => e.event == eventName);
    if (matches.length > 1) {
        throw new Error(`Multiple events with the name: ${eventName}`);
    } else if (matches.length > 0) {
        return matches[0];
    } else {
        return null;
    }
}

export function newDummyPicturePartCategory(name: string): PicturePartCategoryStruct {
    return { name, position: randomVector2(1920, 1080), picturesUris: newDummyPicturesUris() }
}

export function randomVector2(maxW: number, maxH: number): Vector2Struct {
    return { x: randomInteger(maxW), y: randomInteger(maxH) };
}

export function randomInteger(maxValue: number) {
    return Math.round(Math.random() * maxValue);
}

export function newDummyPicturesUris() {
    return [
        "https://mpng.subpng.com/20180613/ebg/kisspng-sacred-geometry-geometric-shape-tetrahedral-molecular-geometry-5b21123c8153b4.3813644815288940125297.jpg",
        "https://p1.hiclipart.com/preview/568/552/919/geometric-shape-background-triangle-geometry-pyramid-line-minimalism-centre-polygon-png-clipart.jpg",
        "https://flyclipart.com/thumb2/abstract-geometric-shape-set-of-icons-icons-for-free-807110.png"
    ];
}

export async function mintPromo(breedableNFT: BreedableNFT, genes: BigNumberish[]): Promise<CreatureStruct> {
    const tx = await breedableNFT.mintPromo(genes, await breedableNFT.signer.getAddress());
    const receipt = await tx.wait();
    const event: PromoCreatureMintedEvent = getEvent(receipt.events, "PromoCreatureMinted");
    return breedableNFT.getCreature(event.args.tokenId);
}


export async function createFundedSubcription(vrfCoordinatorV2WithSigner: VRFCoordinatorV2Mock, amount: BigNumber = ethers.utils.parseEther("100")): Promise<BigNumber> {
    const tx = await vrfCoordinatorV2WithSigner.createSubscription();
    const receipt = await tx.wait();
    const event = getEvent(receipt.events, "SubscriptionCreated");
    const subId = event.args.subId;
    await vrfCoordinatorV2WithSigner.fundSubscription(subId, amount);
    return subId;
}
