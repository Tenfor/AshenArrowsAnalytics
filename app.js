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

app.get('/scores',async (req,res)=>{
    try {
        let {boardId,page,size} = req.query;

        const filter = boardId ? {boardId:boardId} : {};
        if(!page) page = 1;
        if(!size) size = 10;

        const scores = await Scores.find(filter).limit(size).skip((page-1)*size);
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