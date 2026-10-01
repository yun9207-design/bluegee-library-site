# 공개 콘텐츠 이력 정리 계획

2026-10-01. **이 문서는 실행 계획이며 이번 작업에서는 이력 재작성, force push, 저장소 공개 범위 변경, 과거 배포 삭제를 실행하지 않는다.**

## 노출 범위

현재 배포와 현재 파일의 전체 본문 제거는 과거 공개 사본의 회수를 뜻하지 않는다. GitHub `yun9207-design/bluegee-library-site`는 public이며 아래 이력에 80종 원문이 남아 있다.

- 001–049, 051–080: `4ad299276470eaba550a3fc0041255487e99a102`의 `dist/guides/` 경로에 79종 원문.
- 050 U47: `878c848f51e21da27db75d0ddace82b17e8d3fd4`의 기존 `dist/guides/microphone/050_BLUEGEE_NEUMANN_U47_MASTER_GUIDE_v4.html`에 원문.
- 원문 사본은 이력의 root `guides/`에도 있다. 두 경로 모두 정리 대상이다. 현재 root/dist의 같은 경로는 잠금 화면이므로 현재 URL을 바꿀 필요가 없다.
- GitHub raw/commit URL, PR 참조·캐시, forks/clones, 과거 Vercel·Sites 배포, 타인이 저장한 파일은 각각 별도 범위다. Git 이력만 고쳐도 모든 사본을 회수할 수는 없다.

현재 작업 트리의 추적 파일에서 전체 `audio-guide-chapter` 본문을 검사하고, 80종의 이전 commit 본문을 비공개 백업과 대조한다. 대표 001/050은 공개 raw URL의 응답도 대조한다. 근거는 Git 밖의 유지관리 폴더 `2026-10-01-all-guides/history-exposure.json`에 남긴다. 원문이나 raw 응답 자체는 감사 문서에 넣지 않는다.

## 정리 전 필수 조건

1. 비공개 DB 80행과 Git 밖 원본 백업의 해시·바이트 수를 먼저 확인한다. 기존 2,087개 목차와 80개 잠금 URL도 확인한다.
2. 현재 보호된 main을 별도 보관하고, 현재의 root/dist **잠금 화면만** 안전한 임시 ZIP으로 보관한다. ZIP과 옛 mirror 백업은 원격 public 저장소에 올리지 않는다.
3. collaborator의 push/CI를 중지할 정리 시간을 합의한다. branch protection의 force-push 허용과 GitHub 관리자 권한이 필요하다. 기존 clone을 다시 push하면 원문 이력이 부활할 수 있다.
4. 전체 refs/branches/tags, PR refs, forks와 과거 배포 목록을 조사한다. 본문이 다른 경로/첨부/릴리즈 asset에도 있는지 추가 검사한다.

## 별도 승인 후 수행할 정확한 Git 절차

아래 예시는 비어 있는 별도 관리 폴더에서 실행한다. 현재 작업 저장소에서 실행하지 않는다. 모든 명령은 **미실행** 상태다. mirror와 ZIP을 공개 웹 폴더에 놓지 않는다. 최신 git-filter-repo의 설치와 옵션은 [GitHub 이력 제거 안내](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)를 확인한다.

```powershell
# 현재 보호된 main에서 현재 URL의 잠금 화면만 저장
git archive --format=zip --output=C:/BlueGEE-History-Cleanup/current-lock-shells.zip main guides dist/guides

# 별도 fresh mirror: 다른 경로의 이력은 보존, 두 guides 경로의 모든 판본 제거
git clone --mirror https://github.com/yun9207-design/bluegee-library-site.git C:/BlueGEE-History-Cleanup/rewritten.git
Set-Location C:/BlueGEE-History-Cleanup/rewritten.git
git filter-repo --sensitive-data-removal --invert-paths --path guides/ --path dist/guides/

# 정리된 저장소에서 current main의 잠금 URL들을 다시 등록
git clone --no-local C:/BlueGEE-History-Cleanup/rewritten.git C:/BlueGEE-History-Cleanup/verified
Set-Location C:/BlueGEE-History-Cleanup/verified
git checkout main
Expand-Archive -LiteralPath C:/BlueGEE-History-Cleanup/current-lock-shells.zip -DestinationPath C:/BlueGEE-History-Cleanup/verified
git add guides dist/guides
git commit -m "Restore protected guide URLs after historical content removal"
npm.cmd ci
npm.cmd run build
npm.cmd run build:check
npm.cmd run test:protection
git status --short
git push origin main

# reviewed mirror의 모든 refs를 검토한 다음에만 원격 이력 교체
Set-Location C:/BlueGEE-History-Cleanup/rewritten.git
# filter-repo는 origin을 제거할 수 있으므로 실제 remote 상태를 먼저 확인
git remote -v
git remote add origin https://github.com/yun9207-design/bluegee-library-site.git
git push --force --mirror origin
```

`git remote add`는 origin이 없을 때만 실행한다. 위 mirror push는 **모든 원격 refs를 교체/삭제할 수 있으므로** branch/tag 목록을 검토하고 fresh mirror 백업과 복구 담당자를 확보한 뒤 실행한다. GitHub의 읽기 전용 PR refs는 push가 거절될 수 있다. 실패 메시지를 무시하지 말고 해당 refs와 cached views에 대해 GitHub Support에 정리를 요청한다. 본문 전체를 제거한 paths를 latest commit에서 잠금 파일로 다시 생성하므로 사이트 URL은 유지된다. 현재 코드/환경변수/DB는 보존한다.

## Git 외부 사본 정리

- GitHub: 릴리즈 첨부와 Pages 배포가 있다면 별도 삭제·재배포한다. forks 소유자에게 정리 요청이 필요할 수 있다. 개인 clone/다운로드의 회수는 보장할 수 없다.
- Vercel: 기존 배포별 원문 URL을 조사한 뒤 보호된 최신 Production을 유지하고, 과거 public deployments를 별도 승인으로 삭제/접근 제한한다. 단순 새 배포나 rollback은 과거 unique deployment URL을 없애지 않는다. 원문이 있는 배포로 rollback하지 않는다.
- Sites/다른 호스팅: 이전 `chatgpt.site` 배포도 독립적으로 비공개/삭제 처리한다. Vercel 변경으로 다른 호스팅 파일이 정리되지 않는다.
- 기존 collaborators는 정리된 원격에서 fresh clone한다. 옛 clone의 branch/tag를 merge/push하지 않는다. 정리 후 branch protection을 복원한다.

## 위험과 완료 기준

commit hash·서명·tags·GitHub commit/PR 링크가 바뀌며 CI/preview 배포가 재실행될 수 있다. mirror force push는 일반 배포와 달리 되돌리기 어렵다. 원문을 포함한 백업에서 복구하면 공개 노출도 복구되므로 rollback은 보호된 최신 코드 기준으로 한다.

완료 시 현재 80종 URL/카탈로그/목차, 비공개 DB 무결성, 새 원격의 reachable blobs/refs, 대표 옛 raw URL, PR 캐시와 호스팅별 old URL을 각각 확인한다. 외부 forks/다운로드까지 회수했다고 주장하지 않는다. 저장소를 private로 바꾸는 것은 향후 일반 접근을 줄이지만 기존 공개 사본을 삭제하는 것과 같지 않다.
