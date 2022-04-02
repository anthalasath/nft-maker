import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";

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