import { stage } from './lungBrickData.js';

const canvas = document.getElementById("gameCanvas");
const infoButton = document.querySelector("#quit button");
const context = canvas.getContext("2d");
const ballRadius = 10;
const paddleHeight = 10;
const paddleWidth = 95;
const paddleY = canvas.height - paddleHeight - 50;
const brickRowCount = 35;
const brickColumnCount = 42;
const brickWidth = 8;
const brickHeight = 8;
const brickPadding = 5;
const brickOffsetTop = 80;
const brickOffsetLeft = 30;

const state = {
	x: canvas.width / 2,
	y: paddleY,
	dx: 2,
	dy: -2,
	paddleX: (canvas.width - paddleWidth) / 2,
	rightPressed: false,
	leftPressed: false,
	bricks: [],
	lives: 3,
	health: 100,
};

const createBricks = (stage) => {
	const bricks = [];
	for (let row = 0; row < brickRowCount; row++) {
		bricks[row] = [];
		for (let col = 0; col < brickColumnCount; col++) {
			bricks[row][col] = { x: 0, y: 0, status: 1 };
			if (stage[row][col] === "■") {
				bricks[row][col] = { x: 0, y: 0, status: 1 };
			} else {
				bricks[row][col] = { x: 0, y: 0, status: 0 };
			}
		}
	}
	return bricks;
};

const updateState = (newState) => {
	Object.assign(state, newState);
};

const alertMessage = (message) => {
    alert(message);
    document.location.reload();
    clearInterval(interval);
}

const movePaddle = () => {
	updateState({
		paddleX:
			state.rightPressed && state.paddleX < canvas.width - paddleWidth
				? state.paddleX + 7
				: state.leftPressed && state.paddleX > 0
				? state.paddleX - 7
				: state.paddleX,
	});
};

const moveBall = () => {
	updateState({
		x: state.x + state.dx,
		y: state.y + state.dy,
	});

	if (
		state.x + state.dx > canvas.width - ballRadius ||
		state.x + state.dx < ballRadius
	) {
		updateState({ dx: -state.dx });
	}
	if (state.y + state.dy < ballRadius) {
		updateState({ dy: -state.dy });
	} else if (state.y + state.dy > paddleY) {
		// 패들과 충돌 시 반사
		if (
			state.x > state.paddleX &&
			state.x < state.paddleX + paddleWidth &&
			state.y + state.dy > paddleY
		) {
			updateState({ dy: -state.dy });
		} else {
			if (state.lives === 0) {
				alertMessage("게임 오버. 담배는 해악입니다.");
			} else {
				gameRestart();
			}
		}
	}
};

const collisionDetection = () => {
	const bricks = state.bricks.map((column) => column.map((brick) => brick));
	for (let row = 0; row < brickRowCount; row++) {
		for (let col = 0; col < brickColumnCount; col++) {
			const brick = bricks[row][col];
			if (
				brick.status === 1 &&
				state.x > brick.x &&
				state.x < brick.x + brickWidth &&
				state.y > brick.y &&
				state.y < brick.y + brickHeight
			) {
				updateState({ dy: -state.dy });
				brick.status = 0;
				updateHealth();
			}
		}
	}
};

const draw = () => {
	context.clearRect(0, 0, canvas.width, canvas.height);
	drawBricks();
	drawPaddle();
	drawLives();
	drawHealth();
	collisionDetection();
};

const startGame = () => {
	draw();
	drawBall();
	moveBall();
	movePaddle();
	requestAnimationFrame(startGame);
};

const drawLives = () => {
	context.font = "30px sans-serif";
	for (let i = 0; i < state.lives; i++) {
		context.fillText("🚬", canvas.width - 150 + i * 45, 35);
	}
};

const drawHealth = () => {
	context.font = "20px sans-serif";
	context.fillStyle = "#ffffff";
	context.fillText(`Health : ${state.health}%`, 20, 30);
};

const drawPaddle = () => {
	context.beginPath();
	context.rect(state.paddleX + 20, paddleY, paddleWidth - 20, paddleHeight);
	context.fillStyle = "#ffffff";
	context.fill();
	context.closePath();

	context.beginPath();
	context.rect(state.paddleX, paddleY, 20, paddleHeight);
	context.fillStyle = "#E29F8F";
	context.fill();
	context.closePath();
};

const drawBall = () => {
	context.beginPath();
	context.rect(state.x, state.y, 10, 10);
	context.fillStyle = "#ffffff";
	context.fill();
	context.closePath();
};

const drawBricks = () => {
	state.bricks.forEach((rowBrick, row) => {
		rowBrick.forEach((brick, col) => {
			if (brick.status === 1) {
				const brickY =
					col * (brickWidth + brickPadding) + brickOffsetLeft;
				const brickX =
					row * (brickHeight + brickPadding) + brickOffsetTop;
				brick.x = brickY;
				brick.y = brickX;
				context.beginPath();
				context.rect(brickY, brickX, brickWidth, brickHeight);
				context.fillStyle = "#ffffff";
				context.fill();
				context.closePath();
			}
		});
	});
};

const updateHealth = () => {
	if (state.health === 2) {
		updateState({ health: 0 });
		drawHealth();
		setTimeout(() => {
			alertMessage("당신은 죽었습니다. 담배는 해악입니다.");
		}, 100);
	}else if(state.health < 2){
        return; 
    }
    else {
		const health = state.health - 2;
		updateState({ health });
	}
};

const keyDownHandler = (e) => {
	updateState({ rightPressed: e.key === "Right" || e.key === "ArrowRight" });
	updateState({ leftPressed: e.key === "Left" || e.key === "ArrowLeft" });
};

const keyUpHandler = (e) => {
	updateState({ rightPressed: false });
	updateState({ leftPressed: false });
};

const mouseMoveHandler = (e) => {
	const relativeX = e.clientX - canvas.offsetLeft;
	if (relativeX > 0 && relativeX < canvas.width) {
		updateState({ paddleX: relativeX - paddleWidth / 2 });
	}
};

const gameButtonSetting = () => {
	infoButton.textContent = "Quit Smoking.";
	infoButton.addEventListener("click", () => {
		alertMessage("담배는 해악입니다.");
	});
	canvas.style.cursor = "default";
	startGame();
};

const gameRestart = () => {
	const nowLives = state.lives - 1;
	updateState({
		lives: nowLives,
		x: canvas.width / 2,
		y: paddleY,
		paddleX: (canvas.width - paddleWidth) / 2,
	});
};

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);
canvas.addEventListener("click", gameButtonSetting, { once: true });

const initializeGame = () => {
	updateState({
		bricks: createBricks(stage),
	});
};

const ReadyGame = () => {
	initializeGame();
	draw();
};

ReadyGame();
