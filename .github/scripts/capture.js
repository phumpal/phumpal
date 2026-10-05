const puppeteer = require('puppeteer');

// Card wrapping the profile, stats and contribution graph
const CARD_SELECTOR = "main div.rounded-2xl.shadow-2xl";

(async () => {
  const browser = await puppeteer.launch({
    headless: "true",
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    args: [ '--no-sandbox', '--disable-setuid-sandbox' ],
  });
  const page = await browser.newPage();

  // Sets a viewport to ensure screenshot resolution
  await page.setViewport({ width: 1200, height: 800 });

  // Force the dark theme (the site otherwise follows prefers-color-scheme)
  await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "dark" }]);
  await page.evaluateOnNewDocument(() => localStorage.setItem("contra:theme", "dark"));

  // Navigate to the contribution graph page
  await page.goto("https://contra-psi.vercel.app/?githubUsername=phumpal&gitlabUsername=phumpal1", {
    waitUntil: "networkidle2",
  });

  // Wait for the card to render with its stats filled in
  await page.waitForFunction((selector) => {
    const el = document.querySelector(selector);
    return el && el.offsetHeight > 0 && el.querySelector("dl dd");
  }, { timeout: 60000 }, CARD_SELECTOR);

  // Add extra wait time for dynamic rendering
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Remove the 3D Print / Share / New search buttons
  await page.evaluate((selector) => {
    const card = document.querySelector(selector);
    const button = card && card.querySelector("button");
    if (button) {
      button.parentElement.remove();
    }
  }, CARD_SELECTOR);

  // Capture just the card with the contribution graph and profile info
  const element = await page.$(CARD_SELECTOR);
  if (element) {
    await element.screenshot({ path: "assets/contributions.png" });
    console.log("✅ Screenshot saved as assets/contributions.png");
  } else {
    console.error("❌ Could not find the contribution graph card.");
    process.exitCode = 1;
  }

  await browser.close();
})();
