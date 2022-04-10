export = (() => {
    const networks = new Set<string>();
    networks.add("hardhat");
    networks.add("unknown");
    return networks;
})();