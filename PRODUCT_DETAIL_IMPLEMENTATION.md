# 상품 상세 소개 화면 구현 기록

작성일: 2026-10-01. 범위는 상품 소개 화면과 기존 목록의 진입 링크, 동일 마스터의 관련 관계, 검증·문서 갱신이다. 결제·회원·즐겨찾기·자동 추천·판매 기능은 구현하지 않았다. GitHub push와 Vercel 배포도 하지 않았다.

## 1. 진입 구조

목록의 **제품명**을 클릭하면 `product.html?id=audio-050`처럼 공통 소개 화면을 연다. 기존 **읽기**는 원래 `htmlPath`로 바로 연결된다. 소개 화면의 원본 읽기와 목차도 기존 HTML 및 `#chapterId`를 사용한다. 원본을 iframe이나 별도 독서 목차로 감싸지 않는다.

단일 `product.html`과 공통 JavaScript가 요청한 상품을 조회하므로 상품마다 HTML 화면이나 데이터를 복제하지 않는다. `content/products.json` → 검증·빌드 → `dist/catalog.js` → 동일 `createCatalog().getProductDetail()` 흐름이다. 원본 문서의 실제 목차는 빌드에서 추출하고 마스터에 다시 입력하지 않는다.

카테고리와 검색어가 있는 목록에서는 해당 `category`, `q`를 상세·이전/다음·관련 링크에도 전달한다. 목록 복귀는 이 두 값으로만 `index.html`을 구성한다. 외부 복귀 URL을 받지 않는다. 이전/다음은 공개 상품 전체의 번호순이고 경계에서 순환하지 않는다. 없는 ID나 공개하지 않은 상품에는 안내 화면과 목록 복귀를 제공한다.

## 2. 상세 화면 구성

| 섹션 | 데이터 및 동작 |
|---|---|
| 상단 소개 | 번호, 제품명, 시리즈, 짧은 소개, 브랜드, 카테고리, 장비 종류 |
| 주요 특징과 다루는 내용 | 마스터의 선택 highlights 또는 실제 목차의 주제4개 |
| 알아두면 좋은 이유 | 마스터의 선택 whyItMatters 또는 제품명·기존 설명을 이용한 공통 안내 |
| 원본 읽기 | 실제 htmlPath; pdfPath가 제공될 때만 PDF 열기 표시 |
| 핵심 키워드 | 같은 상품의 keywords 전체 |
| 목차 | 실제 chapters와 장 수; 펼침/접힘; 선택 시 원본 해당 장 |
| 관련 가이드 | relatedIds로 명시한 공개 상품만; 없으면 미등록 안내 |
| 이동 | 이전/다음 번호순 상품과 위·아래 목록 복귀 |

기존 색상·타이포그래피·헤더·푸터를 사용하고 상세 CSS를 추가했다. 데스크톱은 본문과 작은 읽기 안내를 나란히, 모바일은 한 열로 배치한다. 긴 목차는 기본적으로 접어서 정보를 순서대로 읽게 했다. 커버 이미지·가격·가짜 PDF 링크·상품별 성능 점수를 만들지 않았다.

주요 특징의 기본값은 원문의 주제 소개이며 하드웨어의 실측 성능을 단정하지 않는다. 본문 기술 주장 전량의 검수와 별개다. 기존 감사의 외부 출처·원문 품질 문제를 이번 화면 구현에서 해결했다고 표시하지 않는다.

## 3. 마스터 데이터 변경

80개 상품의 ID·번호·제목·slug·category·series·HTML 경로는 그대로다. **050 U47의 category=microphone, series=classic-studio-gear를 유지했다.** 현재 탐색 수량은 Outboard49 / Deep Dive10 / Microphone21이고 목차는2,087개다.

선택 필드 `highlights: string[]`, `whyItMatters: string | null`을 JSON Schema와 타입에 추가했다. 기존80개에는 이 문장을 임의로 채우지 않았으며 원본 목차와 기존 설명을 사용한다. 새 상품도 필드를 생략해도 소개 화면이 동작한다.

관련 자료는 기존 인벤토리의 기본편/심층편과 실제 제목의 모델·계열을 대조해10개 묶음,25개 상품에 명시했다. Pultec001/055, LA-2A002/052, 1176 003/039/051, Fairchild004/059, Neve008/032/033/053, API EQ009/035/056, SSL010/019/054, Variable Mu017/058, Distressor021/057, U47 050/068이다. U47과U47fet는 별도 모델의 계열 관련 자료이며 같은 장비로 합치지 않았다. 검토 근거는 `audit/product-detail/related-links-review.json`에 남겼다. 관련 관계의 운영 원본은 products.json뿐이다.

## 4. 이번 단계 변경 파일

### 신규 소스

- `src/product.template.html`: 공통 상세 화면 구조.
- `src/product.js`: 동일 마스터 조회, 안전한 텍스트 표시, 원문·목차·관련·이전/다음·목록 연결.
- `src/product.css`: 기존 디자인을 따르는 상세 화면 전용 반응형 스타일.

### 수정 소스와 데이터

- `content/products.json`: 검토한 relatedIds만 추가.
- `content/products.schema.json`: 선택 소개 필드 규칙 추가.
- `src/catalog-core.js`: 상세 주제·활용 이유·이전/다음, 공통 목록/상세 URL 생성.
- `src/catalog-types.d.ts`, `src/globals.d.ts`: 상세 데이터와 브라우저 API 타입.
- `src/app.js`: 제목은 소개로, 읽기는 기존 원문으로 연결.
- `scripts/catalog-data.cjs`: 상세 공통 HTML/JS/CSS 생성 추가.
- `tests/catalog.test.cjs`, `tests/e2e/catalog-browser.cjs`: 상세 화면·마스터 추가·검색 복귀·기존 독서 회귀 검사.

### 생성 결과

`dist/product.html`, `dist/product.js`, `dist/product.css`를 추가했다. `dist/app.js`, `dist/catalog-core.js`, `dist/catalog.js`, `dist/products.json`은 같은 마스터에서 다시 생성했다. 이번 단계에서 홈 템플릿과 생성된 index.html, 원래 styles.css, reader.html, reader.js 및 모든 원본 가이드의 바이트는 바뀌지 않았다.

### 문서와 근거

`CATALOG_MAINTENANCE.md`를 최신 절차로 갱신했다. 앞선 감사·인벤토리·번들·로드맵 문서는 원래 내용을 보존하고 이번 단계 기록을 덧붙였다. 검증 결과·화면 캡처·기존 파일 해시는 `audit/product-detail/`에 별도로 보관한다. 이전 `audit/p0-catalog/` 기록은 보존했다.

## 5. 검증 결과

- 전체80개 상세 화면: 제목·번호·브랜드·분류·장비 종류·설명·키워드·특징·활용 이유·목차·이전/다음·관련 링크 일치.
- 검색 결과에서 소개 진입, 이전/다음 이동, 원본 읽기, 목록의 검색어·카테고리 복원 정상.
- 80개 기존 가이드 HTTP200, 원본2,087장 모두 실제 선택 가능, 소개의 목차 링크2,087개 일치. 신규 연결에서 깨진 가이드 링크0건.
- All/49/10/21 필터,11가지 검색, 기존 reader 호환·읽음 표시 정상.
- 대표001/050/060/061/080의320/390/768/1440px에서 목차 접힘/펼침20개 검사: 가로 넘침 없음. 실제 화면 캡처 확인.
- 격리한 임시081: 마스터에 한 상품 추가와 같은 빌드만으로 목록81·아웃보드50·검색1·실제 상세 화면·이전/다음·목록 복귀·원본 읽기 정상. 선택 소개 필드의 문자열도 HTML로 실행되지 않음. 목차·브랜드·짧은 설명이 없는 상태 정상. 테스트 파일은 제거했고 실제 마스터는80개 유지.
- lint, typecheck, validate, build, build:check, 기존7개를 포함한9개 테스트와 실제 브라우저 회귀 통과.
- 기존 가이드80개와 기존 디자인/reader 파일의 SHA-256 보존 검사 통과.

자세한 브라우저 결과는 `audit/product-detail/browser-verification.json`, 보존 비교는 `audit/product-detail/implementation-verification.json`이다.

## 6. 유지관리와 제한

081 이후에도 실제 HTML 파일을 추가하고 **products.json에 상품 객체 하나**를 넣은 뒤 `npm.cmd run build`한다. 새 화면 파일·라우트·상품별 코드는 추가하지 않는다. `product.html?id=audio-081`에서 확인한다. 소개 문장을 다듬거나 관련 링크를 연결할 때도 같은 상품 객체만 수정한다. 정확한 초보자용 절차는 [CATALOG_MAINTENANCE.md](CATALOG_MAINTENANCE.md)를 따른다.

현재 소개는 정적 공통 페이지의 JavaScript 렌더링이다. 서버가 생성한 상품별 OG/canonical이나 검색엔진용 별도 정적 페이지를 이번 단계에 만들지 않았다. 배포 설정 변경도 하지 않았다. 향후 SEO 단계에서 동일 마스터 기반으로 설계할 수 있다.

Supabase 이전 시 선택 소개 필드는 products의 배열/nullable text로, relatedIds는 product_relations로 옮길 수 있다. 목차는 계속 원본 파일에서 추출할 수 있다. JSON과 DB를 동시에 수동 편집하는 구조는 만들지 않는다.

다음 구현 후보 하나는 **브랜드 필터 UI**다. 이미 준비된 브랜드 facets와 조회 API를 연결해 장비 탐색을 보완할 수 있다. 이번에는 구현하지 않는다.
