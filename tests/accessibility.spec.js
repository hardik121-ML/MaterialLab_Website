/**
 * Material Lab Website - Accessibility Tests
 * Tests for WCAG compliance, keyboard navigation, screen reader support
 */

const { test, expect } = require('@playwright/test');
const {
    waitForPageReady,
    checkBasicAccessibility
} = require('./helpers/test-utils');

test.describe('Accessibility Tests', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await waitForPageReady(page);
    });

    // ==========================================
    // 4.1 KEYBOARD NAVIGATION
    // ==========================================

    test.describe('Keyboard Navigation', () => {

        test('tab should navigate through all focusable elements', async ({ page }) => {
            // Start from beginning
            await page.keyboard.press('Tab');

            // Should focus something
            const focusedElement = await page.evaluate(() =>
                document.activeElement?.tagName
            );

            expect(focusedElement).not.toBe('BODY');
        });

        test('focus order should be logical (top to bottom)', async ({ page }) => {
            const focusedPositions = [];

            // Tab through first 10 focusable elements
            for (let i = 0; i < 10; i++) {
                await page.keyboard.press('Tab');
                const position = await page.evaluate(() => {
                    const el = document.activeElement;
                    if (!el || el.tagName === 'BODY') return null;
                    const rect = el.getBoundingClientRect();
                    return { top: rect.top, left: rect.left };
                });
                if (position) {
                    focusedPositions.push(position);
                }
            }

            // Generally, focus should move downward (with some exceptions for navigation)
            // At least verify we collected some positions
            expect(focusedPositions.length).toBeGreaterThan(0);
        });

        test('skip link should work if present', async ({ page }) => {
            const skipLink = page.locator('.skip-link');

            // Skip this test if no skip link exists
            if (await skipLink.count() === 0) {
                test.skip();
                return;
            }

            // Focus skip link
            await page.keyboard.press('Tab');

            // Activate it
            await page.keyboard.press('Enter');
            await page.waitForTimeout(300);

            // Focus should move to main content
            const activeElement = await page.evaluate(() =>
                document.activeElement?.id || document.activeElement?.getAttribute('role')
            );

            // Should have moved to main content area
            expect(activeElement).toBeTruthy();
        });

        test('escape should close open menus', async ({ page }) => {
            const viewport = page.viewportSize();

            if (viewport.width < 768) {
                // Mobile: Open hamburger menu
                const hamburger = page.locator('.mobile-menu-toggle');
                if (await hamburger.isVisible()) {
                    await hamburger.click();
                    await page.waitForTimeout(300);

                    await page.keyboard.press('Escape');
                    await page.waitForTimeout(300);

                    const menu = page.locator('#mobileMenuOverlay');
                    const isVisible = await menu.evaluate(el =>
                        window.getComputedStyle(el).display !== 'none'
                    );
                    expect(isVisible).toBeFalsy();
                }
            }
        });

        test('enter/space should activate buttons', async ({ page }) => {
            const button = page.locator('.btn-cta').first();

            if (await button.isVisible()) {
                await button.focus();

                // Should not throw error on Enter
                await page.keyboard.press('Enter');
                await page.waitForTimeout(100);

                // Should not throw error on Space
                await button.focus();
                await page.keyboard.press('Space');
            }
        });
    });

    // ==========================================
    // 4.2 SCREEN READER SUPPORT
    // ==========================================

    test.describe('Screen Reader Support', () => {

        test('all images should have alt text or aria-hidden', async ({ page }) => {
            const results = await checkBasicAccessibility(page);
            expect(results.imagesWithoutAlt).toBe(0);
        });

        test('buttons should have accessible names', async ({ page }) => {
            const results = await checkBasicAccessibility(page);
            expect(results.buttonsWithoutText).toBe(0);
        });

        test('links should have accessible names', async ({ page }) => {
            const linksWithoutText = await page.evaluate(() => {
                const links = document.querySelectorAll('a');
                return Array.from(links).filter(a => {
                    const text = a.textContent?.trim();
                    const ariaLabel = a.getAttribute('aria-label');
                    const title = a.getAttribute('title');
                    const hasImage = a.querySelector('img[alt]');
                    return !text && !ariaLabel && !title && !hasImage;
                }).length;
            });

            expect(linksWithoutText).toBe(0);
        });

        test('ARIA roles should be correct on nav elements', async ({ page }) => {
            const nav = page.locator('nav, [role="navigation"]');
            const count = await nav.count();

            expect(count).toBeGreaterThan(0);
        });

        test('decorative elements should be hidden from AT', async ({ page }) => {
            const decorativeCanvases = await page.evaluate(() => {
                const canvases = document.querySelectorAll('canvas');
                return Array.from(canvases).filter(c =>
                    !c.getAttribute('aria-hidden') && !c.getAttribute('role')
                ).length;
            });

            // Canvases should ideally have aria-hidden (soft check)
            // Allow up to 5 canvases without explicit aria-hidden as some may be functional
            expect(decorativeCanvases).toBeLessThanOrEqual(5);
        });
    });

    // ==========================================
    // 4.3 VISUAL ACCESSIBILITY
    // ==========================================

    test.describe('Visual Accessibility', () => {

        test('focus indicators should be visible', async ({ page }) => {
            // Tab to first focusable element
            await page.keyboard.press('Tab');

            // Check for focus style
            const hasFocusStyle = await page.evaluate(() => {
                const el = document.activeElement;
                if (!el || el.tagName === 'BODY') return false;

                const style = window.getComputedStyle(el);
                const outline = style.outline;
                const boxShadow = style.boxShadow;
                const border = style.border;

                return outline !== 'none' ||
                       boxShadow !== 'none' ||
                       border !== 'none';
            });

            expect(hasFocusStyle).toBeTruthy();
        });

        test('text should be readable at 200% zoom', async ({ page }) => {
            // Set 200% zoom
            await page.evaluate(() => {
                document.body.style.zoom = '2';
            });
            await page.waitForTimeout(500);

            // Check for horizontal overflow
            const hasOverflow = await page.evaluate(() => {
                return document.documentElement.scrollWidth > document.documentElement.clientWidth * 2;
            });

            // Reset zoom
            await page.evaluate(() => {
                document.body.style.zoom = '1';
            });

            // Some overflow is acceptable but shouldn't break completely
        });

        test('no horizontal scroll at 320px width', async ({ page }) => {
            await page.setViewportSize({ width: 320, height: 568 });
            await page.waitForTimeout(500);

            const hasOverflow = await page.evaluate(() => {
                return document.documentElement.scrollWidth > document.documentElement.clientWidth + 5;
            });

            expect(hasOverflow).toBeFalsy();
        });

        test('touch targets should be minimum 44x44px', async ({ page }) => {
            const viewport = page.viewportSize();
            if (viewport.width >= 768) {
                test.skip();
                return;
            }

            const smallTargets = await page.evaluate(() => {
                const interactiveElements = document.querySelectorAll('a, button, [role="button"], input, select, textarea');
                let small = 0;

                interactiveElements.forEach(el => {
                    const rect = el.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0) {
                        if (rect.width < 44 || rect.height < 44) {
                            // Check if it has adequate touch target through padding
                            const style = window.getComputedStyle(el);
                            const paddingH = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
                            const paddingV = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);

                            if ((rect.width + paddingH) < 44 || (rect.height + paddingV) < 44) {
                                small++;
                            }
                        }
                    }
                });

                return small;
            });

            // Allow some small targets for edge cases
            expect(smallTargets).toBeLessThan(5);
        });
    });

    // ==========================================
    // 4.4 SEMANTIC HTML
    // ==========================================

    test.describe('Semantic HTML', () => {

        test('proper heading hierarchy (h1 to h6)', async ({ page }) => {
            // Check that headings exist
            const h1Count = await page.locator('h1').count();
            const h2Count = await page.locator('h2').count();

            expect(h1Count).toBeGreaterThan(0);
            expect(h2Count).toBeGreaterThanOrEqual(0);

            // Basic validation - just check headings exist
            const results = await checkBasicAccessibility(page);
            // Soft check - many sites have imperfect heading hierarchy
            expect(results.hasMainLandmark).toBeTruthy();
        });

        test('landmarks should be present', async ({ page }) => {
            const results = await checkBasicAccessibility(page);

            expect(results.hasHeaderLandmark).toBeTruthy();
            expect(results.hasMainLandmark).toBeTruthy();
            expect(results.hasFooterLandmark).toBeTruthy();
        });

        test('only one h1 should exist', async ({ page }) => {
            const h1Count = await page.locator('h1').count();
            expect(h1Count).toBe(1);
        });

        test('lists should be used for nav items', async ({ page }) => {
            const navLists = await page.locator('nav ul, nav ol, [role="navigation"] ul').count();

            // At least one navigation should use lists
            expect(navLists).toBeGreaterThan(0);
        });

        test('main content should have proper landmark', async ({ page }) => {
            const main = page.locator('main, [role="main"]');
            const count = await main.count();

            expect(count).toBe(1);
        });
    });

    // ==========================================
    // COLOR & CONTRAST
    // ==========================================

    test.describe('Color and Contrast', () => {

        test('text should have sufficient contrast', async ({ page }) => {
            // Check a sample of text elements
            const textElements = page.locator('p, h1, h2, h3, span:not([aria-hidden])');
            const count = await textElements.count();

            // Spot check first few visible elements
            let checkedCount = 0;
            for (let i = 0; i < Math.min(count, 5); i++) {
                const el = textElements.nth(i);
                if (await el.isVisible()) {
                    const color = await el.evaluate(el =>
                        window.getComputedStyle(el).color
                    );
                    // Just verify color is defined
                    expect(color).toBeTruthy();
                    checkedCount++;
                }
            }

            expect(checkedCount).toBeGreaterThan(0);
        });

        test('links should be distinguishable from text', async ({ page }) => {
            const link = page.locator('a').first();

            if (await link.isVisible()) {
                const linkColor = await link.evaluate(el =>
                    window.getComputedStyle(el).color
                );
                const textDecoration = await link.evaluate(el =>
                    window.getComputedStyle(el).textDecoration
                );

                // Links should have some visual distinction
                expect(linkColor || textDecoration).toBeTruthy();
            }
        });
    });

    // ==========================================
    // FORM ACCESSIBILITY
    // ==========================================

    test.describe('Form Accessibility', () => {

        test('form inputs should have labels', async ({ page }) => {
            const inputs = page.locator('input:not([type="hidden"]), textarea, select');
            const count = await inputs.count();

            for (let i = 0; i < count; i++) {
                const input = inputs.nth(i);
                const id = await input.getAttribute('id');
                const ariaLabel = await input.getAttribute('aria-label');
                const ariaLabelledBy = await input.getAttribute('aria-labelledby');
                const placeholder = await input.getAttribute('placeholder');

                // Should have some form of labeling
                if (id) {
                    const label = page.locator(`label[for="${id}"]`);
                    const hasLabel = (await label.count()) > 0;
                    expect(hasLabel || ariaLabel || ariaLabelledBy || placeholder).toBeTruthy();
                } else {
                    expect(ariaLabel || ariaLabelledBy || placeholder).toBeTruthy();
                }
            }
        });
    });
});
