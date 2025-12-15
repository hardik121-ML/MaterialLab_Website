const { test, expect } = require('@playwright/test');

test.describe('Responsive Layout Acceptance Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  // ========================================
  // CRITICAL ELEMENTS RENDER
  // ========================================

  test('hero section renders correctly', async ({ page }) => {
    const heroSection = await page.$('.hero-section');
    expect(heroSection).not.toBeNull();

    // Check hero heading is visible
    const heroHeading = await page.$('.hero-heading');
    expect(heroHeading).not.toBeNull();

    const headingVisible = await heroHeading.isVisible();
    expect(headingVisible).toBe(true);

    console.log('✓ Hero section renders correctly');
  });

  test('services section renders', async ({ page }) => {
    const servicesSection = await page.$('#services');
    expect(servicesSection).not.toBeNull();

    // Check services title exists
    const servicesTitle = await page.$('.services-title');
    expect(servicesTitle).not.toBeNull();

    console.log('✓ Services section renders');
  });

  test('about section cards display', async ({ page }) => {
    const aboutSection = await page.$('#about');
    expect(aboutSection).not.toBeNull();

    // Check about cards exist
    const aboutCards = await page.$$('.about-card');
    expect(aboutCards.length).toBeGreaterThan(0);

    console.log(`✓ About section renders with ${aboutCards.length} cards`);
  });

  test('methodology cards render', async ({ page }) => {
    const methodologySection = await page.$('.methodology-section');
    expect(methodologySection).not.toBeNull();

    const methodologyCards = await page.$$('.methodology-card');
    expect(methodologyCards.length).toBeGreaterThan(0);

    console.log(`✓ Methodology section renders with ${methodologyCards.length} cards`);
  });

  test('footer renders correctly', async ({ page }) => {
    const footer = await page.$('.ml-footer');
    expect(footer).not.toBeNull();

    // Check footer CTA button exists
    const ctaButton = await page.$('.ml-footer-cta-button');
    expect(ctaButton).not.toBeNull();

    console.log('✓ Footer renders correctly');
  });

  // ========================================
  // TEXT OVERLAP DETECTION
  // ========================================

  test('hero heading has proper line height', async ({ page }) => {
    const lineHeight = await page.evaluate(() => {
      const heading = document.querySelector('.hero-heading');
      if (!heading) return null;
      const computed = window.getComputedStyle(heading);
      return parseFloat(computed.lineHeight) / parseFloat(computed.fontSize);
    });

    // Line height ratio should be reasonable (1.0 - 1.5 typically)
    expect(lineHeight).not.toBeNull();
    expect(lineHeight).toBeGreaterThanOrEqual(0.9);
    expect(lineHeight).toBeLessThanOrEqual(1.5);

    console.log(`✓ Hero heading line height ratio: ${lineHeight?.toFixed(2)}`);
  });

  test('section headers do not overflow containers', async ({ page }) => {
    const overflowingHeaders = await page.evaluate(() => {
      const headers = document.querySelectorAll('h1, h2, h3');
      const issues = [];

      headers.forEach((header) => {
        const parent = header.parentElement;
        if (!parent) return;

        const headerRect = header.getBoundingClientRect();
        const parentRect = parent.getBoundingClientRect();

        // Check if header extends beyond parent (with some tolerance)
        if (headerRect.right > parentRect.right + 5 || headerRect.left < parentRect.left - 5) {
          issues.push({
            text: header.textContent?.substring(0, 50),
            headerWidth: headerRect.width,
            parentWidth: parentRect.width
          });
        }
      });

      return issues;
    });

    if (overflowingHeaders.length > 0) {
      console.log('⚠ Overflowing headers:', overflowingHeaders);
    }

    expect(overflowingHeaders.length).toBe(0);
    console.log('✓ No section headers overflow their containers');
  });

  test('nav links do not overlap', async ({ page, browserName }, testInfo) => {
    // Skip on mobile since nav is hidden
    const viewport = testInfo.project.use?.viewport;
    if (viewport && viewport.width < 768) {
      console.log('⏭ Skipping nav overlap test on mobile viewport');
      return;
    }

    const navIssues = await page.evaluate(() => {
      const navLinks = document.querySelectorAll('.nav-links .nav-item');
      const issues = [];

      const links = Array.from(navLinks);
      for (let i = 0; i < links.length - 1; i++) {
        const current = links[i].getBoundingClientRect();
        const next = links[i + 1].getBoundingClientRect();

        // Check if items overlap horizontally
        if (current.right > next.left) {
          issues.push({
            index: i,
            overlap: current.right - next.left
          });
        }
      }

      return issues;
    });

    expect(navIssues.length).toBe(0);
    console.log('✓ Nav links do not overlap');
  });

  // ========================================
  // LAYOUT ALIGNMENT
  // ========================================

  test('grid containers have proper padding', async ({ page }, testInfo) => {
    const viewport = testInfo.project.use?.viewport;
    const expectedPadding = viewport?.width < 768 ? 24 : viewport?.width < 1024 ? 40 : 56;

    const gridPadding = await page.evaluate(() => {
      const grid = document.querySelector('.grid-20');
      if (!grid) return null;
      const computed = window.getComputedStyle(grid);
      return parseFloat(computed.paddingLeft);
    });

    expect(gridPadding).not.toBeNull();
    // Allow some tolerance
    expect(gridPadding).toBeGreaterThanOrEqual(expectedPadding - 5);

    console.log(`✓ Grid padding: ${gridPadding}px (expected ~${expectedPadding}px)`);
  });

  test('footer columns stack correctly on mobile', async ({ page }, testInfo) => {
    const viewport = testInfo.project.use?.viewport;

    // Skip on non-mobile viewports before page load
    if (viewport && viewport.width >= 768) {
      test.skip();
      return;
    }

    const footerLayout = await page.evaluate(() => {
      const footerLeft = document.querySelector('.ml-footer-left');
      const footerRight = document.querySelector('.ml-footer-right');

      if (!footerLeft || !footerRight) return null;

      const leftRect = footerLeft.getBoundingClientRect();
      const rightRect = footerRight.getBoundingClientRect();

      return {
        leftTop: leftRect.top,
        rightTop: rightRect.top,
        isStacked: rightRect.top > leftRect.bottom - 50 // Right should be below left
      };
    });

    if (footerLayout) {
      expect(footerLayout.isStacked).toBe(true);
      console.log('✓ Footer columns stack correctly on mobile');
    }
  });

  // ========================================
  // SPACING CONSISTENCY
  // ========================================

  test('section padding matches design spec', async ({ page }) => {
    const sectionPaddings = await page.evaluate(() => {
      const sections = [
        '.services-section',
        '.methodology-section',
        '.manifesto-section'
      ];

      return sections.map(selector => {
        const section = document.querySelector(selector);
        if (!section) return null;
        const computed = window.getComputedStyle(section);
        return {
          selector,
          paddingTop: parseFloat(computed.paddingTop),
          paddingBottom: parseFloat(computed.paddingBottom)
        };
      }).filter(Boolean);
    });

    // All sections should have padding
    sectionPaddings.forEach(section => {
      expect(section.paddingTop).toBeGreaterThan(0);
      console.log(`✓ ${section.selector} - paddingTop: ${section.paddingTop}px`);
    });
  });

  test('container max-width is respected', async ({ page }) => {
    const containerWidths = await page.evaluate(() => {
      const grid = document.querySelector('.grid-20');
      if (!grid) return null;

      const computed = window.getComputedStyle(grid);
      const rect = grid.getBoundingClientRect();

      return {
        maxWidth: parseFloat(computed.maxWidth) || 1600,
        actualWidth: rect.width,
        viewportWidth: window.innerWidth
      };
    });

    expect(containerWidths).not.toBeNull();
    expect(containerWidths.actualWidth).toBeLessThanOrEqual(containerWidths.maxWidth + 1);

    console.log(`✓ Container width: ${containerWidths.actualWidth}px (max: ${containerWidths.maxWidth}px)`);
  });

  // ========================================
  // INTERACTIVE ELEMENTS
  // ========================================

  test('CTA buttons are clickable', async ({ page }) => {
    const ctaButton = await page.$('.btn-cta');
    expect(ctaButton).not.toBeNull();

    const isClickable = await page.evaluate(() => {
      const btn = document.querySelector('.btn-cta');
      if (!btn) return false;
      const computed = window.getComputedStyle(btn);
      return computed.pointerEvents !== 'none';
    });

    expect(isClickable).toBe(true);
    console.log('✓ CTA buttons are clickable');
  });

  test('custom cursor elements exist on desktop', async ({ page }, testInfo) => {
    const viewport = testInfo.project.use?.viewport;

    if (viewport && viewport.width < 768) {
      console.log('⏭ Skipping cursor test on mobile viewport');
      return;
    }

    const cursorRing = await page.$('#cursor-ring');
    const cursorDot = await page.$('#cursor-dot');

    expect(cursorRing).not.toBeNull();
    expect(cursorDot).not.toBeNull();

    console.log('✓ Custom cursor elements exist');
  });

});
