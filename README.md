# 🎓 블록체인 밸리 X 알고랜드 개발자 부트캠프

## 🚩 세션 2: 파이썬으로 알고랜드에서 디지털 마켓플레이스를 만들어 보자!

두번째 알고랜드 개발자 부트캠프에 오신 블록체인 밸리 학회원분들 반갑습니다~!

세부 일정:
1. 알고랜드 스마트 계약에 관한 모든것 알아보기 (30분)
2. 코드 데모 (30분)
3. 코딩 세션 (2시간)

이번 코딩 세션에서는 다음과 같은 디지털 마켓플레이스 스마트 계약을 [알고랜드 파이썬](https://algorandfoundation.github.io/puya/index.html)을 사용해서 구현해보겠습니다.

DigitalMarketplace 앱 설명

이 간단한 DigitalMarketplace 앱은 에섯(ASA)를 판매할 수 있는 스마트 계약입니다.

이 앱의 lifecycle은 아래와 같습니다.
1. 앱 생성자(판매자)가 앱을 생성합니다.
2. 앱 생성자(판매자)가 앱을 부트스트랩 메서드를 호출해 부트스트랩합니다. 이때 앱은 판매할 에셋(ASA)을 설정하고, 단가를 설정하고, 앱 계정이 옵트인을 합니다.
3. 구매자가 앱에서 판매하는 에셋(ASA)을 buy메서드를 호출해 구매합니다.
4. 앱 생성자(판매자)가 withdraw_and_delete 메서드를 호출해 앱 계정에 남아있는 에셋(ASA)을 앱 계정으로 전송하고, 모든 수익금을 판매자 계정으로 송금한 뒤, 스마트 계약을 삭제합니다.
번외: set_price 메서드를 통해 판매할 에셋(ASA)의 단가를 변경할 수 있습니다.

코딩 과제는 총 5문제로 구성되어 있으며 각 문제에 "*** 여기에 코드 작성 ***" 부분에 코드를 작성하시면 됩니다. 밑에 체크포인트들을 따라서 진행해주세요!

## 체크포인트 1: 🧰 알고랜드 개발에 필요한 툴킷 설치

1. [AlgoKit 설치](https://github.com/algorandfoundation/algokit-cli/tree/main?tab=readme-ov-file#install).
2. [Docker 설치](https://www.docker.com/products/docker-desktop/). It is used to run a local Algorand network for development.
3. [Node.JS / npm 설치](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

## 체크포인트 2: 💻 개발 환경 셋업

1. [이 리포를 fork 해주세요.](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo)
2. Fork한 리포를 git clone 해주세요.
```bash
cd [DIRECTORY_OF_YOUR_CHOICE]
git clone [FORKED_REPO_URL]
```
3. VSCode에서 이 폴더를 열람해주세요.
4. 열람 후 `blockchain-valley-session-2.code-workspace` 파일을 열람 후 `open workspace` 버튼을 눌러 workspace 모드를 실행시켜주세요
5. 이제 VSCode 터미널이 3개가 자동 생성될 것 입니다: `ROOT` `blockchain-valley-2` `coding-assignment`.  이 중 `coding-assignment` VSCode 터미널에서 `algokit project bootstrap all` 커맨드를 실행시켜 dependencies들을 설치해주세요.
```bash
algokit project bootstrap all
```

리포 fork, clone 튜토리얼:
https://github.com/algorand-fix-the-bug-campaign/challenge-1/assets/52557585/acde8053-a8dd-4f53-8bad-45de1068bfda


## 체크포인트 3: 📝 문제를 해결하세요!

1. 도커 데스크탑을 실행한 뒤 터미널에서 `algokit localnet start` 커맨드로 로컬 네트워크를 실행시켜주세요.[더 자세히 알고 싶다면 여기를 클릭해주세요!](https://github.com/algorandfoundation/algokit-cli/blob/main/docs/features/localnet.md#creating--starting-the-localnet).
2. `smart_contracts/digital_marketplace/contract.py` 파일로 가셔서 설명을 읽으시고 문제들을 해결하세요!
3. 문제를 다 해결한 뒤 터미널에서 `algokit project run build` 커맨드를 실행해 스마트 계약을 컴파일 하시고 `algokit project deploy localnet` 커맨드를 실행해 `smart_contracts/digital_marketplace/deploy-config.ts` 파일을 실행하세요!
실행 후 다음과 같은 콘솔 값이 출력되면 성공적으로 모든 문제를 해결하신겁니다!

### 과제를 일찍 끝내버린 그대를 위한 보너스 과제!

1. `smart_contracts/digital_marketplace/deploy-config.ts` 파일 안에 보면 btsScenario 함수가 주석으로 comment out 되어있습니다. 주석을 해제하고 설명에 따라 총 7문제를 해결하세요!
2. 문제를 다 해결한 뒤 터미널에서 `algokit project deploy localnet` 커맨드를 실행해 `smart_contracts/digital_marketplace/deploy-config.ts` 파일을 실행하세요!
실행 후 다음과 같은 콘솔 값이 출력되면 성공적으로 보너스 과제까지 해결하신겁니다!

## 체크포인트 4: 💯 과제 제출하는 방법

1. 성공적으로 다섯 문제를 해결한 후 본인이 fork한 깃헙 리포로 코드를 푸쉬해주세요. 그런 다음 [원래의 리포로 Pull request를 해주세요.](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork)
2. Pull Request 템플렛을 따라 출력된 값을 보여주는 터미널의 스크린샷을 첨부해주세요.

