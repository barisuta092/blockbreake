export class Paddle {
    constructor(game) {
        this.game = game;
        this.defaultWidth = 120;
        this.width = this.defaultWidth;
        this.height = 20;
        this.x = game.width / 2 - this.width / 2;
        this.y = game.height - 40;
        this.color = '#38bdf8'; // Sky blue

        this.isSticky = false;

        this.setupInput();
    }

    reset() {
        this.width = this.defaultWidth;
        this.isSticky = false;
        this.color = '#38bdf8';
    }

    setWidth(width) {
        this.width = width;
        // 中心を維持するように調整したいが、マウス追従なのでupdateで即補正される
        // 色を変えると分かりやすいかも
        if (width > this.defaultWidth) {
            // this.color = '#38bdf8'; // 色はそのまま
        }
    }

    setSticky(sticky) {
        this.isSticky = sticky;
        this.color = sticky ? '#c084fc' : '#38bdf8';
    }

    setupInput() {
        // マウス操作: 画面上のX座標をパドルの中心に合わせる
        document.addEventListener('mousemove', (e) => {
            const rect = this.game.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;

            this.x = mouseX - this.width / 2;

            // 画面端の制限
            if (this.x < 0) this.x = 0;
            if (this.x + this.width > this.game.width) this.x = this.game.width - this.width;
        });

        // クリックでボール発射 (Sticky時)
        document.addEventListener('click', () => {
            if (this.isSticky) {
                this.game.releaseBall();
            }
        });
    }

    update(dt) {
        // リサイズ対応でY位置を更新
        this.y = this.game.height - 40;
    }

    draw(ctx) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, 5);
        ctx.fill();

        ctx.shadowBlur = 0; // リセット
    }
}
