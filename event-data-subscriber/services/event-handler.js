class EventHandler {
  handle(events) {
    console.log(`Processing ${events.length} events.`);
  }
}

const eventHandler = new EventHandler();

module.exports = eventHandler;
