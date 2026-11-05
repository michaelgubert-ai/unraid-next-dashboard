import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const screenshotDir = 'C:\\Users\\Michael\\.gemini\\antigravity\\brain\\364513f9-97fe-42e6-8802-f3951f806466\\screenshots';
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function capture() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  async function switchScenario(scenarioId) {
    await page.evaluate((val) => {
      const select = document.querySelector('select');
      if (select) {
        select.value = val;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, scenarioId);
    await new Promise(r => setTimeout(r, 600));
  }

  // 1. Desktop 1440x900 - Normal State
  console.log('Capturing 1440x900 Normal State...');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  const normalPath = path.join(screenshotDir, 'overview_1440x900_normal.png');
  await page.screenshot({ path: normalPath });
  console.log('Saved:', normalPath);

  // 2. Desktop 1366x768 - Normal State
  console.log('Capturing 1366x768 Normal State...');
  await page.setViewport({ width: 1366, height: 768 });
  await new Promise(r => setTimeout(r, 500));
  const normal1366Path = path.join(screenshotDir, 'overview_1366x768_normal.png');
  await page.screenshot({ path: normal1366Path });
  console.log('Saved:', normal1366Path);

  // 3. Wide 1920x1080 - Normal State
  console.log('Capturing 1920x1080 Wide State...');
  await page.setViewport({ width: 1920, height: 1080 });
  await new Promise(r => setTimeout(r, 500));
  const widePath = path.join(screenshotDir, 'overview_1920x1080_normal.png');
  await page.screenshot({ path: widePath });
  console.log('Saved:', widePath);

  // 4. Desktop 1440x900 - Warning State (Low storage)
  console.log('Switching to warning state (low_storage)...');
  await page.setViewport({ width: 1440, height: 900 });
  await switchScenario('low_storage');
  const warningPath = path.join(screenshotDir, 'overview_1440x900_warning.png');
  await page.screenshot({ path: warningPath });
  console.log('Saved:', warningPath);

  // 5. Desktop 1440x900 - Disk SMART Issue
  console.log('Switching to disk issue state (disk_issue)...');
  await switchScenario('disk_issue');
  const diskIssuePath = path.join(screenshotDir, 'overview_1440x900_disk_issue.png');
  await page.screenshot({ path: diskIssuePath });
  console.log('Saved:', diskIssuePath);

  // 6. Mobile 390x844 - Mobile State
  console.log('Capturing Mobile 390x844...');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await switchScenario('healthy');
  await new Promise(r => setTimeout(r, 500));
  const mobilePath = path.join(screenshotDir, 'overview_390x844_mobile.png');
  await page.screenshot({ path: mobilePath });
  console.log('Saved:', mobilePath);

  // 7. Desktop 1440x900 - Storage Shares Root View
  console.log('Capturing Storage Shares Root View...');
  await page.setViewport({ width: 1440, height: 900 });
  await page.evaluate(() => {
    const storageBtn = document.querySelector('button[data-tab-id="storage"]');
    if (storageBtn) storageBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  const storageRootPath = path.join(screenshotDir, 'storage_1440x900_root.png');
  await page.screenshot({ path: storageRootPath });
  console.log('Saved:', storageRootPath);

  // 8. Desktop 1440x900 - Storage Shares Navigated into Projects 2025
  console.log('Capturing Storage Shares Projects 2025 View (Reference Match)...');
  await page.evaluate(() => {
    // Click on Quick Access item "Projects 2025" or folder
    const spans = Array.from(document.querySelectorAll('span'));
    const p2025 = spans.find(s => s.textContent === 'Projects 2025');
    if (p2025) {
      p2025.click();
    } else {
      const photos = spans.find(s => s.textContent === 'Photos');
      if (photos) photos.click();
    }
  });
  await new Promise(r => setTimeout(r, 500));
  const storageProjectsPath = path.join(screenshotDir, 'storage_1440x900_projects2025.png');
  await page.screenshot({ path: storageProjectsPath });
  console.log('Saved:', storageProjectsPath);

  // 9. Desktop 1440x900 - Storage Shares List View
  console.log('Capturing Storage Shares List View...');
  await page.evaluate(() => {
    const listBtn = document.querySelector('button[title="List View"]');
    if (listBtn) listBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  const storageListPath = path.join(screenshotDir, 'storage_1440x900_listview.png');
  await page.screenshot({ path: storageListPath });
  console.log('Saved:', storageListPath);

  await browser.close();
  console.log('All screenshots captured successfully!');
}

capture().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
