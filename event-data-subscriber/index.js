const { sequelize, Team, Player } = require("./db/models");
const redis = require("redis");

const eventHandler = require("./services/event-handler");

(async () => {
  const client = redis.createClient();
  const subscriber = client.duplicate();

  await subscriber.connect();

  await subscriber.subscribe("events", (message) => {
    const events = JSON.parse(message);
    eventHandler.handle(events);
  });
})();
