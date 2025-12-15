/**
 * Material Lab Website - Test Utilities
 * Shared helper functions for Playwright tests
 */

// Viewport configurations matching playwright.config.js
const VIEWPORTS = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1920, height: 1080 },
    ultrawide: { width: 2560, height: 1440 },
    minimum: { width: 320, height: 568 }
};

// Section selectors for navigation tests
const SECTIONS = {
    hero: '.hero-section',
    services: '.services-section',
    about: '.about-stacked-section',
    methodology: '.methodology-section',
    manifesto: '.manifesto-section',
    quote: '.quote-section',
    fallingText: '.falling-text-section',
    footer: '.ml-footer'
};

// Interactive element selectors
const INTERACTIVE_ELEMENTS = {
    navLinks: '.nav-link',
    mobileMenuToggle: '.mobile-menu-toggle',
    mobileMenu: '#mobileMenuOverlay',
    serviceCards: '.service-card',
    magneticBadge: '#magneticBadge',
    ctaButtons: '.btn-cta',
    cursorRing: '#cursor-ring',
    cursorDot: '#cursor-dot'
};

// Canvas element selectors
const CANVAS_ELEMENTS = {
    prism: '#prism-canvas',
    kineticGrid: '#kinetic-grid-canvas',
    starsServices: '#stars-services',
    starsMethodology: '#stars-methodology',
    starsManifesto: '#stars-manifesto',
    starsAboutClient: '#stars-about-client',
    starsAboutStacked: '#stars-about-stacked',
    starsFallingText: '#stars-falling-text'
};

/**
 * Wait for GSAP animation to complete on an element
 * @param {Page} page - Playwright page object
 * @param {string} selector - CSS selector
 * @param {number} timeout - Max wait time in ms
 */
async function waitForAnimation(page, selector, timeout = 3000) {
    await page.waitForSelector(selector, { state: 'visible', timeout });
    // Wait for GSAP transforms to settle
    await page.waitForFunction(
        (sel) => {
            const el = document.querySelector(sel);
            if (!el) return true;
            const style = window.getComputedStyle(el);
            return style.opacity !== '0' && !style.transform.includes('scale(0');
        },
        selector,
        { timeout }
    );
}

/**
 * Scroll to a specific section smoothly
 * @param {Page} page - Playwright page object
 * @param {string} sectionId - Section ID without #
 */
async function scrollToSection(page, sectionId) {
    await page.evaluate((id) => {
        const section = document.getElementById(id) || document.querySelector(`.${id}-section`);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, sectionId);
    await page.waitForTimeout(500); // Wait for smooth scroll
}

/**
 * Get scroll position
 * @param {Page} page - Playwright page object
 * @returns {Object} - { x, y } scroll position
 */
async function getScrollPosition(page) {
    return await page.evaluate(() => ({
        x: window.scrollX,
        y: window.scrollY
    }));
}

/**
 * Check for horizontal overflow
 * @param {Page} page - Playwright page object
 * @returns {boolean} - true if overflow exists
 */
async function hasHorizontalOverflow(page) {
    return await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
}

/**
 * Get all console errors during test
 * @param {Page} page - Playwright page object
 * @returns {Array} - Array of error messages
 */
function collectConsoleErrors(page) {
    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });
    return errors;
}

/**
 * Simulate reduced motion preference
 * @param {Page} page - Playwright page object
 */
async function enableReducedMotion(page) {
    await page.emulateMedia({ reducedMotion: 'reduce' });
}

/**
 * Check if element is in viewport
 * @param {Page} page - Playwright page object
 * @param {string} selector - CSS selector
 * @returns {boolean}
 */
async function isInViewport(page, selector) {
    return await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return (
            rect.top < window.innerHeight &&
            rect.bottom > 0 &&
            rect.left < window.innerWidth &&
            rect.right > 0
        );
    }, selector);
}

/**
 * Get computed style property
 * @param {Page} page - Playwright page object
 * @param {string} selector - CSS selector
 * @param {string} property - CSS property name
 * @returns {string} - Property value
 */
async function getComputedStyle(page, selector, property) {
    return await page.evaluate(
        ({ sel, prop }) => {
            const el = document.querySelector(sel);
            if (!el) return null;
            return window.getComputedStyle(el)[prop];
        },
        { sel: selector, prop: property }
    );
}

/**
 * Simulate slow network conditions
 * @param {Page} page - Playwright page object
 * @param {string} speed - 'slow3g' | 'fast3g' | 'offline'
 */
async function setNetworkCondition(page, speed) {
    const cdp = await page.context().newCDPSession(page);
    const conditions = {
        slow3g: { downloadThroughput: 50000, uploadThroughput: 50000, latency: 2000 },
        fast3g: { downloadThroughput: 180000, uploadThroughput: 84000, latency: 562.5 },
        offline: { offline: true, downloadThroughput: 0, uploadThroughput: 0, latency: 0 }
    };
    await cdp.send('Network.emulateNetworkConditions', conditions[speed] || conditions.fast3g);
}

/**
 * Measure frames per second during an action
 * @param {Page} page - Playwright page object
 * @param {Function} action - Async function to perform while measuring
 * @param {number} duration - Measurement duration in ms
 * @returns {Object} - { averageFPS, minFPS, droppedFrames }
 */
async function measureFPS(page, action, duration = 2000) {
    const result = await page.evaluate(async (dur) => {
        return new Promise((resolve) => {
            const frames = [];
            let lastTime = performance.now();
            let animationId;

            const measure = (currentTime) => {
                const delta = currentTime - lastTime;
                if (delta > 0) {
                    frames.push(1000 / delta);
                }
                lastTime = currentTime;
                animationId = requestAnimationFrame(measure);
            };

            animationId = requestAnimationFrame(measure);

            setTimeout(() => {
                cancelAnimationFrame(animationId);
                if (frames.length === 0) {
                    resolve({ averageFPS: 60, minFPS: 60, droppedFrames: 0 });
                    return;
                }
                const avg = frames.reduce((a, b) => a + b, 0) / frames.length;
                const min = Math.min(...frames);
                const dropped = frames.filter(f => f < 30).length;
                resolve({
                    averageFPS: Math.round(avg),
                    minFPS: Math.round(min),
                    droppedFrames: dropped
                });
            }, dur);
        });
    }, duration);

    if (action) {
        await action();
    }

    return result;
}

/**
 * Check accessibility basics using page evaluation
 * @param {Page} page - Playwright page object
 * @returns {Object} - Accessibility check results
 */
async function checkBasicAccessibility(page) {
    return await page.evaluate(() => {
        const results = {
            hasSkipLink: !!document.querySelector('.skip-link'),
            hasMainLandmark: !!document.querySelector('main, [role="main"]'),
            hasHeaderLandmark: !!document.querySelector('header, [role="banner"]'),
            hasFooterLandmark: !!document.querySelector('footer, [role="contentinfo"]'),
            imagesWithoutAlt: Array.from(document.querySelectorAll('img:not([alt])')).length,
            buttonsWithoutText: Array.from(document.querySelectorAll('button')).filter(
                btn => !btn.textContent.trim() && !btn.getAttribute('aria-label')
            ).length,
            linksWithoutText: Array.from(document.querySelectorAll('a')).filter(
                a => !a.textContent.trim() && !a.getAttribute('aria-label')
            ).length,
            headingOrder: checkHeadingOrder()
        };

        function checkHeadingOrder() {
            const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
            let lastLevel = 0;
            let valid = true;
            headings.forEach(h => {
                const level = parseInt(h.tagName[1]);
                if (level > lastLevel + 1 && lastLevel !== 0) {
                    valid = false;
                }
                lastLevel = level;
            });
            return valid;
        }

        return results;
    });
}

/**
 * Take a screenshot with consistent naming
 * @param {Page} page - Playwright page object
 * @param {string} name - Screenshot name
 * @param {Object} options - Screenshot options
 */
async function takeScreenshot(page, name, options = {}) {
    const defaultOptions = {
        fullPage: false,
        path: `test-results/screenshots/${name}.png`
    };
    await page.screenshot({ ...defaultOptions, ...options });
}

/**
 * Wait for page to be fully loaded including GSAP
 * @param {Page} page - Playwright page object
 */
async function waitForPageReady(page) {
    await page.waitForLoadState('networkidle');
    await page.waitForFunction(() => {
        return typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
    }, { timeout: 10000 });
    // Wait for initial animations to complete
    await page.waitForTimeout(1500);
}

/**
 * Trigger hover on element with proper mouse events
 * @param {Page} page - Playwright page object
 * @param {string} selector - CSS selector
 */
async function triggerHover(page, selector) {
    const element = await page.$(selector);
    if (element) {
        const box = await element.boundingBox();
        if (box) {
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await page.waitForTimeout(100);
        }
    }
}

/**
 * Get element dimensions and position
 * @param {Page} page - Playwright page object
 * @param {string} selector - CSS selector
 * @returns {Object} - Bounding box
 */
async function getElementBounds(page, selector) {
    const element = await page.$(selector);
    if (!element) return null;
    return await element.boundingBox();
}

module.exports = {
    VIEWPORTS,
    SECTIONS,
    INTERACTIVE_ELEMENTS,
    CANVAS_ELEMENTS,
    waitForAnimation,
    scrollToSection,
    getScrollPosition,
    hasHorizontalOverflow,
    collectConsoleErrors,
    enableReducedMotion,
    isInViewport,
    getComputedStyle,
    setNetworkCondition,
    measureFPS,
    checkBasicAccessibility,
    takeScreenshot,
    waitForPageReady,
    triggerHover,
    getElementBounds
};
