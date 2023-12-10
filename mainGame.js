let socket;
var maze;
var map;
var blockLength;
var screenId;
var gameConnected = false;
var currentEnemyPosition;
var catchDistance;
var gameOver = false;
var role;
var winner;
var defaultEye; // default eye position in world space
var blockingWalls = ["#"];
var gridSize;
var removedShoes = {};
let timerInterval;
var winnerRole;

function initGame() {
  socket = new WebSocket("ws://localhost:3001/ws");
  socket.onopen = function (e) {
    console.log("connected to server");
  };
  socket.onmessage = function (event) {
    let socketData = JSON.parse(event.data);
    if (socketData?.type === "start-timer") {
      console.log("timer started");
      startTimer();
    }
    if (socketData?.type === "init") {
      maze = socketData?.data?.maze;
      map = socketData?.data?.map;
      blockLength = socketData?.data?.blockLength;
      screenId = socketData?.data?.screenId;
      catchDistance = socketData?.data?.catchDistance;
      role = socketData?.data?.role;
      defaultEye = vec3.fromValues(...socketData?.data?.start);
      gridSize = socketData?.data?.gridSize;
      gameConnected = true;
      if (socketData?.data?.transparent === role) {
        blockingWalls.push(",");
      }
      console.log(maze);
      main();
    } else if (socketData?.type === "game_over") {
      gameOver = true;
      winnerRole = socketData?.winner;
      winner = winnerRole === role;
      clearInterval(timerInterval);
      mainDisplay.innerHTML = "";
      console.log("winner is: ", winner, winnerRole);
    } else if (socketData?.type === "shoe_collected") {
      removedShoes[socketData.bootId] = true;
      console.log(
        `Opponent collected ${socketData.bootId}, ${socketData.position}`
      );
      let position = socketData.position;
      maze[position[0]][position[1]] = ".";
      loadMinimap();
    } else if (socketData?.type === "maze-change") {
      location.reload();
    } else {
      currentEnemyPosition = socketData;
      // console.log(socketData);
    }
  };
}

initGame();
