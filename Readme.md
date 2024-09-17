# Steps to Run

1. Run `npm install` in the root directory
2. Run `npm run server` in the same directory
3. You will need to set your IP address in place of `localhost` in `mainGame.js` on line 20.
4. visit `<your-ip>:3000`on a browser from two different PCs (or same) that are on the same LAN

# Game Description

Chase is a competitive game of tag where the `seeker`'s goal is to catch the runner before they can escape, while the `runner`'s goal is to escape the backrooms before the seeker can get them, AND the timer runs out. There is a power up scattered randomly across the map that increases the speed of the player that collects it. Also, the runner can run `through transparent walls` while the seeker can't. The seeker is slightly faster than the runner to keep things interesting.

# Features

1. Dynamically generated random map that is resizable from the browser itself
2. Multiplayer support across the LAN
3. Transparent walls to run through
4. Baked textures
5. Sounds of enemy approaching (heartbeat) and footsteps
6. Winning animation
7. Shoe animation (rotation)
8. Logic to block movement through walls
9. Transformed .obj files with textures to our game compatible formats

# Play the Game On
https://maze-tag-game-1.onrender.com/

# Demo
[![Watch the video](https://img.youtube.com/vi/jdLetaoP4IM/maxresdefault.jpg)](https://youtu.be/jdLetaoP4IM)

