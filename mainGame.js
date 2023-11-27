// UI Element IDs
const createGameButtonId = "create-game";
const joinGameButtonId = "join-game";

// UI elements
let createGameElement = $(`#${createGameButtonId}`);
let joinGameElement = $(`#${joinGameButtonId}`);

// Element Event Listeners
createGameElement.on("click", () => {
  console.log("create game clicked");
});

joinGameElement.on("click", () => {
  console.log("create game clicked");
});

function initGame() {
  main();
}


initGame();
