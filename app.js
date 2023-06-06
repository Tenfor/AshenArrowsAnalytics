const express = require('express');

const app = express();
const mongoose = require('mongoose');
require("dotenv/config");

const bodyParser = require("body-parser");
const Scores = require('./schemas/Scores');
const Statistics = require('./schemas/Statistics');

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
app.post('/stats', async (req,res)=>{
    try {
        console.log("body",req.body);
        let uploadedStats = [];

        for(let stat of req.body.stats){
            const newStats = new Statistics({
                eventName: stat.eventName,
                playerName: stat.playerName,
                data: stat.data,
                date: stat.date,
                override: stat.override
            });      
            if(newStats.override){
               const savedStat = await Statistics.findOneAndUpdate(
                    {
                        eventName:newStats.eventName,
                        playerName:newStats.playerName},
                    {
                        $set:{
                        eventName:newStats.eventName,
                        playerName:newStats.playerName,
                        data:newStats.data,
                        date:newStats.date,
                        override:newStats.override
                    }},
                    {
                        upsert:true,
                        new:true
                    }
                );
                uploadedStats.push(savedStat);
            }else{
                const savedStat = await newStats.save();
                uploadedStats.push(savedStat);
            }
        }

        res.json(uploadedStats);
    } catch (error) {
        console.log(error);
        res.json({message: error});
    }
});

app.get('/stats',async (req,res)=>{
    try {
        let {page,size} = req.query;
        if(!page) page = 1;
        if(!size) size = 10;
        const stats = await Statistics.find().limit(size).skip((page-1)*size);
        res.json({page:page,size:size,data:stats});
    } catch (error) {
        console.log(error);
        res.json({message: error});
    }
});


//Scores
app.post('/scores', async (req,res)=>{
    try {
        console.log("body",req.body);
        const newEntry = new Scores({
            boardName: req.body.boardName,
            playerName: req.body.playerName,
            scores: req.body.scores,
            date: req.body.date
        });

        const existingEntry = await Scores.findOne({boardName:newEntry.boardName,playerName:newEntry.playerName});

        if(existingEntry){
            if(existingEntry.scores < newEntry.scores){
                const updatedEntry = await Scores.findByIdAndUpdate(existingEntry._id,{scores:newEntry.scores, date:newEntry.date},{new:true});
                res.json(updatedEntry);
            }else{
                res.json(null);
            }
        }else{
            const updatedEntry = await newEntry.save();
            res.json(updatedEntry);
        }
       

     
    } catch (error) {
        console.log(error);
        res.json({message: error});
    }
});

//crash
app.post('/crash', async (req,res)=>{
    try {
        console.log("body",req.body); 
    } catch (error) {
        console.log(error);
        res.json({message: error});
    }
});

app.get('/scores',async (req,res)=>{
    try {
        let {boardName,page,size,sort, order} = req.query;

        const filter = boardName ? {boardName:boardName} : {};
        if(!page) page = 1;
        if(!size) size = 10;
        if(!sort) sort = "scores";
        if(!order) order = -1;

        let sortObject = {};
        sortObject[sort] = order;
      
        const scores = await Scores.find(filter).limit(size).skip((page-1)*size).sort(sortObject);
        res.json({page:page,size:size,data:scores});
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