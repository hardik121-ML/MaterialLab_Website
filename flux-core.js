/**
 * FluxCore - Interactive 3D Particle Constellation
 * Material Lab Brand Kit Component
 * Converted from React to Vanilla JS
 */

class FluxCore {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.size = options.size || 400;
        this.color = options.color || '#17f7f7'; // Laser Cyan

        this.mouse = { x: 0, y: 0 };
        this.particles = [];
        this.time = 0;
        this.requestId = null;

        this.init();
    }

    init() {
        // Setup canvas
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.size * dpr;
        this.canvas.height = this.size * dpr;
        this.canvas.style.width = `${this.size}px`;
        this.canvas.style.height = `${this.size}px`;
        this.ctx.scale(dpr, dpr);

        // Create particles on sphere
        const particleCount = 40;
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                theta: Math.random() * Math.PI * 2,
                phi: Math.acos((Math.random() * 2) - 1),
                radius: 1,
                speed: 0.01 + Math.random() * 0.02
            });
        }

        // Mouse tracking
        this.handleMouseMove = (e) => {
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = (e.clientY / window.innerHeight) * 2 - 1;
            this.mouse = { x, y };
        };
        window.addEventListener('mousemove', this.handleMouseMove);

        // Start render loop
        this.render();
    }

    render() {
        this.ctx.clearRect(0, 0, this.size, this.size);
        this.time += 0.01;

        const cx = this.size / 2;
        const cy = this.size / 2;
        const baseScale = (this.size / 2) * 0.6;

        // Mouse influence on rotation
        const rotX = this.time * 0.5 + this.mouse.y;
        const rotY = this.time * 0.3 + this.mouse.x;

        // Breathing effect
        const breathing = 1 + Math.sin(this.time * 2) * 0.1;
        const scale = baseScale * breathing;

        const projectedPoints = [];

        // Project particles from 3D sphere to 2D canvas
        this.particles.forEach(p => {
            // Sphere coordinates
            const x = p.radius * Math.sin(p.phi) * Math.cos(p.theta);
            const y = p.radius * Math.sin(p.phi) * Math.sin(p.theta);
            const z = p.radius * Math.cos(p.phi);

            // Rotate Y
            let x1 = x * Math.cos(rotY) - z * Math.sin(rotY);
            let z1 = x * Math.sin(rotY) + z * Math.cos(rotY);
            let y1 = y;

            // Rotate X
            let y2 = y1 * Math.cos(rotX) - z1 * Math.sin(rotX);
            let z2 = y1 * Math.sin(rotX) + z1 * Math.cos(rotX);
            let x2 = x1;

            projectedPoints.push({
                x: cx + x2 * scale,
                y: cy + y2 * scale,
                z: z2
            });
        });

        // Draw connections between nearby points
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = 0.5;
        this.ctx.globalAlpha = 0.4;
        this.ctx.beginPath();

        for (let i = 0; i < projectedPoints.length; i++) {
            for (let j = i + 1; j < projectedPoints.length; j++) {
                const p1 = projectedPoints[i];
                const p2 = projectedPoints[j];
                const dist2d = Math.sqrt(
                    (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2
                );

                if (dist2d < 30) {
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                }
            }
        }
        this.ctx.stroke();

        // Draw particles with depth-based alpha
        projectedPoints.forEach(p => {
            const alpha = (p.z + 1) / 2; // Depth fade
            this.ctx.fillStyle = this.color;
            this.ctx.globalAlpha = Math.max(0.1, alpha);
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
            this.ctx.fill();
        });

        this.requestId = requestAnimationFrame(() => this.render());
    }

    destroy() {
        if (this.requestId) {
            cancelAnimationFrame(this.requestId);
        }
        window.removeEventListener('mousemove', this.handleMouseMove);
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FluxCore;
}
