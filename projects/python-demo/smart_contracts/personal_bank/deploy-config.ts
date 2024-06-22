import * as algokit from '@algorandfoundation/algokit-utils'
import { PersonalBankClient } from '../artifacts/personal_bank/client'
import { TransactionSignerAccount } from '@algorandfoundation/algokit-utils/types/account'

// Below is a showcase of various deployment options you can use in TypeScript Client
export async function deploy() {
  console.log('=== Deploying Personal Bank Contract ===')

  // Instantiate clients
  const algod = algokit.getAlgoClient()
  const indexer = algokit.getAlgoIndexerClient()
  const algorand = algokit.AlgorandClient.defaultLocalNet()

  // Create and fund random accounts for testing
  const deployer = await algorand.account.random()
  const user = await algorand.account.random()
  const user2 = await algorand.account.random()
  const accounts = [deployer, user, user2]

  const dispenser = await algorand.account.dispenser()
  for (let i = 0; i < accounts.length; i++) {
    await algorand.send.payment(
      {
        sender: dispenser.addr,
        receiver: accounts[i].addr,
        amount: algokit.algos(10),
      },
      { suppressLog: true },
    )
  }

  //1. Instantiate the Personal Bank app client for deployer
  const appClient = new PersonalBankClient(
    {
      resolveBy: 'creatorAndName',
      findExistingUsing: indexer,
      sender: deployer,
      creatorAddress: deployer.addr,
    },
    algod,
  )

  // 2. Deploy Personal Bank smart contract
  const app = await appClient.create.bare()

  // 3. transfer 0.1 ALGO to cover min bal (https://developer.algorand.org/docs/get-details/dapps/smart-contracts/apps/?from_query=minimum#minimum-balance-requirement-for-a-smart-contract)
  await algorand.send.payment(
    {
      sender: deployer.addr,
      receiver: app.appAddress,
      amount: algokit.algos(0.1),
    },
    { suppressLog: true },
  )

  // Create app client for User1 and User2
  const user1AppClient = new PersonalBankClient(
    {
      resolveBy: 'id',
      id: app.appId,
      sender: user,
    },
    algod,
  )

  const user2AppClient = new PersonalBankClient(
    {
      resolveBy: 'id',
      id: app.appId,
      sender: user2,
    },
    algod,
  )

  async function userDepositScript(
    appClient: PersonalBankClient,
    userName: string,
    user: TransactionSignerAccount,
    depositAmt: number,
  ): Promise<void> {
    // Create the payment txn object where user sends ALGOs to the Personal Bank app.
    const depositTxn = await algorand.transactions.payment({
      sender: user.addr,
      receiver: app.appAddress,
      amount: algokit.algos(depositAmt),
    })

    /*
    Group a payment transaction, an opt-in method call transaction, and a deposit method call 
    transaction into an atomic transaction and execute them simultaneously.

    Why should these three transactions be grouped atomically?

    - Payment Transaction: Since an Algorand smart contract is not an account, the payment 
      must be sent to the contract account.
    - Opt-in Method Call Transaction: The depositor must opt into the contract so that 
      a local state can be created in the contract.
    - Deposit Method Call Transaction: This transaction calls the deposit method. 
      It includes a transaction type called ptxn as its argument so the payment transaction
      is automatically grouped into the atomic group.
   */
    await appClient.compose().optIn.optInToApp({}).deposit({ ptxn: depositTxn }).execute({ suppressLog: true })

    console.log(`=== ${userName} Deposited ===`)

    let appInfo = await algorand.account.getInformation(app.appAddress)
    console.log(`Contract account balance: ${appInfo.amount / 1_000_000} Algos`)

    const userInfo = await algorand.account.getInformation(user)
    console.log(`${userName} account balance: ${userInfo.amount / 1_000_000} Algos`)

    let localStateCheck = await appClient.getLocalState(user)
    const userBalance = localStateCheck.balance?.asNumber()
    console.log(`${userName}'s local state: ${Number(userBalance) / 1_000_000} Algos`)

    let globalStateCheck = await appClient.getGlobalState()
    const depositors = globalStateCheck.depositors?.asNumber()
    console.log(`total depositors: ${depositors}`)
  }
  await userDepositScript(user1AppClient, 'user1', user, 5)
  await userDepositScript(user2AppClient, 'user2', user2, 8)

  async function userWithdrawScript(
    appClient: PersonalBankClient,
    userName: string,
    user: TransactionSignerAccount,
  ): Promise<void> {
    await appClient.closeOut.withdraw({}, { sendParams: { fee: algokit.transactionFees(2) } })

    console.log(`=== ${userName} Withdrawed ===`)
    const appInfo = await algorand.account.getInformation(app.appAddress)
    console.log(`Contract account balance: ${appInfo.amount / 1_000_000} Algos`)

    const userInfo = await algorand.account.getInformation(user)
    console.log(`${userName} account balance: ${userInfo.amount / 1_000_000} Algos`)

    try {
      const localStateCheck = await appClient.getLocalState(user)
      console.log(`User's local state: ${localStateCheck}`)
    } catch (e) {
      console.log("User's local state does not exist")
    }

    let globalStateCheck = await appClient.getGlobalState()
    const depositors = globalStateCheck.depositors?.asNumber()
    console.log(`total depositors: ${depositors}`)
  }
  await userWithdrawScript(user1AppClient, 'user1', user)
  await userWithdrawScript(user2AppClient, 'user2', user2)
}
