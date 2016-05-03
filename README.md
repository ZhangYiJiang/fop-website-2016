# NUS Computing Freshmen Orientation Project 2016 Website 

![](https://meebleforp.com/projects/fop/img/logo.png) 

## FOP 2016

### *Virtutem Quattuor* 

Production site: http://freshmen.nuscomputing.com/  
Staging site: https://meebleforp.com/projects/fop/

This repo contains the source code to build the SoC FOP 2016 website. 
The site is largely static, written in Jade and SASS with Bootstrap, a touch of 
JavaScript with jQuery and built with Gulp. Pull requests welcome! 
 
To build: 

1. Make sure you have [node][1] and npm installed 
2. Clone this repo 
3. Install dependencies - `npm install`
4. Copy the example config file and edit it - `cp config.json.example config.json`
5. Build with gulp - `gulp build --env [your environment]`

To develop: 

1. Follow steps 1 - 4 from above
2. Start the local dev server by running `gulp serve`. Your browser will automatically 
open up `http://localhost:3000`, where you should see the site being served locally  
3. Get cracking! Any changes made to any of the source files should 
automatically trigger browser reload courtesy of BrowserSync

[1]: http://nodejs.org/