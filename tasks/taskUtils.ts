import { BigNumber, utils } from "ethers";
import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { getEvent } from "../scripts/utils";
import { VRFCoordinatorV2Mock } from "../typechain-types/contracts/test/VRFCoordinatorV2Mock";

export function writeAddress(networkName: string, contractName: string, address: string) {
    const addressesFilePath = path.resolve(__dirname, "addresses.json");
    let addresses: any;
    if (existsSync(addressesFilePath)) {
        addresses =  JSON.parse(readFileSync(addressesFilePath).toString());
    } else {
        addresses = {};
    }
    if (!addresses[networkName]) {
        addresses[networkName] = {};
    }
    addresses[networkName][contractName] = address;
    writeFileSync(addressesFilePath, JSON.stringify(addresses, null, 1));
}

export async function createFundedSubcription(vrfCoordinatorV2WithSigner: VRFCoordinatorV2Mock, amount: BigNumber = utils.parseEther("100")): Promise<BigNumber> {
    const tx = await vrfCoordinatorV2WithSigner.createSubscription();
    const receipt = await tx.wait();
    const event = getEvent(receipt.events, "SubscriptionCreated");
    const subId = event.args.subId;
    await vrfCoordinatorV2WithSigner.fundSubscription(subId, amount);
    return subId;
}