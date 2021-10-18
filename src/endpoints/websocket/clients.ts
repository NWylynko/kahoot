import { SocketStream } from "fastify-websocket";

interface Clients {
  [userId: string]: SocketStream;
}

export const clients: Clients = {};