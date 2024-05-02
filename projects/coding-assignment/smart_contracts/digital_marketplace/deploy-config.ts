import * as algokit from '@algorandfoundation/algokit-utils'
import { NftMarketplaceClient } from '../artifacts/nft_marketplace/client'
import { TransactionSignerAccount } from '@algorandfoundation/algokit-utils/types/account'

// Below is a showcase of various deployment options you can use in TypeScript Client
export async function deploy() {
  console.log('=== Deploying NftMarketplace ===')

  // 여러 클라이언트 생성
  const algod = algokit.getAlgoClient()
  const indexer = algokit.getAlgoIndexerClient()
  const algorand = algokit.AlgorandClient.defaultLocalNet()

  // 랜덤 계정 생성 후 자금 지급
  const deployer = await algorand.account.random()
  const buyer = await algorand.account.random()
  const lateBuyer = await algorand.account.random()
  const accounts = [deployer, buyer, lateBuyer]

  const dispenser = await algorand.account.dispenser()
  for (let i = 0; i < accounts.length; i++) {
    await algorand.send.payment({
      sender: dispenser.addr,
      receiver: accounts[i].addr,
      amount: algokit.algos(100),
    })
  }

  // NftMarketplace 앱 클라이언트 생성
  const appClient = new NftMarketplaceClient(
    {
      resolveBy: 'creatorAndName',
      findExistingUsing: indexer,
      sender: deployer,
      creatorAddress: deployer.addr,
    },
    algod,
  )

  // 판매할 아이유님 콘서트 티켓 에셋 생성 (아이유 짱❤️)
  const createResult = await algorand.send.assetCreate({
    sender: deployer.addr,
    assetName: 'IU Concert Ticket',
    unitName: 'IU',
    total: 100n,
  })

  // 생성된 에셋 ID를 저장
  const assetId = BigInt(createResult.confirmation.assetIndex!)

  // NftMarketplace 앱 배포
  const unitaryPrice: number = 1 * 1_000_000
  const app = await appClient.create.bare()

  // NftMarketplace 앱에 미니멈 밸런스 지급
  const mbrPay = await algorand.transactions.payment({
    sender: deployer.addr,
    receiver: app.appAddress,
    amount: algokit.algos(0.2),
  })

  // optInToAsset 메서드 호출해서 앱이 판매할 NFT 에셋에 옵트인
  await appClient.bootstrap(
    { asset: assetId, unitaryPrice: unitaryPrice, mbrPay: mbrPay },
    { sendParams: { fee: algokit.transactionFees(2), populateAppCallResources: true } },
  )

  // NftMarketplace 앱에 판매할 NFT 에셋 송금
  await algorand.send.assetTransfer({
    sender: deployer.addr,
    receiver: app.appAddress,
    assetId: assetId,
    amount: 100n,
  })

  // 구매자 앱 클라이언트 생성. 이 앱 클라이언트는 구매자 계정과 연동됨.
  const buyerAppClient = new NftMarketplaceClient(
    {
      resolveBy: 'id',
      sender: buyer,
      id: app.appId,
    },
    algod,
  )

  // 구매자 앱 클라이언트 생성. 이 앱 클라이언트는 구매자 계정과 연동됨.
  const lateBuyerAppClient = new NftMarketplaceClient(
    {
      resolveBy: 'id',
      sender: lateBuyer,
      id: app.appId,
    },
    algod,
  )

  async function buyAsset(
    appClient: NftMarketplaceClient,
    buyerName: string,
    buyer: TransactionSignerAccount,
    assetId: bigint,
    buyAmount: number,
  ): Promise<void> {
    try {
      let assetInfo = await algorand.account.getAssetInformation(buyer, assetId)
      console.log('구매자가 이미 에셋에 옵트인 되어있어요!')
      console.log(assetInfo.balance)
    } catch (e) {
      console.log('구매자가 에셋에 옵트인이 안 되어있어요. 옵트인 진행')
      // 구매자가 NFT에 옵트인
      await algorand.send.assetOptIn({
        sender: buyer.addr,
        assetId: assetId,
      })
    }
    console.log('test1')

    // NftMarketplace buy 메서드 호출때 구매 비용 지불로 사용할 결제 트랜잭션 생성
    const buyNftPay = await algorand.transactions.payment({
      sender: buyer.addr,
      receiver: app.appAddress,
      amount: algokit.algos((unitaryPrice * buyAmount) / 1_000_000),
    })
    console.log('test2')

    // 위 결제 트랜잭션과 NftMarketplace buy 메서드를 어토믹 트랜잭션으로 동시에 호출
    await appClient.buy(
      {
        buyerTxn: buyNftPay,
        quantity: buyAmount,
      },
      { sendParams: { fee: algokit.transactionFees(2), populateAppCallResources: true } },
    )
    console.log('test3')

    const assetInfo = await algorand.account.getAssetInformation(buyer, assetId)
    console.log(`${buyerName}이 ${assetInfo.balance}개의 에셋을 구매했어요!`)
    console.log('test4')
  }

  await buyAsset(buyerAppClient, 'buyer', buyer, assetId, 1)

  // 아이유 콘서트가 인기가 너무 많아서 가격을 올림
  await appClient.setPrice({
    unitaryPrice: unitaryPrice * 2,
  })

  await buyAsset(lateBuyerAppClient, 'lateBuyer', lateBuyer, assetId, 2)

  // 티켓팅에 늦은 lateBuyer가 2개의 티켓을 구매
  // await buyAsset(lateBuyerAppClient, 'lateBuyer', lateBuyer, assetId, 2)

  // // Buyer가 친구도 데리고 가고 싶어서 1개의 티켓을 추가 구매
  // await buyAsset(buyerAppClient, 'buyer', buyer, assetId, 1)

  // 판매자가 NftMarketplace 앱을 삭제하며 수익금과 잔여 NFT 에셋을 회수
  await appClient.delete.withdrawAndDelete(
    {},
    { sendParams: { fee: algokit.transactionFees(3), populateAppCallResources: true } },
  )
}
