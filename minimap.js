const cooldownTime = 10000; // 10 seconds
const mapTimeout = 5000; // 5 seconds
var endTime;
var ismapTimerOn = false;

function loadMinimap() {
  switch (minimapState) {
    case minimapStates.READY:
      loadReady();
      break;
    case minimapStates.ACTIVE:
      loadMap();
      break;
    case minimapStates.COOLDOWN:
      if (endTime < Date.now()) loadCounter();
      break;
  }
}

function loadMap() {
  minimap.lineWidth = 1;

  const blockSize = minimapCanvas?.width / (maze?.length + 2);
  function drawPlayerPositions() {
    let self = [Math.floor(Eye[0] / blockLength), Math.floor(Eye[2] / blockLength)];
    minimap.fillStyle = "#00FF00";
    minimap.fillRect(blockSize * (self[0] + 1), blockSize * (self[1] + 1), blockSize, blockSize);
    if (currentEnemyPosition != undefined) {
      let enemy = [Math.floor(currentEnemyPosition.position.Eye[0] / blockLength), Math.floor(currentEnemyPosition.position.Eye[2] / blockLength)];
      minimap.fillStyle = "#ff0000";
      minimap.fillRect(blockSize * (enemy[0] + 1), blockSize * (enemy[1] + 1), blockSize, blockSize);
    }
  }

  function drawWalls() {
    minimap.fillStyle = "#949494";
    minimap.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height);
    minimap.fillStyle = "#000000";
    minimap.fillRect(blockSize, blockSize, blockSize * maze.length, blockSize * maze.length);
    for (let i = 0; i < maze.length; i++) {
      for (let j = 0; j < maze.length; j++) {
        if (maze[i][j] == "#") {
          minimap.fillStyle = "#949494";
          minimap.fillRect(blockSize * (i + 1), blockSize * (j + 1), blockSize, blockSize);
        }
        if (maze[i][j] == ",") {
          minimap.fillStyle = "#bababa";
          minimap.fillRect(blockSize * (i + 1), blockSize * (j + 1), blockSize, blockSize);
        }
      }
    }
  }

  drawWalls();
  drawPlayerPositions();
  if (!ismapTimerOn) startMapTimer(5000);
}

async function startMapTimer(timeout) {
  ismapTimerOn = true;
  await new Promise((resolve) => setTimeout(resolve, timeout));
  ismapTimerOn = false;
  minimapState = minimapStates.COOLDOWN;
  console.log("ACTIVE -> COOLDOWN");
  endTime = Date.now() + cooldownTime;
  console.log("starting cooldown");
  loadCounter();
}

function loadCounter() {
  function drawCountdown(time) {
    minimap.clearRect(0, 0, minimapCanvas.width, minimapCanvas.height);
    minimap.fillStyle = "#949494";
    minimap.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height);

    minimap.fillStyle = "#000000";
    minimap.lineWidth = 10;
    minimap.strokeStyle = "#000000";

    // Draw a circle representing the countdown
    minimap.beginPath();
    minimap.arc(minimapCanvas.width / 2, minimapCanvas.height / 2, minimapCanvas.width / 2 - 5, 0, 2 * Math.PI);
    minimap.stroke();

    minimap.fillStyle = "#FF0000";
    minimap.font = "100px Arial";
    minimap.textAlign = "center";
    minimap.textBaseline = "middle";
    minimap.fillText(Math.floor((time * 10) / cooldownTime) + "", minimapCanvas.width / 2, minimapCanvas.height / 2);

    // Calculate the angle based on the time remaining
    const angle = (time / cooldownTime) * 2 * Math.PI;

    minimap.strokeStyle = "#FF0000";
    // Draw the countdown progress arc
    minimap.beginPath();
    minimap.arc(minimapCanvas.width / 2, minimapCanvas.height / 2, minimapCanvas.width / 2 - 5, -Math.PI / 2, -Math.PI / 2 + angle);
    minimap.stroke();
  }

  function updateCountdown() {
    const currentTime = Date.now();
    const timeRemaining = Math.max(0, endTime - currentTime);

    drawCountdown(timeRemaining);

    if (timeRemaining > 0) {
      requestAnimationFrame(updateCountdown);
    } else {
      minimapState = minimapStates.READY;
      console.log("COOLDOWN -> READY");
    }
  }

  updateCountdown();
}

function loadReady() {
  minimap.clearRect(0, 0, minimapCanvas.width, minimapCanvas.height);
  minimap.fillStyle = "#949494";
  minimap.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height);
  minimap.font = "20px Arial";
  minimap.fillStyle = "#000";
  minimap.textAlign = "center";
  minimap.textBaseline = "middle";
  minimap.fillText("Ready", minimapCanvas.width / 2, minimapCanvas.height / 2);
}
