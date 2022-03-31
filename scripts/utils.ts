import { PicturePartCategoryStruct, Vector2Struct } from "../typechain-types/contracts/BreedableNFT";

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
    return { name, position: newZeroVector2D(), picturesUris: newDummyPicturesUris() }
}

export function newZeroVector2D(): Vector2Struct {
    return { x: 0, y: 0 };
}

export function newDummyPicturesUris() {
    return [
        "https://mpng.subpng.com/20180613/ebg/kisspng-sacred-geometry-geometric-shape-tetrahedral-molecular-geometry-5b21123c8153b4.3813644815288940125297.jpg",
        "https://p1.hiclipart.com/preview/568/552/919/geometric-shape-background-triangle-geometry-pyramid-line-minimalism-centre-polygon-png-clipart.jpg",
        "https://flyclipart.com/thumb2/abstract-geometric-shape-set-of-icons-icons-for-free-807110.png"
    ];
}
