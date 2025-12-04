/**
 * KineticGrid - Interactive Distortion Grid
 * Material Lab Brand Kit Component
 * Converted from React to Vanilla JS
 */

class KineticGrid {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = options.width || 400;
        this.height = options.height || 400;
        this.color = options.color || '#17f7f7'; // Laser Cyan

        this.mouse = { x: 0, y: 0 };
        this.points = [];
        this.requestId = null;

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

        // Grid configuration
        const rows = 20;
        const cols = 20;
        const cellWidth = this.width / cols;
        const cellHeight = this.height / rows;

        // Create grid points
        for (let i = 0; i <= rows; i++) {
            for (let j = 0; j <= cols; j++) {
                const x = j * cellWidth;
                const y = i * cellHeight;
                this.points.push({
                    x,
                    y,
                    originX: x,
                    originY: y
                });
            }
        }

        // Mouse tracking relative to canvas
        this.handleMouseMove = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };
        window.addEventListener('mousemove', this.handleMouseMove);

        // Start render loop
        this.rows = rows;
        this.cols = cols;
        this.render();
    }

    render() {
        if (!this.ctx || !this.canvas) return;
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Update point positions based on mouse
        this.points.forEach(p => {
            const dx = p.originX - this.mouse.x;
            const dy = p.originY - this.mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = 150;

            if (dist < maxDist) {
                const angle = Math.atan2(dy, dx);
                const force = (maxDist - dist) / maxDist;
                const moveDist = force * 40; // Displacement strength

                p.x = p.originX + Math.cos(angle) * moveDist;
                p.y = p.originY + Math.sin(angle) * moveDist;
            } else {
                // Smoothly return to origin
                p.x += (p.originX - p.x) * 0.1;
                p.y += (p.originY - p.y) * 0.1;
            }
        });

        // Draw grid lines
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = 0.5;
        this.ctx.globalAlpha = 0.3;
        this.ctx.beginPath();

        // Horizontal lines
        for (let i = 0; i <= this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const p1 = this.points[i * (this.cols + 1) + j];
                const p2 = this.points[i * (this.cols + 1) + (j + 1)];
                if (j === 0) this.ctx.moveTo(p1.x, p1.y);
                this.ctx.lineTo(p2.x, p2.y);
            }
        }

        // Vertical lines
        for (let j = 0; j <= this.cols; j++) {
            for (let i = 0; i < this.rows; i++) {
                const p1 = this.points[i * (this.cols + 1) + j];
                const p2 = this.points[(i + 1) * (this.cols + 1) + j];
                if (i === 0) this.ctx.moveTo(p1.x, p1.y);
                this.ctx.lineTo(p2.x, p2.y);
            }
        }

        this.ctx.stroke();

        // Draw points near mouse
        this.ctx.fillStyle = this.color;
        this.ctx.globalAlpha = 0.8;
        this.points.forEach(p => {
            const dx = p.x - this.mouse.x;
            const dy = p.y - this.mouse.y;
            if (Math.sqrt(dx * dx + dy * dy) < 100) {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
                this.ctx.fill();
            }
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
    module.exports = KineticGrid;
}
