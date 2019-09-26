let canvas = document.getElementById("canvas");
let ctx = canvas.getContext('2d');

const bitWidth = 20; // The height and width of our snake bits
let queue = null;    // We'll use this to hold onto the next move if they make two within the same frame

// Load high score if it's set
if (localStorage.getItem("high-score")) {
	document.getElementById("high-score").innerHTML = "High Score: " + localStorage.getItem("high-score");
}

class Bit {
	constructor(parent) {
		this.x0 = parent.x0;
		this.y0 = parent.y0;

		this.y = parent.y;
		this.x = parent.x;


		if (this.x0 > 0) {
			this.x -= bitWidth;
		}
		if (this.x0 < 0) {
			this.x += bitWidth;
		}

		if (this.y0 > 0) {
			this.y -= bitWidth;
		}
		if (this.y0 < 0) {
			this.y += bitWidth;
		}
	}

	update(parent) {

		if (this.x0 > 0) {
			this.x += bitWidth;
		}
		if (this.x0 < 0) {
			this.x -= bitWidth;
		}
		if (this.y0 > 0) {
			this.y += bitWidth;
		}
		if (this.y0 < 0) {
			this.y -= bitWidth;
		}

		if (parent) {
			this.x0 = parent.x0;
			this.y0 = parent.y0;
		}
	}
}

let Game = {
	ticks: 0,
	lastMovedTick: 0,
	snek: {
		direction: "right",
		dead: false,
		score: 0,
		applesEaten: 0,
		bits: [
			new Bit({
				x0: 1,
				y0: 0,
				x: 120,
				y: 100
			})
		]
	},
	apple: {
		x: 160,
		y: 100
	}
}




document.addEventListener("keydown", (e) => {
	let snekHead = Game.snek.bits[0];
	let enqueueMove = false;
	let move = null;
	if (Game.lastMovedTick === Game.ticks) {
		// One move per tick
		// After that, queue up the next move (like if you do a quick down+left sorta deal)
		enqueueMove = true;
	}

	let direction = Game.snek.direction;
	switch (e.which) {
		case 38: // Up
			if (Game.snek.direction === "down") {
				return;
			}
			move = () => {
				snekHead.x0 = 0;
				snekHead.y0 = -1;
				Game.snek.direction = "up";
			}
		break;
		case 40: // Down
			if (Game.snek.direction === "up") {
				return;
			}
			move = () => {
				snekHead.x0 = 0;
				snekHead.y0 = 1;
				Game.snek.direction = "down";
			}
		break;
		case 37: // Left
			if (Game.snek.direction === "right") {
				return;
			}
			move = () => {
				snekHead.x0 = -1;
				snekHead.y0 = 0;
				Game.snek.direction = "left";
			}
		break;
		case 39: // Right
			if (Game.snek.direction === "left") {
				return;
			}
			move = () => {
				snekHead.x0 = 1;
				snekHead.y0 = 0;
				Game.snek.direction = "right";
			}
		break;
	}

	if (!move) {
		return;
	}

	if (enqueueMove) {
		queue = move;
	} else {
		move();
		// If we moved, update lastMovedTick
		if (direction !== Game.snek.direction) {
			Game.lastMovedTick = Game.ticks;
		}
	}

});

// Add some bits for our snek
for (let i = 0; i < 4; i++) {
	Game.snek.bits.push(new Bit(Game.snek.bits[i]));
}

function updateSnek() {
	for (let i = Game.snek.bits.length - 1; i >= 0; i--) {
		let parent = null;
		if (i > 0) {
			parent = Game.snek.bits[i - 1];
		}
		Game.snek.bits[i].update(parent);
	}
	// Check head and see if it has collided with something
	let head = Game.snek.bits[0];
	if (!Game.snek.dead) {
		// Check if we hit the edge of the world
		if (head.x === 0 || head.y === 0 || (head.x + bitWidth) > canvas.width || (head.y + bitWidth) > canvas.height) {
			gameOver();
		}
		// Check if we ate ourself
		Game.snek.bits.forEach((bit, i) => {
			if (i > 0) {
				// Don't check head
				if (head.x === bit.x && head.y === bit.y) {
					gameOver();
				}
			}
		});
		// Check if we ate an apple
		if (head.x === Game.apple.x && head.y === Game.apple.y) {
			eatApple();
		}
	}
	if (queue) {
		queue();
		queue = null;
	}
}

function eatApple() {
	console.log("nom!");
	Game.snek.score++;
	Game.snek.bits.push(new Bit(Game.snek.bits[Game.snek.bits.length - 1]));
	spawnApple();
	document.getElementById("score").innerHTML = "Score: " + Game.snek.score;
}

function spawnApple() {
	Game.apple.x = Math.ceil(Math.floor(Math.random() * (canvas.width - bitWidth)) / bitWidth) * bitWidth;
	Game.apple.y = Math.ceil(Math.floor(Math.random() * (canvas.height - bitWidth)) / bitWidth) * bitWidth;
	if (Game.apple.x === 0) {
		Game.apple.x = bitWidth;
	}
	if (Game.apple.y === 0) {
		Game.apple.y = bitWidth;
	}
	// Make sure it's not on snek
	if (Game.snek.bits.some(bit => bit.x === Game.apple.x && bit.y === Game.apple.y)) {
		// New apple
		spawnApple();
	}
	console.log(Game.apple);
}

function gameOver() {
	Game.snek.dead = true;
	console.log("Snek dead!");
	console.log("Score: ", Game.snek.score);
	let currentHighScore = localStorage.getItem("high-score") || 0;
	if (Game.snek.score > currentHighScore) {
		localStorage.setItem("high-score", Game.snek.score);
		document.getElementById("high-score").innerHTML = "High Score: " + Game.snek.score;
	}

}


function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	// background
	ctx.fillStyle = "#cccccc";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.strokeWidth = "1";
	ctx.strokeStyle = "white";
	Game.snek.bits.forEach((bit, index) => {
		// Make the snake's head a little darker than its body
		let bitColor = (index === 0) ? "#123b71" :  "#3e70b3";
		ctx.fillStyle = (Game.snek.dead) ? "red" : bitColor;
		ctx.fillRect(bit.x, bit.y, bitWidth, bitWidth);
		ctx.strokeRect(bit.x, bit.y, bitWidth, bitWidth);
	});
}

function drawGrid() {
	// Draw y lines
	ctx.strokeStyle = "#eee";

	// horizontal
	for (let y = bitWidth; y < canvas.height; y += bitWidth) {
		ctx.beginPath();
		ctx.moveTo(0, y);
		ctx.lineTo(canvas.width, y);
		ctx.stroke();
	}

	// vertical
	for (let y = bitWidth; y < canvas.width; y += bitWidth) {
		ctx.beginPath();
		ctx.moveTo(y, 0);
		ctx.lineTo(y, canvas.width);
		ctx.stroke();
	}
}

function drawApple() {
	// Make the apple a little smaller than our regular bitWidth
	const widthOffset = 4; // We'll go 4px smaller
	ctx.strokeStyle = "#000000";
	ctx.fillStyle = "white";
	ctx.strokeWidth = "1";
	ctx.fillRect(Game.apple.x + widthOffset, Game.apple.y + widthOffset, bitWidth - (widthOffset * 2), bitWidth - (widthOffset * 2));
	ctx.strokeRect(Game.apple.x + widthOffset, Game.apple.y + widthOffset, bitWidth - (widthOffset * 2), bitWidth - (widthOffset * 2));
}

function render() {
	setTimeout(() => {
		if (!Game.snek.dead) {
			updateSnek();
		}
		draw();
		drawGrid();
		drawApple();
		Game.ticks++;
		requestAnimationFrame(render);
	}, 1000 / (10 + ( Game.snek.applesEaten / 1.5 )));
}

render();

