# SkillSwap System

## Local development

```bash
npm install
npm run dev
```

## Publish to GitHub Pages

This repository is configured to deploy automatically to GitHub Pages with GitHub Actions.

1. Push changes to the `main` branch.
2. In GitHub, open **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Wait for the **Deploy to GitHub Pages** workflow to finish.

The Vite `base` path is set automatically from `GITHUB_REPOSITORY`, so the app works when hosted at `https://<user>.github.io/<repo>/`.
