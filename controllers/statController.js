const Stats = require("../schemas/Statistics");

const getStats = async (req,res)=>{
    try {

        let {page,size} = req.query;
        if(!page) page = 1;
        if(!size) size = 10;
        const stats = await Statistics.find().limit(size).skip((page-1)*size);
        res.status(200).json({page:page,size:size,data:stats});
    } catch (error) {
        console.log(error);
        res.status(400).json({error: error.message});
    }
}

const postStats = async (req,res)=>{
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

        res.status(200).json(uploadedStats);
    } catch (error) {
        console.log(error);
        res.status.json({error: error.message});
    }
}

module.exports = {getStats,postStats}