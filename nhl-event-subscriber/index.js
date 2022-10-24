const redis = require("redis");

const EventHandler = require("./services/event-handler");
const { sequelize } = require("./db/models");

(async () => {
  const client = redis.createClient();
  const subscriber = client.duplicate();
  await subscriber.connect();

  try {
    await sequelize.authenticate();
  } catch (e) {
    console.log("Database connection failure.", e);
    return;
  }

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
