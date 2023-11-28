const Guid = require("../schemas/Guid");
const Scores = require("../schemas/Scores");
const postScores = async (req,res)=>{
    try {   
        let {boardName, realmName, mapName, playerName, scores, date, guid, playerNumber} = req.body;
        if(!boardName) throw new Error("boardName field is missing from body");
        if(!realmName) throw new Error("realmName field is missing from body");
        if(!mapName) throw new Error("mapName field is missing from body");
        if(!playerName) throw new Error("playerName field is missing from body");
        if(!scores) throw new Error("scores field is missing from body");
        if(!date) throw new Error("date field is missing from body");
        if(!guid) throw new Error("guid field is missing from body");
        if(!playerNumber) throw new Error("playerNumber field is missing from body");

        console.log("POST SCORES", req.body);
        const existingGuid = await Guid.findOne({playerName:playerName});

        if(!existingGuid || existingGuid.guid !== guid){
          
            res.status(401).json({message:"guid is invalid"});
            return;
        }

        const newEntry = new Scores({
            boardName: boardName,
            realmName: realmName,
            mapName: mapName,
            playerName: playerName,
            scores: scores,
            date: date,
            playerNumber:playerNumber
        });

        const existingEntry = await Scores.findOne({boardName:newEntry.boardName,realmName:newEntry.realmName, mapName:newEntry.mapName, playerName:newEntry.playerName});

        if(existingEntry){
            if(existingEntry.scores < newEntry.scores){
                const updatedEntry = await Scores.findByIdAndUpdate(existingEntry._id,{scores:newEntry.scores, date:newEntry.date},{new:true});
                res.status(200).json(updatedEntry);
                return;
            }else{
                res.status(400).json({message:"The sent score is not bigger than the latest entry."});
                return;
            }
        }else{
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
        let {boardName,mapName, realmName, page,size,sort,order,playerName, playerNumber} = req.body;

        console.log("GET SCORES", req.body);

        if(!playerName){
            throw new Error("playerName is missing from the body");
        }
        if(!boardName){
            throw new Error("boardName is missing from the body");
        }
        if(!realmName){
            throw new Error("realmName is missing from the body");
        }
        if(!mapName){
            throw new Error("mapName is missing from the body");
        }
        if(!playerNumber){
            playerNumber = 1;
        }
        
        const filter = {
            playerNumber:playerNumber,
            boardName: boardName,
            realmName: realmName,
            mapName: mapName
        };

        if(!page) page = 1;
        if(!size) size = 10;
        if(!sort) sort = "scores";
        if(!order) order = -1;

        let sortObject = {};
        sortObject[sort] = order;
      
        const scores = await Scores.find(filter).limit(size).skip((page-1)*size).sort(sortObject);
        const playerScore = await Scores.findOne({...filter,playerName:playerName});
        let playerData = {playerName:playerName, scores:0, rank:-1};
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

const getBestOfAll = async (req,res)=>{
    try {
        let {boardName,page,size,sort,order,playerName, playerNumber} = req.body;

        console.log("GET BEST OF ALL", req.body);

        if(!boardName){
            throw new Error("boardName is missing from the body");
        }
        if(!playerName){
            throw new Error("playerName is missing from the body");
        }

        if(!playerNumber) playerNumber = 1;

        if(!page) page = 1;
        if(!size) size = 10;
        if(!sort) sort = "scores";
        if(!order) order = -1;

        const sortField = `${sort}`;

        const scores = await Scores.aggregate([
            { $match: {boardName: boardName, playerNumber:playerNumber}},
            { $group: { 
                _id: "$playerName", 
                playerName: { $first: "$playerName" },
                boardName: { $first: "$boardName" },
                realmName: { $first: "$realmName" },
                mapName: { $first: "$mapName" },
                date: { $first: "$date" },
                playerNumber: { $first: "$playerNumber" },
                scores: { $max: "$scores" } }
            },
            { $sort: { [sortField]: order } },
            { $skip: (page-1) * size }
          ]);

          const playerScore = await Scores.aggregate([
            { $match: {boardName: boardName, playerNumber:playerNumber, playerName:playerName}},
            { $group: { 
                _id: "$playerName", 
                playerName: { $first: "$playerName" },
                boardName: { $first: "$boardName" },
                realmName: { $first: "$realmName" },
                mapName: { $first: "$mapName" },
                date: { $first: "$date" },
                playerNumber: { $first: "$playerNumber" },
                scores: { $max: "$scores" } }
            },
            { $sort: { [sortField]: order } },
            { $skip: (page-1) * size }
          ]);

          let playerData = {playerName:playerName, scores:0, rank:-1};

          if(playerScore.length){
            const playerRank = await Scores.aggregate([
                {
                  $match: { boardName: boardName, playerNumber: playerNumber, scores: { $gt: playerScore[0].scores } },
                },
                {
                  $group: {
                    _id: "$playerName",
                    scores: { $max: "$scores" },
                    count: { $sum: 1 },
                  },
                },
                { $sort: { [sortField]: order } },
              ]);
              playerData = {...playerScore[0],rank:playerRank.length ? playerRank[0].count+1 : 1} 
          }
      
          res.status(200).json({page:page,size:size,data:scores, playerData:playerData});
        } catch (err) {
          res.status(500).json({ message: err.message });
        }
};

// const updatedb = async (req, res) =>{
//     try {
  

//         for (let i = 0; i < 5; i++) {
//             let newEntry = new Scores({
//                 boardName: "Season_0_(Beta)",
//                 realmName: "Alfheim",
//                 mapName: "Riverside",
//                 playerName: `PrecreateScore_${i+1}_A,PrecreateScore_${i+1}_B,PrecreateScore_${i+1}_C`,
//                 scores: 1000 + i,
//                 date: Date.now(),
//                 playerNumber: 3,
//             });

//             await newEntry.save();
//         }

//         res.status(200).json({message:"success"});

     
//       } catch (err) {
//         res.status(500).json({ error: 'Hiba történt a frissítés során.', details: err.message });
//       }
// }

module.exports = {getScores, postScores, getBestOfAll};