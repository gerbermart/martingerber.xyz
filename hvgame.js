var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");
var ballRadius = 10;
var x = canvas.width / 2;
var y = canvas.height - 30;
var paddleHeight = 10;
var paddleWidth = 75;
var paddleX = (canvas.width - paddleWidth) / 2;
var rightPressed = false;
var leftPressed = false;
var brickRowCount = 3;
var brickColumnCount = 5;
var brickWidth = 75;
var brickHeight = 20;
var brickPadding = 10;
var brickOffsetTop = 30;
var brickOffsetLeft = 30;
var bricks = [];
var lives = 3; // Number of lives
var gameRunning = true;
var level = 1;
const initialCountdown = 3;
var countdown = initialCountdown;
var ballSpeed = 2.5; // Initial ball speed
var ballSpeedOne = ballSpeed; // life-level, level-level ball speed
var initialAngle = Math.PI/4 + (Math.random() * Math.PI/2);
var dx = ballSpeed * Math.cos(initialAngle);
var dy = -ballSpeed * Math.sin(initialAngle);
var acceleration = 5; // in percent-per-paddle-collision
var score = 0;
var paddleSpeed=1.5; // multiplier on the ball speed 
var colorBricksOne = "#2b8c00";
var colorBricksTwo = "#0052cc";
var colorBricksThree = "#b64917";

// Create the bricks
for (var c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (var r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: brickRowCount - r, color: colorBricksOne };
    }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = true;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = false;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = false;
    }
}

// Touch event listeners
canvas.addEventListener("touchstart", touchStartHandler, false);
canvas.addEventListener("touchend", touchEndHandler, false);

function touchStartHandler(e) {
  var touchX = e.changedTouches[0].clientX;
  if (touchX < paddleX + paddleWidth / 2) {
    leftPressed = true;
  } else if (touchX > paddleX + paddleWidth / 2) {
    rightPressed = true;
  }
}

function touchEndHandler(e) {
  leftPressed = false;
  rightPressed = false;
}


function collisionDetection() {
    var ballReflectedVertically = false; // Track if the ball has been reflected vertically
    var ballReflectedHorizontally = false; // Track if the ball has been reflected vertically

    for (var c = 0; c < brickColumnCount; c++) {
        for (var r = 0; r < brickRowCount; r++) {
            var brick = bricks[c][r];
            if (brick.status > 0) {
                var brickLeft = brick.x;
                var brickRight = brick.x + brickWidth;
                var brickTop = brick.y;
                var brickBottom = brick.y + brickHeight; // THESE ARE INVERTED!!

                if ( // inside the radius-buffered box, mwg
                    x > brickLeft - ballRadius &&
                    x < brickRight + ballRadius &&
                    y > brickTop - ballRadius &&
                    y < brickBottom + ballRadius
                ) {
                    brick.status--; // Decrease the hit count

                    if (brick.status === 0) {
                        var points = 10 * level * (brickRowCount - r);
                        score += points;
                        console.log("Brick destroyed:", brick);
                        console.log("Points earned:", points);
                        console.log("Total Score:", score);
                    } else if (brick.status === 2) {
                        brick.color = colorBricksTwo; // Change to Yellow
                    } else if (brick.status === 1) {
                        brick.color = colorBricksThree; // Change to Red
                    }

                    // Perform reflection based on the collision side
                    var hitFromTop = false;
                    var hitFromBottom = false;
                    var hitFromLeft = false;
                    var hitFromRight = false;

                    if ( // inside the radius-buffered box, mwg
                        x > brickLeft - ballRadius/2 &&
                        x < brickRight + ballRadius/2 &&
                        y > brickBottom &&
                        y < brickBottom + ballRadius
                    ) {
                        hitFromBottom = true;
                    } else if (x > brickLeft - ballRadius/2 &&
                        x < brickRight + ballRadius/2 &&
                        y > brickTop - ballRadius &&
                        y < brickTop) 
                    {
                        hitFromBottom = true;
                    } else if (x > brickLeft - ballRadius &&
                        x < brickLeft &&
                        y > brickTop - ballRadius/2 &&
                        y < brickBottom + ballRadius/2
                    ) {
                        hitFromLeft = true;
                    } else if (x > brickRight &&
                        x < brickRight + ballRadius &&
                        y > brickTop - ballRadius/2 &&
                        y < brickBottom + ballRadius/2
                    ) {
                        hitFromRight = true;
                    }
                     
                    if ((hitFromTop || hitFromBottom) && !ballReflectedVertically) {
                        // Ball hit from top
                        dy = -dy;
                        ballReflectedVertically = true;
                        hitFromLeft = false;
                        hitFromRight = false;
                    }
                    
                    // Ball hit from left or right
                    if ((hitFromRight || hitFromLeft) && !ballReflectedHorizontally) {
                        // Ball hit from top
                        dx = -dx;
                        ballReflectedHorizontally = true;
                        hitFromTop = false;
                        hitFromBottom = false;
                    } 
                }
                    
            }
        }
    }


    // Paddle collision detection
    if (
        y + dy > canvas.height - ballRadius - paddleHeight &&
        y + dy < canvas.height - ballRadius &&
        x + dx > paddleX - ballRadius &&
        x + dx < paddleX + ballRadius + paddleWidth * Math.pow(0.8, level - 1)
    ) {
        var collisionPoint = x - (paddleX + paddleWidth / 2);
        var maxAngle = 45; // Adjust this angle as needed

        // Calculate the reflection angle based on the collision point
        var reflectionAngle = (collisionPoint / (paddleWidth / 2)) * (maxAngle * Math.PI / 180);

        // Update the velocity angle while maintaining the speed
        var angle = Math.atan2(dy, dx); // Get the current angle
        angle -= reflectionAngle; // Apply the reflection angle

        // accelerate the ball
        ballSpeed *= (1+acceleration/100);

        // Update the velocity components
        dx = Math.cos(angle) * ballSpeed; // Update the x-component of velocity
        dy = -Math.sin(angle) * ballSpeed; // Update the y-component of velocity

        console.log("Ball hit paddle");
    }
}



function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius * Math.pow(0.8, level - 1), 0, Math.PI * 2);
    ctx.fillStyle = colorBricksOne;
    ctx.fill();
    ctx.closePath();
}


function drawPaddle() {
    ctx.beginPath();
    ctx.rect(
        paddleX + (paddleWidth * (1 - Math.pow(0.8, level - 1))) / 2,
        canvas.height - paddleHeight,
        paddleWidth * Math.pow(0.8, level - 1),
        paddleHeight
    );
    ctx.fillStyle = colorBricksOne;
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (var c = 0; c < brickColumnCount; c++) {
        for (var r = 0; r < brickRowCount; r++) {
            var brick = bricks[c][r];
            if (brick.status > 0) {
                var brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                var brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                brick.x = brickX;
                brick.y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = brick.color;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = colorBricksOne;
    ctx.textAlign = "end"; // Align the text to the end position (right)
    ctx.fillText("Lives: " + lives, canvas.width - 10, 20);
}

function drawLevel() {
    ctx.font = "16px Arial";
    ctx.fillStyle = colorBricksOne;
    ctx.textAlign = "start"; // Align the text to the start position (left)
    ctx.fillText("Level: " + level, 10, 20);
}

function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = colorBricksOne;
    ctx.textAlign = "center"; // Align the text to the center position
    ctx.fillText("Score: " + score, canvas.width / 2, 20);
}

function drawCountdown() {
    ctx.font = "16px Arial";
    ctx.fillStyle = colorBricksOne;
    ctx.textAlign = "start"; // Align the text to the start position
    ctx.fillText(
        "Get ready for Level " + level + " in " + countdown,
        canvas.width / 2,
        canvas.height / 2
    );
}

function startNextLevel() {
    resetBall();
    resetPaddle();
    resetBricks();
    level++;
    countdown = initialCountdown;
    setTimeout(function () {
        gameRunning = true;
        draw();
    }, 2000); // Start the game after 5 seconds
}

function startNextLife() {
    resetBall();
    resetPaddle();
    countdown = initialCountdown;
    setTimeout(function () {
        gameRunning = true;
        draw();
    }, 2000); // Start the game after 5 seconds
}

function resetBall() {
    x = canvas.width / 2;
    y = canvas.height - 30;

    ballSpeed = ballSpeedOne*Math.pow(1.2, 1 - level); // Increase ball speed
    
    initialAngle = Math.PI/4 + (Math.random() * Math.PI/2);
    dx = ballSpeed * Math.cos(initialAngle);
    dy = -ballSpeed * Math.sin(initialAngle);

    ballRadius *= Math.pow(0.8, level - 1); // Decrease ball radius
}

function resetPaddle() {
    paddleX = (canvas.width - paddleWidth * Math.pow(0.8, level - 1)) / 2;
}

function resetBricks() {
    for (var c = 0; c < brickColumnCount; c++) {
        for (var r = 0; r < brickRowCount; r++) {
            bricks[c][r].status = brickRowCount - r; // Reset the hit count
            bricks[c][r].color = colorBricksOne; // Reset the color to Blue
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawLives();
    drawLevel();
    drawScore();

    if (countdown > 0) {
        drawCountdown();
        countdown--;
        setTimeout(draw, 1000);
        return;
    }

    collisionDetection();

    x += dx;
    y += dy;

    if (rightPressed && paddleX < canvas.width - paddleWidth * Math.pow(0.8, level - 1)) {
        paddleX += paddleSpeed * ballSpeed;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= paddleSpeed * ballSpeed;
    }

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
        console.log("Ball hit horizontal wall");
    }
    if (y + dy < ballRadius) {
        dy = -dy;
        console.log("Ball hit vertical wall");
    } else if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth * Math.pow(0.8, level - 1)) {
            dy = -dy;
            console.log("Ball hit paddle");
        } else {
            lives--;
            if (lives === 0) {
                console.log("GAME OVER");
                gameRunning = false;
                showGameOverText("GAME OVER");
            } else {
                gameRunning = false;
                if (lives>1) {
                    showGameOverText(lives + " LIVES LEFT");
                } else {
                    showGameOverText(lives + " LIFE LEFT");
                }
                setTimeout(startNextLife, 2000);
            }
        }
    }

    var brickCount = brickRowCount * brickColumnCount;
    var destroyedBrickCount = 0;
    for (var c = 0; c < brickColumnCount; c++) {
        for (var r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 0) {
                destroyedBrickCount++;
            }
        }
    }
    if (destroyedBrickCount === brickCount) {
        gameRunning = false;
        console.log("YOU WIN");
        showGameOverText("YOU WIN");
        setTimeout(startNextLevel, 2000);
    }

    if (gameRunning) {
        requestAnimationFrame(draw);
    }
}

function showGameOverText(text) {
    ctx.font = "48px Arial";
    ctx.fillStyle = colorBricksOne;
    ctx.textAlign = "center";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    ctx.font = "24px Arial";
    ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 + 50);
}

draw();