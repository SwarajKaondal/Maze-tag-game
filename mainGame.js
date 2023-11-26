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

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function createMaze() {
  girdSize = 10;
  grid = [...Array(girdSize).keys()].map((i) => new Array(girdSize).fill(0));
  maze = [...Array(2 * girdSize - 1).keys()].map((i) => new Array(2 * girdSize - 1).fill("#"));
  console.log(grid);
  queue = [[0, 0]];
  grid[0][0] = 1;
  maze[0][0] = ".";
  do {
    currNode = queue[queue.length - 1];
    // console.log(currNode);
    options = [];
    if (currNode[0] + 1 < girdSize && grid[currNode[0] + 1][currNode[1]] != 1) {
      options.push("Right");
    }
    if (currNode[0] - 1 > -1 && grid[currNode[0] - 1][currNode[1]] != 1) {
      options.push("Left");
    }
    if (currNode[1] + 1 < girdSize && grid[currNode[0]][currNode[1] + 1] != 1) {
      options.push("Down");
    }
    if (currNode[1] - 1 > -1 && grid[currNode[0]][currNode[1] - 1] != 1) {
      options.push("Up");
    }

    if (options.length == 0) {
      console.log("currNode", currNode);
      console.log("maze", JSON.parse(JSON.stringify(maze)));
      console.log("queue", [...queue]);
      queue.pop();
      continue;
    }

    picked = getRandomInt(0, options.length);
    switch (options[picked]) {
      case "Left":
        queue.push([currNode[0] - 1, currNode[1]]);
        grid[currNode[0] - 1][currNode[1]] = 1;
        maze[2 * (currNode[0] - 1)][2 * currNode[1]] = ".";
        maze[2 * (currNode[0] - 1) + 1][2 * currNode[1]] = ".";
        break;
      case "Right":
        queue.push([currNode[0] + 1, currNode[1]]);
        grid[currNode[0] + 1][currNode[1]] = 1;
        maze[2 * (currNode[0] + 1)][2 * currNode[1]] = ".";
        maze[2 * (currNode[0] + 1) - 1][2 * currNode[1]] = ".";
        break;
      case "Down":
        queue.push([currNode[0], currNode[1] + 1]);
        grid[currNode[0]][currNode[1] + 1] = 1;
        maze[2 * currNode[0]][2 * (currNode[1] + 1)] = ".";
        maze[2 * currNode[0]][2 * (currNode[1] + 1) - 1] = ".";
        break;
      case "Up":
        queue.push([currNode[0], currNode[1] - 1]);
        grid[currNode[0]][currNode[1] - 1] = 1;
        maze[2 * currNode[0]][2 * (currNode[1] - 1)] = ".";
        maze[2 * currNode[0]][2 * (currNode[1] - 1) + 1] = ".";
        break;
    }
  } while (queue.length > 0);
  return maze;
}

console.log(createMaze());

initGame();
