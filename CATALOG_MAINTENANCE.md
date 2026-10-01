# 카탈로그 유지관리 — 새 오디오 가이드 하나 추가하기

작성일: 2026-10-01. 상품 마스터·자동 카탈로그·상품 상세 소개 화면의 유지관리 안내다. 현재 공개 상품은 80종이다. 카탈로그·상세 화면은 이후 안정 commit `784d4170421271787a6e14fd9bd2928bb1a0efb0`으로 배포됐으며, Auth 1단계는 실제 공개 설정과 로컬 실계정 1회 확인을 마쳤고 기존 main → Vercel Production 배포 구조를 사용한다.

## 1. 어디를 수정하나요?

상품 정보의 원본은 **`content/products.json` 하나**다. 파일 안에 상품 배열(`products`), 카테고리·시리즈 이름, 기획 번들 구성이 함께 있다.

| 위치 | 용도 | 직접 수정 |
|---|---|---|
| `content/products.json` | 상품 정보의 Single Source of Truth | 상품 추가·메타데이터 수정은 여기 |
| `content/products.schema.json` | 필드 형식과 필수값 규칙 | 스키마를 변경할 때만 |
| `dist/guides/...html` | 실제 가이드 내용과 기존 공개 URL | 새 파일만 추가; 기존 이름을 바꾸지 않음 |
| `src/index.template.html` | 홈의 기존 디자인 템플릿 | 화면 구조를 수정할 때만; 상품 추가에는 수정 불필요 |
| `src/app.js`, `src/catalog-core.js` | 목록·검색·필터·상세 정보 조회 | 기능을 수정할 때만 |
| `src/product.template.html`, `src/product.js`, `src/product.css` | 모든 상품이 함께 사용하는 상세 소개 화면 | 화면 기능을 수정할 때만; 상품 추가에는 수정 불필요 |
| `dist/catalog.js`, `dist/products.json` | 마스터에서 생성한 데이터 | **직접 수정 금지** |
| `dist/index.html`, `dist/app.js`, `dist/catalog-core.js` | 생성된 운영 화면·코드 | **직접 수정 금지** |
| `dist/product.html`, `dist/product.js`, `dist/product.css` | 생성된 상세 소개 화면·코드·스타일 | **직접 수정 금지** |
| `tests/fixtures/legacy-links.json` | 기존 80개 URL 계약을 보호하는 검사 기록 | 새 상품을 추가할 때 수정 불필요 |
| `audit/` | 감사 스냅샷과 검증 근거 | 운영 데이터 원본으로 사용하지 않음 |

파일을 추가한 뒤 빌드 명령을 실행하면 목록·검색·카테고리 수량·상세 소개 화면에 반영된다. 다른 화면에 상품을 다시 입력하지 않는다. 사이트 이용자는 Node.js나 개발 패키지를 설치할 필요가 없다.

## 2. JSON을 선택한 이유

현재 사이트는 정적 HTML과 JavaScript이고 TypeScript 앱이나 프레임워크가 없다. JSON은 별도 실행 언어 없이 읽을 수 있고, 편집 도구·생성 스크립트·향후 DB로 그대로 가져가기 쉽다. 따라서 상품 원본은 JSON으로 선택했다.

타입 검사는 별도로 제공한다. JSDoc와 `src/catalog-types.d.ts`를 TypeScript로 검사하고, 실제 JSON은 JSON Schema와 파일·참조 검증을 통과해야 빌드된다. JSON을 TypeScript 파일로 변환하거나 웹 프레임워크를 추가하지 않았다.

## 3. 먼저 준비할 것

Node.js 24를 권장한다. 개발 의존성 버전은 `package-lock.json`에 고정돼 있다. 처음 다른 컴퓨터에서 작업할 때 PowerShell에서 다음을 실행한다.

```powershell
Set-Location -LiteralPath 'C:\Users\ADMIN\Desktop\vst 데이터 001-080 코덱스업글버전\bluegee-library-site'
npm.cmd ci
```

이 명령은 제작·검증 도구를 설치한다. 사이트를 외부로 배포하지 않는다.

## 4. 081번을 추가하는 정확한 순서

### ① 실제 가이드 파일을 먼저 넣기

실제 081 가이드 HTML을 알맞은 `dist/guides/` 하위 폴더에 복사한다. 예를 들어 아웃보드 자료라면 다음과 같은 새 경로를 사용할 수 있다.

```text
dist/guides/outboard/081-your-actual-guide.html
```

위 이름은 설명용 예시다. 이미 파일명이 정해져 있다면 그 실제 이름을 사용한다. 기존 80개 파일을 새 파일로 덮어쓰거나 이름을 바꾸지 않는다.

HTML에 `audio-guide-config`가 있다면 그 안의 번호·제목·카테고리가 상품 정보와 같아야 한다. 목차는 HTML config에서 자동 추출하므로 마스터에 다시 입력하지 않는다. config가 없는 독립 HTML도 등록할 수 있으며 확인되지 않은 장 수는 표시하지 않는다. 기존 독서 목차와 동일한 경험은 HTML 제작 단계에서 제공해야 한다.

### ② products 배열의 마지막에 상품 하나 추가하기

`content/products.json`을 UTF-8 텍스트 편집기로 연다. `products` 배열에서 마지막 상품의 `}` 뒤에 쉼표를 넣고, 새 상품 객체를 추가한다. 배열의 마지막 상품 뒤에는 쉼표를 붙이지 않는다.

아래는 **설명용 예시이며 실제 상품으로 등록돼 있지 않다.** 파일명·제목·분류는 실제 자료에 맞게 입력한다.

```json
{
  "id": "audio-081",
  "number": "081",
  "slug": "081-your-actual-guide",
  "title": "실제 HTML의 제목",
  "brand": null,
  "series": null,
  "category": "outboard",
  "subcategory": null,
  "equipmentType": null,
  "description": null,
  "keywords": [],
  "htmlPath": "guides/outboard/081-your-actual-guide.html",
  "pdfPath": null,
  "coverImage": null,
  "status": "published",
  "featured": false,
  "relatedIds": [],
  "bundleIds": [],
  "createdAt": null,
  "updatedAt": null,
  "keywordSources": []
}
```

`htmlPath`에는 **dist 다음부터의 경로**를 적는다. `dist/`나 컴퓨터의 `C:/...`를 붙이지 않는다. 역슬래시 대신 `/`를 사용한다. URL 주소나 없는 PDF 파일을 넣지 않는다.

확인되지 않은 브랜드·세부 분류·장비 종류·날짜·PDF·커버는 `null`로 둔다. 확인된 설명과 검색어만 추가한다. `featured=false`는 아직 별도로 추천 선정하지 않았다는 뜻이다. ID와 slug는 상품을 식별하는 값이며 실제 HTML 파일명·공개 URL을 변경하지 않는다.

### ③ 카테고리와 시리즈 선택하기

| 필드 | 사용할 값 | 의미 |
|---|---|---|
| category | `outboard` | 현재 아웃보드 탐색 |
| category | `deep-dive` | 현재 엔지니어 딥다이브 탐색 |
| category | `microphone` | 현재 마이크 탐색 |
| series | `classic-studio-gear` | Classic Studio Gear 시리즈 |
| series | `engineer-deep-dive` | Engineer Deep Dive / Revision War 시리즈 |
| series | `microphone-master-library` | Microphone Master Library 시리즈 |
| series | `null` | 시리즈 소속 미확정 |

현재 001–050 /051–060 /061–080은 시리즈로 50/10/20이고, 탐색 카테고리는49/10/21이다. **050 U47은 category=microphone, series=classic-studio-gear**로 유지한다.

081 이후의 시리즈를 번호만 보고 임의로 정하지 않는다. 실제 자료의 역할에 맞게 선택하거나 미정이면 null로 둔다. 기존 카테고리·시리즈를 쓰면 이름 사전이나 홈을 수정하지 않아도 된다. 새로운 시리즈 자체를 만들 때는 같은 마스터 파일의 `series` 배열에 id·label을 먼저 등록한다.

`subcategory`와 `equipmentType`은 현재 실제 가이드의 `kind`를 옮겼다. EQ, Compressor, Preamp / EQ, Tube Condenser 같은 값이다. 아직 모르면 null로 두고 검수 후 입력한다. 브랜드·장비 종류 필터의 데이터 구조와 조회 API는 준비돼 있으나 새 필터 버튼은 이번에 추가하지 않았다.

### ④ 검색어와 관련 자료 관리하기

`keywords`는 확인된 제목·장비 종류·별칭·본문 주제어다. 장비 성능이나 특정 소스의 우위를 임의로 추가하지 않는다. 기존 상품에서 본문 용도어를 추출한 항목은 `keywordSources`에 원래 chapterId와 heading을 보관했다.

```json
"keywords": ["보컬", "vocal"],
"keywordSources": [
  {
    "keywords": ["보컬", "vocal"],
    "chapterId": "실제로존재하는장ID",
    "heading": "해당본문의실제소제목"
  }
]
```

장 ID는 실제 HTML config에 있어야 한다. 제목·브랜드 별칭 등은 `keywords`에만 넣을 수 있다. 확인되지 않은 관련 관계는 `relatedIds=[]`로 둔다. 검토한 관련 상품을 추가할 때는 `audio-002`처럼 현재 존재하는 상품 ID를 사용한다. 번호 문자열002와 canonical ID audio-002를 혼동하지 않는다.

상세 화면의 주요 특징은 기본적으로 실제 목차의 주제 4개를 표시한다. 독립적인 소개 문장이 필요하면 **같은 상품 객체에만** 선택 필드 `highlights`와 `whyItMatters`를 추가한다. 별도 상세 데이터 파일을 만들거나 `product.js`에 상품별 문장을 입력하지 않는다.

```json
"highlights": ["실제 가이드에서 확인하고 검수한 주제"],
"whyItMatters": "이 장비를 알아야 하는 이유를 설명한 검수 문장"
```

필드를 생략하거나 `highlights=[]`, `whyItMatters=null`로 두면 원본 목차와 기존 짧은 설명을 이용해 기본 소개가 나타난다. 성능 우위나 실측 결과를 추측해 넣지 않는다. 기존 80개는 목차 기반 소개를 사용하며, 25개 상품에 동일 모델·리비전·장비 계열의 관련 링크를 등록했다. 관련 관계는 자동 추천이나 개인화 없이 `relatedIds`만 사용한다.

### ⑤ 검사와 빌드 실행하기

```powershell
npm.cmd run validate
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npm.cmd run build:check
```

어느 명령이 실패하면 먼저 오류를 해결한다. 등록 검증은 번호·ID·slug·HTML 경로 중복, 파일 존재, config·목차·관계·날짜·번들 참조를 확인한다. 기존80개 자료를 빼거나 원래 URL을 바꾸면 검사에 실패한다.

`build`는 현재 마스터와 공통 템플릿에서 운영 파일8개를 생성한다. `dist/guides/`를 지우거나 복사·이동·수정하지 않는다. 기존 styles.css, reader.html, reader.js도 그대로 유지한다.

### ⑥ 로컬 화면에서 확인하기

```powershell
npm.cmd run dev
```

브라우저에서 [로컬 카탈로그](http://127.0.0.1:8766/)를 연다. 실제 새 공개 상품을 추가했다면 전체 수량·해당 카테고리 수가1개 늘어야 한다. 새 제목·브랜드·검색어로 검색한다. 제목을 클릭하면 `product.html?id=audio-081` 형식의 소개 화면이 열리고, ‘읽기’ 또는 소개 화면의 ‘HTML 가이드 읽기’는 새 실제 원본 파일을 연다. 검색 상태에서 소개 화면으로 들어갔다가 ‘목록으로 돌아가기’를 눌러 검색어·카테고리가 복원되는지도 확인한다.

이미 로컬 서버가 실행 중이면 다시 켜지 않고 `npm.cmd run build` 후 브라우저를 새로고침한다. JSON 저장만으로 생성된 파일이 자동으로 다시 쓰이는 방식은 아니다. 카탈로그 정보가 각 화면에 자동 반영되는 시점은 **빌드 후**다.

```powershell
npm.cmd run test:browser
```

브라우저 회귀 테스트는 자체 로컬 서버를 잠시 켜서 실행하고 종료한다. Windows에서는 설치된 Edge를 사용한다. 다른 환경에서는 Playwright Chromium 설치 또는 `BROWSER_EXECUTABLE` 지정이 필요할 수 있다. 테스트의 임시 신규 상품은 격리된 임시 폴더에만 생성되고 제거된다.

081을 임시 추가해 전체81, 아웃보드50, 검색 결과1, 실제 상세 화면·소개 선택 필드·이전/다음·검색 목록 복귀·원본 읽기를 확인했다. 목차·브랜드·짧은 설명이 없을 때의 표시도 확인했다. 실제 마스터에는 테스트 상품을 남기지 않았으며 최종 수는80이다.

이 단계는 로컬 검증까지만 수행한다. GitHub push·Vercel 배포는 별도 지시가 있을 때 진행한다.

## 5. 전체 스키마

| 필드 | 형식 / 규칙 |
|---|---|
| id | `audio-001` 형태의 안정 ID; number와 일치 |
| number | 001–999의 세 자리 문자열;000 제외 |
| slug | 소문자 영숫자·하이픈; 중복 불가; 현재 파일명과 별도 |
| title | 실제 가이드 제목; config가 있다면 제목과 일치 |
| brand | 확인된 브랜드 표시 문자열 또는null; 복수 계보는 현재 `/`로 함께 표시 |
| series | 마스터에 등록된 시리즈 ID 또는null |
| category | 마스터에 등록된 탐색 카테고리 ID |
| subcategory | 기존 kind에서 확인한 세부 분류 또는null |
| equipmentType | 확인한 장비 종류 또는null |
| description | 짧은 설명 또는null |
| keywords | 확인된 검색어 배열; 모르면[] |
| htmlPath / pdfPath / coverImage | dist 기준 상대 파일 경로 또는null; 경로를 넣으면 실제 파일 존재 필수 |
| status | published / draft / unknown; 목록·검색·상세 조회에는 published만 표시 |
| featured | 별도 추천 선정 여부; 현재 모두false |
| relatedIds | 관련 상품의 canonical ID 배열; 현재25개에 검토한 관계 등록, 나머지는[] |
| bundleIds | 같은 마스터에 있는 번들 ID 배열 |
| createdAt / updatedAt | 실제 편집 날짜 YYYY-MM-DD 또는null; 감사일·파일 수정시각으로 대신하지 않음 |
| keywordSources | 본문 검색어의 chapterId·heading 근거 배열 |
| highlights | 선택 필드 string[]; 없거나[]이면 실제 목차에서 주요 주제4개 표시 |
| whyItMatters | 선택 필드 string 또는null; 없으면 장비명·기존 설명으로 기본 활용 이유 표시 |

생성 데이터에는 `chapters`와 `chapterCount`가 추가된다. 실제 HTML에서 추출한 값이며 마스터에서 이중으로 관리하지 않는다. 전체 chapterCount는2,087이다.

## 6. 상세 정보와 호환 API

브라우저의 목록·검색·필터·상세 정보는 `window.BluegeeLibrary`를 함께 사용한다.

```javascript
window.BluegeeLibrary.search({ query: '니브 프리앰프' });
window.BluegeeLibrary.search({ category: 'microphone' });
window.BluegeeLibrary.search({ brand: 'Neve', equipmentType: 'Preamp / EQ' });
window.BluegeeLibrary.getProductDetail('audio-050');
window.BluegeeLibrary.getProductDetail('050');
window.BluegeeLibrary.getProductDetail('050-neumann-u-47');
window.BluegeeLibrary.facets.brands;
window.BluegeeLibrary.facets.equipmentTypes;
```

상세 조회는 상품 필드·실제 목차·카테고리·시리즈·관련 상품·같은 브랜드·포함 번들과 주요 주제·활용 이유·이전/다음 상품을 반환한다. 상품 소개 화면은 `product.html?id=audio-050`처럼 접근하며 동일 조회 결과를 사용한다. 화면에는 번들 판매·자동 추천·개인화 기능을 표시하지 않는다.

목록의 제목은 상세 소개 화면으로 연결하고 기존 ‘읽기’는 원본 HTML로 바로 연결한다. 소개 화면의 목차 링크도 `htmlPath#chapterId`로 원래 장을 연다. 이전/다음은 공개 상품 전체의 번호순이며 처음/끝에서 순환하지 않는다. 목록 복귀에는 `q`, `category`만 전달하므로 외부 복귀 URL을 넣을 수 없다. 없는 상품은 안내 화면과 목록 링크를 표시한다.

`dist/products.json`도 동일한 마스터의 생성 결과다. 향후 상세 페이지나 다른 도구에서 읽을 수 있다. `window.BLUEGEE_CATALOG`는 기존 코드가 기대하는 number 기반 ID와 url/chapter 구조를 생성하는 호환 어댑터다. `reader.html?id=002&chapter=tab-history`는 이전과 같이 동작한다.

## 7. 번들은 고정 구성입니다

현재 번들은 planned 상태이며 결제 가능한 상품이 아니다.

- classic-50-v4-ko:001–050.
- deep-dive-10-v4-ko:051–060.
- microphone-20-v4-ko:061–080.
- complete-80-v4-ko:001–080.

081을 추가해도 기존 Complete80에 자동으로 넣지 않는다. 새 상품의 bundleIds는 우선[]로 둘 수 있다. 새 상품을 새 번들에 포함시키기로 결정했다면 같은 마스터 파일의 번들 productIds와 상품 bundleIds를 함께 갱신한다. 검증기가 두 방향의 구성 일치를 확인한다. 기존80종 번들의 이름과 구매 범위를 조용히 바꾸지 않는다.

## 8. 향후 Supabase migration 방향 — 연결하지 않음

현재는 정적 마스터가 원본이다. 이번에 Supabase·사용자·구매·권한 저장을 만들지 않았다. 향후 이전할 때 다음과 같이 나눈다.

| 테이블 | 이전 방향 |
|---|---|
| products | 현재 상품 필드; canonical ID를 안정 키로 보존; number/slug/htmlPath unique |
| bundles | 번들 id·title·status와 출시 당시 구성/판본 |
| bundle_products | bundles와products의 구성 관계; productIds/bundleIds를 관계로 정규화 |
| product_relations | relatedIds와 관계 유형·편집 근거 |
| product_assets | HTML/PDF/커버의 파일 경로·언어·판본·검수 상태; 없으면null/미등록 |
| users | 향후 실제 로그인 계정; 지금 파일이나 가짜 사용자로 생성하지 않음 |
| purchases | 실제 주문·오퍼·판본·번들 구성 스냅샷; 현재planned 번들에 구매 기록을 만들지 않음 |
| entitlements | 검증된 구매의 상품·판본·Asset·라이선스 범위; 프런트엔드 값만으로 권한 부여하지 않음 |

keywords는 text[] 또는 별도 태그 관계로, 날짜 null은 그대로 null로 이전할 수 있다. 복수 브랜드 문자열은 검토 후 brand 관계로 분리하되 역사적 계보를 동일 제조사로 단정하지 않는다. HTML 파일명과 공개 URL은 DB 이전과 독립적으로 보존한다.

마이그레이션 때 기존80+개 ID·URL·분류·번들 구성이 일치하는지 검증하고, 어느 시점부터 DB가 원본이 되는지 명시한다. JSON과 DB를 동시에 수동 편집하는 두 원본 구조는 만들지 않는다.

## 9. 이번 검증 범위

80개 실제 상세 화면·읽기 URL·2,087개 공통 목차, 기존 reader 호환, 제목·브랜드·분류·검색어 검색, All/49/10/21 필터, 검색 결과→소개→목록 상태 복원, 이전/다음·관련 링크·목차에서 원문 진입을 검사했다. 홈320/390/768/1440px, 대표 상세5종의 같은4폭에서 목차 펼침/접힘까지 확인했다. ESLint, TypeScript 검사, JSON/파일 검증, 빌드와 생성 결과 일치 검사,9개 테스트 및 브라우저 회귀 검사를 통과했다.

이번 단계 변경 파일과 화면 구조·검증 근거는 [PRODUCT_DETAIL_IMPLEMENTATION.md](PRODUCT_DETAIL_IMPLEMENTATION.md), 실제 브라우저 검사 결과는 `audit/product-detail/browser-verification.json`에 기록했다. 앞선 P0 감사와 검증 파일은 보존했다.

기존 감사에서 확인한 외부 참고 링크·숨겨진001참조·072의 좁은 화면 표 문제 등은 P0-1의 범위 밖이다. 기존 가이드 본문과 파일은 바꾸지 않았으므로 해당 감사 항목을 해결했다고 표시하지 않는다. 새 카탈로그의80개 자료 열기 링크에는 깨짐이 없다.

## Auth 1단계와 상품 추가

상품 원본과 추가 절차는 그대로다. 로그인은 상품 수·검색·분류·원본 URL을 바꾸지 않으며 로그인하지 않아도 공개 가이드를 읽을 수 있다. 빌드는 기존 카탈로그 8개에 로그인/SDK/스타일/공개 설정 4개를 더한 12개 파일을 생성한다. `dist/auth-config.js`는 Git에서 제외한 빌드 생성물이고 직접 수정하지 않는다. SDK 연결값은 상품 마스터에 넣지 않는다. 설정과 테스트 방법은 [AUTH_IMPLEMENTATION.md](AUTH_IMPLEMENTATION.md)를 따른다.

**현재 Auth는 사용자 식별만 제공하며 public static guides의 보안 접근통제는 제공하지 않는다.**
# U47 보호 파일럿 유지관리

`audio-050`만 마스터의 `access:"entitlement"`를 사용한다. 기존 27개 장의 제목·ID를 `chapters` 필드로 보존하고 URL·분류·시리즈는 변경하지 않는다. 다른 상품의 신규 등록 절차는 기존 방법을 따른다.

보호 상품의 전체 원문을 `dist/`, root `guides/`, JSON, migration, 테스트 fixture나 Git에 넣지 않는다. `npm run build`가 잠금 화면을 생성한다. 현재 파일럿 외의 상품을 entitlement로 바꾸면 빌드가 실패한다. 원문 업데이트는 관리자가 private DB 자산과 SHA-256/바이트 수를 함께 갱신하고, 목차가 바뀔 때만 마스터와 root 잠금 사본을 함께 재생성한다. 상세 절차와 grant/확장 경계는 [ENTITLEMENT_IMPLEMENTATION.md](ENTITLEMENT_IMPLEMENTATION.md)를 따른다.
