# 와이어프레임

웹사이트 퍼블리싱 와이어프레임 프로젝트입니다.  
번들러 없이 ES Module + jQuery + Swiper 조합으로 구성되어 있으며, SCSS는 VSCode Live Sass Compiler로 컴파일합니다.

---

## 기술 스택

| 구분 | 내용 |
|---|---|
| JS | ES Module + jQuery + Swiper |
| CSS | SCSS → Live Sass Compiler 컴파일 |
| 빌드 도구 | VSCode [Live Sass Compiler] |
| 폰트 | Noto Sans KR, Pretendard GOV, Remix Icon |
| 반응형 기준 | 1200px / 1024px / 768px / 320px |

---

## 디렉토리 구조

```
wire_frame/
├── .vscode/
│   └── settings.json           ← Live Sass Compiler 컴파일 대상 설정
└── resources/
    ├── css/                    ← 공통 레거시 CSS
    ├── fonts/                  ← PretendardGOV, Noto Sans KR, Remix Icon
    ├── js/                     ← 공통 레거시 JS 라이브러리
    └── mps/                    ← 핵심 작업 영역
        ├── html/               ← HTML 페이지
        ├── css/                ← 컴파일된 CSS + SCSS 소스
        ├── js/                 ← 사이트 JS (ES Module)
        └── images/             ← 이미지 에셋
```

---

## HTML 페이지

| 파일 | 역할 |
|---|---|
| `html/index.html` | 메인 페이지. GNB, 비주얼 배너, 카드뉴스 슬라이더, 통합검색/전체메뉴 팝업 |
| `html/sub.html` | 서브 페이지. GNB + SNB(좌측 메뉴) + 브레드크럼, 탭, 아코디언, InPage 네비게이션 |
| `html/_file.html` | 외부 CSS 없이 인라인 스타일로 자체 완결되는 컴포넌트 레퍼런스 파일 |

---

## SCSS 구조

`css/scss/` 루트의 `*.scss` 파일만 컴파일 대상이며, `_` prefix 파일은 컴파일에서 제외됩니다.

### 진입점 파일

| 파일 | 출력 CSS | 역할 |
|---|---|---|
| `layout.scss` | `layout.css` | 전 페이지 공통 레이아웃 (헤더, GNB, 푸터, 팝업 등) |
| `main.scss` | `main.css` | 메인 페이지 전용 스타일 |
| `sub.scss` | `sub.css` | 서브 페이지 전용 스타일 |

### 공통 부분 파일

| 파일 | 역할 |
|---|---|
| `_variables.scss` | CSS Custom Properties 디자인 토큰 (색상 팔레트, 폰트, border-radius 등) |
| `_mixins.scss` | SCSS 변수. Breakpoint(`$web`, `$pad`, `$mobile`, `$smobile`), 이미지 경로 |
| `_common.scss` | reset.css import, 폰트 import, html/body 기본 스타일 |
| `_print.scss` | 프린트용 스타일 |

### 컴포넌트 파일 (`components/`)

`_accordion`, `_badge`, `_box`, `_breadcrumb`, `_button`, `_calendar`, `_card`, `_charge`, `_dialog`, `_form`, `_grid`, `_icon_remix`, `_icon_svg`, `_image`, `_inpageNav`, `_list`, `_pagination`, `_search`, `_slider`, `_snb`, `_step`, `_tab`, `_table`, `_typo`, `_urgent`

---

## JS 구조

### 진입점 파일

| 파일 | 역할 |
|---|---|
| `js/common.js` | 전 페이지 공통. `headerFixed`, `zoom`, `listOpen`, `layerPopup`, `gnb`, `mobileGnb` 초기화 |
| `js/main.js` | 메인 페이지 전용. `tabs` + Swiper 슬라이더(`cardNews`) 초기화 |
| `js/sub.js` | 서브 페이지 전용. `snb`, `tabs`, `inPageNav`, `accordion`, `listOpen` 초기화 |

### 모듈 (`js/modules/`)

`index.js`가 모든 모듈을 re-export하는 배럴 파일 역할을 합니다.

| 파일 | 역할 |
|---|---|
| `config.js` | 전역 상수(`AC`, `FX`, `ALL`, `ScrollNo` 등) 및 공통 유틸 함수(`mobile()`, `accessInit()`) |
| `gnb.js` | PC GNB 2차 뎁스 열기/닫기, dim 처리, 접근성 처리. 외부 클릭·스크롤 시 닫힘 |
| `mobileGnb.js` | 모바일 햄버거 메뉴. 스크롤 방지, 활성 메뉴 자동 감지 |
| `headerFixed.js` | 스크롤 방향 감지로 헤더 `fixed` 클래스 토글 (110px 이상 스크롤 시 활성) |
| `tabs.js` | 탭 메뉴. `cont` 인자 유무에 따른 2가지 모드, 접근성 + 모바일 드롭다운 모드 |
| `listOpen.js` | 드롭다운 열기/닫기. 접근성(`aria-expanded`), sr-only 텍스트 전환, 외부 클릭 닫기 |
| `layerPopup.js` | 레이어 팝업. fadeIn/fadeOut, 포커스 관리, 스크롤 방지, Tab 키 포커스 트랩 |
| `snb.js` | 좌측 SNB. 3차 뎁스 처리, 접근성(`aria-expanded`, `aria-current`) 초기화 |
| `accordion.js` | `<details>/<summary>` 기반 아코디언. 전체 열기/닫기, sr-only 텍스트 토글 |
| `inPageNav.js` | `.title-2` 요소 수집 → `<nav>` 목차 자동 생성 → 스크롤 연동 active 처리 |
| `zoom.js` | 글자 크기 5단계 조절(0.9~1.3). `localStorage`에 설정 저장/복원, `html` zoom 적용 |

### 모듈 의존 관계

```
common.js / main.js / sub.js
  └── modules/index.js
        ├── config.js  ← 모든 모듈이 공통으로 의존
        ├── gnb.js
        ├── mobileGnb.js
        ├── headerFixed.js
        ├── zoom.js
        ├── listOpen.js
        ├── layerPopup.js
        ├── snb.js
        ├── tabs.js
        ├── accordion.js
        └── inPageNav.js
```

---

## 접근성

- `aria-expanded`, `aria-selected`, `aria-current`, `role` 속성 체계적 적용
- 키보드 네비게이션 및 Tab 포커스 트랩 처리 (레이어 팝업)
- `sr-only` 텍스트를 활용한 스크린리더 지원
