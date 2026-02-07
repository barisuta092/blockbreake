import { Paddle } from './entities/Paddle.js';
import { Ball } from './entities/Ball.js';
import { Block } from './entities/Block.js';
import { Particle } from './entities/Particle.js';
import { PowerUp, TYPES as POWERUP_TYPES } from './entities/PowerUp.js';

export class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) throw new Error("Canvas missing");
        this.ctx = this.canvas.getContext('2d');
        this.width = 0;
        this.height = 0;

        this.lastTime = 0;
        this.isRunning = false;

        // エンティティ
        this.paddle = null;
        this.balls = [];
        this.blocks = [];
        this.particles = [];
        this.powerUps = [];
        this.score = 0;

        this.startTime = 0;
        this.elapsedTime = 0;

        this.init();
    }

    init() {
        this.resize();

        this.paddle = new Paddle(this);
        // 初期ボールを1つ作成
        this.resetBalls();
        this.createBlocks();

        window.addEventListener('resize', () => this.resize());

        // クリックで開始、またはボール発射
        window.addEventListener('click', () => {
            // Sticky状態のボールがあれば発射
            if (!this.isRunning) {
                this.start();
            } else {
                this.releaseBall();
            }
        });

        this.draw();
        this.updateTimer(0);
    }

    resetBalls() {
        this.balls = [new Ball(this)];
    }

    releaseBall() {
        this.balls.forEach(ball => {
            if (!ball.inMotion || ball.isStuck) {
                ball.start();
            }
        });
    }

    createBlocks() {
        this.blocks = [];
        const rows = 5;
        const cols = 8;
        const padding = 10;
        const offsetTop = 80;
        const offsetLeft = 60;

        const availableWidth = this.width - (offsetLeft * 2) - (padding * (cols - 1));
        const blockWidth = availableWidth / cols;
        const blockHeight = 30;

        const colors = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#60a5fa'];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x = offsetLeft + c * (blockWidth + padding);
                const y = offsetTop + r * (blockHeight + padding);
                const color = colors[r % colors.length];
                this.blocks.push(new Block(this, x, y, blockWidth, blockHeight, color));
            }
        }
    }

    createExplosion(x, y, color) {
        for (let i = 0; i < 15; i++) {
            this.particles.push(new Particle(this, x, y, color));
        }
    }

    spawnPowerUp(x, y) {
        // 20%の確率でドロップ
        if (Math.random() > 0.2) return;

        const types = Object.values(POWERUP_TYPES);
        const type = types[Math.floor(Math.random() * types.length)];
        this.powerUps.push(new PowerUp(this, x, y, type));
    }

    activatePowerUp(type) {
        this.score += 500; // ボーナス点
        this.updateScore(this.score);

        switch (type) {
            case POWERUP_TYPES.WIDE:
                this.paddle.setWidth(this.paddle.defaultWidth * 1.5);
                setTimeout(() => this.paddle.reset(), 10000); // 10秒後に戻る
                break;
            case POWERUP_TYPES.MULTI:
                this.spawnMultiBalls();
                break;
            case POWERUP_TYPES.FIRE:
                this.balls.forEach(b => b.setFire(true));
                break;
            case POWERUP_TYPES.STICKY:
                this.paddle.setSticky(true);
                break;
        }
    }

    spawnMultiBalls() {
        if (this.balls.length === 0) return;
        const baseBall = this.balls[0];

        for (let i = 0; i < 2; i++) {
            const newBall = new Ball(this, baseBall.x, baseBall.y);
            newBall.inMotion = true;
            newBall.isStuck = false;
            newBall.setFire(baseBall.isFire);

            // 角度を少し変えて発射
            const angle = Math.random() * Math.PI / 2 + Math.PI / 4;
            newBall.dx = Math.cos(angle) * newBall.speed * (Math.random() < 0.5 ? 1 : -1);
            newBall.dy = -Math.sin(angle) * newBall.speed;

            this.balls.push(newBall);
        }
    }

    resize() {
        if (!this.canvas) return;
        const container = this.canvas.parentElement;
        if (!container) return;

        this.canvas.width = container.clientWidth || window.innerWidth;
        this.canvas.height = container.clientHeight || window.innerHeight;

        this.width = this.canvas.width;
        this.height = this.canvas.height;

        if (this.paddle) this.paddle.update(0);

        if (!this.isRunning) {
            this.draw();
        }
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.startTime = Date.now();
        requestAnimationFrame((ts) => this.loop(ts));
        document.getElementById('message').classList.add('hidden');
    }

    gameOver() {
        this.isRunning = false;
        const msg = document.getElementById('message');
        if (msg) {
            msg.textContent = 'GAME OVER - Click to Retry';
            msg.classList.remove('hidden');
        }
        this.resetGame();
    }

    resetGame() {
        this.score = 0;
        this.updateScore(0);
        this.resetBalls();
        this.paddle.reset();
        this.createBlocks();
        this.particles = [];
        this.powerUps = [];
        this.isRunning = false;
        this.updateTimer(0);
    }

    win() {
        this.isRunning = false;
        const msg = document.getElementById('message');
        if (msg) {
            msg.textContent = `YOU WIN! Time: ${this.formatTime(this.elapsedTime)} - Click to Play Again`;
            msg.classList.remove('hidden');
        }
        this.resetGame();
    }

    loop(timestamp) {
        if (!this.isRunning) return;

        const deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        // 経過時間更新
        this.elapsedTime = (Date.now() - this.startTime) / 1000;
        this.updateTimer(this.elapsedTime);

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame((ts) => this.loop(ts));
    }

    update(dt) {
        if (this.paddle) this.paddle.update(dt);

        // パワーアップ更新
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const p = this.powerUps[i];
            p.update(dt);
            if (!p.active) this.powerUps.splice(i, 1);
        }

        // ボール更新と削除
        for (let i = this.balls.length - 1; i >= 0; i--) {
            const ball = this.balls[i];
            ball.update(dt);

            if (ball.y - ball.radius > this.height) {
                this.balls.splice(i, 1);
            }
        }

        // 全ボールロスト判定
        if (this.balls.length === 0) {
            this.gameOver();
            return;
        }

        // ブロック衝突判定
        let activeBlocks = 0;
        this.blocks.forEach(block => {
            if (block.active) {
                activeBlocks++;
                for (const ball of this.balls) {
                    if (this.checkCollision(ball, block)) {
                        block.active = false;

                        if (!ball.isFire) {
                            ball.dy = -ball.dy;
                        }

                        this.score += 100;
                        this.updateScore(this.score);

                        this.createExplosion(
                            block.x + block.width / 2,
                            block.y + block.height / 2,
                            block.color
                        );

                        this.spawnPowerUp(block.x + block.width / 2, block.y);
                    }
                }
            }
        });

        // パーティクル更新
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update(dt);
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        if (activeBlocks === 0 && this.blocks.length > 0) {
            this.win();
        }
    }

    checkCollision(ball, block) {
        const ballLeft = ball.x - ball.radius;
        const ballRight = ball.x + ball.radius;
        const ballTop = ball.y - ball.radius;
        const ballBottom = ball.y + ball.radius;

        const blockLeft = block.x;
        const blockRight = block.x + block.width;
        const blockTop = block.y;
        const blockBottom = block.y + block.height;

        if (ballRight > blockLeft &&
            ballLeft < blockRight &&
            ballBottom > blockTop &&
            ballTop < blockBottom) {
            return true;
        }
        return false;
    }

    updateScore(newScore) {
        this.score = newScore;
        const scoreEl = document.getElementById('score');
        if (scoreEl) scoreEl.textContent = `Score: ${this.score}`;
    }

    updateTimer(seconds) {
        const timerEl = document.getElementById('timer');
        if (timerEl) {
            timerEl.textContent = `Time: ${this.formatTime(seconds)}`;
        }
    }

    formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    draw() {
        this.ctx.fillStyle = '#1e293b';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.blocks.forEach(block => block.draw(this.ctx));
        if (this.paddle) this.paddle.draw(this.ctx);
        this.balls.forEach(ball => ball.draw(this.ctx));
        this.powerUps.forEach(p => p.draw(this.ctx));

        this.ctx.globalCompositeOperation = 'lighter';
        this.particles.forEach(p => p.draw(this.ctx));
        this.ctx.globalCompositeOperation = 'source-over';

        if (!this.isRunning) {
            const msg = document.getElementById('message');
            if (msg && msg.classList.contains('hidden') && this.score === 0) {
                msg.classList.remove('hidden');
                msg.textContent = 'Click to Start';
            }
        }
    }
}
