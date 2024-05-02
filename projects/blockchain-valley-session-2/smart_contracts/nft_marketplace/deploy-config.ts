import * as algokit from '@algorandfoundation/algokit-utils'
import { NftMarketplaceClient } from '../artifacts/nft_marketplace/client'

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
  const accounts = [deployer, buyer]

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

  // 판매할 NFT 에셋 생성
  const createResult = await algorand.send.assetCreate({
    sender: deployer.addr,
    assetName: 'NFT',
    unitName: 'NFT',
    total: 100n,
    decimals: 2,
  })

  // 생성된 에셋 ID를 저장
  const assetId = BigInt(createResult.confirmation.assetIndex!)

  // NftMarketplace 앱 배포
  const unitaryPrice: number = 1 * 1_000_000
  const app = await appClient.create.createApplication({ assetId: assetId, unitaryPrice: unitaryPrice })

  // NftMarketplace 앱에 미니멈 밸런스 지급
  const mbrPay = await algorand.transactions.payment({
    sender: deployer.addr,
    receiver: app.appAddress,
    amount: algokit.algos(0.2),
  })

  // optInToAsset 메서드 호출해서 앱이 판매할 NFT 에셋에 옵트인
  await appClient.optInToAsset(
    { mbrPay: mbrPay },
    { sendParams: { fee: algokit.transactionFees(2) }, assets: [Number(assetId)] },
  )

  // NftMarketplace 앱에 판매할 NFT 에셋 송금
  await algorand.send.assetTransfer({
    sender: deployer.addr,
    receiver: app.appAddress,
    assetId: assetId,
    amount: 100n,
  })

  // 구매자 앱 클라이언트 생성. 이 앱 클라이언트는 구매자 계정과 연동됨.
  const appClient2 = new NftMarketplaceClient(
    {
      resolveBy: 'id',
      sender: buyer,
      id: app.appId,
    },
    algod,
  )

  // 구매자가 NFT에 옵트인
  await algorand.send.assetOptIn({
    sender: buyer.addr,
    assetId: assetId,
  })

  // NftMarketplace buy 메서드 호출때 구매 비용 지불로 사용할 결제 트랜잭션 생성
  const buyNftPay = await algorand.transactions.payment({
    sender: buyer.addr,
    receiver: app.appAddress,
    amount: algokit.algos(unitaryPrice / 1_000_000),
  })

  // 위 결제 트랜잭션과 NftMarketplace buy 메서드를 어토믹 트랜잭션으로 동시에 호출
  await appClient2.buy(
    {
      buyerTxn: buyNftPay,
      quantity: 1,
    },
    { sendParams: { fee: algokit.transactionFees(2) }, assets: [Number(assetId)] },
  )

  // 판매자가 NftMarketplace 앱을 삭제하며 수익금과 잔여 NFT 에셋을 회수
  await appClient.delete.deleteApplication({ nft: assetId }, { sendParams: { fee: algokit.transactionFees(3) } })
}
