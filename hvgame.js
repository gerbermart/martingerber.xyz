var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");
var ballRadius = 10;
var ballShrink = 0.95;
var paddleShrink = 0.8;
var paddleHeight = 10;
var paddleWidth = 125;
var paddleX = (canvas.width - paddleWidth) / 2;
var paddleY = canvas.height - 25;
var levelSpeedDelta = 1.2;
var x = canvas.width / 2;
var y = paddleY - 30;
var rightPressed = false;
var leftPressed = false;
const initialColumns = 5;
const initialRows = 3;
var brickRowCount = initialRows;
var brickColumnCount = initialColumns;
var brickWidth = 75;
var brickHeight = 20;
var brickPadding = 10;
var brickOffsetTop = 30;
var brickOffsetLeft = 30;
var bricks = [];
var lives = 3; // Number of lives
var gameRunning = true;
var gameStarted = false;
var gameFinished = false;
var level = 1;
const initialCountdown = 3;
var countdown = initialCountdown;
var ballSpeedOne = 2.5; // life-level, level-level ball speed
var ballSpeed = ballSpeedOne; // Initial ball speed
var initialAngle = Math.PI/4 + (Math.random() * Math.PI/2);
var dx = ballSpeed * Math.cos(initialAngle);
var dy = -ballSpeed * Math.sin(initialAngle);
var acceleration = 5; // in percent-per-paddle-collision
var score = 0;
var paddleSpeed=1.5; // multiplier on the ball speed 
var colorBricksOne = "#2b8c00";
var colorBricksTwo = "#0052cc";
var colorBricksThree = "#b64917";
var oldHighScore = 2940;
var oldTopScore = 0;
var playerName = "";
var highScoreAddress = ""; // Variable to store the wallet address
        

// Create the bricks
for (var c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (var r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: brickRowCount - r, color: colorBricksOne };
    }
}


var tracks = [
    "1_DICE.mp3",
    "3_VOLTA.mp3",
    "4_ASSEMBLY.mp3",
    "6_SINE.mp3",
    "7_FORBIDDEN.mp3",
    "10_BAMBOO.mp3",
    "11_SHIFT.mp3"
];

var tracknames = [
    "Not Playing Dice",
    "Volta",
    "Assembly",
    "Sinusoidal",
    "Forbidden Regions",
    "Bamboo",
    "Shift"
];

var currentTrackIndex = 0;
var audio = document.getElementById("player")

async function playNextTrack() {
    audio.src = 'hvgame/' + tracks[currentTrackIndex];
    audio.play();
    ctx.font = "14px Arial";
    ctx.fillStyle = colorBricksOne;
    ctx.textAlign = "center";
    ctx.fillText("SONG: " + tracknames[currentTrackIndex].toUpperCase(), canvas.width / 2, canvas.height);
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length; // Loop to the next track
}

//audio.addEventListener("ended", playNextTrack);

// Start playing the first track
//playNextTrack();

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
document.addEventListener("touchstart", touchStartHandler, false);
document.addEventListener("touchend", touchEndHandler, false);
document.addEventListener("touchmove", touchMoveHandler, { passive: false });

// Disable pinch-to-zoom and double-tap-to-zoom
document.addEventListener('gesturestart', function (e) {
    e.preventDefault();
});

function touchMoveHandler(e) {
    e.preventDefault();
}

function touchStartHandler(e) {
    if (!gameStarted) {
        playNextTrack();
        gameStarted = true;
        draw(); // Start the first draw event
    }
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
        y + dy > paddleY - ballRadius - paddleHeight &&
        y + dy < paddleY - ballRadius - paddleHeight &&
        x + dx > paddleX - ballRadius &&
        x + dx < paddleX + ballRadius + paddleWidth
    ) {
        var collisionPoint = x - (paddleX + paddleWidth / 2);
        var maxAngle = 30; // Adjust this angle as needed

        // Calculate the reflection angle based on the collision point
        var reflectionAngle = (collisionPoint / (paddleWidth / 2)) * (maxAngle * Math.PI / 180);

        // Update the velocity angle while maintaining the speed
        var angle = Math.atan2(dy, dx); // Get the current angle
        angle -= reflectionAngle; // Apply the reflection angle

        // accelerate the ball
        ballSpeed *= (1+acceleration/100);

        // Update the velocity components
        //dx = Math.cos(angle) * ballSpeed; // Update the x-component of velocity
        //dy = -Math.sin(angle) * ballSpeed; // Update the y-component of velocity
        dy = -ballSpeed;
        dx = ballSpeed/Math.tan(angle);
        
        console.log("Ball hit paddle");
    }
}



function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius * Math.pow(ballShrink, level - 1), 0, Math.PI * 2);
    ctx.fillStyle = colorBricksOne;
    ctx.fill();
    ctx.closePath();
}


function drawPaddle() {
    ctx.beginPath();
    ctx.rect(
        paddleX,
        paddleY - paddleHeight,
        paddleWidth,
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
    level++;
    paddleWidth*=paddleShrink;
    resetBall();
    resetPaddle();
    resetBricks();
    countdown = initialCountdown;
    setTimeout(function () {
        draw();
    }, 2000); // Start the game after 5 seconds
}

function startNextLife() {
    resetBall();
    resetPaddle();
    countdown = initialCountdown;
    setTimeout(function () {
        draw();
    }, 2000); // Start the game after 5 seconds
}

function resetBall() {
    x = canvas.width / 2;
    y = paddleY - 30;

    ballSpeed = ballSpeedOne*Math.pow(levelSpeedDelta, level - 1); // Increase ball speed
    acceleration = acceleration*Math.pow(1.05, level - 1); // Increase ball speed

    console.log(ballSpeed);
    console.log(acceleration);
    
    initialAngle = Math.PI/4 + (Math.random() * Math.PI/2);
    //dx = ballSpeed * Math.cos(initialAngle);
    //dy = -ballSpeed * Math.sin(initialAngle);
    dy = -ballSpeed;
    dx = ballSpeed/Math.tan(initialAngle);
        

    ballRadius *= Math.pow(ballShrink, level - 1); // Decrease ball radius
}

function resetPaddle() {
    paddleX = (canvas.width - paddleWidth) / 2;
}

function resetBricks() {
    bricks = [];
    brickRowCount = initialRows + level - 1;
    brickColumnCount = initialColumns + level - 1;
    brickWidth = initialColumns / brickColumnCount * 75;
    brickHeight = initialRows / brickRowCount * 20;
    brickPadding = initialColumns / brickColumnCount * 10;

    // Create the bricks
    for (var c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (var r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: brickRowCount - r, color: colorBricksOne };
        }
    }
    
    for (var c = 0; c < brickColumnCount; c++) {
        for (var r = 0; r < brickRowCount; r++) {
            bricks[c][r].status = brickRowCount - r; // Reset the hit count
            bricks[c][r].color = colorBricksOne; // Reset the color to Blue
        }
    }
}

// Declare the gamePaused variable and initialize it as false
var gamePaused = false;

// Add an event listener for the space bar keydown event
document.addEventListener("keydown", function (e) {
  if (e.key === " ") { // Check if the pressed key is the space bar
    if (!gameStarted) {
        playNextTrack();
        gameStarted = true;
        draw(); // Start the first draw event
    } else if (gameRunning) {
        // Toggle the gamePaused variable
        gamePaused = !gamePaused;
        if (!gameFinished) {
            if (!gamePaused) {
                draw();
                document.getElementById("player").play();
            } else {
                document.getElementById("player").pause();
            }
        }
    }
  }
});

function draw() {
    if (!gameStarted) {
        // Display the "PRESS SPACE BAR TO START GAME" prompt
        //playNextTrack();
        ctx.font = "30px Arial";
        ctx.fillStyle = colorBricksOne;
        ctx.textAlign = "center";
        ctx.fillText("TOUCH (SPACE) TO START", canvas.width / 2, canvas.height / 2);
        return; // Exit the function without updating the game state
    }
    // Check if the game is paused
    if (gamePaused) {
        // Display a message indicating that the game is paused
        ctx.font = "30px Arial";
        ctx.fillStyle = colorBricksOne;
        ctx.textAlign = "center";
        ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
        return; // Exit the function without updating the game state
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawLives();
    drawLevel();
    drawScore();
    drawTrackName(); // Call the new function to draw the track name

    if (countdown > 0) {
        drawCountdown();
        countdown--;
        setTimeout(draw, 1000);
        return;
    } else {
        gameRunning = true;
    }

    collisionDetection();

    x += dx;
    y += dy;

    if (rightPressed && paddleX < canvas.width - paddleWidth) {
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
    } else if (y + dy > paddleY - paddleHeight - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
            console.log("Ball hit paddle");
        } else {
            lives--;
            if (lives === 0) {
                console.log("GAME OVER");
                gameRunning = false;
                gameFinished = true;
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

function drawTrackName() {
    ctx.font = "14px Arial";
    ctx.fillStyle = colorBricksOne;
    ctx.textAlign = "center";
    ctx.fillText("MARTIN GERBER - " + tracknames[currentTrackIndex-1].toUpperCase(), canvas.width / 2, canvas.height);
}

function dispScoreboard() {
    // Display the top scores
    ctx.font = "20px Arial";
    ctx.fillText("TOP SCORES", canvas.width / 2, canvas.height / 2 + 25);
    ctx.font = "16px Arial";
    ctx.textAlign = "start"; 
    ctx.fillText("1) WAYAK:", 25, canvas.height / 2 + 50);
    ctx.fillText("2940", 175, canvas.height / 2 + 50);
    ctx.fillText("2) MARTY GERBS:", 25, canvas.height / 2 + 70);
    ctx.fillText("1680", 175, canvas.height / 2 + 70);
    ctx.fillText("3) -----", 25, canvas.height / 2 + 90);
    ctx.fillText("0", 175, canvas.height / 2 + 90);
    ctx.fillText("4) -----", 25, canvas.height / 2 + 110);
    ctx.fillText("0", 175, canvas.height / 2 + 110);
    ctx.fillText("5) -----", 25, canvas.height / 2 + 130);
    ctx.fillText("0", 175, canvas.height / 2 + 130);
    ctx.fillText("6) -----", canvas.width / 2 + 50, canvas.height / 2 + 50);
    ctx.fillText("0", canvas.width / 2 + 50 + 150, canvas.height / 2 + 50);
    ctx.fillText("7) -----", canvas.width / 2 + 50, canvas.height / 2 + 70);
    ctx.fillText("0", canvas.width / 2 + 50 + 150, canvas.height / 2 + 70);
    ctx.fillText("8) -----", canvas.width / 2 + 50, canvas.height / 2 + 90);
    ctx.fillText("0", canvas.width / 2 + 50 + 150, canvas.height / 2 + 90);
    ctx.fillText("9) -----", canvas.width / 2 + 50, canvas.height / 2 + 110);
    ctx.fillText("0", canvas.width / 2 + 50 + 150, canvas.height / 2 + 110);
    ctx.fillText("10) ----", canvas.width / 2 + 50, canvas.height / 2 + 130);
    ctx.fillText("0", canvas.width / 2 + 50 + 150, canvas.height / 2 + 130);
    
}

function showGameOverText(text) {
    ctx.font = "48px Arial";
    ctx.fillStyle = colorBricksOne;
    ctx.textAlign = "center";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    ctx.font = "24px Arial";
    ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 + 30);
  
    if (text === "GAME OVER") {
      if (score > oldTopScore) {
        if (score > oldHighScore) {
            ctx.fillText("NEW HIGH SCORE!", canvas.width / 2, canvas.height / 2 + 60);
        } else {
            ctx.fillText("YOU MADE THE TOP-TEN!", canvas.width / 2, canvas.height / 2 + 60);
        }
        
        ctx.fillText("TYPE NAME & PRESS ENTER", canvas.width / 2, canvas.height / 2 + 90);
    
        var cursorVisible = true;
        var cursorBlinkInterval;
        var highScoreAddressEntered = false; // Flag to indicate if the wallet address has been entered
        var stage = "name";
    
    
        // Start the cursor blinking
        cursorBlinkInterval = setInterval(blinkCursor, 500);
    
        // Listen for keydown events to capture the player's name input
        document.addEventListener("keydown", keyDownHandler, false);
    
        // Draw the player's name and cursor
        drawPlayerName();
    
        function keyDownHandler(e) {
            if (!highScoreAddressEntered) {
            // Handle player name input
            if (e.key === "Enter") {
                if (playerName) {
                // Player submitted the name
                console.log("Player Name:", playerName);
                // Perform further processing with the playerName variable
    
                // Clear the name prompt text
                ctx.clearRect(
                    0,
                    canvas.height/2,
                    1000,
                    canvas.height/2-10
                );
    
                stage = "address";
                // Update the text for the wallet address prompt
                ctx.fillText(
                    "PASTE WALLET ADDRESS TO WIN PRIZE",
                    canvas.width / 2,
                    canvas.height / 2 + 60
                );

                ctx.fillText(
                    "ADDRESS WILL NOT BE DISPLAYED ON SCOREBOARD",
                    canvas.width / 2,
                    canvas.height / 2 + 90
                );
    
                highScoreAddressEntered = true; // escapes this function
                stage="final";
                
                }
            } else if (e.key === "Backspace") {
                // Handle the backspace key
                e.preventDefault(); // Prevent the default backspace behavior
    
                if (playerName.length > 0) {
                playerName = playerName.slice(0, -1);
                drawPlayerName();
                }
            } else if (e.key.length === 1 && e.key !== "v" && !e.ctrlKey && !e.metaKey) {
                // Capture alphanumeric characters (excluding "v" when used with Ctrl or Command)
                playerName += (e.key).toUpperCase();
                drawPlayerName();
            }
            } else {
            // Handle wallet address input
            if (e.key === "Enter") {
                if (highScoreAddress) {
                // Player submitted the wallet address
                console.log("Wallet Address:", highScoreAddress);
                // Perform further processing with the highScoreAddress variable
                if (e.key === "Enter") {
                    // Clear the screen
                    ctx.clearRect(0, 0, canvas.width, canvas.height-10);
            
                    // Display the "Thank you" message
                    ctx.font = "30px Arial";
                    ctx.fillStyle = colorBricksOne;
                    ctx.textAlign = "center"; // Align the text to the center position
                    ctx.fillText("THANK YOU FOR PLAYING!!", canvas.width / 2, canvas.height / 2 - 100);
                    ctx.font = "24px Arial";
                    sendEmail();
                    ctx.fillText("SCORE ("+score+") SUBMITTED!", canvas.width / 2, canvas.height / 2 - 60);
                    ctx.fillText("SCOREBOARD UPDATED MANUALLY...", canvas.width / 2, canvas.height / 2 - 35);
                    ctx.fillText("CHECK BACK LATER", canvas.width / 2, canvas.height / 2 - 10);
            
                    dispScoreboard();
                }
                }
            } else if (e.key === "Backspace") {
                // Handle the backspace key
                e.preventDefault(); // Prevent the default backspace behavior
    
                if (highScoreAddress.length > 0) {
                highScoreAddress = highScoreAddress.slice(0, -1);
                drawWalletAddress();
                }
            } else if (e.key.length === 1 && e.key !== "v" && !e.ctrlKey && !e.metaKey) {
                // Capture alphanumeric characters (excluding "v" when used with Ctrl or Command)
                highScoreAddress += e.key;
                drawWalletAddress();
            }
            }
        }
    
        // Listen for the paste event
        document.addEventListener("paste", function (e) {
            e.preventDefault();
            var clipboardData = e.clipboardData || window.clipboardData;
            var pastedText = clipboardData.getData("text");
            if (!highScoreAddressEntered) {
            playerName += pastedText;
            drawPlayerName();
            } else {
            highScoreAddress += pastedText;
            drawWalletAddress();
            }
        });
    
        function drawPlayerName() {
            ctx.clearRect(
            0,
            canvas.height - 90,
            1000,
            80
            );
    
            ctx.font = "16px Arial";
            ctx.fillStyle = colorBricksOne;
            ctx.textAlign = "center";
            ctx.fillText(playerName, canvas.width / 2, canvas.height / 2 + 120);
    
            if (cursorVisible) {
            ctx.beginPath();
            ctx.moveTo(
                canvas.width / 2 + playerName.length * 6,
                canvas.height / 2 + 100
            );
            ctx.lineTo(
                canvas.width / 2 + playerName.length * 6,
                canvas.height / 2 + 120
            );
            ctx.strokeStyle = colorBricksOne;
            ctx.stroke();
            ctx.closePath();
            }
        }
    
        function drawWalletAddress() {
            ctx.clearRect(
                0,
                canvas.height - 90,
                1000,
                80
            ); // Clear previous text and cursor
    
            ctx.font = "16px Arial";
            ctx.fillStyle = colorBricksOne;
            ctx.textAlign = "center";
            ctx.fillText(
            highScoreAddress,
            canvas.width / 2,
            canvas.height / 2 + 120
            );
    
            if (cursorVisible) {
                ctx.beginPath();
                ctx.moveTo(
                canvas.width / 2 + highScoreAddress.length * 6,
                canvas.height / 2 + 100
                );
                ctx.lineTo(
                canvas.width / 2 + highScoreAddress.length * 6,
                canvas.height / 2 + 120
                );
                ctx.strokeStyle = colorBricksOne;
                ctx.stroke();
                ctx.closePath();
            }
        }
    
        function blinkCursor() {
            cursorVisible = !cursorVisible;
            if (stage=="name"){drawPlayerName();};
            if (stage=="address"){drawWalletAddress();};
        }
      } else {
        // Clear the screen
        ctx.clearRect(0, 0, canvas.width, canvas.height - 10);
                    
        // Display the "Thank you" message
        ctx.font = "30px Arial";
        ctx.fillStyle = colorBricksOne;
        ctx.textAlign = "center"; // Align the text to the center position
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 100);
        ctx.font = "24px Arial";
        ctx.fillText("THANK YOU FOR PLAYING!", canvas.width / 2, canvas.height / 2 - 60);
        ctx.fillText("GET A HIGH SCORE TO WIN", canvas.width / 2, canvas.height / 2 - 35);
        ctx.fillText("WEEKLY GIVEAWAYS", canvas.width / 2, canvas.height / 2 - 10);
        ctx.fillText("REFRESH BROWSER TO TRY AGAIN", canvas.width / 2, canvas.height);

        dispScoreboard();
      }
    }
  }

  function sendEmail() {
    if (!playerName) {
      return; // Exit if the user cancels or doesn't enter a name
    }
    
    
    var formData = new FormData();
    formData.append("_replyto", "gerbermart@gmail.com");
    formData.append("_subject", "High Score Notification");
    formData.append("Message", playerName + "("+score+"): " + highScoreAddress);

    fetch("https://formspree.io/f/mleyddwk", {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json"
      }
    })
    .then(response => {
      // Handle the response as needed
      console.log("Email sent successfully");
    })
    .catch(error => {
      // Handle any error that occurred during the request
      console.error("An error occurred while sending the email:", error);
    });
  }
    
draw();