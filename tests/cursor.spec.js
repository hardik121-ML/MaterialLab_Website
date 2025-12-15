const { test, expect } = require('@playwright/test');

test.describe('Two-Element Cursor System Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Collect console logs
    page.on('console', msg => {
      console.log('[BROWSER]', msg.type(), msg.text());
    });

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('cursor ring element exists in DOM', async ({ page }) => {
    const cursorRing = await page.$('#cursor-ring');
    expect(cursorRing).not.toBeNull();
    console.log('✓ Cursor ring element found in DOM');
  });

  test('cursor dot element exists in DOM', async ({ page }) => {
    const cursorDot = await page.$('#cursor-dot');
    expect(cursorDot).not.toBeNull();
    console.log('✓ Cursor dot element found in DOM');
  });

  test('cursor ring has correct base styles (hollow circle)', async ({ page }) => {
    const styles = await page.evaluate(() => {
      const ring = document.getElementById('cursor-ring');
      if (!ring) return null;
      const computed = window.getComputedStyle(ring);
      return {
        display: computed.display,
        visibility: computed.visibility,
        position: computed.position,
        width: computed.width,
        height: computed.height,
        backgroundColor: computed.backgroundColor,
        border: computed.border,
        borderRadius: computed.borderRadius,
        zIndex: computed.zIndex,
        pointerEvents: computed.pointerEvents
      };
    });

    console.log('Cursor ring computed styles:', JSON.stringify(styles, null, 2));

    expect(styles).not.toBeNull();
    expect(styles.position).toBe('fixed');
    expect(styles.pointerEvents).toBe('none');
    expect(styles.display).not.toBe('none');
    expect(styles.width).toBe('32px');
    expect(styles.height).toBe('32px');
  });

  test('cursor dot has correct base styles (solid circle)', async ({ page }) => {
    const styles = await page.evaluate(() => {
      const dot = document.getElementById('cursor-dot');
      if (!dot) return null;
      const computed = window.getComputedStyle(dot);
      return {
        display: computed.display,
        visibility: computed.visibility,
        position: computed.position,
        width: computed.width,
        height: computed.height,
        backgroundColor: computed.backgroundColor,
        borderRadius: computed.borderRadius,
        zIndex: computed.zIndex,
        pointerEvents: computed.pointerEvents
      };
    });

    console.log('Cursor dot computed styles:', JSON.stringify(styles, null, 2));

    expect(styles).not.toBeNull();
    expect(styles.position).toBe('fixed');
    expect(styles.pointerEvents).toBe('none');
    expect(styles.display).not.toBe('none');
    expect(styles.width).toBe('4px');
    expect(styles.height).toBe('4px');
  });

  test('GSAP is loaded', async ({ page }) => {
    const gsapLoaded = await page.evaluate(() => {
      return typeof window.gsap !== 'undefined';
    });

    console.log('GSAP loaded:', gsapLoaded);
    expect(gsapLoaded).toBe(true);
  });

  test('both cursor elements follow mouse movement', async ({ page }) => {
    // Move mouse to specific position
    await page.mouse.move(500, 400);
    await page.waitForTimeout(800); // Wait for ring animation (0.5s)

    // Check cursor ring position
    const ringPos = await page.evaluate(() => {
      const ring = document.getElementById('cursor-ring');
      if (!ring) return null;
      const style = ring.getAttribute('style');
      return { style: style };
    });

    // Check cursor dot position
    const dotPos = await page.evaluate(() => {
      const dot = document.getElementById('cursor-dot');
      if (!dot) return null;
      const style = dot.getAttribute('style');
      return { style: style };
    });

    console.log('Ring position style:', ringPos);
    console.log('Dot position style:', dotPos);

    expect(ringPos).not.toBeNull();
    expect(dotPos).not.toBeNull();
    expect(ringPos.style).toContain('transform');
    expect(dotPos.style).toContain('transform');
  });

  test('cursor elements get hovering class on interactive element hover', async ({ page }) => {
    // Find a button or link
    const button = await page.$('a, button');

    if (button) {
      const buttonBox = await button.boundingBox();

      // Move to button center
      await page.mouse.move(
        buttonBox.x + buttonBox.width / 2,
        buttonBox.y + buttonBox.height / 2
      );
      await page.waitForTimeout(500);

      // Check if cursor elements have hovering class
      const ringHasHoverClass = await page.evaluate(() => {
        const ring = document.getElementById('cursor-ring');
        return ring ? ring.classList.contains('hovering') : false;
      });

      const dotHasHoverClass = await page.evaluate(() => {
        const dot = document.getElementById('cursor-dot');
        return dot ? dot.classList.contains('hovering') : false;
      });

      console.log('Ring has hovering class:', ringHasHoverClass);
      console.log('Dot has hovering class:', dotHasHoverClass);

      expect(ringHasHoverClass).toBe(true);
      expect(dotHasHoverClass).toBe(true);
    }
  });

  test('ring scales up and dot disappears on hover', async ({ page }) => {
    // Find a button or link
    const button = await page.$('a, button');

    if (button) {
      const buttonBox = await button.boundingBox();

      // Move to button center
      await page.mouse.move(
        buttonBox.x + buttonBox.width / 2,
        buttonBox.y + buttonBox.height / 2
      );
      await page.waitForTimeout(800); // Wait for GSAP scale animation to complete

      // Check ring has hovering class and is scaled (GSAP applies scale via transform)
      const ringStyles = await page.evaluate(() => {
        const ring = document.getElementById('cursor-ring');
        if (!ring) return null;
        const computed = window.getComputedStyle(ring);
        const rect = ring.getBoundingClientRect();
        return {
          hasHoveringClass: ring.classList.contains('hovering'),
          backgroundColor: computed.backgroundColor,
          mixBlendMode: computed.mixBlendMode,
          transform: computed.transform,
          // getBoundingClientRect includes the scale transform
          boundingWidth: rect.width,
          boundingHeight: rect.height
        };
      });

      // Check dot opacity (should be 0 when hovering)
      const dotStyles = await page.evaluate(() => {
        const dot = document.getElementById('cursor-dot');
        if (!dot) return null;
        const computed = window.getComputedStyle(dot);
        return {
          opacity: computed.opacity,
          hasHoveringClass: dot.classList.contains('hovering')
        };
      });

      console.log('Ring styles on hover:', ringStyles);
      console.log('Dot styles on hover:', dotStyles);

      // Ring should have hovering class
      expect(ringStyles.hasHoveringClass).toBe(true);
      // Ring should be scaled (bounding rect shows scaled dimensions: 32 * 3 = 96)
      expect(ringStyles.boundingWidth).toBeCloseTo(96, 0);
      expect(ringStyles.boundingHeight).toBeCloseTo(96, 0);
      // Dot should have hovering class and opacity 0
      expect(dotStyles.hasHoveringClass).toBe(true);
      expect(dotStyles.opacity).toBe('0');
    }
  });

  test('full cursor debug info', async ({ page }) => {
    // Move mouse to center
    await page.mouse.move(960, 540);
    await page.waitForTimeout(600);

    // Comprehensive debug output
    const debugInfo = await page.evaluate(() => {
      const ring = document.getElementById('cursor-ring');
      const dot = document.getElementById('cursor-dot');

      const getRingInfo = () => {
        if (!ring) return { error: 'Ring element not found' };
        const computed = window.getComputedStyle(ring);
        const rect = ring.getBoundingClientRect();
        return {
          id: ring.id,
          className: ring.className,
          inlineStyle: ring.getAttribute('style'),
          computedStyles: {
            display: computed.display,
            visibility: computed.visibility,
            opacity: computed.opacity,
            position: computed.position,
            width: computed.width,
            height: computed.height,
            border: computed.border,
            backgroundColor: computed.backgroundColor,
            zIndex: computed.zIndex
          },
          boundingRect: {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height
          }
        };
      };

      const getDotInfo = () => {
        if (!dot) return { error: 'Dot element not found' };
        const computed = window.getComputedStyle(dot);
        const rect = dot.getBoundingClientRect();
        return {
          id: dot.id,
          className: dot.className,
          inlineStyle: dot.getAttribute('style'),
          computedStyles: {
            display: computed.display,
            visibility: computed.visibility,
            opacity: computed.opacity,
            position: computed.position,
            width: computed.width,
            height: computed.height,
            backgroundColor: computed.backgroundColor,
            zIndex: computed.zIndex
          },
          boundingRect: {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height
          }
        };
      };

      return {
        ring: getRingInfo(),
        dot: getDotInfo(),
        gsapLoaded: typeof window.gsap !== 'undefined',
        gsapVersion: typeof window.gsap !== 'undefined' ? window.gsap.version : null
      };
    });

    console.log('\n========== TWO-ELEMENT CURSOR DEBUG INFO ==========');
    console.log(JSON.stringify(debugInfo, null, 2));
    console.log('====================================================\n');

    expect(debugInfo.ring.error).toBeUndefined();
    expect(debugInfo.dot.error).toBeUndefined();
  });

});
