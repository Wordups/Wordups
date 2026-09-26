# clip-ops — Operating Plan (v2)

**Status:** Direction **provisionally approved** 2026-09-26. Pipeline implementation is
**blocked** until Brian provides the first verified campaign and authorized source.
**Environment:** Windows 11 · America/New_York · Windows Task Scheduler for the local MVP.
**Goal:** $0 → first cash received → $100 cumulative **net cash received** within 30 days.
Primary KPI: **net cash received** (not credited or theoretical revenue).

### Changes from v1
- Every number or rule not verified from a primary source is tagged **`VERIFY_AT_SIGNUP`**
  and listed in the Claims Register (§2). None of them is a project rule.
- Work runs as **two parallel tracks** (§6). Engineering milestone 1 is the **first
  automated clip**. Tracking/reporting code comes *after* it and must not delay it.
- Account roles are **data** (`accounts.csv`), not architecture. No code may hardcode an
  account → campaign/role mapping.
- Robot Desk (YT1) has **no campaign assignment**, pending Brian's separate audit.
- `campaign_math.py` moves to an optional Python exercise.

---

## 1. Verification policy

Research for v1 came only from **search-result summaries**; direct fetches of whop.com,
vyro.com, vues.app, youtube.com and similar sites were blocked by the environment's network
policy. So:

1. A claim is **VERIFIED** only when it's confirmed from a primary source: the campaign
   brief, the marketplace's own terms/help page as seen by Brian at signup, the platform's
   official docs, or observed behavior in our own accounts. Record *where* and *when*.
2. Everything else stays **`VERIFY_AT_SIGNUP`**. It's fine for rough planning, but it must
   never be used as a threshold, a rule check, or a hardcoded constant.
3. **Campaign parameters come from the brief, per campaign.** CPM, minimum/maximum payout,
   earning window, hold period, allowed platforms, tags and disclosure all live as fields in
   `campaigns.csv` with a `verified_from` column. Code reads them from there. Nothing is
   assumed as a marketplace default.
4. An empty field means **unknown**, and the pipeline has to treat unknown as "ask Brian",
   not "use a default."

---

## 2. Claims Register (all `VERIFY_AT_SIGNUP`)

| ID | Claim (from search summaries) | Where it would matter | Status |
|---|---|---|---|
| C01 | Whop Content Rewards CPMs range ~$0.20–$6, ~$1 average; UGC pays more | Campaign ranking | VERIFY_AT_SIGNUP |
| C02 | Whop campaign owners can set min and max payout per submission | View thresholds | VERIFY_AT_SIGNUP (per brief) |
| C03 | Whop CPM clips earn for 7 days after approval, then a 3-day hold | Last useful posting date | VERIFY_AT_SIGNUP |
| C04 | Whop withdrawal minimum $10 | First-cash milestone | VERIFY_AT_SIGNUP |
| C05 | Whop payout fees: next-day ACH $2.50; instant 4% + $1; crypto/Venmo 5% + $1 | Net cash | VERIFY_AT_SIGNUP |
| C06 | Whop assigns a 0–100 bot score and pauses high scores for review | Rejection risk | VERIFY_AT_SIGNUP |
| C07 | Whop accepts new accounts; no marketplace follower minimum | Account readiness | VERIFY_AT_SIGNUP (brief may add limits) |
| C08 | Some Whop briefs offer a flat bonus per approved submission | Fastest first dollar | VERIFY_AT_SIGNUP |
| C09 | Some Whop agency communities require $50–$100 withdrawal minimums | Campaign selection | VERIFY_AT_SIGNUP |
| C10 | Whop bans extend to linked social accounts; VPN geo-bypass risks a ban | Account safety | VERIFY_AT_SIGNUP (we don't use VPNs regardless) |
| C11 | Vyro: flat $3 CPM, $1,000 max/clip, hourly view refresh, counts TikTok + Reels + Shorts | Second marketplace | VERIFY_AT_SIGNUP |
| C12 | Vyro: $10 minimum withdrawal, weekly, via Stripe/PayPal | First cash | VERIFY_AT_SIGNUP |
| C13 | Vues: no follower minimum and no per-clip view threshold (self-published claim) | New-account fit | VERIFY_AT_SIGNUP |
| C14 | Clipping.net: $0.10–$3 CPM, per-campaign view thresholds, pays at cycle close | Low priority | VERIFY_AT_SIGNUP |
| C15 | Clipster's campaigns are iGaming-heavy | Exclusion | VERIFY_AT_SIGNUP (the gambling exclusion stands regardless) |
| C16 | YouTube Partner Program Shorts path: 1,000 subs + 10M valid Shorts views/90 days; rising 2027-02-01 | Platform monetization | VERIFY_AT_SIGNUP |
| C17 | TikTok Creator Rewards: 10k followers, 100k views/30 days, videos > 1 min, 18+ | Platform monetization | VERIFY_AT_SIGNUP |
| C18 | YouTube Shopping affiliate requires YPP (500+ subs tier) + supported country | Affiliate | VERIFY_AT_SIGNUP |
| C19 | TikTok Shop affiliate (US): 1,000 followers for the pilot, 5,000 for full access | Affiliate | VERIFY_AT_SIGNUP |
| C20 | YouTube Data API uploads from unverified projects are forced private until audit | Publishing automation | VERIFY_AT_SIGNUP |
| C21 | TikTok Content Posting API: unaudited clients post SELF_ONLY; max 5 users/24h | Publishing automation | VERIFY_AT_SIGNUP |
| C22 | TikTok: unoriginal/reposted/watermarked content is ineligible for the For You feed; multiple accounts allowed if not deceptive | Content standards | VERIFY_AT_SIGNUP |
| C23 | YouTube reused-content policy applies even with the creator's permission | Transformation standard | VERIFY_AT_SIGNUP |
| C24 | FTC: paid-per-view clippers must disclose; TikTok's platform toggle alone isn't sufficient | Disclosure | VERIFY_AT_SIGNUP (we disclose conservatively regardless) |
| C25 | Linking multiple social accounts to one marketplace profile is allowed | Account linking | **UNKNOWN**, VERIFY_AT_SIGNUP |
| C26 | Approval turnaround time on campaigns | Scheduling | **UNKNOWN** |
| C27 | Account-age requirements | Account readiness | **UNKNOWN** |

**Conservative defaults that don't depend on any claim:** always disclose paid content; one
unique cut per account per campaign unless the brief explicitly allows duplicates; no
gambling/casino campaigns; no VPNs; clip only `authorized_to_clip = true` sources.

---

## 3. What the research suggests (planning hypotheses, not rules)

- **Paid clipping campaigns look like the only path that could pay out within 30 days**
  (C01, C07, C11). Platform monetization and affiliate programs appear gated beyond reach
  (C16–C19). Every account starts with `platform_monetization_eligible: unknown`.
- **The first cash-out is probably gated by a withdrawal minimum** (C04, C12), not by the
  first $1 credited.
- **An earning window plus a hold period** (C03) would mean late-month clips can't turn into
  cash by Day 30. Once the brief is verified, compute the real last useful posting date from
  the brief's own fields.
- **Automated public publishing probably isn't available** without API audits (C20, C21).
  Publishing is manual during the MVP either way, per the human-approval rule.

### Illustrative arithmetic (not a forecast; CPM values are hypothetical)

Views needed = target ÷ CPM × 1,000:

| CPM | $10 | $100 |
|---|---|---|
| $0.50 | 20,000 | 200,000 |
| $1.00 | 10,000 | 100,000 |
| $2.00 | 5,000 | 50,000 |
| $3.00 | 3,334 | 33,334 |
| $4.00 | 2,500 | 25,000 |
| $5.00 | 2,000 | 20,000 |

Real campaign economics get computed from **verified brief fields**, net of **verified**
fees, once Campaign A is selected.

---

## 4. Campaign selection checklist (Brian applies it; Claude can help rank)

Required to join (each item is recorded with `verified_from`):
- `authorized_to_clip = true`, with the authorization text/location recorded.
- Allows TikTok and/or YouTube Shorts.
- Enough time left for clips to earn **and** clear any hold before Day 30, using the brief's
  own numbers.
- Per-submission minimum views are realistic for new accounts.
- No requirement our accounts fail (followers, age, geography).
- Not gambling/casino, adult, get-rich-quick, or medical/financial-claims content.
- Evidence the campaign has paid out before; no agency-style high withdrawal minimum.
- Brief rules (tags, disclosure, length, edit style, duplicate policy) copied into
  `campaigns.csv` before the first clip.

Ranking heuristic (tunable, not a rule): higher CPM, more budget left, lower view
threshold, more clippable source (dense talking-head > gameplay > lecture).

---

## 5. Accounts

**Roles are data.** `data/accounts.csv` holds each account's `current_role`,
`current_campaign_ids`, `role_since` and `status`. Every role change is appended to
`data/role_changes.csv` with a reason and date. Code must look up roles from data. It must
never branch on `YT2` / `TT1` etc.

**Provisional starting allocation** (expected to change with real performance):

| Account | Status | Provisional role | Hypothesis |
|---|---|---|---|
| YT1 — Robot Desk | **existing, unassigned** | None pending the audit | Protect the existing asset until its identity is known |
| TT1 | new | Campaign A, TikTok | TikTok view velocity vs Shorts on the same source |
| YT2 | new | Campaign A, Shorts (different cuts from TT1) | Shorts long-tail inside the earning window |
| TT2 | new | Campaign B, TikTok | Campaign/niche matters more than platform |
| YT3 | new | Campaign B, Shorts | Same, on Shorts |
| TT3 | new | Scout: 2–3 clips per new campaign | Cheap trials find better campaigns |
| YT4 | new | Hook-style variant on Campaign A (from Week 2) | Hook style changes retention/views |
| YT5 | new, reserve | Scale the winner from Week 3 | Idle capacity beats splitting attention early |

**Robot Desk:** no role until the audit results arrive. A campaign role would need Brian's
explicit sign-off after the audit.

---

## 6. Two parallel tracks

Neither track waits for the other. The business track produces real data from the first
week. The engineering track aims for the first automated clip as fast as possible.

### 6.1 BUSINESS TRACK (Brian-led; Claude assists with research and review)

| Step | Owner | Output | Tracking (no code needed) |
|---|---|---|---|
| B1. Sign up for Whop (and optionally Vyro); read and accept terms; set up payouts | Brian | Accounts ready | Record verified fees/minimums → resolve Claims C04/C05/C12 |
| B2. Select Campaign A (and B) with §4 | Brian (+ Claude ranking pasted briefs) | Campaign(s) chosen | Row in `campaigns.csv` with `verified_from` |
| B3. Obtain the authorized source file/link from the brief | Brian | Source | Row in `sources.csv` with authorization text |
| B4. Hand-cut first clips (CapCut desktop) if the pipeline isn't ready | Brian | 2–3 clips/day | Row per clip in `posts.csv` |
| B5. Human review against the brief | Brian | Approve/reject | `approval_status` |
| B6. Publish manually, with disclosure | Brian | Live post | `post_url`, `publish_date` |
| B7. Submit to the campaign manually | Brian | Submission | `submitted_at`, `campaign_approval_status` |
| B8. Daily manual check-in (~10 min) | Brian | Views, verified views, credited $, approvals, withdrawals, cash received | `metrics_manual.csv`, `ledger.csv` |

The data templates are plain CSVs that can be edited in Excel from Day 1. Brian owns them;
no scripts are needed yet.

### 6.2 ENGINEERING TRACK (starts when Campaign A's source is verified)

Target: **one authorized source → timestamped transcript → three candidate moments → one
usable 9:16 clip with readable burned-in captions → human review.**

| Step | What it does | Tooling (local, free) | Who writes it |
|---|---|---|---|
| E0. Setup | Python 3.12 venv, ffmpeg on PATH, repo cloned | winget/pip | **Brian** (Claude guides) |
| E1. Ingest | Copy the supplied file into `media/sources/`, compute SHA-256, read duration/resolution with `ffprobe`, write a `source.json` including authorization info | `hashlib`, `subprocess`, `json` | **Brian** (first real task) |
| E2. Transcript | Word-level timestamps → `transcript.json` + `.srt` | `faster-whisper` (CPU OK; `small`/`medium` model) | Brian writes the runner; Claude explains the model options |
| E3. Candidates | 3 moments (start, end, hook line, reason, score), 20–60s or the brief's length rule | Claude using a rubric prompt over the transcript → `candidates.json` | **Claude drafts the rubric/prompt; Brian writes the file I/O + validation** |
| E4. Cut + 9:16 | Cut the chosen candidate; center-crop/scale to 1080×1920 (face tracking deferred) | `ffmpeg` via `subprocess` | Brian, with Claude pairing on ffmpeg flags |
| E5. Captions | Word-timed, large, high-contrast captions from the transcript slice → `.ass` → burn-in | `ffmpeg` + `.ass` | Claude explains the ASS format; Brian implements the generator |
| E6. Review | Output folder + `review.md` (candidate, hook, brief checklist); Brian approves/rejects | files only | Claude drafts the template |

**Engineering milestone 1 = E0–E6 done on a real authorized source.** Nothing else in the
engineering track (reports, scheduler, health checks, metrics APIs) starts before that.

### 6.3 Deferred until after milestone 1

In likely order:
1. Brief-rule check (length, tags, disclosure text present).
2. Batch mode: several candidates → several clips.
3. Ledger rollups + the three daily reports.
4. Task Scheduler jobs + health checks + automation registry.
5. YouTube Data API metrics.
6. Feedback loop.

The v1 designs for these (§9 of v1) remain the reference, summarized in §8.

### 6.4 Python learning (optional, anytime)

**`campaign_math.py`** is a warm-up exercise that doesn't block anything. Using
`data/campaigns.sample.csv`, print views needed for $10 and $100 (round up), days until
`end_date`, a WARNING if < 7 days, and SKIP if `authorized_to_clip` isn't `true`. Handle a
blank CPM. It teaches `csv.DictReader` (≈ `Import-Csv`), functions (≈ `function` +
`param`), type casts, `datetime` and f-strings.

---

## 7. Agent / skill decision (unchanged)

One project skill, **`clip-ops`**, created alongside E3. It holds the moment-selection
rubric, the brief-compliance checklist, and (later) the report format. **No custom agents**
for now. Revisit a "Clip Critic" reviewer only if human review becomes the bottleneck.
Compliance checks are deterministic Python, not an agent.

---

## 8. Operations design (reference; builds after milestone 1)

- **Scheduler:** Windows Task Scheduler with "wake to run" and "run missed task ASAP."
  Every job appends to `data/runs.jsonl`.
- **Reports (ET):** Morning 07:00 ("What should Brian care about this morning?"), Midday
  13:00, between the post windows ("Change anything before tonight's posts?"), Night 21:00
  ("What did we learn; what changes tomorrow?"). Saved as
  `reports/daily/YYYY-MM-DD/{morning,midday,night}.{md,json}`.
- **Draft schedule:** 05:30 metrics · 05:45 campaign expiry/budget check · 06:00
  ingest/transcribe queued sources · 06:30 candidates · 06:45 render → review queue · 07:00
  morning · hourly health 07–22 · 12:45 metrics · 13:00 midday · 20:45 metrics · 21:00 night
  · 21:30 git backup push. Optional cloud Claude routine for advisory "night lessons" in
  Week 2+.
- **Health severities:** INFO / WARNING go in reports only. ACTION REQUIRED / CRITICAL raise a
  Windows toast (PowerShell BurntToast). Budget: ≤ 2 interrupts/day outside reports.
- **Automation registry:** `config/automations.csv` with name, purpose, schedule,
  input, output, dependencies, failure condition, retry policy, human action, status, last
  success, next run.
- **Automatic vs manual data:** our own YouTube stats via the read-only Data API later.
  TikTok stats, campaign-dashboard verified views, credited revenue, approvals, withdrawals,
  cash received and strikes are **manual** (no scraping of logged-in dashboards).
- **Feedback loop:** weekly comparison by hook type / edit style / campaign / account
  produces recommendations only. Brian approves every change to weights or allocation.
- **Storage:** CSV now. SQLite only if joins become painful.

---

## 9. 30-day plan (two tracks)

| Days | Business track | Engineering track |
|---|---|---|
| 1–2 | Marketplace signup; verify claims; pick Campaign A; get the source | E0 setup; wait for source |
| 3–5 | Hand-cut 2–3 clips/day; publish + submit; daily manual check-in | E1–E2 on the real source |
| 6–9 | Continue; add Campaign B | E3–E6 → **milestone 1: first automated clip** reviewed and, if approved, published |
| 10–14 | Pipeline clips replace hand cuts where quality is ≥; 5–8 clips/day across active accounts; **first withdrawal** as soon as the verified minimum is reached | Brief-rule check, batch mode, ledger rollups |
| 15–21 | Reallocate accounts by real $/clip; activate reserve on winners | Reports + scheduler + health checks |
| 22–30 | Concentrate on what produced verified cash; stop producing for campaigns that can't pay out by Day 30 | Metrics API; feedback loop (advisory) |

**Kill criteria** (tunable): a campaign with 0 approvals after 6 submissions gets dropped.
An account with a median < 100 views/clip after 10 clips gets reassigned or paused.

---

## 10. Brian's manual setup checklist

1. **Create the private repo `Wordups/clip-ops`** (empty; no README/license). Claude then
   pushes this plan with history.
2. Robot Desk audit (separate, when ready).
3. Create the new accounts by hand (YT2–YT4, TT1–TT3; YT5 can wait) with 2FA and
   purpose-matching names/bios. No VPNs. No fake warm-up activity.
4. Whop (+ optional Vyro) signup: accept terms yourself, set up payouts/tax info, and
   **record the verified fees, minimums and account-linking rules** (resolves C04, C05, C12,
   C25).
5. Choose Campaign A and send Claude the brief (text or screenshots) plus the authorized
   source link. **That unblocks the engineering track.**
6. Install Python 3.12, Git, VS Code, ffmpeg, CapCut desktop.
7. Start `time_log.csv` on Day 1.

---

## 11. Cost

Expected cash cost: **~$0 plus payout fees** (amount VERIFY_AT_SIGNUP). All tooling is
local/free or covered by existing subscriptions. Any paid dependency needs a
COST / WHY / FREE ALTERNATIVE / EXPECTED BENEFIT note and Brian's approval first. Higgsfield
(credit-based) is parked.

---

## Sources (secondary — used only to build the Claims Register)

- Whop: [Docs](https://docs.whop.com/memberships-and-access/third-party-apps/content-rewards), [ToS](https://whop.com/content-rewards-terms-of-service/), [Blog](https://whop.com/blog/whop-content-rewards/), [Payout methods](https://docs.whop.com/manage-your-business/manage-payouts/payout-methods), [Ascynd](https://ascynd.io/en/blog/whop-clipping), [OpenClip](https://openclip.app/guides/whop-clipping-guide), [FindClout](https://findclout.com/blog/how-does-content-rewards-work), [ReachCat](https://reach.cat/blog/whop-clipping-hidden-fees/)
- Vyro: [vyro.com](https://vyro.com/), [OpusClip](https://www.opus.pro/blog/mrbeasts-vyro), [Ssemble](https://www.ssemble.com/blog/vyro-review-2026)
- Other marketplaces: [Vues](https://vues.app/blog/best-clipping-platforms-2026), [Clipster](https://www.clipster.gg/), [ClipRadar](https://clipradar.co/), [ClipAffiliates](https://www.clipaffiliates.com/blog/best-clipping-platforms-compared)
- YouTube: [Monetization policies](https://support.google.com/youtube/answer/1311392?hl=en), [Tubefilter](https://www.tubefilter.com/2026/08/10/youtube-partner-program-ad-eligibility-requirements-shorts/), [Shopping affiliate](https://support.google.com/youtube/answer/13376398?hl=en), [API audits](https://developers.google.com/youtube/v3/guides/quota_and_compliance_audits)
- TikTok: [Creator Rewards](https://www.tiktok.com/creator-academy/article/creator-rewards-program), [Integrity & authenticity](https://www.tiktok.com/safety/en/policies-and-engagement/integrity-authenticity), [Content Posting API](https://developers.tiktok.com/docs/en/content-posting-api-get-started)
- Disclosure: [Posthype](https://www.posthype.news/article/clipping-ftc-disclosure), [Influencers-Time](https://www.influencers-time.com/tiktok-branded-content-toggle-is-not-ftc-compliance/)
