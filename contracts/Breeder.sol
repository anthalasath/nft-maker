// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/PullPayment.sol";
import "./BreedableNFT.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

struct Request {
    address contractAddress;
    uint256 fatherId;
    uint256 motherId;
}

contract Breeder is PullPayment, VRFConsumerBaseV2 {
    VRFCoordinatorV2Interface vrfCoordinator;

    bytes32 keyHash;
    uint64 subId;
    uint16 constant minimumRequestConfirmations = 3;
    uint32 constant callbackGasLimit = 10000;

    mapping(uint256 => Request) contractByRequestId;

    event BreedingStarted(
        address indexed contractAddress,
        uint256 indexed fatherId,
        uint256 indexed motherId
    );
    event BredByBirth(address indexed contractAddress, uint256 indexed childId);

    error CannotBreed(uint256 tokenId);
    error NotOwnerOfToken(uint256 tokenId);
    error InsufficentFeeAmount(uint256 feeInWei);

    constructor(bytes32 _keyHash, address _vrfCoordinator)
        VRFConsumerBaseV2(_vrfCoordinator)
        PullPayment()
    {
        keyHash = _keyHash;
        vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
    }

    function breed(Request memory request) public payable {
        BreedableNFT tokenContract = BreedableNFT(request.contractAddress);
        if (!tokenContract.canBreed(request.fatherId)) {
            revert CannotBreed(request.fatherId);
        }
        if (!tokenContract.canBreed(request.motherId)) {
            revert CannotBreed(request.motherId);
        }

        uint256 breedingFeeInWei = tokenContract.getBreedingFee();
        if (msg.value != breedingFeeInWei) {
            revert InsufficentFeeAmount(breedingFeeInWei);
        }


        uint32 numWords = tokenContract.getPicturePartCategoriesCount();
        uint256 requestId = vrfCoordinator.requestRandomWords(
            keyHash,
            subId,
            minimumRequestConfirmations,
            callbackGasLimit,
            numWords
        );
        contractByRequestId[requestId] = request;

        _asyncTransfer(tokenContract.getBreedingFeeReceiver(), msg.value);
        
        emit BreedingStarted(
            request.contractAddress,
            request.fatherId,
            request.motherId
        );
        tokenContract.markBreedingStarted(request.fatherId, request.motherId);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal
        override
    {
        Request memory request = contractByRequestId[requestId];
        BreedableNFT tokenContract = BreedableNFT(request.contractAddress);
        Creature memory father = tokenContract.getCreature(request.fatherId);
        Creature memory mother = tokenContract.getCreature(request.motherId);

        (uint256 fatherGeneChance, uint256 motherGeneChance) = tokenContract
            .getGeneChances();
        uint256[] memory childGenes = getChildGenes(
            father.genes,
            mother.genes,
            randomWords,
            fatherGeneChance,
            motherGeneChance
        );
        uint256 childId = tokenContract
            .mintFromBirth(
                childGenes,
                request.fatherId,
                request.motherId,
                msg.sender
            )
            .tokenId;

        emit BredByBirth(request.contractAddress, childId);
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
