# RingOut 소개 페이지

자기 전에 세운 아침 계획을 실제 움직임으로 이어주는 알람 **RingOut**의 소개 페이지입니다. 뛰러 나가기, 헬스장 가기, 도서관 가기처럼 잠 때문에 놓치기 쉬운 계획을 알람 이후의 이동 미션과 연결합니다.

## 로컬에서 보기

별도 설치 없이 정적 파일로 동작합니다.

```bash
python3 -m http.server 4173
```

브라우저에서 `http://localhost:4173`을 열어 확인하세요.

기기별 스토어 이동은 로컬에서 `http://localhost:4173/download.html`로 확인할 수 있습니다. 배포 환경에서는 `/download`를 사용합니다.

## Vercel 배포

Vercel에서 이 폴더를 프로젝트 루트로 연결하면 됩니다. Framework Preset은 `Other`, Build Command는 비워 두고 Output Directory는 `.`으로 설정하세요.

## PostHog 세션 리플레이

`analytics.js`가 `https://ringout.my`와 리다이렉트 도착 주소인 `https://www.ringout.my`에서만 PostHog를 초기화합니다. 로컬과 Vercel 미리보기에서는 SDK를 로드하거나 PostHog 데이터를 전송하지 않습니다. 운영 도메인이 바뀌면 이 파일의 도메인 조건도 변경하세요.

- 프로젝트: [ringout (698005)](https://us.posthog.com/project/698005/replay/home), US Cloud
- 페이지뷰와 세션 리플레이를 수집합니다. 녹화 여부와 수집률은 [PostHog Session replay 설정](https://us.posthog.com/project/698005/settings/project-replay)에서 관리합니다.
- 입력값을 마스킹하며 네트워크 요청·응답의 본문과 헤더는 수집하지 않습니다. 공개 페이지 텍스트와 이미지는 리플레이에 표시됩니다.
- 스토어 버튼 클릭은 `store_button_clicked` 이벤트로 전송합니다. `store`는 `app_store` 또는 `google_play`, `placement`는 `header`, `hero`, `bottom`입니다. 기존 GA4 이벤트도 유지합니다.
- `/download`는 즉시 스토어로 이동하므로 이번 수집 범위에 포함하지 않습니다. 스토어 버튼 클릭은 실제 앱 설치 완료를 뜻하지 않습니다.
- 코드에 있는 Project token은 브라우저에서 사용하는 공개 수집용 키입니다. Personal API key나 Secret API key로 교체하지 마세요.

배포 후 운영 페이지에서 10초 이상 스크롤하고 스토어 버튼을 누른 다음, PostHog Activity에서 이벤트와 `placement`를 확인하고 Session replay에서 해당 세션을 재생하세요. 로컬에서는 운영 도메인 제한으로 녹화가 생성되지 않습니다.
