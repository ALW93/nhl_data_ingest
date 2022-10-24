const redis = require("redis");
const publisher = redis.createClient();

const axios = require("axios");
const { format, parseISO } = require("date-fns");

const { DateTime } = require("luxon");

// const livePlays = require("../data/sample_live_plays.json");

axios.defaults.baseURL = "https://statsapi.web.nhl.com/api/v1";

(async () => {
  await publisher.connect();

  //publisher.set("gameId", "timeLastUpdate");

  // default check current schedule, also check process.env.SCHEDULE_DATE, BACKFILL

  // await publisher.publish(
  //   "update",
  //   JSON.stringify({ gameId: 2021020071, events: [] })
  // );
  new LiveTracker(2022020091, publisher).init();
})();

class LiveTracker {
  constructor(gameId, publisher) {
    this.gameId = gameId;
    this.publisher = publisher;
    this.tracker;
  }

  async init() {
    this._syncProgress();

    const runTracker = setInterval(async () => {
      const latestUpdate = await publisher.get(this.gameId.toString());
      this._syncProgress(latestUpdate);
    }, 5000);

    this.tracker = runTracker;
  }

  async _syncProgress(lastIndex = 0) {
    const response = await axios.get(`/game/${this.gameId}/feed/live`);
    const allPlays = response.data.liveData.plays.allPlays;

    if (lastIndex) {
      const latestPlays = allPlays.slice(lastIndex);
      return this._publishUpdate(latestPlays);
    }

    this._publishUpdate(allPlays);
  }

  async _publishUpdate(updates) {
    if (updates.length) {
      const latest = updates[updates.length - 1];

      if (latest.result.eventTypeId === "GAME_OFFICIAL") {
        console.log(`Game ${this.gameId} concluding -- terminating tracker`);
        clearInterval(this.tracker);
      }

      await this.publisher.publish(
        "update",
        JSON.stringify({ gameId: this.gameId, events: updates })
      );

      await publisher.set(this.gameId.toString(), latest.about.eventIdx);
    }
  }
}
