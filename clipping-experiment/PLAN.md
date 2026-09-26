# Automated Clipping Experiment — Findings & Proposed Operating Model

**Status:** PROPOSAL, awaiting Brian's approval. No pipeline code exists yet.
**Prepared:** 2026-09-26 · **Timezone assumed:** America/New_York (Baltimore)
**Goal:** $0 → first $1 received → $100 cumulative **net cash received** within 30 days.

> **How much to trust this research.** This environment's network policy blocked direct
> fetches of whop.com, vyro.com, vues.app, findclout.com and youtube.com. Everything below
> comes from search-result summaries of official help pages plus third-party guides (some
> of them written by competing clipping platforms). Treat every figure as **"secondary
> source, check at signup"**. If something couldn't be verified it says **UNKNOWN**.
> Campaign briefs change weekly, so the brief you actually join is the only binding rulebook.

---

## 0. Executive summary (read this if nothing else)

1. **Only one path can realistically pay out in 30 days: CPM clipping campaigns** (Whop
   Content Rewards first, Vyro second). New accounts are accepted, you don't need followers,
   and pay is per verified view.
   Platform monetization (YouTube Partner Program, TikTok Creator Rewards) and platform
   affiliate programs are **gated by follower or view thresholds we cannot reach in 30 days
   without breaking rules.** For this experiment, mark all of them
   `platform_monetization_eligible: false`.
2. **The "first $1 received" is really the first $10 balance.** Whop and Vyro both report a
   **$10 withdrawal minimum**, and Whop ACH costs **$2.50/withdrawal**. At a $3 CPM, the
   first cash-out needs about **3,400–4,200 verified views**. That's the real first milestone.
3. **$100 needs roughly 33k–200k verified views**, depending on CPM. With about 100–150 clips
   over the month, that's an average of about 300–1,500 *eligible* views per clip. It's
   achievable in the base case but not guaranteed.
4. **Automated publishing isn't available to us anyway.** Both the YouTube Data API
   (unverified project) and the TikTok Content Posting API (unaudited client) **force uploads
   to private** until the app passes a compliance audit. Brian publishes manually during the
   MVP. That matches the human-approval requirement.
5. **Don't activate all 8 accounts on day 1.** Start 4 accounts on 2 campaigns, keep 1 as a
   scout, and hold 2 new YouTube channels in reserve until Week 3, when they get fed with
   whatever is winning. Robot Desk stays out of campaign clipping until Brian audits it (§5).
6. **Build tracking before the video pipeline.** The first clips should be hand-cut in
   CapCut (free) on Days 2–4 while the code catches up. The first coding milestone is the
   ledger + morning report; the transcript→clip slice is milestone 2.
7. **Tooling:** one project skill (`clip-ops`), no custom agents yet. Scheduling uses
   **Windows Task Scheduler on Brian's PC** (to be confirmed), with a nightly `git push` so
   cloud Claude sessions can read history.
8. **Expected cash cost: about $0–$5** (payout fees). Everything else is local/free or covered
   by existing subscriptions.

---

## 1. Environment inspection (what we can reuse)

| Item | Finding | Reuse? |
|---|---|---|
| This repo (`Wordups/Wordups`) | GitHub profile README only. No code, no Claude config. | **No.** The project should live in a new private repo (`Wordups/clip-ops`). This plan sits on branch `claude/epic-lamport-ndc354` for review only. |
| Brian's other repos (45) | No clipping/video repo. `the-board-system` already runs a scheduled data pipeline → normalize → report → GitHub Actions refresh. | **The pattern, not the code.** Same shape: collect → normalize → report. |
| Claude skills available | docs, xlsx, pdf, pptx, dataviz, skill-creator, loop, code-review. Nothing clipping-specific. | `skill-creator` builds the `clip-ops` skill; `xlsx` helps if the ledger stays in Excel; `dataviz` only once enough data exists. |
| Custom agents / commands | None in the repo or user config. | We create one skill. See §8. |
| MCP: **Higgsfield** | Has `tiktok_connect`, `tiktok_prepare_publish`, `reframe`, `shorts_studio_*`, `virality_predictor`. | **Park it.** It's credit-based (paid) and it's UNKNOWN whether its TikTok publisher is an audited app that posts publicly. It can't replace human review. Revisit in Week 3 only if manual posting becomes the bottleneck. |
| MCP: Gmail / Calendar / Drive | Connected to Claude, not to scripts. | Drive may hold campaign-provided source files. Alerts use local notifications, not Claude's Gmail. |
| MCP: Asana, Vercel, Credit Karma | Not relevant. | No. |
| Claude Code Routines (cloud cron) | Available. Runs in the cloud and can't see Brian's local files unless they're pushed. | Optional Week-2 "night lessons" pass that reads the pushed repo. |
| Local tools in *this* container | Python 3.11. No ffmpeg or whisper here. | Irrelevant. Rendering runs on Brian's machine. |

---

## 2. Research findings — monetization models

### 2.1 Models compared

| Model | How money is made | Reachable in 30 days from zero? | Verdict |
|---|---|---|---|
| **CPM clipping campaigns** (Whop Content Rewards, Vyro, ClipAffiliates, Clipping.net, Vues, Clipster) | Brand/creator funds a budget and sets $/1k verified views. You clip *their* supplied long-form content, post it from your accounts, submit the link, and views are tracked via platform APIs. | **Yes.** New accounts accepted, no follower minimum (reported). | **PRIMARY** |
| **Flat-bonus / bounty campaigns** (a Whop option) | Some briefs add a flat bonus per *approved* submission, paid regardless of views. | Yes, if such campaigns are live. | **Fastest possible first dollar.** Prioritize when found. |
| **UGC campaigns** (Whop, others) | Original face-to-camera content about a product. Paid per view, usually at higher CPMs. | Yes, but Brian has to be on camera. | **Optional.** Needs Brian's consent and time. Not assumed. |
| **YouTube Shorts ad revenue (YPP)** | Revenue share on Shorts feed ads. | **No.** Needs 1,000 subs + 10M valid Shorts views in 90 days (rising to 20M on 2027-02-01). | Long-horizon only. |
| **TikTok Creator Rewards** | RPM on original videos **over 1 minute**. | **No.** Needs 10k followers + 100k views/30 days, 18+, eligible region. | Not in scope. |
| **YouTube Shopping affiliate** | Commission on tagged products. | **No.** Requires YPP (500+ subs tier) and a supported country. | Not in scope. |
| **TikTok Shop affiliate** | Commission on sales. | **No** (in 30 days). US: 1,000 followers to enter the pilot, 5,000 for full access. | Not in scope. |
| **Off-platform affiliate links** (Amazon etc.) | Commission via bio link. | Technically yes. Practically near zero for new clip accounts, and it may conflict with campaign briefs. | **Skip** during the experiment. |
| **Owned channel (original/licensed content)** | Builds an audience toward YPP and affiliate. | No revenue in 30 days. | Robot Desk candidate only (§5). |

**Conclusion: campaign CPM (plus flat bonuses where available) is the whole 30-day revenue
plan.** Everything else is optionality that shouldn't consume experiment time.

### 2.2 Platform notes

| Platform | Reported terms | Notes / risks |
|---|---|---|
| **Whop Content Rewards** | CPM set per campaign; observed range $0.20–$6, about $1 average, UGC at the top. Campaign owners can set **minimum payout per submission** (e.g., $6 min at $3 CPM = 2,000-view floor) and a **maximum payout per submission**. CPM clips earn for **7 days after approval, then a 3-day hold** (secondary source). Each submission gets a **0–100 bot score**; high scores are paused for review. **$10 withdrawal minimum.** Payout fees: next-day ACH $2.50; instant 4% + $1; crypto/Venmo 5% + $1. | Largest campaign volume. Complaints exist about rejections near payout thresholds and "flagged for botting" as a default reason. Some *agency* communities on Whop impose $50–$100 minimums, so **avoid those**. Bans extend to linked social accounts. Using a VPN to get around geo-locks risks a ban. |
| **Vyro** (MrBeast-backed) | Reported flat **$3 CPM**, **$1,000 max per clip**, views refresh hourly, counts TikTok + Reels + Shorts, **$10 min withdrawal, once per week**, via Stripe/PayPal. | Geo restrictions **UNKNOWN**. Campaign supply **UNKNOWN**. The high flat CPM makes it a strong second source if campaigns are open. |
| **ClipAffiliates** | Brands set CPM; 9% brand-side fee. Reported "no per-post caps." | Secondary. |
| **Clipping.net** | $0.10–$3 CPM. Per-campaign **minimum view thresholds** (clips under the threshold earn $0). Pays when the cycle closes. | Slow cash. Low priority. |
| **Vues** | Claims no follower minimum and **no per-clip view threshold** (earns from view 1). | **Self-published claim.** Worth checking because a zero threshold helps new accounts most. |
| **Clipster** | Brand list is iGaming-heavy (Stake, Rainbet, casinos). | **Exclude gambling/casino campaigns.** They carry platform-policy, disclosure and legal risk (offshore casinos) and don't fit "legitimate first revenue." |
| **ClipRadar** | Aggregator showing live campaigns, CPM, budget left and time remaining across marketplaces. | **Useful for campaign discovery** without scraping logged-in dashboards. Check its ToS before any automated reads. |

### 2.3 The 30 research questions (CPM clipping on Whop/Vyro unless noted)

| # | Question | Answer |
|---|---|---|
| 1 | How is money generated? | A brand/creator-funded budget is paid out per 1k verified views on approved submissions. Some Whop briefs add a flat bonus per approved submission. |
| 2 | What qualifies a view? | Views read from the platform API on the submitted post. Whop: within a **7-day window after approval** (secondary). Exact YouTube Shorts definition used by campaigns: **UNKNOWN** (YouTube's own "engaged views" bar is unpublished). |
| 3 | What makes a view payable? | Approved submission + brief compliance + not flagged as inorganic + above any per-submission minimum + budget remaining + under the per-submission max. |
| 4 | Typical rates? | $0.20–$6 CPM (Whop, avg ~$1). Vyro reported $3 flat. Finance/crypto briefs pay more; entertainment usually < $2. |
| 5 | Minimum-view threshold? | **Per campaign.** Whop via "minimum payout." Clipping.net has thresholds. Vues claims none. |
| 6 | Minimum withdrawal? | Whop $10 (agency communities may set $50–$100). Vyro $10, weekly. Others UNKNOWN. |
| 7 | Qualifying platforms? | TikTok, YouTube Shorts, Instagram Reels, X (varies per brief). |
| 8 | New accounts? | Reported yes (Whop, Vyro). |
| 9 | Follower minimums? | Reported none at marketplace level. **A brief may add one.** |
| 10 | Account-age requirements? | **UNKNOWN**. Check per brief. |
| 11 | Geographic restrictions? | Whop: sanctioned countries excluded. Some briefs geo-target (US creator: likely fine). Vyro: UNKNOWN. |
| 12 | Campaign budgets? | Yes. A fixed pool per campaign. |
| 13 | Budget exhausted? | Campaign ends. Views after exhaustion earn nothing. Submissions can be rejected for "max payout met / end date reached." **Budget-remaining must be tracked daily.** |
| 14 | Approval speed? | **UNKNOWN / varies** (the campaign owner reviews manually). |
| 15 | Time to withdrawable? | Whop CPM: ~7-day earn window + 3-day hold ≈ **10+ days after approval** for a given clip (secondary). Vyro: balance updates hourly, weekly withdrawal. **Implication: clips must be live by ~Day 14–17 to be cashable by Day 30.** |
| 16 | Authorized source? | Only what the brief supplies or names (usually the campaign owner's own podcast/stream/VOD, often with a Drive link). |
| 17 | Transformation required? | Set per brief (captions, hook text, length). Platforms separately penalize unoriginal/lightly-edited reposts (TikTok: not recommended on the For You feed; YouTube: "reused/inauthentic content" affects monetization *even with permission*). |
| 18 | Attribution? | Per brief (tags, @mentions, links). |
| 19 | Posting-frequency limits? | Per brief: **UNKNOWN in general.** |
| 20 | Duplicate / cross-platform clips? | Cross-posting the *same* clip to TikTok + Shorts is commonly allowed (Vyro counts all three platforms). Submitting duplicates of the same clip is a listed rejection reason on Whop. **Rule for us: one unique clip per account per campaign unless the brief explicitly allows otherwise.** |
| 21 | Multiple accounts? | Platforms: TikTok allows multiple accounts "not to deceive or break rules"; YouTube allows multiple channels. Linking several socials to one Whop profile: **UNKNOWN**. Check before connecting all 8. |
| 22 | Exclusivity? | UNKNOWN / per brief. |
| 23 | Campaign CPM + platform monetization together? | Possible in principle. Irrelevant here because no account will reach YPP/CRP in 30 days. |
| 24 | Affiliate + campaign revenue together? | UNKNOWN; some briefs restrict other links. Don't mix during the experiment. |
| 25 | Disclosures? | **Yes.** FTC treats paid-per-view clippers as having a material connection. Use TikTok's commercial-content toggle on every campaign post **and** an in-caption disclosure (#ad or similar). The platform toggle alone isn't FTC compliance. Shorts: tick "includes paid promotion." |
| 26 | Rejection triggers? | Brief violations (tags, edit style, wrong platform), below min views, suspected bots, duplicates or low quality, exhausted budget. |
| 27 | Demonetization / suppression triggers? | Unoriginal / reused / inauthentic mass-produced content, watermarks from other platforms, IP violations, fake engagement (permanent Whop ban that extends to linked socials). |
| 28 | Legitimately automatable? | Campaign-rule checklists, ingest of *supplied* files, transcription, moment detection, scoring, cutting, reframing, captions, draft titles/hooks, compliance pre-checks, read-only stats from our own YouTube channels, reporting. |
| 29 | Must stay human? | Accepting campaign terms, account creation/verification, final clip approval, **publishing** (API-private anyway), campaign submission, disclosures check, payouts/withdrawals, recording dashboard-only numbers. |
| 30 | Shortest path to first withdrawable dollar? | Join 1–2 live campaigns with **≥$2 CPM, low/no per-submission minimum, ≥10 days and ≥30% budget left**. Hand-cut 2–3 clips/day from Day 2. Post to TikTok + Shorts. Reach a **$10 balance**, then withdraw (ACH). Prefer campaigns with a **flat approval bonus** if available. |

---

## 3. Economics — work backward from $100

### 3.1 Verified views needed

| CPM | Views for $100 credited | Views for $102.50 (covers one $2.50 ACH) | Views for first $10 withdrawable |
|---|---|---|---|
| $0.50 | 200,000 | 205,000 | 20,000 |
| $1.00 | 100,000 | 102,500 | 10,000 |
| $2.00 | 50,000 | 51,250 | 5,000 |
| $3.00 (Vyro flat) | 33,334 | 34,167 | 3,334 |
| $4.00 | 25,000 | 25,625 | 2,500 |
| $5.00 | 20,000 | 20,500 | 2,000 |

**Currently observed rates:** Whop average ~$1 (range $0.20–$6); Vyro $3. A realistic
blended CPM across the campaigns we'd actually pick (≥$1 filter) is **$1.50–$2.50**, which
means **40k–67k verified views for $100.**

### 3.2 Scenarios (not forecasts)

Assumptions: clips must be live by about Day 17 to be cash-eligible by Day 30. Six active
accounts from Week 2. About 4 clips/day in Week 1, rising to 8/day. **Roughly 120 clips
published by Day 20.** Eligibility = approved × above threshold × budget still open.

| Scenario | Mean views/clip (heavy-tailed; median much lower) | Eligible share | Blended CPM | Verified views | Credited $ |
|---|---|---|---|---|---|
| Pessimistic | 300 | 40% | $1.50 | 14,400 | **$22** |
| Base | 1,000 | 55% | $2.00 | 66,000 | **$132** |
| Optimistic (one clip breaks out) | 2,500 | 60% | $2.50 | 180,000 | **$450** (capped by per-clip max) |

New accounts typically get a few hundred views per clip, with rare breakouts. **One 30k-view
clip changes the month**, which is why hook testing and doubling down on winners (Weeks 3–4)
matter more than raw volume.

### 3.3 Labor and cost

| Item | Estimate |
|---|---|
| Brian's manual publishing + campaign submission | ~5–8 min/clip → 30–60 min/day at 4–8 clips |
| Review / approval of the queue | ~15–20 min/day |
| Manual ledger check-in (dashboard numbers) | ~5–10 min/day |
| Python learning tasks | separate time budget, ~30–45 min/day |
| **Software/API cost** | ffmpeg, faster-whisper (local), CapCut desktop, YouTube Data API read quota (free 10k units/day), SQLite/CSV, Python: **$0.** Claude: existing subscription. Payout fees: $2.50/ACH withdrawal. **Total expected cash cost: $0–$5.** |

**Paid dependencies:** none proposed. If one is ever proposed, it gets the
COST / WHY / FREE ALTERNATIVE / EXPECTED BENEFIT write-up first. Higgsfield is the only
candidate so far, and it's parked.

---

## 4. Campaign selection rules (the Scout checklist)

A campaign is **eligible to join** only if all of these are true:

- `authorized_to_clip: true`: the brief supplies or names the source, and we clip nothing else.
- CPM ≥ $1.00 (≥ $0.75 only if it has a flat bonus or no view threshold).
- Budget remaining ≥ 30% and end date ≥ 10 days out.
- Per-submission minimum payout ≤ ~1,000 views (new accounts can't reliably clear more).
- Allows **TikTok and YouTube Shorts**.
- No follower/account-age requirement we fail.
- Not gambling/casino, adult, get-rich-quick, or anything needing medical/financial claims.
- Paid out before (payout record visible on ClipRadar or the marketplace) and not an agency
  community with $50+ withdrawal minimums.
- Brief rules (tags, disclosure, length, edit style) are written down in `campaigns.csv`
  *before* the first clip.

**Rank** eligible campaigns by: `CPM × min(budget_left, our_realistic_share) ÷ (min-views threshold + 1)`,
adjusted for how clippable the source is (dense talking-head podcast > gameplay > lecture).

---

## 5. ROBOT DESK ROLE

| Field | Value |
|---|---|
| **Current identity** | **UNKNOWN.** youtube.com is blocked from this environment, and "Robot Desk" doesn't appear in web search results or any repo in scope. The name suggests AI / robotics / tech-desk content, but that's an inference, not a finding. |
| **Existing content type** | UNKNOWN. Brian to fill in (audit below). |
| **Existing audience signals** | UNKNOWN (subs, views, top videos, audience geography, Shorts vs long-form, monetization status). |
| **Proposed role (default until audited)** | **Isolated owned-content channel. No campaign clipping.** |
| **Reasoning** | (1) It's the only account with history. Campaign clips of someone else's podcast would confuse its audience and the recommendation system's understanding of the channel, and reused-content signals could follow it into any future YPP review. (2) The experiment doesn't need it: the four new channels + three TikToks cover every hypothesis. (3) Protecting an existing asset costs nothing, while damaging it can't be undone. |
| **Monetization path** | Its own niche on the long path: YPP (1k subs + 4k watch hours or 10M Shorts views), then YouTube Shopping affiliate at 500+ subs once in YPP. Outside the 30-day revenue target. |
| **Does campaign clipping belong here?** | **No by default.** Exception: an active authorized campaign that is **squarely in Robot Desk's existing niche** (e.g., an AI/robotics creator's own podcast), *and* the audit shows no meaningful audience to lose, *and* Brian explicitly opts in. Then it becomes a Week-3 niche-fit test, not a Day-1 endpoint. |

**Robot Desk audit (Brian, ~5 minutes, in YouTube Studio):** record in `accounts.csv`:
1. One-sentence description of what the channel is about.
2. Subscriber count; total videos; last upload date.
3. Views over the last 28 days; top 3 videos.
4. Shorts vs long-form mix.
5. Monetization status and any strikes/warnings.

**Decision rule:** if <100 subs and <1k views in 28 days *and* the niche matches a live
campaign, it's eligible for a Week-3 niche test. Otherwise it stays isolated, and the
clipping footprint is **4 new YouTube channels + 3 TikTok accounts.**

---

## 6. Account strategy

Principle: **two campaigns × two platforms**, one scout, one hook-test channel, and reserves.
Don't diversify for its own sake. Each account answers one question.

| Account | Platform | Purpose | Niche | Monetization | Content source | Target campaign(s) | Frequency | Hypothesis | Success metric |
|---|---|---|---|---|---|---|---|---|---|
| **YT1 — Robot Desk** | YouTube | Protected existing asset | Its existing niche (UNKNOWN) | Owned → YPP (long horizon) | Its own content | **None** (see §5) | Unchanged | Keeping campaign content off an established channel preserves its value | No harm: no strikes, no audience drop |
| **TT1** | TikTok | Primary campaign, TikTok side | Campaign A's niche | Campaign CPM | Campaign A supplied source | **A** (best-ranked) | 2/day W1 → 3/day W3 if winning | TikTok delivers faster view velocity than Shorts for new accounts on the same source | Verified views/clip vs YT2; first $10 |
| **YT2** | YouTube Shorts | Primary campaign, Shorts side | Campaign A's niche | Campaign CPM | Campaign A (**different clips** from TT1) | **A** | 2/day | Shorts gives a longer view tail, so more views land inside the 7-day window | Verified views/clip at 7 days vs TT1 |
| **TT2** | TikTok | Second campaign, TikTok side | Campaign B's niche (**different** from A) | Campaign CPM | Campaign B supplied source | **B** | 1–2/day | Niche/campaign choice explains more variance than platform | $ per clip vs TT1 |
| **YT3** | YouTube Shorts | Second campaign, Shorts side | Campaign B's niche | Campaign CPM | Campaign B | **B** | 1–2/day | Same as TT2, on Shorts | $ per clip vs YT2 |
| **TT3** | TikTok | **Scout**: fast campaign trials | Rotates | Campaign CPM / flat bonus | Whichever new campaign passes §4 | C, D, … (2–3 clips each) | 1–2/day | Cheap trials find a better campaign than A/B | Any campaign beating A/B on $/clip gets promoted to a pair |
| **YT4** | YouTube Shorts | **Hook-style test** on Campaign A | Campaign A's niche | Campaign CPM | Campaign A (unique clips) | **A** | 1–2/day from W2 | Text-hook-first / cold-open styles beat YT2's default style | 3-second retention + views/clip vs YT2 |
| **YT5** | YouTube Shorts | **Reserve**, scales the winner | Winner's niche | Campaign CPM | Winning campaign | Winner of W2 | 0 until W3, then 2–3/day | Idle capacity beats splitting Brian's attention in W1 | Incremental verified views in W3–W4 |

Notes:
- If Robot Desk is cleared for a niche test, it would take YT4's hook test *only* for a
  niche-matching campaign. The default is that it stays isolated.
- **No identical video across accounts.** TikTok + Shorts cross-posting of the *same* clip is
  allowed only if the brief allows it. Otherwise every post is a unique cut.
- Before connecting several accounts to one marketplace profile, confirm multi-account
  linking is allowed (**UNKNOWN**).

---

## 7. Minimum clipping pipeline (proposed first vertical slice)

**Change from the suggested slice, and why:** the slice should start from **a campaign
brief**, not a source. The brief defines the authorized source, the required length,
captions, tags and disclosures, so the compliance check can run on the first clip instead
of being added later.

```
campaign brief (manual → campaigns.csv)
  → supplied source file (Drive/Dropbox link from the brief; never scraped)
  → ingest (copy + hash + record authorization)          [ffmpeg / Python]
  → timestamped transcript                               [faster-whisper, local]
  → 3 candidate moments (scored)                         [Claude via clip-ops skill, or heuristics]
  → 1 cut + 9:16 reframe (center crop first; face-track later) [ffmpeg]
  → burned-in captions                                   [ffmpeg + .ass from transcript]
  → draft hook/title/caption + disclosure + required tags
  → rule check against the brief                         [Python checklist]
  → REVIEW QUEUE (folder + queue.csv)
  → Brian approves → Brian posts manually → Brian submits to campaign
  → metrics & ledger
```

A **manual lane** runs in parallel on Days 2–5: Brian hand-cuts clips in CapCut so revenue
isn't blocked on code, and those early briefs teach us what reviewers actually approve.

---

## 8. Agent / skill decision

**Recommendation: one project skill, `clip-ops`, and no custom agents for now.**

| Candidate | Decision | Why |
|---|---|---|
| **`clip-ops` skill** (in `clip-ops/.claude/skills/`) | **Create in Week 1** | One place for the §4 campaign checklist, the moment-scoring rubric, brief-compliance rules, and the report-writing format. Any Claude session (local or cloud routine) behaves the same way. It's cheap to change. |
| Campaign Scout agent | Not yet | Discovery is mostly manual (logged-in dashboards, accepting terms). A checklist inside the skill is enough. |
| Content Analyst agent | Not yet | Moment selection is one prompt with a rubric. Put it in the skill. |
| Clip Critic agent | **Maybe in Week 3** | Worth it only if approval volume makes Brian's review the bottleneck. It would give a second opinion, never the final say. |
| Performance Analyst agent | Not yet | The night report + a weekly Claude review of the CSVs cover it until there are ~50+ published clips. |
| Compliance Checker | **Deterministic Python, not an agent** | Rule checks (length, tags, disclosure text present) should be testable code. |

---

## 9. Automation architecture

### 9.1 Where things run

| Option | Verdict |
|---|---|
| **Windows Task Scheduler** on Brian's PC | **Primary** (assumes Windows, given Brian's PowerShell background; **confirm**). Source files, ffmpeg and whisper all run locally, and he already knows it. Turn on "Wake the computer to run this task" and "Run task as soon as possible after a scheduled start is missed." |
| cron / launchd | Use instead only if the machine is Linux or macOS. Same job list. |
| GitHub Actions | **No** for rendering: it can't reach local files, and datacenter IPs downloading video is a bad look. It can do lightweight checks on the pushed repo later if useful. |
| Python scheduler (APScheduler) | **No.** It needs an always-running process. Task Scheduler already provides this and survives reboots. |
| Claude Code Routines | **Optional from Week 2**: a nightly cloud routine reads the *pushed* reports/CSVs and writes `lessons.md` recommendations. Advisory only. |

All numbers come from **deterministic Python**. Claude adds judgment (moment picks, lessons,
recommendations) and never edits the ledger.

### 9.2 Repo layout (in the new `clip-ops` repo)

```
clip-ops/
  config/automations.csv        # the automation registry (human-readable)
  data/
    campaigns.csv  accounts.csv  sources.csv  clips.csv  posts.csv
    metrics_snapshots.csv        # one row per post per collection run
    ledger.csv                   # credits, fees, withdrawals, cash received
    time_log.csv                 # human minutes per task
    runs.jsonl                   # every job run: start, end, status, error
    alerts.jsonl
  reports/daily/YYYY-MM-DD/{morning,midday,night}.md + .json
  media/ (gitignored)  src/  tests/
```

**Storage choice: CSV first.** Half the data is typed in by hand (dashboard numbers,
approvals, payouts), so Excel-editable CSV is the lowest-friction input. It's also the
easiest first Python for Brian. Move to **SQLite in Week 3 only if** joins across
`metrics_snapshots` get painful. Each report `.md` has a sibling `.json` with the same
numbers for machine comparison.

### 9.3 Data model (fields that must be representable)

- **campaigns.csv**: campaign_id, campaign_platform (whop/vyro/…), campaign_url, name, niche, payment_model (cpm/flat/cpm+flat), cpm, flat_bonus, min_payout_per_submission, max_payout_per_submission, budget_total, budget_remaining, budget_checked_at, end_date, allowed_platforms, required_tags, disclosure_rule, source_url, authorized_to_clip, campaign_eligible, status, notes
- **accounts.csv**: account_id (YT1…TT3), platform, handle, purpose, niche, status (active/reserve/isolated), platform_monetization_eligible, created_date, strikes_warnings
- **sources.csv**: source_id, campaign_id, source_url, source_authorization (text + where stated), local_hash, ingested_at
- **clips.csv**: clip_id, source_id, campaign_id, start_s, end_s, score, hook_text, hook_type, edit_style, render_path, rule_check_status, approval_status, rejected_reason
- **posts.csv**: post_id, clip_id, distribution_account, social_platform, publish_date, post_url, disclosure_applied, submission_id, submitted_at, campaign_approval_status
- **metrics_snapshots.csv**: post_id, collected_at, views, likes, comments, shares, verified_views, source (api/manual)
- **ledger.csv**: date, campaign_id, post_id (nullable), type (campaign_revenue/affiliate_revenue/platform_revenue/fee/withdrawal/cash_received), amount, payment_status (pending/credited/withdrawable/withdrawn/received), reference
- Derived (never stored): gross_revenue, net_revenue, cpm_effective, per-account rollups.

### 9.4 Automatic vs. manual data

| Automatic (script) | Manual (Brian, ~10 min/day, morning) |
|---|---|
| Pipeline state: ingested, transcribed, candidates, rendered, rule-checked | Joining campaigns; accepting terms; brief rules → `campaigns.csv` |
| YouTube views/likes/comments for **our own** channels (YouTube Data API, read-only, free quota) | **TikTok views**, unless the TikTok Display API app gets approved (UNKNOWN timeline). Campaign dashboards also show tracked views. |
| Campaign end-date countdowns; budget alerts from last-entered values | **Verified views, credited revenue, approval/rejection** from campaign dashboards (no public API; we don't scrape logged-in dashboards) |
| Rollups, report generation, health checks, alerts | Publishing, submission URLs, disclosures, withdrawals, **cash received** (bank/PayPal), strikes/warnings, time log |

### 9.5 Daily automation schedule (America/New_York)

| Time | Job | Notes |
|---|---|---|
| 05:30 | `collect_metrics` | YouTube API snapshot for all posts < 10 days old |
| 05:45 | `campaign_check` | Expiry countdown, budget-staleness, flags campaigns < 3 days left or < 15% budget |
| 06:00 | `ingest_transcribe` | Only sources Brian has queued with `authorized_to_clip=true` |
| 06:30 | `generate_candidates` | 3–5 moments per new source |
| 06:45 | `render_queue` | Renders top candidates + rule check → review queue |
| **07:00** | **MORNING report** | Brian reviews the queue + does the manual ledger check-in |
| 07–22 hourly | `health_check` | Silent unless ACTION REQUIRED / CRITICAL |
| 12:00 (Brian) | Post window 1 | Manual publish + submit |
| 12:45 | `collect_metrics` | |
| **13:00** | **MIDDAY report** | Before evening posts, so there's still time to change course |
| 18:00–19:00 (Brian) | Post window 2 | |
| 20:45 | `collect_metrics` | |
| **21:00** | **NIGHT report** | |
| 21:30 | `backup_push` | git commit data + reports → private repo (media excluded) |
| 22:00 (Week 2+, optional) | Claude routine: `night_lessons` | Reads pushed repo → `lessons.md` + recommendations (advisory) |

**Report times:** the defaults (7 / 1 / 9) are kept. The 13:00 midday sits between the two
posting windows, which is exactly when a change can still affect the day. No platform or
campaign reason justified moving them.

### 9.6 Reports (content contract)

Each report is written as `.md` (for Brian) and `.json` (same numbers, for scripts). The
first line always answers the report's question.

- **MORNING**: "What should Brian care about this morning?" Covers: cumulative credited / withdrawable / cash received / pending; yesterday by account and campaign; overnight view deltas; top and bottom 3 clips; active campaigns with budget % and days left; new campaigns logged; expiring soon; processing / awaiting approval / publish queue; failed jobs; health; **3 ranked priorities for today**; manual check-in items still missing.
- **MIDDAY**: "Do we need to change anything before the rest of today's posts go out?" Covers: clips generated/approved/rejected/published today; views and revenue since morning; per-account and per-campaign performance; failures and stalled jobs (>2× normal duration); approval queue; remaining post slots; campaign changes; **human actions required**.
- **NIGHT**: "What did we learn today, and what should tomorrow's system do differently?" Covers: day totals (generated/approved/published, views, verified views, gross, fees, net, cash); revenue by campaign/platform/account; best/worst clip; strongest hook type; failures/rejections with reasons; human minutes; software cost; **milestone tracker** (progress vs $10 first-withdrawal, $100, days left, required run-rate); lessons; proposed changes for tomorrow (**need Brian's approval**).

### 9.7 Health checks and escalation

Every job appends to `runs.jsonl`. `health_check` evaluates:

| Condition | Severity | Surfaced |
|---|---|---|
| Job succeeded after a retry | INFO | Next report only |
| Metrics missing for a post > 24h; transcript suspiciously short; render duration off by > 20% vs expected | WARNING | Next report |
| Campaign < 3 days left or < 15% budget with clips queued for it; review queue > 24h old during the posting window; scheduled job missed twice; source file missing | **ACTION REQUIRED** | Windows toast notification (PowerShell `BurntToast`) + report |
| Campaign ended/exhausted while clips are still being produced for it; corrupted output (ffprobe fails) on everything; all jobs failing; disk full; a post removed / strike recorded | **CRITICAL** | Immediate toast + top of next report |

**Retry policy:** one automatic retry after 10 minutes for transient failures (network/API).
No retry for data or authorization errors. Never retry anything touching a platform account.
**Notification budget:** at most ~2 interrupts per day outside reports. Anything else waits
for the report.

### 9.8 Automation registry (`config/automations.csv`, draft)

| Name | Purpose | Schedule | Input | Output | Depends on | Failure condition | Retry | Human action | Status |
|---|---|---|---|---|---|---|---|---|---|
| collect_metrics | YT stats snapshot | 05:30, 12:45, 20:45 | posts.csv | metrics_snapshots.csv | YT API key | HTTP error / 0 rows | 1× @10m | TikTok numbers manual | planned |
| campaign_check | Expiry/budget flags | 05:45 | campaigns.csv | alerts | — | parse error | none | Update budget_remaining | planned |
| ingest_transcribe | Transcript for authorized sources | 06:00 | sources.csv | transcripts/ | ffmpeg, whisper | missing file / empty transcript | 1× | Queue sources | planned |
| generate_candidates | Score moments | 06:30 | transcripts | clips.csv | clip-ops rubric | < 3 candidates | 1× | — | planned |
| render_queue | Cut/reframe/caption + rule check | 06:45 | clips.csv | media/queue | ffmpeg | ffprobe fails | 1× | Approve/reject | planned |
| report_morning/midday/night | Daily reports | 07:00/13:00/21:00 | all CSVs | reports/daily/… | — | not written | 1× | Read it | planned |
| health_check | Detect failures | hourly 07–22 | runs.jsonl | alerts.jsonl, toast | — | — | — | Only on ACTION/CRITICAL | planned |
| backup_push | Persist history | 21:30 | repo | GitHub | git auth | push fails | 1× | — | planned |

The live registry adds `last_successful_run` and `next_expected_run`, filled from
`runs.jsonl` and the Task Scheduler definitions. The morning report prints it so Brian can
answer "what is running right now?" without reading code.

### 9.9 Feedback loop (bounded)

Night report: tag every clip with `hook_type`, `edit_style`, `length_s`, `topic`,
`campaign`, `account`. Weekly (Sundays): compare verified views/clip and $/clip by tag.
The output is a **recommendation list** (e.g., "shift YT5 to Campaign A, use question-hooks").
**Brian approves any change to the scoring weights, account allocation, or campaigns.**
Weights live in a versioned config file, and nothing rewrites itself.

### 9.10 Safety rails (hard-coded "never")

No account creation, CAPTCHA, or verification automation. No rate-limit evasion. No
engagement or view manipulation. No editing of payout info. No withdrawals. No accepting
terms. No publishing without Brian's approval. No source that isn't `authorized_to_clip=true`.
No VPN for geo-locked campaigns. Official APIs only, read-only until an audited publish
path exists.

---

## 10. 30-day experiment plan

| Days | Focus | Exit criteria |
|---|---|---|
| **1** | Brian: manual setup (§11). Claude: create `clip-ops` repo skeleton + skill once approved. | Whop (+ Vyro) accounts with payouts configured; Robot Desk audited |
| **2–4** | Pick Campaigns A and B (§4). **Manual lane:** 2–3 hand-cut clips/day on TT1, YT2, TT2 (YT3 from Day 4). Brian task #1 (§12) → ledger + morning report MVP. | ≥ 8 clips live and submitted; first approvals seen |
| **5–7** | Milestone 2: transcript → 3 candidates → 1 captioned vertical clip for Campaign A. Start reports. | Pipeline makes a reviewable clip end-to-end |
| **8–14** | 6 accounts active (TT3 scout, YT4 hook test). 5–8 clips/day. Daily reports running. **Clips must be live by Day ~14–17 to cash out by Day 30.** | **First $10 withdrawable → withdraw → first cash received** |
| **15–21** | Double down: cut the bottom campaign/account, activate YT5 on the winner. Optional Clip Critic if review is the bottleneck. | Run-rate ≥ $5/day credited |
| **22–30** | Concentrate on what produced verified $. Production stops for campaigns that can't pay out before Day 30. Final withdrawal; scale / stop / pivot decision. | $100 cumulative **cash received** — or a documented, data-backed reason why not |

**Kill criteria:** a campaign with 0 approvals after 6 submissions gets dropped. An account
with < 100 views/clip median after 10 clips gets reassigned or paused.

---

## 11. What Brian must do manually (before automation)

1. **Confirm the machine/OS** for scheduling (Windows assumed) and the timezone (ET assumed).
2. **Audit Robot Desk** (§5) and record it in `accounts.csv`.
3. **Create the 4 new YouTube channels + 3 TikTok accounts by hand** (distinct names/bios that match each account's purpose, 2FA on). **YT5 can wait until Week 3.** No VPNs, and don't warm up accounts with fake activity.
4. **Sign up for Whop (and Vyro)** as a creator. Read and accept the terms yourself. Set up the payout method and tax info (W-9). Choose **next-day ACH** (lowest fee).
5. Check whether one marketplace profile can link multiple socials. Record the answer.
6. **Pick Campaigns A and B** with the §4 checklist (Claude can help rank screenshots/briefs you paste in). Copy each brief's rules into `campaigns.csv`.
7. Install: Python 3.12, Git, VS Code, **ffmpeg**, CapCut desktop (free). Later: `faster-whisper`.
8. Create the private repo `Wordups/clip-ops` (or approve Claude creating it).
9. Week 2: a Google Cloud project + **YouTube Data API key** (read-only stats). Optionally, a TikTok developer app for the Display API (approval timeline UNKNOWN).
10. Start `time_log.csv` from day 1. Human time is a tracked cost.

---

## 12. First coding milestone and Brian's first task

**Milestone 1 (Days 2–4): "The ledger knows where we stand."** CSVs + a script that prints
the morning report's money section. Revenue tracking comes before the video pipeline
because clips from the manual lane need somewhere to land, and this is the most
PowerShell-like Python there is.

### Task #1 — `campaign_math.py` (about 30–45 minutes)

**What it teaches** (with the PowerShell equivalent):

| Python | PowerShell you know |
|---|---|
| `import csv` + `csv.DictReader(f)` | `Import-Csv` |
| `for row in reader:` | `foreach ($row in $rows)` |
| `row["cpm"]` (a dict lookup; values are **strings**) | `$row.cpm` (also a string) |
| `float(...)`, `int(...)` | `[double]`, `[int]` casts |
| `def views_needed(target, cpm):` | `function Get-ViewsNeeded { param(...) }` |
| `datetime.date.fromisoformat(...)` | `[datetime]::Parse(...)` |
| f-strings `f"{x:,.0f}"` | `"{0:N0}" -f $x` |
| `with open(...) as f:` | a file handle that auto-closes (like `try/finally` + `.Dispose()`) |

**Your task:** using `clipping-experiment/data/campaigns.sample.csv`, write
`campaign_math.py` that, for each campaign, prints:

1. The campaign name and CPM.
2. Views needed for **$10** (first withdrawal) and **$100**. Round **up** to a whole view (`math.ceil`).
3. Days left until `end_date` (compared to today).
4. A `WARNING` if days left < 7, and `SKIP` if `authorized_to_clip` isn't `true`.

Required: one function `views_needed(target_dollars, cpm)` that returns an `int`.
Stretch: guard against `cpm` being `0` or blank.

**Done when:** it runs with `python campaign_math.py`. For a $3 CPM campaign it prints
3,334 views for $10 and 33,334 for $100. Send it to Claude for review and tests next.

---

## Sources

Research came from search-result summaries (direct fetches were blocked); verify at signup.
- Whop Content Rewards: [Whop Docs](https://docs.whop.com/memberships-and-access/third-party-apps/content-rewards), [Content Rewards ToS](https://whop.com/content-rewards-terms-of-service/), [Whop blog](https://whop.com/blog/whop-content-rewards/), [Whop FTC](https://whop.com/ftc/), [Sanctioned countries](https://docs.whop.com/trust-and-safety/trust-safety-overview/sanctioned-countries), [Payout methods](https://docs.whop.com/manage-your-business/manage-payouts/payout-methods), [Ascynd](https://ascynd.io/en/blog/whop-clipping), [OpenClip](https://openclip.app/guides/whop-clipping-guide), [FindClout](https://findclout.com/blog/how-does-content-rewards-work), [FindClout complaints](https://findclout.com/blog/content-rewards-complaints), [ReachCat fees](https://reach.cat/blog/whop-clipping-hidden-fees/), [OpusClip](https://www.opus.pro/blog/whop-content-rewards)
- Vyro: [vyro.com](https://vyro.com/), [OpusClip](https://www.opus.pro/blog/mrbeasts-vyro), [Ssemble review](https://www.ssemble.com/blog/vyro-review-2026), [FindClout](https://findclout.com/blog/is-vyro-legit)
- Other marketplaces: [Vues comparison](https://vues.app/blog/best-clipping-platforms-2026), [Clipster](https://www.clipster.gg/), [ClipRadar](https://clipradar.co/), [ClipAffiliates](https://www.clipaffiliates.com/blog/best-clipping-platforms-compared), [Clipping.net review](https://www.clipaffiliates.com/blog/clipping-net-review)
- YouTube: [Monetization policies](https://support.google.com/youtube/answer/1311392?hl=en), [Reused-content FAQ](https://support.google.com/youtube/community-guide/271248162/%F0%9F%94%8E-faq-reused-content-youtube%E2%80%99s-partner-program?hl=en), [Tubefilter on 2027 thresholds](https://www.tubefilter.com/2026/08/10/youtube-partner-program-ad-eligibility-requirements-shorts/), [vidIQ Shorts monetization](https://vidiq.com/blog/post/youtube-shorts-monetization/), [Shopping affiliate eligibility](https://support.google.com/youtube/answer/13376398?hl=en), [Data API quota & audits](https://developers.google.com/youtube/v3/guides/quota_and_compliance_audits), [API revision history](https://developers.google.com/youtube/v3/revision_history)
- TikTok: [Creator Rewards](https://www.tiktok.com/creator-academy/article/creator-rewards-program), [Integrity & authenticity](https://www.tiktok.com/safety/en/policies-and-engagement/integrity-authenticity), [Content Posting API get-started](https://developers.tiktok.com/docs/en/content-posting-api-get-started), [Content sharing guidelines](https://developers.tiktok.com/docs/en/content-sharing-guidelines), [TikTok Shop creator requirements](https://seller-us.tiktok.com/university/essay?knowledge_id=7608640301074219&lang=en)
- Disclosure: [Posthype on clipping disclosure](https://www.posthype.news/article/clipping-ftc-disclosure), [TikTok toggle ≠ FTC compliance](https://www.influencers-time.com/tiktok-branded-content-toggle-is-not-ftc-compliance/)
