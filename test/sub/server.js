const redis = require("redis");

(async () => {
  const client = redis.createClient();

  const subscriber = client.duplicate();

  await subscriber.connect();

  await subscriber.subscribe("article", (message) => {
    const text = JSON.parse(message);
    console.log(text.players); // 'message'
    // handler is called here
  });
})();
