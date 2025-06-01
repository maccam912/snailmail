import assert from "assert";
import { ColyseusTestServer, boot } from "@colyseus/testing";
// import your Room class
import { MyRoom } from "../src/rooms/MyRoom";
import { GameState } from "../src/rooms/schema/GameState"; // Import GameState

describe("testing your Colyseus app", () => {
  let colyseus: ColyseusTestServer;

  before(async () => {
    colyseus = await boot();
  });

  after(async () => {
    await colyseus.shutdown();
  });

  // beforeEach(async () => {
  //   await colyseus.cleanup();
  // });

  it("connecting into a room", async () => {
    // `room` is the server-side Room instance reference.
    const room = await colyseus.createRoom<GameState>("my_room", {}); // Specify GameState here

    // `client1` is the client-side `Room` instance reference (same as JavaScript SDK)
    const client1 = await colyseus.connectTo(room);

    // make sure state is propagated correctly
    // Check that the players map exists and the connected client is in it
    assert.ok(room.state.players.has(client1.sessionId));
    const player = room.state.players.get(client1.sessionId);
    assert.ok(player, "Player should exist in state");
    assert.strictEqual(typeof player.x, "number"); // Player should have x coordinate
    assert.strictEqual(typeof player.y, "number"); // Player should have y coordinate

    // simulate sending a message from `client1` to `room`
    // Capture initial position for a more robust move test
    const initialX = player.x;
    const initialY = player.y;

    room.send("move", { x: 1, y: 0 }); // Example: send a move message

    // wait for state sync
    await room.waitForNextPatch();

    // Check if player's x coordinate changed as expected
    assert.strictEqual(player.x, initialX + 1, "Player X should have incremented by 1");
    assert.strictEqual(player.y, initialY, "Player Y should not have changed");

    // Test another move
    room.send("move", { y: -1 });
    await room.waitForNextPatch();
    assert.strictEqual(player.x, initialX + 1, "Player X should remain the same after Y move");
    assert.strictEqual(player.y, initialY - 1, "Player Y should have decremented by 1");

    // Test move with undefined values (should not change position)
    const currentX = player.x;
    const currentY = player.y;
    room.send("move", { x: undefined, y: undefined });
    await room.waitForNextPatch();
    assert.strictEqual(player.x, currentX, "Player X should not change if message.x is undefined");
    assert.strictEqual(player.y, currentY, "Player Y should not change if message.y is undefined");

    // Test move with only one coordinate defined
    room.send("move", { x: 5 });
    await room.waitForNextPatch();
    assert.strictEqual(player.x, currentX + 5, "Player X should update correctly when only x is sent");
    assert.strictEqual(player.y, currentY, "Player Y should remain same when only x is sent");


    await client1.leave();
  });
});
