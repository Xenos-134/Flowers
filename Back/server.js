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
    destination: "./uploads/",
    filename: function (req, file, cb) {
      cb(null,  "test_image_" + Date.now() + "." + file.originalname.split(".").pop());
    },
  });
  
  const diskStorage = multer({ storage: storage });


//***************************************************
//             [ROUTES] [START]
//***************************************************
app.get("/", (req, res) => {
    console.log("MAIN PAGE")
    return res.send("HELLO THERE");
})

app.post("/evaluate", diskStorage.single("image"), async (req, res) => {
    console.log("RECEIVED REQUEST TO EVALUATE ", req.file);
    classifyLocalImage("./uploads/" + req.file.filename);
    return res.send("RESPONSE FOR EVALUATION");
})

//***************************************************
//             [ROUTES] [END]
//***************************************************



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
        .resize(180, 180)
        .toFile(output_image_name);

    return output_image_name;
}



async function classifyLocalImage(image_name) {
    const output_image_name = await preprocessImage(image_name);
    var tensor = readImage(output_image_name)

    tensor = tensor.reshape([1, 180, 180, 3]);
    (await tensor.data())[1] = -10;

    //console.log( await tensor.div(255).data() )
    var result = model.predict(tensor.div(255));
    result = Array.from(await result.data());
    console.log(FLOWER_LABELS[result.indexOf(Math.max(...result))]);
    return FLOWER_LABELS[result.indexOf(Math.max(...result))]
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