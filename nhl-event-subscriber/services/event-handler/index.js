const db = require("../db-sync");

const EVENT_TYPES = {
  GOAL: "GOAL",
  HIT: "HIT",
  ASSIST: "ASSIST",
  PENALTY: "PENALTY",
};

class EventHandler {
  constructor(gameId) {
    this.gameId = gameId;
  }

  handle(events) {
    const filteredEvents = events.filter((event) =>
      EVENT_TYPES.hasOwnProperty(event.result.eventTypeId)
    );
    this._processEvents(filteredEvents);
    console.log(`Processing ${filteredEvents.length} events.`);
  }

  _processEvents(filteredEvents) {
    filteredEvents.forEach((event) => {
      const eventType = event.result.eventTypeId;
      switch (event.result.eventTypeId) {
        case EVENT_TYPES.GOAL:
          this._processGoal(event);
          break;
        case EVENT_TYPES.HIT:
          this._processHit(event);
          break;
        case EVENT_TYPES.PENALTY:
          this._processPenalty(event);
          break;
        default:
          console.log(`Error processing event: ${JSON.stringify(event)}`);
          throw `Event type: ${eventType} not currently supported!`;
      }
    });
  }

  _processGoal(event) {
    event.players.forEach(async (player) => {
      if (player.playerType !== "Goalie") {
        const eventType =
          player.playerType == "Scorer" ? EVENT_TYPES.GOAL : EVENT_TYPES.ASSIST;
        await db.syncEvent(event, player.player.id, this.gameId, eventType);
      }
    });
  }

  _processHit(event) {
    const hitter = event.players.find(
      (player) => player.playerType == "Hitter"
    );
    db.syncEvent(event, hitter.player.id, this.gameId, EVENT_TYPES.HIT);
  }

  _processPenalty(event) {
    const offender = event.players.find(
      (player) => player.playerType == "PenaltyOn"
    );
    db.syncEvent(
      event,
      offender.player.id,
      this.gameId,
      EVENT_TYPES.PENALTY,
      event.result.penaltyMinutes
    );
  }
}

module.exports = EventHandler;
