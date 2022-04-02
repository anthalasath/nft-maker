import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "./tasks/overview";
import "./tasks/deployDeployer";
import "./tasks/deployBreeder";
import "dotenv/config";

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  networks: {
    hardhat: {

    },
    localhost: {

    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${[process.env.INFURA_PROJECT_ID]}`, 
      accounts: [process.env.RINKEBY_PRIVATE_KEY!]
     },
   }
};

export default config;
