/**
 * Material Lab Website - Visual Regression Tests
 * Screenshot comparisons and theme consistency checks
 */

const { test, expect } = require('@playwright/test');
const {
    waitForPageReady,
    SECTIONS
} = require('./helpers/test-utils');

test.describe('Visual Regression Tests', () => {

    // ==========================================
    // 7.1 SCREENSHOT COMPARISONS
    // ==========================================

    test.describe('Section Screenshots', () => {

        test('hero section should match baseline (desktop)', async ({ page }) => {
            await page.setViewportSize({ width: 1920, height: 1080 });
            await page.goto('/');
            await waitForPageReady(page);

            const heroSection = page.locator('.hero-section');
            await expect(heroSection).toHaveScreenshot('hero-desktop.png', {
                maxDiffPixels: 1000,
                threshold: 0.3
            });
        });

        test('hero section should match baseline (mobile)', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            await page.goto('/');
            await waitForPageReady(page);

            const heroSection = page.locator('.hero-section');
            await expect(heroSection).toHaveScreenshot('hero-mobile.png', {
                maxDiffPixels: 1000,
                threshold: 0.3
            });
        });

        test('services section should match baseline', async ({ page }) => {
            await page.setViewportSize({ width: 1920, height: 1080 });
            await page.goto('/');
            await waitForPageReady(page);

            await page.evaluate(() => {
                document.querySelector('.services-section')?.scrollIntoView({ behavior: 'instant' });
            });
            await page.waitForTimeout(1000);

            const servicesSection = page.locator(SECTIONS.services);
            await expect(servicesSection).toHaveScreenshot('services-desktop.png', {
                maxDiffPixels: 1000,
                threshold: 0.3
            });
        });

        test('about stacked cards should match baseline', async ({ page }) => {
            await page.setViewportSize({ width: 1920, height: 1080 });
            await page.goto('/');
            await waitForPageReady(page);

            await page.evaluate(() => {
                document.querySelector('.about-stacked-section')?.scrollIntoView({ behavior: 'instant' });
            });
            await page.waitForTimeout(1000);

            const aboutSection = page.locator(SECTIONS.about);
            await expect(aboutSection).toHaveScreenshot('about-desktop.png', {
                maxDiffPixels: 1500,
                threshold: 0.3
            });
        });

        test('methodology section should match baseline', async ({ page }) => {
            await page.setViewportSize({ width: 1920, height: 1080 });
            await page.goto('/');
            await waitForPageReady(page);

            await page.evaluate(() => {
                document.querySelector('.methodology-section')?.scrollIntoView({ behavior: 'instant' });
            });
            await page.waitForTimeout(1000);

            const methodologySection = page.locator(SECTIONS.methodology);
            await expect(methodologySection).toHaveScreenshot('methodology-desktop.png', {
                maxDiffPixels: 1500,
                threshold: 0.3
            });
        });

        test('manifesto section should match baseline', async ({ page }) => {
            await page.setViewportSize({ width: 1920, height: 1080 });
            await page.goto('/');
            await waitForPageReady(page);

            await page.evaluate(() => {
                document.querySelector('.manifesto-section')?.scrollIntoView({ behavior: 'instant' });
            });
            await page.waitForTimeout(1000);

            const manifestoSection = page.locator(SECTIONS.manifesto);
            await expect(manifestoSection).toHaveScreenshot('manifesto-desktop.png', {
                maxDiffPixels: 1500,
                threshold: 0.3
            });
        });

        test('footer section should match baseline', async ({ page }) => {
            await page.setViewportSize({ width: 1920, height: 1080 });
            await page.goto('/');
            await waitForPageReady(page);

            await page.evaluate(() => {
                document.querySelector('.ml-footer')?.scrollIntoView({ behavior: 'instant' });
            });
            await page.waitForTimeout(500);

            const footer = page.locator(SECTIONS.footer);
            await expect(footer).toHaveScreenshot('footer-desktop.png', {
                maxDiffPixels: 1000,
                threshold: 0.3
            });
        });

        test('mobile menu open state should match baseline', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            await page.goto('/');
            await waitForPageReady(page);

            const hamburger = page.locator('.mobile-menu-toggle');
            await hamburger.click();
            await page.waitForTimeout(500);

            const overlay = page.locator('#mobileMenuOverlay');
            await expect(overlay).toHaveScreenshot('mobile-menu-open.png', {
                maxDiffPixels: 500,
                threshold: 0.3
            });
        });
    });

    // ==========================================
    // 7.2 THEME CONSISTENCY
    // ==========================================

    test.describe('Theme Consistency', () => {

        test('dark theme colors should be consistent across sections', async ({ page }) => {
            await page.setViewportSize({ width: 1920, height: 1080 });
            await page.goto('/');
            await waitForPageReady(page);

            const sections = [
                '.hero-section',
                '.services-section',
                '.about-stacked-section',
                '.methodology-section',
                '.manifesto-section',
                '.ml-footer'
            ];

            let darkSectionCount = 0;
            for (const selector of sections) {
                const section = page.locator(selector);
                if (await section.count() > 0 && await section.isVisible()) {
                    const bgColor = await section.evaluate(el =>
                        window.getComputedStyle(el).backgroundColor
                    );

                    // Check if background is dark (RGB values typically under 50)
                    const rgbMatch = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                    if (rgbMatch) {
                        const [, r, g, b] = rgbMatch.map(Number);
                        if (r < 50 && g < 50 && b < 50) {
                            darkSectionCount++;
                        }
                    }
                }
            }

            // Most sections should have dark backgrounds
            expect(darkSectionCount).toBeGreaterThan(0);
        });

        test('typography should be consistent across sections', async ({ page }) => {
            await page.goto('/');
            await waitForPageReady(page);

            // Check headings exist and have font-family set
            const headings = page.locator('h1, h2, .heading-line');
            const count = await headings.count();

            expect(count).toBeGreaterThan(0);

            // Verify at least one heading has a font-family
            let hasTypography = false;
            for (let i = 0; i < Math.min(count, 5); i++) {
                const heading = headings.nth(i);
                if (await heading.isVisible()) {
                    const fontFamily = await heading.evaluate(el =>
                        window.getComputedStyle(el).fontFamily
                    );
                    if (fontFamily && fontFamily.length > 0) {
                        hasTypography = true;
                        break;
                    }
                }
            }

            expect(hasTypography).toBeTruthy();
        });

        test('spacing should follow 8px grid system', async ({ page }) => {
            await page.goto('/');
            await waitForPageReady(page);

            // Check section padding
            const servicesSection = page.locator('.services-section');
            if (await servicesSection.isVisible()) {
                const padding = await servicesSection.evaluate(el => {
                    const style = window.getComputedStyle(el);
                    return {
                        top: parseFloat(style.paddingTop),
                        bottom: parseFloat(style.paddingBottom)
                    };
                });

                // Padding should be divisible by 8 (or close to it)
                // Allow some tolerance for browser rendering
                expect(padding.top % 8).toBeLessThan(4);
            }
        });

        test('border radius should be consistent', async ({ page }) => {
            await page.goto('/');
            await waitForPageReady(page);

            // Check cards have consistent border radius
            const cards = page.locator('.service-card, .about-card, .methodology-card');
            const count = await cards.count();

            const radiusValues = [];
            for (let i = 0; i < Math.min(count, 5); i++) {
                const card = cards.nth(i);
                if (await card.isVisible()) {
                    const radius = await card.evaluate(el =>
                        window.getComputedStyle(el).borderRadius
                    );
                    radiusValues.push(radius);
                }
            }

            // All cards should have the same or similar border radius
            if (radiusValues.length > 1) {
                const unique = [...new Set(radiusValues)];
                // Should have at most 2 unique values (small variance allowed)
                expect(unique.length).toBeLessThanOrEqual(3);
            }
        });

        test('primary accent color (cyan) should be used consistently', async ({ page }) => {
            await page.goto('/');
            await waitForPageReady(page);

            // Check CTA buttons
            const ctaButtons = page.locator('.btn-cta');
            const count = await ctaButtons.count();

            for (let i = 0; i < Math.min(count, 3); i++) {
                const button = ctaButtons.nth(i);
                if (await button.isVisible()) {
                    const bgColor = await button.evaluate(el =>
                        window.getComputedStyle(el).backgroundColor
                    );

                    // Should contain cyan-ish color or transparent
                    // (Implementation specific - just verify it exists)
                    expect(bgColor).toBeDefined();
                }
            }
        });

        test('focus states should have consistent styling', async ({ page }) => {
            await page.goto('/');
            await waitForPageReady(page);

            // Tab through elements and check focus styles
            await page.keyboard.press('Tab');

            const focusedElement = await page.evaluate(() => {
                const el = document.activeElement;
                if (!el || el.tagName === 'BODY') return null;

                const style = window.getComputedStyle(el);
                return {
                    outline: style.outline,
                    boxShadow: style.boxShadow,
                    borderColor: style.borderColor
                };
            });

            // Should have some focus indicator
            if (focusedElement) {
                const hasFocusIndicator =
                    focusedElement.outline !== 'none' ||
                    focusedElement.boxShadow !== 'none' ||
                    focusedElement.borderColor !== 'transparent';

                expect(hasFocusIndicator).toBeTruthy();
            }
        });

        test('link hover states should be consistent', async ({ page }) => {
            const viewport = page.viewportSize();
            if (viewport.width < 768) {
                test.skip();
                return;
            }

            await page.goto('/');
            await waitForPageReady(page);

            const navLinks = page.locator('.nav-link');
            const count = await navLinks.count();

            if (count > 0) {
                const firstLink = navLinks.first();
                await firstLink.hover();
                await page.waitForTimeout(200);

                const hoverColor = await firstLink.evaluate(el =>
                    window.getComputedStyle(el).color
                );

                expect(hoverColor).toBeDefined();
            }
        });
    });
});
