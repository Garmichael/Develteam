# Develteam

## Installation and Configuration

- Install [WAMP](https://www.wampserver.com/en/) or an equivalent.
- Install [GraphicsMagick](http://www.graphicsmagick.org/).
- Install [NodeJs](https://nodejs.org/)
- In the root directory, open the command line and enter `npm install`. 
- In the root directory, enter the command `npm install -g nodemon`.
- Configure your MySQL credentials.
- Copy the file `/modules/module_secretKeysTemplate.js` to `/modules/module_secretKeys.js` and update the mySQL password. 
- Import dt_engine.sql for a blank database with all the required tables

## Firing up the Dev Environment 

- Start the WAMP Server (or equivalent).
- Run `bat_nodemon.bat`
- Run `bat_npmRunDev.bat`

## Building

- Run `bat_npmRunBuild.bat`
- The compiled assets are in `/public`  and the compiled views are in `/views`