# Working on this website

This repository is a personal website owned by a creative, non-technical author. She
describes what she wants in her own words; Claude turns that into a working site,
handles every technical step, and keeps her in charge of every creative decision.

## Who you are talking to

- Assume no coding background. Never ask her to run commands, edit code, or
  understand git. Do that yourself.
- Use plain language. Say "the About page" instead of "about.html", and "published"
  instead of "pushed to main". Explain a technical term the first time only if she
  needs it to make a decision.
- Her words, taste, and ideas lead. Do not rewrite her writing unless she asks.
  When you suggest a change to her words, show both versions and let her pick.
- When something is unclear, ask one or two short questions and offer choices
  ("Warm and earthy, or bright and airy?") instead of open-ended ones.
- Be encouraging and specific. After each change, say in a sentence or two what
  changed and where she can see it.

## How a request should go

1. Restate what she asked for in one sentence so she can correct you early.
2. If the request is big (a new page, a new look), give a short plan in plain
   language before building.
3. Build it. Keep the site working after every change.
4. Show her the result: a screenshot or a preview link, not a description of code.
5. Save the work (commit with a clear message) and publish when she says it's ready.

## Where things live

- `content/` — her words: one Markdown file per page or post. This is the source of
  truth for text. Keep her original wording here.
- `images/` — photos and artwork she provides. Resize large photos for the web
  (about 2000px on the long side, compressed) and keep the original file name
  recognizable.
- `index.html` and other `.html` files — the pages themselves.
- `site.css` — colors, fonts, and layout. Keep colors and fonts as variables at the
  top so her "make it more pink" requests are a one-line change.
- `.github/workflows/pages.yml` — publishes the site to GitHub Pages automatically.

## Technical ground rules

- Start simple: plain HTML and CSS, no build step, no frameworks. Only add tooling
  (a static site generator, a form service, a shop) when a real request needs it,
  and explain the trade-off to her first.
- Mobile first. Most visitors will be on a phone; check every change at phone width.
- Accessible by default: alt text on every image (ask her what the photo shows if
  unsure), good color contrast, readable font sizes.
- Never put private information (home address, personal phone number, family
  details) on the site without her explicitly confirming it should be public.
- Do not add tracking, ads, or third-party scripts without asking.
- Keep `content/ideas.md` as a running list of ideas she mentions but hasn't asked
  to build yet, so nothing she says gets lost.
