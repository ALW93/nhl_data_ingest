const redis = require("redis");

const EventHandler = require("./services/event-handler");

(async () => {
  const client = redis.createClient();
  const subscriber = client.duplicate();

  await subscriber.connect();

  await subscriber.subscribe("events", (message) => {
    const event = JSON.parse(message);
    new EventHandler(event.gameId).handle(event.events);
  });
})();
