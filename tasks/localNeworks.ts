export const LOCAL_NETWORKS = (() => {
    const networks = new Set<string>();
    networks.add("hardhat");
    networks.add("unknown");
    return networks;
})();