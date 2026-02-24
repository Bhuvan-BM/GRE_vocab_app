Running Headless Smoke & UI Tests

Quick setup

1. Install dev dependencies (adds Playwright):

```bash
npm install --save-dev playwright
```

2. Download Playwright browser binaries (required once):

```bash
npx playwright install --with-deps
# or
npm run playwright:install
```

Environment variables

- `SMOKE_EMAIL` — email for a test user
- `SMOKE_PASSWORD` — password for that test user

Run tests

- Fast smoke test (screenshot of login + primary views):

```bash
npm run smoke
```

- Deeper UI test (quiz interactions, weak pairs, search, logout):

```bash
npm run deep-test
```

Notes

- The first time Playwright runs it will download browser binaries; this may take a minute.
- For CI, set `SMOKE_EMAIL` and `SMOKE_PASSWORD` as protected environment variables.
- Screenshots are saved under `scripts/screenshots/` and `scripts/deep_screens/`.

Security

- Use a temporary or test account for automated tests; avoid exposing primary credentials in logs.
