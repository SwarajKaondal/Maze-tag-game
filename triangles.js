export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function getMazeObject(blockLength) {
  function createMaze() {
    let girdSize = 10;
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
          }
        }
      }
    }

    return maze;
  }

  let maze = createMaze();

  let blockHeight = blockLength;
  let walls = [
    {
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
        [0, 0, 0],
        [0, blockHeight, 0],
        [blockLength * maze.length, 0, 0],
        [blockLength * maze.length, blockHeight, 0],
        //Front
        [0, 0, blockLength * maze.length],
        [0, blockHeight, blockLength * maze.length],
        [blockLength * maze.length, 0, blockLength * maze.length],
        [blockLength * maze.length, blockHeight, blockLength * maze.length],
        //Right
        [0, 0, 0],
        [0, blockHeight, 0],
        [0, 0, blockLength * maze.length],
        [0, blockHeight, blockLength * maze.length],
        //Left
        [blockLength * maze.length, 0, 0],
        [blockLength * maze.length, blockHeight, 0],
        [blockLength * maze.length, 0, blockLength * maze.length],
        [blockLength * maze.length, blockHeight, blockLength * maze.length],
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
    {
      material: {
        ambient: [0.2, 0.0, 0.0],
        diffuse: [0.5, 0.0, 0.0],
        specular: [0.3, 0.0, 0.0],
        n: 5,
        alpha: 1.0,
        texture: "door1.jpg",
      },
      vertices: [
        [0, 0, 0.0005],
        [0, blockHeight, 0.0005],
        [blockLength, 0, 0.0005],
        [blockLength, blockHeight, 0.0005],
      ],
      normals: [
        [0, 0, 1],
        [0, 0, 1],
        [0, 0, 1],
        [0, 0, 1],
      ],
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
    },
  ];

  for (let i = 0; i < maze.length; i++) {
    for (let j = 0; j < maze.length; j++) {
      if (maze[i][j] == "#") {
        let c = {
          rightDownBack: [blockLength * i, 0, blockLength * j],
          rightUpBack: [blockLength * i, blockHeight, blockLength * j],
          leftDownBack: [blockLength * (i + 1), 0, blockLength * j],
          leftUpBack: [blockLength * (i + 1), blockHeight, blockLength * j],
          rightDownForward: [blockLength * i, 0, blockLength * (j + 1)],
          rightUpForward: [blockLength * i, blockHeight, blockLength * (j + 1)],
          leftDownForward: [blockLength * (i + 1), 0, blockLength * (j + 1)],
          leftUpForward: [
            blockLength * (i + 1),
            blockHeight,
            blockLength * (j + 1),
          ],
        };
        let wall = {
          material: {
            ambient: [0.2, 0.0, 0.0],
            diffuse: [0.5, 0.0, 0.0],
            specular: [0.3, 0.0, 0.0],
            n: 5,
            alpha: 1.0,
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
        walls.push(wall);
      }
    }
  }
  return { maze, walls };
}
