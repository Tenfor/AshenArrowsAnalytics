const Guid = require("../schemas/Guid");

const postGuid = async (req,res)=>{
    try {
        console.log("body",req.body);
        if(!req.body.playerName) throw new Error("playerName is missing from body");
        if(!req.body.guid) throw new Error("guid is missing from body");
        const newEntry = new Guid({
            playerName: req.body.playerName,
            guid: req.body.guid,
        });

        const existingEntry = await Guid.findOne({playerName:newEntry.playerName});

        if(existingEntry){
                const updatedEntry = await Guid.findByIdAndUpdate(existingEntry._id,{guid:newEntry.guid, playerName:newEntry.playerName},{new:true});
                res.status(200).json({data:updatedEntry});
        }else{
            const updatedEntry = await newEntry.save();
            res.status(200).json({data:updatedEntry});
        }
       

     
    } catch (error) {
        console.log(error);
        res.status(400).json({error: error.message});
    }
}

module.exports = {postGuid};