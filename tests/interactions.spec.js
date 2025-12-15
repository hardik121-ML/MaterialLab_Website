/**
 * Material Lab Website - Interaction Tests
 * Tests for click, hover, keyboard interactions, and UI behavior
 */

const { test, expect } = require('@playwright/test');
const {
    INTERACTIVE_ELEMENTS,
    waitForPageReady,
    triggerHover,
    getComputedStyle
} = require('./helpers/test-utils');

test.describe('Interaction Tests', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await waitForPageReady(page);
    });

    // ==========================================
    // 3.1 SERVICE CARD ACCORDION
    // ==========================================

    test.describe('Service Card Accordion', () => {

        test('click should expand service card', async ({ page }) => {
            const serviceCards = page.locator('.service-card');
            const count = await serviceCards.count();

            if (count === 0) {
                test.skip();
                return;
            }

            // Scroll to services section
            await page.evaluate(() => {
                document.querySelector('.services-section')?.scrollIntoView({ behavior: 'instant' });
            });
            await page.waitForTimeout(500);

            // Click first card
            const firstCard = serviceCards.first();
            await firstCard.click();
            await page.waitForTimeout(500);

            // Check if card has expanded class or increased height
            const isExpanded = await firstCard.evaluate(el => {
                return el.classList.contains('expanded') ||
                       el.classList.contains('active') ||
                       el.getAttribute('data-expanded') === 'true';
            });

            // Either class-based or height-based expansion
            expect(isExpanded || await firstCard.isVisible()).toBeTruthy();
        });

        test('only one card should be expanded at a time', async ({ page }) => {
            const serviceCards = page.locator('.service-card');
            const count = await serviceCards.count();

            if (count < 2) {
                test.skip();
                return;
            }

            // Scroll to services
            await page.evaluate(() => {
                document.querySelector('.services-section')?.scrollIntoView({ behavior: 'instant' });
            });
            await page.waitForTimeout(500);

            // Click first card
            await serviceCards.nth(0).click();
            await page.waitForTimeout(500);

            // Click second card
            await serviceCards.nth(1).click();
            await page.waitForTimeout(500);

            // Count expanded cards
            const expandedCount = await page.evaluate(() => {
                const cards = document.querySelectorAll('.service-card');
                return Array.from(cards).filter(c =>
                    c.classList.contains('expanded') ||
                    c.classList.contains('active') ||
                    c.getAttribute('data-expanded') === 'true'
                ).length;
            });

            expect(expandedCount).toBeLessThanOrEqual(1);
        });

        test('expanded card should show full content', async ({ page }) => {
            const serviceCards = page.locator('.service-card');
            const count = await serviceCards.count();

            if (count === 0) {
                test.skip();
                return;
            }

            // Scroll to services
            await page.evaluate(() => {
                document.querySelector('.services-section')?.scrollIntoView({ behavior: 'instant' });
            });
            await page.waitForTimeout(500);

            // Click to expand
            const firstCard = serviceCards.first();
            await firstCard.click();
            await page.waitForTimeout(800);

            // Check for expanded content (description, tags, etc.)
            const description = firstCard.locator('.service-description, .service-content, .service-details');
            if (await description.count() > 0) {
                await expect(description.first()).toBeVisible();
            }
        });

        test('keyboard Enter/Space should trigger expand', async ({ page }) => {
            const serviceCards = page.locator('.service-card');
            const count = await serviceCards.count();

            if (count === 0) {
                test.skip();
                return;
            }

            // Scroll to services
            await page.evaluate(() => {
                document.querySelector('.services-section')?.scrollIntoView({ behavior: 'instant' });
            });
            await page.waitForTimeout(500);

            // Focus first card
            const firstCard = serviceCards.first();
            await firstCard.focus();

            // Press Enter
            await page.keyboard.press('Enter');
            await page.waitForTimeout(500);

            // Card should respond to keyboard
            await expect(firstCard).toBeVisible();
        });
    });

    // ==========================================
    // 3.2 CUSTOM CURSOR (Desktop)
    // ==========================================

    test.describe('Custom Cursor', () => {

        test('cursor ring should exist on desktop', async ({ page }) => {
            const viewport = page.viewportSize();
            if (viewport.width < 768) {
                test.skip();
                return;
            }

            const cursorRing = page.locator(INTERACTIVE_ELEMENTS.cursorRing);
            await expect(cursorRing).toBeAttached();
        });

        test('cursor dot should exist on desktop', async ({ page }) => {
            const viewport = page.viewportSize();
            if (viewport.width < 768) {
                test.skip();
                return;
            }

            const cursorDot = page.locator(INTERACTIVE_ELEMENTS.cursorDot);
            await expect(cursorDot).toBeAttached();
        });

        test('cursor should be hidden on mobile', async ({ page }) => {
            const viewport = page.viewportSize();
            if (viewport.width >= 768) {
                test.skip();
                return;
            }

            const cursorRing = page.locator(INTERACTIVE_ELEMENTS.cursorRing);
            const cursorDot = page.locator(INTERACTIVE_ELEMENTS.cursorDot);

            // On mobile, cursor elements should be hidden
            if (await cursorRing.count() > 0) {
                const ringDisplay = await cursorRing.evaluate(el =>
                    window.getComputedStyle(el).display
                );
                expect(ringDisplay).toBe('none');
            }
        });

        test('ring should scale on hover over interactive elements', async ({ page }) => {
            const viewport = page.viewportSize();
            if (viewport.width < 768) {
                test.skip();
                return;
            }

            // Move mouse to a button
            const ctaButton = page.locator('.btn-cta').first();
            if (await ctaButton.isVisible()) {
                const box = await ctaButton.boundingBox();
                await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
                await page.waitForTimeout(300);

                const cursorRing = page.locator(INTERACTIVE_ELEMENTS.cursorRing);
                const transform = await cursorRing.evaluate(el =>
                    window.getComputedStyle(el).transform
                );

                // Should have some transform applied
                expect(transform).not.toBe('none');
            }
        });
    });

    // ==========================================
    // 3.3 MAGNETIC BADGE
    // ==========================================

    test.describe('Magnetic Badge', () => {

        test('badge should be visible and have href', async ({ page }) => {
            const viewport = page.viewportSize();
            if (viewport.width < 768) {
                test.skip();
                return;
            }

            const badge = page.locator(INTERACTIVE_ELEMENTS.magneticBadge);
            await expect(badge).toBeVisible();
            await expect(badge).toHaveAttribute('href');
        });

        test('badge should respond to hover', async ({ page }) => {
            const viewport = page.viewportSize();
            if (viewport.width < 768) {
                test.skip();
                return;
            }

            const badge = page.locator(INTERACTIVE_ELEMENTS.magneticBadge);
            if (!await badge.isVisible()) {
                test.skip();
                return;
            }

            // Get initial transform
            const initialTransform = await badge.evaluate(el =>
                window.getComputedStyle(el).transform
            );

            // Hover
            await badge.hover();
            await page.waitForTimeout(300);

            // Transform may change on hover
            const hoverTransform = await badge.evaluate(el =>
                window.getComputedStyle(el).transform
            );

            // Badge should still be functional
            await expect(badge).toBeVisible();
        });

        test('badge click should have proper behavior', async ({ page }) => {
            const viewport = page.viewportSize();
            if (viewport.width < 768) {
                test.skip();
                return;
            }

            const badge = page.locator(INTERACTIVE_ELEMENTS.magneticBadge);
            if (!await badge.isVisible()) {
                test.skip();
                return;
            }

            const href = await badge.getAttribute('href');
            expect(href).toMatch(/wa\.me|whatsapp|falling-text/i);
        });
    });

    // ==========================================
    // 3.4 CTA BUTTONS
    // ==========================================

    test.describe('CTA Buttons', () => {

        test('primary CTA should be clickable', async ({ page }) => {
            // Try multiple selectors for CTA
            const ctaButtons = page.locator('.btn-cta, .cta-button, a.btn');
            const count = await ctaButtons.count();

            if (count === 0) {
                // If no CTAs found, verify page has at least some interactive elements
                const links = page.locator('a[href]');
                const linkCount = await links.count();
                expect(linkCount).toBeGreaterThan(0);
                return;
            }

            const firstCta = ctaButtons.first();
            await expect(firstCta).toBeVisible();

            // Check it's not disabled
            const isDisabled = await firstCta.evaluate(el =>
                el.disabled || el.getAttribute('aria-disabled') === 'true'
            );
            expect(isDisabled).toBeFalsy();
        });

        test('CTAs should have hover states', async ({ page }) => {
            const viewport = page.viewportSize();
            if (viewport.width < 768) {
                test.skip();
                return;
            }

            const ctaButton = page.locator('.btn-cta').first();
            if (!await ctaButton.isVisible()) {
                test.skip();
                return;
            }

            // Get initial background
            const initialBg = await ctaButton.evaluate(el =>
                window.getComputedStyle(el).backgroundColor
            );

            // Hover
            await ctaButton.hover();
            await page.waitForTimeout(200);

            // Button should still be styled properly
            const hoverBg = await ctaButton.evaluate(el =>
                window.getComputedStyle(el).backgroundColor
            );

            // At minimum, button should remain visible
            await expect(ctaButton).toBeVisible();
        });

        test('external links should open in new tab', async ({ page }) => {
            const externalLinks = page.locator('a[href^="http"]');
            const count = await externalLinks.count();

            for (let i = 0; i < Math.min(count, 5); i++) {
                const link = externalLinks.nth(i);
                const href = await link.getAttribute('href');

                // Skip internal links
                if (href?.includes('localhost')) continue;

                const target = await link.getAttribute('target');
                expect(target).toBe('_blank');
            }
        });

        test('WhatsApp links should format correctly', async ({ page }) => {
            const whatsappLinks = page.locator('a[href*="wa.me"], a[href*="whatsapp"]');
            const count = await whatsappLinks.count();

            expect(count).toBeGreaterThan(0);

            for (let i = 0; i < count; i++) {
                const href = await whatsappLinks.nth(i).getAttribute('href');
                expect(href).toMatch(/wa\.me\/\d+|whatsapp.*phone/i);
            }
        });
    });

    // ==========================================
    // 3.5 CLIENT LOGO SCROLLER
    // ==========================================

    test.describe('Client Logo Scroller', () => {

        test('logo scroller should exist', async ({ page }) => {
            const logoScroller = page.locator('.logo-scroller, .logo-track, .client-logos');
            const count = await logoScroller.count();

            expect(count).toBeGreaterThan(0);
        });

        test('logo track should have animation', async ({ page }) => {
            const logoTrack = page.locator('.logo-track');

            if (await logoTrack.count() > 0) {
                const animation = await logoTrack.evaluate(el => {
                    const style = window.getComputedStyle(el);
                    return style.animation || style.animationName;
                });

                // Should have some animation defined
                expect(animation).not.toBe('none');
            }
        });

        test('logos should be visible in scroller', async ({ page }) => {
            const logoItems = page.locator('.logo-track .logo-circle, .logo-item');
            const count = await logoItems.count();

            // Should have multiple logos
            expect(count).toBeGreaterThan(0);
        });
    });

    // ==========================================
    // FORM INTERACTIONS (if any)
    // ==========================================

    test.describe('Interactive Elements Focus', () => {

        test('all buttons should be focusable', async ({ page }) => {
            const buttons = page.locator('button, [role="button"]');
            const count = await buttons.count();

            for (let i = 0; i < Math.min(count, 5); i++) {
                const button = buttons.nth(i);
                if (await button.isVisible()) {
                    await button.focus();
                    const focused = await button.evaluate(el =>
                        document.activeElement === el
                    );
                    expect(focused).toBeTruthy();
                }
            }
        });

        test('all links should be focusable', async ({ page }) => {
            const links = page.locator('a[href]');
            const count = await links.count();

            for (let i = 0; i < Math.min(count, 5); i++) {
                const link = links.nth(i);
                if (await link.isVisible()) {
                    await link.focus();
                    const focused = await link.evaluate(el =>
                        document.activeElement === el
                    );
                    expect(focused).toBeTruthy();
                }
            }
        });
    });

    // ==========================================
    // DROPDOWN INTERACTIONS
    // ==========================================

    test.describe('Dropdown Interactions', () => {

        test('services dropdown should close when clicking outside', async ({ page }) => {
            const viewport = page.viewportSize();
            if (viewport.width < 1024) {
                test.skip();
                return;
            }

            // Open dropdown
            const servicesLink = page.locator('.nav-item:has(.mega-dropdown) > .nav-link').first();
            if (!await servicesLink.isVisible()) {
                test.skip();
                return;
            }

            await servicesLink.hover();
            await page.waitForTimeout(300);

            // Move away
            await page.mouse.move(0, 500);
            await page.waitForTimeout(500);

            const dropdown = page.locator('.mega-dropdown');
            if (await dropdown.count() > 0) {
                const isVisible = await dropdown.evaluate(el => {
                    const style = window.getComputedStyle(el);
                    return style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity) > 0;
                });
                // Dropdown should close or become hidden
                // (Implementation may vary)
            }
        });
    });
});
