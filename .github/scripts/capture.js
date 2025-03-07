const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  // Sets a viewport to ensure screenshot resolution
  await page.setViewport({ width: 1200, height: 800 });

  // Navigate to the contribution graph page
  await page.goto("https://contra-psi.vercel.app/?githubUsername=phumpal&gitlabUsername=phumpal1", {
    waitUntil: "networkidle2",
  });

  // Wait for the specific card element to be visible (work in progress)
  await page.waitForFunction(() => {
    const el = document.querySelector("div.relative.p-4.sm\\:p-6");
    return el && el.offsetHeight > 0;
  }, { timeout: 60000 });

  // Add extra wait time for dynamic rendering
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Capture just the card with the contribution graph and profile info
  const element = await page.$("div.relative.p-4.sm\\:p-6");
  if (element) {
    await element.screenshot({ path: "assets/contributions.png" });
    console.log("✅ Screenshot saved as assets/contributions.png");
  } else {
    console.error("❌ Could not find the contribution graph card.");
  }

  await browser.close();
})();
