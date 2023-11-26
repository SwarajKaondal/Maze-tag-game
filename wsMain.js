import { WebSocketServer } from "ws";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

let app = express();

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

let wsConnections = [];

wsServer.on("connection", (websocketConnection, connectionRequest) => {
  console.log("connnnnnn");
  wsConnections.push(websocketConnection);
  websocketConnection.on("message", (data) => {
    data = JSON.parse(data);
    console.log("recvd: ", JSON.stringify(data));
    wsConnections.forEach((conn) => conn.send(JSON.stringify(data)));
  });
});
