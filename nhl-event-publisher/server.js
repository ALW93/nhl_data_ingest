const redis = require("redis");
const axios = require("axios");
const schedule = require("node-schedule");

const LiveTracker = require("./services/live-tracker.js");
const publisher = redis.createClient();

axios.defaults.baseURL = "https://statsapi.web.nhl.com/api/v1";

(async () => {
  await publisher.connect();

  syncSchedule(); // Run schedule sync once on startup
  schedule.scheduleJob("0 0 * * *", () => syncSchedule());

  async function syncSchedule() {
    console.log(`Syncing daily schedule for ${new Date()}`);
    // example from README "/schedule?date=2022-10-12"
    const response = await axios.get("/schedule");
    const scheduledGames = response.data.dates[0].games;

    if (scheduledGames.length) {
      scheduledGames.forEach((game) => {
        const status = game.status.abstractGameState;
        switch (status) {
          case "Preview":
            const startTime = new Date(game.gameDate);
            console.log(
              `Scheduling tracker for gameId: ${
                game.gamePk
              } @ ${startTime.toISOString()} `
            );
            schedule.scheduleJob(startTime, () =>
              new LiveTracker(game.gamePk, publisher).init()
            );
            break;
          case "Live":
            console.log(`Initiating tracker for gameId: ${game.gamePk}`);
            new LiveTracker(game.gamePk, publisher).init();
            break;
          case "Final":
            console.log(`Syncing plays for finished gameId: ${game.gamePk}`);
            new LiveTracker(game.gamePk, publisher).syncProgress();
            break;
          default:
            break;
        }
      });
    }
  }
})();
