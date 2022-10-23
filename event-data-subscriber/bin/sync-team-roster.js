#!/usr/bin/env node

const { sequelize, Team, Player } = require("../db/models");
const axios = require("axios");

// One time convenience script for importing team & players.

const BASE_URL = "https://statsapi.web.nhl.com/api/v1";

(async () => {
  try {
    await sequelize.authenticate();
  } catch (e) {
    console.log("Database connection failure.", e);
    return;
  }

  const response = await axios.get(`${BASE_URL}/teams`);
  const teams = response.data.teams;

  if (teams.length) {
    teams.forEach(async (team) => {
      let currentTeam = await Team.findOne({ where: { externalId: team.id } });

      if (!currentTeam) {
        currentTeam = syncTeam(team.id, team.name);
      }

      const response = await axios.get(
        `${BASE_URL}/teams/${team.id}?expand=team.roster`
      );
      const roster = response.data.teams[0].roster.roster;

      roster.forEach((player) => {
        syncPlayer(player.person.id, currentTeam.id);
      });
    });
  }
})();

async function syncTeam(externalId, name) {
  const newTeam = Team.build({ externalId: externalId, name: name });
  try {
    await sequelize.transaction(async (tx) => {
      await newTeam.save({ transaction: tx });
    });
  } catch (e) {
    console.error(`Error importing team: ${name}`, e);
  }

  return newTeam;
}

async function syncPlayer(playerId, teamId) {
  const foundPlayer = await Player.findOne({ where: { externalId: playerId } });

  if (!foundPlayer) {
    const response = await axios.get(`${BASE_URL}/people/${playerId}`);
    const player = response.data.people[0];
    const newPlayer = Player.build({
      externalId: player.id,
      teamId: teamId,
      number: player.primaryNumber,
      position: player.primaryPosition.type,
      name: player.fullName,
      age: player.currentAge,
    });

    try {
      await sequelize.transaction(async (tx) => {
        await newPlayer.save({ transaction: tx });
      });
    } catch (e) {
      console.error(`Error importing playerId: ${playerId}`, e);
    }
  }
}
