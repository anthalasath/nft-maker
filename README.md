## Overview

A no-code utility to make nfts. 
# NOT SUITABLE FOR PRODUCTION USE!

Right now, breedable nfts (like cryptokitties) are planned for the MVP.

### todo low prio
- allow configuration of breeding CD
- Test unhappy paths and reverts
- Gas efficiency ? Do we need to store the picture part categories on an IPFS file and jus thave a link to it for the assembler ?
- Remove unusued code (e.g onlyOwnerOf modifier in BreedableNFT.sol)



## Architecture

- Blueprint: the deployed smart contract. Has the info on how to build an image.
- Building blocks: the images used for building the NFT's image. Stored on IPFS preferably but later could have choice of storage.
- Assembler: Open source code that reads the blueprint, fetches the building blocks and assemble an image. Can be self hosted and peopel could provide that hosting for others for convenience.
