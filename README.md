# BlueGEE Audio Library

**2026-10-02 운영 변경:** 사용자의 요청으로 현재 80종 전체 가이드는 로그인 없이 공개 열람한다. 본문은 기존 DB/API에서 제공하며 공개 Git/static에 재등록하지 않았다. 기존 로그인·entitlement는 나중에 판매를 시작할 때 사용할 수 있도록 보존한다. 현재 공개 설정과 되돌리는 방법은 [PUBLIC_READING.md](PUBLIC_READING.md)를 따른다. 아래 이전 보호 기록은 당시 구조를 설명한다.

80종 오디오 엔지니어링 전문 가이드의 정적 Library다. 마스터는 `content/products.json`, 화면 소스는 `src/`, Vercel 배포 출력은 `dist/`다. Next.js 앱이 아니다.

현재 상품 분류는 Outboard 49 / Engineer Deep Dive 10 / Microphone 21이다. 050 U47은 Classic 시리즈의 Microphone 분류를 유지한다. 기존 80개 URL과 2,087개 목차를 보존한다. 전체 80종의 기존 가이드 URL은 본문 대신 공통 권한 확인 화면을 제공하며 소개·미리보기·목차는 공개다. 운영 빌드는 `dist`를 사용한다.

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

**현재 Auth는 사용자 식별만 제공하며 public static guides의 보안 접근통제는 제공하지 않는다.** 별도 공통 Entitlement 구현이 80종의 전체 본문을 실제 보호한다. 비로그인 사용자도 Library·상품 소개·공개 미리보기·목차를 계속 이용한다. [ALL_GUIDES_PROTECTION.md](ALL_GUIDES_PROTECTION.md)에 서버·RLS·관리 절차, [PUBLIC_CONTENT_HISTORY_CLEANUP.md](PUBLIC_CONTENT_HISTORY_CLEANUP.md)에 과거 공개 사본의 노출과 정리 계획을 기록했다.

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

이전 감사·인벤토리·상품/번들·로드맵·배포 체크포인트 문서는 보존한다. U47 파일럿 이후 80종 전체를 같은 `/api/guide`와 reader로 보호한다. 추가 환경변수나 service key는 없다. `npm run test:protection`과 `npm run test:protection:browser`는 실계정 로그인 없이 전체 API와 신규 대표 001/051/080 reader를 검사한다. Auth/U47의 기존 실계정 검증을 반복하지 않는다. 구매/결제 연동과 Git 이력 재작성은 하지 않는다.
