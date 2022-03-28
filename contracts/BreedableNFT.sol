// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/PullPayment.sol";

struct Creature {
    uint256 tokenId;
    uint256 genes;
    uint256 breedingBlockedUntil;
}

contract BreedableNFT is ERC721, Ownable, PullPayment {
    uint256 latestTokenId;
    Creature[] creaturesByIdMinusOne;
    uint256 breedingFeeInWei;

    event BredByBirth(
        uint256 indexed fatherId,
        uint256 indexed motherId,
        uint256 indexed childId
    );
    event PromoCreatureMinted(uint256 tokenId);

    error InexistentCreature(uint256 tokenId);
    error CannotBreed(uint256 tokenId);
    error InsufficentFeeAmount(uint256 feeInWei);

    modifier onlyReadyToBreed(uint256 tokenId) {
        if (!_exists(tokenId)) {
            revert InexistentCreature(tokenId);
        }
        if (getCreature(tokenId).breedingBlockedUntil > block.timestamp) {
            revert CannotBreed(tokenId);
        }
        _;
    }

    constructor(string memory name, string memory symbol, uint256 _breedingFeeInWei)
        ERC721(name, symbol)
    {
        breedingFeeInWei = _breedingFeeInWei;
    }

    function getBreedingFee() public view returns(uint256) {
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

    function mintPromo(uint256 genes) public onlyOwner {
        uint256 tokenId = mint(genes, owner()).tokenId;
        emit PromoCreatureMinted(tokenId);
    }

    function mint(uint256 genes, address to) private returns (Creature memory) {
        uint256 tokenId = ++latestTokenId;
        _safeMint(to, tokenId);
        creaturesByIdMinusOne[tokenId] = Creature({
            tokenId: tokenId,
            genes: genes,
            breedingBlockedUntil: 0
        });
        return creaturesByIdMinusOne[tokenId];
    }

    function breed(uint256 fatherId, uint256 motherId)
        public
        payable
        onlyReadyToBreed(fatherId)
        onlyReadyToBreed(motherId)
    {
        if (msg.value != breedingFeeInWei) {
            revert InsufficentFeeAmount(breedingFeeInWei);
        }
        Creature memory father = getCreature(fatherId);
        Creature memory mother = getCreature(motherId);
        uint256 childGenes = getChildGenes(father.genes, mother.genes);
        // TODO: Allow custom option to sometimes give twins ?
        uint256 childId = mint(childGenes, msg.sender).tokenId;
        emit BredByBirth(fatherId, motherId, childId);

        _asyncTransfer(owner(), msg.value);
    }

    function getChildGenes(uint256 fatherGenes, uint256 motherGenes)
        public
        pure
        returns (uint256)
    {
        // TODO: Implement actual gene algo
        return (fatherGenes + motherGenes) % 9;
    }
}
