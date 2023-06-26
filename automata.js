class Automata {
    constructor(game) {
        Object.assign(this, { game });

        this.game = game;
        this.automata = [];
        this.size = 5;
        this.height = parseInt(this.game.surfaceHeight / this.size, 10);
        this.width = parseInt(this.game.surfaceWidth / this.size, 10);

        this.tickCount = 0;
        this.ticks = 0;

        this.speed = parseInt(document.getElementById("speed").value, 10);

        for (let col = 0; col < this.width; col++) {
            this.automata.push([]);
            for (let row = 0; row < this.height; row++) {
                this.automata[col][row] = 0;
            }
        }
        this.loadRandomAutomata();
    };

    loadRandomAutomata() {
        for (let col = 0; col < this.width; col++) {
            for (let row = 0; row < this.height; row++) {
                this.automata[col][row] = randomInt(2);
            }
        }
    };

    count(col, row) {
        let count = 0;
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                if ((i || j) && this.automata[col + i] && this.automata[col + i][row + j]) {
                    count++;
                }
            }
        }
        return count;
    };

    update() {
        this.speed = parseInt(document.getElementById("speed").value, 10);
        this.size = parseInt(document.getElementById("size").value, 10);
        // this.height = parseInt(this.game.surfaceHeight / this.size, 10);
        // this.width = parseInt(this.game.surfaceWidth / this.size, 10);

        if (this.tickCount++ >= this.speed && this.speed != 120) {
            this.tickCount = 0;
            this.ticks++;
            document.getElementById('ticks').innerHTML = "Ticks: " + this.ticks;
            document.getElementById('cell_size_label').innerHTML = "Cell Size: " + this.size;

            let next = [];
            for (let col = 0; col < this.width; col++) {
                next.push([]);
                for (let row = 0; row < this.height; row++) {
                    next[col].push(0);
                }
            }

            // The rules of the Game of life:
            for (let col = 0; col < this.width; col++) {
                for (let row = 0; row < this.height; row++) {
                    if (this.automata[col][row] && (this.count(col, row) === 2 || this.count(col, row) === 3)) {
                        next[col][row] = 1;
                    }
                    if (this.automata[col][row] && this.count(col, row) < 2) {
                        next[col][row] = 0;
                    }
                    if (this.automata[col][row] && this.count(col, row) > 3) {
                        next[col][row] = 0;
                    }
                    if (!this.automata[col][row] && this.count(col, row) === 3) {
                        next[col][row] = 1;
                    }
                }
            }
            this.automata = next;
        }
    };

    draw(ctx) {
        // Gap size proportional to the cell size
        let gap = this.size / 5;

        var img = document.getElementById("emoji");
        // Create a pattern, offscreen
        const patternCanvas = document.createElement("canvas");
        const patternContext = patternCanvas.getContext("2d");

        // Give the pattern a width and height according to the cell size
        patternCanvas.width = this.size;
        patternCanvas.height = this.size;
        patternContext.drawImage(img, gap, gap, patternCanvas.width - 2 * gap, patternCanvas.height - 2 * gap)

        const pattern = ctx.createPattern(patternCanvas, "repeat");
        ctx.fillStyle = pattern;
        // Drawing each cell starting from the top left corner, which is automata[0][0]
        for (let col = 0; col < this.width; col++) {
            for (let row = 0; row < this.height; row++) {
                let cell = this.automata[col][row];
                if (cell) {
                    ctx.fillRect(col * this.size + gap, row * this.size + gap, this.size - 2 * gap, this.size - 2 * gap);
                }
            }
        }
    };

};
