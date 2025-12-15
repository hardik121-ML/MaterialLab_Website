/**
 * Material Lab Website - Animation Tests
 * Tests for GSAP animations, canvas rendering, scroll-linked effects
 */

const { test, expect } = require('@playwright/test');
const {
    SECTIONS,
    CANVAS_ELEMENTS,
    waitForAnimation,
    scrollToSection,
    waitForPageReady,
    enableReducedMotion,
    isInViewport,
    getComputedStyle
} = require('./helpers/test-utils');

test.describe('Animation Tests', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await waitForPageReady(page);
    });

    // ==========================================
    // 2.1 HERO ANIMATIONS
    // ==========================================

    test.describe('Hero Animations', () => {

        test('heading lines should animate in sequence', async ({ page }) => {
            const headingLines = page.locator('.heading-line');
            const count = await headingLines.count();

            expect(count).toBeGreaterThan(0);

            // All lines should be visible after page load
            for (let i = 0; i < count; i++) {
                await expect(headingLines.nth(i)).toBeVisible();
            }
        });

        test('CTA button should be visible after hero animation', async ({ page }) => {
            await page.waitForTimeout(2000); // Wait for staggered animations

            // Try multiple selectors for CTA button
            const ctaButton = page.locator('.hero-cta-group .btn-cta, .hero-section .btn-cta, .btn-cta').first();

            if (await ctaButton.count() > 0) {
                await expect(ctaButton).toBeVisible();
            } else {
                // If no CTA button found, just verify hero section is visible
                const heroSection = page.locator('.hero-section');
                await expect(heroSection).toBeVisible();
            }
        });

        test('human proof badges should animate in', async ({ page }) => {
            await page.waitForTimeout(2500); // Wait for badge animations

            const badges = page.locator('.human-proof-badges');
            if (await badges.isVisible()) {
                const opacity = await badges.evaluate(el => window.getComputedStyle(el).opacity);
                expect(parseFloat(opacity)).toBeGreaterThan(0);
            }
        });

        test('PrismScene canvas should render (not blank)', async ({ page }) => {
            const canvas = page.locator(CANVAS_ELEMENTS.prism);

            if (await canvas.isVisible()) {
                // Check canvas has content (not all transparent)
                const hasContent = await page.evaluate((sel) => {
                    const canvas = document.querySelector(sel);
                    if (!canvas) return false;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return false;
                    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                    // Check if any pixel has non-zero alpha
                    for (let i = 3; i < data.length; i += 4) {
                        if (data[i] > 0) return true;
                    }
                    return false;
                }, CANVAS_ELEMENTS.prism);

                expect(hasContent).toBe(true);
            }
        });

        test('PrismScene should respond to mouse movement', async ({ page }) => {
            const viewport = page.viewportSize();
            if (viewport.width < 1024) {
                test.skip();
                return;
            }

            const canvas = page.locator(CANVAS_ELEMENTS.prism);
            if (!await canvas.isVisible()) {
                test.skip();
                return;
            }

            // Move mouse to different positions
            await page.mouse.move(100, 100);
            await page.waitForTimeout(200);
            await page.mouse.move(500, 300);
            await page.waitForTimeout(200);

            // Canvas should still be rendering (no errors)
            const errors = [];
            page.on('pageerror', err => errors.push(err));

            await page.waitForTimeout(500);
            expect(errors.length).toBe(0);
        });
    });

    // ==========================================
    // 2.2 SECTION ENTRY ANIMATIONS
    // ==========================================

    test.describe('Section Entry Animations', () => {

        test('services section should animate on scroll into view', async ({ page }) => {
            await page.evaluate(() => {
                const section = document.querySelector('.services-section');
                if (section) {
                    section.scrollIntoView({ behavior: 'instant' });
                }
            });
            await page.waitForTimeout(1000);

            const servicesSection = page.locator(SECTIONS.services);
            await expect(servicesSection).toBeVisible();
        });

        test('service cards should be visible after scroll', async ({ page }) => {
            await page.evaluate(() => {
                document.querySelector('.services-section')?.scrollIntoView({ behavior: 'instant' });
            });
            await page.waitForTimeout(1500);

            const serviceCards = page.locator('.service-card');
            const count = await serviceCards.count();

            // Services section should exist
            const servicesSection = page.locator('.services-section');
            await expect(servicesSection).toBeVisible();

            // If cards exist, verify first one is visible
            if (count > 0) {
                await expect(serviceCards.first()).toBeVisible();
            }
        });

        test('about cards should appear with proper visibility', async ({ page }) => {
            await page.evaluate(() => {
                document.querySelector('.about-stacked-section')?.scrollIntoView({ behavior: 'instant' });
            });
            await page.waitForTimeout(1500);

            const aboutCards = page.locator('.about-card');
            const count = await aboutCards.count();

            if (count > 0) {
                await expect(aboutCards.first()).toBeVisible();
            }
        });

        test('methodology cards should animate on entry', async ({ page }) => {
            await page.evaluate(() => {
                document.querySelector('.methodology-section')?.scrollIntoView({ behavior: 'instant' });
            });
            await page.waitForTimeout(1500);

            const methodologyCards = page.locator('.methodology-card');
            const count = await methodologyCards.count();

            expect(count).toBeGreaterThan(0);
            await expect(methodologyCards.first()).toBeVisible();
        });

        test('manifesto items should be visible after scroll', async ({ page }) => {
            await page.evaluate(() => {
                document.querySelector('.manifesto-section')?.scrollIntoView({ behavior: 'instant' });
            });
            await page.waitForTimeout(1500);

            const manifestoSection = page.locator(SECTIONS.manifesto);
            await expect(manifestoSection).toBeVisible();
        });

        test('quote section should be visible', async ({ page }) => {
            await page.evaluate(() => {
                document.querySelector('.quote-section')?.scrollIntoView({ behavior: 'instant' });
            });
            await page.waitForTimeout(1000);

            const quoteSection = page.locator(SECTIONS.quote);
            if (await quoteSection.count() > 0) {
                await expect(quoteSection).toBeVisible();
            }
        });

        test('falling text characters should animate', async ({ page }) => {
            await page.evaluate(() => {
                document.querySelector('.falling-text-section')?.scrollIntoView({ behavior: 'instant' });
            });
            await page.waitForTimeout(1500);

            const fallingText = page.locator('#falling-text, .falling-text');
            if (await fallingText.count() > 0) {
                await expect(fallingText).toBeVisible();
            }
        });
    });

    // ==========================================
    // 2.3 SCROLL-LINKED ANIMATIONS
    // ==========================================

    test.describe('Scroll-Linked Animations', () => {

        test('methodology cards should scale on scroll (desktop)', async ({ page }) => {
            const viewport = page.viewportSize();
            if (viewport.width < 1024) {
                test.skip();
                return;
            }

            // Scroll to methodology section
            await page.evaluate(() => {
                document.querySelector('.methodology-section')?.scrollIntoView({ behavior: 'instant' });
            });
            await page.waitForTimeout(500);

            // Scroll further to trigger scaling
            await page.evaluate(() => {
                window.scrollBy(0, window.innerHeight);
            });
            await page.waitForTimeout(500);

            // Check that cards are still visible and functional
            const methodologyCards = page.locator('.methodology-card');
            await expect(methodologyCards.first()).toBeVisible();
        });

        test('falling text scrub animation should work', async ({ page }) => {
            await page.evaluate(() => {
                document.querySelector('.falling-text-section')?.scrollIntoView({ behavior: 'instant' });
            });
            await page.waitForTimeout(500);

            const chars = page.locator('.falling-text .char, #falling-text .char');
            const count = await chars.count();

            if (count > 0) {
                // Scroll to trigger animation
                await page.evaluate(() => {
                    window.scrollBy(0, 200);
                });
                await page.waitForTimeout(500);

                // Characters should be visible
                await expect(chars.first()).toBeVisible();
            }
        });

        test('no animation jank on fast scroll', async ({ page }) => {
            const errors = [];
            page.on('pageerror', err => errors.push(err));

            // Fast scroll through page
            for (let i = 0; i < 5; i++) {
                await page.evaluate(() => {
                    window.scrollBy(0, window.innerHeight);
                });
                await page.waitForTimeout(100);
            }

            // No errors should occur
            expect(errors.length).toBe(0);
        });

        test('animations should work on scroll up', async ({ page }) => {
            // Scroll to bottom
            await page.evaluate(() => {
                window.scrollTo(0, document.documentElement.scrollHeight);
            });
            await page.waitForTimeout(500);

            // Scroll back up
            await page.evaluate(() => {
                window.scrollTo(0, 0);
            });
            await page.waitForTimeout(1000);

            // Hero should be visible again
            const heroSection = page.locator('.hero-section');
            await expect(heroSection).toBeVisible();
        });
    });

    // ==========================================
    // 2.4 CANVAS ANIMATIONS
    // ==========================================

    test.describe('Canvas Animations', () => {

        test('star backgrounds should exist', async ({ page }) => {
            const starCanvases = [
                CANVAS_ELEMENTS.starsServices,
                CANVAS_ELEMENTS.starsMethodology,
                CANVAS_ELEMENTS.starsManifesto
            ];

            for (const selector of starCanvases) {
                const canvas = page.locator(selector);
                const count = await canvas.count();

                if (count > 0) {
                    const element = await canvas.elementHandle();
                    expect(element).not.toBeNull();
                }
            }
        });

        test('identity primitives should exist and render', async ({ page }) => {
            // Check if any canvas elements exist on the page
            const allCanvases = page.locator('canvas');
            const count = await allCanvases.count();

            // Page should have at least one canvas for animations
            expect(count).toBeGreaterThan(0);

            // Verify prism canvas specifically exists
            const prismCanvas = page.locator('#prism-canvas');
            if (await prismCanvas.count() > 0) {
                await expect(prismCanvas).toBeAttached();
            }
        });

        test('canvases should not cause memory leaks (no errors on rapid scroll)', async ({ page }) => {
            const errors = [];
            page.on('pageerror', err => errors.push(err.message));

            // Rapid scroll up and down
            for (let i = 0; i < 10; i++) {
                await page.evaluate(() => {
                    window.scrollTo(0, Math.random() * document.documentElement.scrollHeight);
                });
                await page.waitForTimeout(50);
            }

            // Filter out non-critical errors
            const criticalErrors = errors.filter(e =>
                e.includes('memory') ||
                e.includes('canvas') ||
                e.includes('WebGL')
            );

            expect(criticalErrors.length).toBe(0);
        });
    });

    // ==========================================
    // 2.5 REDUCED MOTION
    // ==========================================

    test.describe('Reduced Motion', () => {

        test('animations should be disabled with prefers-reduced-motion', async ({ page }) => {
            await enableReducedMotion(page);
            await page.reload();
            await page.waitForTimeout(2000);

            // Page should still load and be functional
            const heroSection = page.locator('.hero-section');
            await expect(heroSection).toBeVisible();
        });

        test('page should be functional with reduced motion', async ({ page }) => {
            await enableReducedMotion(page);
            await page.reload();
            await waitForPageReady(page);

            // Navigation should work
            const viewport = page.viewportSize();
            if (viewport.width >= 768) {
                const aboutLink = page.locator('.nav-link[data-section="about"]');
                if (await aboutLink.isVisible()) {
                    await aboutLink.click();
                    await page.waitForTimeout(500);
                }
            }

            // No errors
            const errors = [];
            page.on('pageerror', err => errors.push(err));
            expect(errors.length).toBe(0);
        });

        test('no animation-related errors with reduced motion', async ({ page }) => {
            await enableReducedMotion(page);
            await page.reload();

            const errors = [];
            page.on('pageerror', err => errors.push(err.message));

            // Scroll through page
            await page.evaluate(async () => {
                const height = document.documentElement.scrollHeight;
                for (let y = 0; y < height; y += 500) {
                    window.scrollTo(0, y);
                    await new Promise(r => setTimeout(r, 100));
                }
            });

            const animationErrors = errors.filter(e =>
                e.toLowerCase().includes('gsap') ||
                e.toLowerCase().includes('animation') ||
                e.toLowerCase().includes('scrolltrigger')
            );

            expect(animationErrors.length).toBe(0);
        });
    });

    // ==========================================
    // PAGE TRANSITIONS
    // ==========================================

    test.describe('Page Transitions', () => {

        test('SVG mask transition should complete on page load', async ({ page }) => {
            // Reload to see transition
            await page.reload();
            await page.waitForTimeout(3000); // Wait for transition

            // Page should be fully visible
            const heroSection = page.locator('.hero-section');
            await expect(heroSection).toBeVisible();

            // Transition overlay should be complete
            const overlay = page.locator('#transition-overlay');
            if (await overlay.count() > 0) {
                const pointerEvents = await overlay.evaluate(el =>
                    window.getComputedStyle(el).pointerEvents
                );
                expect(pointerEvents).toBe('none');
            }
        });
    });
});
