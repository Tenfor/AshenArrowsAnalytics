const express = require('express');

const app = express();
const mongoose = require('mongoose');
require("dotenv/config");

const bodyParser = require("body-parser");
const Stats = require('./schemas/Stats');
const Scores = require('./schemas/Scores');

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
app.get('/',async (req,res)=>{
    try {
        const stats = await Stats.find();
        res.json(stats);
    } catch (error) {
        console.log(error);
        res.json({message: error});
    }
});

app.post('/', async (req,res)=>{
    try {
        console.log("body",req.body);
        const stats = new Stats({
            waveName: req.body.waveName,
            remainingHp: req.body.remainingHp
        });
        const savedStats = await stats.save();
        res.json(savedStats);
    } catch (error) {
        console.log(error);
        res.json({message: error});
    }
});

app.post('/scores', async (req,res)=>{
    try {
        console.log("body",req.body);
        const scores = new Scores({
            boardId: req.body.boardId,
            boardName: req.body.boardName,
            playerName: req.body.playerName,
            scores: req.body.scores,
        });
        const savedScores = await scores.save();
        res.json(savedScores);
    } catch (error) {
        console.log(error);
        res.json({message: error});
    }
});

app.get('/scores',async (req,res)=>{
    try {
        let {boardId,page,size} = req.query;

        const filter = boardId ? {boardId:boardId} : {};
        if(!page) page = 1;
        if(!size) size = 10;

        const scores = await Scores.find(filter).limit(size).skip((page-1)*size);
        res.json(scores);
    } catch (error) {
        console.log(error);
        res.json({message: error});
    }
});

//CONNECT TO MONGODB
mongoose.connect(process.env.DB_CONNECTION, ()=>{
    console.log('connected');
});

//LISTENING TO THE SERVER
app.listen(3000);