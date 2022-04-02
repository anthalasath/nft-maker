// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./BreedableNFT.sol";

contract BreedableNFTDeployer {

    event BreedableNFTDeployed(address indexed contractAddress, address indexed deployer);
    
    function deploy(BreedableNFTConstructorArgs memory args) public {
        emit BreedableNFTDeployed(address(new BreedableNFT(args)), msg.sender);
    }
}