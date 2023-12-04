import { WebSocketServer } from "ws";
import express from "express";
import { getMazeObject } from "./triangles.js";

const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 512;

const BLOCK_LENGTH = CANVAS_WIDTH / 1000;

let app = express();

let mazeObject = getMazeObject(BLOCK_LENGTH);

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

let wsConnections = {};

wsServer.on("connection", (websocketConnection, connectionRequest) => {
  let screenId = (Math.random() + 1).toString(36).substring(7);
  wsConnections[screenId] = websocketConnection;
  console.log(
    `New Connection accepted. Total Clients: ${
      Object.keys(wsConnections).length
    }`
  );
  websocketConnection.send(
    JSON.stringify({
      type: "init",
      data: { screenId, blockLength: BLOCK_LENGTH, ...mazeObject },
    })
  );
  websocketConnection.on("message", (data) => {
    data = JSON.parse(data);
    console.log("recvd: ", JSON.stringify(data));
    for (let screenId in wsConnections) {
      if (screenId !== data.screenId) {
        let conn = wsConnections[screenId];
        conn.send(JSON.stringify(data));
      }
    }
  });
});
