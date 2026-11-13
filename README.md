# BRACER — Central Monitoring System

Figma 시안(`9meqGxURmhd2zK5va2Ehme`)을 React + Node.js로 구현한 웹사이트입니다.

- **프론트**: React 19 · Vite · TypeScript · React Router (`client/`)
- **백엔드**: Node.js · Express (`server/`) — 로컬에서 API와 빌드된 화면을 함께 제공
- **폰트**: Gothic A1 (프로젝트에 포함, 오프라인에서도 동작)

## 실행

```bash
npm run setup          # 루트·server·client 의존성 설치 (최초 1회)

# 개발 모드: http://localhost:5173  (API는 :3000으로 프록시)
npm run dev

# 로컬 호스팅: 빌드 후 http://localhost:3000 하나로 서비스
npm run build
npm start
```

- 접근 코드: **0000** (`server/config.json`의 `accessCode` 또는 환경 변수 `ACCESS_CODE`로 변경)
- 포트: `server/config.json`의 `port` 또는 환경 변수 `PORT`

## 화면과 주소

| 주소 | Figma 프레임 |
|---|---|
| `/` | 비밀번호 (102:493) |
| `/main` | 메인 화면 (3:764) + 팝업 (101:5) |
| `/culture/1~3` | 조직 문화 (3:595, 3:668, 3:733) |
| `/equipment` | 장비 목록 (3:776) · 마우스 오버 (135:109) |
| `/equipment/:op/:item` | 장비 목록 - 상세 9장 (`op` = spine, line, flow, stretch) |
| `/targets/:id` | 페르소나 설명 (5:1097, 102:365, 102:428, 102:302) |
| `/targets/:id/report` | 관찰 보고서 (102:400, 22:2, 102:463, 102:337) + 모니터링 사진 (164:1488~1495) |
| `/org`, `/org/ethan-vence` | 조직도 (4:1004) · 이든 밴스 클릭 시 (102:765) |

## Figma를 그대로 옮긴 방식

- **1920×1080 고정 판**: 모든 레이어를 Figma 프레임 좌표 그대로 배치하고, 판 전체를 창 크기에 맞춰 균일하게 확대·축소합니다(`client/src/ui/Stage.tsx`, `ui/prim.tsx`).
- **이미지는 이미지로**: 사진·렌더 등 Figma의 이미지 채우기는 모두 Figma에서 받은 원본을 사용합니다(용량 때문에 WebP로만 재인코딩). Figma의 크롭 값과 이미지 보정(채도 -1 → 흑백)도 그대로 적용했고, 대비·하이라이트 보정이 걸린 조직도 사진 1장은 Figma가 렌더링한 결과물을 사용합니다.
- **벡터는 Figma SVG 그대로**: 로고, 엠블럼, 원·점선 원, 화살표, 십자선 등은 Figma에서 내보낸 SVG 파일입니다. 0.5px 선은 Figma 렌더와 같은 굵기로 보이도록 CSS로 그립니다.
- **글자·단색 도형만 코드**: 문구는 `server/data/content.json`에 Figma 원문 그대로 들어 있고 `/api/content`로 내려옵니다.

### 에셋 다시 받기

`scripts/figma-assets.txt`에 Figma MCP가 발급한 다운로드 주소가 있습니다(7일 후 만료).

```bash
bash scripts/download-assets.sh      # .figma-raw/ 로 원본 다운로드
python3 scripts/build-assets.py      # client/public/assets/ 로 변환·복사
```

## 서버 API

| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/api/content` | 화면 문구 |
| POST | `/api/access` | `{ code }` 접근 코드 확인 |
| GET | `/api/activity` | 메인 화면 ACTIVITY LOG (최근 5건) |
| POST | `/api/activity` | `{ name }` 코드 네임 기록 (`server/data/activity.json`) |

## 인터랙션 (Figma 프로토타입 + 코멘트 반영)

- 비밀번호 4자리 → 승인 시 메인 + 상부 교신 팝업, 거부 시 흔들림
- 메인: 현재 날짜·시간, CCTV 시각, 계속 도는 원/점, `상부 교신 다시보기`로 팝업 재생, 코드 네임 입력 → ACTIVITY LOG 기록, CCTV 클릭 → 타겟
- 조직 문화: 흰색 박스에 마우스를 올리면 아래 문구가 드러나고, 클릭하면 다음 페이지
- 장비 목록: 마우스 오버 시 장비를 착용한 사진으로 교체 / 상세: 사진 두둥실, 썸네일·화살표·←→ 키로 장비 전환
- 타겟 → 상세 관찰 보고서(모니터링 사진 3장 넘겨 보기) → `작전 장비 확인하기`는 장비 목록으로 이동하며 해당 장비 카드를 보여 줌
- 조직도: 이든 밴스만 클릭 가능, ACCESS RESTRICTED 칸은 클릭 불가 모션
- 화면 전환 글리치, 스캔라인, 텍스트 디코딩 등 SF 패널 연출(정지 상태는 Figma와 동일)
- 상부 교신 영상: 아직 placeholder입니다. 영상을 `client/public/assets/popup/`에 넣고 `content.json`의 `transmission.video`에 경로(예: `popup/transmission.mp4`)를 적으면 재생됩니다.

## 모바일

폭 900px 미만(또는 세로 방향 태블릿)에서는 같은 이미지·문구를 세로 흐름으로 재배치한 모바일 레이아웃(`client/src/mobile/`)이 표시됩니다.

## 검수 도구

```bash
npm run build && npm start            # 다른 터미널에서
node scripts/qa-compare.mjs           # 화면별 Figma 렌더와 픽셀 비교 (qa/ 에 결과 저장)
node scripts/smoke.mjs                # 주요 흐름 클릭 테스트
```

`?qa=1`을 붙이면 애니메이션이 멈추고 시계·진행률이 Figma에 적힌 값으로 고정됩니다. 비교용 Figma 렌더는 `qa/figma/<화면>.png`에 두면 됩니다(`scripts/qa-routes.json` 참고).

## Figma에서 확인이 필요한 부분 (시안 그대로 구현함)

- 장비 목록 카드 4개의 제목이 모두 `OP.SPINE 척추 방어 작전 장비`
- 관찰 보고서 4개 모두 `TARGET 01 모니터링`
- TARGET 02 이름 표기: 상단 `엘리노르 밴스` / 표 `엘리노어 반스`
- TARGET 03·04 요청 문구의 작전명 뒤 `척추 방어 작전`, TARGET 04 보고서의 `OP.SPINE` 표기
- ACTIVITY LOG 시각 `39:31:09`
