# 로그인 없는 공개 열람 — 2026-10-02

사용자는 이미 엔지니어들에게 공유한 `https://bluegee-library-site.vercel.app/`에서 로그인 없이 80종 전체를 읽을 수 있도록 공개 전환을 요청했다. 이전의 전체 유료 잠금 요청보다 이 요청을 우선한다. 엔지니어 이메일 수집이나 계정 생성은 필요하지 않다.

## 현재 구조

- 카탈로그 80종, 기존 상세·가이드 URL, 050의 분류, 2,087개 목차와 원본 HTML 내용은 유지한다.
- 원문을 Git 또는 정적 dist에 다시 복사하지 않는다. 기존 공통 API가 DB의 무손실 원문을 전달하고 공통 reader가 기존 화면·목차로 보여준다.
- `library_guide_contents.public_readable=true`인 행만 누구나 읽을 수 있다. 이 공개 설정은 관리자만 수정한다. 기존 001–080은 true, 새 행은 기본 false다.
- RLS를 끄지 않는다. anon/authenticated는 SELECT만 할 수 있고, public_readable 행에만 공개 SELECT 정책이 적용된다. 공개 설정이 false인 행은 기존 entitlement 정책을 따른다. 권한 발급·콘텐츠 쓰기는 여전히 관리자 전용이다.
- `GET /api/guide?id=audio-NNN&public=1`은 로그인 없이 공개된 행만 요청한다. query flag 자체는 권한이 아니며 DB의 공개 flag + RLS + 서버 allowlist를 통과해야 한다. HEAD도 같은 flag를 확인한다. private 요청 경로와 entitlement 검사는 유지한다.
- reader는 공개 요청을 먼저 한다. 200이면 세션 조회 없이 원문을 열고, 공개되지 않았다는 401/403일 때만 기존 로그인·entitlement 흐름으로 간다. 장애/무결성 오류는 본문을 반환하지 않는다. no-store는 유지한다.
- 공개 열람 기간의 80종은 URL 또는 Supabase Data API로 누구나 본문을 받을 수 있다. 이는 요청에 따른 공개이며 유료 보호 상태라고 설명하지 않는다. 공개 Git 이력 정리와 공개 웹 열람은 서로 별개다.
- Auth 소스와 기존 계정/entitlement는 변경하지 않는다. service_role/secret key와 새 비밀 환경변수는 사용하지 않는다.

## 나중에 다시 잠그기

판매 준비가 완료되고 사용자가 요청하면 관리자 SQL에서 다음처럼 공개 flag를 끈다.

```sql
update public.library_guide_contents
set public_readable = false
where product_id ~ '^audio-(00[1-9]|0[1-7][0-9]|080)$';
```

코드 재작성/원문 재업로드 없이 기존 entitlement 흐름으로 돌아간다. 열려 있는 reader도 no-store HEAD 재검사 때 접근 상태를 다시 확인한다. 이미 공개 전달된 내용을 회수하는 기능은 아니다.

## 검증

로컬 API/카탈로그/보호 모드 자동검사 **22/22**, 기존 보호 모드 browser 대표 001/051/080, lint/typecheck/build/94개 build check를 통과했다. 실제 anon DB 역할로 공개 행 **80개**, 쓰기 권한 없음, 공개 flag를 끈 rollback 검사에서는 **0개**를 확인했다.

공개 API 80종의 익명 열람·원문 SHA-256·기존 URL, 대표 browser의 원문·목차·모바일을 확인한다. 공개 flag=false의 거부, HEAD, 잘못된 상품, 무결성 오류와 기존 private entitlement 검사를 함께 확인한다. 실계정 로그인 반복 검증은 하지 않는다. 수행 숫자는 `audit/public-reading/verification.json`에 기록한다.
