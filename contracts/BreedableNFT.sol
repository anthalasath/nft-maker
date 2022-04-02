// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

struct Creature {
    uint256 tokenId;
    uint256[] genes;
    uint256 breedingBlockedUntil;
    uint256 fatherId;
    uint256 motherId;
}

struct Vector2 {
    uint256 x;
    uint256 y;
}

struct Picture {
    Vector2 position;
    string uri;
}

struct PicturePartCategory {
    string name;
    Vector2 position;
    string[] picturesUris;
}

struct BreedableNFTConstructorArgs {
    address owner;
    string name;
    string symbol;
    uint256 breedingFeeInWei;
    uint256 fatherGeneChance;
    uint256 motherGeneChance;
    address breederContractAddress;
    PicturePartCategory[] categories;
}

contract BreedableNFT is ERC721, Ownable {
    PicturePartCategory[] picturePartCategories;
    Creature[] creaturesByIdMinusOne;

    address breeder;
    uint256 breedingFeeInWei;
    uint256 fatherGeneChance;
    uint256 motherGeneChance;

    event PromoCreatureMinted(uint256 tokenId);

    error CanOnlyBeCalledByBreeder();
    error Exceeds100Percent(uint256 fatherChance, uint256 motherChance);
    error InexistentCreature(uint256 tokenId);
    error NotOwnerOfToken(uint256 tokenId);
    error EmptyCategoryPicturesUris(uint256 layer);

    modifier onlyOwnerOf(uint256 tokenId) {
        if (ownerOf(tokenId) != msg.sender) {
            revert NotOwnerOfToken(tokenId);
        }
        _;
    }

    modifier onlyBreeder() {
        if (msg.sender != breeder) {
            revert CanOnlyBeCalledByBreeder();
        }
        _;
    }

    constructor(BreedableNFTConstructorArgs memory args)
        ERC721(args.name, args.symbol)
    {
        if ((args.fatherGeneChance + args.motherGeneChance) > 100) {
            revert Exceeds100Percent(
                args.fatherGeneChance,
                args.motherGeneChance
            );
        }
        breedingFeeInWei = args.breedingFeeInWei;
        fatherGeneChance = args.fatherGeneChance;
        motherGeneChance = args.motherGeneChance;
        breeder = args.breederContractAddress;

        for (uint256 i = 0; i < args.categories.length; i++) {
            if (args.categories[i].picturesUris.length == 0) {
                revert EmptyCategoryPicturesUris(i);
            }
            picturePartCategories.push(args.categories[i]);
        }

        _transferOwnership(args.owner);
    }

    function getBreedingFee() public view returns (uint256) {
        return breedingFeeInWei;
    }

    function getBreedingFeeReceiver() public view returns (address) {
        return owner();
    }

    function getGeneChances()
        external
        view
        returns (uint256 father, uint256 mother)
    {
        return (fatherGeneChance, motherGeneChance);
    }

    function canBreed(uint256 tokenId) external view returns (bool) {
        if (!_exists(tokenId)) {
            revert InexistentCreature(tokenId);
        }
        // TODO: ok to use block timestamp for CD ?
        Creature memory creature = getCreature(tokenId);
        return
            creature.breedingBlockedUntil == 0 ||
            creature.breedingBlockedUntil > block.timestamp;
    }

    function getPicture(uint256 layer, uint256 gene)
        public
        view
        returns (Picture memory)
    {
        uint256 len = picturePartCategories[layer].picturesUris.length;
        uint256 index = gene % len;
        string memory uri = picturePartCategories[layer].picturesUris[index];
        return
            Picture({
                position: picturePartCategories[layer].position,
                uri: uri
            });
    }

    function getPicturePartCategory(uint256 layer)
        public
        view
        returns (PicturePartCategory memory)
    {
        return picturePartCategories[layer];
    }

    function getPicturePartCategoriesCount() public view returns (uint256) {
        return picturePartCategories.length;
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

    function mintPromo(uint256[] memory genes, address to) public onlyOwner {
        uint256 creatureTokenId = _mint(genes, 0, 0, to).tokenId;
        emit PromoCreatureMinted(creatureTokenId);
    }

    function mintFromBirth(
        uint256[] memory genes,
        uint256 fatherId,
        uint256 motherId,
        address to
    ) external onlyBreeder returns (Creature memory) {
        return _mint(genes, fatherId, motherId, to);
    }

    function _mint(
        uint256[] memory genes,
        uint256 fatherId,
        uint256 motherId,
        address to
    ) private returns (Creature memory) {
        uint256 tokenId = creaturesByIdMinusOne.length + 1;
        _safeMint(to, tokenId);
        creaturesByIdMinusOne.push(
            Creature({
                tokenId: tokenId,
                genes: genes,
                breedingBlockedUntil: 0,
                fatherId: fatherId,
                motherId: motherId
            })
        );
        return getCreature(tokenId);
    }
}
