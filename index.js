const { sequelize, Team, Player } = require("./db/models");

async function main() {
  try {
    await sequelize.authenticate();
  } catch (e) {
    console.log("Database connection failure.");
    console.log(e);
    return;
  }

  // try {
  //   await Team.create({
  //     externalId: 123,
  //     name: "Berber's Hockey Team",
  //   });
  // } catch (e) {
  //   console.error("ERROR", e.errors[0].message);
  // }

  // const newPlayer = await Player.create({ externalId: 1232, teamId: 5 });
  // console.log(newPlayer);

  console.log("Database connection success!");
  console.log("Sequelize is ready to use!");

  // Close database connection when done with it.
  await sequelize.close();
}

main();
