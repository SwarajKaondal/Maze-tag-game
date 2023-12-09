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
var blockingWalls = ["#"]

function initGame() {
  socket = new WebSocket("ws://localhost:3001/ws");
  socket.onopen = function (e) {
    console.log("connected to server");
  };
  socket.onmessage = function (event) {
    let socketData = JSON.parse(event.data);
    if (socketData?.type === "init") {
      maze = socketData?.data?.maze;
      map = socketData?.data?.map;
      blockLength = socketData?.data?.blockLength;
      screenId = socketData?.data?.screenId;
      catchDistance = socketData?.data?.catchDistance;
      role = socketData?.data?.role;
      defaultEye = vec3.fromValues(...socketData?.data?.start);
      gameConnected = true;
      if(socketData?.data?.transparent === role){
        blockingWalls.push(",")
      }
      main();
    } else if (socketData?.type === "game_over") {
      gameOver = true;
    } else {
      currentEnemyPosition = socketData;
      let winnerRole = socketData?.data?.winner;
      winner = winnerRole === role;
    }
    // console.log(socketData);
  };
}

initGame();
