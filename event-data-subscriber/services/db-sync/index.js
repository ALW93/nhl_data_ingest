const { sequelize, Team, Player, Event } = require("../../db/models");

class DatabaseSynchronizer {
  async syncEvent() {
    const newTeam = Team.build({ externalId: externalTeamId, name: name });
    try {
      this._write(newTeam);
    } catch (e) {
      console.error(`Error importing team: ${name}`, e);
    }
    return newTeam;
  }

  async syncTeam(externalTeamId, name) {
    const newTeam = Team.build({ externalId: externalTeamId, name: name });
    try {
      this._write(newTeam);
    } catch (e) {
      console.error(`Error importing team: ${name}`, e);
    }
    return newTeam;
  }

  async syncPlayer(player, teamId) {
    const newPlayer = Player.build({
      externalId: player.id,
      teamId: teamId,
      number: player.primaryNumber,
      position: player.primaryPosition.type,
      name: player.fullName,
      age: player.currentAge,
    });

    try {
      this._write(newPlayer);
    } catch (e) {
      console.error(`Error importing playerId: ${player.id}`, e);
    }
  }

  async _write(row) {
    await sequelize.transaction(async (tx) => {
      await row.save({ transaction: tx });
    });
  }
}

const db = new DatabaseSynchronizer();
module.exports = db;
