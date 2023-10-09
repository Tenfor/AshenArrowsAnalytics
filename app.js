const express = require('express');

const app = express();
const mongoose = require('mongoose');
require("dotenv/config");

const bodyParser = require("body-parser");
const Scores = require('./schemas/Scores');
const Statistics = require('./schemas/Statistics');
const Guid = require('./schemas/Guid');

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
//guid
app.post('/guid', async (req,res)=>{
    try {
        console.log("body",req.body);
        const newEntry = new Guid({
            playerName: req.body.playerName,
            guid: req.body.guid,
        });

        const existingEntry = await Guid.findOne({playerName:newEntry.playerName});

        if(existingEntry){
                const updatedEntry = await Guid.findByIdAndUpdate(existingEntry._id,{guid:newEntry.guid, playerName:newEntry.playerName},{new:true});
                res.json(updatedEntry);
        }else{
            const updatedEntry = await newEntry.save();
            res.json(updatedEntry);
        }
       

     
    } catch (error) {
        console.log(error);
        res.json({message: error});
    }
});


//Scores
app.post('/scores', async (req,res)=>{
    try {

        // //check guid 
        // const guid = req.body.guid;
   
        let {boardName, realmName, mapName, playerName, scores, date, guid} = req.body;
        let errors = [];
        if(!boardName) errors.push("boardName field is missing from body");
        if(!realmName) errors.push("boardName field is missing from body");
        if(!mapName) errors.push("boardName field is missing from body");
        if(!playerName) errors.push("playerName field is missing from body");
        if(!scores) errors.push("scores field is missing from body");
        if(!date) errors.push("date field is missing from body");
        if(!guid) errors.push("guid field is missing from body");

        console.log(body);

        if(errors.length){
            res.json({message: errors});
            return;
        }


        const existingGuid = await Guid.findOne({playerName:playerName});
        if(!existingGuid || existingGuid.guid !== req.body.guid){
            res.json({message:"guid is invalid"});
            return;
        }

        console.log("body",req.body);
        const newEntry = new Scores({
            boardName: boardName,
            realmName: realmName,
            mapName: mapName,
            playerName: playerName,
            scores: scores,
            date: date,
        });

        const existingEntry = await Scores.findOne({boardName:newEntry.boardName,realmName:newEntry.realmName, mapName:newEntry.mapName, playerName:newEntry.playerName});

        if(existingEntry){
            if(existingEntry.scores < newEntry.scores){
                const updatedEntry = await Scores.findByIdAndUpdate(existingEntry._id,{scores:newEntry.scores, date:newEntry.date},{new:true});
                res.json(updatedEntry);
                return;
            }else{
                res.json({message:"The sent score is not bigger than the latest entry."});
                return;
            }
        }else{
            const updatedEntry = await newEntry.save();
            res.json(updatedEntry);
            return;
        }
       

     
    } catch (error) {
        console.log(error);
        res.json({message: error});
    }
});

app.get('/scores',async (req,res)=>{
    try {
        let {boardName,mapName, realmName, page,size,sort,order,playerName} = req.query;

        if(!playerName){
            res.json({message:"playerName is missing from the query"});
            return;
        }
        
        const filter = {};

        if(boardName){
            filter.boardName = boardName;
        }  
        if(realmName){
            filter.realmName = realmName;
        }
        if(mapName){
            filter.mapName = mapName;
        }

        if(!page) page = 1;
        if(!size) size = 10;
        if(!sort) sort = "scores";
        if(!order) order = -1;

        let sortObject = {};
        sortObject[sort] = order;
      
        const scores = await Scores.find(filter).limit(size).skip((page-1)*size).sort(sortObject);
        const playerScore = await Scores.findOne({playerName:playerName});
        res.json({page:page,size:size,data:scores, playerData:playerScore});
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