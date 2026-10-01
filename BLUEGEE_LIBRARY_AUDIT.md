# BlueGEE Audio Library — 프로젝트 감사

감사일: 2026-10-01 (KST). 대상: `C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site` 및 [Vercel 배포본](https://bluegee-library-site.vercel.app/).

## 결론과 작업 범위

현재 프로젝트는 80종의 오디오 엔지니어링 HTML 가이드를 제공하는 정적 라이브러리다. AI 교육 사이트로 분류하지 않는다. 전문 오디오 지식상품 라이브러리, 판매 허브, BlueGEE Audio의 브랜드 자산으로 발전시키는 것이 이번 설계의 기준이다.

80개 등록, 파일, 번호, 현재 목차와 배포 연결은 정상이다. 큰 문제는 파일 누락보다 상품 정보·탐색용 메타데이터·판매 구성의 부재다. 기존 독서 화면은 유지할 가치가 있다. 시리즈와 장비 분류를 먼저 분리하고, 하나의 상품 메타데이터에서 목록·검색·상세·번들을 생성하도록 설계하는 것을 권한다.

이번 작업은 감사 및 문서·인벤토리 생성으로 한정했다. 기존 가이드 삭제, 운영 HTML/CSS/JS 수정, URL 변경, UI 리팩터링, PDF 생성, 로그인·결제·AI API·Supabase 연결, Git push 및 배포를 수행하지 않았다. 감사 JSON은 `audit/`에 있으며 운영 `dist/`에서 참조하지 않는다.

전체 80개 소스의 등록 정보, 제목, 목차, HTML 구조, 내부 참조와 배포 응답을 검사했다. 본문과 정정 구조는 대표 문서 및 관련 구간을 읽었다. 모든 역사·회로·세팅 수치를 사실 검증한 콘텐츠 인증은 아니다. 외부 URL 전체에 HEAD 요청을 시도했으며 일부만 GET으로 재확인했다. 접근 차단을 링크 오류로 단정하지 않았다. 브라우저 검사는 Windows Edge 기반이며 실제 iOS Safari, 스크린리더 및 실사용 Core Web Vitals 검사는 포함하지 않는다.

## 1. 현재 파일 구조

```text
bluegee-library-site/
├─ .git/                         로컬 Git 저장소; remote 미등록
├─ .gitignore                    node_modules, Sites runtime, 압축본 제외
├─ .openai/hosting.json           이전 Sites 정적 배포 설정: dist
├─ dist/                         현재 운영 정적 파일 86개
│  ├─ index.html                 홈 / 카테고리 / 검색 UI
│  ├─ app.js                     목록 렌더링 / 필터 / 검색
│  ├─ styles.css                  홈 스타일 / 반응형
│  ├─ catalog.js                  80종 메타데이터 + 전체 목차
│  ├─ reader.html                 이전 reader 링크 호환 진입점
│  ├─ reader.js                   실제 가이드 URL로 리다이렉트
│  └─ guides/
│     ├─ outboard/               49개
│     ├─ deep-dive/              10개
│     └─ microphone/             21개: 050 + 061–080
├─ BLUEGEE_LIBRARY_AUDIT.md       이번 감사
├─ AUDIO_CONTENT_INVENTORY.md     80종 전수 인벤토리
├─ PRODUCT_BUNDLE_PLAN.md         상품 / 번들 / 판본 / 라이선스 설계
├─ LIBRARY_PLATFORM_ROADMAP.md    단계별 계획과 데이터 모델
└─ audit/                        비운영 감사 데이터 / 검증 근거
```

프로젝트 밖의 작업 폴더에는 80개 원본 HTML 사본과 이전 정비 근거가 있다. 현재 사이트의 공개 자료 수에는 기획 문서 097–100이나 다른 AI 자료를 포함하지 않았다. `dist/guides` 80개는 작업 폴더의 대응 원본 80개와 SHA-256이 모두 일치한다.

`package.json`, 빌드 스크립트, `vercel.json`, README, CI, sitemap, robots 파일은 현재 운영 프로젝트에 없다. 정적 파일만으로 읽기 서비스를 운영할 수는 있으나 추가 자료를 일관되게 등록·검증하는 제작 절차는 코드화돼 있지 않다.

## 2. 전수 연결 및 콘텐츠 구조 검사

| 항목 | 확인 결과 |
|---|---|
| 등록 자료 / 실제 가이드 HTML | 80 / 80 |
| 번호 범위 | 001–080, 빠진 번호 0 |
| 카탈로그 번호 / URL 중복 | 0 / 0 |
| 동일한 파일 내용의 중복 | 0 |
| 파일명과 URL의 파일명 일치 | 80/80 |
| 문서 config 번호 / 제목 / 목차와 카탈로그 일치 | 각각 80/80 |
| 등록 목차 ID 존재 / 전체 중복 ID | 2,087개 존재 / 중복 0 |
| 배포 가이드 HTTP 응답 | 80/80 HTTP 200 |
| 배포 가이드와 로컬 내용 일치 | 80/80; CRLF/LF 차이는 정규화 |
| 운영 86개 파일 배포 응답 / 내용 일치 | 86/86 HTTP 200 및 일치 |
| 로컬 href/src 참조 검사 | 11,129건 |
| 로컬 파일 대상 누락 | 0 |
| 존재하지 않는 내부 fragment 참조 | 3건, 모두 001의 `#tab-bluegee` |

001의 잔존 3건은 예전 목차 및 장별 이전/다음 UI에 있다. 현재 공통 독서 UI에서 모두 숨겨져 있으며 전 장을 순회해도 표시되지 않았다. **현재 이용자가 사용하는 2,087개 공통 목차의 깨짐과 구분해야 한다.** 후속 정비에서는 숨겨진 오래된 참조를 정리하되 공개 80개 파일 URL과 유효 목차 ID는 보존한다.

이전 검증에서는 배포 80개 가이드의 2,087개 장 선택, 공통 목차 1개, iframe 0개, 다운로드 속성 0개, JavaScript 오류 0개를 확인했다. 이번 감사에서도 80개 초기 화면에 JS 오류가 없고 `reader.html?id=002&chapter=tab-history`가 원래 002 문서와 해당 장으로 정상 이동한다.

같은 장비의 기본 안내·리비전 해설은 파일 중복이 아니다. 예를 들어 003/039/051은 1176, 002/052는 LA-2A, 008/032/033/053은 Neve 계보를 서로 다른 범위로 다룬다. 상품 설명에 기본편·계열편·심층편의 범위를 적어 중복 구매 오해를 줄여야 한다.

근거: [static-audit.json](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/audit/static-audit.json>), [browser-audit.json](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/audit/browser-audit.json>), [followup-audit.json](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/audit/followup-audit.json>), [audio-content-inventory.json](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/audit/audio-content-inventory.json>). 전 장 기능 검증 근거는 작업 폴더 `_maintenance/2026-10-01-product-cleanup/vercel-verification.json`에 있다.

## 3. 번호 시리즈와 현재 탐색 카테고리

| 구분 기준 | Classic / 아웃보드 | Deep Dive | Microphone | 합계 |
|---|---:|---:|---:|---:|
| 요청한 번호 시리즈 | 001–050: **50** | 051–060: **10** | 061–080: **20** | 80 |
| 현재 장비 탐색 분류 | 아웃보드 **49** | 딥다이브 **10** | 마이크 **21** | 80 |

차이는 **050 Neumann U 47** 한 개다. 현재 마이크 폴더·필터에 놓인 것은 사용자의 기존 분류 결정과 일치한다. 이를 아웃보드 폴더로 이동하거나 마이크에서 빼서 숫자를 맞추는 것은 권하지 않는다.

`series=classic-studio-gear`, `equipmentCategory=microphone`, `equipmentType=tube-condenser`를 함께 기록한다. 판매 시리즈 Classic Gear 50은 001–050이고, Microphone 20은 061–080이다. 사이트의 ‘마이크 전체 21종’과 번들의 ‘Microphone Master Library 20종’을 별도 라벨로 설명한다. 현재 `category=deep-dive`는 실제 장비 종류가 아니라 문서 성격이므로 장비 종류 필터를 위해서는 `equipmentType`을 별도로 둬야 한다.

## 4. 홈 / 상세 / 미리보기와 판매 전환

홈은 제목, 한 줄 설명, 장비 종류, 현재 카테고리, 장 수를 중간 크기의 목록으로 보여 준다. 거대한 배너 없이 80종을 탐색하는 현재 밀도는 유지하는 편이 적절하다. 작은 상품 상태·시리즈·용도 정보만 보강해도 구조 개선이 가능하다.

현재 제목과 ‘읽기’ 버튼은 **바로 전체 HTML 본문**을 연다. 상품 소개 페이지, 상품 커버, 편집 범위·대상 독자·판본·선별 미리보기·관련 상품·PDF 다운로드 상품 정보가 없다. 안내서 첫 장은 본문 소개이지 판매용 Product Detail이 아니다. PDF는 운영 파일에 없고 홈에도 ‘PDF 판은 추후 제공’이라고 표시된다.

본문의 장점은 역사·회로·모델/리비전·소스별 시작 설정·청취 비교·작업 기록을 묶은 깊이와 상호작용이다. 왼쪽 어두운 내부 목차, 장 이동, 장내 검색, 로컬 읽음 표시를 유지한다. 기존 상단 탭 UI와 옛 스크립트 일부는 숨긴 상태로 남아 있어서 유지보수 시 의존성을 먼저 확인해야 한다.

판매 전환 병목은 ‘이 상품에 무엇이 들어 있는가 / 기존 기본편과 무엇이 다른가 / 어떤 형식·버전·사용 범위를 받는가’를 설명하는 단계가 없다는 점이다. 유료 파일·판매 포맷이 만들어지기 전에는 구매나 PDF 다운로드 버튼을 활성화하지 않는다. 현재 공개 HTML v4 전체가 이미 제공되므로, 이를 제한된 미리보기나 새 유료 잠금 상품이라고 표현해서는 안 된다. 후속 유료 가치로 편집·검수된 PDF, 오프라인 패키지, 판본별 업데이트와 이용 범위를 명확하게 설계한다.

## 5. 검색 / 필터 재현 결과

| 입력 | 현재 결과 |
|---|---|
| 전체 | 80개 |
| LA-2A / la2a | 각각 002, 052: 2개 |
| Neve | 008, 016, 023, 032, 033, 053: 6개 |
| 마이크 | 050 + 061–080: 21개 |
| 보컬용 진공관 마이크 | 0개 |
| 록드럼 컴프레서 | 0개 |
| Neve 계열 프리앰프 | 0개 |

현재 검색은 번호·제목·kind·짧은 설명·카테고리명에 대해 공백과 기호를 제거한 하나의 부분 문자열을 찾는다. 하이픈 유무에는 잘 대응하지만 다중 키워드·한국어 제조사 별칭·용도·원리·모델 계보의 교집합을 해석하지 않는다. 80개 본문 전체 검색도 아니다.

필터는 현재 카테고리 하나만 지원한다. 브랜드·장비 종류·용도·번호 시리즈 선택은 없다. 검색어는 URL에 저장하지 않아 새로고침하면 초기화되고, 상단 주 메뉴의 `aria-current`는 마이크 필터 선택 후에도 ‘라이브러리’에 남는다. 본문 검색은 해당 가이드의 장 텍스트로 목차를 거르지만 하이라이트나 전역 검색 결과·상품 추천은 제공하지 않는다.

AI API 없이 목적·브랜드 별칭 사전과 구조화된 태그, 키워드 교집합으로 첫 목적 검색을 구현할 수 있다. ‘록’은 장르 근거가 확인된 가이드에만 부여하고, 현재 제목에서 임의로 장르나 마이크 음색 순위를 만들어서는 안 된다.

## 6. 모바일 / 접근성

이번에는 홈과 80개 가이드 초기 화면을 **320 / 390 / 768 / 1440px**에서 검사했다. 홈은 모두 문서 전체 가로 넘침이 없다. 초기 화면에서는 072만 320px에서 331px까지 넘쳤다. 072를 전 장 검사하면 `overview`, `history`, `capsule`, `pattern`, `response`, `brass`, `sessions`, `compare`, `quick`의 9개 장이 320px에서 넘치며 주 원인은 표와 카드의 최소 폭이다. 최대 관찰 문서 폭은 약 514px이다. 표 내부만 스크롤하도록 후속 보강한다. 002는 전 장을 320/390/768px에서 확인했고 문서 가로 넘침이 없다. 이번 검사로 80개 모든 장의 모든 폭을 보증하지는 않는다.

모바일 목차 열기, 장 선택 후 닫힘과 해시 이동은 동작한다. 검색창은 모바일 헤더에 있어서 Escape 후 포커스가 검색창에 남는 것은 정상이다. 그러나 **목차 링크를 키보드로 선택한 뒤에는 닫힌, 화면 밖의 링크에 포커스가 남는다.** 002 재현에서 링크 좌표는 x=-286px이며 닫힌 목차에 `inert` / `aria-hidden` 처리가 없다. 장 선택 후 본문 제목 또는 목차 버튼으로 포커스를 이동하고, 닫힌 목차를 키보드 탐색에서 제외하는 보강이 필요하다. 데스크톱에서는 목차에 계속 접근할 수 있도록 반응형 상태를 구분한다.

홈의 skip link, 검색 label, main/nav landmark, focus-visible, reduced-motion 대응은 장점이다. 홈의 작은 번호 텍스트 `#7d8998`, 13px, 흰 바탕 대비는 약 **3.56:1**이다. 일반 작은 텍스트의 4.5:1 기준에 미달하므로 후속 색상 조정 대상이다. [WCAG 텍스트 대비 기준](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

초기 화면의 입력 label 검사에서 누락은 없었다. 단, 숨겨진 모든 계산기·확장된 세션 양식 및 SVG 설명을 전수 접근성 인증한 것은 아니다. 72개 소스는 H1이 여러 개지만 초기 화면에 보이는 H1은 79개 문서에서 하나, 1개 문서에서 0개다. 9개 문서에는 main 요소가 두 개 있다. 단순 개수로 SEO 실패를 단정하지 않고 공통 읽기 구조로 정비할 때 대표 heading과 landmark를 명확하게 정리한다. 작은 터치 영역은 24px 최소 및 예외·간격을 함께 확인해야 한다. [WCAG 대상 크기 기준](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

## 7. SEO / 공유 / 성능

80개 문서에 제목, description, `lang=ko`, viewport가 있다. 설명 문구는 정상이며 파일에서 깨진 한글은 발견하지 않았다. 처음 콘솔에서 보인 깨짐은 출력 인코딩 때문이어서 파일 결함으로 집계하지 않았다.

80개 가이드의 canonical / Open Graph / JSON-LD는 모두 0개다. 배포 `/sitemap.xml`과 `/robots.txt`는 404다. robots 부재 자체가 크롤링 차단을 뜻하지는 않는다. 홈 원본 HTML에는 가이드 링크가 0개이며 JavaScript 비활성화 브라우저도 0개를 표시한다. Google은 JS 렌더링이 가능하므로 ‘검색엔진이 절대로 못 읽는다’고 단정할 수는 없다. 정적 목록 링크 생성, sitemap, 일관된 canonical, 개별 제목·설명과 공유 메타데이터를 권한다. [Google JavaScript SEO 문서](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).

기존 `#chapter`는 문서 안의 목차 주소로 보존한다. 모든 장을 각각 독립 상품 URL로 바꾸지 않는다. 향후 상품 소개는 `/products/audio-002/`처럼 별도 실제 HTML 경로를 추가하고, 원래 `/guides/...html#tab-history`는 그대로 유지한다. Product structured data의 가격·재고·오퍼는 실제로 판매 가능한 상태가 된 뒤 실제 값으로 제공한다.

운영 파일 전체는 약 **16.24MB**지만 이를 홈 방문 한 번에 모두 다운로드하는 것은 아니다. 홈 catalog.js는 약 **156KB**, 전체 2,087개 목차를 포함한다. 가장 큰 문서는 050 약342KB, 009 약290KB다. 80개 문서 안 script는 합계 약1.71MB, style은 약3.04MB이며 공통 셸과 옛 UI 코드를 각 문서에 보유한다. 별도 캐시 가능한 공통 자원 분리는 이후 회귀 검증을 전제로 검토한다. 독립 HTML 오프라인 판매 패키지는 별도 산출물로 유지할 수 있다.

Vercel 홈은 `content-encoding: br`, `x-vercel-cache: HIT`, `cache-control: public, max-age=0, must-revalidate`를 반환했다. 압축과 정적 CDN 전달은 이미 있다. 실험용 네트워크/CPU 제한에서 약21–24초가 관찰됐으나, 별도 확인에서 첫 요청이 requestStart 이전 약20.8초 지연되고 같은 연결의 다음 문서들은 응답 시작 약7–8ms, load 약78–544ms였다. **측정 환경의 연결 지연 영향이 커서 이 값으로 실사용 성능 실패나 성능 점수를 단정하지 않는다.** 표본값은 근거 JSON에 보존했다. 추후 동일 환경에서 반복 측정하고 실제 사용자 LCP/INP/CLS의 75백분위수를 확보해야 한다. [Web Vitals 측정 안내](https://web.dev/articles/vitals).

## 8. 외부 참고 링크

외부 href/src 주소는 560개이며 그중 고유 외부 앵커 링크는 556개다. 리소스 힌트 등도 전체 집계에 포함된다. HEAD 결과는 아래와 같다.

| HEAD 응답 | 주소 수 | 해석 |
|---|---:|---|
| 200 | 350 | 요청 응답 정상; 내용의 근거 적합성까지 보증하지 않음 |
| 403 | 76 | 접근 차단; 깨짐 확정 불가 |
| 404 | 65 | 재확인 필요; 리소스 힌트의 기본 도메인 요청도 포함 |
| 405 | 16 | HEAD 미지원 가능; GET 재확인 필요 |
| 410 | 39 | 재확인 필요 |
| 네트워크 오류 | 14 | 제한 / 시간 초과 등; 깨짐 확정 불가 |

104개의 HEAD 404/410을 모두 깨진 출처로 확정하지 않았다. 6개 주소를 GET 재확인한 결과 API의 `product.php?id=106`, API의 `/product/2520-op-amp/`, Chandler의 `/documentation/`는 404 페이지이고 Sound On Sound의 `/reviews/manley-variable-mu`는 410 페이지였다. UA LA-2A 제품 주소와 Softube FET Compressor Mk II 매뉴얼은 HEAD와 달리 GET 200으로 정상이다. 이 차이 때문에 상태 기반 자동 삭제를 권하지 않는다.

후속 작업은 가이드별 출처 URL·제목·모델/리비전·확인일·HTTP 확인 방법을 기록하고, 공식 현재 주소를 찾은 뒤 인용 문장과 맞는 자료인지 대조하는 것이다. 외부 링크 복구와 기술 내용 사실 검증은 별도 완료 기준으로 둔다. 근거: [external-link-audit.json](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/audit/external-link-audit.json>), [confirmed-observations.json](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/audit/confirmed-observations.json>).

## 9. Vercel / GitHub 배포 구조

공개 주소에서 정적 홈과 80개 실제 HTML 경로가 모두 동작한다. 없는 경로는 정상 404이며 `.openai/hosting.json`도 공개 주소에서는 404다. 로컬 `.openai/hosting.json`은 이전 Sites 배포 정보이지 Vercel 설정이 아니다.

현재 로컬 Git에는 remote가 등록돼 있지 않다. 사용자 업로드 방식과 배포 결과에 따르면 `dist` 내용이 GitHub 저장소의 루트에 올라간 상태로 보인다. **GitHub 저장소 URL·실제 파일 트리·Vercel 대시보드의 Framework / Root / Build / Output 설정은 계정 접근으로 확인하지 못했다.** 이를 확정 설정값으로 작성하지 않는다.

후속 권장 형태는 소스, 메타데이터, 생성 스크립트, 문서를 저장소에 두고 정적 산출물 `dist/`만 공개하는 방식이다. 정적 사이트의 Vercel Root/Output 및 빌드 명령은 실제 저장소 구조를 확인해 맞춘다. 감사 문서·내부 JSON을 운영 웹 루트로 그대로 올리지 않는다. [Vercel 빌드 설정 안내](https://vercel.com/docs/builds/configure-a-build).

## 10. 가장 큰 문제 10개

1. **시리즈와 장비 분류가 하나로 섞임:** 50/10/20 판매 구성과 49/10/21 탐색 숫자의 차이를 설명할 필드가 없다. 050이 핵심 예외다.
2. **상품 메타데이터의 단일 원천 부재:** 브랜드·용도·판본·제공 형식·연관 관계가 없고 홈 수량은 HTML에 수동 기입된다.
3. **목적 검색과 세부 필터 부재:** 실제 목적형 질문 세 가지가 모두 0개다.
4. **상품 상세·선별 미리보기 부재:** ‘읽기’가 전체 본문으로 직행하고 독자가 구매 범위를 판단할 정보가 없다.
5. **PDF/HTML 상품 상태와 버전 모델 부재:** PDF 파일이 없으며 공개 HTML과 유료 패키지의 제공 차이를 정의하지 않았다.
6. **번들 구성과 중복 범위 설명 부재:** 네 번들 및 기본편/리비전편의 차이가 상품 데이터에 없다.
7. **출처 유지·편집 검수 절차 부족:** 실제 GET 404/410 참고 주소, 숨겨진 내부 참조 3건, 일부 단정적 본문 표현을 재검토할 필요가 있다.
8. **모바일·접근성 작은 결함:** 072의 320px 표 넘침, 닫힌 목차 포커스, 홈 번호 대비가 확인됐다.
9. **검색/공유용 정적 정보 부족:** 홈 원본 링크 0, canonical/OG/구조화 데이터 0, sitemap 부재다.
10. **콘텐츠 추가·배포의 재현 절차 부재:** 자동 검증/생성/CI가 없고 GitHub/Vercel 소스 경로가 로컬 저장소와 연결되지 않았다. 숨겨진 이전 UI와 중복 공통 코드도 변경 비용을 높인다.

이 항목은 현재 읽기 서비스가 실패한다는 뜻이 아니다. 판매 허브로 확장하면서 먼저 해결할 구조·신뢰·전환의 병목이다.

## 11. 우선순위와 보존 기준

| 우선순위 | 다음 작업 | 완료 기준 |
|---|---|---|
| P0 — 지금 바로 개선 | 시리즈/분류 분리, 상품 마스터 메타데이터, 자동 카탈로그·수량 생성과 링크 검증, 기본 다중 키워드/별칭 필터 | 80개 동일 URL; 50/10/20과49/10/21 모두 정확; 081 추가 시 콘텐츠+메타데이터만 추가 |
| P0 — 품질 보완 | 확인된 링크의 출처 대조·복구, 숨겨진 잘못된 fragment 정비, 072 좁은 화면/목차 포커스/대비, 정적 홈 링크와 sitemap/canonical | 자료 삭제 없이 연결·접근성 보완; 회귀 기준 충족 |
| P1 — 판매 준비 | 상품 상세/선별 미리보기, 검수된 PDF 파일, 오프라인 HTML 패키지, 네 번들/판본/제공범위/라이선스 설명, 리서치 방법 소개 | 실제 파일·버전·권리 범위와 화면 약속이 일치; 아직 결제 구현 안 함 |
| P2 — 플랫폼 확장 | 검증된 사양 비교, 목적 검색 고도화, 영어판·판본별 업데이트·조직용 라이선스 및 구매 권한·납품 | 검증된 출처와 실제 수요에 따라 선택; 별도 승인 후 구현 |

현재 정상 기능인 전체 80개 읽기,49/10/21 탐색,번호/장비명 검색,내부 어두운 목차 하나,2,087개 유효 장,장 이동·장내 검색·읽음 표시·작업 기록 도구,기존 URL과 reader 호환을 회귀 기준으로 둔다. CSS/JS 일괄 삭제나 외부 흰 독서 목차 추가를 피한다.

첫 구현 기능 하나는 **상품 마스터 메타데이터 기반 자동 카탈로그**다. UI 장식이나 결제보다 먼저 80개 상품의 정체·시리즈·장비 종류·브랜드·용도와 등록 검증을 한 원천으로 관리한다. 이번 작업에서는 그 인벤토리 초안과 계획만 만들었다.

함께 볼 문서: [AUDIO_CONTENT_INVENTORY.md](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/AUDIO_CONTENT_INVENTORY.md>), [PRODUCT_BUNDLE_PLAN.md](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/PRODUCT_BUNDLE_PLAN.md>), [LIBRARY_PLATFORM_ROADMAP.md](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/LIBRARY_PLATFORM_ROADMAP.md>).

## P0-1 구현 기록 — 2026-10-01

이번 추가 기록은 앞의 감사/설계 스냅샷을 보존하면서 실제 구현 상태를 구분한다. 상품 원본은 `content/products.json` 한 파일이며, 현재 정적 HTML·JavaScript 구조에 맞춰 JSON을 선택했다. JSON Schema와 파일·목차·참조 검증을 통과하면 `dist/catalog.js`, `dist/products.json`, `dist/index.html`, `dist/app.js`, `dist/catalog-core.js`를 생성한다. 마스터나 템플릿을 수정한 뒤 `npm run build`를 실행한다. 생성 파일을 직접 수정하지 않는다.

80개 상품의 ID·번호·slug·제목·브랜드·시리즈·category·subcategory·equipmentType·설명·검색어·HTML/PDF/커버·상태·추천·관계·번들·날짜를 관리한다. 확인할 수 없는 PDF·커버·편집 날짜는 null, 미확정 관련 자료는[]다. 번호 기준 시리즈50/10/20과 현재 탐색49/10/21을 분리했다.050U47의 기존 마이크 경로·분류를 보존했다.

현재 홈페이지는 기존 디자인을 유지하면서 브랜드·시리즈만 작은 메타 정보로 표시한다. 제목·브랜드·장비 종류·분류·검색어 검색과 All/카테고리 필터가 마스터에서 동작한다. Brand/Equipment Type은 조회 API와 facets 구조를 준비했다. `getProductDetail`은 같은 데이터로 ID·번호·slug 조회를 지원한다. 새 판매용 상세 화면은 만들지 않았다. 원래 `reader.html?id=002&chapter=tab-history` 호환 어댑터도 생성한다.

실제 브라우저에서80개 자료 링크,2,087개 공통 목차,검색·필터·홈320/390/768/1440px·대표 독서 모바일·읽음 표시를 확인했다. 임시081을 격리된 데이터/폴더에 추가해 전체81·아웃보드50·검색·상세 조회·읽기를 확인한 뒤 제거했다. 최종 마스터는80개다. lint/typecheck/validate/build/build:check와7개 테스트를 통과했다.

원래80개 가이드, styles.css, reader.html, reader.js는 변경하지 않았다. 기존 감사의 외부 출처/숨겨진 옛 참조/072 표·포커스 결함은 이번 구현에서 해결했다고 주장하지 않는다. 로그인·결제·Supabase·AI API·PDF 제작·GitHub push·Vercel 배포를 수행하지 않았다.

신규 추가의 정확한 절차와 스키마,향후products/bundles/users/purchases/entitlements 이전 방향은 [CATALOG_MAINTENANCE.md](CATALOG_MAINTENANCE.md)를 참조한다. 기존 80종 고정 번들은 planned이며,081 추가만으로 Complete80 구성에 자동 편입하지 않는다. JSON과 DB의 이중 원본을 만들지 않고 이전 시점에 원본을 명확하게 전환한다.

다음 구현 후보는 기존 읽기 링크를 보존하는 **상품 상세 소개 화면** 하나다. 이번에는 해당 화면의 데이터 조회 구조까지만 준비했다.

## 상품 상세 소개 화면 구현 기록 — 2026-10-01

앞선 감사와 P0 기록을 보존하고 이번 승인 범위의 완료 상태를 추가한다. 동일 `content/products.json`을 사용하는 `product.html?id=audio-...` 공통 소개 화면을 구현했다. 목록의 제목은 소개로 연결하고 기존 ‘읽기’는 원래 HTML을 그대로 연다. 번호·제품명·브랜드·카테고리·종류·키워드·설명·주요 주제·활용 이유·실제 목차·관련 가이드·이전/다음·목록 복귀를 제공한다.

소개의 기본 주제는 원본 목차, 활용 이유는 기존 설명을 사용한다. 검수한 문장은 같은 마스터의 선택 `highlights`, `whyItMatters`로 보완할 수 있다. 관련 자료는25개 상품에 확인한 모델·리비전·계열 관계를 명시했으며 자동 추천은 구현하지 않았다. 상세 데이터 파일을 별도로 만들지 않았다.

80개 실제 소개 화면·검색 진입/목록 상태 복원·이전/다음·원본 HTTP200·2,087개 목차 연결과 장 선택을 검사했다. 대표5종×4폭의 모바일/데스크톱과 임시081 상세 자동 반영도 통과했다. 최종80종, 탐색49/10/21,050마이크 분류 유지. lint/typecheck/validate/build/build:check·기존7개 포함9개 테스트·브라우저 회귀 통과. 원본80개·기존 홈·styles.css·reader 파일의 바이트를 보존했다.

외부 출처나 기존 원문 품질 감사 항목은 이번 화면 구현과 별개로 남아 있다. 상품별 정적 SEO/공유 메타데이터도 후속 범위다. 결제·회원·즐겨찾기·판매·Supabase·AI API·GitHub push·Vercel 배포는 수행하지 않았다. 변경 파일과 검사 근거: [PRODUCT_DETAIL_IMPLEMENTATION.md](PRODUCT_DETAIL_IMPLEMENTATION.md). 유지관리: [CATALOG_MAINTENANCE.md](CATALOG_MAINTENANCE.md). 다음 후보 하나는 브랜드 필터 UI다.
