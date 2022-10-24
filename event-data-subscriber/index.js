const redis = require("redis");

const EventHandler = require("./services/event-handler");

(async () => {
  const client = redis.createClient();
  const subscriber = client.duplicate();

  await subscriber.connect();

  await subscriber.subscribe("update", (message) => {
    const update = JSON.parse(message);

    console.log(
      `Received ${update.events.length} update(s) for game: ${
        update.gameId
      } at ${new Date().toUTCString()}`
    );
    new EventHandler(update.gameId).handle(update.events);
  });
})();
