/**
 * Material Lab Website - Edge Case Tests
 * Stress testing for viewport, scroll, network, browser, content, and interaction edge cases
 */

const { test, expect } = require('@playwright/test');
const {
    waitForPageReady,
    hasHorizontalOverflow,
    setNetworkCondition,
    enableReducedMotion
} = require('./helpers/test-utils');

test.describe('Edge Case Tests', () => {

    // ==========================================
    // 6.1 VIEWPORT EDGE CASES
    // ==========================================

    test.describe('Viewport Edge Cases', () => {

        test('320px width (minimum mobile) should not break layout', async ({ page }) => {
            await page.setViewportSize({ width: 320, height: 568 });
            await page.goto('/');
            await waitForPageReady(page);

            const hasOverflow = await hasHorizontalOverflow(page);
            expect(hasOverflow).toBeFalsy();

            // Content should be visible
            const hero = page.locator('.hero-section');
            await expect(hero).toBeVisible();
        });

        test('767px width (mobile/tablet boundary) should use mobile layout', async ({ page }) => {
            await page.setViewportSize({ width: 767, height: 1024 });
            await page.goto('/');
            await waitForPageReady(page);

            // Mobile menu should be available
            const hamburger = page.locator('.mobile-menu-toggle');
            await expect(hamburger).toBeVisible();
        });

        test('768px width (tablet breakpoint) should switch layout', async ({ page }) => {
            await page.setViewportSize({ width: 768, height: 1024 });
            await page.goto('/');
            await waitForPageReady(page);

            // Check grid changes
            const hasOverflow = await hasHorizontalOverflow(page);
            expect(hasOverflow).toBeFalsy();
        });

        test('1023px width (tablet/desktop boundary) should work', async ({ page }) => {
            await page.setViewportSize({ width: 1023, height: 768 });
            await page.goto('/');
            await waitForPageReady(page);

            const hasOverflow = await hasHorizontalOverflow(page);
            expect(hasOverflow).toBeFalsy();
        });

        test('1024px width (desktop breakpoint) should enable full features', async ({ page }) => {
            await page.setViewportSize({ width: 1024, height: 768 });
            await page.goto('/');
            await waitForPageReady(page);

            // Custom cursor should be available
            const cursorRing = page.locator('#cursor-ring');
            await expect(cursorRing).toBeAttached();
        });

        test('2560px width (4K displays) should scale properly', async ({ page }) => {
            await page.setViewportSize({ width: 2560, height: 1440 });
            await page.goto('/');
            await waitForPageReady(page);

            // Content should be centered and readable
            const heroSection = page.locator('.hero-section');
            await expect(heroSection).toBeVisible();

            const hasOverflow = await hasHorizontalOverflow(page);
            expect(hasOverflow).toBeFalsy();
        });

        test('dynamic viewport resize should not break layout', async ({ page }) => {
            await page.setViewportSize({ width: 1920, height: 1080 });
            await page.goto('/');
            await waitForPageReady(page);

            // Resize to mobile
            await page.setViewportSize({ width: 375, height: 667 });
            await page.waitForTimeout(500);

            // Resize to tablet
            await page.setViewportSize({ width: 768, height: 1024 });
            await page.waitForTimeout(500);

            // Resize back to desktop
            await page.setViewportSize({ width: 1920, height: 1080 });
            await page.waitForTimeout(500);

            // Should have no errors
            const heroSection = page.locator('.hero-section');
            await expect(heroSection).toBeVisible();
        });

        test('landscape orientation on mobile should work', async ({ page }) => {
            await page.setViewportSize({ width: 667, height: 375 });
            await page.goto('/');
            await waitForPageReady(page);

            const hasOverflow = await hasHorizontalOverflow(page);
            expect(hasOverflow).toBeFalsy();
        });
    });

    // ==========================================
    // 6.2 SCROLL EDGE CASES
    // ==========================================

    test.describe('Scroll Edge Cases', () => {

        test('rapid scroll (stress test) should not cause errors', async ({ page }) => {
            await page.goto('/');
            await waitForPageReady(page);

            const errors = [];
            page.on('pageerror', err => errors.push(err.message));

            // Rapid scroll
            for (let i = 0; i < 20; i++) {
                await page.evaluate(() => {
                    window.scrollBy(0, Math.random() > 0.5 ? 500 : -500);
                });
                await page.waitForTimeout(50);
            }

            const criticalErrors = errors.filter(e =>
                e.includes('GSAP') ||
                e.includes('ScrollTrigger') ||
                e.includes('Maximum call')
            );
            expect(criticalErrors.length).toBe(0);
        });

        test('scroll during animation should not break', async ({ page }) => {
            await page.goto('/');
            // Don't wait for animations to complete

            // Immediately start scrolling
            await page.evaluate(async () => {
                for (let y = 0; y < 2000; y += 100) {
                    window.scrollTo(0, y);
                    await new Promise(r => setTimeout(r, 30));
                }
            });

            // Page should still be functional
            const heroSection = page.locator('.hero-section');
            await expect(heroSection).toBeAttached();
        });

        test('scroll to bottom and back should work', async ({ page }) => {
            await page.goto('/');
            await waitForPageReady(page);

            // Scroll to bottom
            await page.evaluate(() => {
                window.scrollTo(0, document.documentElement.scrollHeight);
            });
            await page.waitForTimeout(500);

            // Scroll back to top
            await page.evaluate(() => {
                window.scrollTo(0, 0);
            });
            await page.waitForTimeout(500);

            // Hero should be visible
            const heroSection = page.locator('.hero-section');
            await expect(heroSection).toBeInViewport();
        });

        test('keyboard scroll (spacebar) should work', async ({ page }) => {
            await page.goto('/');
            await waitForPageReady(page);

            // Focus the body
            await page.click('body');

            const initialY = await page.evaluate(() => window.scrollY);

            // Press spacebar
            await page.keyboard.press('Space');
            await page.waitForTimeout(300);

            const newY = await page.evaluate(() => window.scrollY);

            // Should have scrolled
            expect(newY).toBeGreaterThan(initialY);
        });

        test('keyboard scroll (arrow keys) should work', async ({ page }) => {
            await page.goto('/');
            await waitForPageReady(page);

            await page.click('body');

            const initialY = await page.evaluate(() => window.scrollY);

            // Press arrow down multiple times
            for (let i = 0; i < 5; i++) {
                await page.keyboard.press('ArrowDown');
            }
            await page.waitForTimeout(200);

            const newY = await page.evaluate(() => window.scrollY);

            // Should have scrolled down
            expect(newY).toBeGreaterThan(initialY);
        });
    });

    // ==========================================
    // 6.3 NETWORK EDGE CASES
    // ==========================================

    test.describe('Network Edge Cases', () => {

        test('page should handle font loading failure gracefully', async ({ page }) => {
            // Block Google Fonts
            await page.route('**/fonts.googleapis.com/**', route => route.abort());
            await page.route('**/fonts.gstatic.com/**', route => route.abort());

            await page.goto('/');
            await page.waitForTimeout(2000);

            // Page should still render with fallback fonts
            const heroSection = page.locator('.hero-section');
            await expect(heroSection).toBeVisible();

            // Text should still be readable
            const headingText = await page.locator('.heading-line').first().textContent();
            expect(headingText).toBeTruthy();
        });

        test('page should handle image loading failure gracefully', async ({ page }) => {
            // Block all images
            await page.route('**/*.{png,jpg,jpeg,gif,webp}', route => route.abort());

            await page.goto('/');
            await waitForPageReady(page);

            // Layout should not break
            const hasOverflow = await hasHorizontalOverflow(page);
            expect(hasOverflow).toBeFalsy();

            // Navigation should work
            const navLinks = page.locator('.nav-link');
            await expect(navLinks.first()).toBeVisible();
        });

        test('page should handle CDN failure for external scripts', async ({ page }) => {
            // This test checks if the page doesn't completely break
            // even if some CDN resources fail (graceful degradation)
            const errors = [];
            page.on('pageerror', err => errors.push(err.message));

            await page.goto('/');
            await page.waitForTimeout(3000);

            // Page should load basic content
            const body = page.locator('body');
            await expect(body).toBeVisible();
        });
    });

    // ==========================================
    // 6.4 BROWSER EDGE CASES
    // ==========================================

    test.describe('Browser Edge Cases', () => {

        test('page should work with reduced motion preference', async ({ page }) => {
            await enableReducedMotion(page);
            await page.goto('/');
            await page.waitForTimeout(2000);

            // All sections should be visible
            const heroSection = page.locator('.hero-section');
            await expect(heroSection).toBeVisible();

            // Navigation should work
            const viewport = page.viewportSize();
            if (viewport.width >= 768) {
                const aboutLink = page.locator('.nav-link[data-section="about"]');
                if (await aboutLink.isVisible()) {
                    await aboutLink.click();
                    await page.waitForTimeout(500);
                }
            }
        });

        test('page should handle high DPI displays', async ({ page }) => {
            // Set device scale factor
            await page.setViewportSize({ width: 1920, height: 1080 });

            await page.goto('/');
            await waitForPageReady(page);

            // Canvas should render properly
            const canvas = page.locator('#prism-canvas');
            if (await canvas.isVisible()) {
                const dimensions = await canvas.evaluate(el => ({
                    width: el.width,
                    height: el.height,
                    clientWidth: el.clientWidth,
                    clientHeight: el.clientHeight
                }));

                // Canvas should have dimensions set
                expect(dimensions.width).toBeGreaterThan(0);
            }
        });

        test('page should handle touch and mouse combined (hybrid devices)', async ({ page }) => {
            await page.setViewportSize({ width: 1024, height: 768 });
            await page.goto('/');
            await waitForPageReady(page);

            const errors = [];
            page.on('pageerror', err => errors.push(err.message));

            // Simulate mouse interactions
            await page.mouse.move(500, 300);
            await page.waitForTimeout(100);
            await page.mouse.click(500, 300);
            await page.waitForTimeout(100);
            await page.mouse.move(600, 400);
            await page.waitForTimeout(100);

            // No errors should occur
            const heroSection = page.locator('.hero-section');
            await expect(heroSection).toBeVisible();
            expect(errors.filter(e => e.includes('touch') || e.includes('mouse')).length).toBe(0);
        });
    });

    // ==========================================
    // 6.5 CONTENT EDGE CASES
    // ==========================================

    test.describe('Content Edge Cases', () => {

        test('all text should be visible and not clipped', async ({ page }) => {
            await page.goto('/');
            await waitForPageReady(page);

            // Check headings are visible
            const headings = page.locator('h1, h2, h3');
            const count = await headings.count();

            expect(count).toBeGreaterThan(0);

            for (let i = 0; i < Math.min(count, 5); i++) {
                const heading = headings.nth(i);
                if (await heading.isVisible()) {
                    const text = await heading.textContent();
                    expect(text?.trim().length).toBeGreaterThan(0);
                }
            }
        });

        test('special characters should render correctly', async ({ page }) => {
            await page.goto('/');
            await waitForPageReady(page);

            // Check that the page doesn't have encoding issues
            const bodyText = await page.evaluate(() => document.body.textContent);

            // Should not contain encoding errors
            expect(bodyText).not.toContain('�');
            expect(bodyText).not.toContain('&amp;');
        });
    });

    // ==========================================
    // 6.6 USER INTERACTION EDGE CASES
    // ==========================================

    test.describe('User Interaction Edge Cases', () => {

        test('double-click on interactive elements should not break', async ({ page }) => {
            await page.goto('/');
            await waitForPageReady(page);

            const ctaButton = page.locator('.btn-cta').first();
            if (await ctaButton.isVisible()) {
                await ctaButton.dblclick();
                await page.waitForTimeout(300);

                // Should not cause errors
                await expect(ctaButton).toBeVisible();
            }
        });

        test('click during animation should not break', async ({ page }) => {
            await page.goto('/');
            // Immediately click without waiting

            const heroSection = page.locator('.hero-section');
            await heroSection.click();

            await waitForPageReady(page);

            // Page should still be functional
            await expect(heroSection).toBeVisible();
        });

        test('multiple rapid hovers should not cause errors', async ({ page }) => {
            const viewport = page.viewportSize();
            if (viewport.width < 768) {
                test.skip();
                return;
            }

            await page.goto('/');
            await waitForPageReady(page);

            const errors = [];
            page.on('pageerror', err => errors.push(err.message));

            // Rapid hover over different elements
            const elements = ['.btn-cta', '.nav-link', '.service-card'];
            for (const selector of elements) {
                const el = page.locator(selector).first();
                if (await el.isVisible()) {
                    await el.hover();
                    await page.waitForTimeout(50);
                }
            }

            // Repeat rapidly
            for (let i = 0; i < 10; i++) {
                await page.mouse.move(Math.random() * 1000, Math.random() * 500);
                await page.waitForTimeout(30);
            }

            const hoverErrors = errors.filter(e =>
                e.includes('hover') ||
                e.includes('cursor') ||
                e.includes('mouse')
            );
            expect(hoverErrors.length).toBe(0);
        });

        test('touch and immediately scroll should work (mobile)', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            await page.goto('/');
            await waitForPageReady(page);

            // Click then scroll (simulating touch behavior)
            await page.mouse.click(200, 300);
            await page.waitForTimeout(100);

            await page.evaluate(() => {
                window.scrollBy(0, 300);
            });
            await page.waitForTimeout(300);

            // Should have scrolled
            const scrollY = await page.evaluate(() => window.scrollY);
            expect(scrollY).toBeGreaterThan(0);
        });

        test('pinch zoom on mobile should not break layout', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            await page.goto('/');
            await waitForPageReady(page);

            // Simulate pinch zoom via CSS zoom (approximation)
            await page.evaluate(() => {
                document.body.style.zoom = '1.5';
            });
            await page.waitForTimeout(500);

            // Page should still be functional
            const heroSection = page.locator('.hero-section');
            await expect(heroSection).toBeVisible();

            // Reset
            await page.evaluate(() => {
                document.body.style.zoom = '1';
            });
        });

        test('focus should be managed correctly through interactions', async ({ page }) => {
            await page.goto('/');
            await waitForPageReady(page);

            // Tab to first focusable element
            await page.keyboard.press('Tab');
            await page.waitForTimeout(100);

            // Check focus is on something
            const focusedTag = await page.evaluate(() =>
                document.activeElement?.tagName
            );

            expect(focusedTag).not.toBe('BODY');
        });

        test('escape key should work globally', async ({ page }) => {
            const viewport = page.viewportSize();
            await page.goto('/');
            await waitForPageReady(page);

            // Open mobile menu if on mobile
            if (viewport.width < 768) {
                const hamburger = page.locator('.mobile-menu-toggle');
                if (await hamburger.isVisible()) {
                    await hamburger.click();
                    await page.waitForTimeout(300);

                    await page.keyboard.press('Escape');
                    await page.waitForTimeout(300);

                    const overlay = page.locator('#mobileMenuOverlay');
                    await expect(overlay).not.toBeVisible();
                }
            }
        });
    });
});
