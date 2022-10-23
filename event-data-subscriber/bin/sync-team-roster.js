#!/usr/bin/env node

const axios = require("axios");

const { sequelize, Team, Player } = require("../db/models");
const db = require("../services/db-sync");

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
        currentTeam = db.syncTeam(team.id, team.name);
      }

      const response = await axios.get(
        `${BASE_URL}/teams/${team.id}?expand=team.roster`
      );
      const roster = response.data.teams[0].roster.roster;

      roster.forEach(async (player) => {
        const foundPlayer = await Player.findOne({
          where: { externalId: player.person.id },
        });
        if (!foundPlayer) {
          const response = await axios.get(
            `${BASE_URL}/people/${player.person.id}`
          );
          const player = response.data.people[0];
          db.syncPlayer(player, currentTeam.id);
        }
      });
    });
  }
})();
