const testPost = async(req,res)=>{
    try {
        res.status(200).send("Test Post works!");
    }
    catch(error){
        console.log(error);
        res.status(400).json({message: error});
    }
}

const testGet = async(req,res)=>{
    try {
        res.status(200).send("Test get works!");
    }
    catch(error){
        console.log(error);
        res.status(400).json({message: error});
    }
}

const testPostBody = async (req,res)=>{
    try {
        res.status(200).json({message:"Test Post works!",body:req.body});
    }
    catch(error){
        console.log(error);
        res.status(400).json({message: error});
    }
}

const testGetQuery = async (req,res)=>{
    try {
        res.status(200).json({message:"Test get work!",query:req.query});
    }
    catch(error){
        console.log(error);
        res.status(400).json({message: error});
    }
}

module.exports = {testGet,testPost,testPostBody,testGetQuery}