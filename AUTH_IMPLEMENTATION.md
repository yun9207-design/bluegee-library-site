# Supabase Auth 1단계 — 정적 사이트

작성일: 2026-10-01. 기준 배포 commit: `784d4170421271787a6e14fd9bd2928bb1a0efb0`. 초기 구현은 로컬에서 자동 검증했다. 실제 공개 설정을 연결한 뒤 사용자가 로컬 실계정 로그인 1회, 이메일 표시, 새로고침 세션 유지, 로그아웃 성공을 확인했다. 추가 로그인 검증은 하지 않는다. 이번 릴리즈는 GitHub main과 Vercel Production으로 배포하고 비로그인 자동 smoke test만 수행한다.

**현재 Auth는 사용자 식별만 제공하며 public static guides의 보안 접근통제는 제공하지 않는다.**

후속 U47 Entitlement 파일럿은 [ENTITLEMENT_IMPLEMENTATION.md](ENTITLEMENT_IMPLEMENTATION.md)를 참고한다. 아래는 완료된 Auth 1단계의 기록이며 로그인 코드는 동결했다. 현재 공개 상태를 유지하는 원본은 79종이고 `audio-050`은 별도 서버/RLS 권한 검사를 거친다.

## 구현 범위

`login.html`에서 이메일·비밀번호로 로그인하면 `index.html`로 이동한다. Library, 상품 상세 소개, 로그인 페이지의 헤더에 사용자 이메일과 로그아웃 버튼을 표시한다. 로그인하지 않은 사용자도 기존 Library·상품 상세·원본 가이드·reader를 그대로 이용한다.

회원가입, OAuth, 결제, 구매권한, 가이드/PDF 보호, 데이터베이스 테이블, Next.js 전환은 구현하지 않았다. 원본 HTML 80개에는 로그인 코드나 접근 제한을 삽입하지 않았다.

## 파일과 빌드

| 파일 | 역할 |
|---|---|
| `src/auth.js` | SDK 초기화, 로그인, 세션 확인, 이메일 표시, 로그아웃 |
| `src/login.template.html` | 공용 디자인을 따른 이메일·비밀번호 로그인 화면 |
| `src/auth.css` | 계정 영역과 로그인 화면의 반응형 스타일 |
| `scripts/auth-build.cjs` | 허용된 공개 설정만 읽기, 키 검증, esbuild 번들 생성 |
| `scripts/catalog-data.cjs` | 기존 카탈로그 생성에 Auth 출력과 공통 헤더 연결 |
| `src/index.template.html`, `src/product.template.html` | 기존 화면에 공통 계정 영역 연결 |
| `dist/login.html`, `dist/auth.js`, `dist/auth.css` | 빌드에서 생성한 정적 파일; 직접 편집하지 않음 |
| `dist/auth-config.js` | 빌드 시 생성하는 공개 client 설정; Git에서 제외 |
| `.env.example` | 빈 공개 설정 예시; 실제 값 없음 |
| `tests/auth.test.cjs` | 설정 누락·위험한 URL·secret/service_role 거부·환경변수 우선순위 검사 |
| `tests/e2e/auth-browser.cjs` | 실제 SDK + 격리된 localhost Auth 응답으로 브라우저 흐름 검사 |

`@supabase/supabase-js` 2.117.2를 dependency, esbuild 0.28.2를 devDependency로 고정했다. `npm run build`는 SDK를 브라우저용 IIFE 파일로 bundle하며 런타임 CDN을 사용하지 않는다. 환경변수 전체를 `define`으로 주입하지 않는다. 상품 데이터와 가이드 생성 방식은 유지하며 생성 파일은 기존 8개에서 Auth 4개를 더한 12개다.

Vercel 설정은 기존 `npm ci` → `npm run build` → `dist`를 유지한다. 프로젝트 루트에 남아 있는 이전 업로드용 `index.html`, `app.js`, `guides/`는 운영 빌드 소스가 아니다. 운영 소스는 `src/`·`content/`이고 원본 배포 자료는 `dist/guides/`다.

## 실제 프로젝트 연결 방법

초기 로컬 구현에는 실제 Supabase 설정이 없었다. 2026-10-01 사용자가 제공한 기존 프로젝트의 공개 설정을 Git 제외 `.env.local`에 연결했다. `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`는 현재 정적 빌드의 `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` 이름으로 저장했다. 공개 Auth health 요청은 HTTP 200으로 응답했다. 사용자가 로컬 실계정 로그인 1회와 이메일 표시·새로고침 세션 유지·로그아웃 성공을 확인했다. 설정이 둘 다 없으면 `configured:false`인 공개 설정 파일을 생성하고, 로그인 폼을 비활성화하며 연결 준비 안내를 표시한다. 공개 Library는 계속 이용할 수 있다.

1. Supabase 프로젝트에서 이메일/비밀번호 로그인 사용 여부와 테스트용 기존 사용자를 확인한다. 이 사이트에는 회원가입 UI가 없다.
2. 프로젝트 루트에서 `.env.example`을 `.env.local`로 복사하고 편집한다.

```powershell
Copy-Item -LiteralPath '.env.example' -Destination '.env.local'
```

3. `.env.local`의 두 항목에 프로젝트 URL과 **publishable key**를 입력한다. 레거시 key를 사용하는 경우 `anon`만 허용한다.

```dotenv
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
```

4. 빌드한 뒤 로컬 서버에서 실계정으로 검증한다.

```powershell
npm.cmd run build
npm.cmd run dev
```

서버가 이미 8766에서 실행 중이면 새 서버를 중복 실행하지 않고 빌드 후 브라우저를 새로고침한다. 설정은 런타임 환경변수를 직접 읽지 않으므로 변경할 때마다 다시 빌드해야 한다.

Vercel Production Build 환경변수에 같은 두 공개 이름을 등록했다. main push가 자동 배포를 시작하므로 환경변수를 push 전에 준비한다. 실제 Supabase 설정값은 저장소에 기록하지 않는다. 환경변수가 `.env.local`보다 우선한다. `.env`, `.env.*`, `dist/auth-config.js`는 Git에서 제외하고 `.env.example`만 커밋 가능한 예외다.

`SUPABASE_URL`은 HTTPS origin이어야 하며 경로·query·fragment·사용자 정보를 허용하지 않는다. 로컬 Supabase/테스트 서버의 localhost origin에만 HTTP를 허용한다. 두 값 중 하나만 입력하면 빌드가 실패한다. `sb_secret_...` 또는 `service_role` JWT는 빌드에서 거부한다. 오류 메시지에 입력한 값은 출력하지 않는다.

공개 publishable/anon key는 브라우저에 노출되는 client 설정이다. Git 제외는 사용자 요청에 따라 실제 설정값을 저장소에서 분리한 것이며, 이 key를 브라우저에서 숨기는 보안 장치가 아니다. [Supabase API key 안내](https://supabase.com/docs/guides/getting-started/api-keys)

## 로그인과 세션

- `signInWithPassword`만 사용한다. 성공 후 이동 경로는 고정 `index.html`이며 외부 `returnUrl`을 받아 사용하지 않는다.
- `persistSession:true`, `autoRefreshToken:true`를 사용한다. SDK가 origin별 localStorage에 세션을 보관한다. 다른 origin이나 다른 브라우저의 세션은 공유되지 않는다.
- 초기 세션이 있으면 `getUser()`로 현재 사용자 상태를 서버에 확인한다. 화면에서 읽은 세션을 구매/콘텐츠 권한 판정에 사용하지 않는다.
- `onAuthStateChange`는 동기적으로 표시 상태만 갱신한다. callback 안에서 Supabase 요청을 await하지 않는다.
- 로그아웃은 `scope:'local'`로 현재 브라우저 세션을 종료한다. 다른 기기 전체에서 로그아웃하는 기능은 이 단계에 포함하지 않는다. 동일 origin의 열린 탭은 SDK의 상태 변경을 받는다.
- 사용 중인 SDK는 서버 로그아웃 요청 실패 시에도 로컬 세션을 지울 수 있다. 오류가 있으면 실제 남은 세션을 확인하여 표시를 맞추며, 로컬 종료와 서버 종료 확인 실패를 구분해 안내한다.
- 잘못된 자격증명, 확인되지 않은 이메일, 요청 제한, 연결 실패를 안내한다. 원본 서버 오류나 비밀번호/토큰은 화면·로그에 출력하지 않는다. 비밀번호 입력은 요청 완료 후 비운다.
- 이메일은 `textContent`로 표시하며 HTML로 삽입하지 않는다. 설정이 없거나 로그인 확인에 실패해도 카탈로그를 숨기지 않는다.

[비밀번호 로그인](https://supabase.com/docs/reference/javascript/auth-signinwithpassword), [인증 상태 변경](https://supabase.com/docs/reference/javascript/auth-onauthstatechange), [로그아웃 범위](https://supabase.com/docs/reference/javascript/auth-signout)

## 검증과 한계

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
npm.cmd run build:check
npm.cmd test
npm.cmd run test:auth
npm.cmd run test:browser
npm.cmd run test:auth:browser
```

기존 9개 카탈로그 테스트는 유지한다. Auth 설정 검사 5개와 브라우저 응답 테스트는 별도로 실행한다. 테스트용 URL·key·사용자·토큰은 모두 합성 값이며 OS 임시 디렉터리의 배포 복사본에만 들어간다. 원본 상품 마스터나 실제 `dist/auth-config.js`를 테스트 값으로 덮어쓰지 않는다. 테스트 후 임시 파일을 제거한다.

Auth 브라우저 테스트는 잘못된 로그인, 로그인 성공 후 이동, 이메일 표시, 새로고침 세션 유지, 만료 세션 갱신, 상세페이지 이동, 로그아웃 실패 처리, 성공 로그아웃, 다른 탭 반영, 로그아웃 후 공개 reader 접근, 모바일을 검사한다. 근거는 `audit/auth-stage1/browser-verification.json`과 화면 이미지다. 기존 전체 회귀 검증은 `audit/product-detail/browser-verification.json`에 기록된다.

**실제 공개 설정 연결 및 로컬 실계정 로그인 1회는 사용자 확인으로 통과했다.** 격리된 응답 테스트 통과는 실제 프로젝트 provider 설정, 사용자 비밀번호, 이메일 확인, 프로젝트 네트워크 상태가 정상이라는 증거가 아니다. 실계정 재로그인 테스트는 반복하지 않는다. Production에서는 사용자의 최종 지시에 따라 로그인 요청 없이 페이지 로드·설정·공개 가이드 보존만 자동 검사한다.

로컬 검증 결과: 기존 카탈로그 테스트 **9/9**, Auth 설정 검사 **5/5**, lint/typecheck/build/build:check/validate 통과. 전체 80개 상세·원본과 2,087개 목차, 검색·필터·reader·081 임시 추가 검증을 통과했다. Auth 응답 테스트는 로그인 오류/성공, 세션 유지/갱신, 로그아웃 오류/성공, 탭 간 반영과 공개 reader 접근을 통과했다. 320/390/768/1440px 화면에서 가로 넘침이 없다. 원본 80개와 `products.json`의 SHA-256은 기준 배포 작업 파일과 같다. `audit/auth-stage1/preservation-verification.json`에 보존 결과를 기록한다.

구매권한과 private Storage는 이후 별도 단계다. 세부 경계는 `SECURITY.md`를 따른다.
