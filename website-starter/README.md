# Website starter kit

Copy everything in this folder, including the hidden `.github` folder, into the root
of the new website repository.

- `START-HERE.md`: for the site owner. Explains how to talk to Claude and gives a
  first message to fill in.
- `CLAUDE.md`: for Claude. Tells it to use plain language, keep her in creative
  control, handle all the technical work, and keep the site simple and mobile-first.
- `content/`: her words (one Markdown file per page) and `ideas.md` for ideas to build later.
- `index.html` + `site.css`: a placeholder "coming soon" page.
- `.github/workflows/pages.yml`: publishes the site for free with GitHub Pages
  every time `main` changes.

## Setup (about 5 minutes)

1. Create the repo on GitHub and copy these files into it.
2. In the repo, go to **Settings → Pages → Source** and choose **GitHub Actions**.
3. Start a Claude Code session on the repo (claude.ai/code) and have her paste the
   first message from `START-HERE.md`.
4. Optional: add a custom domain later under Settings → Pages.
