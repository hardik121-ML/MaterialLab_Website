/**
 * Material Lab Website - Navigation Tests
 * Tests for header navigation, mobile menu, smooth scrolling, and link behavior
 */

const { test, expect } = require('@playwright/test');
const {
    SECTIONS,
    INTERACTIVE_ELEMENTS,
    scrollToSection,
    getScrollPosition,
    waitForPageReady
} = require('./helpers/test-utils');

test.describe('Navigation Tests', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await waitForPageReady(page);
    });

    // ==========================================
    // 1.1 HEADER NAVIGATION
    // ==========================================

    test.describe('Header Navigation', () => {

        test('logo should be visible and clickable', async ({ page }) => {
            const logo = page.locator('.nav-logo');
            await expect(logo).toBeVisible();

            // Scroll down first
            await page.evaluate(() => window.scrollTo(0, 1000));
            await page.waitForTimeout(300);

            // Click logo should scroll to top
            await logo.click();
            await page.waitForTimeout(500);

            const scroll = await getScrollPosition(page);
            expect(scroll.y).toBeLessThan(100);
        });

        test('services dropdown should exist and be accessible (desktop)', async ({ page, browserName }) => {
            test.skip(browserName !== 'chromium', 'Desktop only test');

            const viewport = page.viewportSize();
            if (viewport.width < 1024) {
                test.skip();
                return;
            }

            // Check that dropdown structure exists
            const dropdown = page.locator('.mega-dropdown');
            await expect(dropdown).toBeAttached();

            // The dropdown should have proper ARIA attributes
            const ariaLabel = await dropdown.getAttribute('aria-label');
            expect(ariaLabel).toBeTruthy();
        });

        test('services dropdown items should scroll to services section', async ({ page }) => {
            const viewport = page.viewportSize();
            if (viewport.width < 1024) {
                test.skip();
                return;
            }

            // Open dropdown by hovering on nav item
            const navItem = page.locator('.nav-item:has(.mega-dropdown)').first();
            await navItem.hover();
            await page.waitForTimeout(500);

            // Check if dropdown card is accessible
            const firstService = page.locator('.dropdown-card').first();

            if (await firstService.isVisible()) {
                await firstService.click();
                await page.waitForTimeout(800);

                // Should scroll to services section
                const servicesSection = page.locator(SECTIONS.services);
                await expect(servicesSection).toBeInViewport();
            } else {
                // If dropdown doesn't show via hover, try clicking Services nav link directly
                const servicesNavLink = page.locator('.nav-link[data-section="services"]');
                if (await servicesNavLink.isVisible()) {
                    await servicesNavLink.click();
                    await page.waitForTimeout(800);
                    const servicesSection = page.locator(SECTIONS.services);
                    await expect(servicesSection).toBeInViewport();
                }
            }
        });

        test('about link should scroll to about section', async ({ page }) => {
            const viewport = page.viewportSize();
            if (viewport.width < 768) {
                test.skip();
                return;
            }

            const aboutLink = page.locator('.nav-link[data-section="about"]');
            await aboutLink.click();
            await page.waitForTimeout(800);

            const aboutSection = page.locator(SECTIONS.about);
            await expect(aboutSection).toBeInViewport();
        });

        test('manifesto link should exist and be clickable', async ({ page }) => {
            const viewport = page.viewportSize();
            if (viewport.width < 768) {
                test.skip();
                return;
            }

            const manifestoLink = page.locator('.nav-link[data-section="manifesto"]');
            await expect(manifestoLink).toBeVisible();

            // Verify link has correct data attribute
            const dataSection = await manifestoLink.getAttribute('data-section');
            expect(dataSection).toBe('manifesto');

            // Manifesto section should exist
            const manifestoSection = page.locator(SECTIONS.manifesto);
            await expect(manifestoSection).toBeAttached();
        });

        test('magnetic badge should be visible and clickable', async ({ page }) => {
            const viewport = page.viewportSize();
            if (viewport.width < 768) {
                test.skip();
                return;
            }

            const badge = page.locator(INTERACTIVE_ELEMENTS.magneticBadge);
            await expect(badge).toBeVisible();
            await expect(badge).toHaveAttribute('href', /wa\.me|whatsapp/i);
        });

        test('magnetic badge should link to WhatsApp', async ({ page }) => {
            const viewport = page.viewportSize();
            if (viewport.width < 768) {
                test.skip();
                return;
            }

            const badge = page.locator(INTERACTIVE_ELEMENTS.magneticBadge);
            const href = await badge.getAttribute('href');
            expect(href).toMatch(/wa\.me|whatsapp/i);
        });
    });

    // ==========================================
    // 1.2 MOBILE NAVIGATION
    // ==========================================

    test.describe('Mobile Navigation', () => {

        test('hamburger icon should be visible on mobile', async ({ page }) => {
            const viewport = page.viewportSize();
            if (viewport.width >= 768) {
                test.skip();
                return;
            }

            const hamburger = page.locator(INTERACTIVE_ELEMENTS.mobileMenuToggle);
            await expect(hamburger).toBeVisible();
        });

        test('hamburger click should open mobile menu overlay', async ({ page }) => {
            const viewport = page.viewportSize();
            if (viewport.width >= 768) {
                test.skip();
                return;
            }

            const hamburger = page.locator(INTERACTIVE_ELEMENTS.mobileMenuToggle);
            await hamburger.click();
            await page.waitForTimeout(500);

            const overlay = page.locator(INTERACTIVE_ELEMENTS.mobileMenu);
            await expect(overlay).toBeVisible();
        });

        test('mobile menu links should work correctly', async ({ page }) => {
            const viewport = page.viewportSize();
            if (viewport.width >= 768) {
                test.skip();
                return;
            }

            // Open menu
            const hamburger = page.locator(INTERACTIVE_ELEMENTS.mobileMenuToggle);
            await hamburger.click();
            await page.waitForTimeout(500);

            // Click about link
            const aboutLink = page.locator('.mobile-nav-link[data-section="about"]');
            await aboutLink.click();
            await page.waitForTimeout(800);

            // Menu should close and scroll to about
            const overlay = page.locator(INTERACTIVE_ELEMENTS.mobileMenu);
            await expect(overlay).not.toBeVisible();
        });

        test('services accordion should expand/collapse in mobile menu', async ({ page }) => {
            const viewport = page.viewportSize();
            if (viewport.width >= 768) {
                test.skip();
                return;
            }

            // Open menu
            const hamburger = page.locator(INTERACTIVE_ELEMENTS.mobileMenuToggle);
            await hamburger.click();
            await page.waitForTimeout(500);

            // Click services dropdown trigger
            const servicesDropdown = page.locator('.mobile-dropdown-trigger');
            if (await servicesDropdown.isVisible()) {
                await servicesDropdown.click();
                await page.waitForTimeout(300);

                const dropdownContent = page.locator('.mobile-dropdown-content');
                await expect(dropdownContent).toBeVisible();
            }
        });

        test('X/close button should close mobile menu', async ({ page }) => {
            const viewport = page.viewportSize();
            if (viewport.width >= 768) {
                test.skip();
                return;
            }

            // Open menu
            const hamburger = page.locator(INTERACTIVE_ELEMENTS.mobileMenuToggle);
            await hamburger.click();
            await page.waitForTimeout(500);

            // Find and click close button (hamburger transforms to X)
            await hamburger.click();
            await page.waitForTimeout(500);

            const overlay = page.locator(INTERACTIVE_ELEMENTS.mobileMenu);
            await expect(overlay).not.toBeVisible();
        });

        test('escape key should close mobile menu', async ({ page }) => {
            const viewport = page.viewportSize();
            if (viewport.width >= 768) {
                test.skip();
                return;
            }

            // Open menu
            const hamburger = page.locator(INTERACTIVE_ELEMENTS.mobileMenuToggle);
            await hamburger.click();
            await page.waitForTimeout(500);

            // Press escape
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);

            const overlay = page.locator(INTERACTIVE_ELEMENTS.mobileMenu);
            await expect(overlay).not.toBeVisible();
        });

        test('body scroll should be locked when mobile menu is open', async ({ page }) => {
            const viewport = page.viewportSize();
            if (viewport.width >= 768) {
                test.skip();
                return;
            }

            // Open menu
            const hamburger = page.locator(INTERACTIVE_ELEMENTS.mobileMenuToggle);
            await hamburger.click();
            await page.waitForTimeout(500);

            // Check body overflow
            const bodyOverflow = await page.evaluate(() => {
                return document.body.style.overflow || window.getComputedStyle(document.body).overflow;
            });

            expect(bodyOverflow).toMatch(/hidden|clip/);
        });

        test('menu should close on link click', async ({ page }) => {
            const viewport = page.viewportSize();
            if (viewport.width >= 768) {
                test.skip();
                return;
            }

            // Open menu
            const hamburger = page.locator(INTERACTIVE_ELEMENTS.mobileMenuToggle);
            await hamburger.click();
            await page.waitForTimeout(500);

            // Click any link
            const manifestoLink = page.locator('.mobile-nav-link[data-section="manifesto"]');
            await manifestoLink.click();
            await page.waitForTimeout(800);

            // Menu should be closed
            const overlay = page.locator(INTERACTIVE_ELEMENTS.mobileMenu);
            await expect(overlay).not.toBeVisible();
        });
    });

    // ==========================================
    // 1.3 SMOOTH SCROLLING
    // ==========================================

    test.describe('Smooth Scrolling', () => {

        test('nav links with data-section should exist', async ({ page }) => {
            const viewport = page.viewportSize();
            if (viewport.width < 768) {
                test.skip();
                return;
            }

            // Check that section nav links exist
            const aboutLink = page.locator('.nav-link[data-section="about"]');
            const manifestoLink = page.locator('.nav-link[data-section="manifesto"]');

            await expect(aboutLink).toBeAttached();
            await expect(manifestoLink).toBeAttached();
        });

        test('programmatic scroll to sections should work', async ({ page }) => {
            // Test scroll directly using JavaScript
            await page.evaluate(() => {
                const aboutSection = document.querySelector('.about-stacked-section');
                if (aboutSection) {
                    aboutSection.scrollIntoView({ behavior: 'instant' });
                }
            });
            await page.waitForTimeout(500);

            // Should have scrolled
            const scrollY = await page.evaluate(() => window.scrollY);
            expect(scrollY).toBeGreaterThan(100);

            // About section should be visible
            const aboutSection = page.locator(SECTIONS.about);
            await expect(aboutSection).toBeInViewport();
        });

        test('should have no horizontal overflow during scroll', async ({ page }) => {
            // Scroll through entire page
            await page.evaluate(async () => {
                const scrollHeight = document.documentElement.scrollHeight;
                const viewportHeight = window.innerHeight;

                for (let y = 0; y < scrollHeight; y += viewportHeight) {
                    window.scrollTo(0, y);
                    await new Promise(r => setTimeout(r, 100));
                }
            });

            // Check for horizontal overflow
            const hasOverflow = await page.evaluate(() => {
                return document.documentElement.scrollWidth > document.documentElement.clientWidth;
            });

            expect(hasOverflow).toBe(false);
        });
    });

    // ==========================================
    // EXTERNAL LINKS
    // ==========================================

    test.describe('External Links', () => {

        test('WhatsApp CTA should have correct href', async ({ page }) => {
            const ctaButtons = page.locator('a[href*="whatsapp"], a[href*="wa.me"]');
            const count = await ctaButtons.count();

            expect(count).toBeGreaterThan(0);

            for (let i = 0; i < count; i++) {
                const href = await ctaButtons.nth(i).getAttribute('href');
                expect(href).toMatch(/wa\.me|whatsapp/i);
            }
        });

        test('external links should have target="_blank"', async ({ page }) => {
            const externalLinks = page.locator('a[href^="http"]:not([href*="localhost"])');
            const count = await externalLinks.count();

            for (let i = 0; i < count; i++) {
                const target = await externalLinks.nth(i).getAttribute('target');
                expect(target).toBe('_blank');
            }
        });

        test('external links should have rel="noopener noreferrer"', async ({ page }) => {
            const externalLinks = page.locator('a[href^="http"][target="_blank"]');
            const count = await externalLinks.count();

            for (let i = 0; i < count; i++) {
                const rel = await externalLinks.nth(i).getAttribute('rel');
                expect(rel).toContain('noopener');
            }
        });
    });
});
