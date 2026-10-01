# 전체 80종 Entitlement 보호 — 2026-10-01

**2026-10-02 변경:** 사용자가 공유한 운영 링크를 로그인 없이 읽을 수 있도록 80종을 공개 열람으로 전환했다. 현재 운영 상태는 [PUBLIC_READING.md](PUBLIC_READING.md)를 따른다. 아래 문서는 보호 모드 구현 기록이며 기존 Auth/entitlement는 보존한다. 공개 flag를 끄면 보호 모드로 돌아간다.

현재 보호 대상은 `audio-001`–`audio-080` 전체다. U47 파일럿을 공통 구현으로 확장했다. Auth 소스·로그인 흐름·기존 U47 원문과 기존 테스트 grant는 보존했다. 상품 번호·제목·분류·기존 HTML URL과 2,087개 목차 제목/ID도 보존한다.

## 공개 / 비공개

| 공개 | 비공개 |
|---|---|
| Library, 검색, 필터, 80개 상품 상세 소개, 기존 소개/미리보기 정보, 키워드, 2,087개 목차 | 80종 전체 원문 HTML과 내부 본문 표·실습·원문 script |
| `content/products.json`의 상품 정보와 `access:"entitlement"`, `chapters` | `library_guide_contents`의 lossless gzip/base64, SHA-256, byte_length |
| root/dist의 기존 HTML 경로에 제공하는 공통 잠금 화면 | 관리자 유지관리 백업: Git/배포 디렉터리 밖 |

PDF는 현재 등록된 실제 파일이 없고 모든 `pdfPath`가 null이다. 전체 본문을 공개된 PDF/JSON/fixture/migration으로 우회 제공하지 않는다. 이미 공개된 과거 이력/배포는 아래 별도 경계를 따른다.

## 하나의 API / reader

`GET /api/guide?id=audio-NNN`과 `HEAD`를 그대로 사용한다. `server/guide-handler.cjs`가 `content/products.json`의 published/entitlement 상품을 공통 allowlist로 사용한다. 상품별 함수·페이지 코드는 만들지 않는다. 알려지지 않은 ID는 404다.

1. 토큰은 Authorization 헤더로만 받는다. query에 token/access_token을 받지 않는다.
2. 기존 Supabase SDK의 `getUser(token)`으로 사용자 신원을 검증한다. query의 user_id/이메일/단순 JWT decode/user_metadata는 권한의 근거가 아니다.
3. verified user_id + 요청 product_id의 html/all entitlement가 시작됐고 만료되지 않았는지 확인한다. 미로그인 401, 무권한 403이다.
4. 같은 사용자 JWT로 private content를 읽으며 DB RLS가 상품별 권한을 다시 검사한다. service_role/secret key는 사용하지 않는다.
5. gzip 복원 후 SHA-256/바이트 수가 일치하는 경우만 원문을 반환한다. 모든 body/오류 응답은 private/no-store이며 장애 시 권한을 열지 않는다.
6. 기존 URL의 공통 `protected-guide.js` reader가 검토된 원문을 iframe으로 보여준다. 내부 목차/해시/읽음 표시를 유지하고 다른 가이드 링크는 외부 reader로 이동한다. 권한 취소/로그아웃 처리도 공통 로직을 유지한다.

정적 URL에는 원문이 없으므로 버튼을 우회해 직접 URL을 열어도 전체 본문을 얻지 못한다. RLS는 정상 사용자에게 권한 있는 상품의 Data API 읽기도 허용한다. 정상 UI는 Vercel API를 사용하며, 이를 서버만 읽을 수 있는 테이블이라고 잘못 설명하지 않는다. 사용자 INSERT/UPDATE/DELETE와 anon SELECT는 허용하지 않는다. 이미 허용되어 전달된 본문의 복사·캡처를 막는 DRM은 아니다.

## DB 변경과 원본 무결성

추가 migration은 `supabase/migrations/20261001114127_library_all_guides_entitlement.sql`이다. 기존 content의 U47-only CHECK를 canonical `audio-NNN` ID 형식으로 확장하고 테이블 설명만 갱신한다. 기존 Auth, RLS 정책, GRANT, 다른 앱의 테이블/Storage는 변경하지 않는다.

원문 80개 **16,069,358 bytes**를 백업한 뒤 무손실 gzip으로 DB에 저장했다. 압축 파일 합계는 4,258,467 bytes이다. 관리자 조회에서 원문별 SHA-256/byte_length와 실제 저장된 base64의 MD5를 백업과 대조해 80/80 일치를 확인했다. 원문 payload는 migration이나 Git에 넣지 않았다.

현재 관리자 grant는 U47의 기존 1건뿐이다. 다른 79종의 권한을 사용자 전체에 자동 지급하지 않았다. 실제 RLS 검사를 위한 001/080 임시 권한은 transaction rollback으로 제거했다. 결제·purchases·번들 권한 발급은 구현하지 않았다.

## 빌드와 유지관리

`npm ci → npm run build → dist` 정적 구조와 Vercel Node Function 한 개를 유지한다. 빌드는 공통 자산/카탈로그/80개 잠금 URL을 생성한다. root guide 파일이 원문으로 복구되면 빌드가 실패하며, 기존 80개 access를 public으로 되돌려도 검증에 실패한다. protected 상품에는 public pdfPath를 넣지 않는다.

신규 081 이후 등록 절차:

1. 검토된 원문은 Git 밖의 비공개 관리자 폴더에 놓는다. public/dist/guides에 원문을 복사하지 않는다.
2. 기존 형식의 `audio-NNN` ID, 원문에서 확인한 목차 `{id,title}`, 설명, 기존/신규 HTML 경로, `access:"entitlement"`를 상품 마스터에 등록한다. 본문·압축 값·자격증명은 마스터에 넣지 않는다.
3. 관리자 연결에서 lossless gzip/base64, 원문 SHA-256, byte_length를 같은 ID의 private content 행에 저장하고 대조한다. 새 사용자 권한을 자동으로 지급하지 않는다.
4. `scripts/protected-build.cjs`의 `renderProtectedShell(product)`로 마스터의 공개 정보만 사용해 root/dist의 새 HTML 경로를 초기 생성한다. parent 디렉터리가 필요하면 생성한다. 기존 파일을 갱신할 때에도 원문은 먼저 비공개 백업한다. 원문을 입력으로 잠금 화면을 생성하지 않는다.
5. lint/typecheck/build/build:check, 새 상품의 URL·목차·권한 분리만 검사한다. 공통 API allowlist는 마스터에서 자동 반영되므로 상품별 코드나 하드코딩 ID 목록을 수정하지 않는다.

`library_guide_contents`는 본문의 단일 원본이고 `products.json`은 공개 상품/목차의 단일 원본이다. 내용이 바뀌면 private row의 압축·해시·바이트 수를 함께 갱신한다. 목차가 바뀔 때만 마스터와 잠금 화면을 동기화한다. 미래의 PDF는 별도 private 자산/권한/서버 전달 설계가 필요하다.

## 최소 검증 범위

- 실제 DB: 80행·무결성 일치, 무권한 사용자에게 0행, rollback 임시 001/080 권한에 해당 2개만 허용, 다른 상품 0행. 최종 grant는 원래 1건이다.
- 기존 카탈로그 9/9: 검색·분류·상품 상세·관련/이전/다음·081 자동 추가 후 제거·기존 URL 유지.
- `npm run test:protection`: 80종 public shell/2,087개 목차, 공통 API의 익명 401·무권한 403·상품별 허용·교차 상품 거부. 합성 세션/루프백 응답이며 password login 요청은 0회다.
- `npm run test:protection:browser`: 기존 U47/Auth 테스트를 반복하지 않고 신규 대표 001/051/080의 실제 원문 + 격리 SDK 응답으로 공개 상세→잠금, 권한 열람, 목차 해시, 모바일 reader를 검사한다. 실계정 Production 로그인 검증과 구분한다.
- 운영 배포 뒤 익명 HTTP smoke로 80개 상세/기존 guide URL, 원문 없는 lock shell, 80개 API 차단, 카탈로그/목차/내부 링크를 확인한다. 사용자 로그인은 요청하지 않는다.

## 과거 공개 이력

이 저장소는 public이다. 현재 작업 트리에서는 전체 본문 0개를 확인했지만 과거 Git commit에는 80종 전체 본문이 남아 있고 대표 raw URL도 여전히 HTTP 200으로 원문을 제공한다. Git history 재작성은 실행하지 않았다. 정확한 별도 정리 절차와 위험은 [PUBLIC_CONTENT_HISTORY_CLEANUP.md](PUBLIC_CONTENT_HISTORY_CLEANUP.md)에 기록했다. 이전 Vercel/Sites 배포와 이미 저장된 사본도 별도 정리 대상이다.

참조: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Vercel Node Functions](https://vercel.com/docs/functions/runtimes/node-js).
