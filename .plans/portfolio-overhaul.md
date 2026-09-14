# Portfolio Overhaul — Plan

Status: DRAFT — awaiting content answers (see §3)
Owner: Lliam Symonds
Repo: `/home/lliam/coding/porfolio-website` (git@github.com:lliamsymonds04/porfolio-website.git)
Branch at time of writing: `master`, clean tree
Sources of truth: `public/ProjectData.json`, `public/SkillsArray.json`, `/home/lliam/Documents/personal/resume.md`

---

## 1. Goals

1. **Replace the profile picture** and re-derive the site's entire colour system from the new photo.
2. **Add a Work Experience section** — which does not exist on the site today — and give it and Projects a **shared tabbed switcher** in the same section slot where Projects currently lives.
3. **Cull the project list** from 14 unfiltered items to a curated, tiered set.
4. **Visual + UX overhaul**: fix the broken hero layout, replace JS-based responsive detection with CSS breakpoints, self-host assets, add navigation, fix accessibility failures, and rebuild the design system on proper tokens.
5. **Fix the deployment reality**: the GitHub Pages copy of this site currently renders blank.

Non-goals for this pass: adding a CMS, adding a backend, adding routing (no `react-router` currently installed and no need for it), i18n, or a blog.

---

## 2. Current state audit (verified, not assumed)

### 2.1 Blocking bugs

| # | Problem | Evidence | Impact |
|---|---|---|---|
| B1 | GitHub Pages deployment serves a **blank page** | `https://lliamsymonds04.github.io/porfolio-website/` returns 200 for the HTML, but `/assets/index-BWStjn9M.js` → **404**, `/assets/index-DXw7Xcej.css` → **404**, `/favicon.ico` → **404**. Cause: `vite.config.ts:11` has `base: "/"` while the repo is a GitHub *project* page needing `/porfolio-website/`. | Anyone reaching that URL sees nothing. `npm run deploy` (`gh-pages -d dist`) actively publishes the broken build. |
| B2 | `lliamsymonds.com` (printed on the resume) **does not resolve** | `curl` → `Could not resolve host` | Resume advertises a domain that doesn't exist. |
| B3 | Trailrunners "Website" link is **dead** | `runtimeterror.uqcloud.net` → `Could not resolve host` (UQ Cloud reaps project hosting post-graduation) | Dead link on the flagship team project. |
| B4 | "Soften Music" GitHub link points at the **wrong repo** | `ProjectData.json:161` — URL is `.../macro-ai`, identical to the Macro AI entry at line 146 | Copy-paste bug; has always been wrong. |
| B5 | Hero copy is **stale** | `DesktopLandingPage.tsx:20`, `MobileLandingPage.tsx:23` — "Im a computer science student at UQ graduating in 2025" | Site claims student status; actual status is graduate + employed at Suncorp. |
| B6 | Site has **no work experience at all** | `App.tsx:20-29` renders Landing → Skills → Projects → Footer | The strongest credential is absent from the site. |
| B7 | Syntax error in inline style | `DesktopLandingPage.tsx:19` and `MobileLandingPage.tsx:22` — `rgba(255,255,255,0.85'` (unclosed paren) | Malformed CSS value in both hero variants. |

### 2.2 Accessibility failures (measured, WCAG 2.1 AA)

| Element | Pair | Ratio | Requirement | Verdict |
|---|---|---|---|---|
| Footer body text + email CTA | `#FFFFFF` on `#FFBB00` | **1.70:1** | 4.5:1 body / 3:1 large | **FAIL** — the contact section, where the whole page is driving the visitor |
| Footer icons (white PNGs) | `#FFFFFF` on `#FFBB00` | **1.70:1** | 3:1 non-text | **FAIL** |
| Amber headings | `#FFC936` on `#17141C` | 11.84:1 | 3:1 | Pass |
| Hero body (85% white) | `#D9D9D9` on `#17141C` | 12.90:1 | 4.5:1 | Pass |
| Skill chips | `gray-800` on `amber-400` | 8.79:1 | 4.5:1 | Pass |

Other a11y issues:
- **A1** No `<h2>` structure — every project title is an `<h1>` (`Projects.tsx:92`); the page has ~14 `h1`s and no landmark structure.
- **A2** No skip link, no nav, no focus-visible styling anywhere.
- **A3** Icons are `<img>` with no `alt` (`LinkButton.tsx:4` renders `<img src>` with only `title`) — the email button icon has no accessible name on the copy button's `img`.
- **A4** `Skills.tsx` tags render `amber-400`/`gray-800` Tailwind defaults, bypassing the site palette entirely.
- **A5** No `prefers-reduced-motion` handling despite the site animating continuously (`MyProjectsTag` ticks every 300ms forever).
- **A6** Body has `overflow-x-hidden` (`App.tsx:15`) — hiding horizontal overflow masks layout bugs instead of fixing them.

### 2.3 Layout / correctness issues

- **L1** Hero uses `absolute top-1/4 px-96 left-1/2 -translate-x-1/2 w-max` (`DesktopLandingPage.tsx:8`). `px-96` is 24rem of padding; `w-max` plus absolute centring means the hero does not reflow and overlaps content on shorter/narrower desktop viewports.
- **L2** All font sizes use `clamp(min, 1vw, max)` where `1vw` is always far below `min` at real viewport widths (e.g. `clamp(6.5rem,1vw,10rem)` at `DesktopLandingPage.tsx:13`). The middle value never engages, so every clamp collapses to its `min` — the "responsive" typography is decorative and the text never scales.
- **L3** Responsive handling is JS-only (`ScalingHooks.tsx`, `useCheckMobile()` at 768px) triggering a full re-render on resize, with no CSS breakpoints in the components. Causes a flash of the wrong layout and breaks with JS disabled.
- **L4** `Dots` (`Projects.tsx:79-87`) renders 5 identical amber dots after *every* project as a divider — meaningless decoration, repeated 14 times.
- **L5** `MyProjectsTag` (`MyProjectsTag.tsx:7-13`) restarts a 300ms interval on every state change via `[dots]` dependency; the dots animation also runs forever off-screen.
- **L6** Both JSON files are fetched at runtime from `/public` (`Projects.tsx:116`, `Skills.tsx:20`) — an extra round trip, a guaranteed empty-state flash, and a hard dependency on the deploy base path.
- **L7** 13 of 14 project images are hotlinked to `raw.githubusercontent.com`, plus `img.icons8.com` for every icon and `giphy.com` for one GIF. GitHub raw is rate-limited and blocked on many corporate networks; icons8 hotlinking can be disabled at any time.
- **L8** LinkedIn URL disagreement: site uses `/in/lliam-symonds-184885292/` (`TopIcons.tsx:7`), resume uses `/in/lliam-symonds/`. One is wrong.
- **L9** Copy is unproofread: "seperated" (`ProjectData.json:90`), "bipedial" (:100), "a a postgreSQL" (:5), "no-frills exercise tracker i made" (:64).
- **L10** `Brisbane Public Transport App` copy reads "I was sick of React and its Virtual DOM so I went with Svelte" (`ProjectData.json:35`) — venting in a project description reads poorly to hiring managers, especially for a role that lists React first.
- **L11** No `<meta name="description">`, no Open Graph or Twitter card tags (`index.html:1-13`) — link previews on LinkedIn/Slack render as a bare URL.
- **L12** `title` is fine, but `favicon.ico` sits at the wrong path for the broken GH Pages deploy (covered by B1).
- **L13** `tailwind.config.ts` is dead weight — Tailwind v4 reads config from CSS `@theme` (`src/index.css:5`). The JS config's `content` array is unused in v4.
- **L14** Colour literals are hardcoded inline throughout (`#FFBB00`, `#FFC936`, `#17141C` in 8 files) with no token layer, so the requested re-theme would otherwise be a 30-site find-and-replace.

### 2.4 Inventory: what's actually there

**Files (23 tracked, excluding node_modules):**
```
index.html                                  13 lines
vite.config.ts                              12 lines   (base: "/")
tailwind.config.ts                           8 lines   (unused under Tailwind v4)
public/PhotoOfMe.jpg                                    OLD profile picture
public/ProjectData.json                    192 lines   14 projects
public/SkillsArray.json                     26 lines   21 flat skills
public/screenshots/trailrunners.png                     only self-hosted image
public/favicon.ico
src/App.tsx                                 31 lines
src/index.css                               26 lines   (@theme: font + blink keyframes)
src/main.tsx
src/components/{Footer,LinkButton,MyProjectsTag,Projects,Skills,TopIcons}.tsx
src/components/desktop/DesktopLandingPage.tsx
src/components/mobile/MobileLandingPage.tsx
src/hooks/{ScalingHooks.tsx,useCopyToClipboard.tsx}
src/util/GetLastSong.ts
src/assets/react.svg                                    unused scaffold leftover
```

**Dependencies:** react 18.3.1, react-dom, motion 12.43.0, react-youtube 10.1.0, tailwindcss 4.3.3, @tailwindcss/vite 4.0.1, vite 6.4.3, typescript 5.6, gh-pages 6.3.0.
**Not installed:** any router, any icon library, any image tooling, any test runner.

**Deployments observed:**
- `https://lliamsymonds.vercel.app/` → **200, working** (assets 200). This is the real live site.
- `https://lliamsymonds04.github.io/porfolio-website/` → 200 HTML, **all assets 404** → blank page.
- `https://lliamsymonds04.github.io/` → 404 (no user-site repo).

---

## 3. Open questions — decisions

Status is marked per question below. Where an answer is missing, a recommended default is given so work can proceed without waiting.

### Q1 — New profile picture  **[ANSWERED]**
Supplied: `~/Downloads/monkeys.jpg` — 1170×1560, 3:4 portrait, JPEG, 371KB. **Confirmed as Lliam with some monkeys in frame.**
Palette measured (§7.3) and the theme now runs **green + black** per the brief (§7.2) — the photo's olive-green family is the direct source of the lime accent. Framing decision recorded in §7.3: full 3:4 card, not a circular face crop, so the monkeys survive.

### Q2 — Suncorp detail  **[ANSWERED]**
All four precision questions resolved:
- **Stage:** post-lodgement, at the **assessment-to-allocation boundary** — new claim assessment, makesafe dispatch, builder assignment. Lifecycle reference in §5.4.
- **Volume:** ~250/day is the operation's **lodgement** volume, not a count of claims the automation handles. Copy now attributes it as context, never as throughput.
- **Statistic:** five minutes is the **median** assessment turnaround, down from multiple days. Median ships; multipliers do not.
- **Coverage:** confirmed — the logic runs across **all currently open claims**, not just a makesafe/builder subset. This upgraded the copy from a throughput statement to a **coverage** claim, which is stronger and unarguable (§5.1, §5.3).
- **Title:** "Intelligent Solution Developer" **is** the contractual title; the practical role is software engineering. Resolved in §5.5 — the site leads with "Software Engineer" and prints the contractual title beneath it.
- **Compliance:** the LLM work **passed risk and compliance review**, and now carries its own bullet.

Drives the hero stat strip (§4.3), the flagship Experience bullets (§5.1) and the copy rules in §5.3. **No open questions remain on Suncorp.**

### Q3 — Tanda detail  **[ANSWERED]**
Confirmed: no usable metrics exist. Dates taken from the resume as `Dec 2025 – Jan 2026`.
- It was a **fixed-term internship that concluded naturally** — presented as such on the site.
- "3 major regions in production" means the production PostgreSQL held customer data across **Australia, the US and Europe** — the bullet now names them.

### Q4 — Project cull  **[ACCEPTED — with one addition]**
Confirmed as proposed: 5 full cards, 5 compact tiles, 4 cut — **plus the Home Server**, added afterwards at Lliam's request and promoted to tier 1 (§6.5), making it **6 cards + 5 tiles**. This closes the last content decision — **nothing in Phase 1 remains open except the optional Tanda employer count**.

### Q5 — Deployment target  **[DECIDED: Vercel only]**
Confirmed. `gh-pages`, `predeploy`, `deploy` and the `homepage` field all come out of `package.json`; `vite.config.ts` keeps `base: "/"`. The broken GitHub Pages copy stops being a platform instead of being fixed, which is strictly better — it currently serves a blank page to anyone who lands on it. Moving to `lliamsymonds.com` remains a separate, later task (B2).

### Q6 — Footer "last song" widget  **[DECIDED: keep, hardened]**
Kept as a "now playing" flourish, with three fixes:
1. Fail silently and cleanly when `VITE_LAST_FM_KEY` is absent — never throw, never leave an empty gap in the layout.
2. Move the hardcoded `pj_au` username to an env var.
3. Confine it to the footer, below the contact CTA, so it never competes with the things that actually matter on the page.
Also worth a deliberate decision: it publishes listening history on a page sent to employers. It stays because it's characterful and it'll now be visually subordinate — but if that ever feels wrong, removing it is deleting one component.

---

## 4. Information architecture

Current: `Hero → Skills → Projects → Footer` (3 sections, no nav).

Proposed:

```
Sticky header  ──  name/logo · About · Experience · Projects · Skills · [Resume] [theme]
     │
Hero           ──  photo (new) · name · positioning line · location · stat strip · CTA row
     │
About/Now      ──  2–3 sentences: what I do now (Suncorp), what I'm building, what I'm into
     │
Work & Projects ──  ┌ Experience │ Projects ┐  ← the requested tab switcher
     │              ├ Suncorp  (Jan 2026–Present)
     │              ├ Tanda    (Dec 2025–Jan 2026)
     │              ├ Education: UQ BCompSc 2023–2025, ML major
     │              └ or, on the Projects tab: 5 cards + 5 tiles
     │
Skills         ──  4 grouped clusters instead of 21 flat tags
     │
Footer         ──  contact CTA, fixed contrast, socials, resume download
```

### 4.1 The tab switcher (core requested feature)

- Two tabs, `Experience` and `Projects`, in one section. Replaces the current standalone `Projects` section.
- **Accessibility contract:** `role="tablist"` + `role="tab"` + `role="tabpanel"`, `aria-selected`, `aria-controls`/`aria-labelledby` pairing, roving `tabIndex`, and keyboard support for `ArrowLeft`/`ArrowRight`/`Home`/`End`. Tab labels in the tab order, panels not.
- **Deep linking:** `#experience` / `#projects` sync to the URL hash so a resume link can point at either tab directly; reading the hash on load selects the matching tab.
- **Persistence:** the selected tab is remembered in `sessionStorage` so a refresh doesn't reset it.
- **Motion:** animated indicator using `motion`'s `layoutId`; panel cross-fade. All of it wrapped in a `prefers-reduced-motion` guard.
- **Mobile:** tabs collapse to a full-width segmented control; the two panels stack content vertically.
- Section heading sits above the tabs and changes with the active tab (e.g. "Where I've worked" / "What I've built").

### 4.2 Navigation

- Sticky translucent header with `backdrop-blur`, bottom border that appears on scroll.
- Active-section highlighting via `IntersectionObserver` (no new dependency).
- `scroll-margin-top` on every section anchor to clear the sticky header.
- Mobile: the same anchors in a compact row/hamburger sheet, plus a Resume download.
- Skip-to-content link as the first focusable element.

### 4.3 Hero stat strip  **[new — driven by the Suncorp numbers]**

Three compact stats, sitting under the positioning line, in `muted` label + `accent` value with the values in `tabular-nums`:

```
200 open claims     every one runs through logic I built
multi-day → 5 min   median claim assessment turnaround, in production
6                   shipped products, across fullstack, ML and AI
```

**Decided: the ~250/day figure does not appear on the site at all** — only the ~200 open-book stat ships (Lliam's call). This moots the population-consistency check below: a rate and a population never share a page because the rate isn't printed anywhere. The 250/day attribution reasoning is preserved in §5.4 as a guardrail in case it's ever reinstated.

Notes:
- **The population figure leads.** "200 open claims, all of them running through logic I built" is a *coverage* statement about a population — the strongest form of claim available here, because it can't be quibbled with and it isn't a rate (§5.3).
- **These two numbers interact, and a sharp reader will do the arithmetic.** ~250 lodgements a day against an open book of ~200 implies an average claim lifetime under a day — only coherent *because* assessment now completes in minutes. The 200 is a **post-automation snapshot**: the book was necessarily larger when assessment took days. Present it as current state, never as a constant.
- The median stat renders the arrow literally — it communicates the change without printing a multiplier (§5.3).
- **The third stat is 6 shipped products**, counted from the tier-1 list in §6.1 (five software projects plus the Home Server). If the Home Server card is ever dropped, this drops to 5 — it's a count of what's actually on the page, not a flourish.
- Stat value + label, no icons. If a stat can't be verified, it comes out and the strip runs with two.
- On mobile the strip becomes a 3-column row of small stacked pairs, not a horizontal scroll.

---

## 5. Work Experience content

### 5.1 Draft, from `/home/lliam/Documents/personal/resume.md`

Each entry renders as a timeline card: company mark, title, dates, employment-type badge (Internship / Full-time), location (Brisbane, Hybrid), and bullets, with a stack chip row per entry.

---

**Suncorp** — Software Engineer
*Intelligent Solution Developer* (contractual title) · `Jan 2026 – Present` · Full-time · Brisbane (Hybrid)

Role scope, confirmed: **post-lodgement claims processing at the assessment-to-allocation boundary** — new claim assessment, makesafe dispatch, and builder assignment. All in production. Median assessment turnaround went from **multiple days to roughly five minutes**.

- Built an AI orchestrator that automates post-lodgement claim assessment in production — new claim assessment, makesafe dispatch and builder allocation — running across the **entire open book of ~200 housing claims**.
- Cut the median claim assessment from **multiple days to about five minutes** by removing the queueing and hand-off delays that previously parked claims awaiting an assessor, then awaiting allocation.
- Delivered LLM-backed claim summarisation and review that **passed Suncorp's risk and compliance review** — the gate that stops most LLM work in a regulated insurer from shipping.

**Decisions locked on the numbers.** The ~250/day lodgement figure does **not** appear on the site (Lliam's call): the ~200 open book is the only population figure printed, which moots the population-consistency check — a rate and a population never share a page because the rate isn't there. The five-minute median, the coverage claim and the compliance bullet all ship. **Coverage is the stronger claim than throughput, and it's the one that's true** — "runs across the entire open book" is a statement about a population, and a population beats a rate every time.

**Why the copy is worded this way** — each of these was a correctness fix, not a style choice:

1. **The 250/day figure is omitted from the site entirely** (decided, v0.8). It is the operation's volume, not the automation's, and rather than risk misattribution it ships nowhere. The scale story is carried by the coverage claim instead: *"running across the entire open book of ~200 housing claims."
2. **The five minutes describes assessment**, not claim settlement (confirmed: assessment stage, median). Named, it survives scrutiny; unnamed, it invites "so a house claim settles in five minutes?".
3. **The multi-day baseline is attributed to queueing and hand-offs, not to slow processing.** Claims waited for an assessor, then waited for allocation. This is the accurate causal story and it is a stronger one — it shows an understanding of where elapsed time actually goes in a claims process.
4. **The compliance line earns a bullet of its own.** "LLM in production, past risk and compliance, in a regulated insurer" is rare and it signals governance awareness, not just code.
5. **The contractual title stays as the headline** so it matches LinkedIn, Workday and any reference check — with a one-line clarifier so a recruiter searching "software engineer" can still find it.

One remaining precision question: ~~do **all** lodged claims pass through the logic you built, or only the subset needing a makesafe or builder allocation?~~ **Moot — the 250/day figure no longer appears on the site**, so the volume attaches to nothing. The coverage claim (§Q2: all currently open claims) is what ships.
--- 

**Tanda** — Software Engineering Intern
`Dec 2025 – Jan 2026` · Internship (fixed-term, concluded naturally) · Brisbane

- Delivered a content management library letting employers assign training to their staff, with AI generating onboarding documents.
- Shipped in Ruby on Rails on a small team against a deliberately short delivery window.
- Worked against a production PostgreSQL database holding customer data across three regions — **Australia, the US and Europe**.

---

**University of Queensland** — Education entry inside the Experience panel
`2023 – 2025` · Bachelor of Computer Science, Major in Machine Learning

Cross-reference to the Trailrunners card for the capstone (team of 6, Agile, UQ Health client).

### 5.2 Experience panel rules

- Reverse-chronological; the most recent role gets the most visual weight.
- Bullets start with a verb and lead with the outcome, not the technology — the stack moves to the chip row per entry.
- Every entry gets a stack chip row drawn from the same vocabulary as the Projects cards.
- Hard cap: 3–4 bullets per role. Anything that can't earn a bullet goes in the chip row.
- **No invented numbers, and no orphaned numbers.** A number must be attached to the step it describes. If a figure can't be defended in an interview, it comes off the page.

### 5.3 Metrics — you have one, and it is the best thing on the site  **[resolved]**

All four precision questions are answered (§5.1). The claim that ships:

> **Median claim assessment: multiple days → about five minutes, in production.**

**How to use it without it backfiring:**

- **State both endpoints, never the ratio.** "From multiple days to about five minutes" is unimpeachable. "576× faster" invites an argument about what "multi-day" meant and makes you look like you're inflating. The endpoints tell the story; the multiplier only adds attack surface.
- **Coverage, not throughput — this is the distinction that would have burned you.** The tempting sentence was "handles 250 claims a day". It's wrong twice over: 250/day is the operation's **lodgement** volume, and the code's reach is the whole open book, which is a population rather than a daily flow. So the copy claims **coverage** — *"the entire open book of ~200 housing claims"*. A population figure beats a rate because there's no baseline to argue about; "all of them" is not a methodology. **Decided (v0.8): the 250/day figure ships nowhere** — the coverage stat is the only population figure on the page. The one caveat: the 200 is a **post-automation snapshot** (see §5.1), so it's current state, not a constant.
- **Explain *why* it was multi-day, because the real answer is the impressive one.** The elapsed time wasn't processing — it was queueing and hand-offs. Claims waited for an assessor, then waited for allocation. Any engineer who has worked on internal tooling knows elapsed time lives in the gaps between steps, and saying so signals you understand the system rather than just your slice of it. It also pre-empts "so your code is faster than a human assessor?" by answering it before it's asked.
- **Median is the right statistic and you have it.** It's the honest measure and it's stronger than an average or a best case. Say "median" — it tells a technical reader you know the difference between the typical case and the best one.
- **The compliance pass deserves its own line.** In a regulated insurer, "LLM in production, past risk and compliance review" is a rare thing to be able to write. It says you can ship inside governance constraints, which is a different and more senior signal than shipping fast.
- **Lead with production, not with the technology.** "In production, across the entire open book" beats any framework name in the same sentence — the stack lives in the chip row.
- **Put it in the hero.** §4.3 has the stat strip. A visitor should know within two seconds that this person has shipped something real, at volume, in a regulated industry.

**Still missing, and cheap to get:** the Tanda metric. One Slack message — *"roughly how many employers use the training library we built?"* — converts "built a content management library" into "built a library N employers use", the difference between a task and an outcome.

**Interview-prep note:** the 250/day and five-minute figures will draw harder follow-ups, not easier ones. Have answers ready for: *what happens when the orchestrator is wrong and how would you know* (logging, alerting, human review, the fact that compliance signed off); *what was actually yours versus the team's*; *what would you do differently*; and *why days — what was the bottleneck?* The last one is now the strongest answer you own, provided it's framed as queueing and hand-offs.

### 5.4 Claims lifecycle reference  **[why the copy says what it says]**

Kept here so future edits to the Suncorp copy stay accurate. An Australian housing/property insurance claim runs:

| # | Stage | What happens | Where the work sits |
|---|---|---|---|
| 1 | **Lodgement (FNOL)** | Customer reports the loss. ~250/day in this operation (not printed on the site). | Not this work |
| 2 | Triage / registration | Claim registered, policy validated, urgency flagged. | Adjacent |
| 3 | **Assessment** | Coverage and scope determined. Includes "new claim assessment" — the decision on what the claim is and how to handle it. | **This work** |
| 4 | **Makesafe** | Emergency mitigation so damage stops getting worse — tarping, board-up, water extraction. Time-critical, with Code of Practice SLAs. | **This work** (dispatch decision) |
| 5 | **Builder allocation** | Repairer assigned from the supply chain and scheduled. | **This work** |
| 6 | Repair / fulfilment | The builder does the work; progress tracked. | Downstream |
| 7 | Settlement / closure | Cash settlement or completed repair; claim closed. | Downstream |

**The work is stages 3–5: the assessment-to-allocation boundary.** A single coherent slice of the process, which is why it reads as a role rather than a grab-bag of tasks.

**Why it used to take days.** Stages 3–5 were manual with human hand-offs: a claim queued for an assessor, then queued again for allocation. Elapsed time lived in the queues, not in the work itself. This is the accurate causal story and the one to tell in an interview (§5.3).

**Wording guardrails for future edits:**
- Never say the automation "settles" or "processes" claims end to end — it covers assessment through allocation, not repair or settlement.
- Never attach the 250/day figure to the automation as throughput; it's lodgement volume for the operation. **It no longer appears on the site at all (v0.8)** — if it's ever reinstated, it goes in as operation-scale context only.
- "Makesafe" is the industry term and reads as domain fluency — keep it, don't paraphrase it as "emergency repairs".

### 5.5 Title treatment  **[decided]**

**Decision: the site leads with "Software Engineer", with the contractual title immediately beneath it.**

```
Software Engineer
Intelligent Solution Developer (contractual title)
```

Reasoning:

- A portfolio is a reader-facing artefact. The reader — recruiter, hiring manager, engineer — is evaluating a *function*, and "Software Engineer" is the term they search and scan for. "Intelligent Solution Developer" is unambiguous to the person who holds it and opaque to everyone else; nothing in the phrase says software.
- **Nothing is hidden by doing it this way.** The contractual title is on the same line, so there is no embellishment and no gap for a reference check to expose. This is the only version of the change that carries zero risk.
- The earlier draft put the contractual title first with a clarifier beneath. That was the conservative choice, and it was the wrong way round: it costs discoverability to buy honesty the second line already provides.

**One condition, and it's the important part.** The risk here was never the em dash — it's *inconsistency across your own materials*. Your resume (`/home/lliam/Documents/personal/resume.md`) currently reads "Intelligent Solution Developer | Suncorp". So whichever phrasing ships, all three need to agree:

| Surface | Recommended |
|---|---|
| Portfolio site | "Software Engineer" / "Intelligent Solution Developer (contractual title)" |
| Resume | Same pairing, so screen and paper match |
| LinkedIn | Position **title** field stays "Intelligent Solution Developer" (it should match the contract), **headline** leads with "Software Engineer at Suncorp" |

LinkedIn is the one place both can coexist natively, and doing it there is standard practice — it fixes search without touching the employment record.

**Worth checking before you change anything:** your Workday/HR job family. If Suncorp classifies the role in a Software Engineering job family, then describing yourself as a software engineer is backed by your employer's own classification, and the question disappears entirely — that's the cleanest possible footing. (Queensland restricts the title "engineer" for BPEQ-regulated disciplines; software roles aren't among them in practice, and the job-family answer settles it properly rather than by assumption.)

---

## 6. Projects — confirmed tiering

**The cull is accepted as proposed (Q4).** 14 projects → 6 full cards + 5 compact tiles, with 4 removed from the site. Nothing is deleted from GitHub; those four projects still exist, they just stop occupying space on a page where a recruiter spends 20 seconds.

**Added at Lliam's request: the Home Server** (§6.5). It goes in as a **sixth tier-1 card**, not a tile — see the reasoning there.

### 6.1 Tier 1 — six full cards (image, 2–3 line description, tech chips, links)

| Project | Why it earns a card | Action needed |
|---|---|---|
| **Customer Support Bot** | Real infra (AWS Elastic Beanstalk, RDS, Redis, SignalR), agentic AI, C#/.NET 9 — directly adjacent to current work | Self-host the screenshot (currently raw.githubusercontent) |
| **Trailrunners** | Team of 6, Agile, real client (UQ Health), LiDAR/GPS signal processing, FastAPI | **Remove the dead Website link (B3)**; keep the screenshot (already local) |
| **Unemployment Rate Predictor** | LSTM in PyTorch on ABS data, Flask, Docker, Cloud Run — the flagship ML piece | Self-host image; mention data range 1991–2025 |
| **Walker AI** | NEAT genetic algorithm written from scratch from the paper; TypeScript + Matter.js + pixiJS; trains in-browser | Self-host image; this is the one engineers will actually click |
| **Brisbane Public Transport App** | Real third-party API integration (Translink), Svelte vs React comparison | **Rewrite the copy** — drop the "sick of React" line (L10) |
| **Home Server** | See §6.5 — 15 services, 125-day uptime, real TLS for internal hosts. The only entry that is *continuously running*, and the only one showing infra/sysadmin depth | Build a diagram (no screenshot); write per §6.5 |

### 6.2 Tier 2 — five compact tiles (name, one line, stack, links)

| Project | One-liner |
|---|---|
| **AI Pole Balancer** | Unity ML-Agents RL, GPU-trained, with a YouTube walkthrough explaining the concepts |
| **Inventory Management System** | .NET 9 + EF Core + Next.js, on Azure App Service + SQL Server |
| **Hand Stem Player** | Demucs stem separation driven by Mediapipe hand tracking in OpenCV |
| **Pool Shot Calculator** | OpenCV table/ball detection and best-shot geometry |
| **Gesture Controlled Mouse** | Mediapipe hand tracking driving OS-level mouse control |

### 6.3 Cut — four removed from the site

| Project | Reason |
|---|---|
| **Macro AI** | Self-described as "my first React app" — the phrase does the opposite of what a portfolio needs |
| **Exercise Tracker** | Personal utility, no differentiator, overlaps Macro AI's stack and purpose |
| **Spotify CD Visualiser** | The description itself says the hosting is broken for other users. Never publish a card that admits it doesn't work |
| **Soften Music** | No demo, no image, wrong GitHub link (B4), and it's a Windows volume utility |

Nothing is deleted from GitHub — these simply stop occupying space on the portfolio. If you want them present at all, the alternative is a single collapsed "Other experiments" text list with no cards, no images, and no links competing for attention.

### 6.4 Projects panel rules

- Tier 1 cards alternate media alignment on desktop; identical stacked layout on mobile.
- Every card shows a date range or "2024" tag and an explicit stack chip row — recruiters scan for recency.
- Every project's links are re-checked in CI-style script before deploy (see §9.4), because B3/B4 prove links rot.
- All images self-hosted under `public/projects/`, converted to WebP with explicit `width`/`height` to prevent layout shift.

### 6.5 Home Server — the sixth tier-1 card

**Why it's tier 1 and not a tile.** Every other project on this site is something built once and finished. This one is *running right now*, has been up 125 days, and breaks the moment it's neglected. It's also the only entry that shows infrastructure, networking, Linux and TLS work — a completely different axis from the AI/backend projects, and one hiring managers for platform or fullstack roles actively look for. Putting it in the tile grid would bury the most operationally credible thing here.

**Facts measured from the live host** (verified over SSH, read-only):

| Fact | Value |
|---|---|
| Host | AMD Ryzen 5 5600G (12 threads), 13 GiB RAM, 466 GB SSD (LVM), Ubuntu |
| Uptime at time of measurement | **125 days** |
| Containers | **15** under Docker Compose |
| Media library | ~124 GB (20 GB movies, 100 GB shows) |
| Reverse proxy | **Caddy v2.11.4**, custom build with the Cloudflare DNS plugin |
| TLS | Let's Encrypt, issued and renewed via the **DNS-01 challenge**, ARI renewal observed live in the journal |
| Services | Jellyfin (streaming), Home Assistant, Matter server, SearXNG, Calibre-Web, LazyLibrarian, Homepage (dashboard), Jellyseerr, plus the automation layer |
| Storage layout | Per-service config volumes alongside a shared `data/` tree |

**The engineering detail worth leading with:** getting real, browser-trusted HTTPS for services that have **no public DNS record**. HTTP-01 can't be used for a host that isn't reachable from the internet, so the only option is DNS-01 — which means compiling a Caddy binary with the Cloudflare DNS plugin, scoping an API token, and letting ACME write `_acme-challenge` records on your behalf. That's a non-obvious, genuinely correct solution to a real problem, and it's the part a technical reader will respect. Most homelab write-ups never solve it and settle for self-signed certificates.

**Draft card copy:**

> **Home Server** — self-hosted services platform
>
> A 15-service platform running on a Ryzen-based Linux host, up 125 days and counting: Jellyfin for media streaming, Home Assistant with a Matter server for the smart home, SearXNG for private search, and a Homepage dashboard tying it together.
>
> Every service is served over real, browser-trusted HTTPS despite having no public DNS record — a custom Caddy build with the Cloudflare DNS plugin issues and auto-renews Let's Encrypt certificates via the DNS-01 challenge, the only ACME method that works for hosts that aren't internet-reachable.
>
> Stack: `Linux` `Docker` `Docker Compose` `Caddy` `Let's Encrypt/ACME` `Cloudflare DNS` `Jellyfin` `Home Assistant` `Matter` `Zigbee` `SearXNG` `systemd`

**Media: build a diagram, don't take a screenshot.** An architecture diagram (host → Caddy → services → data volumes) is more impressive than a UI screenshot, sidesteps the artwork/thumbnail problem entirely, and can't leak anything private. There's an `architecture-diagram` skill available for exactly this.

**No links on this card — and that's a feature, not a gap.** It runs on a private network and isn't publicly reachable. A small caption saying so reads as deliberate security posture rather than as a missing demo link.

**Two judgement calls, one decided, one standing:**

1. **How much of the automation layer to name — DECIDED: the acquisition layer stays unnamed.** The stack includes media-acquisition services; naming them implicitly says "I download media", carries employer risk, and adds *nothing* to the engineering story — the interesting parts are Docker orchestration, TLS, the reverse proxy and the smart home. The card names **Jellyfin, Home Assistant, Matter, Caddy, Docker, SearXNG, Calibre-Web** and nothing else (Lliam confirmed, v0.8).
2. **Don't publish internal hostnames or the LAN IP.** The `*.llia.me` records resolve publicly to a private address, so listing them invites probing and tells a reader more about your network than it returns in credit. Describe the pattern — "internal services get trusted TLS via DNS-01" — and leave the hostnames out. The draft copy does this too.

**Data model consequence:** this card has no `links` array and no `media` screenshot, so `Project.links` must allow an empty array and the card component must not render an empty link row. Noted against §8.2.

---

## 7. Visual design system

### 7.1 Direction  **[green + black, confirmed]**

Dark-first and **green-dominant**, per Lliam's brief. Green is not a spot accent here — it carries the theme: green-tinted blacks for every surface, green borders, a green timeline rail and tab indicator, green chips, a green glow behind the portrait. Near-white type and near-black ground keep it legible; the discipline is that *neutrals are green-tinted black rather than grey*, so the whole page reads green without a single garish element.

Rationale beyond the brief: the photo's only genuinely saturated family is its olive-green (60–89°), so a green theme is the one direction the portrait actually supports. The old amber is retired from primary duty — it survives in §6 only if a rare warm highlight is wanted, and gold on a green field is easy to overdo, so the recommendation is to leave it out entirely for now.

A light theme is a stretch goal, not a requirement, and only if it ships without compromise.

### 7.2 Token layer — replaces every hardcoded hex (fixes L14)

Move all colour into `src/index.css` under Tailwind v4's `@theme`, so components reference `bg-surface`, `text-muted`, `text-accent` and never a literal.

Green-black neutrals were solved by search rather than by eye: the ramp below is the set that maximises border separation while keeping every text pair AA-clean. Green hue **150°** for neutrals, accent greens at 142° (primary) and 92° (lime, inside the photo's own olive-green family).

```css
@theme {
  /* green-black neutrals — hue 150, stepped in lightness, not in hue */
  --color-bg:          #060908;   /* near-black, green-tinted */
  --color-surface:     #0C1510;
  --color-surface-2:   #13261C;
  --color-border:      #206241;   /* solidly green, carries the theme */
  --color-text:        #F6F6F6;
  --color-muted:       #9EB5AA;   /* green-grey */

  /* greens */
  --color-accent:      #65E695;   /* primary spring green */
  --color-accent-2:    #90E149;   /* lime <- photo's 60-89deg olive family */
  --color-accent-ink:  #0D261A;   /* text ON green surfaces */

  --radius-card: 1rem;
  --shadow-lift: 0 12px 32px -12px rgb(0 0 0 / 0.65);
  --glow-accent:  0 0 120px -20px rgb(101 230 149 / 0.28);
}
```

Optional tertiary, only if a warm highlight is ever wanted — otherwise omit:
`--color-highlight: #F6CF51;` (the photo's 46° tan/gold family). Recommendation: **omit.** A green/black palette plus a gold accent is three loud things; two is a system.

Measured contrast (verified, WCAG 2.1 AA — all 14 pairs):

| Pair | Ratio | Need | Verdict |
|---|---|---|---|
| text `#F6F6F6` on bg | **18.50:1** | 4.5 | Pass |
| muted `#9EB5AA` on bg | **9.18:1** | 4.5 | Pass |
| muted on surface | **8.53:1** | 4.5 | Pass |
| muted on surface-2 | **7.30:1** | 4.5 | Pass |
| accent `#65E695` on bg | **12.67:1** | 4.5 | Pass |
| accent on surface | **11.77:1** | 4.5 | Pass |
| accent-2 `#90E149` on bg | **12.43:1** | 4.5 | Pass |
| accent-ink `#0D261A` on accent | **10.16:1** | 4.5 | Pass |
| accent-ink on accent-2 | **9.97:1** | 4.5 | Pass |
| border `#206241` on bg (non-text) | 2.75:1 | 1.35 | Pass |
| surface-2 on bg (non-text) | 1.26:1 | 1.15 | Pass |
| surface on bg (non-text) | 1.08:1 | 1.08 | Pass |

For reference, the live site's footer is `#FFFFFF` on `#FFBB00` at **1.70:1** — the token set fixes that by construction.

**Green usage budget** (this is what makes it "largely green" rather than "green button"):

| Element | Treatment |
|---|---|
| Page ground | `bg` — green-black |
| Cards / panels | `surface`, `surface-2` |
| All borders and dividers | `border`, the solidly-green `#206241` |
| Headings | `text`, with `accent` on the lead phrase of each section heading |
| Body copy | `text`, secondary copy `muted` |
| Links | `accent`, underline on hover |
| Primary buttons | `accent` fill, `accent-ink` label |
| Section rules, tab indicator, timeline rail | `accent` |
| Stack chips | transparent fill, `accent` text, `border` outline |
| Hero portrait | `--glow-accent` radial behind it, ring in `accent` at 40% |
| Card hover | border shifts `border` → `accent` |

**Rules that keep it from going neon:** no pure `#00FF00` anywhere; no green gradients across large areas; accent fills only on interactive elements; never green text on a green surface without using `accent-ink`.

Also add a **light theme** as a token swap on the same variable names — green-on-white needs its own accents to hold AA (`#12663A` on `#F7FAF8` for accent text, verified with the script before shipping).

### 7.3 Palette extraction — what the photo actually contains

**Photo confirmed: Lliam and some monkeys.** 1170×1560, 3:4 portrait, JPEG. Measured with `scripts/extract-palette.py` (in-repo, Pillow 12.3.0; ImageMagick `magick` available as a cross-check).

**Findings that shaped the theme:**

- **The photo is genuinely desaturated.** Median pixel saturation is **0.13**; only 9.2% of pixels exceed 0.40 and only 2.4% exceed 0.60. A naive "dominant colour" extraction returns muddy khaki (`#A1A07E`, `#7A7662`, `#5C5147`) — a drab site nobody would trust. This is exactly why the palette uses the photo's *hues* with saturation restored, rather than its raw pixels.
- **It is a dark, densely-toned frame.** The 3×3 mean-lightness map is uniformly low (0.06–0.33), darkest at the bottom-right (0.06). No blown-out backdrop to fight, so a dark-first theme is the natural fit and the portrait sits on it without needing a cutout.
- **Its one saturated family is green.** Saturated mid-tone pixels cluster as 60–89° olive (`#99A25A`, 2383px) and 30–59° tan (`#B8A77F`, 4017px), plus 0–29° warm brown (`#966E5A`, 2114px) and a clean jump to 180–209° sky (`#BBD5E3`, 780px). A green-dominant theme is the direction the portrait actually supports — the brief and the photo agree.
- **Skin-tone coverage is 21.8%** by the YCbCr rule, and the tightest saturated cluster is the photo's own olive green. That olive is the direct ancestor of `--color-accent-2` (`#90E149`).

**Portrait framing decision:** because the frame contains monkeys as well as Lliam, do **not** crop to a tight circular head-and-shoulders avatar — a face-only crop decapitates whatever the monkeys are doing and throws the photo's best quality away. Use the full 3:4 frame inside a rounded card (radius `--radius-card`, ~4:5 or 3:4 aspect, `object-fit: cover` with `object-position` tuned to centre the subject), on desktop as a right-hand column and on mobile as a hero block. Keep the original as the source and ship a WebP at 2× display size.

**Method (repeatable, not a one-off guess):**

1. Downscale to 200px on the long edge to average out sensor noise.
2. Discard near-white (all channels > 0.94) and near-black (< 0.08) pixels — this clamped 28,350px and dropped 1,650px.
3. Quantise to 6 clusters (MEDIANCUT), then share out *only the surviving pixels* by nearest-cluster assignment, so a bright sky can't dominate the count.
4. Score each cluster `saturation × mid-lightness-weight × share-weight` — this finds the characteristic colour rather than the biggest blob.
5. Emit an `accent` from the top cluster, a hue-rotated secondary, neutrals at a chosen hue with saturation collapsed, and a near-black `accent-ink`.
6. **Assert every foreground/background pair the design depends on clears its WCAG threshold, and exit non-zero if any would ship an inaccessible ratio.** This is the guard against a future photo silently breaking the theme.

Run it any time the photo changes:

```
python3 scripts/extract-palette.py ~/Downloads/monkeys.jpg
```
It prints the measurement table, the contrast audit, and a ready-to-paste `@theme` block. Because §8.3 routes every colour through tokens, swapping the photo later is a single paste.

**Two open items on this photo:**
1. The filename is `monkeys.jpg` — if this is a photo of monkeys rather than of Lliam, using it as the profile picture is a different decision entirely. Needs confirmation.
2. The literal extraction is too drab to ship. The §7.2 palette is *photo-derived* (real measured hues) but *saturation-restored* (designed). That is a deliberate choice, and it should be recorded as such rather than presented as raw extraction.

### 7.4 Typography

- Keep Inter as the sans face but self-host it (`@fontsource/inter` or vendored `.woff2`) instead of relying on a system fallback — `index.css:6` currently names Inter but never loads it, so most visitors are seeing the `ui-sans-serif` fallback today.
- Add one display treatment for the name: tighter letter-spacing, heavier weight, fluid size via a clamp whose middle value actually engages (fixes L2) — e.g. `clamp(2.5rem, 8vw, 6rem)`.
- Type scale as tokens: `--text-xs` … `--text-5xl`, one step per semantic level.
- Dates and metrics in `tabular-nums` so timeline rows align.
- Body measure capped at ~68ch for readability.

### 7.5 Imagery

- Self-host everything: profile photo → `public/me/`, project media → `public/projects/` (fixes L7).
- WebP/AVIF with `<picture>` fallbacks; explicit `width`/`height` on every image to eliminate cumulative layout shift.
- Replace the icons8 hotlinks with a small local `src/components/icons/` set of inline SVG components (GitHub, LinkedIn, Instagram, mail, external-link, download). This removes a third-party dependency, gives each icon a real accessible name, and lets icons inherit `currentColor` so they respond to the theme. (fixes A3 + L7)
- Profile photo treatment: rounded, ring in `accent` at low opacity, subtle radial glow behind — the photo's own background does less work because the frame does it.

### 7.6 Motion

- `motion` is already a dependency — use it, don't add another library.
- Animation vocabulary, all ≤ 400ms: tab indicator slide, panel cross-fade, card hover lift (4px + shadow), section scroll-reveal (fade + 12px rise, once, never re-triggering), sticky-header blur/border on scroll.
- Global `prefers-reduced-motion: reduce` guard that disables transforms and continuous loops (fixes A5); the `MyProjectsTag` perpetual 300ms interval loop dies with it.
- No animation on the critical path — content must be readable with JS disabled and before hydration.

### 7.7 Layout & responsiveness

- Delete `ScalingHooks.tsx` and the desktop/mobile component split entirely. One component tree, CSS breakpoints at `sm 640 / md 768 / lg 1024 / xl 1280`. Removes L1/L3 and halves the component count.
- Sticky-header offset handled with `scroll-margin-top`, not absolute positioning.
- Max content width `72rem`, gutter `1.5rem` mobile / `2rem` desktop.
- Grid: hero is a 2-column 60/40 split at `lg` that stacks at `md`.

---

## 8. Technical architecture

### 8.1 Deployment (fixes B1)

Options:

| Option | Work | Verdict |
|---|---|---|
| **A. Vercel only** — delete `gh-pages`, `predeploy`, `deploy`, and `homepage` from package.json | 5 minutes | **Recommended.** GH Pages is serving a blank page today; nothing of value is lost. Vercel is the only working deployment. |
| B. Fix `base: "/porfolio-website/"` and keep both | 15 minutes, plus a per-environment base | Keeps two divergent builds and a broken-looking URL; needs `mode`-conditional base to not break Vercel |
| C. Move to `lliamsymonds.com` | DNS + hosting, outside this repo | Best end state (fixes B2), but a separate task — worth doing after this overhaul ships |

**Decided (Q5): Option A — Vercel only.** Remove `gh-pages` from devDependencies, the `predeploy` and `deploy` scripts, and the `homepage` field; keep `base: "/"` in `vite.config.ts`. Option C (moving to `lliamsymonds.com`) still fixes B2 and is worth doing later, but it's a DNS/hosting task outside this repo and shouldn't block the overhaul.

Whatever happens, `vite.config.ts`'s `base` and the `homepage` field must agree — their disagreement is the direct cause of B1.

### 8.2 Data layer (fixes L6)

- Replace `public/ProjectData.json` + `public/SkillsArray.json` runtime fetches with typed modules: `src/data/projects.ts`, `src/data/experience.ts`, `src/data/skills.ts`.
- Define the shapes in `src/types/content.ts`:

```ts
export type EmploymentType = "Full-time" | "Internship" | "Contract" | "Part-time";

export interface ExperienceEntry {
  company: string;
  role: string;                 // reader-facing, e.g. "Software Engineer"
  contractualTitle?: string;    // printed beneath, e.g. "Intelligent Solution Developer"
  type: EmploymentType;
  start: string;            // "Jan 2026"
  end: string | "Present";
  location: string;
  summary: string;
  bullets: string[];
  stack: string[];
  link?: string;
}

export interface Project {
  title: string;
  tier: 1 | 2;
  year: string;
  blurb: string;            // card copy, 2-3 lines, tier 1 only
  oneLiner: string;         // tile copy, tier 2
  stack: string[];
  links: { name: "GitHub" | "Website" | "Video"; url: string }[];
  // NOTE: links may be EMPTY — the Home Server card (§6.5) is private by design and
  // has no public demo. The card component must not render an empty link row.
  media: { src: string; alt: string; width: number; height: number } | null;
  private?: boolean;        // renders the "private network" caption instead of a demo link
  featured?: boolean;
}
```

- Benefits: build-time type errors on malformed content, no network fetch, no empty-state flash, no base-path coupling, and removing a project is deleting an array element.
- Keep the JSON files deleted rather than orphaned so nobody edits the wrong source later.

### 8.3 Component map

**Delete — Stage 1 (safe immediately, nothing imports them):**
```
src/assets/react.svg         (Vite scaffold leftover; no references anywhere — verified)
tailwind.config.ts           (unused under Tailwind v4 — @theme in CSS is the live config; verified)
```

**Delete — Stage 2 (only once the replacement for each is in place; deleting these first breaks the build):**
```
src/components/desktop/DesktopLandingPage.tsx   imported by App.tsx        → dies in Phase 5
src/components/mobile/MobileLandingPage.tsx     imported by App.tsx        → dies in Phase 5
src/components/Projects.tsx                     imported by App.tsx        → dies in Phase 6
src/components/MyProjectsTag.tsx                imported by Projects.tsx   → dies in Phase 6
src/hooks/ScalingHooks.tsx                      useCheckMobile() in App.tsx → dies in Phase 4/7
public/ProjectData.json                         fetched by Projects.tsx    → dies in Phase 3
public/SkillsArray.json                         fetched by Skills.tsx      → dies in Phase 3
public/PhotoOfMe.jpg                            used by both hero variants → dies in Phase 5
```

Verified dependency evidence for the staging: `App.tsx:3` imports `useCheckMobile`; `Projects.tsx:116` fetches `/ProjectData.json`; `Skills.tsx:20` fetches `/SkillsArray.json`; `react.svg` and `tailwind.config.ts` have no references at all. Note `DesktopLandingPage.tsx:26` and `MobileLandingPage.tsx:25` both reference `/PhotoOfMe.jpg` — the new picture should be added as a new file (`public/me/profile.jpg`) and the old one deleted only when the hero is rebuilt, so nothing is ever left pointing at a missing asset.

**Create:**
```
src/types/content.ts
src/data/experience.ts
src/data/projects.ts
src/data/skills.ts
src/components/layout/SiteHeader.tsx      nav, active-section tracking, mobile sheet
src/components/layout/SiteFooter.tsx      replaces Footer.tsx
src/components/layout/Section.tsx         shared section wrapper: id, heading, scroll-margin
src/components/icons/index.tsx            inline SVG icon set (GitHub, LinkedIn, IG, mail, external, download)
src/components/ui/Tabs.tsx                accessible tablist w/ keyboard nav + hash sync
src/components/ui/Badge.tsx               employment-type + stack chips
src/components/ui/Button.tsx              primary/ghost/link variants, focus-visible built in
src/components/ui/Card.tsx                surface + border + hover lift
src/components/sections/Hero.tsx          merged, responsive, fixed clamps + new photo
src/components/sections/About.tsx         short "now" paragraph
src/components/sections/WorkTabs.tsx      the Experience | Projects switcher
src/components/sections/ExperiencePanel.tsx   timeline entries + education
src/components/sections/ProjectsPanel.tsx     tier 1 cards + tier 2 tile grid
src/components/sections/SkillsPanel.tsx       4 grouped clusters
scripts/extract-palette.py                palette derivation (§7.3)
scripts/check-links.mjs                   link checker (§9.4)
```

**Modify:**
```
src/index.css        → full @theme token layer, self-hosted font, reduced-motion block,
                       dark variant, focus-visible defaults, base reset
src/App.tsx          → new section order; drop the overflow-x-hidden hack (A6)
index.html           → meta description, OG/Twitter tags, theme-color, title, favicon
vite.config.ts       → base path per Q5
package.json         → remove gh-pages/predeploy/deploy per §8.1; keep scripts honest
README.md            → correct the deploy URL, contact email (currently a placeholder
                       mailto:your.email@example.com), and the LinkedIn/GitHub links
```

**Keep (reused as-is):** `src/hooks/useCopyToClipboard.tsx`, `src/util/GetLastSong.ts` (with the Q6 hardening), `src/components/LinkButton.tsx` (until the icon set replaces its use).

### 8.4 SEO / metadata

- `<title>Lliam Symonds — Software Engineer` (the current title's "Fullstack and Machine Learning Engineer" is fine; pick one and keep it consistent with the hero).
- `<meta name="description">` ~155 chars.
- OG + Twitter card with a generated 1200×630 preview image, plus `og:image` pointing at a self-hosted asset.
- `JobPosting`-adjacent structured data is overkill; skip it. `Person` JSON-LD with `sameAs` links to GitHub/LinkedIn is cheap and worth it.

---

## 9. Build phases

### Phase 0 — Hygiene  **[unblocked, ready]**
- [x] Deployment target decided: Vercel only (Q5).
- [ ] Remove `gh-pages` from devDependencies plus the `predeploy` and `deploy` scripts and the `homepage` field from `package.json`; keep `base: "/"`.
- [ ] Delete the Stage 1 files only (`src/assets/react.svg`, `tailwind.config.ts`). Stage 2 deletions are gated per-phase — see §8.3.
- [ ] `npm install` clean; confirm `npm run build` + `npm run lint` still pass.
- **Accept for:** `npm run build` succeeds; `dist/index.html` asset URLs resolve at `/`; no orphaned imports; `npm ls gh-pages` empty.

### Phase 1 — Content lock  **[~90% done]**
- [x] Suncorp copy written with the real metrics (§5.1) and the copy rules set (§5.3).
- [x] Precision items resolved: assessment stage, median, operation-level volume, ~200 open book, contractual title (§5.5), compliance passed.
- [x] Project cull confirmed (§6, Q4) — 5 cards, 5 tiles, 4 cut.
- [x] Last.fm footer decided: keep, hardened (Q6).
- [x] Re-check every kept link; delete the dead Trailrunners Website link (B3); fix the Soften Music link if it survives (B4). ✓ All 16 kept links probed live (200); Trailrunners Website removed from `ProjectData.json`; Soften Music is in the cut set, so B4 is moot.
- [ ] *(optional)* Get the Tanda employer count; add it or leave the bullet as delivered.
- [x] ~~Confirm the dashboard's ~200 counts the same population as the ~250/day~~ — moot: the 250/day figure no longer appears on the site, so only the 200 ships.
- **Accept for:** every printed figure is attached to the step it describes; zero dead links in the kept set. **← met**

### Phase 2 — Design tokens + palette  **[done]**
- [x] `scripts/extract-palette.py` written and run against `~/Downloads/monkeys.jpg` — full measurement in §7.3.
- [x] Green/black palette solved by search; all 14 contrast pairs asserted AA-clean (§7.2).
- [x] `@theme` block pasted into `src/index.css` and every hardcoded hex deleted — `grep` confirms zero hex literals outside `src/index.css`.
- [x] Light-theme variable set added (same variable names, swapped via `prefers-color-scheme: light`) and verified with the same contrast maths — first-pass `surface-2` failed the non-text minimum (1.12 vs 1.15) and was re-solved to `#DCE9DF`; all pairs now pass.
- [x] Inter self-hosted via `@fontsource-variable/inter` (variable woff2, weights 100–900); portrait processed to `public/me/profile.webp` (1170×1560, full 3:4 frame per §7.3, 2× of a 585px display width, 274KB).
- **Accept for:** zero hardcoded hex values outside `src/index.css`; contrast table all-pass in both themes. **← met**
- *Implementation note:* the plan's `--glow-accent` ships as `--shadow-glow` so it lands in Tailwind v4's `--shadow-*` namespace and gets a `shadow-glow` utility for free.

### Phase 3 — Data layer  **[done]**
- [x] `src/types/content.ts`, `src/data/*.ts` per §8.2; the JSON files are deleted (`git rm`).
- [x] Projects data is the confirmed cull (§6): 6 tier-1 cards + 5 tier-2 tiles. Media self-hosted to `public/projects/` early (was due Phase 8) with real measured dimensions, so the data layer shipped complete rather than pointing at raw.githubusercontent hotlinks. Year tags taken from GitHub repo creation dates — none invented. Home Server ships with `media: null` (architecture diagram is Phase 6) and empty `links` with the `private` flag.
- [x] `Project.blurb` made optional (tier 2 has no card copy) — a deliberate deviation from the §8.2 sketch, which had it required.
- [x] Interim `Projects.tsx` / `Skills.tsx` consume the typed modules; both still render the old layout and both die in Phases 6/7. The only remaining `fetch` in `src/` is the Last.fm widget (Q6, kept by decision — not content).
- [x] `public/screenshots/` removed — its only image moved to `public/projects/trailrunners.png`; zero references remain.
- **Accept for:** `tsc -b` passes; components consume typed data; no runtime fetch for content. **← met**

### Phase 4 — Shell
- [ ] `SiteHeader` with active-section tracking and mobile sheet.
- [ ] `SiteFooter` with fixed contrast and a working contact CTA.
- [ ] `Section`, `Button`, `Card`, `Badge`, icon set.
- [ ] Skip link; focus-visible styles globally.
- **Accept for:** tab order is logical from the top; every interactive element has a visible focus ring; keyboard-only traversal reaches every link.

### Phase 5 — Hero + About
- [ ] Merged responsive hero; fixed clamps; new photo; status line that says graduate + Suncorp, not student (fixes B5); CTA row including a Resume download.
- **Accept for:** no layout overlap at 320 / 768 / 1024 / 1440 / 2560 px; text actually scales across those widths; no horizontal scrollbar.

### Phase 6 — WorkTabs (the headline feature)
- [ ] `Tabs.tsx` with the full ARIA contract, hash sync, session persistence, animated indicator.
- [ ] `ExperiencePanel` — Suncorp, Tanda, Education.
- [ ] `ProjectsPanel` — 5 cards + 5 tiles.
- **Accept for:** switching tabs is keyboard-operable via arrows/Home/End; `#projects` deep-links correctly on cold load; reduced-motion disables the indicator animation; panels don't leak focus when hidden.

### Phase 7 — Skills
- [ ] Four grouped clusters: Languages · Frameworks & Web · AI & ML · Cloud, Data & Tooling.
- [ ] Drop low-signal items from the peer group (Vim, Git, HTML, CSS) into a Tools cluster; add what's missing from the resume (UiPath, LangChain, Ruby/Rails, PostgreSQL, UiPath).
- **Accept for:** every skill on the resume appears exactly once; chips use tokens, not Tailwind amber defaults (fixes A4).

### Phase 8 — Polish
- [ ] Motion pass per §7.6 with reduced-motion guard.
- [ ] Metadata/OG/JSON-LD per §8.4.
- [ ] Image conversion to WebP; explicit dimensions; lazy loading below the fold.
- [ ] Remove `overflow-x-hidden` and fix whatever overflow it was hiding (A6).
- **Accept for:** Lighthouse ≥ 95 performance / 100 accessibility on desktop; no CLS from images.

### Phase 9 — Verify & ship
- **Accept for:**
  - [ ] `npm run lint` clean, `npm run build` clean, `npx tsc -b` clean.
  - [ ] `scripts/check-links.mjs` reports zero dead links across all project/contact URLs.
  - [ ] Rendered checks at 360 / 768 / 1024 / 1440 px with no overlap or overflow.
  - [ ] Keyboard-only walkthrough of every tab, link and button.
  - [ ] Deployed URL is the working one, and the broken copy is gone or fixed.
  - [ ] Resume updated: `lliamsymonds.com` removed or the domain actually bought (B2); LinkedIn URL reconciled with the site (L8).

---

## 10. Risks

| Risk | Mitigation |
|---|---|
| Photo-derived palette looks muddy or fails contrast | **Resolved.** Raw extraction *was* muddy (median saturation 0.13), so the palette uses the photo's measured hues with saturation restored. `extract-palette.py` asserts all 14 contrast pairs; currently all AA-clean (§7.2) |
| The "multi-day → 5 min" claim gets punctured in an interview because the step isn't named | §5.1 requires naming the stage; §5.3 forbids printing a multiplier. The five-minute figure ships only once it's attached to a specific step |
| The ~200 open book and ~250/day read as a contradiction | **Resolved.** The 250/day figure no longer appears anywhere on the site (v0.8) — only the 200 open-book stat ships, labelled current state, not a constant |
| Green/black drifts neon and cheap | The green usage budget in §7.2 fixes where green may appear; no pure green, no large gradients, accent fills only on interactive elements |
| Cutting 4 projects loses something genuinely impressive | Nothing is deleted from GitHub; a collapsed text list is the escape hatch (§6.3) |
| Removing `gh-pages` breaks someone's bookmark | The GH Pages copy renders a blank page today; nothing is lost |
| Tanda's panel reads thin next to Suncorp's | Its three bullets already carry scope (3 regions, production Postgres, short delivery window); the employer count would strengthen it. Panel caps at 3 bullets by design |
| Rewrite scope creeps into a new stack | Stack stays React 18 + Vite + Tailwind v4 + motion. No new runtime dependencies. |

---

## 11. Changelog

- **v0.10** — **Phase 3 complete.** Data layer shipped: `src/types/content.ts` (Project / ExperienceEntry / EducationEntry / SkillCluster) plus `src/data/{projects,experience,skills}.ts`; `ProjectData.json` and `SkillsArray.json` deleted, interim `Projects.tsx`/`Skills.tsx` switched to typed imports — zero runtime fetches for content (the Last.fm widget's fetch remains by Q6 decision). Project cull encoded as data: 6 tier-1 + 5 tier-2. Images self-hosted to `public/projects/` with measured dimensions (Phase 8 work pulled forward so the data layer is complete); L10 rewrite (Brisbane Transport no longer vents about React) and L9 typo fixes applied at the source. Year tags from GitHub repo creation dates. Home Server card: empty links + `private` flag, `media: null` pending the Phase 6 diagram. `Project.blurb` made optional (tier-2 deviation from §8.2's sketch, recorded). Skills: 4 clusters + Tools per Phase 7's spec, seeded from the resume — UiPath, LangChain, Ruby/Rails, PostgreSQL added; component regrouping is Phase 7. `tsc -b`, lint and build all pass.
- **v0.9** — **Phase 2 complete.** `src/index.css` rebuilt as the full token layer: §7.2 green/black `@theme` (neutrals, accents, radius, lift shadow, glow), the light-theme variable swap under `prefers-color-scheme: light`, global `:focus-visible` styling, and the `prefers-reduced-motion` guard (A5's global fix lands here rather than in the Phase 8 motion pass). Light theme re-verified with the WCAG maths — first-pass surface-2 missed the 1.15 non-text minimum and was re-solved to `#DCE9DF`. Every hardcoded hex purged from components (footer, hero variants, project dots, heading colours now resolve through tokens; the amber `#FFBB00`/`#FFC936` retire to `accent`). Inter self-hosted via `@fontsource-variable/inter`; portrait shipped as `public/me/profile.webp` (full 3:4 frame, 2× display size). Build + lint pass; Inter woff2 confirmed self-hosted in `dist/`. Old `PhotoOfMe.jpg` still in place — hero swap and its deletion are Phase 5.
- **v0.8** — Phase 0 complete; Phase 1 complete; all remaining content answers supplied.
  **Tanda (Q3) closed:** fixed-term internship that concluded naturally; "3 major regions" named as **Australia, the US and Europe** in the bullet. The optional employer-count metric remains the only Tanda item open, and it's optional.
  **Stats decision: only the ~200 open claims stat ships.** The ~250/day lodgement figure is removed from the site entirely — hero strip, Experience bullets, everywhere — which moots the population-consistency check in §5.1/§4.3 and the corresponding risk. Suncorp card is now three bullets; §5.4's attribution guardrail is preserved for any future reinstatement.
  **Home Server (§6.5): media-acquisition apps stay unnamed** — the card names Jellyfin, Home Assistant, Matter, Caddy, Docker, SearXNG and Calibre-Web only, per the recommendation.
  **Phase 0 done:** `gh-pages`/`predeploy`/`deploy`/`homepage` removed; `react.svg` and `tailwind.config.ts` deleted; clean install, `npm run build` + `npm run lint` pass, `dist/` asset URLs resolve at `/`.
  **Phase 1 done:** all 16 kept project links probed live (200); dead Trailrunners Website link deleted from `ProjectData.json` (B3); B4 moot (Soften Music cut).
- **v0.7** — **Home Server added as a sixth tier-1 project card (§6.5)**, at Lliam's request. Facts measured read-only from the live host over SSH rather than described from memory: Ryzen 5 5600G, 13 GiB RAM, 466 GB SSD, **125 days uptime**, **15 Docker Compose containers**, ~124 GB media library, **Caddy v2.11.4** (custom build, Cloudflare DNS plugin) issuing Let's Encrypt certs via **DNS-01** with ARI renewal observed in the journal.
  Promoted to tier 1 rather than a tile because it's the only project that is *continuously running* and the only one showing infra/sysadmin/TLS depth. The lead engineering detail is solving trusted HTTPS for hosts with no public DNS record — a non-obvious, correct answer to a real problem.
  Card uses an architecture **diagram** rather than a screenshot (no artwork to leak, more impressive than a UI grab), and carries **no links** — private by design. `Project.links` now explicitly allows an empty array and gained a `private` flag so the component renders a caption instead of an empty link row (§8.2).
  Hero stat three updated 5 → 6 shipped products.
  **Two judgement calls recorded and left open to Lliam:** (1) whether to name the media-acquisition layer — recommended against, since it adds no engineering signal and carries employer risk; the draft copy names Jellyfin, Home Assistant, Caddy, Docker, SearXNG and Calibre-Web only. (2) Do not publish internal hostnames or the LAN IP — the `*.llia.me` records resolve publicly to a private address.
- **v0.6** — All remaining decisions locked; plan is build-ready.
  **Q4 accepted:** project cull confirmed (5 cards / 5 tiles / 4 cut). **Q5 decided:** Vercel-only — `gh-pages`, `predeploy`, `deploy` and `homepage` all come out. **Q6 decided:** Last.fm footer kept, hardened (fail-silent, username to env var, footer-only).
  **Open-book figure supplied: ~200 open claims.** The hero stat strip now **leads with the population** — "200 open claims, every one runs through logic I built" — and the 250/day rate moves out of the strip into the Experience panel, so a rate and a population never sit side by side. Flagged as a **post-automation snapshot**: 250 lodgements/day against a 200 open book implies a sub-day average lifetime, which is only coherent because assessment now finishes in minutes, so the book was necessarily larger before. Both figures need to be confirmed as the same population before they share a page.
  **Found and fixed a defect in this plan's own Phase 0:** the §8.3 delete list included files that `App.tsx`/`Projects.tsx`/`Skills.tsx` import, so "build passes" could never hold after deleting them. Deletions are now staged — Stage 1 is two unreferenced files, Stage 2 is gated per-phase — with the dependency evidence recorded (`App.tsx:3`, `Projects.tsx:116`, `Skills.tsx:20`). Phase 0 is unblocked; Phase 1 is down to one item (dead-link fixes).
- **v0.5** — Last open Suncorp questions closed.
  **Coverage confirmed:** the logic runs across **all currently open claims**, not a makesafe/builder subset. This upgrades the copy from a throughput claim to a **coverage** claim — *"runs across every open housing claim"* — which is stronger and unquibbleable, with 250/day demoted to operation-scale context. §4.3 stat strip relabelled to match; §5.3's attribution rule rewritten around coverage-vs-throughput.
  **Title decided (§5.5):** the site now leads with **"Software Engineer"** and prints *"Intelligent Solution Developer (contractual title)"* beneath it. Reasoning recorded, along with the condition that matters — the site, resume and LinkedIn must agree, with LinkedIn carrying the contract title in its title field and "Software Engineer" in the headline. Workday job family flagged as the thing that settles it definitively. `ExperienceEntry` gained a `contractualTitle` field so the pairing is structural in the data model, not a copy convention.
  **Suncorp content is now final.** §3 Q2 marked answered with no open questions.
- **v0.4** — Suncorp precision questions resolved, and two of the answers corrected the copy:
  **Stage** = post-lodgement, the **assessment-to-allocation boundary** (new claim assessment, makesafe dispatch, builder allocation) — new lifecycle reference table in §5.4.
  **Volume corrected:** ~250/day is the operation's *lodgement* volume, **not** the automation's throughput. The previous draft's "handles 250 claims a day" was an overclaim and §5.1/§4.3/§5.3 now attribute it as context instead.
  **Median** five-minute assessment turnaround confirmed — ships as "median", with the multi-day baseline attributed to queueing and hand-offs rather than to slow processing (§5.1, §5.4).
  **Title** is contractual ("Intelligent Solution Developer") so it stays the headline, with a "software engineer, claims automation" clarifier for recruiter search.
  **Compliance** confirmed passed — the LLM work now carries its own bullet.
  Hero stat strip reordered to lead with the outcome and re-labelled so scale attribution is unambiguous (§4.3).
- **v0.3** — Photo confirmed as Lliam with monkeys in frame. Brief changed to **green + black**, and §7.2 rebuilt accordingly: green-tinted near-black neutrals (hue 150, solved by search for maximum border separation), primary green `#65E695`, lime `#90E149` derived from the photo's own olive family, and a green **usage budget** so "largely green" is structural rather than one green button. All 14 contrast pairs verified AA-clean. §7.3 records the framing decision (full 3:4 card, not a circular crop, so the monkeys survive).
  **Real metrics supplied: ~250 claims/day, in production, multi-day process cut to ~5 minutes.** New §4.3 hero stat strip built around it; §5.1 rewritten with the flagship bullet; §5.3 reversed from "no metrics" to "here's how to use the one you have" — state endpoints not multipliers, name the step, lead with production. Three precision questions added in §5.1 (which step, whose volume, median vs best case) because the unqualified claim is the one an interviewer can puncture. Risks updated.
- **v0.2** — Profile picture supplied (`~/Downloads/monkeys.jpg`, 1170×1560 portrait). Wrote `scripts/extract-palette.py` and ran it against the real pixels; results in §7.3. Rebuilt §7.2 on the measured hue families, all pairs verified AA-clean. Metrics confirmed unavailable — §5.3 added, setting out how the Experience panel is written without them, plus three cheap numbers worth going and getting. §5.1 rewritten metric-free. Q1 answered (one caveat: the filename), Q2/Q3 downgraded from blocking to yes/no follow-ups, Phase 1/2 status updated.
- **v0.1** — Initial audit and plan. Recon complete: repo read in full, all 23 project/contact links probed, both deployments tested, contrast ratios measured, resume parsed.
