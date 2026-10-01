# Audio Library 안정 버전 체크포인트

작성일: 2026-10-01. 범위는 완료된 마스터 카탈로그·상품 소개의 저장과 GitHub main/Vercel Production 배포다. 새 기능·콘텐츠 편집·대규모 디자인 변경은 포함하지 않는다.

## 저장 대상과 검증

상품 원본은 content/products.json이며80종을 관리한다. 탐색은 Outboard49 / Engineer Deep Dive10 / Microphone21이다.050 U47의 마이크 category와 Classic Studio Gear series를 유지한다. 상품별 상세는 공통 product.html에서 동일 마스터로 조회한다. 원본 읽기 URL80개와 실제 목차2,087개를 보존한다.

배포 직전 lint·typecheck·validate·build·9개 테스트와 브라우저 회귀를 다시 통과했다. 목록·검색·카테고리·상세80개·이전/다음·관련 가이드·원본80개·목차2,087개·모바일·임시081의 자동 상세 생성과 제거를 확인했다. 신규 브랜드 필터·로그인·Supabase·결제·즐겨찾기·추천 기능을 추가하지 않았다.

## GitHub와 배포 경로

GitHub 저장소는 yun9207-design/bluegee-library-site, Production 주소는 https://bluegee-library-site.vercel.app/ 이다. 기존 main은 사용자가 배포 파일을 루트에 업로드한 이력이었고 로컬은 소스+dist를 가진 별도 이력이었다. 양쪽 이력을 병합해 보존한다. 기존 GitHub 원본80개와 로컬 dist 원본은 배포 전에 SHA-256이80/80 일치했다.

기존 업로드의 루트 HTML/JS/CSS/guides는 삭제하지 않고 보존한다. 앞으로 운영 소스는 src와content, 배포 산출물은dist다. **루트의 예전 업로드 파일은 현재 화면의 편집 원본이 아니다.** 새 가이드는 CATALOG_MAINTENANCE.md의 dist/guides+products.json 절차를 따른다.

vercel.json이 Other 프레임워크, npm ci 설치, npm run build, dist 출력 경로를 지정한다. 출력 루트가dist이므로 공개 URL의 /guides/... 경로는 그대로이며 감사 문서와 소스는 웹 출력에 포함하지 않는다. Vercel Git 연동은 기존 저장소와main을 사용한다. 실제 배포 상태와 Production 기능은 push 후 다시 확인하며, 완료 여부는 최종 보고에서 구분한다.

원본 가이드 본문에 있었던 과거 감사의 출처·품질 항목은 이번 배포 저장과 별개다. 이 기록은 기존 원문 전체의 외부 참고 링크 검수를 완료했다는 뜻이 아니다.
