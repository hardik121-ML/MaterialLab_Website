const { test } = require('@playwright/test');

test('take screenshot of cursor', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(3000);

  // Move mouse to center
  await page.mouse.move(960, 540);
  await page.waitForTimeout(500);

  // Take screenshot
  await page.screenshot({
    path: '/Users/daminirathi/Desktop/ML Explore/MaterialLab_Website/cursor-screenshot.png',
    fullPage: false
  });

  console.log('Screenshot saved to cursor-screenshot.png');

  // Also check what's at cursor position
  const elementAtCursor = await page.evaluate(() => {
    const el = document.elementFromPoint(960, 540);
    return el ? {
      tag: el.tagName,
      id: el.id,
      className: el.className
    } : null;
  });

  console.log('Element at cursor position:', elementAtCursor);

  // Check cursor element visibility
  const cursorInfo = await page.evaluate(() => {
    const cursor = document.getElementById('custom-cursor');
    if (!cursor) return { error: 'not found' };

    const rect = cursor.getBoundingClientRect();
    const style = window.getComputedStyle(cursor);

    return {
      visible: style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0',
      rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      zIndex: style.zIndex,
      backgroundColor: style.backgroundColor,
      display: style.display
    };
  });

  console.log('Cursor info:', cursorInfo);
});
