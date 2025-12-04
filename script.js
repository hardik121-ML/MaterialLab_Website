/* ========================================
   GSAP ANIMATIONS & INTERACTIONS
   SVG Ellipse Mask Transition System
======================================== */

// Wait for DOM and GSAP to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize GSAP and ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    /* ========================================
       GRAINY GLOW CURSOR
    ======================================== */

    const grainyCursor = document.getElementById('grainy-cursor');

    if (grainyCursor) {
        // Track mouse movement
        const handleMouseMove = (e) => {
            // Use transform for better performance
            grainyCursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        };

        // Hide cursor when leaving window
        const handleMouseLeave = () => {
            grainyCursor.style.opacity = '0';
        };

        // Show cursor when entering window
        const handleMouseEnter = () => {
            grainyCursor.style.opacity = '0.6';
        };

        window.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mouseenter', handleMouseEnter);

        console.log('✓ Grainy Glow Cursor Initialized');
    }

    /* ========================================
       SVG ELLIPSE MASK TRANSITION (CRITICAL)
    ======================================== */

    const transitionOverlay = document.getElementById('transition-overlay');
    const maskEllipse = document.getElementById('mask-ellipse');

    // Calculate responsive center position
    const getEllipseCenter = () => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight + 1000; // Below viewport
        return { cx: centerX, cy: centerY };
    };

    // Calculate responsive ellipse size
    const getEllipseSize = () => {
        const rx = Math.max(window.innerWidth, 2700);
        const ry = Math.max(window.innerHeight, 2150);
        return { rx, ry };
    };

    // Set initial ellipse position
    const initCenter = getEllipseCenter();
    gsap.set(maskEllipse, {
        attr: {
            cx: initCenter.cx,
            cy: initCenter.cy,
            rx: 0,
            ry: 0
        }
    });

    // PAGE LOAD ENTRANCE ANIMATION
    const pageEnterTransition = () => {
        const size = getEllipseSize();

        const tl = gsap.timeline({
            onComplete: () => {
                // Hide overlay after animation completes
                gsap.set(transitionOverlay, { autoAlpha: 0, delay: 0.3 });
            }
        });

        tl.to(maskEllipse, {
            attr: {
                rx: size.rx,
                ry: size.ry
            },
            duration: 2,
            delay: 0.5,
            ease: "power3.out"
        });

        return tl;
    };

    // PAGE LEAVE TRANSITION (for navigation clicks)
    const pageLeaveTransition = (targetSection) => {
        // Make overlay visible again
        gsap.set(transitionOverlay, { autoAlpha: 1 });

        const center = getEllipseCenter();

        const tl = gsap.timeline({
            onComplete: () => {
                // Scroll to target section
                if (targetSection) {
                    const element = document.getElementById(targetSection);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                    }
                }

                // Re-expand ellipse to reveal new section
                setTimeout(() => {
                    const size = getEllipseSize();
                    gsap.to(maskEllipse, {
                        attr: {
                            rx: size.rx,
                            ry: size.ry
                        },
                        duration: 1.5,
                        ease: "power3.out",
                        onComplete: () => {
                            gsap.set(transitionOverlay, { autoAlpha: 0, delay: 0.3 });
                        }
                    });
                }, 100);
            }
        });

        tl.to(maskEllipse, {
            attr: {
                cx: center.cx,
                cy: center.cy,
                rx: 0,
                ry: 0
            },
            duration: 1.2,
            ease: "power3.in"
        });

        return tl;
    };

    // Start page enter animation
    pageEnterTransition();

    // Recalculate on window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const center = getEllipseCenter();
            const currentRx = maskEllipse.getAttribute('rx');

            // Only update center if ellipse is expanded
            if (parseFloat(currentRx) > 100) {
                const size = getEllipseSize();
                gsap.set(maskEllipse, {
                    attr: {
                        cx: center.cx,
                        rx: size.rx,
                        ry: size.ry
                    }
                });
            } else {
                gsap.set(maskEllipse, {
                    attr: {
                        cx: center.cx,
                        cy: center.cy
                    }
                });
            }
        }, 150);
    });

    /* ========================================
       HERO CONTENT ANIMATIONS
    ======================================== */

    const animateHeroContent = () => {
        const tl = gsap.timeline({ delay: 2.5 }); // After ellipse transition

        // Awards badge
        tl.to('.awards-badge', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out"
        });

        // Main heading - letter by letter reveal
        tl.to('.hero-heading', {
            opacity: 1,
            duration: 0.01
        }, "-=0.4");

        // Split heading into lines for stagger effect
        const headingLines = gsap.utils.toArray('.heading-line');
        headingLines.forEach((line, index) => {
            tl.from(line, {
                y: 80,
                opacity: 0,
                duration: 1.2,
                ease: "power3.out"
            }, `-=${index === 0 ? 0 : 0.4}`);
        });

        // Subheading
        tl.to('.hero-subheading', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out"
        }, "-=0.6");

        // Brand logos - stagger animation
        tl.to('.brand-logos', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out"
        }, "-=0.4");

        const logoItems = gsap.utils.toArray('.logo-item');
        tl.from(logoItems, {
            opacity: 0,
            y: 20,
            scale: 0.8,
            duration: 0.6,
            stagger: 0.08,
            ease: "back.out(1.7)"
        }, "-=0.6");

        // Footer
        tl.to('.hero-footer', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out"
        }, "-=0.8");
    };

    animateHeroContent();

    /* ========================================
       HEADER SCROLL BEHAVIOR
    ======================================== */

    const header = document.querySelector('.main-header');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScrollY = currentScrollY;
    });

    /* ========================================
       NAVIGATION INTERACTIONS
    ======================================== */

    // Nav link click with ellipse transition
    const navLinks = document.querySelectorAll('.nav-link[data-section]');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = link.getAttribute('data-section');

            // Close mega dropdown if open
            const activeDropdown = document.querySelector('.nav-item.has-dropdown.active');
            if (activeDropdown) {
                activeDropdown.classList.remove('active');
            }

            // Trigger page leave transition
            pageLeaveTransition(targetSection);
        });
    });

    // Mega dropdown toggle
    const servicesNavItem = document.querySelector('.nav-item.has-dropdown');
    const servicesLink = servicesNavItem?.querySelector('.nav-link');

    if (servicesNavItem && servicesLink) {
        servicesLink.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            servicesNavItem.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!servicesNavItem.contains(e.target)) {
                servicesNavItem.classList.remove('active');
            }
        });

        // Close dropdown on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && servicesNavItem.classList.contains('active')) {
                servicesNavItem.classList.remove('active');
            }
        });
    }

    /* ========================================
       BACKGROUND PARALLAX EFFECT
    ======================================== */

    const heroBackground = document.querySelector('.hero-bg-image');

    if (heroBackground) {
        document.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;

            const moveX = (mouseX - 0.5) * 4; // 4px max movement
            const moveY = (mouseY - 0.5) * 4;

            gsap.to(heroBackground, {
                x: moveX,
                y: moveY,
                duration: 1,
                ease: "power2.out"
            });
        });
    }

    /* ========================================
       CTA BUTTON MAGNETIC EFFECT
    ======================================== */

    const ctaButton = document.querySelector('.btn-cta');

    if (ctaButton) {
        const magneticStrength = 0.3;

        ctaButton.addEventListener('mouseenter', () => {
            gsap.to(ctaButton, {
                scale: 1.05,
                duration: 0.3,
                ease: "back.out(1.7)"
            });
        });

        ctaButton.addEventListener('mouseleave', () => {
            gsap.to(ctaButton, {
                scale: 1,
                x: 0,
                y: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.5)"
            });
        });

        ctaButton.addEventListener('mousemove', (e) => {
            const rect = ctaButton.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(ctaButton, {
                x: x * magneticStrength,
                y: y * magneticStrength,
                duration: 0.3,
                ease: "power2.out"
            });
        });
    }

    /* ========================================
       INLINE IMAGE HOVER ANIMATION
    ======================================== */

    const inlineImage = document.querySelector('.inline-image');

    if (inlineImage) {
        let rotationTween;

        inlineImage.addEventListener('mouseenter', () => {
            gsap.to(inlineImage, {
                scale: 1.1,
                rotation: 3,
                duration: 0.4,
                ease: "back.out(2)"
            });
        });

        inlineImage.addEventListener('mouseleave', () => {
            gsap.to(inlineImage, {
                scale: 1,
                rotation: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.5)"
            });
        });
    }

    /* ========================================
       SCROLL TRIGGER ANIMATIONS
    ======================================== */

    // Animate placeholder sections on scroll
    const placeholderSections = gsap.utils.toArray('.placeholder-section');

    placeholderSections.forEach((section) => {
        gsap.from(section.querySelector('h2'), {
            scrollTrigger: {
                trigger: section,
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            },
            opacity: 0,
            y: 60,
            duration: 1,
            ease: "power3.out"
        });
    });

    /* ========================================
       ABOUT SECTION ANIMATIONS
    ======================================== */

    // About text reveal
    gsap.from('.about-text', {
        scrollTrigger: {
            trigger: '.about-client-section',
            start: "top 70%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
        },
        opacity: 0,
        y: 40,
        duration: 1,
        ease: "power3.out"
    });

    // About heading reveal with word animation
    gsap.from('.about-heading', {
        scrollTrigger: {
            trigger: '.about-client-section',
            start: "top 70%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
        },
        opacity: 0,
        y: 60,
        duration: 1.2,
        ease: "power3.out"
    });

    // Thumbnail reveal
    gsap.from('.heading-thumbnail', {
        scrollTrigger: {
            trigger: '.about-client-section',
            start: "top 70%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
        },
        opacity: 0,
        scale: 0.5,
        rotation: -10,
        duration: 0.8,
        ease: "back.out(1.7)",
        delay: 0.3
    });

    // CTAs reveal with stagger
    gsap.from('.about-ctas > *', {
        scrollTrigger: {
            trigger: '.about-client-section',
            start: "top 70%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        delay: 0.4
    });

    /* ========================================
       CTA BUTTON MAGNETIC EFFECTS
    ======================================== */

    const ctaPrimary = document.querySelector('.cta-primary');

    if (ctaPrimary) {
        const magneticStrength = 0.25;

        ctaPrimary.addEventListener('mouseenter', () => {
            gsap.to(ctaPrimary, {
                scale: 1.02,
                duration: 0.3,
                ease: "back.out(1.7)"
            });
        });

        ctaPrimary.addEventListener('mouseleave', () => {
            gsap.to(ctaPrimary, {
                scale: 1,
                x: 0,
                y: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.5)"
            });
        });

        ctaPrimary.addEventListener('mousemove', (e) => {
            const rect = ctaPrimary.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(ctaPrimary, {
                x: x * magneticStrength,
                y: y * magneticStrength,
                duration: 0.3,
                ease: "power2.out"
            });
        });
    }

    /* ========================================
       MOBILE MENU TOGGLE
    ======================================== */

    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinksContainer = document.querySelector('.nav-links');

    if (mobileMenuToggle && navLinksContainer) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.toggle('active');
            navLinksContainer.classList.toggle('mobile-active');

            // Animate menu toggle icon
            const spans = mobileMenuToggle.querySelectorAll('span');
            if (mobileMenuToggle.classList.contains('active')) {
                gsap.to(spans[0], { rotation: 45, y: 8, duration: 0.3 });
                gsap.to(spans[1], { opacity: 0, duration: 0.2 });
                gsap.to(spans[2], { rotation: -45, y: -8, duration: 0.3 });
            } else {
                gsap.to(spans[0], { rotation: 0, y: 0, duration: 0.3 });
                gsap.to(spans[1], { opacity: 1, duration: 0.2, delay: 0.1 });
                gsap.to(spans[2], { rotation: 0, y: 0, duration: 0.3 });
            }
        });
    }

    /* ========================================
       SMOOTH SCROLL PERFORMANCE
    ======================================== */

    // Add smooth scrolling to all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && !this.hasAttribute('data-section')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    /* ========================================
       PERFORMANCE OPTIMIZATION
    ======================================== */

    // Remove will-change after animations complete
    const removeWillChange = (element) => {
        setTimeout(() => {
            element.style.willChange = 'auto';
        }, 1000);
    };

    // Apply to animated elements
    ['.hero-container', '.awards-badge', '.hero-heading', '.hero-subheading', '.brand-logos', '.hero-footer'].forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            setTimeout(() => removeWillChange(element), 4000);
        }
    });

    /* ========================================
       ACCESSIBILITY ENHANCEMENTS
    ======================================== */

    // Keyboard navigation for dropdowns
    const dropdownTriggers = document.querySelectorAll('.nav-item.has-dropdown > .nav-link');

    dropdownTriggers.forEach(trigger => {
        trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                trigger.parentElement.classList.toggle('active');
            }
        });
    });

    // Focus trap for mega dropdown
    const megaDropdown = document.querySelector('.mega-dropdown');
    if (megaDropdown) {
        megaDropdown.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const focusableElements = megaDropdown.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });
    }

    /* ========================================
       FOOTER ANIMATIONS
    ======================================== */

    // Footer scroll-triggered animations
    const footerComponent = document.querySelector('.footer-component');

    if (footerComponent) {
        // Newsletter section fade-in
        gsap.from('.footer-newsletter-section', {
            scrollTrigger: {
                trigger: '.footer-component',
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            },
            opacity: 0,
            y: 60,
            duration: 1,
            ease: "power3.out"
        });

        // Newsletter title animation
        gsap.from('.footer-newsletter-title', {
            scrollTrigger: {
                trigger: '.footer-component',
                start: "top 75%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            },
            opacity: 0,
            y: 40,
            duration: 1,
            ease: "power3.out",
            delay: 0.2
        });

        // Newsletter form animation
        gsap.from('.newsletter-form', {
            scrollTrigger: {
                trigger: '.footer-component',
                start: "top 75%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            },
            opacity: 0,
            scale: 0.95,
            duration: 0.8,
            ease: "back.out(1.7)",
            delay: 0.4
        });

        // Social links staggered reveal
        const socialLinks = gsap.utils.toArray('.social-link');

        // Set initial state explicitly
        gsap.set(socialLinks, { opacity: 1, y: 0, scale: 1 });

        gsap.from(socialLinks, {
            scrollTrigger: {
                trigger: '.footer-component',
                start: "top 70%",
                end: "bottom 20%",
                toggleActions: "play none none reverse",
                // Ensure animation plays even if footer is in view on load
                immediateRender: false
            },
            opacity: 0,
            y: 30,
            scale: 0.9,
            duration: 0.6,
            stagger: 0.08,
            ease: "back.out(1.7)",
            delay: 0.6
        });

        // Footer navigation columns animation
        const footerNavColumns = gsap.utils.toArray('.footer-nav-column');
        footerNavColumns.forEach((column, index) => {
            gsap.from(column, {
                scrollTrigger: {
                    trigger: '.footer-component',
                    start: "top 70%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                },
                opacity: 0,
                y: 50,
                duration: 0.8,
                ease: "power3.out",
                delay: 0.3 + (index * 0.1)
            });
        });

        // Footer links staggered animation within each column
        const footerLinks = gsap.utils.toArray('.footer-link');
        gsap.from(footerLinks, {
            scrollTrigger: {
                trigger: '.footer-component',
                start: "top 70%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            },
            opacity: 0,
            x: -20,
            duration: 0.6,
            stagger: 0.05,
            ease: "power3.out",
            delay: 0.5
        });

        // Footer brand text animation
        gsap.from('.footer-brand-text', {
            scrollTrigger: {
                trigger: '.footer-brand-text-wrapper',
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            },
            opacity: 0,
            x: -100,
            rotation: -10,
            duration: 1.2,
            ease: "back.out(1.7)",
            delay: 0.2
        });

        // Footer logo animation
        gsap.from('.footer-logo-section', {
            scrollTrigger: {
                trigger: '.footer-component',
                start: "top 70%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            },
            opacity: 0,
            scale: 0.8,
            rotation: -5,
            duration: 1,
            ease: "back.out(1.7)",
            delay: 0.4
        });

        // Footer bottom bar animation
        gsap.from('.footer-bottom', {
            scrollTrigger: {
                trigger: '.footer-component',
                start: "top 60%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            },
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: "power3.out",
            delay: 0.8
        });
    }

    /* ========================================
       NEWSLETTER FORM SUBMISSION
    ======================================== */

    const newsletterForm = document.getElementById('newsletterForm');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const emailInput = newsletterForm.querySelector('.newsletter-input');
            const submitButton = newsletterForm.querySelector('.newsletter-submit');
            const emailValue = emailInput.value;

            // Validate email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailValue)) {
                // Shake animation for invalid email
                gsap.to(newsletterForm, {
                    x: [-10, 10, -10, 10, 0],
                    duration: 0.4,
                    ease: "power2.out"
                });
                return;
            }

            // Success animation
            const tl = gsap.timeline();

            // Scale up submit button with rotation
            tl.to(submitButton, {
                scale: 1.2,
                rotation: 360,
                duration: 0.5,
                ease: "back.out(1.7)"
            });

            // Add success class
            newsletterForm.classList.add('success');

            // Scale back and show success state
            tl.to(submitButton, {
                scale: 1,
                duration: 0.3,
                ease: "power2.out"
            });

            // Update input placeholder
            emailInput.value = '';
            emailInput.placeholder = '✓ Successfully subscribed!';

            // Remove success state after 3 seconds
            setTimeout(() => {
                newsletterForm.classList.remove('success');
                emailInput.placeholder = 'Your Email Address';
            }, 3000);

            // Log subscription (in production, send to server)
            console.log('Newsletter subscription:', emailValue);
        });
    }

    /* ========================================
       FOOTER LINK HOVER EFFECTS
    ======================================== */

    const allFooterLinks = document.querySelectorAll('.footer-link');

    allFooterLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            gsap.to(link, {
                x: 5,
                duration: 0.3,
                ease: "power2.out"
            });
        });

        link.addEventListener('mouseleave', () => {
            gsap.to(link, {
                x: 0,
                duration: 0.3,
                ease: "power2.out"
            });
        });
    });

    /* ========================================
       SOCIAL LINK MAGNETIC EFFECT
    ======================================== */

    const allSocialLinks = document.querySelectorAll('.social-link');

    allSocialLinks.forEach(socialLink => {
        const magneticStrength = 0.15;

        socialLink.addEventListener('mouseenter', () => {
            gsap.to(socialLink, {
                scale: 1.05,
                duration: 0.3,
                ease: "back.out(1.7)"
            });
        });

        socialLink.addEventListener('mouseleave', () => {
            gsap.to(socialLink, {
                scale: 1,
                x: 0,
                y: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.5)"
            });
        });

        socialLink.addEventListener('mousemove', (e) => {
            const rect = socialLink.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(socialLink, {
                x: x * magneticStrength,
                y: y * magneticStrength,
                duration: 0.3,
                ease: "power2.out"
            });
        });
    });

    /* ========================================
       FOOTER LOGO HOVER ANIMATION
    ======================================== */

    const footerLogo = document.querySelector('.footer-logo');

    if (footerLogo) {
        footerLogo.addEventListener('mouseenter', () => {
            gsap.to(footerLogo, {
                scale: 1.05,
                rotation: 2,
                duration: 0.4,
                ease: "back.out(2)"
            });
        });

        footerLogo.addEventListener('mouseleave', () => {
            gsap.to(footerLogo, {
                scale: 1,
                rotation: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.5)"
            });
        });
    }

    /* ========================================
       FOOTER BRAND TEXT INTERACTIVE ANIMATION
    ======================================== */

    const footerBrandText = document.querySelector('.footer-brand-text');

    if (footerBrandText) {
        // Add split text effect for more dynamic animation
        footerBrandText.addEventListener('mouseenter', () => {
            gsap.to(footerBrandText, {
                letterSpacing: '0.05em',
                duration: 0.4,
                ease: "back.out(1.7)"
            });
        });

        footerBrandText.addEventListener('mouseleave', () => {
            gsap.to(footerBrandText, {
                letterSpacing: '-0.04em',
                duration: 0.5,
                ease: "elastic.out(1, 0.5)"
            });
        });

        // Continuous subtle animation
        gsap.to(footerBrandText, {
            rotation: 1,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut"
        });
    }

    /* ========================================
       SERVICES SECTION ANIMATIONS
    ======================================== */

    const servicesSection = document.querySelector('.services-section');

    if (servicesSection) {
        // Entrance Animation Timeline
        const servicesEntranceTl = gsap.timeline({
            defaults: { ease: "power3.out" },
            scrollTrigger: {
                trigger: '.services-section',
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            }
        });

        // Animate header
        servicesEntranceTl.to("#services-header-section", {
            opacity: 1,
            duration: 0.8,
            y: 0,
            startAt: { y: 20 }
        });

        // Animate divider line
        servicesEntranceTl.to("#services-main-divider", {
            opacity: 1,
            width: "100%",
            duration: 0.8,
            startAt: { width: "0%" }
        }, "-=0.4");

        // Animate service items
        servicesEntranceTl.to(".service-item", {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1
        }, "-=0.4");

        // Hover Interactions for Service Items
        const serviceItems = document.querySelectorAll('.service-item');

        serviceItems.forEach(item => {
            // Pre-set background image from data attribute
            const bgImage = item.getAttribute('data-image');
            const bgDiv = item.querySelector('.service-bg');
            if (bgDiv && bgImage) {
                bgDiv.style.backgroundImage = `url('${bgImage}')`;
            }

            // Create paused timeline for hover animation
            const hoverTl = gsap.timeline({
                paused: true,
                defaults: { ease: "power2.out", duration: 0.4 }
            });

            const arrowContainer = item.querySelector('.service-arrow-container');
            const text = item.querySelector('.service-text');
            const bg = item.querySelector('.service-bg');
            const overlay = item.querySelector('.service-overlay');

            // Define hover animation steps
            hoverTl
                // Expand to pill shape
                .to(item, {
                    borderRadius: "100px",
                    paddingLeft: "30px",
                    paddingRight: "30px",
                }, 0)
                // Show background and overlay
                .to([bg, overlay], {
                    opacity: 1
                }, 0)
                .to(bg, {
                    scale: 1,
                    duration: 0.5
                }, 0)
                // Change text color
                .to(text, {
                    color: "#ffffff"
                }, 0)
                // Reveal arrow
                .to(arrowContainer, {
                    width: "auto",
                    opacity: 1,
                    marginRight: "12px",
                    duration: 0.3
                }, 0);

            // Mouse enter event
            item.addEventListener('mouseenter', () => {
                item.classList.add('is-hovered');
                hoverTl.play();
            });

            // Mouse leave event
            item.addEventListener('mouseleave', () => {
                hoverTl.reverse();
                setTimeout(() => {
                    if (!item.matches(':hover')) {
                        item.classList.remove('is-hovered');
                    }
                }, 300);
            });
        });
    }

    /* ========================================
       FALLING TEXT ANIMATION (Above Footer)
    ======================================== */

    const fallingTextElement = document.getElementById('falling-text');

    if (fallingTextElement) {
        // Get the original text
        const originalText = fallingTextElement.textContent;

        // Split into words, wrap each word in a container, then split characters
        const words = originalText.split(' ');
        const wrappedWords = words.map(word => {
            const characters = word.split('').map(char => {
                return `<span class="char">${char}</span>`;
            }).join('');
            return `<span class="word-wrapper">${characters}</span>`;
        }).join('<span class="char"> </span>'); // Preserve spaces between words

        // Replace the text content with wrapped characters
        fallingTextElement.innerHTML = wrappedWords;

        // Select all character elements
        const chars = fallingTextElement.querySelectorAll('.char');
        const section = document.querySelector('.falling-text-section');

        // Set initial state: characters start above their final position
        gsap.set(chars, {
            yPercent: -60,    // Start 60% above final position
            rotate: 10,       // Slight rotation
            opacity: 0        // Invisible
        });

        // Create falling animation with scroll trigger
        gsap.to(chars, {
            yPercent: 0,      // Fall down to normal position
            rotate: 0,        // Remove rotation
            opacity: 1,       // Become visible
            ease: 'back.inOut(4)',  // Bounce effect
            stagger: 0.1,     // Each character falls with 0.1s delay (cascading effect)
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',   // Animation starts when section is 80% down viewport
                end: 'bottom 20%',  // Animation ends when 20% from bottom
                scrub: true,        // Linked directly to scroll (smooth)
                markers: false      // Set to true for debugging
            }
        });

        // Optional: Add horizontal scroll effect for the entire text
        // Desktop: more horizontal movement, Mobile: less
        const isMobile = window.innerWidth < 1024;
        const xEnd = isMobile ? -50 : -100;
        const yEnd = isMobile ? 150 : 100;

        gsap.to(fallingTextElement, {
            x: xEnd,
            y: yEnd,
            ease: 'none',
            scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        });
    }

    /* ========================================
       ABOUT STACKED SECTION - DYNAMIC SPACING
    ======================================== */

    const aboutCardsWrapper = document.getElementById('aboutCardsWrapper');

    if (aboutCardsWrapper) {
        const aboutCards = aboutCardsWrapper.querySelectorAll('[data-about-card]');
        const totalCards = aboutCards.length;

        // Function to measure heights and apply stacking formula
        const updateAboutCardSpacing = () => {
            // Find all card inner elements to get max content height
            const cardInnerElements = aboutCardsWrapper.querySelectorAll('[data-card-inner]');
            // Find title wrappers to measure the visible header portion
            const titleWrappers = aboutCardsWrapper.querySelectorAll('.about-card-title-wrapper');

            if (cardInnerElements.length === 0 || titleWrappers.length === 0) return;

            // Find the TALLEST card's inner height
            let maxContentHeight = 0;
            cardInnerElements.forEach(cardInner => {
                const height = cardInner.offsetHeight;
                if (height > maxContentHeight) {
                    maxContentHeight = height;
                }
            });

            // Measure the title wrapper height (includes padding) - this is what stays visible when stacked
            const titleHeight = titleWrappers[0].offsetHeight;

            // Apply stacking formula to each card
            aboutCards.forEach((card, index) => {
                // BlinkPath formula:
                // paddingTop = index * titleHeight (reveals previous card titles)
                // paddingBottom = (totalCards - 1 - index) * titleHeight
                // marginTop = -contentHeight (overlaps cards, hiding descriptions)

                const paddingTop = index * titleHeight;
                const paddingBottom = (totalCards - 1 - index) * titleHeight;
                const marginTop = index === 0 ? 0 : -maxContentHeight;

                // Apply inline styles for dynamic spacing
                card.style.paddingTop = `${paddingTop}px`;
                card.style.paddingBottom = `${paddingBottom}px`;
                card.style.marginTop = `${marginTop}px`;
            });
        };

        // Use ResizeObserver for efficient resize detection
        const resizeObserver = new ResizeObserver(() => {
            updateAboutCardSpacing();
        });

        // Observe the wrapper for any size changes
        resizeObserver.observe(aboutCardsWrapper);

        // Initial measurement after a short delay for rendering
        setTimeout(updateAboutCardSpacing, 100);

        // Also run on window load to ensure all fonts are loaded
        window.addEventListener('load', updateAboutCardSpacing);
    }

    /* ========================================
       METHODOLOGY SECTION - CARD PIN ANIMATIONS
    ======================================== */

    const methodologyCards = document.querySelectorAll('.methodology-card');

    if (methodologyCards.length > 0) {
        // Animate header on scroll
        gsap.from('.methodology-header-content', {
            y: 60,
            opacity: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.methodology-section',
                start: 'top 80%',
            }
        });

        // Stacking card scaling effect (Desktop only)
        ScrollTrigger.matchMedia({
            "(min-width: 1024px)": function() {
                const totalCards = methodologyCards.length;

                methodologyCards.forEach((card, index) => {
                    const cardGrid = card.querySelector('.methodology-card-grid');
                    const imageWrapper = card.querySelector('.methodology-card-image-wrapper');
                    const image = card.querySelector('.methodology-card-image');

                    // Calculate target scale (cards behind get progressively smaller)
                    const targetScale = 1 - (totalCards - index) * 0.05;

                    // Scale down the card as it scrolls past
                    gsap.to(card, {
                        scale: targetScale,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: card,
                            start: 'top top',
                            end: 'bottom top',
                            scrub: true,
                        }
                    });

                    // Image scale-in animation (from 2 to 1)
                    if (image) {
                        gsap.fromTo(image,
                            { scale: 2 },
                            {
                                scale: 1,
                                ease: 'none',
                                scrollTrigger: {
                                    trigger: card,
                                    start: 'top bottom',
                                    end: 'top top',
                                    scrub: true,
                                }
                            }
                        );
                    }

                    // Fade in text from left
                    gsap.from(card.querySelector('.methodology-card-text'), {
                        x: -60,
                        opacity: 0,
                        duration: 1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: card,
                            start: 'top 70%',
                        }
                    });

                    // Fade in image wrapper from right
                    gsap.from(imageWrapper, {
                        x: 60,
                        opacity: 0,
                        duration: 1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: card,
                            start: 'top 70%',
                        }
                    });
                });
            },

            "(max-width: 1023px)": function() {
                // Mobile: Just entrance animations, no pinning
                methodologyCards.forEach((card) => {
                    gsap.from(card.querySelector('.methodology-card-text'), {
                        y: 40,
                        opacity: 0,
                        duration: 0.8,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: card,
                            start: 'top 85%',
                        }
                    });

                    gsap.from(card.querySelector('.methodology-card-image-wrapper'), {
                        y: 40,
                        opacity: 0,
                        duration: 0.8,
                        delay: 0.2,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: card,
                            start: 'top 85%',
                        }
                    });
                });
            }
        });

        console.log('✓ Methodology Card Pin Animations Initialized');
    }

    /* ========================================
       MANIFESTO SECTION ANIMATIONS
    ======================================== */

    const manifestoSection = document.querySelector('.manifesto-section');

    if (manifestoSection) {
        // Animate manifesto title
        gsap.from('.manifesto-title', {
            scrollTrigger: {
                trigger: '.manifesto-section',
                start: "top 70%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            },
            y: 60,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        });

        // Animate subtitle
        gsap.from('.manifesto-subtitle', {
            scrollTrigger: {
                trigger: '.manifesto-intro',
                start: "top 75%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            },
            y: 40,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            delay: 0.2
        });

        // Animate description paragraphs with stagger
        gsap.from('.manifesto-description', {
            scrollTrigger: {
                trigger: '.manifesto-intro',
                start: "top 75%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            },
            y: 30,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            delay: 0.4
        });

        // Animate core values with stagger
        gsap.from('.core-value-item', {
            scrollTrigger: {
                trigger: '.core-values-grid',
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            delay: 0.2
        });

        console.log('✓ Manifesto Section Animations Initialized');
    }

    /* ========================================
       QUOTE SECTION ANIMATIONS
    ======================================== */

    const quoteSection = document.querySelector('.quote-section-wrapper');

    if (quoteSection) {
        // Animate quote label
        gsap.from('.quote-label', {
            scrollTrigger: {
                trigger: '.quote-card',
                start: "top 75%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            },
            y: 20,
            opacity: 0,
            duration: 0.6,
            ease: "power3.out"
        });

        // Animate quote card
        gsap.from('.quote-card', {
            scrollTrigger: {
                trigger: '.quote-card',
                start: "top 75%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            },
            scale: 0.95,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
            delay: 0.2
        });

        // Animate quote text
        gsap.from('.quote-text', {
            scrollTrigger: {
                trigger: '.quote-card',
                start: "top 75%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            },
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            delay: 0.4
        });

        console.log('✓ Quote Section Animations Initialized');
    }

    /* ========================================
       FEATURED WORK SECTION - SCROLL-BASED INTERACTIONS
    ======================================== */

    const featuredWorkSection = document.querySelector('.featured-work-section');

    if (featuredWorkSection) {
        const caseStudyItems = document.querySelectorAll('.case-study-item');
        const featuredImages = document.querySelectorAll('.featured-image');
        const featuredNumber = document.getElementById('featuredNumber');
        const featuredWorkGrid = document.querySelector('.featured-work-grid');
        const featuredWorkRight = document.querySelector('.featured-work-right');

        console.log('Featured Work Section found! Items:', caseStudyItems.length);

        let currentActiveId = null;

        // Function to update active case study and image
        const updateActiveCaseStudy = (caseId) => {
            if (currentActiveId === caseId) return;

            console.log('✅ Switching to case study:', caseId);

            currentActiveId = caseId;

            // Update case study items
            caseStudyItems.forEach(item => {
                if (item.getAttribute('data-case-id') === caseId) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });

            // Update images with smooth transition
            featuredImages.forEach(img => {
                if (img.getAttribute('data-case-id') === caseId) {
                    img.classList.remove('exiting');
                    img.classList.add('active');
                } else {
                    if (img.classList.contains('active')) {
                        img.classList.add('exiting');
                        setTimeout(() => {
                            img.classList.remove('active', 'exiting');
                        }, 400);
                    }
                }
            });

            // Update number with GSAP animation
            gsap.to(featuredNumber, {
                scale: 0.8,
                opacity: 0,
                duration: 0.2,
                ease: "power2.in",
                onComplete: () => {
                    featuredNumber.textContent = caseId;
                    gsap.to(featuredNumber, {
                        scale: 1,
                        opacity: 0.5,
                        duration: 0.3,
                        ease: "back.out(1.7)"
                    });
                }
            });
        };

        // Only setup ScrollTrigger on desktop
        if (window.innerWidth > 1024 && featuredWorkGrid && featuredWorkRight) {

            // Pin the entire grid while scrolling through case studies
            ScrollTrigger.create({
                trigger: featuredWorkSection,
                start: "top top",
                end: () => `+=${featuredWorkSection.offsetHeight - window.innerHeight}`,
                pin: featuredWorkRight,
                pinSpacing: false,
                markers: false,
                id: "featured-work-pin"
            });

            console.log('Setting up pinned ScrollTrigger');

            // Create ScrollTrigger for each case study item
            caseStudyItems.forEach((item, index) => {
                const caseId = item.getAttribute('data-case-id');

                ScrollTrigger.create({
                    trigger: item,
                    start: "top center",
                    end: "bottom center",
                    onEnter: () => {
                        console.log(`📍 Entering: ${caseId}`);
                        updateActiveCaseStudy(caseId);
                    },
                    onEnterBack: () => {
                        console.log(`📍 Entering back: ${caseId}`);
                        updateActiveCaseStudy(caseId);
                    },
                    // markers: true, // Enable to debug
                    id: `case-${caseId}`
                });

                // Optional hover effect
                item.addEventListener('mouseenter', () => {
                    console.log('Hover:', caseId);
                    updateActiveCaseStudy(caseId);
                });

            });
        } else {
            // Mobile: Just activate first item
            console.log('Mobile view - activating first item');
            updateActiveCaseStudy('01');
        }

        // Entrance animation for the sticky image container
        gsap.from('.featured-work-image-container', {
            scrollTrigger: {
                trigger: '.featured-work-section',
                start: "top 70%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            },
            scale: 0.9,
            opacity: 0,
            duration: 1.2,
            ease: "power3.out"
        });

        // Entrance animation for section label
        gsap.from('.featured-work-label', {
            scrollTrigger: {
                trigger: '.featured-work-section',
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            },
            y: 20,
            opacity: 0,
            duration: 0.6,
            ease: "power3.out"
        });

        // Entrance animation for headline
        gsap.from('.featured-work-headline', {
            scrollTrigger: {
                trigger: '.featured-work-section',
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            },
            y: 40,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            delay: 0.2
        });

        // Entrance animation for subhead
        gsap.from('.featured-work-subhead', {
            scrollTrigger: {
                trigger: '.featured-work-section',
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            },
            y: 30,
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
            delay: 0.4
        });
    }

    /* ========================================
       CONSOLE LOG - INITIALIZATION COMPLETE
    ======================================== */

    console.log('%c🎨 Material Lab Brand Kit - Header + Hero Initialized', 'color: #17f7f7; font-size: 16px; font-weight: bold;');
    console.log('%c✓ Grainy Glow Cursor Active', 'color: #17f7f7; font-size: 12px;');
    console.log('%c✓ SVG Ellipse Mask Transition Active', 'color: #17f7f7; font-size: 12px;');
    console.log('%c✓ GSAP Animations Loaded', 'color: #17f7f7; font-size: 12px;');
    console.log('%c✓ Navigation Interactions Ready', 'color: #17f7f7; font-size: 12px;');
    console.log('%c✓ Services Section Initialized', 'color: #17f7f7; font-size: 12px;');
    console.log('%c✓ Methodology Section Initialized', 'color: #17f7f7; font-size: 12px;');
    console.log('%c✓ Manifesto Section Initialized', 'color: #17f7f7; font-size: 12px;');
    console.log('%c✓ Quote Section Initialized', 'color: #17f7f7; font-size: 12px;');
    console.log('%c✓ Featured Work Section Initialized', 'color: #17f7f7; font-size: 12px;');
    console.log('%c✓ Footer Animations Initialized', 'color: #17f7f7; font-size: 12px;');
    console.log('%c✓ Diagonal Typography Scroll Active', 'color: #17f7f7; font-size: 12px;');
});
