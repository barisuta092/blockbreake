export const TYPES = {
    WIDE: 'WIDE',
    MULTI: 'MULTI',
    FIRE: 'FIRE',
    STICKY: 'STICKY'
};

export class PowerUp {
    constructor(game, x, y, type) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 20;
        this.type = type;
        this.speed = 150;
        this.active = true;

        // 色設定
        switch (type) {
            case TYPES.WIDE: this.color = '#38bdf8'; break; // Cyan (Paddle color)
            case TYPES.MULTI: this.color = '#4ade80'; break; // Green
            case TYPES.FIRE: this.color = '#f87171'; break; // Red
            case TYPES.STICKY: this.color = '#c084fc'; break; // Purple
            default: this.color = '#ffffff';
        }
    }

    update(dt) {
        this.y += this.speed * dt;

        // 画面外に出たら消去
        if (this.y > this.game.height) {
            this.active = false;
        }

        // パドルとの衝突判定
        if (this.checkCollision(this.game.paddle)) {
            this.active = false;
            this.game.activatePowerUp(this.type);
        }
    }

    checkCollision(paddle) {
        return (
            this.x < paddle.x + paddle.width &&
            this.x + this.width > paddle.x &&
            this.y < paddle.y + paddle.height &&
            this.y + this.height > paddle.y
        );
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;

        // カプセル型
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, 10);
        ctx.fill();

        // テキスト表示 (文字でタイプを表示)
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let label = '';
        switch (this.type) {
            case TYPES.WIDE: label = 'WIDE'; break;
            case TYPES.MULTI: label = 'MULTI'; break;
            case TYPES.FIRE: label = 'FIRE'; break;
            case TYPES.STICKY: label = 'CATCH'; break;
        }

        ctx.fillText(label, this.x + this.width / 2, this.y + this.height / 2);

        // 発光エフェクト
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.stroke(); // 枠線だけ光らせるハック

        ctx.restore();
    }
}
