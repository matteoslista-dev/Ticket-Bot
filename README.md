# Ticket session manager

Local Windows 10 browser session manager for authorized queue testing. Each session has a separate browser and cookie store. CAPTCHAs are completed by you; checkout remains manual. No proxy rotation, stealth settings, automated CAPTCHA solving, refresh loops or automatic purchases.

## Windows 10

Install Node.js 22 LTS or newer supported LTS, then open PowerShell in this folder:

```powershell
npm ci
npx playwright install chromium
npm start
```

Open the control panel at `http://127.0.0.1:8787` in your local browser. Select 5 sessions initially (maximum 50), then click **Open sessions**. Opening is sequential and may take time. Use **Show window** to switch between sessions and complete each CAPTCHA. The control panel must stay running. Closing a browser loses that session; closing the app closes all browsers. Nothing persists across restarts.

If you see admission, click **Mark admitted**. For automatic detection, enter exact text visible only after admission, or enter a CSS selector that you have verified exists and is visible only after admission. No Billetweb admission selector has been verified or provided. Text must match the complete visible element text exactly. Selectors take priority when both fields are filled. Detection checks the page and its embedded frames. Detection observes the existing page every two seconds without additional navigation; it does not submit forms. An alert appears in the control panel and the matching browser is brought forward (Windows may restrict foreground focus). All other windows stay open.

Fifty browsers can consume substantial memory. Increase the session count only within the agreed testing scope and your machine's capacity. Independent cookies do not guarantee independent queue entries or better odds.

## Development validation

```sh
npm ci
npx playwright install chromium
npm test
```

The test uses a local simulated queue: verifies cookie isolation, manual challenge interaction, automatic admission detection, manual admission and cleanup. Linux may require `npx playwright install --with-deps chromium`. This does not validate the real site's admission flow or Windows-specific window behavior.

### Default keyword alerts

The app watches for **Proceeds** OR **Checkout**, separately, case-insensitively and as whole words in visible text, including embedded frames. Either triggers a yellow **possible** status and focuses the browser. It does not confirm admission, click anything or buy tickets. Verify the page yourself and click **Mark admitted**. Unrelated text can cause false alerts; keyword monitoring stops for that session after its first alert. Uncheck the keyword option before starting if you want only verified text/selector detection or manual confirmation.
