/**
 * PrismScene - Simplified Light Refraction Simulator
 * Material Lab Brand Kit Component
 * Based on the full MlBrandKit PrismScene but streamlined for vanilla JS
 *
 * Features:
 * - Interactive mouse-following light beam
 * - Snell's law refraction through crystal
 * - Rainbow dispersion (15 wavelengths)
 * - Volumetric beam rendering with glow
 * - Caustic bloom effects
 */

class PrismScene {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // Mouse position
        this.mouse = { x: this.width * 0.3, y: this.height * 0.5 };

        // Animation state
        this.time = 0;
        this.requestId = null;
        this.globalAlpha = 0;

        // Prism configuration
        this.config = {
            iorBase: 1.52,          // Refractive index (glass)
            abbeNumber: 25,         // Dispersion amount (lower = more rainbow)
            dispersionStrength: 3.0, // Color spread multiplier
            beamIntensity: 0.35,
            beamWidth: 15
        };

        // Generate crystal geometry (hexagonal prism)
        this.generateCrystal();

        // Generate wavelength spectrum
        this.spectrum = this.generateSpectrum();

        this.init();
    }

    init() {
        // Setup canvas
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;
        this.ctx.scale(dpr, dpr);
        this.dpr = dpr;

        // Mouse tracking
        this.handleMouseMove = (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        };
        window.addEventListener('mousemove', this.handleMouseMove);

        // Window resize
        this.handleResize = () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            const dpr = window.devicePixelRatio || 1;
            this.canvas.width = this.width * dpr;
            this.canvas.height = this.height * dpr;
            this.canvas.style.width = `${this.width}px`;
            this.canvas.style.height = `${this.height}px`;
            this.ctx.scale(dpr, dpr);
            this.dpr = dpr;
            this.generateCrystal();
        };
        window.addEventListener('resize', this.handleResize);

        // Start animation
        this.render();
    }

    generateCrystal() {
        // Create hexagonal crystal in center
        const cx = this.width / 2;
        const cy = this.height / 2;
        const size = Math.min(this.width, this.height) * 0.12;

        this.crystal = [];
        const sides = 6;
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
            this.crystal.push({
                x: cx + Math.cos(angle) * size,
                y: cy + Math.sin(angle) * size
            });
        }
    }

    generateSpectrum() {
        const samples = 15;
        const iorSpread = (70 - this.config.abbeNumber) / 70 * this.config.dispersionStrength;

        return Array.from({ length: samples }, (_, i) => {
            const t = i / (samples - 1);
            const wavelength = 700 - t * 320; // Red to Violet
            const ior = this.config.iorBase + t * iorSpread;

            return {
                color: this.wavelengthToRGB(wavelength),
                ior: ior,
                opacity: 0.7
            };
        });
    }

    wavelengthToRGB(wavelength) {
        let r = 0, g = 0, b = 0;

        if (wavelength >= 380 && wavelength < 440) {
            r = -(wavelength - 440) / (440 - 380);
            b = 1;
        } else if (wavelength >= 440 && wavelength < 490) {
            g = (wavelength - 440) / (490 - 440);
            b = 1;
        } else if (wavelength >= 490 && wavelength < 510) {
            g = 1;
            b = -(wavelength - 510) / (510 - 490);
        } else if (wavelength >= 510 && wavelength < 580) {
            r = (wavelength - 510) / (580 - 510);
            g = 1;
        } else if (wavelength >= 580 && wavelength < 645) {
            r = 1;
            g = -(wavelength - 645) / (645 - 580);
        } else if (wavelength >= 645 && wavelength <= 700) {
            r = 1;
        }

        // Intensity adjustment
        let factor = 1.0;
        if (wavelength >= 380 && wavelength < 420) {
            factor = 0.3 + 0.7 * (wavelength - 380) / (420 - 380);
        } else if (wavelength >= 645 && wavelength <= 700) {
            factor = 0.3 + 0.7 * (700 - wavelength) / (700 - 645);
        }

        // Gamma correction
        const gamma = 0.8;
        r = Math.round(255 * Math.pow(r * factor, gamma));
        g = Math.round(255 * Math.pow(g * factor, gamma));
        b = Math.round(255 * Math.pow(b * factor, gamma));

        return `rgb(${r}, ${g}, ${b})`;
    }

    // Vector math helpers
    vec2(x, y) {
        return { x, y };
    }

    sub(v1, v2) {
        return { x: v1.x - v2.x, y: v1.y - v2.y };
    }

    add(v1, v2) {
        return { x: v1.x + v2.x, y: v1.y + v2.y };
    }

    mul(v, s) {
        return { x: v.x * s, y: v.y * s };
    }

    dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }

    length(v) {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    }

    normalize(v) {
        const len = this.length(v);
        return len > 0 ? this.mul(v, 1 / len) : this.vec2(0, 0);
    }

    // Snell's law refraction in 2D
    refract(incident, normal, n1, n2) {
        const eta = n1 / n2;
        const cosI = -this.dot(normal, incident);
        const sinT2 = eta * eta * (1.0 - cosI * cosI);

        if (sinT2 > 1.0) return null; // Total internal reflection

        const cosT = Math.sqrt(1.0 - sinT2);
        return this.add(
            this.mul(incident, eta),
            this.mul(normal, eta * cosI - cosT)
        );
    }

    // Ray-segment intersection
    intersectRaySegment(rayOrigin, rayDir, p1, p2) {
        const v1 = this.sub(rayOrigin, p1);
        const v2 = this.sub(p2, p1);
        const v3 = this.vec2(-rayDir.y, rayDir.x);
        const d = this.dot(v2, v3);

        if (Math.abs(d) < 0.00001) return null;

        const t1 = (v2.x * v1.y - v2.y * v1.x) / d;
        const t2 = this.dot(v1, v3) / d;

        if (t1 >= 0 && t2 >= 0 && t2 <= 1) {
            return {
                t: t1,
                point: this.add(rayOrigin, this.mul(rayDir, t1)),
                normal: this.normalize(this.vec2(-v2.y, v2.x))
            };
        }
        return null;
    }

    // Find ray intersection with crystal
    intersectCrystal(origin, dir) {
        let minT = Infinity;
        let result = null;

        for (let i = 0; i < this.crystal.length; i++) {
            const p1 = this.crystal[i];
            const p2 = this.crystal[(i + 1) % this.crystal.length];

            const hit = this.intersectRaySegment(origin, dir, p1, p2);
            if (hit && hit.t < minT && hit.t > 0.001) {
                minT = hit.t;
                result = hit;
                result.index = i;
            }
        }

        return result;
    }

    drawBeam(from, to, color, width, alpha) {
        const ctx = this.ctx;
        const dpr = this.dpr;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.globalCompositeOperation = 'lighter';

        // Main beam with gradient
        const gradient = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = width * dpr;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();

        // Glow effect
        ctx.shadowBlur = 20 * dpr;
        ctx.shadowColor = color;
        ctx.stroke();

        ctx.restore();
    }

    drawCrystal() {
        const ctx = this.ctx;

        // Draw crystal outline
        ctx.save();
        ctx.strokeStyle = 'rgba(23, 247, 247, 0.3)'; // Laser Cyan
        ctx.lineWidth = 2;
        ctx.beginPath();
        this.crystal.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });
        ctx.closePath();
        ctx.stroke();

        // Subtle fill
        ctx.fillStyle = 'rgba(23, 247, 247, 0.03)';
        ctx.fill();

        ctx.restore();
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#050505'; // Void Black
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.time += 0.016;

        // Draw crystal
        this.drawCrystal();

        // Calculate ray direction from mouse to crystal center
        const crystalCenter = this.vec2(this.width / 2, this.height / 2);
        const rayDir = this.normalize(this.sub(crystalCenter, this.mouse));

        // Check if ray hits crystal
        const entryHit = this.intersectCrystal(this.mouse, rayDir);

        // Fade in/out based on hit
        const targetAlpha = entryHit ? 1.0 : 0.0;
        this.globalAlpha += (targetAlpha - this.globalAlpha) * 0.1;

        if (this.globalAlpha > 0.01) {
            // Draw incoming white beam
            const beamEnd = entryHit ? entryHit.point : this.add(this.mouse, this.mul(rayDir, 1000));
            this.drawBeam(this.mouse, beamEnd, '#ffffff', this.config.beamWidth, this.globalAlpha * this.config.beamIntensity);

            if (entryHit) {
                // Process each wavelength
                this.spectrum.forEach(band => {
                    // Refract entering the crystal
                    const refracted = this.refract(rayDir, entryHit.normal, 1.0, band.ior);
                    if (!refracted) return;

                    // Find exit point
                    const exitHit = this.intersectCrystal(
                        this.add(entryHit.point, this.mul(refracted, 0.01)),
                        refracted
                    );

                    if (exitHit) {
                        // Refract exiting the crystal
                        const exitRefracted = this.refract(refracted, exitHit.normal, band.ior, 1.0);
                        if (exitRefracted) {
                            // Draw refracted beam extending to edge
                            const exitEnd = this.add(exitHit.point, this.mul(exitRefracted, 2000));
                            this.drawBeam(
                                exitHit.point,
                                exitEnd,
                                band.color,
                                this.config.beamWidth * 0.8,
                                this.globalAlpha * band.opacity * 0.8
                            );

                            // Entry bloom
                            const ctx = this.ctx;
                            ctx.save();
                            ctx.globalCompositeOperation = 'lighter';
                            ctx.globalAlpha = this.globalAlpha * 0.3;
                            ctx.fillStyle = band.color;
                            ctx.beginPath();
                            ctx.arc(exitHit.point.x, exitHit.point.y, 8 * this.dpr, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.restore();
                        }
                    }
                });
            }
        }

        this.requestId = requestAnimationFrame(() => this.render());
    }

    destroy() {
        if (this.requestId) {
            cancelAnimationFrame(this.requestId);
        }
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('resize', this.handleResize);
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PrismScene;
}
