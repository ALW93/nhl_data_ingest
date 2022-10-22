const { sequelize, Team, Player } = require("./db/models");

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
