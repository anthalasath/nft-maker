import { CategoryStruct, Vector2Struct } from "../typechain-types/contracts/BreedableNFT";

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

export function newEmptyCategory(name: string): CategoryStruct {
    return { name, position: newZeroVector2D(), picturesUris: newDummyPicturesUris() }
}

export function newZeroVector2D(): Vector2Struct {
    return { x: 0, y: 0 };
}

export function newDummyPicturesUris() {
    return ["hello", "world", "hi"];
}
