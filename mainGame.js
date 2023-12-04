let socket;
var maze;
var map;
var blockLength;
var screenId;
var gameConnected = false;
var currentEnemyPosition;

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
      gameConnected = true;
      main(blockLength);
    } else {
      currentEnemyPosition = socketData;
    }
    console.log(socketData);
  };
}

initGame();
