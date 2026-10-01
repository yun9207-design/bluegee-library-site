# 보안 범위 — Auth 1단계

작성일: 2026-10-01.

**현재 Auth는 사용자 식별만 제공하며 public static guides의 보안 접근통제는 제공하지 않는다.**

## 현재 공개되는 자료

Vercel에 배포되는 `dist/guides/`의 80개 HTML은 public static 파일이다. 로그인하지 않아도 기존 URL로 열 수 있다. Library, 상품 상세, `products.json`, 목차, 기존 reader도 공개 상태를 유지한다. 원본 주소를 숨기거나 JavaScript에서 로그인 여부를 검사하는 것만으로 파일을 보호할 수 없다.

현재 로그인 상태나 표시 이메일은 구입 여부·라이선스·다운로드 권한의 증거가 아니다. 원본 가이드에 로그인 차단, URL 변경, HTML/PDF 이동을 적용하지 않았다.

## 공개 설정과 secret 경계

- 브라우저에는 `SUPABASE_URL`과 공개 publishable 또는 레거시 `anon` key만 전달한다.
- `scripts/auth-build.cjs`는 두 값만 허용하며 `service_role`과 `sb_secret_...` key를 거부한다. 환경변수 전체를 bundle하지 않는다.
- 실제 값은 `.env.local` 또는 향후 Vercel Build 환경변수로 관리한다. `.env*`와 생성된 `dist/auth-config.js`는 Git에서 제외한다. 빈 `.env.example`은 공개한다.
- 생성한 공개 설정은 배포 시 누구나 읽을 수 있다. 이를 비밀 key 저장소로 취급하지 않는다.
- 향후 DB/Storage를 추가할 때에는 RLS 및 서버의 권한 검사를 별도로 설계해야 한다. publishable key가 공개 사용 가능한 점이 모든 데이터 공개를 허용한다는 뜻은 아니다. [Supabase API key 안내](https://supabase.com/docs/guides/getting-started/api-keys)

## 세션과 화면 처리

SDK의 세션 유지에는 origin별 localStorage를 사용한다. 같은 origin에서 실행되는 악성 JavaScript가 세션에 접근할 수 있으므로 사용자 제공 HTML을 이 사이트 origin에서 실행하는 기능이나 검토되지 않은 외부 script를 추가하면 안 된다. 현재 SDK는 설치한 고정 버전에서 로컬 번들로 생성하며 런타임 CDN을 사용하지 않는다.

이메일은 `textContent`로 출력한다. 비밀번호는 localStorage에 직접 저장하지 않으며 요청 완료 후 입력 필드를 비운다. 오류 안내에 원본 오류·token·비밀번호·설정값을 넣지 않는다. 로그인 후 이동은 고정 Library 경로다.

초기 사용자 확인에 `getUser()`를 호출하지만 이번 단계에는 서버의 콘텐츠 권한 검사가 없다. 로그아웃은 현재 브라우저 세션 종료이며 여러 기기 전체의 세션을 종료하는 기능은 아니다.

## 이후 실제 접근통제의 조건

유료 또는 보호 자료를 제공하는 단계에서는 private Supabase Storage, 서버/Vercel Function의 검증된 사용자 확인, `purchases`/`entitlements`에 근거한 권한 검사, 짧은 유효기간의 권한 있는 전달 경로를 함께 구현해야 한다. 그때 public 원본의 배포 방식도 따로 검토해야 한다. 이번 단계에서는 이 기능이나 테이블을 구현하지 않는다.

## 검증 상태

설정 누락·secret/service_role 거부·브라우저 세션 흐름을 테스트한다. 사용자가 제공한 실제 공개 설정을 Git 제외 파일에 연결했으며 공개 Auth health 응답을 확인했다. 실계정 로그인 1회·이메일 표시·새로고침 세션 유지·로그아웃 성공은 사용자가 직접 확인했다. 추가 실계정 로그인은 반복하지 않는다. 상세 절차와 격리된 테스트의 한계는 `AUTH_IMPLEMENTATION.md`에 기록한다.
