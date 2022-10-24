const axios = require("axios");

class LiveTracker {
  constructor(gameId, publisher) {
    this.gameId = gameId;
    this.publisher = publisher;
    this.tracker;
  }

  async init() {
    this.syncProgress();

    const runTracker = setInterval(async () => {
      const latestUpdate = await this.publisher.get(this.gameId.toString());
      console.log(`Syncing latest update for gameId: ${this.gameId}`);
      this.syncProgress(latestUpdate);
    }, 5000);

    this.tracker = runTracker;
  }

  async syncProgress(lastIndex = 0) {
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

      await this.publisher.publish(
        "update",
        JSON.stringify({ gameId: this.gameId, events: updates })
      );

      await this.publisher.set(this.gameId.toString(), latest.about.eventIdx);

      if (latest.result.eventTypeId === "GAME_OFFICIAL") {
        console.log(`Game ${this.gameId} concluding -- terminating tracker`);
        clearInterval(this.tracker);
        this.publisher.del(this.gameId.toString());
      }
    }
  }
}

module.exports = LiveTracker;