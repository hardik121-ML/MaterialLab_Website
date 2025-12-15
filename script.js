/* ========================================
   GSAP ANIMATIONS & INTERACTIONS
   SVG Ellipse Mask Transition System
======================================== */

// Wait for DOM and GSAP to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize GSAP and ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Check for reduced motion preference (WCAG 2.3.3)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        // Disable GSAP animations for users who prefer reduced motion
        gsap.globalTimeline.timeScale(0);
        ScrollTrigger.defaults({ markers: false });
        // Set default duration to 0 for instant transitions
        gsap.defaults({ duration: 0 });
    }

    /* ========================================
       CUSTOM CURSOR (Two-Element System)
       Ring: follows slower (0.5s), scales 3x on hover
       Dot: follows faster (0.1s), disappears on hover
    ======================================== */

    const cursorRing = document.getElementById('cursor-ring');
    const cursorDot = document.getElementById('cursor-dot');
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;

    if (cursorRing && cursorDot && isDesktop) {
        // Set initial position and center transform
        gsap.set(cursorRing, { xPercent: -50, yPercent: -50 });
        gsap.set(cursorDot, { xPercent: -50, yPercent: -50 });

        // Move cursor elements with GSAP - different speeds
        const onMouseMove = (e) => {
            // Ring follows slower (0.5s)
            gsap.to(cursorRing, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.5,
                ease: 'power2.out'
            });

            // Dot follows faster (0.1s)
            gsap.to(cursorDot, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.1,
                ease: 'power2.out'
            });
        };

        // Hover state handlers - apply to both elements with GSAP animations
        const onHoverEnter = () => {
            cursorRing.classList.add('hovering');
            cursorDot.classList.add('hovering');

            // Ring scales up 3x on hover
            gsap.to(cursorRing, {
                scale: 3,
                duration: 0.3,
                ease: 'power2.out'
            });

            // Dot scales down and fades out
            gsap.to(cursorDot, {
                scale: 0,
                opacity: 0,
                duration: 0.2,
                ease: 'power2.out'
            });
        };

        const onHoverLeave = () => {
            cursorRing.classList.remove('hovering');
            cursorDot.classList.remove('hovering');

            // Ring returns to normal
            gsap.to(cursorRing, {
                scale: 1,
                duration: 0.3,
                ease: 'power2.out'
            });

            // Dot scales back up and fades in
            gsap.to(cursorDot, {
                scale: 1,
                opacity: 1,
                duration: 0.2,
                ease: 'power2.out'
            });
        };

        // Add listeners to interactive elements
        const addHoverListeners = () => {
            const interactives = document.querySelectorAll('a, button, input, textarea, .cursor-hover, .interactive, [role="button"]');
            interactives.forEach(el => {
                el.addEventListener('mouseenter', onHoverEnter);
                el.addEventListener('mouseleave', onHoverLeave);
            });
        };

        window.addEventListener('mousemove', onMouseMove);

        // Initial add
        addHoverListeners();

        // Observer for dynamic content
        const observer = new MutationObserver(addHoverListeners);
        observer.observe(document.body, { childList: true, subtree: true });

        console.log('✓ Custom Cursor (Two-Element System) Initialized');
    } else {
        console.log('ℹ Custom Cursor disabled - mobile viewport or cursor elements not found');
    }

    /* ========================================
       KINETIC RHOMBIC GRID (Hero Inline)
    ======================================== */

    const rhombicCanvas = document.getElementById('rhombic-grid');

    if (rhombicCanvas) {
        const ctx = rhombicCanvas.getContext('2d', { alpha: true });

        // Golden ratio
        const phi = (1 + Math.sqrt(5)) / 2;

        // Geometry helpers
        const normalize = (v) => {
            const m = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
            return [v[0] / m, v[1] / m, v[2] / m];
        };

        const distance = (v1, v2) => {
            return Math.sqrt(
                (v1[0] - v2[0]) ** 2 +
                (v1[1] - v2[1]) ** 2 +
                (v1[2] - v2[2]) ** 2
            );
        };

        // Generate Icosahedron vertices
        const icoVerts = [
            [0, 1, phi], [0, 1, -phi], [0, -1, phi], [0, -1, -phi],
            [1, phi, 0], [1, -phi, 0], [-1, phi, 0], [-1, -phi, 0],
            [phi, 0, 1], [phi, 0, -1], [-phi, 0, 1], [-phi, 0, -1]
        ].map(normalize);

        // Generate Dodecahedron vertices
        let dodVerts = [];
        for (let x of [-1, 1]) for (let y of [-1, 1]) for (let z of [-1, 1]) dodVerts.push([x, y, z]);
        for (let i of [-1, 1]) for (let j of [-1, 1]) dodVerts.push([0, i * phi, j / phi]);
        for (let i of [-1, 1]) for (let j of [-1, 1]) dodVerts.push([i / phi, 0, j * phi]);
        for (let i of [-1, 1]) for (let j of [-1, 1]) dodVerts.push([i * phi, j / phi, 0]);
        dodVerts = dodVerts.map(normalize);

        // Combine for Rhombic Triacontahedron
        const vertices = [...icoVerts, ...dodVerts];

        // Generate edges
        const edges = [];
        for (let i = 0; i < vertices.length; i++) {
            for (let j = i + 1; j < vertices.length; j++) {
                const d = distance(vertices[i], vertices[j]);
                if (d > 0.5 && d < 0.7) {
                    edges.push([i, j]);
                }
            }
        }

        // Animation state
        let baseAngleX = 0;
        let baseAngleY = 0;
        let currentMouseX = 0;
        let currentMouseY = 0;
        let rhombicMouseX = 0;
        let rhombicMouseY = 0;

        // Final values
        const lineWidth = 0.8;
        const shapeScale = 1.0;

        // Track mouse for rhombic grid
        window.addEventListener('mousemove', (e) => {
            rhombicMouseX = (e.clientX / window.innerWidth) * 2 - 1;
            rhombicMouseY = (e.clientY / window.innerHeight) * 2 - 1;
        });

        // Render function
        const renderRhombic = () => {
            const size = rhombicCanvas.offsetWidth || controlSize;
            const dpr = window.devicePixelRatio || 1;

            rhombicCanvas.width = size * dpr;
            rhombicCanvas.height = size * dpr;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);

            ctx.clearRect(0, 0, size, size);

            // Update rotation
            baseAngleX += 0.002;
            baseAngleY += 0.003;
            currentMouseX += (rhombicMouseY * 1.5 - currentMouseX) * 0.05;
            currentMouseY += (rhombicMouseX * 1.5 - currentMouseY) * 0.05;

            const angleX = baseAngleX + currentMouseX;
            const angleY = baseAngleY + currentMouseY;

            const cx = size / 2;
            const cy = size / 2;
            const scale = (size / 2) * shapeScale;

            const sinY = Math.sin(angleY);
            const cosY = Math.cos(angleY);
            const sinX = Math.sin(angleX);
            const cosX = Math.cos(angleX);

            // Project 3D to 2D
            const projected = vertices.map(v => {
                const x = v[0] * cosY - v[2] * sinY;
                const z = v[0] * sinY + v[2] * cosY;
                const y = v[1];
                const yNew = y * cosX - z * sinX;
                return { x: cx + x * scale, y: cy + yNew * scale };
            });

            // Draw edges
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = lineWidth;
            ctx.lineCap = 'round';
            ctx.beginPath();
            for (const [v1, v2] of edges) {
                const p1 = projected[v1];
                const p2 = projected[v2];
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
            }
            ctx.stroke();

            requestAnimationFrame(renderRhombic);
        };

        renderRhombic();
        console.log('✓ Kinetic Rhombic Grid Initialized');
    }

    /* ========================================
       IDENTITY PRIMITIVES - Geometry Generators
    ======================================== */

    // Shared helpers (note: phi already defined above for rhombic grid)
    const primNormalize = (v) => {
        const m = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
        return [v[0] / m, v[1] / m, v[2] / m];
    };

    const primDistance = (v1, v2) => {
        return Math.sqrt(
            (v1[0] - v2[0]) ** 2 +
            (v1[1] - v2[1]) ** 2 +
            (v1[2] - v2[2]) ** 2
        );
    };

    // Icosahedron Generator
    const generateIcosahedron = () => {
        const phi = (1 + Math.sqrt(5)) / 2;
        const vertices = [
            [0, 1, phi], [0, 1, -phi], [0, -1, phi], [0, -1, -phi],
            [1, phi, 0], [1, -phi, 0], [-1, phi, 0], [-1, -phi, 0],
            [phi, 0, 1], [phi, 0, -1], [-phi, 0, 1], [-phi, 0, -1]
        ].map(primNormalize);

        const edges = [];
        for (let i = 0; i < 12; i++) {
            for (let j = i + 1; j < 12; j++) {
                const d = primDistance(vertices[i], vertices[j]);
                if (d > 0.9 && d < 1.2) edges.push([i, j]);
            }
        }
        return { vertices, edges };
    };

    // Triakis Icosahedron Generator (Stellated)
    const generateTriakis = () => {
        const icoGeom = generateIcosahedron();
        const vertices = [...icoGeom.vertices];
        const edges = [];

        // Find icosahedron faces
        const faces = [];
        for (let i = 0; i < 12; i++) {
            for (let j = i + 1; j < 12; j++) {
                for (let k = j + 1; k < 12; k++) {
                    const d1 = primDistance(vertices[i], vertices[j]);
                    const d2 = primDistance(vertices[j], vertices[k]);
                    const d3 = primDistance(vertices[k], vertices[i]);
                    if (d1 < 1.2 && d2 < 1.2 && d3 < 1.2) {
                        faces.push([i, j, k]);
                    }
                }
            }
        }

        // Add pyramid vertex for each face
        faces.forEach(face => {
            const v1 = vertices[face[0]];
            const v2 = vertices[face[1]];
            const v3 = vertices[face[2]];

            const cx = (v1[0] + v2[0] + v3[0]) / 3;
            const cy = (v1[1] + v2[1] + v3[1]) / 3;
            const cz = (v1[2] + v2[2] + v3[2]) / 3;

            const height = 1.6;
            const newIdx = vertices.length;
            vertices.push([cx * height, cy * height, cz * height]);

            edges.push([newIdx, face[0]]);
            edges.push([newIdx, face[1]]);
            edges.push([newIdx, face[2]]);
        });

        return { vertices, edges };
    };

    // Great Dodecahedron Generator
    const generateGreatDodecahedron = () => {
        const icoGeom = generateIcosahedron();
        const vertices = [...icoGeom.vertices];
        const edges = [];

        for (let i = 0; i < vertices.length; i++) {
            for (let j = i + 1; j < vertices.length; j++) {
                const d = primDistance(vertices[i], vertices[j]);
                // Connect non-adjacent vertices (distance ~phi)
                if (d > 1.6 && d < 1.8) {
                    edges.push([i, j]);
                }
            }
        }
        return { vertices, edges };
    };

    /* ========================================
       IDENTITY PRIMITIVES - Canvas Renderer
    ======================================== */

    function initPrimitive(canvasId, geometry, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: true });
        const { vertices, edges } = geometry;
        const color = options.color || '#ffffff';
        const lineWidth = options.lineWidth || 0.8;
        const scale = options.scale || 1.0;

        let baseAngleX = 0, baseAngleY = 0;
        let currentMouseX = 0, currentMouseY = 0;
        let primMouseX = 0, primMouseY = 0;

        window.addEventListener('mousemove', (e) => {
            primMouseX = (e.clientX / window.innerWidth) * 2 - 1;
            primMouseY = (e.clientY / window.innerHeight) * 2 - 1;
        });

        // Get size from parent's font-size (matches text height)
        const getParentFontSize = () => {
            const parent = canvas.parentElement;
            if (!parent) return 48;
            const computed = window.getComputedStyle(parent);
            return parseFloat(computed.fontSize) || 48;
        };

        // Update container and canvas size to match parent font-size (2.5x for prominence)
        const updateSize = () => {
            const fontSize = getParentFontSize() * 2.5;
            // Container (canvas wrapper) = 2.5x font size
            canvas.style.width = fontSize + 'px';
            canvas.style.height = fontSize + 'px';
            // Also set the container element size if canvas has a wrapper
            if (canvas.parentElement && canvas.parentElement.classList.contains('primitive-container')) {
                canvas.parentElement.style.width = fontSize + 'px';
                canvas.parentElement.style.height = fontSize + 'px';
            }
        };

        // Initial size + resize listener
        updateSize();
        window.addEventListener('resize', updateSize);

        const render = () => {
            const size = canvas.offsetWidth || 48;
            const dpr = window.devicePixelRatio || 1;

            canvas.width = size * dpr;
            canvas.height = size * dpr;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
            ctx.clearRect(0, 0, size, size);

            baseAngleX += 0.002;
            baseAngleY += 0.003;
            currentMouseX += (primMouseY * 1.5 - currentMouseX) * 0.05;
            currentMouseY += (primMouseX * 1.5 - currentMouseY) * 0.05;

            const angleX = baseAngleX + currentMouseX;
            const angleY = baseAngleY + currentMouseY;
            const cx = size / 2, cy = size / 2;
            const s = (size / 2) * scale;

            const sinY = Math.sin(angleY), cosY = Math.cos(angleY);
            const sinX = Math.sin(angleX), cosX = Math.cos(angleX);

            const projected = vertices.map(v => {
                const x = v[0] * cosY - v[2] * sinY;
                const z = v[0] * sinY + v[2] * cosY;
                const y = v[1];
                const yNew = y * cosX - z * sinX;
                return { x: cx + x * s, y: cy + yNew * s };
            });

            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.lineCap = 'round';
            ctx.beginPath();
            for (const [v1, v2] of edges) {
                ctx.moveTo(projected[v1].x, projected[v1].y);
                ctx.lineTo(projected[v2].x, projected[v2].y);
            }
            ctx.stroke();

            requestAnimationFrame(render);
        };

        render();
        console.log(`✓ Primitive ${canvasId} Initialized (size: ${getParentFontSize()}px)`);
    }

    /* ========================================
       INITIALIZE IDENTITY PRIMITIVES
    ======================================== */

    const icoGeom = generateIcosahedron();
    const triakisGeom = generateTriakis();
    const greatDodecGeom = generateGreatDodecahedron();

    initPrimitive('primitive-services', icoGeom, { color: '#ffffff', scale: 0.75, lineWidth: 1.2 });
    initPrimitive('primitive-about', triakisGeom, { color: '#ffffff', scale: 0.65, lineWidth: 1 });
    initPrimitive('primitive-methodology', greatDodecGeom, { color: '#ffffff', scale: 0.75, lineWidth: 1 });
    initPrimitive('primitive-manifesto', icoGeom, { color: '#ffffff', scale: 0.75, lineWidth: 1 });
    initPrimitive('primitive-falling', triakisGeom, { color: '#17f7f7', scale: 0.65, lineWidth: 1.2 });

    /* ========================================
       SECTION STAR BACKGROUNDS
       Adds depth with subtle star fields
    ======================================== */

    function initSectionStars(canvasId, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: true });
        const starCount = options.starCount || 80;
        const maxSize = options.maxSize || 1.5;
        const twinkleSpeed = options.twinkleSpeed || 0.02;

        let stars = [];
        let animationId = null;
        let time = 0;

        // Generate stars
        function generateStars() {
            stars = [];
            const width = canvas.width;
            const height = canvas.height;

            for (let i = 0; i < starCount; i++) {
                stars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * maxSize + 0.3,
                    phase: Math.random() * Math.PI * 2,
                    speed: Math.random() * 0.5 + 0.5
                });
            }
        }

        // Resize handler
        function handleResize() {
            const rect = canvas.parentElement.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;

            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';
            ctx.scale(dpr, dpr);

            generateStars();
        }

        // Render stars
        function render() {
            const width = canvas.width / (window.devicePixelRatio || 1);
            const height = canvas.height / (window.devicePixelRatio || 1);

            ctx.clearRect(0, 0, width, height);
            time += twinkleSpeed;

            for (let i = 0; i < stars.length; i++) {
                const star = stars[i];
                const twinkle = 0.3 + Math.sin(time * star.speed + star.phase) * 0.7;

                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.6})`;
                ctx.fill();
            }

            animationId = requestAnimationFrame(render);
        }

        // Initialize
        handleResize();
        render();

        // Handle resize with debounce
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(handleResize, 150);
        });

        console.log(`✓ Section Stars ${canvasId} Initialized (${starCount} stars)`);
    }

    // Initialize star backgrounds for different sections
    initSectionStars('stars-services', { starCount: 60, maxSize: 1.2 });
    initSectionStars('stars-methodology', { starCount: 100, maxSize: 1.5 });
    initSectionStars('stars-manifesto', { starCount: 50, maxSize: 1.0 });

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
        const tl = gsap.timeline({ delay: 0.5 }); // Reduced delay for faster appearance

        // Awards badge
        tl.to('.awards-badge', {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power3.out"
        });

        // Main heading - letter by letter reveal
        tl.to('.hero-heading', {
            opacity: 1,
            duration: 0.01
        }, "-=0.3");

        // Split heading into lines for stagger effect
        const headingLines = gsap.utils.toArray('.heading-line');
        headingLines.forEach((line, index) => {
            tl.from(line, {
                y: 60,
                opacity: 0,
                duration: 0.7,
                ease: "power3.out"
            }, `-=${index === 0 ? 0 : 0.3}`);
        });

        // Subheading
        tl.to('.hero-subheading', {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power3.out"
        }, "-=0.4");

        // Brand logos - stagger animation
        tl.to('.brand-logos', {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power3.out"
        }, "-=0.3");

        const logoItems = gsap.utils.toArray('.logo-item');
        tl.from(logoItems, {
            opacity: 0,
            y: 15,
            scale: 0.9,
            duration: 0.4,
            stagger: 0.05,
            ease: "back.out(1.7)"
        }, "-=0.4");

        // Footer
        tl.to('.hero-footer', {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power3.out"
        }, "-=0.5");
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
        // Toggle dropdown and update ARIA
        const toggleDropdown = (open) => {
            if (open === undefined) {
                open = !servicesNavItem.classList.contains('active');
            }
            servicesNavItem.classList.toggle('active', open);
            servicesLink.setAttribute('aria-expanded', open ? 'true' : 'false');
        };

        servicesLink.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleDropdown();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!servicesNavItem.contains(e.target)) {
                toggleDropdown(false);
            }
        });

        // Close dropdown on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && servicesNavItem.classList.contains('active')) {
                toggleDropdown(false);
                servicesLink.focus(); // Return focus to trigger
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
       MAGNETIC BADGE - Physics-Based Attraction
    ======================================== */

    const magneticBadge = document.getElementById('magneticBadge');

    if (magneticBadge) {
        // Physics state
        let badgeVelX = 0;
        let badgeVelY = 0;
        let badgePosX = 0;
        let badgePosY = 0;
        let isInMagneticField = false;
        let animationId = null;

        // Physics constants
        const MAGNETIC_RADIUS = 150; // Distance at which attraction begins
        const ATTRACTION_STRENGTH = 0.08; // How strong the pull is
        const DAMPING = 0.85; // Velocity decay (friction)
        const SPRING_STIFFNESS = 0.15; // Return to center strength
        const MAX_DISPLACEMENT = 25; // Maximum pixels of movement

        // Get badge center position
        const getBadgeCenter = () => {
            const rect = magneticBadge.getBoundingClientRect();
            return {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };
        };

        // Physics simulation loop
        const simulateMagneticPhysics = (mouseX, mouseY) => {
            const center = getBadgeCenter();
            const dx = mouseX - center.x;
            const dy = mouseY - center.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < MAGNETIC_RADIUS) {
                // Inside magnetic field - attract toward cursor
                isInMagneticField = true;
                magneticBadge.classList.add('attracted');

                // Normalized direction to cursor
                const dirX = dx / distance;
                const dirY = dy / distance;

                // Attraction force increases as cursor gets closer
                const attractionForce = (1 - distance / MAGNETIC_RADIUS) * ATTRACTION_STRENGTH;

                // Apply attraction force to velocity
                badgeVelX += dirX * attractionForce * distance * 0.5;
                badgeVelY += dirY * attractionForce * distance * 0.5;
            } else {
                // Outside magnetic field - spring back to center
                isInMagneticField = false;
                magneticBadge.classList.remove('attracted');

                // Spring force toward origin
                badgeVelX -= badgePosX * SPRING_STIFFNESS;
                badgeVelY -= badgePosY * SPRING_STIFFNESS;
            }

            // Apply damping (friction)
            badgeVelX *= DAMPING;
            badgeVelY *= DAMPING;

            // Update position
            badgePosX += badgeVelX;
            badgePosY += badgeVelY;

            // Clamp position to max displacement
            const currentDisplacement = Math.sqrt(badgePosX * badgePosX + badgePosY * badgePosY);
            if (currentDisplacement > MAX_DISPLACEMENT) {
                const scale = MAX_DISPLACEMENT / currentDisplacement;
                badgePosX *= scale;
                badgePosY *= scale;
            }

            // Apply transform with GSAP for smooth rendering
            gsap.set(magneticBadge, {
                x: badgePosX,
                y: badgePosY
            });
        };

        // Mouse tracking
        let currentMouseX = 0;
        let currentMouseY = 0;

        document.addEventListener('mousemove', (e) => {
            currentMouseX = e.clientX;
            currentMouseY = e.clientY;
        });

        // Animation loop
        const animate = () => {
            simulateMagneticPhysics(currentMouseX, currentMouseY);
            animationId = requestAnimationFrame(animate);
        };

        // Start animation
        animate();

        // Hover effects
        magneticBadge.addEventListener('mouseenter', () => {
            gsap.to(magneticBadge, {
                scale: 1.05,
                duration: 0.3,
                ease: "back.out(1.7)"
            });
        });

        magneticBadge.addEventListener('mouseleave', () => {
            gsap.to(magneticBadge, {
                scale: 1,
                duration: 0.4,
                ease: "elastic.out(1, 0.5)"
            });
        });

        // Click handler - scroll to falling text / contact section
        magneticBadge.addEventListener('click', (e) => {
            e.preventDefault();
            const fallingTextSection = document.querySelector('.falling-text-section');
            if (fallingTextSection) {
                fallingTextSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

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
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link[data-section], .mobile-dropdown-item');

    if (mobileMenuToggle && mobileMenuOverlay) {
        // Toggle mobile menu
        const toggleMobileMenu = () => {
            const isOpen = mobileMenuToggle.classList.contains('active');

            mobileMenuToggle.classList.toggle('active');
            mobileMenuOverlay.classList.toggle('active');

            // Lock body scroll when menu is open
            document.body.style.overflow = isOpen ? '' : 'hidden';

            // Animate menu toggle icon
            const spans = mobileMenuToggle.querySelectorAll('span');
            if (!isOpen) {
                gsap.to(spans[0], { rotation: 45, y: 8, duration: 0.3 });
                gsap.to(spans[1], { opacity: 0, duration: 0.2 });
                gsap.to(spans[2], { rotation: -45, y: -8, duration: 0.3 });
            } else {
                gsap.to(spans[0], { rotation: 0, y: 0, duration: 0.3 });
                gsap.to(spans[1], { opacity: 1, duration: 0.2, delay: 0.1 });
                gsap.to(spans[2], { rotation: 0, y: 0, duration: 0.3 });
            }
        };

        mobileMenuToggle.addEventListener('click', toggleMobileMenu);

        // Close button handler
        const mobileMenuClose = document.querySelector('.mobile-menu-close');
        if (mobileMenuClose) {
            mobileMenuClose.addEventListener('click', toggleMobileMenu);
        }

        // Close menu when clicking nav links
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mobileMenuToggle.classList.contains('active')) {
                    toggleMobileMenu();
                }
            });
        });

        // Mobile dropdown accordion toggle
        const mobileDropdownToggle = document.querySelector('.mobile-dropdown-toggle');
        const mobileNavItem = mobileDropdownToggle?.closest('.mobile-nav-item');

        if (mobileDropdownToggle && mobileNavItem) {
            mobileDropdownToggle.addEventListener('click', () => {
                const isExpanded = mobileNavItem.classList.contains('active');
                mobileNavItem.classList.toggle('active');
                mobileDropdownToggle.setAttribute('aria-expanded', !isExpanded ? 'true' : 'false');
            });
        }

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenuToggle.classList.contains('active')) {
                toggleMobileMenu();
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

        // Click-to-Expand Accordion for Service Items
        const serviceItems = document.querySelectorAll('.service-item');
        let currentlyExpanded = null;

        serviceItems.forEach(item => {
            // Pre-set background image from data attribute
            const bgImage = item.getAttribute('data-image');
            const bgDiv = item.querySelector('.service-bg');
            if (bgDiv && bgImage) {
                bgDiv.style.backgroundImage = `url('${bgImage}')`;
            }

            const arrowContainer = item.querySelector('.service-arrow-container');
            const arrow = item.querySelector('.service-arrow-container i');
            const text = item.querySelector('.service-text');
            const bg = item.querySelector('.service-bg');
            const overlay = item.querySelector('.service-overlay');
            const details = item.querySelector('.service-details');

            // Create paused timeline for expand animation
            const expandTl = gsap.timeline({
                paused: true,
                defaults: { ease: "power2.inOut", duration: 0.4 }
            });

            // Define expand animation steps
            expandTl
                // Expand to rounded card shape
                .to(item, {
                    borderRadius: "24px",
                    paddingLeft: "0px",
                    paddingRight: "0px",
                    paddingBottom: "24px",
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
                // Reveal arrow and rotate
                .to(arrowContainer, {
                    width: "auto",
                    opacity: 1,
                    marginRight: "12px",
                    duration: 0.3
                }, 0)
                .to(arrow, {
                    rotation: 180,
                    duration: 0.3
                }, 0)
                // Expand details section
                .to(details, {
                    maxHeight: "500px",
                    opacity: 1,
                    paddingTop: "24px",
                    duration: 0.5
                }, 0.1);

            // Store timeline on element for accordion access
            item._expandTl = expandTl;

            // Toggle function for accordion behavior (used by click and keyboard)
            const toggleServiceItem = () => {
                const isExpanded = item.classList.contains('is-expanded');

                // Close currently expanded item (accordion behavior)
                if (currentlyExpanded && currentlyExpanded !== item) {
                    currentlyExpanded.classList.remove('is-expanded');
                    currentlyExpanded.classList.remove('is-hovered');
                    currentlyExpanded.setAttribute('aria-expanded', 'false');
                    currentlyExpanded._expandTl.reverse();
                }

                // Toggle clicked item
                if (isExpanded) {
                    item.classList.remove('is-expanded');
                    item.classList.remove('is-hovered');
                    item.setAttribute('aria-expanded', 'false');
                    expandTl.reverse();
                    currentlyExpanded = null;
                } else {
                    item.classList.add('is-expanded');
                    item.classList.add('is-hovered');
                    item.setAttribute('aria-expanded', 'true');
                    expandTl.play();
                    currentlyExpanded = item;
                }
            };

            // Click handler for accordion behavior
            item.addEventListener('click', toggleServiceItem);

            // Keyboard handler for accessibility (Enter and Space)
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleServiceItem();
                }
            });

            // Hover effect - show image preview (only when not expanded)
            item.addEventListener('mouseenter', () => {
                if (!item.classList.contains('is-expanded')) {
                    item.classList.add('is-hovered');
                    gsap.to(item, { borderRadius: "24px", duration: 0.3 });
                    gsap.to([bg, overlay], { opacity: 1, duration: 0.3 });
                    gsap.to(bg, { scale: 1, duration: 0.5 });
                    gsap.to(text, { color: "#ffffff", duration: 0.3 });
                }
            });

            item.addEventListener('mouseleave', () => {
                if (!item.classList.contains('is-expanded')) {
                    item.classList.remove('is-hovered');
                    gsap.to(item, { borderRadius: "0px", duration: 0.3 });
                    gsap.to([bg, overlay], { opacity: 0, duration: 0.3 });
                    gsap.to(bg, { scale: 1.1, duration: 0.5 });
                    gsap.to(text, { color: "var(--foreground)", duration: 0.3 });
                }
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
        // Reduced Y movement to keep text within bounds
        const isMobile = window.innerWidth < 1024;
        const xEnd = isMobile ? -30 : -50;
        const yEnd = isMobile ? 40 : 30;

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
       CONSOLE LOG - INITIALIZATION COMPLETE
    ======================================== */

    console.log('%c🎨 Material Lab - Initialized', 'color: #17f7f7; font-size: 16px; font-weight: bold;');
});

// ================================================================================
// PRISM SCENE BACKGROUND - 2D Canvas Light Refraction Animation
// Converted from React/TypeScript to Vanilla JavaScript
// Features: Icosahedron with light refraction, spectral rainbow beams, particles
// ================================================================================

(function initPrismScene() {
    'use strict';

    // --- Feature Detection & Early Exit ---
    var canvas = document.getElementById('prism-canvas');
    if (!canvas) {
        console.warn('PrismScene: Canvas element #prism-canvas not found');
        return;
    }

    var ctx = canvas.getContext('2d');
    if (!ctx) {
        console.warn('PrismScene: 2D context not supported, falling back to static gradient');
        showFallbackBackground(canvas.parentElement);
        return;
    }

    var container = canvas.parentElement;

    // --- Configuration Constants ---
    var OBJECT_SCALE = 108; // Reduced by 20% from 135
    var N_AIR = 1.0;

    // Spectrum colors for light refraction
    var SPECTRUM = [
        { name: 'red',    color: '#ff2a6d', opacity: 0.8, n: 1.42 },
        { name: 'orange', color: '#ff9f0a', opacity: 0.8, n: 1.52 },
        { name: 'yellow', color: '#ffd60a', opacity: 0.8, n: 1.62 },
        { name: 'green',  color: '#05f7a5', opacity: 0.8, n: 1.72 },
        { name: 'blue',   color: '#0a84ff', opacity: 0.9, n: 1.82 },
        { name: 'indigo', color: '#5e5ce6', opacity: 0.9, n: 1.92 },
        { name: 'violet', color: '#bf5af2', opacity: 1.0, n: 2.02 }
    ];

    // --- Quality Tier System ---
    var QualityTier = {
        HIGH:    { maxBounces: 4, starCount: 250, dustCount: 100, subdivisions: 2, smokeEnabled: true },  // MlBrandKit reference: 250 stars
        MEDIUM:  { maxBounces: 3, starCount: 100, dustCount: 50,  subdivisions: 1, smokeEnabled: true },
        LOW:     { maxBounces: 2, starCount: 50,  dustCount: 25,  subdivisions: 1, smokeEnabled: false },
        MINIMAL: { maxBounces: 1, starCount: 25,  dustCount: 0,   subdivisions: 0, smokeEnabled: false }
    };

    // --- Device/Performance Detection ---
    function detectQualityTier() {
        var isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        var isSmallViewport = window.innerWidth < 768;
        var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) return 'MINIMAL';
        if (isMobile && isSmallViewport) return 'LOW';
        if (isMobile) return 'MEDIUM';
        // Desktop always gets HIGH quality for full atmospheric effects
        return 'HIGH';
    }

    var currentTierName = detectQualityTier();
    var currentQuality = QualityTier[currentTierName];

    // --- State Variables ---
    var animationFrameId = null;
    var isPageVisible = true;
    var mouseX = 0;
    var mouseY = 0;
    var smoothMouseX = 0;
    var smoothMouseY = 0;

    // Spring physics state for natural mouse following (from MlBrandKit reference)
    var springX = { pos: 0, vel: 0 };
    var springY = { pos: 0, vel: 0 };

    // Spring constants (Hooke's Law: F = -kx - bv)
    var SPRING_MASS = 2.0;
    var SPRING_STIFFNESS = 80;
    var SPRING_DAMPING = 18;
    var SPRING_DT = 0.016; // 60fps timestep

    var rotationX = 0;
    var rotationY = 0;
    var rotationZ = 0;
    var globalAlpha = 0;
    var time = 0;
    var stars = [];
    var dust = [];
    var noisePattern = null;
    var dpr = 1;
    var width = 0;
    var height = 0;

    // FPS Monitoring
    var fpsMonitor = {
        frameCount: 0,
        lastCheck: performance.now(),
        currentFPS: 60,
        downgraded: false
    };

    // Touch state
    var touchState = {
        active: false,
        identifier: null
    };

    // Geometry
    var VERTS = [];
    var FACES = [];

    // --- Math Helpers ---
    function vec2(x, y) { return { x: x, y: y }; }
    function vec3(x, y, z) { return { x: x, y: y, z: z }; }

    function add(v1, v2) { return { x: v1.x + v2.x, y: v1.y + v2.y }; }
    function sub(v1, v2) { return { x: v1.x - v2.x, y: v1.y - v2.y }; }
    function mul(v, s) { return { x: v.x * s, y: v.y * s }; }
    function dot(v1, v2) { return v1.x * v2.x + v1.y * v2.y; }
    function len(v) { return Math.sqrt(v.x * v.x + v.y * v.y); }
    function norm(v) {
        var l = len(v);
        return l > 0 ? mul(v, 1 / l) : vec2(0, 0);
    }
    function reflect(dir, normal) {
        return sub(dir, mul(normal, 2 * dot(dir, normal)));
    }
    function lerp(start, end, t) { return start * (1 - t) + end * t; }

    // Spring physics for natural, weighty mouse following
    // Uses Hooke's Law: F = -kx - bv (spring force minus damping)
    function updateSpring(spring, target) {
        var displacement = spring.pos - target;
        var springForce = -SPRING_STIFFNESS * displacement;
        var dampingForce = -SPRING_DAMPING * spring.vel;
        var totalForce = springForce + dampingForce;
        var acceleration = totalForce / SPRING_MASS;
        spring.vel += acceleration * SPRING_DT;
        spring.pos += spring.vel * SPRING_DT;
        return spring.pos;
    }

    function distToSegment(p, v, w) {
        var l2 = Math.pow(v.x - w.x, 2) + Math.pow(v.y - w.y, 2);
        if (l2 === 0) return len(sub(p, v));
        var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        return Math.sqrt(Math.pow(p.x - (v.x + t * (w.x - v.x)), 2) + Math.pow(p.y - (v.y + t * (w.y - v.y)), 2));
    }

    // 3D Math
    function sub3(v1, v2) { return { x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z }; }
    function cross3(a, b) { return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x }; }
    function dot3(a, b) { return a.x * b.x + a.y * b.y + a.z * b.z; }
    function norm3(v) {
        var l = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
        return l > 0 ? { x: v.x / l, y: v.y / l, z: v.z / l } : { x: 0, y: 0, z: 0 };
    }

    // Rotation
    function rotateX(v, angle) {
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        return { x: v.x, y: v.y * c - v.z * s, z: v.y * s + v.z * c };
    }
    function rotateY(v, angle) {
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        return { x: v.x * c + v.z * s, y: v.y, z: -v.x * s + v.z * c };
    }
    function rotateZ(v, angle) {
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        return { x: v.x * c - v.y * s, y: v.x * s + v.y * c, z: v.z };
    }

    // Convex Hull
    function crossProduct(o, a, b) { return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x); }

    function getConvexHull(points) {
        if (points.length <= 3) return points;
        var sorted = points.slice().sort(function(a, b) { return a.x === b.x ? a.y - b.y : a.x - b.x; });

        var lower = [];
        for (var i = 0; i < sorted.length; i++) {
            while (lower.length >= 2 && crossProduct(lower[lower.length - 2], lower[lower.length - 1], sorted[i]) <= 0) {
                lower.pop();
            }
            lower.push(sorted[i]);
        }

        var upper = [];
        for (var j = sorted.length - 1; j >= 0; j--) {
            while (upper.length >= 2 && crossProduct(upper[upper.length - 2], upper[upper.length - 1], sorted[j]) <= 0) {
                upper.pop();
            }
            upper.push(sorted[j]);
        }

        lower.pop();
        upper.pop();
        return lower.concat(upper);
    }

    // Ray-Segment Intersection
    function intersectRaySegment(rayOrigin, rayDir, p1, p2) {
        var v1 = sub(rayOrigin, p1);
        var v2 = sub(p2, p1);
        var v3 = vec2(-rayDir.y, rayDir.x);
        var d = dot(v2, v3);
        if (Math.abs(d) < 0.00001) return null;
        var t1 = (v2.x * v1.y - v2.y * v1.x) / d;
        var t2 = dot(v1, v3) / d;
        if (t1 >= 0 && t2 >= 0 && t2 <= 1) return { t: t1, point: add(rayOrigin, mul(rayDir, t1)) };
        return null;
    }

    // Ray-Hull Intersection
    function intersectRayHull(origin, dir, hull, ignoreIndex) {
        ignoreIndex = ignoreIndex || -1;
        var minT = Infinity;
        var point = null;
        var normal = vec2(0, 0);
        var index = -1;
        var center = vec2(0, 0);

        if (hull.length === 0) return null;
        for (var k = 0; k < hull.length; k++) {
            center.x += hull[k].x;
            center.y += hull[k].y;
        }
        center.x /= hull.length;
        center.y /= hull.length;

        for (var i = 0; i < hull.length; i++) {
            if (i === ignoreIndex) continue;
            var p1 = hull[i];
            var p2 = hull[(i + 1) % hull.length];
            var hit = intersectRaySegment(origin, dir, p1, p2);
            if (hit && hit.t < minT && hit.t > 0.001) {
                minT = hit.t;
                point = hit.point;
                index = i;

                var edge = sub(p2, p1);
                var N = norm(vec2(-edge.y, edge.x));
                if (dot(N, sub(p1, center)) < 0) N = mul(N, -1);
                normal = N;
            }
        }
        return point ? { t: minT, point: point, normal: normal, index: index } : null;
    }

    // Ray-Bounds Intersection
    function intersectRayBounds(origin, dir, w, h) {
        var tMin = Infinity;
        var normal = vec2(0, 0);

        if (dir.x !== 0) {
            var t = (0 - origin.x) / dir.x;
            if (t > 0.001 && t < tMin) {
                var y = origin.y + t * dir.y;
                if (y >= 0 && y <= h) { tMin = t; normal = vec2(1, 0); }
            }
        }
        if (dir.x !== 0) {
            var t2 = (w - origin.x) / dir.x;
            if (t2 > 0.001 && t2 < tMin) {
                var y2 = origin.y + t2 * dir.y;
                if (y2 >= 0 && y2 <= h) { tMin = t2; normal = vec2(-1, 0); }
            }
        }
        if (dir.y !== 0) {
            var t3 = (0 - origin.y) / dir.y;
            if (t3 > 0.001 && t3 < tMin) {
                var x = origin.x + t3 * dir.x;
                if (x >= 0 && x <= w) { tMin = t3; normal = vec2(0, 1); }
            }
        }
        if (dir.y !== 0) {
            var t4 = (h - origin.y) / dir.y;
            if (t4 > 0.001 && t4 < tMin) {
                var x2 = origin.x + t4 * dir.x;
                if (x2 >= 0 && x2 <= w) { tMin = t4; normal = vec2(0, -1); }
            }
        }

        if (tMin === Infinity) return null;
        return { t: tMin, point: add(origin, mul(dir, tMin)), normal: normal };
    }

    // Refraction
    function refract2D(dir, normal, n1, n2) {
        var N = normal;
        var cosI = -dot(dir, N);
        if (cosI < 0) { N = mul(N, -1); cosI = -dot(dir, N); }
        var eta = n1 / n2;
        var sinT2 = eta * eta * (1.0 - cosI * cosI);
        if (sinT2 > 1.0) return null;
        var cosT = Math.sqrt(1.0 - sinT2);
        return norm(add(mul(dir, eta), mul(N, eta * cosI - cosT)));
    }

    // --- Geometry Generation ---
    var t_val = (1.0 + Math.sqrt(5.0)) / 2.0;
    var BASE_VERTS = [
        vec3(-1, t_val, 0), vec3(1, t_val, 0), vec3(-1, -t_val, 0), vec3(1, -t_val, 0),
        vec3(0, -1, t_val), vec3(0, 1, t_val), vec3(0, -1, -t_val), vec3(0, 1, -t_val),
        vec3(t_val, 0, -1), vec3(t_val, 0, 1), vec3(-t_val, 0, -1), vec3(-t_val, 0, 1)
    ];
    var BASE_FACES = [
        [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
        [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
        [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
        [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
    ];

    function seededRandom(seed) {
        var x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    function generateGeometry(subdivisionLevel) {
        VERTS = [];
        FACES = [];

        // Normalize base vertices
        for (var i = 0; i < BASE_VERTS.length; i++) {
            var v = BASE_VERTS[i];
            var l = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
            VERTS.push({ x: v.x / l, y: v.y / l, z: v.z / l });
        }

        for (var j = 0; j < BASE_FACES.length; j++) {
            FACES.push(BASE_FACES[j].slice());
        }

        // Subdivide
        function subdivide(currentVerts, currentFaces) {
            var newVerts = currentVerts.slice();
            var newFaces = [];
            var midPointCache = {};

            function getMidPointIndex(i1, i2) {
                var key = i1 < i2 ? i1 + '-' + i2 : i2 + '-' + i1;
                if (midPointCache[key] !== undefined) return midPointCache[key];
                var v1 = newVerts[i1];
                var v2 = newVerts[i2];
                var mid = { x: (v1.x + v2.x) / 2, y: (v1.y + v2.y) / 2, z: (v1.z + v2.z) / 2 };
                var l = Math.sqrt(mid.x * mid.x + mid.y * mid.y + mid.z * mid.z);
                var idx = newVerts.length;
                newVerts.push({ x: mid.x / l, y: mid.y / l, z: mid.z / l });
                midPointCache[key] = idx;
                return idx;
            }

            for (var f = 0; f < currentFaces.length; f++) {
                var face = currentFaces[f];
                var i0 = face[0], i1 = face[1], i2 = face[2];
                var a = getMidPointIndex(i0, i1);
                var b = getMidPointIndex(i1, i2);
                var c = getMidPointIndex(i2, i0);
                newFaces.push([i0, a, c], [i1, b, a], [i2, c, b], [a, b, c]);
            }
            return { v: newVerts, f: newFaces };
        }

        var mesh = { v: VERTS, f: FACES };
        for (var s = 0; s < subdivisionLevel; s++) {
            mesh = subdivide(mesh.v, mesh.f);
        }
        VERTS = mesh.v;
        FACES = mesh.f;

        // Add procedural displacement
        VERTS = VERTS.map(function(v, idx) {
            var seed = idx * 999.9;
            var n1 = seededRandom(seed);
            var n2 = seededRandom(seed * 7.13);
            var n3 = seededRandom(seed * 1.41);
            var n4 = seededRandom(seed * 0.2);
            var scale = 1.0;
            if (n1 < 0.35) scale -= 0.15 + (n1 * 0.15);
            else if (n1 > 0.75) scale += 0.1 + (n2 * 0.05);
            scale += (n3 - 0.5) * 0.06;
            scale += (n4 - 0.5) * 0.12;
            return { x: v.x * scale, y: v.y * scale, z: v.z * scale };
        });
    }

    // --- Particle System ---
    function Particle(w, h, isDust) {
        this.isDust = isDust;
        this.x = (Math.random() - 0.5) * w * (isDust ? 1.5 : 2.5);
        this.y = (Math.random() - 0.5) * h * (isDust ? 1.5 : 2.5);
        this.origX = this.x;
        this.origY = this.y;
        this.z = Math.random() * w;
        this.size = isDust ? Math.random() * 2.5 : Math.random() * 2.0 + 0.5;  // Larger, more visible stars
        this.blinkSpeed = 0.01 + Math.random() * 0.04;
        this.phase = Math.random() * Math.PI * 2;
        this.drift = { x: (Math.random() - 0.5) * 0.2, y: (Math.random() - 0.5) * 0.2 };
    }

    Particle.prototype.update = function(parallaxX, parallaxY) {
        this.phase += this.blinkSpeed;
        if (this.isDust) {
            this.x += this.drift.x;
            this.y += this.drift.y;
        } else {
            var depthFactor = 0.05 + (1000 / (1000 + this.z)) * 0.1;
            this.x = this.origX - parallaxX * depthFactor;
            this.y = this.origY - parallaxY * depthFactor;
        }
    };

    Particle.prototype.draw = function(ctx, w, h, beams) {
        var scale = 1000 / (1000 + this.z);
        var sx = w / 2 + this.x * scale;
        var sy = h / 2 + this.y * scale;

        if (sx < -50 || sx > w + 50 || sy < -50 || sy > h + 50) return;

        var alpha = 0.35 + Math.sin(this.phase) * 0.45;  // Brighter stars (range 0-0.8)

        if (this.isDust) {
            alpha = 0.08;  // Slightly more visible dust
            for (var b = 0; b < beams.length; b++) {
                var d = distToSegment({ x: sx, y: sy }, beams[b].p1, beams[b].p2);
                if (d < 35) {
                    alpha += (1.0 - d / 35) * 0.8;
                }
            }
        }

        ctx.beginPath();
        ctx.arc(sx, sy, this.size * scale, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, ' + Math.min(1, alpha) + ')';
        ctx.fill();
    };

    // --- Noise Texture for Volumetric Effects ---
    function createNoiseTexture() {
        var cvs = document.createElement('canvas');
        cvs.width = 256;
        cvs.height = 256;
        var cx = cvs.getContext('2d');
        if (!cx) return null;

        cx.fillStyle = '#000000';
        cx.fillRect(0, 0, 256, 256);

        for (var i = 0; i < 60; i++) {
            var x = Math.random() * 256;
            var y = Math.random() * 256;
            var r = 20 + Math.random() * 60;
            var g = cx.createRadialGradient(x, y, 0, x, y, r);
            g.addColorStop(0, 'rgba(255,255,255, ' + (0.05 + Math.random() * 0.05) + ')');
            g.addColorStop(1, 'rgba(0,0,0,0)');
            cx.fillStyle = g;
            cx.beginPath();
            cx.arc(x, y, r, 0, Math.PI * 2);
            cx.fill();
        }
        return cvs;
    }

    // --- Fallback Background ---
    function showFallbackBackground(containerEl) {
        containerEl.style.background = 'radial-gradient(ellipse at center, #0a0a0a 0%, #050505 50%, #000000 100%)';
    }

    // --- Initialize Particles ---
    function initializeParticles(w, h) {
        stars = [];
        dust = [];
        for (var i = 0; i < currentQuality.starCount; i++) {
            stars.push(new Particle(w, h, false));
        }
        for (var j = 0; j < currentQuality.dustCount; j++) {
            dust.push(new Particle(w, h, true));
        }
    }

    // --- Resize Handler ---
    var resizeTimeout = null;
    function handleResize() {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            var containerRect = container.getBoundingClientRect();
            width = Math.max(320, Math.min(3840, containerRect.width));
            height = Math.max(480, Math.min(2160, containerRect.height));
            dpr = Math.min(window.devicePixelRatio || 1, 2);

            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';

            initializeParticles(width, height);
            mouseX = width / 2;
            mouseY = height / 2;
            smoothMouseX = mouseX;
            smoothMouseY = mouseY;
            // Initialize spring positions
            springX.pos = mouseX;
            springY.pos = mouseY;
            springX.vel = 0;
            springY.vel = 0;
        }, 150);
    }

    // --- Mouse Handler ---
    function handleMouseMove(e) {
        var rect = canvas.getBoundingClientRect();
        var padding = 20;
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        mouseX = Math.max(padding, Math.min(rect.width - padding, x));
        mouseY = Math.max(padding, Math.min(rect.height - padding, y));
    }

    // --- Touch Handlers ---
    function handleTouchStart(e) {
        if (touchState.active) return;
        var touch = e.touches[0];
        var rect = canvas.getBoundingClientRect();

        touchState.active = true;
        touchState.identifier = touch.identifier;
        mouseX = touch.clientX - rect.left;
        mouseY = touch.clientY - rect.top;
    }

    function handleTouchMove(e) {
        if (!touchState.active) return;

        for (var i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === touchState.identifier) {
                var touch = e.changedTouches[i];
                var rect = canvas.getBoundingClientRect();
                var padding = 20;

                mouseX = touch.clientX - rect.left;
                mouseY = touch.clientY - rect.top;
                mouseX = Math.max(padding, Math.min(rect.width - padding, mouseX));
                mouseY = Math.max(padding, Math.min(rect.height - padding, mouseY));

                e.preventDefault();
                break;
            }
        }
    }

    function handleTouchEnd(e) {
        for (var i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === touchState.identifier) {
                touchState.active = false;
                touchState.identifier = null;
                break;
            }
        }
    }

    // --- Visibility Handler ---
    function handleVisibilityChange() {
        isPageVisible = !document.hidden;
        if (isPageVisible && !animationFrameId) {
            fpsMonitor.lastCheck = performance.now();
            animationFrameId = requestAnimationFrame(render);
        } else if (!isPageVisible && animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    // --- Quality Downgrade ---
    function downgradeQuality() {
        if (currentTierName === 'HIGH') {
            currentTierName = 'MEDIUM';
        } else if (currentTierName === 'MEDIUM') {
            currentTierName = 'LOW';
        } else if (currentTierName === 'LOW') {
            currentTierName = 'MINIMAL';
        }
        currentQuality = QualityTier[currentTierName];
        generateGeometry(currentQuality.subdivisions);
        initializeParticles(width, height);
        console.log('%c⚡ PrismScene: Quality downgraded to ' + currentTierName, 'color: #ff9f0a; font-size: 12px;');
    }

    // --- Helper Functions for Drawing ---
    function hexToRgbaStr(hex, alpha) {
        var r = 0, g = 0, b = 0;
        if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length === 7) {
            r = parseInt(hex.substring(1, 3), 16);
            g = parseInt(hex.substring(3, 5), 16);
            b = parseInt(hex.substring(5, 7), 16);
        }
        return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
    }

    function getEdgeColor(c) {
        if (c.startsWith('#')) return hexToRgbaStr(c, 0);
        if (c.startsWith('rgba')) return c.replace(/[\d\.]+\)$/, '0)');
        if (c.startsWith('rgb')) return c.replace(')', ', 0)').replace('rgb', 'rgba');
        return 'rgba(0,0,0,0)';
    }

    // Multi-layer volumetric beam rendering with proper edge fading
    function drawVolumetricBeam(ctx, start, end, color, widthPx, alpha, hasSmoke) {
        var dx = end.x - start.x;
        var dy = end.y - start.y;
        var length = Math.sqrt(dx * dx + dy * dy);
        var angle = Math.atan2(dy, dx);
        var edgeColor = getEdgeColor(color);

        ctx.save();
        ctx.translate(start.x, start.y);
        ctx.rotate(angle);
        ctx.globalCompositeOperation = 'lighter';

        // Outer soft glow layer (wider, more diffuse) - HIGH/MEDIUM only
        if (currentTierName === 'HIGH' || currentTierName === 'MEDIUM') {
            var outerWidth = widthPx * 2.5;
            var outerGrad = ctx.createLinearGradient(0, -outerWidth / 2, 0, outerWidth / 2);
            outerGrad.addColorStop(0, 'rgba(0,0,0,0)');
            outerGrad.addColorStop(0.2, edgeColor);
            outerGrad.addColorStop(0.5, color);
            outerGrad.addColorStop(0.8, edgeColor);
            outerGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = outerGrad;
            ctx.globalAlpha = alpha * 0.15;
            ctx.fillRect(0, -outerWidth / 2, length, outerWidth);
        }

        // Main diffuse beam layer
        var mainGrad = ctx.createLinearGradient(0, -widthPx / 2, 0, widthPx / 2);
        mainGrad.addColorStop(0, edgeColor);
        mainGrad.addColorStop(0.15, edgeColor);
        mainGrad.addColorStop(0.5, color);
        mainGrad.addColorStop(0.85, edgeColor);
        mainGrad.addColorStop(1, edgeColor);
        ctx.fillStyle = mainGrad;
        ctx.globalAlpha = alpha;
        ctx.fillRect(0, -widthPx / 2, length, widthPx);

        // Hot center core - HIGH only
        if (currentTierName === 'HIGH') {
            var coreWidth = widthPx * 0.3;
            var coreGrad = ctx.createLinearGradient(0, -coreWidth / 2, 0, coreWidth / 2);
            coreGrad.addColorStop(0, edgeColor);
            coreGrad.addColorStop(0.3, color);
            coreGrad.addColorStop(0.5, '#ffffff');
            coreGrad.addColorStop(0.7, color);
            coreGrad.addColorStop(1, edgeColor);
            ctx.fillStyle = coreGrad;
            ctx.globalAlpha = alpha * 0.4;
            ctx.fillRect(0, -coreWidth / 2, length, coreWidth);
        }

        // Smoke texture overlay
        if (hasSmoke && noisePattern && currentQuality.smokeEnabled) {
            ctx.globalAlpha = alpha * 0.65;
            ctx.globalCompositeOperation = 'overlay';
            var pattern = ctx.createPattern(noisePattern, 'repeat');
            if (pattern) {
                var offset = (time * 20) % 256;
                ctx.translate(-offset, 0);
                ctx.fillStyle = pattern;
                ctx.fillRect(offset, -widthPx / 2, length, widthPx);
            }
        }

        ctx.restore();
    }

    function drawFlare(ctx, pos, color, scale, isExit) {
        var rad = (isExit ? 60 : 20) * scale * dpr;
        var g = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, rad);
        g.addColorStop(0, isExit ? '#ffffff' : 'rgba(255,255,255,0.9)');
        g.addColorStop(isExit ? 0.2 : 0.4, color);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.globalCompositeOperation = 'lighter';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, rad, 0, Math.PI * 2);
        ctx.fill();
    }

    // --- Main Render Function ---
    function render() {
        if (!isPageVisible) return;

        var canvasWidth = canvas.width;
        var canvasHeight = canvas.height;

        // FPS Monitoring
        fpsMonitor.frameCount++;
        var now = performance.now();
        var elapsed = now - fpsMonitor.lastCheck;
        if (elapsed >= 1000) {
            fpsMonitor.currentFPS = (fpsMonitor.frameCount * 1000) / elapsed;
            fpsMonitor.frameCount = 0;
            fpsMonitor.lastCheck = now;

            if (fpsMonitor.currentFPS < 25 && !fpsMonitor.downgraded) {
                downgradeQuality();
                fpsMonitor.downgraded = true;
            }
        }

        time += 0.005;

        // Spring physics mouse interpolation (natural deceleration like MlBrandKit)
        smoothMouseX = updateSpring(springX, mouseX);
        smoothMouseY = updateSpring(springY, mouseY);

        var mx = smoothMouseX * dpr;
        var my = smoothMouseY * dpr;
        var center = vec2(canvasWidth / 2, canvasHeight / 2);

        // Update rotation
        rotationX += 0.0005 + (smoothMouseY - height / 2) * 0.000001;
        rotationY += 0.0010 + (smoothMouseX - width / 2) * 0.000001;

        // 1. Draw Background
        var bgGrad = ctx.createRadialGradient(canvasWidth / 2, canvasHeight / 2, 0, canvasWidth / 2, canvasHeight / 2, canvasWidth * 1.2);
        bgGrad.addColorStop(0, '#0a0a0a');
        bgGrad.addColorStop(0.4, '#050505');
        bgGrad.addColorStop(1, '#000000');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // 2. Transform geometry
        var scale = OBJECT_SCALE * dpr;
        var transformed3D = VERTS.map(function(v) {
            var rv = rotateX(v, rotationX);
            rv = rotateY(rv, rotationY);
            rv = rotateZ(rv, rotationZ);
            return rv;
        });

        var projectedVerts = transformed3D.map(function(v) {
            return vec2(center.x + v.x * scale, center.y + v.y * scale);
        });

        var mouseVec = sub(center, vec2(mx, my));
        var rayDir = norm(mouseVec);
        var lightDir = norm3({ x: -rayDir.x, y: -rayDir.y, z: 0.8 });

        // 3. Draw Stars
        var parallaxX = smoothMouseX - width / 2;
        var parallaxY = smoothMouseY - height / 2;
        for (var si = 0; si < stars.length; si++) {
            stars[si].update(parallaxX, parallaxY);
            stars[si].draw(ctx, canvasWidth, canvasHeight, []);
        }

        // 4. Draw Mesh (back faces first, then front)
        var facesWithDepth = FACES.map(function(faceIndices) {
            var z = 0;
            for (var fi = 0; fi < faceIndices.length; fi++) {
                z += transformed3D[faceIndices[fi]].z;
            }
            z /= faceIndices.length;

            var v0 = transformed3D[faceIndices[0]];
            var v1 = transformed3D[faceIndices[1]];
            var v2 = transformed3D[faceIndices[2]];
            var edge1 = sub3(v1, v0);
            var edge2 = sub3(v2, v0);
            var normal = norm3(cross3(edge1, edge2));
            var viewDot = Math.abs(normal.z);
            var fresnel = 1.0 - viewDot;
            var intensity = Math.max(0, dot3(normal, lightDir));

            var p0 = projectedVerts[faceIndices[0]];
            var p1 = projectedVerts[faceIndices[1]];
            var p2 = projectedVerts[faceIndices[2]];
            var area = (p1.x - p0.x) * (p1.y + p0.y) +
                       (p2.x - p1.x) * (p2.y + p1.y) +
                       (p0.x - p2.x) * (p0.y + p2.y);

            return { indices: faceIndices, z: z, isFront: area < 0, intensity: intensity, fresnel: fresnel };
        }).sort(function(a, b) { return a.z - b.z; });

        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        // Draw back faces
        for (var bf = 0; bf < facesWithDepth.length; bf++) {
            var f = facesWithDepth[bf];
            if (f.isFront) continue;
            var pts = f.indices.map(function(idx) { return projectedVerts[idx]; });
            ctx.beginPath();
            ctx.moveTo(pts[0].x, pts[0].y);
            ctx.lineTo(pts[1].x, pts[1].y);
            ctx.lineTo(pts[2].x, pts[2].y);
            ctx.closePath();
            ctx.strokeStyle = 'rgba(23, 247, 247, 0.04)';
            ctx.lineWidth = 0.5 * dpr;
            ctx.stroke();
        }

        // Draw front faces
        for (var ff = 0; ff < facesWithDepth.length; ff++) {
            var face = facesWithDepth[ff];
            if (!face.isFront) continue;
            var points = face.indices.map(function(idx) { return projectedVerts[idx]; });
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            ctx.lineTo(points[1].x, points[1].y);
            ctx.lineTo(points[2].x, points[2].y);
            ctx.closePath();

            var baseFill = 0.02;
            var specular = face.intensity * 0.25;
            var fresnelGlow = face.fresnel * 0.15;
            var fillOpacity = baseFill + specular + fresnelGlow;
            ctx.fillStyle = 'rgba(23, 247, 247, ' + fillOpacity + ')';
            ctx.fill();

            var strokeOpacity = 0.05 + face.fresnel * 0.3 + face.intensity * 0.2;
            ctx.strokeStyle = 'rgba(23, 247, 247, ' + strokeOpacity + ')';
            ctx.lineWidth = 0.5 * dpr;
            ctx.stroke();
        }

        // 5. Draw Convex Hull Outline
        var hull = getConvexHull(projectedVerts);
        if (hull.length > 0) {
            ctx.beginPath();
            ctx.moveTo(hull[0].x, hull[0].y);
            for (var hi = 1; hi < hull.length; hi++) {
                ctx.lineTo(hull[hi].x, hull[hi].y);
            }
            ctx.closePath();
            ctx.lineWidth = 2.0 * dpr;
            ctx.strokeStyle = '#17f7f7';
            ctx.shadowBlur = 30;  // Increased for more atmospheric glow
            ctx.shadowColor = '#17f7f7';
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // 6. Ray Tracing and Light Beams
        var activeBeams = [];
        var pulse = 0.9 + Math.sin(time * 3) * 0.1;

        function traceSpectralRay(startPoint, direction, band, depth, currentAlpha) {
            if (depth <= 0 || currentAlpha < 0.01) return;

            var hullHit = intersectRayHull(add(startPoint, mul(direction, 1.0)), direction, hull, -1);
            var wallHit = intersectRayBounds(add(startPoint, mul(direction, 1.0)), direction, canvasWidth, canvasHeight);

            var target = null;
            var type = 'none';

            if (hullHit && wallHit) {
                if (hullHit.t < wallHit.t) { target = hullHit; type = 'hull'; }
                else { target = wallHit; type = 'wall'; }
            } else if (hullHit) { target = hullHit; type = 'hull'; }
            else if (wallHit) { target = wallHit; type = 'wall'; }

            if (!target) return;

            var modAlpha = currentAlpha * pulse;
            activeBeams.push({ p1: startPoint, p2: target.point });

            drawVolumetricBeam(ctx, startPoint, target.point, band.color, 70 * dpr, modAlpha * 0.5, true);  // Wider, softer beams

            if (type === 'wall') {
                drawFlare(ctx, target.point, band.color, 0.8 * modAlpha, false);
                var dReflect = reflect(direction, target.normal);
                traceSpectralRay(target.point, dReflect, band, depth - 1, currentAlpha * 0.8);
            } else if (type === 'hull' && hullHit) {
                drawFlare(ctx, target.point, band.color, 0.8 * modAlpha, false);
                var dIn = refract2D(direction, hullHit.normal, N_AIR, band.n);
                if (!dIn) {
                    var dReflectInternal = reflect(direction, hullHit.normal);
                    traceSpectralRay(target.point, dReflectInternal, band, depth - 1, currentAlpha * 0.6);
                    return;
                }
                var exitHit = intersectRayHull(add(hullHit.point, mul(dIn, 0.1)), dIn, hull, hullHit.index);
                if (!exitHit) return;

                // Internal beam
                ctx.beginPath();
                ctx.moveTo(hullHit.point.x, hullHit.point.y);
                ctx.lineTo(exitHit.point.x, exitHit.point.y);
                ctx.strokeStyle = band.color;
                ctx.lineWidth = 2 * dpr;
                ctx.globalAlpha = currentAlpha * 0.8 * pulse;
                ctx.stroke();

                var dOut = refract2D(dIn, exitHit.normal, band.n, N_AIR);
                if (!dOut) return;
                traceSpectralRay(exitHit.point, dOut, band, depth - 1, currentAlpha * 0.9);
            }
        }

        var mouse = vec2(mx, my);
        var entryHit = intersectRayHull(mouse, rayDir, hull, -1);
        var targetAlpha = entryHit ? 1.0 : 0.0;
        globalAlpha += (targetAlpha - globalAlpha) * 0.1;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        var beamEnd = entryHit ? entryHit.point : add(mouse, mul(rayDir, Math.max(canvasWidth, canvasHeight)));
        activeBeams.push({ p1: mouse, p2: beamEnd });

        // Main white beam
        if (globalAlpha > 0.001) {
            drawVolumetricBeam(ctx, mouse, beamEnd, '#ffffff', 15 * dpr, 0.7, true);  // Wider, softer main beam
        }

        if (entryHit) {
            drawFlare(ctx, entryHit.point, '#ffffff', 1.5, false);
        }

        // Spectral rays
        if (entryHit && globalAlpha > 0.01) {
            for (var sp = 0; sp < SPECTRUM.length; sp++) {
                var band = SPECTRUM[sp];
                var dIn = refract2D(rayDir, entryHit.normal, N_AIR, band.n);
                if (!dIn) continue;
                var exitHit = intersectRayHull(add(entryHit.point, mul(dIn, 0.1)), dIn, hull, entryHit.index);
                if (!exitHit) continue;

                // Internal beam
                ctx.beginPath();
                ctx.moveTo(entryHit.point.x, entryHit.point.y);
                ctx.lineTo(exitHit.point.x, exitHit.point.y);
                ctx.strokeStyle = band.color;
                ctx.lineWidth = 2 * dpr;
                ctx.globalAlpha = band.opacity * 0.6 * globalAlpha * pulse;
                ctx.stroke();

                drawFlare(ctx, exitHit.point, band.color, 1.0, true);

                var dOut = refract2D(dIn, exitHit.normal, band.n, N_AIR);
                if (dOut) {
                    traceSpectralRay(exitHit.point, dOut, band, currentQuality.maxBounces, globalAlpha);
                }
            }
        }

        // 7. Draw Dust (volumetric)
        ctx.globalCompositeOperation = 'source-over';
        for (var di = 0; di < dust.length; di++) {
            dust[di].update(0, 0);
            dust[di].draw(ctx, canvasWidth, canvasHeight, activeBeams);
        }

        ctx.restore();

        animationFrameId = requestAnimationFrame(render);
    }

    // --- Initialize ---
    function init() {
        console.log('%c✓ PrismScene initializing... (Quality: ' + currentTierName + ')', 'color: #17f7f7; font-size: 12px;');

        // Generate geometry
        generateGeometry(currentQuality.subdivisions);

        // Create noise texture
        noisePattern = createNoiseTexture();

        // Initial resize
        var containerRect = container.getBoundingClientRect();
        width = containerRect.width;
        height = containerRect.height;
        dpr = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        mouseX = width / 2;
        mouseY = height / 2;
        smoothMouseX = mouseX;
        smoothMouseY = mouseY;
        // Initialize spring positions
        springX.pos = mouseX;
        springY.pos = mouseY;
        springX.vel = 0;
        springY.vel = 0;

        // Initialize particles
        initializeParticles(width, height);

        // Event listeners
        window.addEventListener('resize', handleResize, false);
        window.addEventListener('mousemove', handleMouseMove, false);
        canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd, { passive: true });
        canvas.addEventListener('touchcancel', handleTouchEnd, { passive: true });
        document.addEventListener('visibilitychange', handleVisibilityChange, false);

        // Handle reduced motion preference
        var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        prefersReducedMotion.addEventListener('change', function(e) {
            if (e.matches) {
                currentTierName = 'MINIMAL';
                currentQuality = QualityTier.MINIMAL;
                generateGeometry(currentQuality.subdivisions);
                initializeParticles(width, height);
            }
        });

        // Start render loop
        animationFrameId = requestAnimationFrame(render);

        console.log('%c✓ PrismScene animation started!', 'color: #17f7f7; font-size: 12px;');
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', function() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
        canvas.removeEventListener('touchcancel', handleTouchEnd);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    });

    // Start
    init();
})();

// ========================================
// KINETIC GRID - Footer Background
// ========================================
(function initKineticGrid() {
    const canvas = document.getElementById('kinetic-grid-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const footer = document.querySelector('.ml-footer');
    if (!footer) return;

    // Grid configuration - Dense square grid
    const CELL_SIZE = 32; // Square cells - smaller = denser
    const MOUSE_RADIUS = 100;
    const FORCE_STRENGTH = 45;
    const DAMPING = 0.85;
    const SPRING = 0.08;

    let nodes = [];
    let cols = 1;
    let rows = 1;
    let mouse = { x: -1000, y: -1000 };
    let animationId = null;
    let isAnimating = false;

    // Resize canvas
    function resize() {
        const rect = footer.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        // Calculate cols/rows based on cell size for square grid
        cols = Math.ceil(rect.width / CELL_SIZE) + 1;
        rows = Math.ceil(rect.height / CELL_SIZE) + 1;
        initNodes();
    }

    // Initialize grid nodes - square spacing
    function initNodes() {
        nodes = [];
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = col * CELL_SIZE;
                const y = row * CELL_SIZE;
                nodes.push({
                    x: x,
                    y: y,
                    originX: x,
                    originY: y,
                    vx: 0,
                    vy: 0
                });
            }
        }
    }

    // Update physics
    function updatePhysics() {
        nodes.forEach(node => {
            // Calculate distance to mouse
            const dx = mouse.x - node.x;
            const dy = mouse.y - node.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Apply force if within radius
            if (dist < MOUSE_RADIUS && dist > 0) {
                const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
                const angle = Math.atan2(dy, dx);
                node.vx -= Math.cos(angle) * force * FORCE_STRENGTH * 0.1;
                node.vy -= Math.sin(angle) * force * FORCE_STRENGTH * 0.1;
            }

            // Spring back to origin
            node.vx += (node.originX - node.x) * SPRING;
            node.vy += (node.originY - node.y) * SPRING;

            // Apply damping
            node.vx *= DAMPING;
            node.vy *= DAMPING;

            // Update position
            node.x += node.vx;
            node.y += node.vy;
        });
    }

    // Draw grid
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)'; // Light gray grid
        ctx.lineWidth = 1;

        // Draw horizontal lines
        for (let row = 0; row < rows; row++) {
            ctx.beginPath();
            for (let col = 0; col < cols; col++) {
                const node = nodes[row * cols + col];
                if (col === 0) {
                    ctx.moveTo(node.x, node.y);
                } else {
                    ctx.lineTo(node.x, node.y);
                }
            }
            ctx.stroke();
        }

        // Draw vertical lines
        for (let col = 0; col < cols; col++) {
            ctx.beginPath();
            for (let row = 0; row < rows; row++) {
                const node = nodes[row * cols + col];
                if (row === 0) {
                    ctx.moveTo(node.x, node.y);
                } else {
                    ctx.lineTo(node.x, node.y);
                }
            }
            ctx.stroke();
        }
    }

    // Animation loop
    function animate() {
        if (!isAnimating) return;
        updatePhysics();
        draw();
        animationId = requestAnimationFrame(animate);
    }

    // Start animation
    function startAnimation() {
        if (!isAnimating) {
            isAnimating = true;
            animate();
        }
    }

    // Stop animation
    function stopAnimation() {
        isAnimating = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }

    // Mouse tracking (relative to footer)
    footer.addEventListener('mousemove', (e) => {
        const rect = footer.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    footer.addEventListener('mouseleave', () => {
        mouse.x = -1000;
        mouse.y = -1000;
    });

    // Initialize
    resize();
    window.addEventListener('resize', resize);

    // Start animation only when footer is visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startAnimation();
            } else {
                stopAnimation();
            }
        });
    }, { threshold: 0.1 });

    observer.observe(footer);

    console.log('%c✓ Kinetic Grid initialized!', 'color: #17f7f7; font-size: 12px;');
})();

// ========================================
// INTERACTIVE PROJECT VISUALIZATIONS
// ========================================

// Shared Isometric Utilities
const ISO = {
    angle: Math.PI / 6, // 30 degrees

    // Project 3D point to 2D isometric view
    project(x, y, z, centerX, centerY, scale = 1) {
        const isoX = (x - z) * Math.cos(this.angle) * scale;
        const isoY = (x + z) * Math.sin(this.angle) * scale - y * scale;
        return {
            x: centerX + isoX,
            y: centerY + isoY
        };
    },

    // Rotate point around Y axis
    rotateY(x, y, z, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return {
            x: x * cos - z * sin,
            y: y,
            z: x * sin + z * cos
        };
    },

    // Rotate point around X axis
    rotateX(x, y, z, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return {
            x: x,
            y: y * cos - z * sin,
            z: y * sin + z * cos
        };
    }
};

// ========================================
// VISUALIZATION 1: BOQ Auto-Generation
// Shows AI scanning blueprints and auto-calculating quantities
// ========================================
(function initBOQGenerator() {
    const canvas = document.getElementById('viz-bill-boq');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height, scale;
    let time = 0;
    let animationId = null;
    let isAnimating = false;

    const PADDING = 20;

    // BOQ Line items that will be "calculated"
    const boqItems = [
        { item: 'Concrete M25', qty: 0, targetQty: 245, unit: 'm³', rate: 4500, delay: 0 },
        { item: 'Steel TMT 500D', qty: 0, targetQty: 18.5, unit: 'MT', rate: 65000, delay: 0.8 },
        { item: 'Brickwork', qty: 0, targetQty: 1820, unit: 'm²', rate: 850, delay: 1.6 },
        { item: 'Plastering', qty: 0, targetQty: 3640, unit: 'm²', rate: 280, delay: 2.4 },
        { item: 'Flooring', qty: 0, targetQty: 890, unit: 'm²', rate: 1200, delay: 3.2 },
        { item: 'Electrical', qty: 0, targetQty: 156, unit: 'pts', rate: 2800, delay: 4.0 }
    ];

    // Scanning beam position
    let scanY = 0;
    let cycleTime = 0;
    const CYCLE_DURATION = 6; // seconds per full cycle

    function resize() {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        width = rect.width;
        height = rect.height;
        scale = Math.min(width, height) / 400;
    }

    function formatCurrency(num) {
        if (num >= 100000) return '₹' + (num / 100000).toFixed(1) + 'L';
        if (num >= 1000) return '₹' + (num / 1000).toFixed(1) + 'K';
        return '₹' + num.toFixed(0);
    }

    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);

        // Update cycle time
        cycleTime = (time * 0.8) % CYCLE_DURATION;
        const cycleProgress = cycleTime / CYCLE_DURATION;

        // Table dimensions - fills container vertically
        const tableWidth = width - PADDING * 2;
        const tableX = PADDING;
        const statusHeight = 25; // Space for "AI SCANNING..." at bottom
        const availableHeight = height - PADDING * 2 - statusHeight;
        const numRows = 8; // header + 6 items + total
        const rowHeight = availableHeight / numRows;
        const tableY = PADDING;
        const colWidths = [tableWidth * 0.32, tableWidth * 0.18, tableWidth * 0.18, tableWidth * 0.32];

        // Draw header
        ctx.fillStyle = 'rgba(23, 247, 247, 0.15)';
        ctx.fillRect(tableX, tableY, tableWidth, rowHeight);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(tableX, tableY, tableWidth, rowHeight);

        ctx.fillStyle = 'rgba(23, 247, 247, 0.9)';
        ctx.font = `bold ${9 * scale + 2}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'left';

        let colX = tableX + 8;
        const headers = ['ITEM', 'QTY', 'UNIT', 'AMOUNT'];
        headers.forEach((header, i) => {
            ctx.fillText(header, colX, tableY + rowHeight * 0.65);
            colX += colWidths[i];
        });

        // Draw scanning beam (blueprint scan effect)
        const scanProgress = (cycleProgress * 1.5) % 1;
        scanY = tableY + rowHeight + scanProgress * (rowHeight * boqItems.length);

        // Scanning glow
        const scanGrad = ctx.createLinearGradient(tableX, scanY - 15, tableX, scanY + 15);
        scanGrad.addColorStop(0, 'rgba(23, 247, 247, 0)');
        scanGrad.addColorStop(0.5, 'rgba(23, 247, 247, 0.3)');
        scanGrad.addColorStop(1, 'rgba(23, 247, 247, 0)');
        ctx.fillStyle = scanGrad;
        ctx.fillRect(tableX, scanY - 15, tableWidth, 30);

        // Scan line
        ctx.strokeStyle = 'rgba(23, 247, 247, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tableX, scanY);
        ctx.lineTo(tableX + tableWidth, scanY);
        ctx.stroke();

        // Draw BOQ rows
        let runningTotal = 0;
        boqItems.forEach((item, i) => {
            const rowY = tableY + rowHeight * (i + 1);

            // Calculate item progress based on cycle
            const itemStart = item.delay / CYCLE_DURATION;
            const itemDuration = 0.12;
            let itemProgress = Math.max(0, Math.min(1, (cycleProgress - itemStart) / itemDuration));
            itemProgress = easeOutCubic(itemProgress);

            // Current quantity (animates from 0 to target)
            const currentQty = item.targetQty * itemProgress;
            const amount = currentQty * item.rate;
            runningTotal += amount;

            // Row background (highlights when being calculated)
            const isActive = cycleProgress >= itemStart && cycleProgress < itemStart + itemDuration + 0.05;
            if (isActive) {
                ctx.fillStyle = 'rgba(23, 247, 247, 0.08)';
                ctx.fillRect(tableX, rowY, tableWidth, rowHeight);
            }

            // Row border
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.strokeRect(tableX, rowY, tableWidth, rowHeight);

            // Row content
            ctx.font = `${8 * scale + 2}px "JetBrains Mono", monospace`;
            colX = tableX + 8;

            // Item name
            ctx.fillStyle = itemProgress > 0 ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.3)';
            ctx.textAlign = 'left';
            ctx.fillText(item.item, colX, rowY + rowHeight * 0.65);
            colX += colWidths[0];

            // Quantity (animates)
            if (itemProgress > 0) {
                ctx.fillStyle = isActive ? 'rgba(23, 247, 247, 1)' : 'rgba(255, 255, 255, 0.8)';
                ctx.fillText(currentQty.toFixed(currentQty < 100 ? 1 : 0), colX, rowY + rowHeight * 0.65);
            } else {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.fillText('—', colX, rowY + rowHeight * 0.65);
            }
            colX += colWidths[1];

            // Unit
            ctx.fillStyle = itemProgress > 0 ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.2)';
            ctx.fillText(item.unit, colX, rowY + rowHeight * 0.65);
            colX += colWidths[2];

            // Amount (animates)
            if (itemProgress > 0) {
                ctx.fillStyle = isActive ? 'rgba(23, 247, 247, 1)' : 'rgba(255, 255, 255, 0.8)';
                ctx.textAlign = 'right';
                ctx.fillText(formatCurrency(amount), tableX + tableWidth - 8, rowY + rowHeight * 0.65);
            }
        });

        // Total row
        const totalRowY = tableY + rowHeight * (boqItems.length + 1);
        ctx.fillStyle = 'rgba(23, 247, 247, 0.1)';
        ctx.fillRect(tableX, totalRowY, tableWidth, rowHeight);
        ctx.strokeStyle = 'rgba(23, 247, 247, 0.4)';
        ctx.strokeRect(tableX, totalRowY, tableWidth, rowHeight);

        ctx.font = `bold ${9 * scale + 2}px "JetBrains Mono", monospace`;
        ctx.fillStyle = 'rgba(23, 247, 247, 1)';
        ctx.textAlign = 'left';
        ctx.fillText('TOTAL', tableX + 8, totalRowY + rowHeight * 0.65);

        ctx.textAlign = 'right';
        ctx.fillText(formatCurrency(runningTotal), tableX + tableWidth - 8, totalRowY + rowHeight * 0.65);

        // "AI Processing" indicator
        const processingAlpha = 0.5 + Math.sin(time * 4) * 0.3;
        ctx.fillStyle = `rgba(23, 247, 247, ${processingAlpha})`;
        ctx.font = `${7 * scale + 1}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.fillText('● AI SCANNING BLUEPRINT...', width / 2, height - 8);

        time += 0.016;
    }

    function animate() {
        if (!isAnimating) return;
        draw();
        animationId = requestAnimationFrame(animate);
    }

    function startAnimation() {
        if (!isAnimating) {
            isAnimating = true;
            animate();
        }
    }

    function stopAnimation() {
        isAnimating = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }

    resize();
    window.addEventListener('resize', resize);

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            entry.isIntersecting ? startAnimation() : stopAnimation();
        });
    }, { threshold: 0.1 });

    observer.observe(canvas);
    console.log('%c✓ BOQ Generator visualization initialized!', 'color: #17f7f7; font-size: 12px;');
})();

// ========================================
// VISUALIZATION 2: Perhitsiksha - WhatsApp CRM Automation
// Shows incoming messages being auto-processed and student records updated
// ========================================
(function initWhatsAppCRM() {
    const canvas = document.getElementById('viz-perhitsiksha');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height, scale;
    let time = 0;
    let animationId = null;
    let isAnimating = false;

    const PADDING = 20;

    // Incoming WhatsApp messages
    const messages = [
        { sender: 'Parent', text: 'Donation ₹5,000', type: 'donation' },
        { sender: 'Volunteer', text: 'New student enrolled', type: 'student' },
        { sender: 'Donor', text: 'Grant inquiry', type: 'inquiry' },
        { sender: 'Parent', text: 'Fee payment done', type: 'donation' },
        { sender: 'School', text: 'Attendance report', type: 'report' }
    ];

    // Student records that get updated (5 rows to fill space)
    const students = [
        { name: 'Priya S.', status: 'Active', donations: 0, targetDonations: 12500 },
        { name: 'Rahul M.', status: 'Active', donations: 0, targetDonations: 8200 },
        { name: 'Anjali K.', status: 'Active', donations: 0, targetDonations: 15000 },
        { name: 'Vikram P.', status: 'Pending', donations: 0, targetDonations: 6800 },
        { name: 'Sneha R.', status: 'Active', donations: 0, targetDonations: 9500 }
    ];

    // Animation state
    let messageQueue = [];
    let currentMessage = null;
    let messageProgress = 0;
    let processedCount = 0;

    function resize() {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        width = rect.width;
        height = rect.height;
        scale = Math.min(width, height) / 400;
    }

    function spawnMessage() {
        const msg = messages[Math.floor(Math.random() * messages.length)];
        messageQueue.push({
            ...msg,
            y: PADDING + 30,
            alpha: 0,
            processed: false
        });
    }

    function drawWhatsAppBubble(x, y, text, sender, alpha, isProcessing) {
        const bubbleWidth = (width - PADDING * 2) * 0.45;
        const bubbleHeight = 40 * scale; // Consistent height with records

        ctx.save();
        ctx.globalAlpha = alpha;

        // Bubble background (WhatsApp green)
        ctx.fillStyle = isProcessing ? 'rgba(23, 247, 247, 0.2)' : 'rgba(37, 211, 102, 0.15)';
        ctx.strokeStyle = isProcessing ? 'rgba(23, 247, 247, 0.8)' : 'rgba(37, 211, 102, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x, y, bubbleWidth, bubbleHeight, 8 * scale);
        ctx.fill();
        ctx.stroke();

        // Sender name
        ctx.fillStyle = 'rgba(37, 211, 102, 0.9)';
        ctx.font = `bold ${8 * scale + 1}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'left';
        ctx.fillText(sender, x + 8 * scale, y + 14 * scale);

        // Message text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = `${7 * scale + 1}px "JetBrains Mono", monospace`;
        ctx.fillText(text, x + 8 * scale, y + 30 * scale);

        // Processing indicator
        if (isProcessing) {
            ctx.fillStyle = 'rgba(23, 247, 247, 0.8)';
            ctx.font = `${7 * scale}px "JetBrains Mono", monospace`;
            ctx.textAlign = 'right';
            ctx.fillText('● Processing', x + bubbleWidth - 8 * scale, y + 14 * scale);
        }

        ctx.restore();
    }

    function drawStudentRecord(x, y, student, index, highlight) {
        const recordWidth = (width - PADDING * 2) * 0.45;
        const recordHeight = 40 * scale; // Consistent height with bubbles

        ctx.save();

        // Record background
        ctx.fillStyle = highlight ? 'rgba(23, 247, 247, 0.1)' : 'rgba(255, 255, 255, 0.03)';
        ctx.strokeStyle = highlight ? 'rgba(23, 247, 247, 0.5)' : 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x, y, recordWidth, recordHeight, 4 * scale);
        ctx.fill();
        ctx.stroke();

        // Student name
        ctx.fillStyle = highlight ? 'rgba(23, 247, 247, 1)' : 'rgba(255, 255, 255, 0.7)';
        ctx.font = `${8 * scale + 1}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'left';
        ctx.fillText(student.name, x + 8 * scale, y + 13 * scale);

        // Status badge
        const statusColor = student.status === 'Active' ? '#25D366' : '#f7a717';
        ctx.fillStyle = statusColor;
        ctx.font = `${6 * scale}px "JetBrains Mono", monospace`;
        ctx.fillText(student.status, x + 8 * scale, y + 25 * scale);

        // Donations amount
        ctx.fillStyle = highlight ? 'rgba(23, 247, 247, 1)' : 'rgba(255, 255, 255, 0.6)';
        ctx.textAlign = 'right';
        ctx.font = `bold ${8 * scale + 1}px "JetBrains Mono", monospace`;
        const donationText = '₹' + Math.floor(student.donations).toLocaleString();
        ctx.fillText(donationText, x + recordWidth - 8 * scale, y + 18 * scale);

        ctx.restore();
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);
        time += 0.016;

        // Layout - fills container vertically
        const contentWidth = width - PADDING * 2;
        const leftCol = PADDING;
        const rightCol = PADDING + contentWidth * 0.52;

        // Compact top-aligned layout with tighter spacing
        const headerHeight = 25;
        const rowSpacing = 55 * scale; // Tighter spacing for 5 rows
        const studentSpacing = rowSpacing;
        const messageSpacing = rowSpacing;

        // Spawn new messages periodically (up to 5)
        if (Math.random() > 0.98 && messageQueue.length < 5) {
            spawnMessage();
        }

        // Section headers
        ctx.fillStyle = 'rgba(23, 247, 247, 0.7)';
        ctx.font = `bold ${8 * scale + 1}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'left';
        ctx.fillText('INCOMING', leftCol, PADDING + 12);
        ctx.fillText('STUDENT RECORDS', rightCol, PADDING + 12);

        // Process message queue - track processing message position
        let yOffset = PADDING + headerHeight;
        let processingMsgY = null;
        let targetStudentIdx = Math.floor(time * 0.5) % students.length;

        messageQueue = messageQueue.filter((msg, i) => {
            // Fade in
            msg.alpha = Math.min(1, msg.alpha + 0.05);

            // Draw message bubble
            const isProcessing = i === 0 && messageProgress > 0.3;
            if (isProcessing) {
                processingMsgY = yOffset + 20 * scale; // Center of bubble
            }
            drawWhatsAppBubble(leftCol, yOffset, msg.text, msg.sender, msg.alpha, isProcessing);

            yOffset += messageSpacing;

            // Process first message
            if (i === 0) {
                messageProgress += 0.008;
                if (messageProgress > 1) {
                    // Update the target student's donations
                    students[targetStudentIdx].donations = Math.min(
                        students[targetStudentIdx].targetDonations,
                        students[targetStudentIdx].donations + Math.random() * 3000 + 1000
                    );
                    processedCount++;
                    messageProgress = 0;
                    return false; // Remove processed message
                }
            }

            return msg.alpha < 1 || i === 0 || yOffset < height - 40;
        });

        // Draw student records - track target student position
        let studentY = PADDING + headerHeight;
        let targetStudentY = null;
        students.forEach((student, i) => {
            // Animate donations counting up
            if (student.donations < student.targetDonations) {
                student.donations += (student.targetDonations - student.donations) * 0.02;
            }
            const isTarget = i === targetStudentIdx;
            if (isTarget) {
                targetStudentY = studentY + 20 * scale; // Center of record
            }
            drawStudentRecord(rightCol, studentY, student, i, isTarget);
            studentY += studentSpacing;
        });

        // Draw connection arrow - connects processing message to target student
        if (processingMsgY && targetStudentY) {
            const arrowPulse = 0.6 + Math.sin(time * 4) * 0.4;
            const bubbleRight = leftCol + (width - PADDING * 2) * 0.45;
            const recordLeft = rightCol;

            ctx.strokeStyle = `rgba(23, 247, 247, ${arrowPulse})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            // Draw from right edge of bubble to left edge of record
            ctx.moveTo(bubbleRight + 5, processingMsgY);
            ctx.lineTo(recordLeft - 5, targetStudentY);
            ctx.stroke();

            // Arrow head
            const angle = Math.atan2(targetStudentY - processingMsgY, recordLeft - bubbleRight);
            ctx.beginPath();
            ctx.moveTo(recordLeft - 5, targetStudentY);
            ctx.lineTo(recordLeft - 5 - 10 * Math.cos(angle - 0.4), targetStudentY - 10 * Math.sin(angle - 0.4));
            ctx.moveTo(recordLeft - 5, targetStudentY);
            ctx.lineTo(recordLeft - 5 - 10 * Math.cos(angle + 0.4), targetStudentY - 10 * Math.sin(angle + 0.4));
            ctx.stroke();
        }

        // Stats at bottom
        ctx.fillStyle = 'rgba(23, 247, 247, 0.8)';
        ctx.font = `${7 * scale + 1}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        const totalDonations = students.reduce((sum, s) => sum + s.donations, 0);
        ctx.fillText(`● AUTO-PROCESSED: ${processedCount} msgs | TOTAL: ₹${Math.floor(totalDonations).toLocaleString()}`, width / 2, height - 10);
    }

    function animate() {
        if (!isAnimating) return;
        draw();
        animationId = requestAnimationFrame(animate);
    }

    function startAnimation() {
        if (!isAnimating) { isAnimating = true; animate(); }
    }

    function stopAnimation() {
        isAnimating = false;
        if (animationId) { cancelAnimationFrame(animationId); animationId = null; }
    }

    resize();
    window.addEventListener('resize', resize);

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => entry.isIntersecting ? startAnimation() : stopAnimation());
    }, { threshold: 0.1 });

    observer.observe(canvas);
    console.log('%c✓ WhatsApp CRM visualization initialized!', 'color: #17f7f7; font-size: 12px;');
})();

// ========================================
// VISUALIZATION 3: Birdsong - Audio Recognition (Shazam for Birds)
// Shows waveform capture, analysis, and bird species identification
// ========================================
(function initBirdsongRecognition() {
    const canvas = document.getElementById('viz-birdsong');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height, centerX, centerY, scale;
    let time = 0;
    let animationId = null;
    let isAnimating = false;

    const PADDING = 20;

    // Bird species database
    const birdSpecies = [
        { name: 'Indian Robin', scientific: 'Copsychus fulicatus', confidence: 0 },
        { name: 'House Sparrow', scientific: 'Passer domesticus', confidence: 0 },
        { name: 'Asian Koel', scientific: 'Eudynamys scolopaceus', confidence: 0 },
        { name: 'Common Myna', scientific: 'Acridotheres tristis', confidence: 0 },
        { name: 'Red-vented Bulbul', scientific: 'Pycnonotus cafer', confidence: 0 }
    ];

    // Animation state
    let waveformData = new Array(60).fill(0);
    let analysisPhase = 0; // 0: listening, 1: analyzing, 2: matched
    let matchedBird = null;
    let matchProgress = 0;
    let cycleTimer = 0;
    const CYCLE_DURATION = 8;

    function resize() {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        width = rect.width;
        height = rect.height;
        centerX = width / 2;
        centerY = height / 2;
        scale = Math.min(width, height) / 400;
    }

    function generateWaveform() {
        waveformData.shift();
        const chirpFreq = Math.sin(time * 15) * Math.sin(time * 2.3);
        const noise = (Math.random() - 0.5) * 0.3;
        const amplitude = analysisPhase === 0 ? 0.6 + chirpFreq * 0.4 + noise : 0.2;
        waveformData.push(amplitude);
    }

    function drawWaveform(x, y, w, h) {
        const sliceWidth = w / waveformData.length;

        // Subtle gradient background instead of harsh box
        const gradient = ctx.createLinearGradient(x, y - h/2, x, y + h/2);
        gradient.addColorStop(0, 'rgba(23, 247, 247, 0)');
        gradient.addColorStop(0.3, 'rgba(23, 247, 247, 0.03)');
        gradient.addColorStop(0.7, 'rgba(23, 247, 247, 0.03)');
        gradient.addColorStop(1, 'rgba(23, 247, 247, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y - h/2, w, h);

        ctx.strokeStyle = analysisPhase === 1 ? 'rgba(23, 247, 247, 0.9)' : 'rgba(23, 247, 247, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < waveformData.length; i++) {
            const px = x + i * sliceWidth;
            const py = y + waveformData[i] * h * 0.4;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        ctx.strokeStyle = 'rgba(23, 247, 247, 0.3)';
        ctx.beginPath();
        for (let i = 0; i < waveformData.length; i++) {
            const px = x + i * sliceWidth;
            const py = y - waveformData[i] * h * 0.4;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w, y);
        ctx.stroke();

        if (analysisPhase === 1) {
            const scanX = x + (matchProgress * w);
            ctx.strokeStyle = 'rgba(23, 247, 247, 0.8)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(scanX, y - h/2);
            ctx.lineTo(scanX, y + h/2);
            ctx.stroke();

            const grad = ctx.createLinearGradient(scanX - 20, 0, scanX + 20, 0);
            grad.addColorStop(0, 'rgba(23, 247, 247, 0)');
            grad.addColorStop(0.5, 'rgba(23, 247, 247, 0.3)');
            grad.addColorStop(1, 'rgba(23, 247, 247, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(scanX - 20, y - h/2, 40, h);
        }
    }

    function drawSpeciesResult(x, y, bird, isMatched, confidence) {
        const boxWidth = width - PADDING * 2;
        const boxHeight = 50 * scale;

        ctx.save();
        ctx.fillStyle = isMatched ? 'rgba(23, 247, 247, 0.15)' : 'rgba(255, 255, 255, 0.03)';
        ctx.strokeStyle = isMatched ? 'rgba(23, 247, 247, 0.8)' : 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = isMatched ? 2 : 1;
        ctx.beginPath();
        ctx.roundRect(x, y, boxWidth, boxHeight, 6 * scale);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isMatched ? 'rgba(23, 247, 247, 1)' : 'rgba(255, 255, 255, 0.5)';
        ctx.font = `bold ${8 * scale + 1}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'left';
        ctx.fillText(bird.name, x + 10 * scale, y + 16 * scale);

        ctx.fillStyle = isMatched ? 'rgba(23, 247, 247, 0.7)' : 'rgba(255, 255, 255, 0.3)';
        ctx.font = `italic ${6 * scale}px "JetBrains Mono", monospace`;
        ctx.fillText(bird.scientific, x + 10 * scale, y + 28 * scale);

        if (confidence > 0) {
            const barWidth = (boxWidth - 20 * scale) * confidence;
            ctx.fillStyle = isMatched ? 'rgba(23, 247, 247, 0.8)' : 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(x + 10 * scale, y + 38 * scale, barWidth, 4 * scale);

            ctx.fillStyle = isMatched ? 'rgba(23, 247, 247, 1)' : 'rgba(255, 255, 255, 0.5)';
            ctx.font = `bold ${7 * scale}px "JetBrains Mono", monospace`;
            ctx.textAlign = 'right';
            ctx.fillText(`${Math.floor(confidence * 100)}%`, x + boxWidth - 10 * scale, y + 16 * scale);
        }

        if (isMatched) {
            ctx.fillStyle = 'rgba(5, 247, 165, 1)';
            ctx.font = `${12 * scale}px sans-serif`;
            ctx.textAlign = 'right';
            ctx.fillText('✓', x + boxWidth - 10 * scale, y + 32 * scale);
        }

        ctx.restore();
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);
        time += 0.016;
        cycleTimer += 0.016;

        const cycleProgress = (cycleTimer % CYCLE_DURATION) / CYCLE_DURATION;

        if (cycleProgress < 0.4) {
            analysisPhase = 0;
            matchProgress = 0;
            matchedBird = null;
            birdSpecies.forEach(b => b.confidence = 0);
        } else if (cycleProgress < 0.7) {
            analysisPhase = 1;
            matchProgress = (cycleProgress - 0.4) / 0.3;
            birdSpecies.forEach((b, i) => {
                if (i === 2) {
                    b.confidence = Math.min(0.94, matchProgress * 1.2);
                } else {
                    b.confidence = Math.min(0.3 + Math.random() * 0.2, matchProgress * 0.5);
                }
            });
        } else {
            analysisPhase = 2;
            matchedBird = birdSpecies[2];
            matchedBird.confidence = 0.94;
        }

        generateWaveform();

        // Layout - fills container vertically with better top padding
        const contentWidth = width - PADDING * 2;
        const topPadding = 35; // More breathing room at top
        const headerHeight = 25;
        const statusHeight = 20;
        const speciesHeaderHeight = 25;
        const availableHeight = height - PADDING - topPadding - statusHeight;

        // Proportional allocation: ~28% waveform, ~72% species results
        const waveformHeight = availableHeight * 0.28;
        const waveformY = topPadding + headerHeight;

        ctx.fillStyle = 'rgba(23, 247, 247, 0.8)';
        ctx.font = `bold ${8 * scale + 1}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'left';
        ctx.fillText('AUDIO INPUT', PADDING, topPadding);

        const statusText = analysisPhase === 0 ? '● LISTENING...' :
                          analysisPhase === 1 ? '● ANALYZING...' : '● MATCH FOUND';
        const statusColor = analysisPhase === 2 ? 'rgba(5, 247, 165, 0.9)' : 'rgba(23, 247, 247, 0.7)';
        ctx.fillStyle = statusColor;
        ctx.textAlign = 'right';
        ctx.fillText(statusText, width - PADDING, topPadding);

        drawWaveform(PADDING, waveformY, contentWidth, waveformHeight);

        // Species match section
        const speciesLabelY = waveformY + waveformHeight + speciesHeaderHeight;
        ctx.fillStyle = 'rgba(23, 247, 247, 0.7)';
        ctx.font = `bold ${7 * scale + 1}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'left';
        ctx.fillText('SPECIES MATCH', PADDING, speciesLabelY - 8);

        // Calculate dynamic spacing for 3 species cards
        const resultsY = speciesLabelY;
        const resultsAvailable = height - resultsY - statusHeight - PADDING;
        const numCards = 3;
        const resultSpacing = resultsAvailable / numCards;

        const sortedBirds = [...birdSpecies].sort((a, b) => b.confidence - a.confidence).slice(0, 3);

        sortedBirds.forEach((bird, i) => {
            const isMatched = analysisPhase === 2 && bird === matchedBird;
            drawSpeciesResult(PADDING, resultsY + i * resultSpacing, bird, isMatched, bird.confidence);
        });

        if (analysisPhase === 0) {
            const micPulse = 0.5 + Math.sin(time * 4) * 0.3;
            ctx.fillStyle = `rgba(23, 247, 247, ${micPulse})`;
            ctx.font = `${14 * scale}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText('🎤', centerX, waveformY);
        }

        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = `${6 * scale}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.fillText('📍 Bangalore, India', centerX, height - 8);
    }

    function animate() {
        if (!isAnimating) return;
        draw();
        animationId = requestAnimationFrame(animate);
    }

    function startAnimation() {
        if (!isAnimating) { isAnimating = true; animate(); }
    }

    function stopAnimation() {
        isAnimating = false;
        if (animationId) { cancelAnimationFrame(animationId); animationId = null; }
    }

    resize();
    window.addEventListener('resize', resize);

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => entry.isIntersecting ? startAnimation() : stopAnimation());
    }, { threshold: 0.1 });

    observer.observe(canvas);
    console.log('%c✓ Birdsong Recognition visualization initialized!', 'color: #17f7f7; font-size: 12px;');
})();
