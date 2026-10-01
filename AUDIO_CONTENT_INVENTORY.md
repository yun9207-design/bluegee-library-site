# Audio Content Inventory — 80종 전수 인벤토리

감사일 2026-10-01. 대상은 현재 `bluegee-library-site/dist/catalog.js`와 `dist/guides`의 오디오 가이드 80개다. AI 자료, 기획 문서, 감사 산출물을 상품 수에 더하지 않는다.

## 집계와 해석

- 001–050 Classic Studio Gear: 50종.
- 051–060 Engineer Deep Dive / Revision War: 10종.
- 061–080 Microphone Master Library: 20종.
- 장비 탐색 카테고리: 아웃보드49 / 딥다이브10 / 마이크21. 050 U47은 Classic 시리즈이며 마이크 탐색에 포함된다.
- 모든 80종은 파일명 v4, HTTP200, 로컬·배포 일치, 번호·제목·목차 config 일치, 대응 작업 폴더 원본 일치.
- 전체 등록 목차 2,087개. 장 수는 24장1종 /25장12종 /26장49종 /27장15종 /28장3종이다. ‘80종=80개 장비’가 아니라 80개의 가이드 상품이다. 한 문서에서 여러 모델을 다루며 리비전편도 별도 가이드다.
- 운영 PDF 파일과 개별 상품 커버는 현재 없다. 아래 ‘열기’는 전체 공개 HTML이다. 판매용 PDF·미리보기·HTML 패키지 재고를 뜻하지 않는다.

## 구조화된 데이터 파일

[audio-content-inventory.json](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/audit/audio-content-inventory.json>)에 80개 항목을 저장했다. `schemaVersion=audit-snapshot-1`, `authoritativeForRuntime=false`인 **비운영 감사 스냅샷**이다. 사이트는 계속 기존 `dist/catalog.js`를 사용한다.

| 필드 | 성격 / 관리 규칙 |
|---|---|
| guideId / number / title | 안정 ID 초안 audio-001 등, 기존001번호 및 카탈로그 제목 |
| series | 사용자 지정 번호 범위에 따른 50/10/20 소속 |
| equipmentCategory / equipmentTypeRaw | 현재 탐색 분류와 kind; 정규 장비 타입은 후속 편집 |
| brandLabelDraft | 제목과 알려진 모델 계열에서 정리한 편집 초안; aliases/브랜드 조직 관계 검수 필요 |
| summary | 현재 사이트의 한 줄 설명 |
| useCasesDraft | 장 제목과 내부 heading에 용도어가 있는 경우만 추출한 초안; chapterId 및 heading 근거 포함 |
| filename / localPath / legacyUrl / publicUrl | 정확한 원래 파일, 절대 경로, 기존 경로와 공개 URL |
| sourceVersionLabel | 파일 이름의 v4; 검수 통과나 실제 제품 리비전을 뜻하지 않음 |
| lastEditorialUpdate | 현재 일관된 관리 필드가 없으므로 null. 파일명 버전·수정시각·Git 커밋·감사일을 발행일로 대체하지 않음 |
| chapters / chapterCount | 현재2,087개 정확한 목차 ID와 제목 |
| assets | HTML 공개 전체 본문; PDF 미등록; 커버 미등록 |
| sameBrandGuideIdsDraft / relatedGuideIdsDraft | 편집 초안; 관련 주제이지 동일 하드웨어·동일 성능이라는 뜻이 아님 |
| bytes / sha256 / checks | 파일 크기와 해시, config·목차·언어·SEO·배포 검증 결과 |
| auditDate | 이번 검사일2026-10-01. 본문에 표시된 개정일과 별도 |

용도 초안은 ‘이 장비가 모든 해당 소스에 최선이다’라는 추천·계측 결과가 아니다. ‘보컬 / 드럼’ 같은 내용 탐색을 돕는 분류다. 추출되지 않은 용도가 본문에 없다는 뜻도 아니다. 강한 음색·장르·품질 태그는 내용을 읽고 근거와 모델 범위를 확인한 뒤 승인한다.

## 전수 목록

표의 탐색 분류는 현재 폴더/필터이며 시리즈는 각 표의 번호 범위다. ‘자료’ 링크는 실제 배포 파일, ‘파일’ 링크는 로컬 정확한 경로다. 모든 행의 정상 상태는 배포 HTTP200과 로컬 일치 확인이다. 파일명 v4, PDF 없음은 전 행 공통이다.

### Classic Studio Gear

| 번호 | 제목 | 브랜드 초안 | 장비 종류 | 현재 탐색 | 용도 초안 | 장 수 | 정상 링크 / 파일 |
|---|---|---|---|---|---|---:|---|
| 001 | Pultec EQP-1A | Pultec | EQ | 아웃보드 | 보컬, 드럼, 기타, 베이스, 피아노, 브라스, 믹스버스, 마스터링, 방송/나레이션 | 24 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/001-PULTEC_EQP1A_MASTER_MANUAL_BLUEGEE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/001-PULTEC_EQP1A_MASTER_MANUAL_BLUEGEE_v4.html>) |
| 002 | Teletronix LA-2A | Teletronix | Compressor | 아웃보드 | 보컬, 드럼, 베이스, 믹스버스, 방송/나레이션 | 25 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/002-LA2A_MASTER_REFERENCE_BLUEGEE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/002-LA2A_MASTER_REFERENCE_BLUEGEE_v4.html>) |
| 003 | 1176 FET Limiter | UREI / Universal Audio | Compressor | 아웃보드 | 보컬, 드럼, 기타, 베이스 | 25 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/003-BLUEGEE_PLUGIN_MASTER_1176_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/003-BLUEGEE_PLUGIN_MASTER_1176_v4.html>) |
| 004 | Fairchild 660 / 670 | Fairchild | Compressor | 아웃보드 | 보컬, 드럼, 기타, 베이스, 피아노, 믹스버스, 마스터링 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/004-BLUEGEE_PLUGIN_MASTER_004_FAIRCHILD_660_670_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/004-BLUEGEE_PLUGIN_MASTER_004_FAIRCHILD_660_670_v4.html>) |
| 005 | SSL Bus Compressor | SSL | Compressor | 아웃보드 | 드럼, 믹스버스, 마스터링 | 25 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/005-BLUEGEE_PLUGIN_MASTER_SSL_BUS_COMPRESSOR_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/005-BLUEGEE_PLUGIN_MASTER_SSL_BUS_COMPRESSOR_v4.html>) |
| 006 | dbx 160 | dbx | Compressor | 아웃보드 | 보컬, 드럼, 기타, 베이스 | 25 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/006_BLUEGEE_DBX160_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/006_BLUEGEE_DBX160_MASTER_GUIDE_v4.html>) |
| 007 | API 2500 / 2500+ | API | Compressor | 아웃보드 | 보컬, 드럼, 기타, 베이스, 믹스버스, 마스터링 | 25 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/007_BLUEGEE_API2500_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/007_BLUEGEE_API2500_MASTER_GUIDE_v4.html>) |
| 008 | Neve 1073 / 1084 | Neve | Preamp / EQ | 아웃보드 | 보컬, 드럼, 기타, 베이스, 피아노 | 25 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/008_BLUEGEE_NEVE1073_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/008_BLUEGEE_NEVE1073_MASTER_GUIDE_v4.html>) |
| 009 | API 550A / 550B / 5500 | API | EQ | 아웃보드 | 보컬, 드럼, 기타, 베이스, 마스터링 | 25 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/009_BLUEGEE_API550A_550B_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/009_BLUEGEE_API550A_550B_MASTER_GUIDE_v4.html>) |
| 010 | SSL 4000 E / G EQ | SSL | EQ | 아웃보드 | 보컬, 드럼, 기타, 베이스, 피아노, 브라스 | 28 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/010_BLUEGEE_SSL4000_EG_EQ_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/010_BLUEGEE_SSL4000_EG_EQ_MASTER_GUIDE_v4.html>) |
| 011 | EMT 140 Plate Reverb | EMT | Reverb | 아웃보드 | 보컬, 드럼, 기타, 피아노, 방송/나레이션 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/011_BLUEGEE_EMT140_PLATE_REVERB_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/011_BLUEGEE_EMT140_PLATE_REVERB_MASTER_GUIDE_v4.html>) |
| 012 | Lexicon 224 | Lexicon | Reverb | 아웃보드 | 보컬, 드럼, 기타, 베이스, 피아노 | 27 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/012_BLUEGEE_LEXICON224_DIGITAL_REVERB_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/012_BLUEGEE_LEXICON224_DIGITAL_REVERB_MASTER_GUIDE_v4.html>) |
| 013 | Roland RE-201 Space Echo | Roland | Delay | 아웃보드 | 보컬, 드럼, 기타, 베이스, 피아노 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/013_BLUEGEE_ROLAND_RE201_SPACE_ECHO_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/013_BLUEGEE_ROLAND_RE201_SPACE_ECHO_MASTER_GUIDE_v4.html>) |
| 014 | Studer A800 | Studer | Tape | 아웃보드 | 보컬, 드럼, 기타, 베이스, 피아노, 믹스버스 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/014_BLUEGEE_STUDER_A800_TAPE_MACHINE_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/014_BLUEGEE_STUDER_A800_TAPE_MACHINE_MASTER_GUIDE_v4.html>) |
| 015 | Ampex ATR-102 | Ampex | Tape | 아웃보드 | 드럼, 믹스버스, 마스터링 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/015_BLUEGEE_AMPEX_ATR102_MASTERING_TAPE_RECORDER_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/015_BLUEGEE_AMPEX_ATR102_MASTERING_TAPE_RECORDER_MASTER_GUIDE_v4.html>) |
| 016 | Neve 33609 | Neve | Compressor | 아웃보드 | 보컬, 드럼, 기타, 베이스, 피아노, 믹스버스, 마스터링 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/016_BLUEGEE_NEVE_33609_COMPRESSOR_LIMITER_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/016_BLUEGEE_NEVE_33609_COMPRESSOR_LIMITER_MASTER_GUIDE_v4.html>) |
| 017 | Manley Variable Mu | Manley | Compressor | 아웃보드 | 보컬, 드럼, 기타, 베이스, 피아노, 믹스버스, 마스터링 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/017_BLUEGEE_MANLEY_VARIABLE_MU_COMPRESSOR_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/017_BLUEGEE_MANLEY_VARIABLE_MU_COMPRESSOR_MASTER_GUIDE_v4.html>) |
| 018 | Chandler TG1 | Chandler Limited | Compressor | 아웃보드 | 보컬, 드럼, 기타, 베이스, 피아노, 믹스버스, 마스터링 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/018_BLUEGEE_CHANDLER_TG1_LIMITER_COMPRESSOR_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/018_BLUEGEE_CHANDLER_TG1_LIMITER_COMPRESSOR_MASTER_GUIDE_v4.html>) |
| 019 | SSL E-Series Channel Strip | SSL | Channel Strip | 아웃보드 | 보컬, 드럼, 기타, 베이스, 피아노 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/019_BLUEGEE_SSL_E_SERIES_CHANNEL_STRIP_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/019_BLUEGEE_SSL_E_SERIES_CHANNEL_STRIP_MASTER_GUIDE_v4.html>) |
| 020 | API 512c / 312 | API | Preamp | 아웃보드 | 보컬, 드럼, 기타, 베이스, 피아노 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/020_BLUEGEE_API_512C_312_PREAMP_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/020_BLUEGEE_API_512C_312_PREAMP_MASTER_GUIDE_v4.html>) |
| 021 | Empirical Labs Distressor EL8 / EL8-X | Empirical Labs | Compressor | 아웃보드 | 보컬, 드럼, 기타, 베이스, 피아노 | 25 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/021_BLUEGEE_EMPIRICAL_LABS_DISTRESSOR_EL8_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/021_BLUEGEE_EMPIRICAL_LABS_DISTRESSOR_EL8_MASTER_GUIDE_v4.html>) |
| 022 | Tube-Tech CL 1B | Tube-Tech | Compressor | 아웃보드 | 보컬, 드럼, 기타, 베이스, 피아노, 믹스버스 | 25 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/022_BLUEGEE_TUBE_TECH_CL1B_OPTO_COMPRESSOR_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/022_BLUEGEE_TUBE_TECH_CL1B_OPTO_COMPRESSOR_MASTER_GUIDE_v4.html>) |
| 023 | Neve 2254 / 2264 | Neve | Compressor | 아웃보드 | 보컬, 드럼, 기타, 베이스 | 25 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/023_BLUEGEE_NEVE_2254_2264_DIODE_BRIDGE_COMPRESSOR_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/023_BLUEGEE_NEVE_2254_2264_DIODE_BRIDGE_COMPRESSOR_MASTER_GUIDE_v4.html>) |
| 024 | Shadow Hills Mastering Compressor | Shadow Hills | Compressor | 아웃보드 | 보컬, 드럼, 기타, 베이스, 마스터링 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/024_BLUEGEE_SHADOW_HILLS_MASTERING_COMPRESSOR_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/024_BLUEGEE_SHADOW_HILLS_MASTERING_COMPRESSOR_MASTER_GUIDE_v4.html>) |
| 025 | SPL Transient Designer | SPL | Transient | 아웃보드 | 보컬, 드럼, 기타, 베이스, 피아노, 방송/나레이션 | 25 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/025_BLUEGEE_SPL_TRANSIENT_DESIGNER_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/025_BLUEGEE_SPL_TRANSIENT_DESIGNER_MASTER_GUIDE_v4.html>) |
| 026 | Eventide H3000 | Eventide | Harmonizer | 아웃보드 | 보컬, 드럼, 기타 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/026_BLUEGEE_EVENTIDE_H3000_ULTRA_HARMONIZER_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/026_BLUEGEE_EVENTIDE_H3000_ULTRA_HARMONIZER_MASTER_GUIDE_v4.html>) |
| 027 | Eventide H910 / H949 | Eventide | Harmonizer | 아웃보드 | 보컬, 드럼, 기타 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/027_BLUEGEE_EVENTIDE_H910_H949_HARMONIZER_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/027_BLUEGEE_EVENTIDE_H910_H949_HARMONIZER_MASTER_GUIDE_v4.html>) |
| 028 | AMS RMX16 | AMS | Reverb | 아웃보드 | 보컬, 드럼, 기타 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/028_BLUEGEE_AMS_RMX16_DIGITAL_REVERB_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/028_BLUEGEE_AMS_RMX16_DIGITAL_REVERB_MASTER_GUIDE_v4.html>) |
| 029 | Teletronix / UREI LA-3A | Teletronix / UREI | Compressor | 아웃보드 | 보컬, 드럼, 기타, 베이스, 마스터링, 방송/나레이션 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/029_BLUEGEE_TELETRONIX_UREI_LA3A_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/029_BLUEGEE_TELETRONIX_UREI_LA3A_MASTER_GUIDE_v4.html>) |
| 030 | Avalon VT-737SP | Avalon | Channel Strip | 아웃보드 | 보컬, 드럼, 기타, 베이스 | 27 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/030_BLUEGEE_AVALON_VT737SP_CHANNEL_STRIP_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/030_BLUEGEE_AVALON_VT737SP_CHANNEL_STRIP_MASTER_GUIDE_v4.html>) |
| 031 | Manley Massive Passive | Manley | EQ | 아웃보드 | 보컬, 드럼, 기타, 베이스, 피아노, 마스터링 | 27 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/031_BLUEGEE_MANLEY_MASSIVE_PASSIVE_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/031_BLUEGEE_MANLEY_MASSIVE_PASSIVE_MASTER_GUIDE_v4.html>) |
| 032 | Neve 1084 | Neve | Preamp / EQ | 아웃보드 | 보컬, 드럼, 기타, 베이스, 피아노, 브라스 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/032_BLUEGEE_NEVE_1084_PREAMP_EQ_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/032_BLUEGEE_NEVE_1084_PREAMP_EQ_MASTER_GUIDE_v4.html>) |
| 033 | Neve 1081 | Neve | Preamp / EQ | 아웃보드 | 보컬, 드럼, 기타, 베이스 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/033_BLUEGEE_NEVE_1081_PREAMP_EQ_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/033_BLUEGEE_NEVE_1081_PREAMP_EQ_MASTER_GUIDE_v4.html>) |
| 034 | API 3124 / 3124+ / 3124V | API | Preamp | 아웃보드 | 보컬, 드럼, 기타, 베이스, 피아노 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/034_BLUEGEE_API_3124_3124PLUS_MIC_PREAMP_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/034_BLUEGEE_API_3124_3124PLUS_MIC_PREAMP_MASTER_GUIDE_v4.html>) |
| 035 | API 560 | API | EQ | 아웃보드 | 보컬, 드럼, 기타, 베이스 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/035_BLUEGEE_API_560_GRAPHIC_EQ_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/035_BLUEGEE_API_560_GRAPHIC_EQ_MASTER_GUIDE_v4.html>) |
| 036 | Chandler Curve Bender | Chandler Limited | EQ | 아웃보드 | 보컬, 드럼, 베이스, 믹스버스, 마스터링 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/036_BLUEGEE_CHANDLER_CURVE_BENDER_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/036_BLUEGEE_CHANDLER_CURVE_BENDER_MASTER_GUIDE_v4.html>) |
| 037 | Universal Audio 610 / 2-610 | Universal Audio | Preamp | 아웃보드 | 보컬, 드럼, 기타, 베이스, 피아노 | 27 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/037_BLUEGEE_UNIVERSAL_AUDIO_610_2-610_TUBE_PREAMP_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/037_BLUEGEE_UNIVERSAL_AUDIO_610_2-610_TUBE_PREAMP_MASTER_GUIDE_v4.html>) |
| 038 | Universal Audio 6176 | Universal Audio | Channel Strip | 아웃보드 | 보컬, 드럼, 기타, 베이스, 피아노 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/038_BLUEGEE_UNIVERSAL_AUDIO_6176_CHANNEL_STRIP_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/038_BLUEGEE_UNIVERSAL_AUDIO_6176_CHANNEL_STRIP_MASTER_GUIDE_v4.html>) |
| 039 | 1176 Revision Guide | UREI / Universal Audio | Compressor | 아웃보드 | 편집 확인 필요 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/039_BLUEGEE_1176_REVISION_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/039_BLUEGEE_1176_REVISION_MASTER_GUIDE_v4.html>) |
| 040 | Avalon U5 | Avalon | DI | 아웃보드 | 기타, 베이스, 피아노 | 27 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/040_BLUEGEE_AVALON_U5_DI_PREAMP_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/040_BLUEGEE_AVALON_U5_DI_PREAMP_MASTER_GUIDE_v4.html>) |
| 041 | Manley VOXBOX | Manley | Channel Strip | 아웃보드 | 보컬, 기타, 베이스, 피아노, 방송/나레이션 | 27 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/041_BLUEGEE_MANLEY_VOXBOX_CHANNEL_STRIP_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/041_BLUEGEE_MANLEY_VOXBOX_CHANNEL_STRIP_MASTER_GUIDE_v4.html>) |
| 042 | Thermionic Culture Vulture | Thermionic Culture | Saturation | 아웃보드 | 보컬, 드럼, 기타, 베이스, 믹스버스, 마스터링 | 27 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/042_BLUEGEE_THERMIONIC_CULTURE_VULTURE_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/042_BLUEGEE_THERMIONIC_CULTURE_VULTURE_MASTER_GUIDE_v4.html>) |
| 043 | Empirical Labs FATSO EL7 / EL7X | Empirical Labs | Saturation | 아웃보드 | 보컬, 드럼, 기타, 베이스, 피아노, 믹스버스, 방송/나레이션 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/043_BLUEGEE_EMPIRICAL_LABS_FATSO_EL7_EL7X_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/043_BLUEGEE_EMPIRICAL_LABS_FATSO_EL7_EL7X_MASTER_GUIDE_v4.html>) |
| 044 | Focusrite ISA 110 / ISA 430 | Focusrite | Preamp / Channel Strip | 아웃보드 | 보컬, 드럼, 기타, 베이스, 방송/나레이션 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/044_BLUEGEE_FOCUSRITE_ISA110_ISA430_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/044_BLUEGEE_FOCUSRITE_ISA110_ISA430_MASTER_GUIDE_v4.html>) |
| 045 | Drawmer 1960 | Drawmer | Compressor | 아웃보드 | 보컬, 드럼, 기타, 베이스, 피아노, 믹스버스, 방송/나레이션 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/045_BLUEGEE_DRAWMER_1960_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/045_BLUEGEE_DRAWMER_1960_MASTER_GUIDE_v4.html>) |
| 046 | Trident A-Range | Trident | EQ | 아웃보드 | 보컬, 드럼, 기타, 베이스, 믹스버스 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/046_BLUEGEE_TRIDENT_A_RANGE_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/046_BLUEGEE_TRIDENT_A_RANGE_MASTER_GUIDE_v4.html>) |
| 047 | Helios Type 69 | Helios | EQ | 아웃보드 | 보컬, 드럼, 기타, 베이스 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/047_BLUEGEE_HELIOS_TYPE69_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/047_BLUEGEE_HELIOS_TYPE69_MASTER_GUIDE_v4.html>) |
| 048 | Summit Audio TLA-100A | Summit Audio | Compressor | 아웃보드 | 보컬, 드럼, 기타, 베이스, 마스터링 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/048_BLUEGEE_SUMMIT_AUDIO_TLA100A_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/048_BLUEGEE_SUMMIT_AUDIO_TLA100A_MASTER_GUIDE_v4.html>) |
| 049 | GML 8200 | GML | EQ | 아웃보드 | 보컬, 드럼, 기타, 베이스, 마스터링 | 27 | [자료 200](https://bluegee-library-site.vercel.app/guides/outboard/049_BLUEGEE_GML_8200_PARAMETRIC_EQ_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/outboard/049_BLUEGEE_GML_8200_PARAMETRIC_EQ_MASTER_GUIDE_v4.html>) |
| 050 | Neumann U 47 | Neumann | Tube Condenser | 마이크 | 보컬, 드럼, 기타, 베이스, 피아노, 브라스, 방송/나레이션 | 27 | [자료 200](https://bluegee-library-site.vercel.app/guides/microphone/050_BLUEGEE_NEUMANN_U47_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/microphone/050_BLUEGEE_NEUMANN_U47_MASTER_GUIDE_v4.html>) |

### Engineer Deep Dive / Revision War

| 번호 | 제목 | 브랜드 초안 | 장비 종류 | 현재 탐색 | 용도 초안 | 장 수 | 정상 링크 / 파일 |
|---|---|---|---|---|---|---:|---|
| 051 | 1176 Revision War | UREI / Universal Audio | Compressor | 딥다이브 | 보컬, 드럼, 기타, 베이스, 피아노 | 27 | [자료 200](https://bluegee-library-site.vercel.app/guides/deep-dive/051_BLUEGEE_1176_REVISION_WAR_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/deep-dive/051_BLUEGEE_1176_REVISION_WAR_MASTER_GUIDE_v4.html>) |
| 052 | LA-2A Revision War | Teletronix | Compressor | 딥다이브 | 보컬 | 27 | [자료 200](https://bluegee-library-site.vercel.app/guides/deep-dive/052_BLUEGEE_LA2A_REVISION_WAR_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/deep-dive/052_BLUEGEE_LA2A_REVISION_WAR_MASTER_GUIDE_v4.html>) |
| 053 | Neve Family War | Neve | Preamp / EQ | 딥다이브 | 보컬, 드럼, 베이스 | 27 | [자료 200](https://bluegee-library-site.vercel.app/guides/deep-dive/053_BLUEGEE_NEVE_FAMILY_WAR_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/deep-dive/053_BLUEGEE_NEVE_FAMILY_WAR_MASTER_GUIDE_v4.html>) |
| 054 | SSL EQ War | SSL | EQ | 딥다이브 | 보컬, 피아노 | 27 | [자료 200](https://bluegee-library-site.vercel.app/guides/deep-dive/054_BLUEGEE_SSL_EQ_WAR_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/deep-dive/054_BLUEGEE_SSL_EQ_WAR_MASTER_GUIDE_v4.html>) |
| 055 | Pultec Family Deep Dive | Pultec | EQ | 딥다이브 | 보컬, 드럼, 기타, 베이스, 피아노, 믹스버스, 마스터링, 방송/나레이션 | 27 | [자료 200](https://bluegee-library-site.vercel.app/guides/deep-dive/055_BLUEGEE_PULTEC_FAMILY_DEEP_DIVE_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/deep-dive/055_BLUEGEE_PULTEC_FAMILY_DEEP_DIVE_MASTER_GUIDE_v4.html>) |
| 056 | API EQ War | API | EQ | 딥다이브 | 보컬, 드럼, 기타, 베이스, 피아노, 믹스버스, 마스터링 | 28 | [자료 200](https://bluegee-library-site.vercel.app/guides/deep-dive/056_BLUEGEE_API_EQ_WAR_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/deep-dive/056_BLUEGEE_API_EQ_WAR_MASTER_GUIDE_v4.html>) |
| 057 | Distressor Deep Dive | Empirical Labs | Compressor | 딥다이브 | 편집 확인 필요 | 28 | [자료 200](https://bluegee-library-site.vercel.app/guides/deep-dive/057_BLUEGEE_DISTRESSOR_DEEP_DIVE_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/deep-dive/057_BLUEGEE_DISTRESSOR_DEEP_DIVE_MASTER_GUIDE_v4.html>) |
| 058 | Manley Variable Mu Deep Dive | Manley | Compressor | 딥다이브 | 보컬, 드럼, 기타, 베이스, 피아노, 믹스버스, 마스터링 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/deep-dive/058_BLUEGEE_MANLEY_VARIABLE_MU_DEEP_DIVE_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/deep-dive/058_BLUEGEE_MANLEY_VARIABLE_MU_DEEP_DIVE_MASTER_GUIDE_v4.html>) |
| 059 | Fairchild 660 / 670 War | Fairchild | Compressor | 딥다이브 | 편집 확인 필요 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/deep-dive/059_BLUEGEE_FAIRCHILD_660_670_WAR_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/deep-dive/059_BLUEGEE_FAIRCHILD_660_670_WAR_MASTER_GUIDE_v4.html>) |
| 060 | Abbey Road RS124 Serial War | EMI / Abbey Road | Compressor | 딥다이브 | 보컬, 드럼, 베이스, 믹스버스, 마스터링 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/deep-dive/060_BLUEGEE_ABBEY_ROAD_RS124_SERIAL_WAR_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/deep-dive/060_BLUEGEE_ABBEY_ROAD_RS124_SERIAL_WAR_MASTER_GUIDE_v4.html>) |

### Microphone Master Library

| 번호 | 제목 | 브랜드 초안 | 장비 종류 | 현재 탐색 | 용도 초안 | 장 수 | 정상 링크 / 파일 |
|---|---|---|---|---|---|---:|---|
| 061 | Neumann U 67 | Neumann | Tube Condenser | 마이크 | 보컬, 드럼, 기타, 베이스, 피아노 | 27 | [자료 200](https://bluegee-library-site.vercel.app/guides/microphone/061_BLUEGEE_NEUMANN_U67_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/microphone/061_BLUEGEE_NEUMANN_U67_MASTER_GUIDE_v4.html>) |
| 062 | Neumann U 87 / U 87 Ai | Neumann | FET Condenser | 마이크 | 보컬, 드럼, 기타, 베이스, 피아노, 브라스, 방송/나레이션 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/microphone/062_BLUEGEE_NEUMANN_U87_U87AI_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/microphone/062_BLUEGEE_NEUMANN_U87_U87AI_MASTER_GUIDE_v4.html>) |
| 063 | Neumann M 49 / M 49 V | Neumann | Tube Condenser | 마이크 | 보컬, 드럼, 피아노, 브라스 | 25 | [자료 200](https://bluegee-library-site.vercel.app/guides/microphone/063_BLUEGEE_NEUMANN_M49_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/microphone/063_BLUEGEE_NEUMANN_M49_MASTER_GUIDE_v4.html>) |
| 064 | AKG C12 / C12 VR | AKG | Tube Condenser | 마이크 | 보컬, 드럼, 기타, 피아노, 브라스 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/microphone/064_BLUEGEE_AKG_C12_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/microphone/064_BLUEGEE_AKG_C12_MASTER_GUIDE_v4.html>) |
| 065 | Telefunken ELA M 251 / 251E | Telefunken | Tube Condenser | 마이크 | 보컬, 드럼, 기타, 피아노, 브라스 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/microphone/065_BLUEGEE_TELEFUNKEN_ELA_M_251_251E_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/microphone/065_BLUEGEE_TELEFUNKEN_ELA_M_251_251E_MASTER_GUIDE_v4.html>) |
| 066 | AKG C414 Family | AKG | FET Condenser | 마이크 | 보컬, 드럼, 기타, 베이스, 피아노, 브라스 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/microphone/066_BLUEGEE_AKG_C414_FAMILY_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/microphone/066_BLUEGEE_AKG_C414_FAMILY_MASTER_GUIDE_v4.html>) |
| 067 | Sony C-800G | Sony | Tube Condenser | 마이크 | 보컬, 드럼, 기타, 베이스, 피아노, 브라스, 방송/나레이션 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/microphone/067_BLUEGEE_SONY_C800G_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/microphone/067_BLUEGEE_SONY_C800G_MASTER_GUIDE_v4.html>) |
| 068 | Neumann U 47 fet | Neumann | FET Condenser | 마이크 | 보컬, 드럼, 기타, 베이스, 브라스 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/microphone/068_BLUEGEE_NEUMANN_U47_FET_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/microphone/068_BLUEGEE_NEUMANN_U47_FET_MASTER_GUIDE_v4.html>) |
| 069 | Shure SM7 / SM7A / SM7B | Shure | Dynamic | 마이크 | 보컬, 드럼, 기타, 베이스, 브라스, 방송/나레이션 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/microphone/069_BLUEGEE_SHURE_SM7_SM7B_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/microphone/069_BLUEGEE_SHURE_SM7_SM7B_MASTER_GUIDE_v4.html>) |
| 070 | Shure SM57 | Shure | Dynamic | 마이크 | 보컬, 드럼, 기타, 베이스, 브라스 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/microphone/070_BLUEGEE_SHURE_SM57_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/microphone/070_BLUEGEE_SHURE_SM57_MASTER_GUIDE_v4.html>) |
| 071 | Sennheiser MD 421 | Sennheiser | Dynamic | 마이크 | 보컬, 드럼, 기타, 베이스, 브라스, 방송/나레이션 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/microphone/071_BLUEGEE_SENNHEISER_MD421_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/microphone/071_BLUEGEE_SENNHEISER_MD421_MASTER_GUIDE_v4.html>) |
| 072 | Sennheiser MD 441-U | Sennheiser | Dynamic | 마이크 | 보컬, 드럼, 기타, 베이스, 브라스, 방송/나레이션 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/microphone/072_BLUEGEE_SENNHEISER_MD441_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/microphone/072_BLUEGEE_SENNHEISER_MD441_MASTER_GUIDE_v4.html>) |
| 073 | Electro-Voice RE20 | Electro-Voice | Dynamic | 마이크 | 보컬, 드럼, 기타, 베이스, 브라스, 방송/나레이션 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/microphone/073_BLUEGEE_ELECTRO_VOICE_RE20_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/microphone/073_BLUEGEE_ELECTRO_VOICE_RE20_MASTER_GUIDE_v4.html>) |
| 074 | RCA 44-BX | RCA | Ribbon | 마이크 | 보컬, 드럼, 기타, 베이스, 피아노, 브라스, 방송/나레이션 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/microphone/074_BLUEGEE_RCA_44BX_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/microphone/074_BLUEGEE_RCA_44BX_MASTER_GUIDE_v4.html>) |
| 075 | RCA 77-DX | RCA | Ribbon | 마이크 | 보컬, 드럼, 기타, 베이스, 브라스, 방송/나레이션 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/microphone/075_BLUEGEE_RCA_77DX_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/microphone/075_BLUEGEE_RCA_77DX_MASTER_GUIDE_v4.html>) |
| 076 | Coles 4038 | Coles | Ribbon | 마이크 | 보컬, 드럼, 기타, 베이스, 피아노, 브라스, 방송/나레이션 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/microphone/076_BLUEGEE_COLES_4038_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/microphone/076_BLUEGEE_COLES_4038_MASTER_GUIDE_v4.html>) |
| 077 | Royer R-121 | Royer | Ribbon | 마이크 | 보컬, 드럼, 기타, 브라스 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/microphone/077_BLUEGEE_ROYER_R121_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/microphone/077_BLUEGEE_ROYER_R121_MASTER_GUIDE_v4.html>) |
| 078 | Beyerdynamic M 160 | Beyerdynamic | Ribbon | 마이크 | 보컬, 드럼, 기타, 브라스 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/microphone/078_BLUEGEE_BEYERDYNAMIC_M160_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/microphone/078_BLUEGEE_BEYERDYNAMIC_M160_MASTER_GUIDE_v4.html>) |
| 079 | AKG C451 / CK1 | AKG | SDC | 마이크 | 드럼, 기타, 베이스, 피아노, 브라스 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/microphone/079_BLUEGEE_AKG_C451_CK1_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/microphone/079_BLUEGEE_AKG_C451_CK1_MASTER_GUIDE_v4.html>) |
| 080 | Neumann KM 84 | Neumann | SDC | 마이크 | 드럼, 기타, 피아노 | 26 | [자료 200](https://bluegee-library-site.vercel.app/guides/microphone/080_BLUEGEE_NEUMANN_KM84_MASTER_GUIDE_v4.html) · [파일](<C:/Users/ADMIN/Desktop/vst 데이터 001-080 코덱스업글버전/bluegee-library-site/dist/guides/microphone/080_BLUEGEE_NEUMANN_KM84_MASTER_GUIDE_v4.html>) |

## 장비 종류별 분포

아래 수는 가이드의 현재 `kind`를 세었으므로 리비전편도 포함한다. 비교표의 물리 장비 수로 사용하지 않는다.

| 현재 kind | 가이드 수 |
|---|---:|
| EQ | 12 |
| Compressor | 23 |
| Preamp / EQ | 4 |
| Reverb | 3 |
| Delay | 1 |
| Tape | 2 |
| Channel Strip | 4 |
| Preamp | 3 |
| Transient | 1 |
| Harmonizer | 2 |
| DI | 1 |
| Saturation | 2 |
| Preamp / Channel Strip | 1 |
| Tube Condenser | 6 |
| FET Condenser | 3 |
| Dynamic | 5 |
| Ribbon | 5 |
| SDC | 2 |

## 기본편과 심층편의 연결 초안

| 기본 / 계열 가이드 | 심층 가이드 | 상세에서 설명할 차이 |
|---|---|---|
| 003 1176, 039 리비전 안내 | 051 1176 Revision War | 기본 조작·레시피와 리비전별 회로·비교 범위 |
| 002 LA-2A | 052 LA-2A Revision War | 광학 레벨링 기본과 세대 차이 |
| 008 1073/1084, 032 1084, 033 1081, 016 33609, 023 2254/2264 | 053 Neve Family War | 개별 장비와 계열 비교; 프리앰프/EQ와 컴프레서의 사양 구분 |
| 010 SSL4000 E/G EQ, 019 E-Series Channel Strip | 054 SSL EQ War | EQ 모델과 채널스트립의 범위 차이 |
| 001 Pultec EQP-1A | 055 Pultec Family Deep Dive | 기본 EQ와 계열 차이 |
| 009 API550, 035 API560 | 056 API EQ War | 개별 조작과 계열 비교 |
| 021 Distressor | 057 Distressor Deep Dive | 기본 운용과 심층 비교 |
| 017 Variable Mu | 058 Variable Mu Deep Dive | 기본 운용과 심층 비교 |
| 004 Fairchild660/670 | 059 Fairchild War | 기본 원리와 세대·모델 비교 |
| 018 TG1, 036 Curve Bender | 060 RS124 Serial War | 스튜디오 계보 관련 자료; TG1과RS124는 같은 장비의 리비전이 아님 |

마이크에서는050/061/063/068의 계열·모델 구분,064/065의 튜브 계열,069/071/072/073의 다이내믹 소스 운용,074–078의 리본 구조,079/080의 SDC 운용을 연관 탐색 초안으로 삼는다.050U47과068U47fet는 별도 모델이다. 같은 브랜드·용도 탐색과 같은 모델의 리비전 비교를 구분한다.

## 콘텐츠 상품화 전에 확인할 점

역사, 회로, 모델별 경계, 소스별 레시피, 도식, 비교 실습과 기록 도구는 이미 핵심 자산이다. v4의 정정 카드·출처층도 상품 신뢰도를 높일 수 있다.

다만 일부 마이크 본문에는 ‘유일무이’, ‘완벽’, ‘무왜곡’ 같은 표현이 남는다. 이번 감사는 해당 표현을 발견한 것이며 모든 주장을 틀렸다고 판단한 것은 아니다. 판매용 편집에서 공식 사양·시험 조건·의견을 구분하는 검토가 필요하다.

‘실제 음향 계측 미실행’, ‘레시피는 출발점’과 같은 적용 범위는 유지한다. 단정 표현 밀도나 인용 수는 검수 우선순위 신호로 사용할 수 있지만 오류 개수로 표시하지 않는다. 교육용 곡선·가상 작업 기록을 BlueGEE 제품의 실측 증거로 재사용하지 않는다.

## 081 이후 등록 원칙 — 설계만

새 자료는 `content/guides/081-...html`과 `content/metadata/081.json`을 추가하는 형태를 권한다. metadata에는 안정ID·제목·series·brandIds·equipmentTypeIds·useCaseIds·URL·언어·판본·Asset 상태를 둔다. 생성기는 기존 catalog.js, 정적 목록, 카테고리 수량, 상품 상세, 관련 자료, 검색 인덱스와 sitemap을 산출한다.

등록 검증에서는 번호·URL·ID 중복, 실제 파일·목차 ID 존재, 발행 상태, 브랜드·태그 참조, 번들 멤버 존재를 검사한다. 기존80개 파일 URL은 유지한다.081이 추가돼도 기존 ‘Complete80’ 구매 상품의 구성은 자동으로81로 바뀌지 않고 새 판본·추가팩 정책을 따른다.

## P0-1 구현 기록 — 2026-10-01

이번 추가 기록은 앞의 감사/설계 스냅샷을 보존하면서 실제 구현 상태를 구분한다. 상품 원본은 `content/products.json` 한 파일이며, 현재 정적 HTML·JavaScript 구조에 맞춰 JSON을 선택했다. JSON Schema와 파일·목차·참조 검증을 통과하면 `dist/catalog.js`, `dist/products.json`, `dist/index.html`, `dist/app.js`, `dist/catalog-core.js`를 생성한다. 마스터나 템플릿을 수정한 뒤 `npm run build`를 실행한다. 생성 파일을 직접 수정하지 않는다.

80개 상품의 ID·번호·slug·제목·브랜드·시리즈·category·subcategory·equipmentType·설명·검색어·HTML/PDF/커버·상태·추천·관계·번들·날짜를 관리한다. 확인할 수 없는 PDF·커버·편집 날짜는 null, 미확정 관련 자료는[]다. 번호 기준 시리즈50/10/20과 현재 탐색49/10/21을 분리했다.050U47의 기존 마이크 경로·분류를 보존했다.

현재 홈페이지는 기존 디자인을 유지하면서 브랜드·시리즈만 작은 메타 정보로 표시한다. 제목·브랜드·장비 종류·분류·검색어 검색과 All/카테고리 필터가 마스터에서 동작한다. Brand/Equipment Type은 조회 API와 facets 구조를 준비했다. `getProductDetail`은 같은 데이터로 ID·번호·slug 조회를 지원한다. 새 판매용 상세 화면은 만들지 않았다. 원래 `reader.html?id=002&chapter=tab-history` 호환 어댑터도 생성한다.

실제 브라우저에서80개 자료 링크,2,087개 공통 목차,검색·필터·홈320/390/768/1440px·대표 독서 모바일·읽음 표시를 확인했다. 임시081을 격리된 데이터/폴더에 추가해 전체81·아웃보드50·검색·상세 조회·읽기를 확인한 뒤 제거했다. 최종 마스터는80개다. lint/typecheck/validate/build/build:check와7개 테스트를 통과했다.

원래80개 가이드, styles.css, reader.html, reader.js는 변경하지 않았다. 기존 감사의 외부 출처/숨겨진 옛 참조/072 표·포커스 결함은 이번 구현에서 해결했다고 주장하지 않는다. 로그인·결제·Supabase·AI API·PDF 제작·GitHub push·Vercel 배포를 수행하지 않았다.

신규 추가의 정확한 절차와 스키마,향후products/bundles/users/purchases/entitlements 이전 방향은 [CATALOG_MAINTENANCE.md](CATALOG_MAINTENANCE.md)를 참조한다. 기존 80종 고정 번들은 planned이며,081 추가만으로 Complete80 구성에 자동 편입하지 않는다. JSON과 DB의 이중 원본을 만들지 않고 이전 시점에 원본을 명확하게 전환한다.

다음 구현 후보는 기존 읽기 링크를 보존하는 **상품 상세 소개 화면** 하나다. 이번에는 해당 화면의 데이터 조회 구조까지만 준비했다.

## 상세 소개 연결과 관계 검토 — 2026-10-01

인벤토리의 번호·제목·기존 URL·분류를 보존하고80개 공통 상세 소개를 연결했다. 운영 원본은 계속 `content/products.json`이다. 원문의2,087개 목차는 빌드에서 추출하며 소개 화면에서 원래 장으로 연결된다. 번호 시리즈50/10/20과 탐색49/10/21,050 U47의 예외는 바뀌지 않았다.

관련 자료 초안 중 실제 모델·계열이 명확한10묶음25개 상품에만 relatedIds를 등록했다.001/055,002/052,003/039/051,004/059,008/032/033/053,009/035/056,010/019/054,017/058,021/057,050/068이다. U47fet와 U47은 별도 모델로 유지한다. 그 밖의 근거가 부족한 관계는[]로 남겨 자동 추천을 만들지 않았다.

소개용 선택 highlights/whyItMatters는 같은 상품 객체에서 관리한다. 기존80개 기본 소개는 목차·짧은 설명에서 구성해 상세 데이터 복제를 피했다. 임시081의 실제 화면·이동·원본 읽기를 확인한 뒤 제거했다. 최종80개다. 변경 및 검증 근거는 [PRODUCT_DETAIL_IMPLEMENTATION.md](PRODUCT_DETAIL_IMPLEMENTATION.md), 추가 절차는 [CATALOG_MAINTENANCE.md](CATALOG_MAINTENANCE.md)를 따른다. 이전 감사 JSON은 비운영 스냅샷으로 보존한다.
