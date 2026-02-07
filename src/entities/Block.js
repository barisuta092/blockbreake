export class Block {
    constructor(game, x, y, width, height, color) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.active = true;
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.shadowBlur = 5;
        ctx.shadowColor = this.color;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fill();

        // 枠線で少し立体感を出す
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        ctx.shadowBlur = 0;
    }
}
