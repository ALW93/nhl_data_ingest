
### Database
![database schema](https://i.ibb.co/KLkPTNw/db-diagram.png)
- For simplicity's sake, allowed numbers and positions to remain tied to the player table.
- event.game_id will not reference an additional game table and will refer to the external `gamePk` from the API. 


### Resources
- https://blog.logrocket.com/getting-started-with-cloud-pub-sub-in-node/