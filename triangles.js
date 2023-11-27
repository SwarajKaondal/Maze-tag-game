const trianglesFile = [
  {
    material: {
      ambient: [0.2, 0.0, 0.0],
      diffuse: [0.5, 0.0, 0.0],
      specular: [0.3, 0.0, 0.0],
      n: 5,
      alpha: 0.0,
      texture: "naruto1.png",
    },
    vertices: [
      [0.3, 0.3, -0.15],
      [0.3, 0.7, -0.15],
      [0.6, 0.7, -0.15],
      [0.6, 0.3, -0.15],
    ],
    normals: [
      [0, 0, -1],
      [0, 0, -1],
      [0, 0, -1],
      [0, 0, -1],
    ],
    uvs: [
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 0],
    ],
    triangles: [
      [0, 1, 2],
      [2, 3, 0],
    ],
  },
];

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
      // console.log("currNode", currNode);
      // console.log("maze", JSON.parse(JSON.stringify(maze)));
      // console.log("queue", [...queue]);
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

maze = createMaze();

blockLength = 0.5;
blockHeight = 0.5;
let walls = [
  {
    material: {
      ambient: [0.0, 0.0, 0.0],
      diffuse: [0.0, 0.0, 0.0],
      specular: [0.0, 0.0, 0.0],
      n: 5,
      alpha: 1.0,
      texture: "ground.jpeg",
    },
    vertices: [
      [0, 0, 0],
      [0, 0, maze.length * blockLength],
      [maze.length * blockLength, 0, 0],
      [maze.length * blockLength, 0, maze.length * blockLength],
    ],
    normals: [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ],
    uvs: [
      [0, 0],
      [0, 0.01],
      [0.01, 0],
      [0.01, 0.01],
    ],
    triangles: [
      [0, 1, 2],
      [1, 2, 3],
    ],
  },
];
rowIndex = 0;
colIndex = 0;
for (let i = 0; i < maze.length; i++) {
  for (let j = 0; j < maze.length; j++) {
    if (maze[i][j] == "#") {
      wall = {
        material: {
          ambient: [0.2, 0.0, 0.0],
          diffuse: [0.5, 0.0, 0.0],
          specular: [0.3, 0.0, 0.0],
          n: 5,
          alpha: 1.0,
          texture: "wall.jpg",
        },
        vertices: [
          [blockLength * i, 0, blockLength * j],
          [blockLength * i, blockHeight, blockLength * j],
          [blockLength * (i + 1), 0, blockLength * j],
          [blockLength * (i + 1), blockHeight, blockLength * j],
          [blockLength * i, 0, blockLength * (j + 1)],
          [blockLength * i, blockHeight, blockLength * (j + 1)],
          [blockLength * (i + 1), 0, blockLength * (j + 1)],
          [blockLength * (i + 1), blockHeight, blockLength * (j + 1)],
        ],
        normals: [
          [-0.5774, -0.5774, 0.5774],
          [-0.5774, 0.5774, 0.5774],
          [0.5774, -0.5774, 0.5774],
          [0.5774, 0.5774, 0.5774],
          [-0.5774, -0.5774, -0.5774],
          [-0.5774, 0.5774, -0.5774],
          [0.5774, -0.5774, -0.5774],
          [0.5774, 0.5774, -0.5774],
        ],
        uvs: [
          [1, 1],
          [1, 0],
          [0, 1],
          [0, 0],
          [0, 1],
          [0, 0],
          [1, 1],
          [1, 0],
        ],
        triangles: [
          [0, 1, 2],
          [1, 2, 3],
          [4, 5, 6],
          [5, 6, 7],
          [0, 1, 4],
          [1, 4, 5],
          [2, 3, 6],
          [3, 6, 7],
          [1, 3, 7],
          [1, 7, 5],
          [0, 2, 6],
          [0, 6, 4],
        ],
      };
      walls.push(wall);
    }
  }
}
