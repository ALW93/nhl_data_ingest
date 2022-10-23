const redis = require("redis");
const publisher = redis.createClient();

(async () => {
  const article = {
    players: [
      {
        player: {
          id: 8478483,
          fullName: "Mitchell Marner",
          link: "/api/v1/people/8478483",
        },
        playerType: "Hitter",
      },
      {
        player: {
          id: 8475208,
          fullName: "Brian Dumoulin",
          link: "/api/v1/people/8475208",
        },
        playerType: "Hittee",
      },
    ],
    result: {
      event: "Hit",
      eventCode: "PIT8",
      eventTypeId: "HIT",
      description: "Mitchell Marner hit Brian Dumoulin",
    },
    about: {
      eventIdx: 4,
      eventId: 8,
      period: 1,
      periodType: "REGULAR",
      ordinalNum: "1st",
      periodTime: "00:06",
      periodTimeRemaining: "19:54",
      dateTime: "2021-10-23T23:15:41Z",
      goals: {
        away: 0,
        home: 0,
      },
    },
    coordinates: {
      x: -16,
      y: 40,
    },
    team: {
      id: 10,
      name: "Toronto Maple Leafssss",
      link: "/api/v1/teams/10",
      triCode: "TOR",
    },
  };

  await publisher.connect();

  setInterval(async () => {
    await publisher.publish("article", JSON.stringify(article));
  }, 2000);
})();
