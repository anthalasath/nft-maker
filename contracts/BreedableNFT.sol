// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/PullPayment.sol";

struct Creature {
    uint256 tokenId;
    uint256[] genes;
    uint256 breedingBlockedUntil;
}

contract BreedableNFT is ERC721, Ownable, PullPayment {
    Creature[] creaturesByIdMinusOne;
    uint256 breedingFeeInWei;
    uint256 fatherGeneChance;
    uint256 motherGeneChance;
    uint256 private genotypeSize;

    event BredByBirth(
        uint256 indexed fatherId,
        uint256 indexed motherId,
        uint256 indexed childId
    );
    event PromoCreatureMinted(uint256 tokenId);

    error InexistentCreature(uint256 tokenId);
    error CannotBreed(uint256 tokenId);
    error InsufficentFeeAmount(uint256 feeInWei);
    error NotOwnerOfToken(uint256 tokenId);
    error Exceeds100Percent(uint256 fatherChance, uint256 motherChance);

    modifier onlyReadyToBreed(uint256 tokenId) {
        if (!_exists(tokenId)) {
            revert InexistentCreature(tokenId);
        }
        // TODO: ok to use block timestamp for CD ?
        if (getCreature(tokenId).breedingBlockedUntil > block.timestamp) {
            revert CannotBreed(tokenId);
        }
        _;
    }

    modifier onlyOwnerOf(uint256 tokenId) {
        if (ownerOf(tokenId) != msg.sender) {
            revert NotOwnerOfToken(tokenId);
        }
        _;
    }

    constructor(
        string memory name,
        string memory symbol,
        uint256 _breedingFeeInWei,
        uint256 _fatherGeneChance,
        uint256 _motherGeneChance,
        uint256 _genotypeSize
    ) ERC721(name, symbol) {
        if ((_fatherGeneChance + _motherGeneChance) > 100) {
            revert Exceeds100Percent(_fatherGeneChance, _motherGeneChance);
        }
        breedingFeeInWei = _breedingFeeInWei;
        genotypeSize = _genotypeSize;
        fatherGeneChance = _fatherGeneChance;
        motherGeneChance = _motherGeneChance;
    }

    function getBreedingFee() public view returns (uint256) {
        return breedingFeeInWei;
    }

    function getCreature(uint256 tokenId)
        public
        view
        returns (Creature memory)
    {
        if (!_exists(tokenId)) {
            revert InexistentCreature(tokenId);
        }
        return creaturesByIdMinusOne[tokenId - 1];
    }

    function mintPromo(uint256[] memory genes) public onlyOwner {
        uint256 tokenId = mint(genes, owner()).tokenId;
        emit PromoCreatureMinted(tokenId);
    }

    function breed(uint256 fatherId, uint256 motherId)
        public
        payable
        onlyReadyToBreed(fatherId)
        onlyReadyToBreed(motherId)
        onlyOwnerOf(fatherId)
        onlyOwnerOf(motherId)
    {
        if (msg.value != breedingFeeInWei) {
            revert InsufficentFeeAmount(breedingFeeInWei);
        }
        Creature memory father = getCreature(fatherId);
        Creature memory mother = getCreature(motherId);
        // TODO: Random words
        uint256[] memory randomWords = new uint256[](genotypeSize);
        for (uint256 i = 0; i < randomWords.length; i++) {
            randomWords[i] = i;
        }
        uint256[] memory childGenes = getChildGenes(father.genes, mother.genes, randomWords);
        // TODO: Allow custom option to sometimes give twins ?
        uint256 childId = mint(childGenes, msg.sender).tokenId;
        emit BredByBirth(fatherId, motherId, childId);

        _asyncTransfer(owner(), msg.value);
    }

    function getChildGenes(
        uint256[] memory fatherGenes,
        uint256[] memory motherGenes,
        uint256[] memory randomWords
    ) private view returns (uint256[] memory) {
        uint256[] memory childGenes = new uint256[](genotypeSize);
        for (uint256 i = 0; i < childGenes.length; i++) {
            childGenes[i] = generateChildGene(
                fatherGenes[i],
                motherGenes[i],
                randomWords[i]
            );
        }
        return childGenes;
    }

    function generateChildGene(
        uint256 fatherGene,
        uint256 motherGene,
        uint256 randomWord
    ) private view returns (uint256) {
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

    function mint(uint256[] memory genes, address to) private returns (Creature memory) {
        uint256 tokenId = creaturesByIdMinusOne.length + 1;
        _safeMint(to, tokenId);
        creaturesByIdMinusOne.push(
            Creature({tokenId: tokenId, genes: genes, breedingBlockedUntil: 0})
        );
        return getCreature(tokenId);
    }
}
