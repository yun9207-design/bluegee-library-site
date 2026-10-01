# 보안 범위 — 전체 80종 Entitlement

작성일: 2026-10-01.

**현재 Auth는 사용자 식별만 제공하며 public static guides의 보안 접근통제는 제공하지 않는다.**

## 현재 공개되는 자료

Library, 상품 상세·미리보기, `products.json`과 2,087개 목차는 공개 상태다. `audio-001`–`audio-080`의 기존 public URL에는 잠금 화면만 남으며 80종 전체 원문은 public static 산출물/현재 root 사본에 포함하지 않는다. 원본 주소를 숨기거나 JavaScript에서 버튼만 감추는 방식은 쓰지 않는다.

표시 이메일은 권한의 증거가 아니다. 전체 가이드는 공통 Vercel Function이 실제 사용자와 해당 상품의 DB entitlement를 확인하고 private content RLS가 독립적으로 재확인한다. 권한 없는 API 요청에는 본문을 반환하지 않는다. 파일명·상품 URL·기존 읽기 URL은 유지하며 결제/구매 이력과 연동하지 않는다.

## 공개 설정과 secret 경계

- 브라우저에는 `SUPABASE_URL`과 공개 publishable 또는 레거시 `anon` key만 전달한다.
- `scripts/auth-build.cjs`는 두 값만 허용하며 `service_role`과 `sb_secret_...` key를 거부한다. 환경변수 전체를 bundle하지 않는다.
- 실제 값은 `.env.local` 또는 향후 Vercel Build 환경변수로 관리한다. `.env*`와 생성된 `dist/auth-config.js`는 Git에서 제외한다. 빈 `.env.example`은 공개한다.
- 생성한 공개 설정은 배포 시 누구나 읽을 수 있다. 이를 비밀 key 저장소로 취급하지 않는다.
- U47 서버도 publishable key + 사용자 JWT만 사용하며 service_role/secret key는 없다. `library_entitlements`는 자기 행 SELECT만 허용하고, `library_guide_contents`는 활성 HTML 권한을 확인하는 RLS를 적용한다. 공개 key만으로 private 본문을 읽거나 권한을 발급할 수 없다. [Supabase API key 안내](https://supabase.com/docs/guides/getting-started/api-keys)

## 세션과 화면 처리

SDK의 세션 유지에는 origin별 localStorage를 사용한다. 같은 origin에서 실행되는 악성 JavaScript가 세션에 접근할 수 있으므로 사용자 제공 HTML을 이 사이트 origin에서 실행하는 기능이나 검토되지 않은 외부 script를 추가하면 안 된다. 현재 SDK는 설치한 고정 버전에서 로컬 번들로 생성하며 런타임 CDN을 사용하지 않는다.

이메일은 `textContent`로 출력한다. 비밀번호는 localStorage에 직접 저장하지 않으며 요청 완료 후 입력 필드를 비운다. 오류 안내에 원본 오류·token·비밀번호·설정값을 넣지 않는다. 로그인 후 이동은 고정 Library 경로다.

공통 Guide API는 bearer token을 `getUser(token)`으로 검증하고 user_id를 이 결과에서 얻는다. 브라우저의 query, 이메일, user_metadata, 단순 JWT decode 결과로 권한을 판정하지 않는다. Auth 로그인 코드는 변경하지 않았다. 로그아웃은 현재 브라우저 세션 종료이며 여러 기기 전체의 세션을 종료하는 기능은 아니다.

## 현재 접근통제와 공개 이력

80종 본문은 무손실 압축으로 RLS 테이블에 저장하고 서버가 상품별 권한 확인 후 전달한다. `Cache-Control`/`CDN-Cache-Control`/`Vercel-CDN-Cache-Control`은 `no-store`, `Vary`는 `Authorization`이다. bearer token은 헤더에서만 받으며 URL token·쓰기 메서드·등록되지 않은 상품은 거부한다. 오류는 권한을 열어 주지 않는 방향으로 처리한다. 무결성 확인 후 검토된 원문만 reader iframe에서 실행하며 외부 업로드 문서는 허용하지 않는다.

이 자료는 이미 공개된 적이 있고 GitHub 저장소도 public이다. 현재 commit과 운영 URL에서 원문을 제거했어도 과거 Git raw URL, 이전 Vercel/Sites 배포, 다운로드 사본은 소급 보호하지 못한다. 본 작업은 과거 배포 삭제·Git 이력 재작성·저장소 공개 범위 변경을 포함하지 않는다. 향후 판매용 비공개 신판과 과거 공개 자료를 구분해야 한다. 권한 있는 사용자에게 이미 전달한 본문을 회수하거나 복사를 막는 DRM도 제공하지 않는다.

80종 전체 확대는 완료했다. private Storage/PDF와 결제·purchases 연동은 별도 단계다. 상세 관리 방법은 [ALL_GUIDES_PROTECTION.md](ALL_GUIDES_PROTECTION.md), Git 이력·과거 배포 정리 계획은 [PUBLIC_CONTENT_HISTORY_CLEANUP.md](PUBLIC_CONTENT_HISTORY_CLEANUP.md)를 따른다. 기존 이력에는 80종 원문이 여전히 존재하며 이번 작업은 Git history를 재작성하지 않는다.

## 검증 상태

Auth/U47의 기존 검증을 유지하고 로그인 반복 검증은 하지 않는다. 80행 저장과 원문 무결성, 신규 001/080의 실제 DB RLS, 공통 API 80종의 격리 HTTP 테스트, 신규 001/051/080의 원문 기반 브라우저를 최소 검사한다. 신규 임시 grant는 rollback으로 제거했다. Production 익명 smoke와 실계정의 전체 열람 확인은 구분하여 기록한다.

Supabase Security Advisor에는 Auth의 Leaked Password Protection Disabled 경고 한 건과 다른 앱의 `private.threads_publishing_config` 정책 없음 INFO 한 건이 있다. Library 테이블의 RLS/정책 경고는 없다. Auth와 다른 앱의 설정은 동결하므로 변경하지 않았다. [Auth 경고 안내](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection), [RLS 정책 INFO 안내](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).
