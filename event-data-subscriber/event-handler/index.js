const livePlays = require("../data/sample_live_plays.json");

const EVENT_TYPES = { GOAL: "GOAL", HIT: "HIT" };

class EventHandler {
  handle(events) {
    console.log(`Filtering ${events.length} incoming events.`);
    const filteredEvents = events.filter((event) =>
      EVENT_TYPES.hasOwnProperty(event.result.eventTypeId)
    );
    console.log(`Processing ${filteredEvents.length} events.`);
  }

  recordGoal(event) {
    //
  }

  recordHit(event) {
    //
  }
}

const eventHandler = new EventHandler();

eventHandler.handle(livePlays);

module.exports = eventHandler;
