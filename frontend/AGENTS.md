<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Overview: IBL 2K26

**IBL** stands for **ITS Basketball League**, which is an annual basketball tournament hosted by the student basketball club (**UKM Basket**) at the **Institut Teknologi Sepuluh Nopember (ITS)**.

This repository contains the frontend web application for the **IBL 2K26** edition: the landing page, event information, the registration portal, and the committee dashboard. The REST API lives in the separate **IBL-Backend** repository.

---

## Committee Dashboard & Backend API

`/login` and the dashboard (`app/(dashboard)/`: Teams, Schedule Result, Scoring) use the IBL-Backend API. Its endpoint contract is `docs/API.md` and its setup guide is `SETUP.md`, both in that repository.

- Base URL: `NEXT_PUBLIC_API_URL` (dev falls back to `http://localhost:4000/api`).
- Call the API only through `lib/apiClient.ts` (`apiFetch`: bearer token, shared refresh on 401, raw file upload), `lib/teamsApi.ts`, and `lib/matchesApi.ts`. Never call `fetch` directly. Never put tokens in `localStorage` or `sessionStorage`: the access token stays in memory and the refresh token is an httpOnly cookie.
- Live match data: `lib/hooks/useMatchLive.ts` (snapshot + SSE). Scoring writes: `lib/hooks/useScoringSession.ts` (one account per match, 30 s heartbeat) and `lib/hooks/useAutoSaveActions.ts` (one UUID `actionId` per tap, retried with the same id).
- There are no quarters or periods: one match is one scoreboard. Save and Lock finishes a match; Unlock reopens it for correction.
- Times are shown in WIB through `lib/datetime.ts`; send ISO strings with `+07:00`.
- Role checks such as `canEditData` only hide controls. The API is the real guard.
- User-facing text is Indonesian.

---

## Registration Page Design & Layout Context

The registration page layout is designed to overlay key functional components onto a high-resolution background asset: [Full_Page_Desktop.png](file:///c:/Users/justi/Documents/IBL/frontend/public/images/Full_Page_Desktop.png) (dimensions: `2880px` wide by `6646px` tall, artboard-equivalent `1440px` by `3323px`).

### 1. Section Dividers
In [page.tsx](file:///c:/Users/justi/Documents/IBL/frontend/app/register/page.tsx), the page is split vertically to align with background imagery coordinates:
- **LandingSection**: `height: 22.57%` (y: 0 to 1500px on 6646px scale)
- **MidSection**: `height: 45.14%` (y: 1500px to 4500px on 6646px scale)
- **FormSection**: `height: 32.29%` (y: 4500px to 6646px on 6646px scale)

### 2. Sizing & Alignment Coordinates (Figma to Code)
To ensure the form cards overlay correctly on the background court graphics across all browser viewport sizes, we map the Figma artboard design pixels (based on a `1440px` viewport width) into responsive `vw` and percentage styles:
- **Horizontal offsets & widths**: `calc(100% * pixelValue / 1440)`
- **Vertical offsets & heights**: `calc(100vw * pixelValue / 1440)`

#### Step 4: Upload Berkas Box Coordinates
The upload container (CV, KTM, Twibbon, Bukti Follow, Portofolio grid) follows the exact same sizing and position coordinates as the normal form steps for visual consistency:
- **Width**: `54%` (derived from Figma dimensions `863px` / `1600px` canvas reference)
- **Height**: `70%`
- **Top**: `16.5%`
- **Left**: Centered horizontally (`left-1/2 -translate-x-1/2` or `left: 50%`, `transform: translateX(-50%)`)
- **Border styling**: Linear Gradient: `#F4631E` -> `#893310` -> `#7E0202` (rendered dynamically using `background-clip` and `background-origin` to support rounded corners).
- **Internal divider lines**: Slanted at 4 degrees using matching gradient-stop colors `#893310` and `#7E0202`.
- **Navigation Row**: Positioned at `top: 89%`, centered (`left-1/2 -translate-x-1/2`), with width `74%` (exactly matching the normal form steps navigation row to maintain uniformity).

#### Steps 1-3: Form Section Styling
The normal form steps (Informasi Umum, Subdivisi 1, Subdivisi 2) follow the second form reference composition:
- `star bg.png` and `Sinar Atas.svg` are decorative absolute layers inside `FormSection`; they must not add layout height or push content.
- Do not add a new solid background color in `FormSection`; preserve the page/background imagery already provided by `page.tsx`.
- Header badge, form card, and navigation row use absolute percentage coordinates inside the fixed FormSection bounds to prevent white overflow below the section.
- For FormSection vertical placement, prefer section-height percentages (for example `top: "14%"`) over `100vw` math; `100vw` can exceed the fixed FormSection height on wide desktop screens.
- The header badge should stay compact: red fill, black border, black offset shadow, Hollywood font, and tight line-height.
- The form card and bottom navigation must remain inside the FormSection height on desktop; avoid flow-based vertical stacking (`py-*` + natural content height) for the main form layout.

### 3. Responsive Scaling System (CSS Variables)
To maintain the proportional design ratio on all desktop widths (resolving the vertical stretching and empty space issue inside the card container on widescreen/Samsung monitors), form elements are sized using dynamic CSS custom properties:
- **Base variables**: Font-sizes (`--form-font-size`), paddings (`--form-padding-y`/`x`), textareas (`--form-textarea-min-height`), margins, and borders are defined globally in `globals.css`.
- **Dynamic viewport scaling**: For viewports `>= 1024px`, these variables scale dynamically using the Figma-to-code viewport width formula `calc(100vw * pixelValue / 1440)`. This allows text, inputs, labels, active/inactive basketball indicators, buttons, and Navbar elements to resize at the same rate as the background graphics.
- **Form Card Sizing**: The card container uses a fixed `height: "70%"` and `h-full`. Since the inputs and text inside scale proportionally with `vw`, the content fills the exact same ratio of the card on all monitor sizes without requiring vertical scrollbars.

### 4. iOS WKWebView & In-App Browser Compatibility
To ensure the web app works inside restricted environments like the Google Search App on iOS (WKWebView), adhere to the following rules:
- **Viewport Initialization (Race Conditions):** iOS WebViews often have delayed viewport initialization and may report `window.innerWidth` as `0` initially. Use `document.documentElement.clientWidth` as a fallback, and execute resize listeners with slight timeouts (e.g., 100ms, 500ms) during hydration to ensure the scale ratio is accurately captured.
- **Hidden File Inputs (Programmatic Clicks):** iOS WebKit blocks programmatic `.click()` actions on file inputs that are removed from the render tree via `display: none` (Tailwind `hidden`). Always use `className="absolute pointer-events-none opacity-0 w-px h-px"` to visually hide file inputs while keeping them strictly accessible to WebKit's interaction policies.
- **Strict Z-Index Values:** Do not use invalid Tailwind utility classes (e.g., `z-100` instead of `z-[100]`). WKWebView's strict GPU stacking context rules require exact z-indexes to prevent touch events from bleeding through modal overlays or loading screens.
- **IndexedDB Hang Prevention:** In private browsing or restricted WebViews, `indexedDB.open` can hang indefinitely without triggering success or error callbacks. Always wrap IndexedDB connection promises in a hard timeout (e.g., `1000ms`) and provide a graceful fallback to in-memory state.
