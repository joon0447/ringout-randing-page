# RingOut 소개 페이지

자기 전에 세운 아침 계획을 실제 움직임으로 이어주는 알람 **RingOut**의 소개 페이지입니다. 뛰러 나가기, 헬스장 가기, 도서관 가기처럼 잠 때문에 놓치기 쉬운 계획을 알람 이후의 이동 미션과 연결합니다.

## 로컬에서 보기

별도 설치 없이 정적 파일로 동작합니다.

```bash
python3 -m http.server 4173
```

브라우저에서 `http://localhost:4173`을 열어 확인하세요.

## Vercel 배포

Vercel에서 이 폴더를 프로젝트 루트로 연결하면 됩니다. Framework Preset은 `Other`, Build Command는 비워 두고 Output Directory는 `.`으로 설정하세요.
