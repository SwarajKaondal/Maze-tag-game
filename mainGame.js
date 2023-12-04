let socket;
var maze;
var walls;
var blockLength;
var screenId;
var gameConnected = false;

function initGame() {
  socket = new WebSocket("ws://localhost:3001/ws");
  socket.onopen = function (e) {
    console.log("connected to server");
  };
  socket.onmessage = function (event) {
    let socketData = JSON.parse(event.data);
    if (socketData?.type === "init") {
      maze = socketData?.data?.maze;
      walls = socketData?.data?.walls;
      blockLength = socketData?.data?.blockLength;
      screenId = socketData?.data?.screenId;
      gameConnected = true;
      main(blockLength);
    }
    console.log(socketData);
  };
}

initGame();
