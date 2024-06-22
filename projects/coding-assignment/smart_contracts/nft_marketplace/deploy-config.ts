import * as algokit from '@algorandfoundation/algokit-utils'
import { NftMarketplaceClient } from '../artifacts/nft_marketplace/client'
import { TransactionSignerAccount } from '@algorandfoundation/algokit-utils/types/account'
import { Config as AlgokitConfig } from '@algorandfoundation/algokit-utils'

// Below is a showcase of various deployment options you can use in TypeScript Client
export async function deploy() {
  console.log('=== Deploying NftMarketplaceClient ===')
  AlgokitConfig.configure({ populateAppCallResources: true })

  // Instantiate clients
  const algod = algokit.getAlgoClient()
  const indexer = algokit.getAlgoIndexerClient()
  const algorand = algokit.AlgorandClient.defaultLocalNet()
  algorand.setDefaultValidityWindow(1000)

  // Create and fund random accounts for testing
  const deployer = await algorand.account.random()
  const buyer = await algorand.account.random()
  const accounts = [deployer, buyer]

  const dispenser = await algorand.account.dispenser()
  for (let i = 0; i < accounts.length; i++) {
    await algorand.send.payment(
      {
        sender: dispenser.addr,
        receiver: accounts[i].addr,
        amount: algokit.algos(100),
      },
      { suppressLog: true },
    )
  }

  // Create NftMarketplace app client
  const appClient = new NftMarketplaceClient(
    {
      resolveBy: 'creatorAndName',
      findExistingUsing: indexer,
      sender: deployer,
      creatorAddress: deployer.addr,
    },
    algod,
  )

  // Create Taylor Swift concert ticket ASA that will be sold.
  const createResult = await algorand.send.assetCreate(
    {
      sender: deployer.addr,
      assetName: 'IU Concert Ticket',
      unitName: 'IU',
      total: 100n,
    },
    { suppressLog: true },
  )

  // Save created asset ID
  const assetId = BigInt(createResult.confirmation.assetIndex!)
  console.log(`1. Taylor Swift concert ticket ASA created!  Asset Id: ${assetId}`)

  //Deploy NftMarketplaceClient app
  let unitaryPrice: number = 1 * 1_000_000
  const app = await appClient.create.bare()

  // Fund NftMarketplaceClient to cover minimum balance
  const mbrPay = await algorand.transactions.payment({
    sender: deployer.addr,
    receiver: app.appAddress,
    amount: algokit.algos(0.2),
    extraFee: algokit.algos(0.001),
  })

  const sendAssetToSell = {
    sender: deployer.addr,
    receiver: app.appAddress,
    assetId: assetId,
    amount: 100n,
  }

  // Call the bootstrap method and then send the Taylor Swift concert ticket ASA to the app.
  await algorand
    .newGroup()
    .addMethodCall({
      sender: deployer.addr,
      appId: BigInt(app.appId),
      method: appClient.appClient.getABIMethod('bootstrap')!,
      args: [assetId, unitaryPrice, mbrPay],
    })
    .addAssetTransfer(sendAssetToSell)
    .execute()

  console.log('2. App bootstrapped!')
  console.log('3. Taylor Swift concert ticket transferred to app!')

  // Instantiate buyer app client. This app client is connected to the buyer's account.
  const buyerAppClient = new NftMarketplaceClient(
    {
      resolveBy: 'id',
      sender: buyer,
      id: app.appId,
    },
    algod,
  )

  // A function where the buyer opts in to the concert ticket and calls the buy method to buy the ticket.
  async function buyAsset(
    appClient: NftMarketplaceClient,
    buyerName: string,
    buyer: TransactionSignerAccount,
    assetId: bigint,
    buyAmount: number,
    appAddr: string,
    unitaryPrice: number,
  ): Promise<void> {
    // Create a payment transaction object for paying the NftMarketplace app to purchase the concert ticket
    const buyNftPay = await algorand.transactions.payment({
      sender: buyer.addr,
      receiver: appAddr,
      amount: algokit.algos((unitaryPrice * buyAmount) / 1_000_000),
    })

    try {
      let assetInfo = await algorand.account.getAssetInformation(buyer, assetId)
      console.log(`${buyerName}is already opted in to the ASA! # of purchased tickets: ${assetInfo.balance}개`)
    } catch (e) {
      console.log(`${buyerName}is not opted in to the ASA! Opting into the ASA...`)

      // Create buy method call transaction object
      const buyAppCall = await appClient
        .compose()
        .buy(
          {
            buyerTxn: buyNftPay,
            quantity: buyAmount,
          },
          { sendParams: { fee: algokit.transactionFees(2), suppressLog: true } },
        )
        .atc()

      // The buyer atomicatlly opts in to the ASA, calls the buy method, and sends the buyNftPay payment transaction.
      await algorand
        .newGroup()
        .addAssetOptIn({
          sender: buyer.addr,
          assetId: assetId,
        })
        .addAtc(buyAppCall)
        .execute()

      const assetInfo = await algorand.account.getAssetInformation(buyer, assetId)
      console.log(
        `${buyerName} purchased ${buyAmount} concert tickets and now holding ${assetInfo.balance} tickets in total!`,
      )
      return
    }

    // If the buyer is already opted in to the ASA, just call the buy method.
    await appClient.buy(
      {
        buyerTxn: buyNftPay,
        quantity: buyAmount,
      },
      { sendParams: { fee: algokit.transactionFees(2), suppressLog: true } },
    )

    const assetInfo = await algorand.account.getAssetInformation(buyer, assetId)
    console.log(
      `${buyerName} purchased ${buyAmount} concert tickets and now holding ${assetInfo.balance} tickets in total!`,
    )
  }

  await buyAsset(buyerAppClient, 'buyer', buyer, assetId, 1, app.appAddress, unitaryPrice)
  await buyAsset(buyerAppClient, 'buyer', buyer, assetId, 2, app.appAddress, unitaryPrice)

  // The seller withdraw and delete the app.
  await appClient.delete.withdrawAndDelete(
    {},
    { sendParams: { fee: algokit.transactionFees(3), populateAppCallResources: true } },
  )
  console.log('4. Taylor Swift concert ticket sale ends & all proceeds are withdrawn!')
}
