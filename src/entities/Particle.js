export class Particle {
    constructor(game, x, y, color) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = Math.random() * 3 + 1;
        this.speed = Math.random() * 100 + 50;
        this.angle = Math.random() * Math.PI * 2;
        this.dx = Math.cos(this.angle) * this.speed;
        this.dy = Math.sin(this.angle) * this.speed;
        this.life = 1.0;
        this.decay = Math.random() * 2 + 1; // 寿命の減りやすさ
    }

    update(dt) {
        this.x += this.dx * dt;
        this.y += this.dy * dt;
        this.life -= this.decay * dt;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
