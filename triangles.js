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
      texture: "hexFloor.jpg",
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
      [0, 25],
      [25, 0],
      [25, 25],
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
      c = {
        rightDownBack: [blockLength * i, 0, blockLength * j],
        rightUpBack: [blockLength * i, blockHeight, blockLength * j],
        leftDownBack: [blockLength * (i + 1), 0, blockLength * j],
        leftUpBack: [blockLength * (i + 1), blockHeight, blockLength * j],
        rightDownForward: [blockLength * i, 0, blockLength * (j + 1)],
        rightUpForward: [blockLength * i, blockHeight, blockLength * (j + 1)],
        leftDownForward: [blockLength * (i + 1), 0, blockLength * (j + 1)],
        leftUpForward: [blockLength * (i + 1), blockHeight, blockLength * (j + 1)],
      };
      wall = {
        material: {
          ambient: [0.2, 0.0, 0.0],
          diffuse: [0.5, 0.0, 0.0],
          specular: [0.3, 0.0, 0.0],
          n: 5,
          alpha: 1.0,
          texture: "brickWall.webp",
        },
        vertices: [
          //Back Face
          c.rightDownBack,
          c.rightUpBack,
          c.leftDownBack,
          c.leftUpBack,
          //Front Face
          c.rightDownForward,
          c.rightUpForward,
          c.leftDownForward,
          c.leftUpForward,
          //Top Face
          c.rightUpBack,
          c.rightUpForward,
          c.leftUpBack,
          c.leftUpForward,
          //Bottom Face
          c.rightDownBack,
          c.rightDownForward,
          c.leftDownBack,
          c.leftDownForward,
          //Right Face
          c.rightUpBack,
          c.rightUpForward,
          c.rightDownBack,
          c.rightDownForward,
          //Left Face
          c.leftUpBack,
          c.leftUpForward,
          c.leftDownBack,
          c.leftDownForward,
        ],
        normals: [
          [0, 0, -1],
          [0, 0, -1],
          [0, 0, -1],
          [0, 0, -1],

          [0, 0, 1],
          [0, 0, 1],
          [0, 0, 1],
          [0, 0, 1],

          [0, 1, 0],
          [0, 1, 0],
          [0, 1, 0],
          [0, 1, 0],

          [0, -1, 0],
          [0, -1, 0],
          [0, -1, 0],
          [0, -1, 0],

          [1, 0, 0],
          [1, 0, 0],
          [1, 0, 0],
          [1, 0, 0],

          [-1, 0, 0],
          [-1, 0, 0],
          [-1, 0, 0],
          [-1, 0, 0],
        ],
        uvs: [
          [1, 1],
          [1, 0],
          [0, 1],
          [0, 0],

          [1, 1],
          [1, 0],
          [0, 1],
          [0, 0],

          [1, 1],
          [0, 1],
          [1, 0],
          [0, 0],

          [1, 1],
          [0, 1],
          [1, 0],
          [0, 0],

          [1, 1],
          [0, 1],
          [1, 0],
          [0, 0],

          [1, 1],
          [0, 1],
          [1, 0],
          [0, 0],
        ],
        triangles: [
          [0, 1, 2],
          [1, 2, 3],

          [4, 5, 6],
          [5, 6, 7],

          [8, 9, 10],
          [9, 10, 11],

          [12, 13, 14],
          [13, 14, 15],

          [16, 17, 18],
          [17, 18, 19],

          [20, 21, 22],
          [21, 22, 23],
        ],
      };
      walls.push(wall);
    }
  }
}
