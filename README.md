# NHL Data Ingest
Data pipeline for backfilling and ingesting live data from NHL games using their public API! 🏒

Two individual services were created and designed to function as a publisher & subscriber: 

 `/nhl-event-publisher`
 > Publisher > primary communicator with the NHL API
- On startup will run a schedule handler that performs a variety of tasks depending on the state of any given game:
  - **🏁 Live Games** - triggers a `LiveTracker` which ingests live data on a fixed interval and publishes all updates to a Redis server.
  - **📅 Pending Games** - pre-schedules a `LiveTracker` to initiate based on the given starting UTC datetime.
  - **🏅 Completed Games** - syncs all completed plays and publishes a bundled update to a Redis server. 
- [A cron is also initiated](#cron-or-not-to-cron) that runs the same schedule handler that is triggered on start up (*scheduled to run once a day at 6AM UTC*)

`/nhl-event-subscriber`
> Subscriber > responsible for interpreting and syncing data
- On startup connects to the Redis server, ORM, and begins listening for events! 
- As events come in from Redis, an `EventHandler` is used to process and eventually sync data into the database with the assistance of a helper service. 

#### Misc things
- Database validation/unique constraints added to prevent duplication.
- The `LiveTracker` is currently set to gather updates every minute.

## How to use
### Requirements
Node, Postgres, Redis, (optional) Redis-cli
### Initial Setup 

- Ensure Redis is up and running
   - e.g. `brew services start redis` for macOS
   - For convenience there is also a docker-compose file to run a Redis server
     - `docker-compose up`

- `npm i` inside both publisher & subscriber directories
### Database Setup in `/nhl-event-subscriber` 

- Configure your local postgres user* in `/nhl-event-subscriber/config/config.json`
   - *Prefer to have a user with the `createdb` permission for optional next step. 

- Run `npx sequelize db:create` (optional)
   - Feel free to also manually create a database! 

- Run `npx sequelize db:migrate`
   
- Run `npm run sync` 

### Running the application
- Initiate the subscriber first! `npm start` in `/nhl-event-subscriber` 
- And then `npm start` in `/nhl-event-publisher` 
- Check the video at the end of the README to see how the service logs activity in the terminal! 


## Database
> A simple relational table for the main entities requested in the list!

![database schema](https://i.ibb.co/SrqKpZv/diagram.png)
- For simplicity's sake, allowed numbers and positions to remain tied to the player table. [(not taking player trades/ team changes into consideration for now)](#player-changes)
- No `points` column in the `Event` table since they can be derived from goals and assists!


## Thoughts
#### Cron or not to cron
 I debated on whether it was better to run a cron vs fixed API calls to the `/schedule` endpoint -- tested out several scheduling/cron packages for node and they seemed pretty reliable - so ultimately let it stay (mainly for simplicity). However, some benefits to the alternative would be: 
  - Higher fidelity on game status changes, games starting earlier than expected etc -> will also catch events earlier.  
  - Would also eradicate the need for setting a cron for pre-scheduling upcoming game tracking.
  - 💡 I think in a 'real-life' scenario a cron might be risky for a system like this due to how inflexible they are. 
#### Player Changes
I'm sure players switch teams, and possibly(?) numbers + positions over time? To minimize complexity this system just assumes players are tied to the same team for all eternity.
- If I were to expand I'd say a join table to track player<>team association could be an option with an extra column to track active state...or perhaps versioning, many options!.

#### 🐛 Redis (non-breaking)
I originally wanted to use the `diffPatch` option in livefeed endpoint but had some trouble with it! So some Redis ~~abuse~~ use was done by storing `{ gameId: eventIdx }` to keep a pointer on the last update published. 

After some testing I noticed there was a bit of lag and what seemed to end up happening was it sends a small overlap event (*see screenshot from last night's live test*)

This is a non-issue since the DB write layer has column constraints to prevent duplicate events from being written, but something to fix nonetheless. 

![logs](https://i.ibb.co/w7dB363/Screen-Shot-2022-10-24-at-8-18-12-PM.png)



## Example
    