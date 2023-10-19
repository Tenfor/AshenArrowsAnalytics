const Guid = require("../schemas/Guid");
const Scores = require("../schemas/Scores");
const postScores = async (req,res)=>{
    try {   
        let {boardName, realmName, mapName, playerName, scores, date, guid} = req.body;
        if(!boardName) throw new Error("boardName field is missing from body");
        if(!realmName) throw new Error("realmName field is missing from body");
        if(!mapName) throw new Error("mapName field is missing from body");
        if(!playerName) throw new Error("playerName field is missing from body");
        if(!scores) throw new Error("scores field is missing from body");
        if(!date) throw new Error("date field is missing from body");
        if(!guid) throw new Error("guid field is missing from body");

        console.log("POST SCORES", req.body);
        const existingGuid = await Guid.findOne({playerName:playerName});

        if(!existingGuid || existingGuid.guid !== guid){
          
            res.status(401).json({message:"guid is invalid"});
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
            console.log("test");
            if(existingEntry.scores < newEntry.scores){
                console.log("test2");
                const updatedEntry = await Scores.findByIdAndUpdate(existingEntry._id,{scores:newEntry.scores, date:newEntry.date},{new:true});
                res.status(200).json(updatedEntry);
                return;
            }else{
                console.log("test3");
                res.status(400).json({message:"The sent score is not bigger than the latest entry."});
                return;
            }
        }else{
            console.log("test4");
            const updatedEntry = await newEntry.save();
            res.status(200).json(updatedEntry);
            return;
        }
       

     
    } catch (error) {
        console.log(error);
        res.status(400).json({error: error.message});
    }
}

const getScores = async (req,res)=>{
    try {
        let {boardName,mapName, realmName, page,size,sort,order,playerName} = req.query;

        console.log("GET SCORES", req.query);

        if(!playerName){
            throw new Error("playerName is missing from the query");
        }
        
        const filter = {};

        if(boardName){
            filter.boardName = boardName;
        }  
        if(realmName && realmName !== "BestOfAll"){
            filter.realmName = realmName;
        }
        if(mapName){
            filter.mapName = mapName;
        }

        console.log(filter);

        if(!page) page = 1;
        if(!size) size = 10;
        if(!sort) sort = "scores";
        if(!order) order = -1;

        let sortObject = {};
        sortObject[sort] = order;
      
        const scores = await Scores.find(filter).limit(size).skip((page-1)*size).sort(sortObject);
        const playerScore = await Scores.findOne({...filter,playerName:playerName});
        let playerData = {playerName:playerName, scores:0, rank:9999};
        if(playerScore){
            const playerRank = await Scores.find({ ...filter, scores: { $gt: playerScore.scores } }).countDocuments() + 1;
            playerData = {...playerScore._doc,rank:playerRank} 
        }
        res.status(200).json({page:page,size:size,data:scores, playerData:playerData});
    } catch (error) {
        console.log(error);
        res.status(400).json({error: error.message});
    }
};

module.exports = {getScores, postScores};