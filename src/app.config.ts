import config from "@colyseus/tools";
import { monitor } from "@colyseus/monitor";
import { playground } from "@colyseus/playground";
import express from "express";
import path from "path";
import { createSpan } from "./tracing";
import { SpanKind } from "@opentelemetry/api";

/**
 * Import your Room files
 */
import { MyRoom } from "./rooms/MyRoom";

export default config({
  initializeGameServer: (gameServer) => {
    /**
     * Define your room handlers:
     */
    gameServer.define("my_room", MyRoom);
  },

  initializeExpress: (app) => {
    /**
     * Bind your custom express routes here:
     * Read more: https://expressjs.com/en/starter/basic-routing.html
     */
    app.get("/hello_world", (req, res) => {
      createSpan(
        "http.hello_world",
        (span) => {
          span.setAttributes({
            "http.method": req.method,
            "http.url": req.url,
            "http.user_agent": req.get("User-Agent") || "",
            "http.remote_addr": req.ip,
          });

          res.send("It's time to kick ass and chew bubblegum!");
        },
        { kind: SpanKind.SERVER },
      );
    });

    /**
     * Use @colyseus/playground
     * (It is not recommended to expose this route in a production environment)
     */
    if (process.env.NODE_ENV !== "production") {
      app.use("/", playground());
    } else {
      // In production, serve static files from public directory
      app.use(express.static(path.join(__dirname, "..", "public")));
    }

    /**
     * Use @colyseus/monitor
     * It is recommended to protect this route with a password
     * Read more: https://docs.colyseus.io/tools/monitor/#restrict-access-to-the-panel-using-a-password
     */
    app.use("/monitor", monitor());
  },

  beforeListen: () => {
    /**
     * Before before gameServer.listen() is called.
     */
  },
});
