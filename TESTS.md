# Tests

## E2E (Playwright)

Run against Docker containers (frontend: `8013`, backend: `8012`).

### PowerShell

```powershell
# Install Playwright (first time only)
cd e2e; npm install; npx playwright install chromium

# Run all tests
cd e2e; npx playwright test --project=chromium

# Run with browser visible
cd e2e; npx playwright test --project=chromium --headed

# Run a single test file
cd e2e; npx playwright test tests/markets.spec.ts --project=chromium

# Debug mode (step through)
cd e2e; npx playwright test --project=chromium --debug

# UI mode
cd e2e; npx playwright test --ui
```

### bash / zsh

```bash
# Install Playwright (first time only)
cd e2e && npm install && npx playwright install chromium

# Run all tests
cd e2e && npx playwright test --project=chromium

# Run with browser visible
cd e2e && npx playwright test --project=chromium --headed

# Run a single test file
cd e2e && npx playwright test tests/markets.spec.ts --project=chromium

# Debug mode (step through)
cd e2e && npx playwright test --project=chromium --debug

# UI mode
cd e2e && npx playwright test --ui
```
