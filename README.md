## Overview

A no-code utility to make nfts. 
Right now, breedable nfts (like cryptokitties) are planned for the MVP.

## TODO:

### high prio:
- Pic generation (check: https://github.com/lovell/sharp for how to do it: https://github.com/lovell/sharp/issues/405#issuecomment-208033263)
- UI

### low prio
- Use VRF to make rolls random
- allow configuration of breeding CD
- Test unhappy paths and reverts



## Architecture

- Blueprint: the deployed smart contract. Has the info on how to build an image.
- Building blocks: the images used for building the NFT's image. Stored on IPFS preferably but later could have choice of storage.
- Assembler: Open source code that reads the blueprint, fetches the building blocks and assemble an image. Can be self hosted and peopel could provide that hosting for others for convenience.
