# U47 Entitlement 파일럿 — 2026-10-01

보호 대상은 `audio-050` 한 종이다. Auth 기준 commit은 `878c848f51e21da27db75d0ddace82b17e8d3fd4`이며 `src/auth.js`와 로그인 흐름은 변경하지 않는다. 050은 Microphone 분류 / Classic Studio Gear 시리즈를 유지한다. 나머지 79개 가이드는 공개 상태다.

## 선택한 방식

현재 정적 빌드 `npm ci → npm run build → dist`를 유지하고 `/api/guide` Vercel Node Function 한 개를 추가한다. Storage 관리자 CLI 연결이 없는 상태에서 새 관리자 자격증명이나 service key를 요구하지 않기 위해 본문은 RLS 적용 DB 테이블에 저장한다. 이는 private Storage를 사용하는 구현은 아니다. 저장 위치를 바꾸어도 같은 서버 권한 검사와 원본 URL을 유지할 수 있다.

1. 카탈로그·상세·27개 목차 제목은 공개한다.
2. 기존 U47 URL은 전체 원문 대신 잠금 화면을 반환한다. `reader.html?id=050`과 기존 목차 해시도 같은 URL로 이동한다.
3. 읽기 화면은 기존 Supabase 세션의 access token을 Authorization 헤더로만 전달한다. URL, 문서, 로그에 토큰을 넣지 않는다.
4. Function은 `getUser(token)`으로 사용자를 실제 검증한다. 클라이언트 user_id/이메일/JWT의 단순 디코딩 결과를 신뢰하지 않는다.
5. 검증된 user_id의 활성 HTML entitlement를 조회한다. grant 시작일·만료일·access_type을 확인한다.
6. 동일 사용자 JWT로 private content를 조회한다. 본문 테이블의 RLS가 다시 entitlement를 확인한다. 권한과 본문 조회 사이에 취소되어도 전달하지 않는다.
7. 압축을 해제하고 원본 SHA-256·바이트 수가 일치할 때만 전체 HTML을 응답한다. 서버·CDN·브라우저 모두 `no-store`, `Vary: Authorization`를 사용한다.

서버는 publishable key + 사용자 JWT만 사용한다. service_role/secret key, signed URL, 관리자 다운로드 우회 경로는 없다. 로그인 없는 요청은 401, 권한 없는 요청은 403, 검증/DB/무결성 오류는 503으로 실패한다. 다른 상품 ID는 404다. GET/HEAD만 지원하며 HEAD는 본문 없이 열람 권한만 확인한다.

## DB와 관리자 운영

migration: `supabase/migrations/20261001103735_library_u47_entitlement_pilot.sql`.

| 테이블 | 필드 | 접근 |
|---|---|---|
| `library_entitlements` | user_id, product_id, access_type, granted_at, expires_at | authenticated 사용자는 자기 행 SELECT만 가능. INSERT/UPDATE/DELETE는 관리자만 |
| `library_guide_contents` | product_id, html_gzip_base64, sha256, byte_length, updated_at | 활성 HTML/all entitlement가 있는 사용자만 SELECT. 사용자 쓰기 불가 |

두 테이블은 RLS를 켜고 anon/PUBLIC 권한을 회수한다. content 정책은 `(select auth.uid())`와 entitlement 존재 여부를 검사한다. entitlement의 복합 기본키 `(user_id,product_id,access_type)`가 소유권·상품 조회 인덱스도 제공한다. 기존 앱의 테이블·Auth 설정·Storage 정책은 변경하지 않는다. 콘텐츠 테이블은 현재 `audio-050` 한 행만 허용한다.

기존 테스트 사용자 한 명에 `audio-050 / html` entitlement 한 건만 관리자 SQL로 부여했다. 테스트 권한은 **2026-10-08 19:47 KST**에 만료된다. 실제 결제/구매 이력과 연결된 권한이 아니다. 개인 이메일·UUID·비밀번호·토큰은 이 문서나 migration에 기록하지 않는다.

다음 예시는 Supabase SQL Editor 등 관리자 연결에서만 사용한다. 브라우저에 관리자 API를 만들지 않는다.

```sql
insert into public.library_entitlements(user_id,product_id,access_type,expires_at)
select id,'audio-050','html',now()+interval '7 days'
from auth.users where email='<관리자가 확인한 사용자 이메일>'
on conflict(user_id,product_id,access_type)
do update set granted_at=now(), expires_at=excluded.expires_at;
```

만료는 다음 열람 요청에서 즉시 적용된다. 열린 화면도 다른 탭의 로그아웃, 화면 재진입, 최대 60초의 HEAD 재검사 시 원문을 제거한다. 이미 허용되어 전달된 정보를 회수하거나 캡처를 막는 DRM은 아니다.

## 원본과 화면 보존

U47 원본 342,139바이트를 Git 외부 유지관리 폴더에 먼저 백업하고, 무손실 gzip/base64로 DB에 보관했다. 원문 SHA-256:

`4de04d36e31baa527733adebaf097bd25c8cbd4d3d2bd2ecbb3958bf5b7b33e1`

현재 저장소의 root `guides/` U47 사본과 `dist/guides/` U47 사본에는 본문을 남기지 않는다. 파일명·URL은 그대로다. 상품 마스터에 `access:"entitlement"`와 기존 27장 제목/ID만 추가한다. 공개 산출물에는 전체 HTML, 압축 본문, 토큰이 포함되지 않는다. 빌드는 잠금 화면을 자동 재생성하고 root 사본이 원문으로 복원된 경우 실패한다.

권한 있는 사용자는 원문을 iframe에서 읽는다. 기존 내부 왼쪽 목차·읽음 표시·이전/다음 장을 유지하며, 부모 URL과 내부 목차 해시를 연결한다. iframe은 검토한 이 원문만 `allow-scripts allow-same-origin`로 실행한다. 외부 사용자 업로드 HTML을 이 경로에 넣으면 안 된다. 세션을 iframe HTML에 주입하지 않는다.

## 검증 구분

자동검증은 실계정 로그인을 반복하지 않는다.

- 실제 Supabase DB: SELECT 권한/RLS, 자기 권한 1건, 타인 조회 0건, 권한 없는 본문 0건, 활성 권한 본문 1건, 만료 본문 0건. 만료 테스트는 transaction rollback으로 원래 테스트 grant를 보존한다.
- 실제 고정 SDK + 루프백 HTTP 서버: 인증 없는 401, 잘못된 JWT 401, 무권한 403, 만료/미래 grant 거부, 권한 있는 원문 전달, body 무결성, HEAD, 장애/취소 경쟁 조건, URL token 및 다른 상품 차단.
- 격리된 브라우저 + 실제 U47 원문: 잠금 상태, 권한 상태, 27장 이동, 목차 해시, 모바일, 취소/로그아웃 시 원문 제거. Auth 응답과 세션은 합성 값이다. password login 요청은 0회다.
- 기존 카탈로그 9개 / Auth 설정 5개 테스트와 lint/typecheck/build/build:check를 유지한다. Auth 로그인 회귀 테스트를 재실행할 필요는 없다.

검증 근거는 `audit/entitlement-pilot/`에 기록한다. 격리된 테스트 성공은 실계정의 Production 열람을 직접 검증한 것과 구분한다. 실계정의 마지막 수동 열람은 필요할 경우 한 번만 요청한다.

## 보안 경계와 확장

현재 운영 배포의 직접 U47 URL은 잠금 화면만 제공한다. 그러나 U47은 이전에 공개되었고 GitHub 저장소도 public이다. **과거 commit/raw URL, 과거 Vercel/Sites 배포, 이미 저장된 사본까지 이 변경으로 소급 잠그지는 못한다.** 현재 본문을 숨긴 버튼만으로 보호했다고 주장하지 않는다. 기존 공개 사본 정리는 별도 범위이며 이 작업은 Git 이력 재작성, 저장소 공개 범위 변경, 과거 배포 삭제를 하지 않는다.

향후 다른 79개 확장에는 원문별 private 저장과 무결성 검증, 공개 사본 제거, 상품 access/목차 metadata 등록, 서버 허용 대상과 DB content 제약 확장, 같은 RLS/URL/회귀 검증이 필요하다. 대량 자산/PDF 단계에서는 private Storage로 저장 백엔드를 바꾸는 편이 적합하다. 결제·purchases 연동·entitlement 발급 관리자 UI는 이번 파일럿에 없다.

참조: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [명시적 Data API grant 변경](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically), [Vercel Node Functions](https://vercel.com/docs/functions/runtimes/node-js), [캐시 헤더](https://vercel.com/docs/caching/cache-control-headers).
