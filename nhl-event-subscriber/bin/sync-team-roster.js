#!/usr/bin/env node

const axios = require("axios");

const db = require("../services/db-sync");
const { sequelize, Team, Player } = require("../db/models");
const { api_url } = require("../config/config.json");

// One time convenience script for importing teams & rosters
(async () => {
  try {
    await sequelize.authenticate();
  } catch (e) {
    console.log("Database connection failure.", e);
    return;
  }

  const response = await axios.get(`${api_url}/teams`);
  const teams = response.data.teams;

  if (teams.length) {
    teams.forEach(async (team) => {
      const currentTeam = await Team.findOne({
        where: { externalId: team.id },
      });

      if (!currentTeam) {
        db.syncTeam(team);
      }

      const response = await axios.get(`${api_url}/teams/${team.id}/roster`);
      const roster = response.data.roster;

      roster.forEach(async (player) => {
        const currentPlayer = await Player.findOne({
          where: { externalId: player.person.id },
        });
        if (!currentPlayer) {
          db.syncPlayer(player.person.id);
        }
      });
    });
  }
})();
