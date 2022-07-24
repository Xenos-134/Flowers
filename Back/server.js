//***************************************************
//        [LIBRARIIES IMPORTS] [START]
//***************************************************
const express = require("express");
const app = express();
const  server = require("http").createServer(app);
const tf = require("@tensorflow/tfjs");
const tfnode = require('@tensorflow/tfjs-node')
const fs = require("fs");
const sharp = require('sharp');
require('@tensorflow/tfjs-node');
const multer = require("multer");
var cors = require('cors');
let bodyParser = require('body-parser');
const fsExtra = require('fs-extra');

//***************************************************
//        [LIBRARIIES IMPORTS] [END]
//***************************************************


//***************************************************
//        [VARIABLES] [START]
//***************************************************
const SERVER_PORT = 3000;
const FLOWER_LABELS = ["daisy", "dandelion", "roses", "sunflowers", "tulips"];
var model;
//***************************************************
//        [VARIABLES] [END]
//***************************************************


const storage = multer.diskStorage({
    destination(req, file, callback){
        callback(null, "./media")
    },
    filename(req, file, callback){
        console.log("..........",file);
        callback(null, file.originalname.split(".")[0]+Date.now()+".jpg");
    }
})
  
const upload = multer({ storage });

app.use(cors());
app.use(bodyParser.json());




//***************************************************
//             [ROUTES] [START]
//***************************************************
app.get("/", (req, res) => {
    console.log("MAIN PAGE")
    return res.send("HELLO THERE");
})

app.post("/evaluate", upload.any(), async (req, res) => {
    console.log("RECEIVED REQUEST TO EVALUATE ", req.files);
    const image_class = await classifyLocalImage("./media/" + req.files[0].filename);
    removeAllImages();
    return res.send(image_class);
})

//***************************************************
//             [ROUTES] [END]
//***************************************************
function removeAllImages() {
    fsExtra.emptyDir("./media");
}



async function loadModel() {
    model = await tf.loadLayersModel('file://js_model/model.json');
    model.summary()

    /* 
    for (let i = 0; i < model.getWeights().length; i++) {
        console.log(model.getWeights()[i].dataSync());
    }
    */
}


async function preprocessImage(image_name) {
    const output_image_name = image_name.split(".jpg")[0]+"r.jpg"
    await sharp(image_name)
        .resize(224, 224)
        .toFile(output_image_name);

    return output_image_name;
}



async function classifyLocalImage(image_name) {
    const output_image_name = await preprocessImage(image_name);
    var tensor = readImage(output_image_name)

    tensor = tensor.reshape([1, 224, 224, 3]);
    (await tensor.data())[1] = -10;

    //console.log( await tensor.div(255).data() )
    var result = model.predict(tensor.div(255));
    console.log(await tensor.div(255).data())
    result = Array.from(await result.data());
    console.log(result);
    console.log(FLOWER_LABELS[result.indexOf(Math.max(...result))]);
    return {class: FLOWER_LABELS[result.indexOf(Math.max(...result))], probs: result};
}
  

const readImage = path => {     
    const imageBuffer = fs.readFileSync(path);     
    const tfimage = tfnode.node.decodeJpeg(imageBuffer); 
    //default #channel 4     
    return tfimage;   
}



//***************************************************
//             [SERVER] [START]
//***************************************************
function start() {
    try {
        server.listen(SERVER_PORT, () => {
            loadModel();
            console.log("STARTED SERVER ON PORT ", SERVER_PORT);
        })
    } catch(e) {
        console.log(e);
    }
}

start();
//***************************************************
//             [SERVER] [END]
//***************************************************