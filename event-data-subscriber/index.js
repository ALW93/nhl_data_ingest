const { sequelize, Team, Player } = require("./db/models");
const redis = require("redis");

const eventHandler = require("./services/event-handler");

async function main() {
  try {
    await sequelize.authenticate();
  } catch (e) {
    console.log("Database connection failure.");
    console.log(e);
    return;
  }

  // const newTeam = Team.build({
  //   externalId: 123,
  //   name: "Berber's Hockey Team",
  // });

  // const newPlayer = await Player.create({ externalId: 1232, teamId: 5 });

  // try {
  //   await Team.create({
  //     externalId: 123,
  //     name: "Berber's Hockey Team",
  //   });
  // } catch (e) {
  //   console.error("ERROR", e.errors[0].message);
  // }

  console.log("Database connection success! Sequelize is ready to use!");

  // Close database connection when done with it.
  await sequelize.close();
}

main();

(async () => {
  const client = redis.createClient();
  const subscriber = client.duplicate();

  await subscriber.connect();

  await subscriber.subscribe("events", (message) => {
    const events = JSON.parse(message);
    eventHandler.handle(events);
  });
})();
