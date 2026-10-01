# BlueGEE Audio Library

80종 오디오 엔지니어링 전문 가이드의 정적 Library다. 마스터는 `content/products.json`, 화면 소스는 `src/`, Vercel 배포 출력은 `dist/`다. Next.js 앱이 아니다.

현재 상품 분류는 Outboard 49 / Engineer Deep Dive 10 / Microphone 21이다. 050 U47은 Classic 시리즈의 Microphone 분류를 유지한다. 기존 80개 원본 URL과 2,087개 목차를 보존한다. 루트에 남은 이전 업로드용 HTML/JS/`guides/`는 그대로 보관하며 운영 빌드는 `dist`를 사용한다.

## 로컬 실행

Node.js 24 권장, 최소 22.13 이상이 필요하다.

```powershell
npm.cmd ci
npm.cmd run build
npm.cmd run dev
```

기본 주소는 `http://127.0.0.1:8766/`이다. 모든 상세 소개는 `product.html?id=audio-001`과 같은 공통 화면을 사용한다. 기존 `reader.html` URL도 유지한다. 신규 콘텐츠 등록 방법은 [CATALOG_MAINTENANCE.md](CATALOG_MAINTENANCE.md)에 있다.

## 이메일·비밀번호 로그인

Auth 1단계는 `login.html` → 로그인 → Library 이동 → 이메일 표시 → 세션 유지 → 로그아웃을 제공한다. 회원가입·OAuth·결제·구매권한은 포함하지 않는다.

**현재 Auth는 사용자 식별만 제공하며 public static guides의 보안 접근통제는 제공하지 않는다.** 비로그인 사용자도 공개 Library와 원본 가이드를 계속 이용한다.

실제 Supabase 설정값은 Git에 저장하지 않는다. `.env.example`을 `.env.local`로 복사하여 공개 `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` 두 값만 입력하고 다시 빌드한다. `service_role`/secret key는 사용하지 않는다. 값이 둘 다 없으면 로그인 준비 안내가 표시되며 공개 Library는 계속 동작한다. 사용자가 제공한 실제 공개 설정을 Git 제외 로컬 파일에 연결했다. Auth health 응답은 HTTP 200이며 사용자가 실계정 로그인 1회·이메일 표시·새로고침 세션 유지·로그아웃 성공을 확인했다.

SDK는 npm dependency에서 esbuild로 로컬 bundle한다. 빌드 환경변수는 Git 제외 파일 `dist/auth-config.js`로 생성한다. 설정 변경 후에는 다시 빌드해야 한다. 전체 구현·설정·검증 절차는 [AUTH_IMPLEMENTATION.md](AUTH_IMPLEMENTATION.md), 보안 경계는 [SECURITY.md](SECURITY.md)에 있다.

## 검증

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run validate
npm.cmd run build:check
npm.cmd test
npm.cmd run test:auth
npm.cmd run test:browser
npm.cmd run test:auth:browser
```

`npm test`는 기존 카탈로그 테스트 9개다. `test:auth`는 설정 검사 5개이며, `test:auth:browser`는 실제 SDK와 합성 localhost Auth 응답을 이용한다. 합성 응답 테스트는 실계정 검증을 대신하지 않는다. Auth 근거는 `audit/auth-stage1/`, 카탈로그·상세·목차 근거는 `audit/product-detail/`에 기록한다. 브라우저 테스트는 Windows에서 설치된 Microsoft Edge를 사용하며 다른 환경에서는 `BROWSER_EXECUTABLE`을 지정할 수 있다.

## 배포 구조와 이번 작업 상태

`vercel.json`: `npm ci` → `npm run build` → `dist`. Auth 이전 안정 Production 기준 commit은 `784d4170421271787a6e14fd9bd2928bb1a0efb0`이다. Auth 릴리즈는 GitHub main push와 연동된 Production 자동 배포를 사용한다. Vercel Production Build 환경변수에 두 공개 설정을 등록했다. 서비스 주소는 `https://bluegee-library-site.vercel.app/`를 유지한다.

이전 감사·인벤토리·상품/번들·로드맵·배포 체크포인트 문서는 보존한다. 이번 배포 검증은 비로그인 자동 smoke test로 한정한다. 추가 실계정 로그인, 구매권한, 가이드 차단은 수행하지 않는다.
