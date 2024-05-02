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
  algorand.setDefaultValidityWindow(1000)

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
  let unitaryPrice: number = 1 * 1_000_000
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
    appAddr: string,
    unitaryPrice: number,
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

    // NftMarketplace buy 메서드 호출때 구매 비용 지불로 사용할 결제 트랜잭션 생성
    const buyNftPay = await algorand.transactions.payment({
      sender: buyer.addr,
      receiver: appAddr,
      amount: algokit.algos((unitaryPrice * buyAmount) / 1_000_000),
    })
    /*
    algorand client waits till last round
    client send txn group, iterate thru txn group and wait till last valid group. 
    sp is cached at round 100 first valid 100 last valid 110 for 3 second
    in 3 sec I sent 10 txn. dev mode: each txn is one block 
    if in dev mode don't cache at all. 
    */

    // 위 결제 트랜잭션과 NftMarketplace buy 메서드를 어토믹 트랜잭션으로 동시에 호출
    await appClient.buy(
      {
        buyerTxn: buyNftPay,
        quantity: buyAmount,
      },
      { sendParams: { fee: algokit.transactionFees(2), populateAppCallResources: true } },
    )

    const assetInfo = await algorand.account.getAssetInformation(buyer, assetId)
    console.log(`${buyerName}이 ${assetInfo.balance}개의 에셋을 보유하고 있어요!`)
  }

  await buyAsset(buyerAppClient, 'buyer', buyer, assetId, 1, app.appAddress, unitaryPrice)

  // 아이유 콘서트가 인기가 너무 많아서 가격을 올림
  await appClient.setPrice({
    unitaryPrice: unitaryPrice * 2,
  })

  unitaryPrice = unitaryPrice * 2

  // Buyer가 친구도 데리고 가고 싶어서 1개의 티켓을 추가 구매
  await buyAsset(buyerAppClient, 'buyer', buyer, assetId, 1, app.appAddress, unitaryPrice)

  // 티켓팅에 늦은 lateBuyer가 2개의 티켓을 구매
  await buyAsset(lateBuyerAppClient, 'lateBuyer', lateBuyer, assetId, 2, app.appAddress, unitaryPrice)

  // 판매자가 NftMarketplace 앱을 삭제하며 수익금과 잔여 NFT 에셋을 회수
  await appClient.delete.withdrawAndDelete(
    {},
    { sendParams: { fee: algokit.transactionFees(3), populateAppCallResources: true } },
  )

  /* 
  ========== 과제가 너무 쉬운 그대를 위하여... ==========
  시간은 남았는데 모든 문제를 이미 다 푸셨나요? 후후후... 그럼 이것도 한번 해보세요!

  시나리오: 방탄소년단도 이 DigitalMarketplace 앱을 통해 콘서트 티켓을 팔려고 합니다. 티켓 가격은 20 Algos로 팔겠다고 합니다. 
  하이브 계정이 앱을 배포하고 티켓을 앱에 보내어 판매를 합니다. 방탄소년단의 팬이 여러분의 지갑을 개설하고 그 지갑으로 티켓 1장을 사세요. 
  그때 여러분 친구1한테 연락이 와서 콘서트 같이 가자고 연락이 옵니다. 그래서 여러분이 티켓 1장을 추가로 구매하려고 보니까 가격이 30 Algos로 
  올라갔습니다. 그래서 어쩔 수 없이 30Algos로 티켓 1장을 추가로 삽니다. 근데 친구2도 같이 가자고 하네요. 그래서 친구2를 위해 티켓 1장을 
  추가로 구매하려고 하는데 가격이 40Algos로 올랐습니다. 그래서 40Algos로 티켓 1장을 추가로 삽니다. 하이브는 그 뒤 충분한 티켓을 팔았다고
  생각하여 앱을 삭제하고 수익금을 회수합니다.
  */
  async function btsScenario(): Promise<void> {
    // 방탄소년단과 팬 계정을 랜덤 생성
    const bts = await algorand.account.random()
    const fan = await algorand.account.random()
    const accounts2 = [bts, fan]

    // 계정들에 100 Algos 송금
    for (let i = 0; i < accounts2.length; i++) {
      await algorand.send.payment({
        sender: dispenser.addr,
        receiver: accounts2[i].addr,
        amount: algokit.algos(100),
      })
    }

    // 구매자 앱 클라이언트 생성. 이 앱 클라이언트는 구매자 계정과 연동됨.
    const btsAppClient = new NftMarketplaceClient(
      {
        resolveBy: 'creatorAndName',
        findExistingUsing: indexer,
        sender: bts,
        creatorAddress: bts.addr,
      },
      algod,
    )

    const btsApp = await btsAppClient.create.bare()

    // 팬 앱 클라이언트 생성. 이 앱 클라이언트는 구매자 계정과 연동됨.
    const fanAppClient = new NftMarketplaceClient(
      {
        resolveBy: 'id',
        sender: fan,
        id: btsApp.appId,
      },
      algod,
    )
    // 판매할 방탄소년단 콘서트 티켓 에셋 10장 생성
    const createResult = await algorand.send.assetCreate({
      sender: bts.addr,
      assetName: 'BTS Concert Ticket',
      unitName: 'BTS',
      total: 10n,
    })

    // 생성된 에셋 ID를 저장
    const assetId = BigInt(createResult.confirmation.assetIndex!)

    // 티켓 가격 20 Algos로 설정
    let unitaryPrice: number = 20 * 1_000_000

    // NftMarketplace 앱에 미니멈 밸런스 지급
    const mbrPay = await algorand.transactions.payment({
      sender: bts.addr,
      receiver: btsApp.appAddress,
      amount: algokit.algos(0.2),
    })

    // bootstrap 메서드 호출해서 앱이 판매할 NFT 에셋에 옵트인
    await btsAppClient.bootstrap(
      { asset: assetId, unitaryPrice: unitaryPrice, mbrPay: mbrPay },
      { sendParams: { fee: algokit.transactionFees(2), populateAppCallResources: true } },
    )

    // NftMarketplace 앱에 판매할 NFT 에셋 송금
    await algorand.send.assetTransfer({
      sender: bts.addr,
      receiver: btsApp.appAddress,
      assetId: assetId,
      amount: 10n,
    })

    // 방탄소년단 팬이 1장의 티켓을 구매
    await buyAsset(fanAppClient, 'fan', fan, assetId, 1, btsApp.appAddress, unitaryPrice)

    // 방탄소년단 콘서트가 인기가 너무 많아서 가격을 올림
    unitaryPrice = unitaryPrice + 10 * 1_000_000
    await btsAppClient.setPrice({
      unitaryPrice: unitaryPrice,
    })

    // 방탄소년단 팬이 친구1를 위해1장의 티켓을 추가 구매
    await buyAsset(fanAppClient, 'fan', fan, assetId, 1, btsApp.appAddress, unitaryPrice)

    // 방탄소년단 콘서트가 인기가 너무 많아서 또 가격을 올림
    unitaryPrice = unitaryPrice + 10 * 1_000_000
    await btsAppClient.setPrice({
      unitaryPrice: unitaryPrice,
    })

    // 방탄소년단 팬이 친구2를 위해1장의 티켓을 추가 구매
    await buyAsset(fanAppClient, 'fan', fan, assetId, 1, btsApp.appAddress, unitaryPrice)
  }
  await btsScenario()
}
