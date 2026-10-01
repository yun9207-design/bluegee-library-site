# 공개 콘텐츠 Git 이력·과거 배포 정리 결과

2026-10-02 (Asia/Seoul). 이번 문서는 2026-10-01 계획을 실제 수행 결과로 갱신한 것이다. 이전 계획과 정리 전 상태는 프로젝트 밖 전체 백업에 보존했다.

**상태: Git 저장소 이력과 노출된 Vercel 배포 정리는 수행했다. GitHub의 옛 commit/raw 캐시에 80종 원문이 남아 있어 전체 노출 회수는 완료되지 않았다. 다른 기능은 개발하지 않는다.**

## 완료 조건별 결과

| 항목 | 결과 | 확인 범위 |
|---|---|---|
| 1. 현재 공개 파일의 전체 본문 | **0건** | 현재 소스·정적 산출물, Production의 가이드 URL 80개 |
| 2. 현재 Git 전체 object/history의 전체 본문 | **0건** | 현재 로컬과 새 원격 mirror; reachable/unreachable, 삭제된 blob, commit/tag/tree까지 전수 검사 |
| 3. GitHub 잔존 | 현재 branch/tag/release **0건**; 옛 캐시 **80종 잔존** | main 1개, tag/release/asset/PR/fork/Actions artifact/확인 가능한 첨부 모두 0개 |
| 4. 접근 가능한 이전 Vercel 배포의 전체 본문 | **0건** | 원문이 확인된 이전 배포 4개 삭제; 4×80개 원래 URL 모두 404 |
| 5. 공개 build/static 산출물의 전체 본문 | **0건** | dist·generated·public/static 가능 경로 및 ignored 파일 포함 프로젝트 전수 검사 |
| 6. 실제 secret 노출 | **0건 발견** | 전체 Git 객체에서 service_role/secret key, 토큰, DB URL 비밀번호, 민감 변수 값 검사; 공개 publishable/anon은 secret으로 분류하지 않음 |
| 7. 현재 Production | **정상** | 상품 80, 잠금 URL 80, 목차 2,087, 확인한 깨진 링크 0 |
| 8. 로그인 사용자 reader | **격리 자동검증 정상, 실계정 Production 재검증 없음** | 기존 SDK·공통 API·원문·reader로 001/051/080의 권한 보유 본문·목차·모바일·이동 확인; 비밀번호 로그인 요청 0 |
| 9. entitlement 없는 사용자 | **80개 API 격리검증 차단(403)** | 익명도 80개 차단(401); Production 익명 대표 3개 401. 실계정 권한 없는 Production 요청은 반복하지 않음 |

수치 요약은 [audit/history-cleanup/verification.json](audit/history-cleanup/verification.json)에 있다. 로컬 자동검증과 실계정 Production 검증은 구분한다.

## 백업과 영향 범위 확인

- 프로젝트 전체(원래 `.git`, ignored 파일 및 로컬 설정 포함)를 프로젝트 밖 유지관리 폴더에 복사했다. 추적 파일 **283개**의 바이트 해시가 원본과 일치함을 확인했다.
- 정리 전 원격의 all-ref mirror, 원래 로컬 `.git`, 80종 개인 원본을 별도 보존했다. 백업에는 원문과 로컬 private 설정이 포함될 수 있으므로 공개 저장소/웹 루트/Vercel에 올리지 않는다.
- GitHub API에서 관리자 권한, collaborator/contributor **yun9207-design 1명**, main 1개, tag 0개, PR 0개, fork 0개를 확인했다. branch protection/ruleset은 없었으므로 보안을 낮추는 변경은 하지 않았다.
- 원래 main이 조사 이후 변경되지 않았는지 `--force-with-lease`로 보호하여 **main 하나만** 교체했다. 다른 branch/tag를 삭제하는 mirror force push는 사용하지 않았다.

비공개 로컬 근거 폴더: `../_maintenance/2026-10-02-history-cleanup/`. `full-workspace-backup/`, `remote-before.git/`, `pre-rewrite-local.git/` 및 `../2026-10-01-all-guides/originals/`는 복구용으로만 유지한다.

## 본문과 발견 위치

80개 원문마다 공개 소개/목차와 겹치지 않고 다른 가이드와도 겹치지 않는 실제 본문 문장 **3개**, 총 **240개**를 추출했다. 파일명이나 상품명만으로 판정하지 않았다. HTML 태그/엔티티, 공백 및 JSON 유니코드 이스케이프를 정규화하여 검사했다. Git `cat-file --batch-all-objects`로 모든 객체를 열고 모든 commit의 tree에서 경로를 역추적했다. ZIP/gzip/base64-gzip도 검사했다.

정리 전 로컬: **685 objects / 589 blobs / 11 commits**, 본문 포함 **328 blobs**, 가이드 **80종**, 파일 경로 **160개**. 정리 전 원격 mirror: **680 objects / 589 blobs / 9 commits**, 동일한 328개 본문 blob이 발견됐다.

| 본문 포함 과거 경로 | 원래 파일 수 |
|---|---:|
| `dist/guides/deep-dive` | 10 |
| `dist/guides/microphone` | 21 |
| `dist/guides/outboard` | 49 |
| `guides/deep-dive` | 10 |
| `guides/microphone` | 21 |
| `guides/outboard` | 49 |

실제 고유 문장은 private `body-signatures-private.json`, blob/판본/전체 경로는 private `objects-before-local-complete.json`에 보존했다. 본문 인용과 현재 살아 있는 옛 raw URL 80개를 이 공개 문서에 다시 싣지 않는다.

## 실제 Git 정리

fresh no-local clone에서 **git-filter-repo 2.47.0**의 `--sensitive-data-removal --strip-blobs-with-ids`로 확인된 본문 blob 328개만 제거했다. 같은 이름의 현재 잠금 HTML, 공개 메타데이터, 상품 소개/미리보기 및 2,087개 목차는 유지했다.

- 정리 전 main: `b10cd55194bee6ed651ba49a32c0da3821484947`.
- 이력 정리 직후 main: `6e026fecd18ccbeee53d131d7e12ddc7acc7dd7e` (이 문서를 기록하는 후속 정상 commit은 별도).
- 정리 전/후 최신 application tree는 모두 **`59563b930aefca2c9e0826b242f518d0953c94ce`**로 동일했다. 정상 코드·catalog·API·reader·RLS 파일이 바뀌지 않았다는 Git 단위 근거다.
- 기존 작업 폴더는 안전한 새 `.git`으로 교체했다. 원래 로컬 `.git`도 private 백업으로 옮겼으므로 기존 dangling objects가 현재 저장소에 남지 않는다.
- 정리 직후 현재 로컬과 새 원격 mirror 모두 **329 objects / 261 blobs / 8 commits**, 전체 본문 object **0개**, secret 후보 **0개**. 문서 후속 commit 이후에도 전체 객체를 다시 검사한다.

commit hash가 바뀌었으므로 옛 clone/백업에서 merge 또는 push하면 원문 이력이 다시 공개될 수 있다. 다른 컴퓨터에서는 새 원격을 fresh clone한다. 복구할 때에도 보호된 최신 코드만 복구하며 원래 이력 백업을 push하지 않는다.

## GitHub에서 자동 삭제할 수 없는 잔존

현재 원격 refs의 전체 이력은 깨끗하지만, 정리 전 SHA의 **raw URL 80개가 여전히 HTTP 200으로 바이트 동등한 전체 원문을 반환한다.** 이는 새 clone의 객체 검사와 별도인 GitHub 서버 보관/캐시 범위다. 이 상태를 Git 전체 공개 노출 0건으로 통과 처리하지 않는다.

branch/tag/release/릴리즈 asset/PR/fork/Actions artifact 및 issue/PR에서 확인 가능한 첨부 URL은 없다. 알려지지 않은 개인 clone이나 다운로드, 저장소 API에서 목록화되지 않는 독립 첨부까지 회수했다고 주장하지 않는다.

[GitHub 공식 안내](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)에 따르면 force push 후에도 옛 SHA 캐시가 남을 수 있으며 서버 garbage collection/cached view 처리는 GitHub Support 범위다. 또한 Support는 일반적인 non-sensitive 데이터 삭제를 지원하지 않는다고 명시하므로, **유료 본문에 대한 처리 승인/완료는 보장할 수 없다.**

Git 밖 `GITHUB_SUPPORT_REQUEST.md`에 저장소, first-changed commits, PR/fork/LFS 영향 및 잔존 80개 주소를 포함한 구체적 문의 초안을 작성했다. **외부로 보내지는 않았다.** 저장소 소유자가 [GitHub Support](https://support.github.com/)에 처리 가능 여부를 문의해야 한다. 회신 및 80개 옛 주소의 재검사가 끝나기 전까지 이 항목은 미완료다.

## Vercel 정리

전체 deployment 목록을 조사했다. 시작 시 Production 이력 5개, Preview 0개였다. deployment protection의 로그인 redirect만 보고 본문이 없다고 판정하지 않고, 인증된 Vercel CLI로 이전 배포의 001/050/080을 private 원본과 대조했다. U47 파일럿 배포에서는 050만 잠겨 있고 001/080 원문이 남아 있었으며, 다른 세 배포에도 원문이 있었다.

다음 네 deployment를 삭제했다.

| 삭제 deployment ID | 삭제 후 가이드 URL |
|---|---|
| `dpl_5DFxckYwAC2d4wLDoPpDTtBXLxYZ` | 80개 모두 404 |
| `dpl_2nDVySG91nwmFPx1CGqYdX5S2Jcr` | 80개 모두 404 |
| `dpl_9Nsvwm5jhyw9jMQKTL8cR2nxm5yo` | 80개 모두 404 |
| `dpl_FfnGesXS9XvaKkoTWw9QPxqMSuAZ` | 80개 모두 404 |

각 삭제 직전에 stable domain의 **현재 실제 alias**와 프로젝트 ID를 다시 확인했고 현재 Production은 삭제하지 않았다. 과거 deployment의 기록상 alias와 실제 현재 alias를 구분했다.

원래 보호된 Production `dpl_GzSmt8fWbfBTie4QBuT6L4fU5TBr`는 유지했다. 이력 교체로 동일 코드의 안전한 Production이 자동 생성됐고 READY를 확인했다. 문서 기록 commit으로 추가되는 배포도 보호된 현재 소스만 포함한다.

Production 주소는 계속 **https://bluegee-library-site.vercel.app/** 이다. 상품 80개, 공개 잠금 가이드 URL 80개, 목차 2,087개 및 대표 상세/reader 접근 경로의 smoke test를 통과했다. 실계정 로그인은 추가 요구하지 않았다.

## 소스 밖 사본과 secret 검사

프로젝트 내부 **3,427개 파일**을 ignored 경로까지 검사했다. `.next`, `dist`, `build`, cache, export, temp, generated, public/static, archive/backup 가능 경로를 포함하며 본문 파일 **0개**였다. 존재하지 않는 경로를 사본으로 계산하지 않았다. `.git`은 별도의 전체 object 검사로 처리했다.

개인 원본 80개와 이번 full backup/과거 mirror/private Vercel 응답은 프로젝트 밖 유지관리 폴더에 남겨 두었다. 이는 공개 사본이 아니며 임의 삭제하지 않았다. 그 부모 작업 폴더 전체를 웹 루트로 삼거나 업로드하면 다시 노출될 수 있으므로 배포 루트는 기존 `bluegee-library-site`만 사용한다.

전체 Git 객체에서 Supabase secret/service_role key, JWT의 role/session 값, GitHub/OpenAI/AWS 토큰 형식, Postgres URL 비밀번호 및 민감 변수의 실제 할당 값을 검사해 **실제 secret 후보 0개**를 확인했다. 공개 publishable/anon 값은 서버 비밀정보와 구분했다. 이번 검사에서 credential 교체가 필요한 노출은 발견하지 못했지만, 패턴 검사로 모든 종류의 알 수 없는 비밀정보가 없음을 수학적으로 보장하지는 않는다. 로컬 ignored 설정·CLI 인증은 공개 저장소에 넣지 않는다.

이전에 사용한 `chatgpt.site` 등 다른 호스팅과 개인 다운로드는 이번 GitHub/Vercel 프로젝트 정리로 자동 삭제되지 않는다. 이 범위를 완료 숫자에 포함하지 않는다.

## 검증과 남은 작업

- 기존 보호 API 자동검사 **2/2**: 80개 ID 각각 익명 401, 무권한 403, 해당 entitlement만 허용 및 데이터 무결성.
- 기존 격리 browser 검사: 001/051/080의 원문·목차·deep link·모바일·홈 이동 정상, 오류 0, 비밀번호 로그인 요청 0. Auth/U47을 재구현하거나 반복 실계정 로그인하지 않았다.
- `npm run build:check`: 생성 파일 **94개** 일치.
- Production smoke: 80개 잠금 파일/상품, 2,087개 목차, 확인한 깨진 내부 링크 0, 대표 익명 API 401.
- 이번 보안 정리에서 제품 코드, Auth, DB, RLS, entitlements, reader 또는 UI 기능을 바꾸지 않았다.

**다음 작업은 새 기능 개발이 아니라 GitHub 옛 캐시 80종의 서버 측 제거 가능 여부 확인과 재검사다.** 접근 가능한 캐시가 0이 되기 전까지 전체 보안 정리 완료로 보고하지 않는다.
