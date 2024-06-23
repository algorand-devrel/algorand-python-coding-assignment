# 🎓 Become an Algorand Python developer!

## 🚩 Let's build an NFT marketplace with Algorand Python!

Welcome to your first step to become a master in Algorand Python!

In this AlgoKit workspace, there are 2 sub projects:

- `python-demo`
- `coding-assignment`

You can see a fully implemented personal bank smart contract written in Algorand Python in the `python-demo` project folder.

In the `coding-assignment` project folder, we will implement an NFT marketplace smart contract with [Algorand Python](https://algorandfoundation.github.io/puya/index.html)

NftMarketplace smart contract explained:

This simple NftMarketplace smart contract let's sellers to list NFTs for sale and let's buyers to buy the NFT.

lifecycle of this app:

1. The seller deploys the smart contract.
2. The seller calls the bootstrap method to set the asset ID for sale, unitary price, and opt the contract into the ASA.
3. The buyer calls the buy method to buy the ASA.
4. The seller calls the withdraw_and_delete method to withdraw remaining ASA, profits, and then delete the smart contract.

The coding assignment consist of 4 questions and for each question you can implement your code where it says `Write code here`

> Please carefully read and follow the checkpoints below to properly complete the coding assignment!

### Developer Resources:

- [Algorand Developer Documentation](https://developer.algorand.org/docs/)
- [Algorand Discord (Get tech support, debugging support here)](https://discord.com/invite/algorand)
- [Algorand Python Documentation](https://algorandfoundation.github.io/puya/)
- [Algorand Python Github Repo (Example code, source code)](https://github.com/algorandfoundation/puya)
- [Algokit Utils TypeScript](https://github.com/algorandfoundation/algokit-utils-ts/tree/main)

## Checkpoint 1: 🧰 Install prerequisites

1. [Install Docker](https://www.docker.com/products/docker-desktop/). It is used to run a local Algorand network for development.
2. [Install Python 3.12+](https://www.python.org/downloads/)
3. [Install Node.JS / npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
4. [Install AlgoKit](https://github.com/algorandfoundation/algokit-cli/tree/main?tab=readme-ov-file#install).

## Checkpoint 2: 💻 Development environment setup

1. [Fork this repository.](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo)
2. `git clone` the forked repo.

```bash
cd [DIRECTORY_OF_YOUR_CHOICE]
git clone [FORKED_REPO_URL]
```

1. Open this project in VSCode
2. Open the file named `algorand-python-coding-assignment.code-workspace` and press the `open workspace` button to activate workspace mode.
3. 3 VSCode terminal will be auto created: `ROOT` `python-demo` `coding-assignment`. Now go to the `ROOT` VSCode terminal and run the following command to install dependencies required for both sub projects:

```bash
algokit project bootstrap all
```

> If the 3 terminals don't open automatically, Press the `+` button and select `ROOT` in VSCode.

> If you get `Unhandled PermissionError: [Errno 13] Permission denied: '/Users/$name/.config/algokit'` error, add `sudo` in the front and run the following command:

```bash
sudo algokit project bootstrap all
```

1. Now go to the `coding-assignment` terminal and run the following command to activate the Python virtual environment:

```bash
poetry shell
```

- To deactivate the Python virtual environment, run `exit` in the terminal.
- After activating the venv, run the following command and if you see various dependencies including `algorand-python`, you successfully activate the virtual environment!

```bash
pip list
```

🎉 Now you are ready to crack this assignment! Good luck coding! 💻

Tutorial for forking and cloning this repository:
https://github.com/algorand-fix-the-bug-campaign/challenge-1/assets/52557585/acde8053-a8dd-4f53-8bad-45de1068bfda

## Checkpoint 3: 📝 Solve the problems!

This coding assignment consist of **4 problems** in total. Follow the instructions below!

### Launch localnet

1. **_Open Docker Desktop first_** and then run the following command in your terminal to launch the local network. [Click me for more information of localnet!](https://github.com/algorandfoundation/algokit-cli/blob/main/docs/features/localnet.md#creating--starting-the-localnet)

```bash
algokit localnet start
```

All code in this repo will be run in localnet.

> If there are issues with your localnet run the following command to reset the localnet.

```bash
algokit localnet reset
```

### Problem 1-4: Instructions

1. Make sure Python venv is activated in the `coding-assignment` terminal.
2. Go to`coding-assignment/smart_contracts/nft_marketplace/contract.py` to find instructions for problems 1-4. Read the instructions and solve the problem!
3. After solving all 4 problems run the following 2 commands to first build the smart contract and then run the `smart_contracts/nft_marketplace/deploy-config.ts` script.

```bash
algokit project run build
```

```bash
algokit project deploy localnet
```

> `deploy-config.ts` contains a script written with [AlgoKit Utils TypeScript](https://github.com/algorandfoundation/algokit-utils-ts/tree/main) that goes through the entire lifecycle of the nft marketplace contract by simulating a scenario where Taylor Swift concert ticket is being sold. Feel free to check out the code!

If you see something similar in your console, you have successfully solved all 4 questions! 👏👏 Congratulations!
<img width="933" alt="image" src="https://github.com/algorand-devrel/algorand-python-coding-assignment/assets/52557585/b1e0d39b-2bec-496e-abd1-6d74cd2ff5e9">

## Checkpoint 4: 💯 How to submit your work

lets submit your code so that the world knows you are now an Algorand Python developer!

1. Push your code to the forked Github repo. [Then create a PR to the original repository.](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork)
2. Follow the Pull Request template and attach the log of your console after running `algokit project deploy localnet`
