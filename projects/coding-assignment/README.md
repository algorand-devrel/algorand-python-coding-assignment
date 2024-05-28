# 🎓 연세대 BAY X 알고랜드 개발자 세션 05/30/24

## 🚩 파이썬으로 알고랜드에서 NFT 마켓플레이스를 만들어 보자!

연세대 BAY X 알고랜드 개발자 세션에 오신 베이 학회원분들 반갑습니다~!

알고랜드 개발자 기초개념 및 스마트 계약에 관한 모든 것 👉 [PPT 슬라이드](https://docs.google.com/presentation/d/1I-lxxAkNIRoR9VdDX-wRD68hHuxBvI1uPY-VQlmrgiI/edit?usp=sharing)

이번 코딩 세션에서는 다음과 같은 NFT 마켓플레이스 스마트 계약을 [알고랜드 파이썬](https://algorandfoundation.github.io/puya/index.html)을 사용해서 구현해보겠습니다.

NftMarketplace 앱 설명

이 간단한 NftMarketplace 앱은 에섯(ASA)를 판매할 수 있는 스마트 계약입니다.

이 앱의 lifecycle은 아래와 같습니다.

1. 앱 생성자(판매자)가 앱을 생성합니다.
2. 앱 생성자(판매자)가 앱을 부트스트랩 메서드를 호출해 부트스트랩합니다. 이때 앱은 판매할 에셋(ASA)을 설정하고, 단가를 설정하고, 앱 계정이 옵트인을 합니다.
3. 구매자가 앱에서 판매하는 에셋(ASA)을 buy메서드를 호출해 구매합니다.
4. 앱 생성자(판매자)가 withdraw_and_delete 메서드를 호출해 앱 계정에 남아있는 에셋(ASA)을 앱 계정으로 전송하고, 모든 수익금을 판매자 계정으로 송금한 뒤, 스마트 계약을 삭제합니다.

코딩 과제는 총 4문제로 구성되어 있으며 각 문제에 "**_ 여기에 코드 작성 _**" 부분에 코드를 작성하시면 됩니다. 밑에 체크포인트을 차례대로 따라서 진행해주세요!

### 개발자 리소스:

- [알고랜드 개발자 문서](https://developer.algorand.org/docs/)
- [알고랜드 디스코드(디버깅, 코드 관련 질의응답)](https://discord.com/invite/algorand)
- [알고랜드 파이썬 개발자 문서](https://algorandfoundation.github.io/puya/)
- [알고랜드 파이썬 깃헙(예시 코드, 소스코드)](https://github.com/algorandfoundation/puya)
- [Algokit Utils TypeScript](https://github.com/algorandfoundation/algokit-utils-ts/tree/main)

## 체크포인트 1: 🧰 알고랜드 개발에 필요한 툴킷 설치

1. [AlgoKit 설치](https://github.com/algorandfoundation/algokit-cli/tree/main?tab=readme-ov-file#install).
2. [Docker 설치](https://www.docker.com/products/docker-desktop/). It is used to run a local Algorand network for development.
3. [Python 3.12 이상 설치](https://www.python.org/downloads/)
4. [Node.JS / npm 설치](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

## 체크포인트 2: 💻 개발 환경 셋업

1. [이 리포를 fork 해주세요.](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo)
2. Fork한 리포를 git clone 해주세요.

```bash
cd [DIRECTORY_OF_YOUR_CHOICE]
git clone [FORKED_REPO_URL]
```

3. VSCode에서 이 폴더를 열람해주세요.
4. 열람 후 `bay-workshop-2024.code-workspace` 파일을 열람 후 `open workspace` 버튼을 눌러 workspace 모드를 실행시켜주세요.
5. 이제 VSCode 터미널이 3개가 자동 생성될 것 입니다: `ROOT` `bay-workshop-2024` `coding-assignment`. 이 중 `ROOT` VSCode 터미널에서 `algokit project bootstrap all` 커맨드를 실행시켜 dependencies들을 설치해주세요. 이러면 모든 프로젝트 폴더의 dependencies들이 설치됩니다.
   > 만약 3개의 터미널의 자동으로 열리지 않으면 새로운 터미널을 + 버튼을 눌러 만들고 `ROOT`를 선택하시면 됩니다.

```bash
algokit project bootstrap all
```

> 만약 `Unhandled PermissionError: [Errno 13] Permission denied: '/Users/$name/.config/algokit'` 에러가 뜬다면 앞에 sudo를 붙여서 `sudo algokit project bootstrap all` 커맨드를 실행하세요!

6. 이제 `coding-assignment` 터미널을 선택한 뒤 `poetry shell` 커맨드를 실행해 파이썬 virtual environment를 활성화 시켜주세요.
   1. 파이썬 virtual environment를 비활성화 시킬때는 `exit` 커맨드를 실행하시면 됩니다.
   2. venv를 활성화 한 뒤 `pip list`를 실행해서 `algorand-python` 및 여러 dependencies들이 나오면 성공적으로 가상환경을 활성화 시킨겁니다.

🎉 이제 모든 준비가 되었습니다! Good luck coding! 💻

리포 fork, clone 튜토리얼:
https://github.com/algorand-fix-the-bug-campaign/challenge-1/assets/52557585/acde8053-a8dd-4f53-8bad-45de1068bfda

## 체크포인트 3: 📝 문제를 해결하세요!

이 코딩 과제는 **총 4문제**로 구성되어 있습니다. 아래 설명을 차례대로 읽고 진행해주세요!

### 로컬 네트워크 실행

1. 도커 데스크탑을 실행한 뒤 터미널에서 `algokit localnet start` 커맨드로 로컬 네트워크를 실행시켜주세요.[더 자세히 알고 싶다면 여기를 클릭해주세요!](https://github.com/algorandfoundation/algokit-cli/blob/main/docs/features/localnet.md#creating--starting-the-localnet). 오늘 모든 코드는 로컬 네트워크에서 실행됩니다.
   > 만약 로컬 네트워크 연결이 안되거나 뭔가 문제가 생기면 `algokit localnet reset` 커맨드로 로컬네트워크를 지우고 다시 생성하시면 됩니다.

### 1-4문제: 스마트계약 문제 진행 설명

1. `orakle-nft-marketplace-app-contracts` 터미널에서 `poetry shell`를 실행해서 파이썬 가상환경을 켰는지 확인하세요.
2. `orakle-nft-marketplace-app-contracts/smart_contract/nft_marketplace/contract.py`로 가시면 문제 1-4가 주석으로 작성되어있습니다.
   설명을 자세히 읽고 문제들을 해결하세요!
3. 문제를 다 해결한 뒤 터미널에서 `algokit project run build` 커맨드를 실행해 스마트 계약을 컴파일 하시고 `algokit project deploy localnet` 커맨드를 실행해 `smart_contracts/digital_marketplace/deploy-config.ts` 파일을 실행하세요!
   실행 후 다음과 같은 콘솔 값이 출력되면 성공적으로 모든 문제를 해결하신겁니다! 👏👏
   <img width="1033" alt="image" src="https://github.com/algorand-devrel/orakle-coding-assignment-2024/assets/52557585/7c6b578d-fd59-42e6-a11d-184ed7552cef">

## 체크포인트 4: 💯 과제 제출하는 방법

1. 성공적으로 다섯 문제를 해결한 후 본인이 fork한 깃헙 리포로 코드를 푸쉬해주세요. 그런 다음 [원래의 리포로 Pull request를 해주세요.](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork)
2. Pull Request 템플렛을 따라 출력된 값을 보여주는 터미널의 스크린샷을 첨부해주세요.
