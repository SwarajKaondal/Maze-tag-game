import { frogModel, thomModel, bootModel } from "./model.js";

const BOOT_PROBABILITY = 0.02;

export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function getMazeObject(blockLength, girdSize) {
  function createMaze() {
    let grid = [...Array(girdSize).keys()].map((i) =>
      new Array(girdSize).fill(0)
    );
    let maze = [...Array(2 * girdSize - 1).keys()].map((i) =>
      new Array(2 * girdSize - 1).fill("#")
    );
    let queue = [[0, 0]];
    grid[0][0] = 1;
    maze[0][0] = ".";
    do {
      let currNode = queue[queue.length - 1];
      let options = [];
      if (
        currNode[0] + 1 < girdSize &&
        grid[currNode[0] + 1][currNode[1]] != 1
      ) {
        options.push("Right");
      }
      if (currNode[0] - 1 > -1 && grid[currNode[0] - 1][currNode[1]] != 1) {
        options.push("Left");
      }
      if (
        currNode[1] + 1 < girdSize &&
        grid[currNode[0]][currNode[1] + 1] != 1
      ) {
        options.push("Down");
      }
      if (currNode[1] - 1 > -1 && grid[currNode[0]][currNode[1] - 1] != 1) {
        options.push("Up");
      }

      if (options.length == 0) {
        queue.pop();
        continue;
      }

      let picked = getRandomInt(0, options.length);
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

    for (let i = 0; i < maze.length; i++) {
      for (let j = 0; j < maze.length; j++) {
        if (maze[i][j] == "#") {
          if (Math.random() < 0.1) {
            maze[i][j] = ".";
          } else if (Math.random() < 0.1) {
            maze[i][j] = ",";
          }
        } else if (maze[i][j] == ".") {
          if (Math.random() < BOOT_PROBABILITY) {
            maze[i][j] = "p";
          }
        }
      }
    }
    maze = addExits(maze);
    return maze;
  }

  let maze = createMaze();

  let blockHeight = blockLength;
  let map = [
    {
      id: "Floor",
      material: {
        ambient: [0.0, 0.0, 0.0],
        diffuse: [0.0, 0.0, 0.0],
        specular: [0.0, 0.0, 0.0],
        n: 5,
        alpha: 1.0,
        texture: "floor4.png",
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
        [0, maze.length],
        [maze.length, 0],
        [maze.length, maze.length],
      ],
      triangles: [
        [0, 1, 2],
        [1, 2, 3],
      ],
    },
    {
      id: "Ceiling",
      material: {
        ambient: [0.0, 0.0, 0.0],
        diffuse: [0.0, 0.0, 0.0],
        specular: [0.0, 0.0, 0.0],
        n: 5,
        alpha: 1.0,
        texture: "ceiling2.jpg",
      },
      vertices: [
        [0, blockHeight, 0],
        [0, blockHeight, maze.length * blockLength],
        [maze.length * blockLength, blockHeight, 0],
        [maze.length * blockLength, blockHeight, maze.length * blockLength],
      ],
      normals: [
        [0, -1, 0],
        [0, -1, 0],
        [0, -1, 0],
        [0, -1, 0],
      ],
      uvs: [
        [0, 0],
        [0, maze.length],
        [maze.length, 0],
        [maze.length, maze.length],
      ],
      triangles: [
        [0, 1, 2],
        [1, 2, 3],
      ],
    },
    {
      id: "OuterWall",
      material: {
        ambient: [0.2, 0.0, 0.0],
        diffuse: [0.5, 0.0, 0.0],
        specular: [0.3, 0.0, 0.0],
        n: 5,
        alpha: 1.0,
        texture: "wall4.jpg",
      },
      vertices: [
        //Back
        [0, 0, 0.00025],
        [0, blockHeight, 0.00025],
        [blockLength * maze.length, 0, 0.00025],
        [blockLength * maze.length, blockHeight, 0.00025],
        //Front
        [0, 0, blockLength * maze.length - 0.00025],
        [0, blockHeight, blockLength * maze.length - 0.00025],
        [blockLength * maze.length, 0, blockLength * maze.length - 0.00025],
        [
          blockLength * maze.length,
          blockHeight,
          blockLength * maze.length - 0.00025,
        ],
        //Right
        [0.00025, 0, 0],
        [0.00025, blockHeight, 0],
        [0.00025, 0, blockLength * maze.length],
        [0.00025, blockHeight, blockLength * maze.length],
        //Left
        [blockLength * maze.length - 0.00025, 0, 0],
        [blockLength * maze.length - 0.00025, blockHeight, 0],
        [blockLength * maze.length - 0.00025, 0, blockLength * maze.length],
        [
          blockLength * maze.length - 0.00025,
          blockHeight,
          blockLength * maze.length,
        ],
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
        [maze.length, 0],
        [maze.length, 1],
        [0, 0],
        [0, 1],

        [maze.length, 0],
        [maze.length, 1],
        [0, 0],
        [0, 1],

        [0, 0],
        [0, 1],
        [maze.length, 0],
        [maze.length, 1],

        [0, 0],
        [0, 1],
        [maze.length, 0],
        [maze.length, 1],
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
      ],
    },
  ];

  for (let i = 0; i < maze.length; i++) {
    for (let j = 0; j < maze.length; j++) {
      if (maze[i][j] === "p") {
        let bootObject = { ...boot };
        bootObject.vertices = [...bootObject.vertices];
        bootObject.id = `Boot-${i}-${j}`;
        for (let vi = 0; vi < bootObject.vertices.length; vi++) {
          bootObject.vertices[vi] = [
            bootObject.vertices[vi][0] + i * blockLength,
            bootObject.vertices[vi][1],
            bootObject.vertices[vi][2] + j * blockLength,
          ];
        }
        map.push(bootObject);
      }
      if (maze[i][j] == "#" || maze[i][j] == ",") {
        let c = {
          rightDownBack: [blockLength * i, -0.0005, blockLength * j],
          rightUpBack: [blockLength * i, blockHeight + 0.0005, blockLength * j],
          leftDownBack: [blockLength * (i + 1), -0.0005, blockLength * j],
          leftUpBack: [
            blockLength * (i + 1),
            blockHeight + 0.0005,
            blockLength * j,
          ],
          rightDownForward: [blockLength * i, -0.0005, blockLength * (j + 1)],
          rightUpForward: [
            blockLength * i,
            blockHeight + 0.0005,
            blockLength * (j + 1),
          ],
          leftDownForward: [
            blockLength * (i + 1),
            -0.0005,
            blockLength * (j + 1),
          ],
          leftUpForward: [
            blockLength * (i + 1),
            blockHeight + 0.0005,
            blockLength * (j + 1),
          ],
        };
        let wall = {
          id: "Wall",
          material: {
            ambient: [0.2, 0.0, 0.0],
            diffuse: [0.5, 0.0, 0.0],
            specular: [0.3, 0.0, 0.0],
            n: 5,
            alpha: maze[i][j] == "#" ? 1.0 : 0.3,
            texture: "wall2.png",
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
            [1, 0],
            [1, 1],
            [0, 0],
            [0, 1],

            [1, 0],
            [1, 1],
            [0, 0],
            [0, 1],

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
        map.push(wall);
      }

      if (maze[i][j] == "=") {
        let normal;
        let vertices;
        if (j == maze.length - 1) {
          vertices = [
            [blockLength * i, 0, blockLength * (j + 1) - 0.0003],
            [blockLength * i, blockHeight, blockLength * (j + 1) - 0.0003],
            [blockLength * (i + 1), 0, blockLength * (j + 1) - 0.0003],
            [
              blockLength * (i + 1),
              blockHeight,
              blockLength * (j + 1) - 0.0003,
            ],
          ];
          normal = [0, 0, -1];
        } else if (i == maze.length - 1) {
          vertices = [
            [blockLength * (i + 1) - 0.0003, 0, blockLength * j],
            [blockLength * (i + 1) - 0.0003, blockHeight, blockLength * j],
            [blockLength * (i + 1) - 0.0003, 0, blockLength * (j + 1)],
            [
              blockLength * (i + 1) - 0.0003,
              blockHeight,
              blockLength * (j + 1),
            ],
          ];
          normal = [-1, 0, 0];
        }
        let exit = {
          id: "Exit",
          material: {
            ambient: [0.2, 0.0, 0.0],
            diffuse: [0.5, 0.0, 0.0],
            specular: [0.3, 0.0, 0.0],
            n: 5,
            alpha: 1.0,
            texture: "exit.jpg",
          },
          vertices: vertices,
          normals: [...Array(4).keys()].map((i) => normal),
          uvs: [
            [0, 0],
            [0, 1],
            [1, 0],
            [1, 1],
          ],
          triangles: [
            [0, 1, 2],
            [1, 2, 3],
          ],
        };
        map.push(exit);
      }
    }
  }

  const ids = ["seekerWinWall", "runnerWinWall"];
  const textures = ["seekerWin.png", "runnerWin.jpg"];
  for (let i = 0; i < 3; i++) {
    let winWall = {
      id: ids[i],
      material: {
        ambient: [0.2, 0.0, 0.0],
        diffuse: [0.5, 0.0, 0.0],
        specular: [0.3, 0.0, 0.0],
        n: 5,
        alpha: 1.0,
        texture: textures[i],
      },
      vertices: [
        [0, blockHeight * 3, blockLength * 2],
        [0, blockHeight * 7, blockLength * 2],
        [blockLength * 4, blockHeight * 3, blockLength * 2],
        [blockLength * 4, blockHeight * 7, blockLength * 2],
      ],
      normals: [
        [0, 0, -1],
        [0, 0, -1],
        [0, 0, -1],
        [0, 0, -1],
      ],
      uvs: [
        [1, 0],
        [1, 1],
        [0, 0],
        [0, 1],
      ],
      triangles: [
        [0, 1, 2],
        [1, 2, 3],
      ],
    };
    map.push(winWall);
  }

  map.push(frog);
  map.push(thom);
  // map.push(boot);
  return { maze, map };
}

let frog = frogModel;
let thom = thomModel;
let boot = bootModel;

export function getStartPositions(maze, blockLength) {
  let seekerPosition;
  let runnerPosition;
  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[0].length; x++) {
      if (maze[y][x] === ".") {
        seekerPosition = [
          y * blockLength + blockLength / 2,
          blockLength / 2,
          x * blockLength + blockLength / 2,
        ];
      }
    }
  }
  for (let y = maze.length - 1; y >= 0; y--) {
    for (let x = 0; x < maze[0].length; x++) {
      if (maze[y][x] === ".") {
        runnerPosition = [
          0 * blockLength + blockLength / 2,
          blockLength / 2,
          0 * blockLength + blockLength / 2,
        ];
      }
    }
  }
  return [seekerPosition, runnerPosition];
}

function addExits(maze) {
  let closestY = 0;
  let closestX = 0;

  for (let x = 0; x < maze[0].length; x++) {
    if (maze[maze.length - 1][x] === ".") {
      if (
        Math.abs(x - maze[0].length / 2) <
        Math.abs(closestX - maze[0].length / 2)
      ) {
        closestX = x;
      }
    }
  }

  for (let y = 0; y < maze.length; y++) {
    if (maze[y][maze[0].length - 1] === ".") {
      if (
        Math.abs(y - maze.length / 2) < Math.abs(closestY - maze.length / 2)
      ) {
        closestY = y;
      }
    }
  }

  maze[closestY][maze[0].length - 1] = "=";
  maze[maze.length - 1][closestX] = "=";

  return maze;
}
