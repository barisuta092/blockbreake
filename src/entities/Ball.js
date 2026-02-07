export class Ball {
    constructor(game, x, y) {
        this.game = game;
        this.radius = 8;
        this.x = x ?? game.width / 2;
        this.y = y ?? game.height / 2;
        this.speed = 400;
        this.dx = 0;
        this.dy = 0;
        this.color = '#ffffff';
        this.inMotion = false;

        this.isFire = false;
        this.isStuck = false;
        this.stuckOffset = 0; // パドル中心からのオフセット

        if (x === undefined) {
            this.reset();
        }
    }

    reset() {
        if (!this.game.paddle) return;
        this.dx = 0;
        this.dy = 0;
        this.inMotion = false;
        this.isFire = false;
        this.isStuck = true;
        this.stuckOffset = 0;
        this.color = '#ffffff';

        // パドルの上に配置
        this.y = this.game.paddle.y - this.radius;
        this.x = this.game.paddle.x + this.game.paddle.width / 2;
    }

    setFire(fire) {
        this.isFire = fire;
        this.color = fire ? '#f87171' : '#ffffff';
    }

    start() {
        if (this.inMotion && !this.isStuck) return;

        this.inMotion = true;
        this.isStuck = false;

        // 速度がセットされていなければランダム発射
        if (this.dx === 0 && this.dy === 0) {
            this.dx = (Math.random() < 0.5 ? -1 : 1) * this.speed;
            this.dy = -this.speed;
        } else {
            // 既に速度がある場合は上方向へ
            if (this.dy > 0) this.dy = -this.dy;
            // 正規化してスピード適用
            const len = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
            if (len > 0) {
                this.dx = (this.dx / len) * this.speed;
                this.dy = (this.dy / len) * this.speed;
            }
        }
    }

    update(dt) {
        // Sticky状態: パドルに追従
        if (this.isStuck && this.game.paddle) {
            this.x = this.game.paddle.x + this.game.paddle.width / 2 + this.stuckOffset;
            this.y = this.game.paddle.y - this.radius;
            // 画面外に出ないように補正してもいいが、パドル制限があるので大体大丈夫
            return;
        }

        if (!this.inMotion) {
            // ゲーム開始前
            if (this.game.paddle) {
                this.x = this.game.paddle.x + this.game.paddle.width / 2;
                this.y = this.game.paddle.y - this.radius;
            }
            return;
        }

        let nextX = this.x + this.dx * dt;
        let nextY = this.y + this.dy * dt;

        // 壁との衝突 (左右)
        if (nextX - this.radius < 0) {
            nextX = this.radius;
            this.dx = -this.dx;
        } else if (nextX + this.radius > this.game.width) {
            nextX = this.game.width - this.radius;
            this.dx = -this.dx;
        }

        // 天井との衝突
        if (nextY - this.radius < 0) {
            nextY = this.radius;
            this.dy = -this.dy;
        }

        // 床衝突判定はGameクラスで一括管理（ボール削除のため）

        this.x = nextX;
        this.y = nextY;

        // パドルとの衝突判定
        this.checkPaddleCollision();
    }

    checkPaddleCollision() {
        const p = this.game.paddle;
        if (!p) return;

        if (
            this.y + this.radius >= p.y &&
            this.y - this.radius <= p.y + p.height &&
            this.x >= p.x &&
            this.x <= p.x + p.width
        ) {
            if (this.dy > 0) {
                // Stickyモードならキャッチ
                if (p.isSticky) {
                    this.isStuck = true;
                    this.stuckOffset = this.x - (p.x + p.width / 2);
                    this.y = p.y - this.radius;
                    return;
                }

                this.dy = -Math.abs(this.dy); // 跳ね返し

                // パドルの当たった位置で反射角を変える
                const hitPoint = this.x - (p.x + p.width / 2);
                this.dx = hitPoint * 5;

                // 速度一定化
                const currentSpeed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
                if (currentSpeed > 0) {
                    this.dx = (this.dx / currentSpeed) * this.speed;
                    this.dy = (this.dy / currentSpeed) * this.speed;
                }

                this.y = p.y - this.radius;
            }
        }
    }

    draw(ctx) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
    }
}
