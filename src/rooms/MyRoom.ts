import { Room, Client } from "@colyseus/core";
import { GameState, Player } from "./schema/GameState";
import { createSpan, getTracer } from "../tracing";
import { SpanKind } from "@opentelemetry/api";

export class MyRoom extends Room<GameState> {
  maxClients = 4;

  onCreate(options: any) {
    this.setState(new GameState());

    createSpan(
      "room.onCreate",
      (span) => {
        span.setAttributes({
          "room.id": this.roomId,
          "room.maxClients": this.maxClients,
          "room.options": JSON.stringify(options),
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

    this.onMessage("move", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        if (message.x) {
          player.x += message.x;
        }
        if (message.y) {
          player.y += message.y;
        }
      }
    });
  }

  onJoin(client: Client, options: any) {
    createSpan(
      "room.onJoin",
      (span) => {
        span.setAttributes({
          "room.id": this.roomId,
          "client.sessionId": client.sessionId,
          "client.options": JSON.stringify(options),
          "room.clientCount": this.clients.length,
        });

        console.log(client.sessionId, "joined!");
        const player = new Player();
        player.x = Math.random() * 10;
        player.y = 0;
        this.state.players.set(client.sessionId, player);
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
    createSpan(
      "room.onLeave",
      (span) => {
        span.setAttributes({
          "room.id": this.roomId,
          "client.sessionId": client.sessionId,
          "client.consented": consented,
          "room.clientCount": this.clients.length - 1,
        });

        console.log(client.sessionId, "left!");
        this.state.players.delete(client.sessionId);
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
    createSpan(
      "room.onDispose",
      (span) => {
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
