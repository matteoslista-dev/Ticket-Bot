# Ticket session manager

Local Windows 10 browser session manager for authorized queue testing. Each session has a separate browser and cookie store. CAPTCHAs are completed by you; checkout remains manual. No proxy rotation, stealth settings, automated CAPTCHA solving, refresh loops or automatic purchases.

## Windows 10

Install Node.js 22 LTS or newer supported LTS, then open PowerShell in this folder:

```powershell
npm ci
npx playwright install chromium
npm start
```

Open the control panel at `http://127.0.0.1:8787` in your local browser. Select 5 sessions initially (maximum 20), then click **Open sessions**. Opening is sequential and may take time. Use **Show window** to switch between sessions and complete each CAPTCHA. The control panel must stay running. Closing a browser loses that session; closing the app closes all browsers. Nothing persists across restarts.

If you see admission, click **Mark admitted**. For automatic detection, enter a CSS selector that you have verified exists and is visible only after admission. No Billetweb admission selector has been verified or provided. Detection observes the existing page every two seconds without additional navigation; it does not submit forms. An alert appears in the control panel and the matching browser is brought forward (Windows may restrict foreground focus). All other windows stay open.

Twenty browsers can consume substantial memory. Increase the session count only within the agreed testing scope and your machine's capacity. Independent cookies do not guarantee independent queue entries or better odds.

## Development validation

```sh
npm ci
npx playwright install chromium
npm test
```

The test uses a local simulated queue: verifies cookie isolation, manual challenge interaction, automatic admission detection, manual admission and cleanup. Linux may require `npx playwright install --with-deps chromium`. This does not validate the real site's admission flow or Windows-specific window behavior.
