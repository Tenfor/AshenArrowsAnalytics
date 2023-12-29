const express = require('express');

const app = express();
const mongoose = require('mongoose');
require("dotenv/config");

const bodyParser = require("body-parser");
const guidController = require("./controllers/guidController");
const statController = require("./controllers/statController");
const scoreController = require("./controllers/scoreController");
const testController = require("./controllers/testController");
//MIDDLEWARES
app.use(bodyParser.json());
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'https://resttesttest.com');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

//ROUTES
//Stats
app.post('/stats',statController.postStats);
app.get('/stats',statController.getStats);
//guid
app.post('/guid', guidController.postGuid);

//Scores
app.post('/addscores',scoreController.postScores);
app.post('/getscores',scoreController.getScores);
app.post('/getbestofall',scoreController.getBestOfAll);

//Test
app.post('/testpost',testController.testPost);
app.get('/testget',testController.testGet);
app.post('/testpostbody',testController.testPostBody);
app.get('/testgetquery',testController.testGetQuery);


//update db
app.post('/updatedb', scoreController.updatedb);
  

//CONNECT TO MONGODB
mongoose.connect(process.env.DB_CONNECTION, ()=>{
    console.log('connected');
});

//LISTENING TO THE SERVER
app.listen(3000);