// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/PullPayment.sol";
import "./BreedableNFT.sol";

contract Breeder is PullPayment {

    event BredByBirth(
        address indexed contractAddress,
        uint256 indexed childId
    );

    error CannotBreed(uint256 tokenId);
    error NotOwnerOfToken(uint256 tokenId);
    error InsufficentFeeAmount(uint256 feeInWei);

    function breed(
        address contractAddress,
        uint256 fatherId,
        uint256 motherId
    ) public payable {
        BreedableNFT tokenContract = BreedableNFT(contractAddress);
        if (!tokenContract.canBreed(fatherId)) {
            revert CannotBreed(fatherId);
        }
        if (!tokenContract.canBreed(motherId)) {
            revert CannotBreed(motherId);
        }

        uint256 breedingFeeInWei = tokenContract.getBreedingFee();
        if (msg.value != breedingFeeInWei) {
            revert InsufficentFeeAmount(breedingFeeInWei);
        }

        Creature memory father = tokenContract.getCreature(fatherId);
        Creature memory mother = tokenContract.getCreature(motherId);

        // TODO: Random words
        uint256[] memory randomWords = new uint256[](father.genes.length);
        for (uint256 i = 0; i < randomWords.length; i++) {
            randomWords[i] = i;
        }
        (uint256 fatherGeneChance, uint256 motherGeneChance) = tokenContract
            .getGeneChances();
        uint256[] memory childGenes = getChildGenes(
            father.genes,
            mother.genes,
            randomWords,
            fatherGeneChance,
            motherGeneChance
        );
        // TODO: Allow custom option to sometimes give twins ?
        uint256 childId = tokenContract.mintFromBirth(childGenes, fatherId, motherId, msg.sender).tokenId;
        emit BredByBirth(contractAddress, childId);

        _asyncTransfer(tokenContract.getBreedingFeeReceiver(), msg.value);
    }

    function getChildGenes(
        uint256[] memory fatherGenes,
        uint256[] memory motherGenes,
        uint256[] memory randomWords,
        uint256 fatherGeneChance,
        uint256 motherGeneChance
    ) private pure returns (uint256[] memory) {
        uint256[] memory childGenes = new uint256[](fatherGenes.length);
        for (uint256 i = 0; i < childGenes.length; i++) {
            childGenes[i] = generateChildGene(
                fatherGenes[i],
                motherGenes[i],
                randomWords[i],
                fatherGeneChance,
                motherGeneChance
            );
        }
        return childGenes;
    }

    function generateChildGene(
        uint256 fatherGene,
        uint256 motherGene,
        uint256 randomWord,
        uint256 fatherGeneChance,
        uint256 motherGeneChance
    ) private pure returns (uint256) {
        // TODO: Random mutations
        uint256 roll = randomWord % 100;
        if (roll <= fatherGeneChance) {
            return fatherGene;
        } else if (roll <= motherGeneChance) {
            return motherGene;
        } else {
            return randomWord;
        }
    }
}
