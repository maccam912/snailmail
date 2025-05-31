import { Room, Client } from "@colyseus/core";
import { MyRoomState } from "./schema/MyRoomState";
import { createSpan, getTracer } from "../tracing";
import { SpanKind } from "@opentelemetry/api";

export class MyRoom extends Room<MyRoomState> {
  maxClients = 4;
  state = new MyRoomState();

  onCreate(options: any) {
    return createSpan(
      "room.onCreate",
      async (span) => {
        span.setAttributes({
          "room.id": this.roomId,
          "room.maxClients": this.maxClients,
          "room.options": JSON.stringify(options),
        });

        this.onMessage("type", (client, message) => {
          // Trace message handling
          createSpan(
            "room.onMessage",
            (messageSpan) => {
              messageSpan.setAttributes({
                "room.id": this.roomId,
                "client.sessionId": client.sessionId,
                "message.type": "type",
                "message.content": JSON.stringify(message),
              });

              //
              // handle "type" message
              //
            },
            { kind: SpanKind.SERVER },
          );
        });

        console.log("Room", this.roomId, "created with options:", options);
      },
      {
        kind: SpanKind.SERVER,
        attributes: {
          "room.type": "MyRoom",
          "room.id": this.roomId,
        },
      },
    );
  }

  onJoin(client: Client, options: any) {
    return createSpan(
      "room.onJoin",
      async (span) => {
        span.setAttributes({
          "room.id": this.roomId,
          "client.sessionId": client.sessionId,
          "client.options": JSON.stringify(options),
          "room.clientCount": this.clients.length,
        });

        console.log(client.sessionId, "joined!");
      },
      {
        kind: SpanKind.SERVER,
        attributes: {
          "room.type": "MyRoom",
        },
      },
    );
  }

  onLeave(client: Client, consented: boolean) {
    return createSpan(
      "room.onLeave",
      async (span) => {
        span.setAttributes({
          "room.id": this.roomId,
          "client.sessionId": client.sessionId,
          "client.consented": consented,
          "room.clientCount": this.clients.length - 1, // Will be one less after this client leaves
        });

        console.log(client.sessionId, "left!");
      },
      {
        kind: SpanKind.SERVER,
        attributes: {
          "room.type": "MyRoom",
        },
      },
    );
  }

  onDispose() {
    return createSpan(
      "room.onDispose",
      async (span) => {
        span.setAttributes({
          "room.id": this.roomId,
          "room.finalClientCount": this.clients.length,
        });

        console.log("room", this.roomId, "disposing...");
      },
      {
        kind: SpanKind.SERVER,
        attributes: {
          "room.type": "MyRoom",
        },
      },
    );
  }
}
