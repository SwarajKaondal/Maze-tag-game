import { WebSocketServer } from "ws";
import express from "express";
import { getMazeObject, getStartPositions } from "./triangles.js";

const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 512;

const BLOCK_LENGTH = CANVAS_WIDTH / 1000;

const RUNNER_ROLE = "runner";
const SEEKER_ROLE = "seeker";

const CATCH_DISTANCE = 0.5;
let GRID_SIZE = 10;

let app = express();

let mazeObject = getMazeObject(BLOCK_LENGTH, GRID_SIZE);
let [seekerStart, runnerStart] = getStartPositions(
  mazeObject.maze,
  BLOCK_LENGTH
);

app.get("/", async (req, res) => {
  res.send("helo").status(200);
});

const wsServer = new WebSocketServer({
  noServer: true,
  path: "/ws",
});

const server = app.listen(3001);
server.on("upgrade", (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, (socket) => {
    wsServer.emit("connection", socket, request);
  });
});

let openRoles = new Set([RUNNER_ROLE, SEEKER_ROLE]);

let wsConnections = {};
let totalConnections = 0;

wsServer.on("connection", (websocketConnection, connectionRequest) => {
  // if we have 2 players already, reject connection
  if (openRoles.size == 0) {
    websocketConnection.close();
    return;
  }
  let screenId = (Math.random() + 1).toString(36).substring(7);
  let role = openRoles.values().next().value;
  wsConnections[screenId] = {
    conn: websocketConnection,
    role,
  };
  totalConnections = Object.keys(wsConnections).length;
  console.log(
    `New Connection accepted ${screenId}. Total Clients: ${totalConnections}`
  );
  websocketConnection.send(
    JSON.stringify({
      type: "init",
      data: {
        screenId,
        blockLength: BLOCK_LENGTH,
        ...mazeObject,
        role,
        catchDistance: CATCH_DISTANCE,
        start: role === SEEKER_ROLE ? seekerStart : runnerStart,
        transparent: SEEKER_ROLE,
        gridSize: GRID_SIZE,
      },
    })
  );
  openRoles.delete(role);
  if (totalConnections >= 2) {
    for (let screenId in wsConnections) {
      let conn = wsConnections[screenId].conn;
      conn.send(JSON.stringify({ type: "start-timer" }));
    }
  }
  websocketConnection.on("message", (data) => {
    data = JSON.parse(data);
    if (data?.type === "maze-change") {
      GRID_SIZE = parseInt(data.size);
      mazeObject = getMazeObject(BLOCK_LENGTH, GRID_SIZE);
      [seekerStart, runnerStart] = getStartPositions(
        mazeObject.maze,
        BLOCK_LENGTH
      );
      for (let screenId in wsConnections) {
        let conn = wsConnections[screenId].conn;
        conn.send(JSON.stringify(data));
      }
    } else {
      for (let screenId in wsConnections) {
        if (screenId !== data.screenId) {
          let conn = wsConnections[screenId].conn;
          conn.send(JSON.stringify(data));
        }
      }
    }
  });

  websocketConnection.on("close", () => {
    openRoles.add(role);
    delete wsConnections[screenId];
    console.log(`Client with Screen ID ${screenId} Disconnected`);
  });
});
