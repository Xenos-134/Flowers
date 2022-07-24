import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, Button, Pressable } from 'react-native';
import { Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useState, useEffect } from 'react';
import FormData from 'form-data'
import { Shadow } from 'react-native-shadow-2';

const SCREEN = Dimensions.get("screen");
var axios = require('axios');


export default function App() {
//===========================================================
//              [USE_STATE] [START]
//===========================================================
  const [image, setImage] = useState(null);
  const [form_data, setForm] = useState(null);
  const [status, requestPermission] = ImagePicker.useCameraPermissions();
  const [prediction, setPrediction] = useState(null);
  const [probabilities, setProbs] = useState(null);
//===========================================================
//              [USE_STATE] [END]
//===========================================================


//===========================================================
//              [MY METHODS] [START]
//===========================================================
  async function sendImage() {
    console.log(form_data)
    await axios({
      method: "post",
      url: "http://192.168.1.224:3000/evaluate",
      data: form_data,
      headers: {
          "Content-Type": "multipart/form-data", 
      }
    }).then(res => {
      console.log("RECEIVED RESPONSE: ",res.data);
      setProbs(res.data.probs);
      //setPrediction(res.data);
    })
  }


  async function testConnection() {
    axios.get("http://192.168.1.224:3000/")
      .then(function (response) {
        // handle success
        console.log(response.data.probs);
        setProbs(res.data.probs);

      })
      .catch(function (error) {
        // handle error
        console.log(">>>",error);
      });
  }

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1,
    });

    console.log('SELECTED NEW IAMGE TTO CLASSIFY:\n ', result);

    if (!result.cancelled) {
      setProbs(null);
      setImage(result.uri);
      const form = new FormData();
      form.append('test', {
       uri: result.uri,
       type: 'image/jpg', 
       name: "test_image.jpg",
     }); 

      console.log(form);
      setForm(form);
    }
  };

//===========================================================
//              [MY METHODS] [END]
//===========================================================
  return (
    <View style={styles.container}>
      {/* SELECTED IMAGE DIV */}
      <Text style={styles.title_text}>Image classification of flowers using tensorflow</Text>
      <View style={{marginVertical: 20}}>
        <Shadow  offset={[3, 3]} distance={10} startColor="#727272" radius={30}>
          <Shadow offset={[-3, -2]} distance={10} startColor="#ffffff" radius={30}>
              <View style={styles.image_view}>
                {!image && <Text>SELECT ONE IMAGE</Text>}
                {image && <Image source={{ uri: image }} style={{ width: SCREEN.width * 0.7, height: SCREEN.width*0.7, borderRadius: 30 }} />}
              </View>
          </Shadow>
        </Shadow>
      </View>
      {/* PREDICTIONS DIV */}
      <Shadow  offset={[3, 3]} distance={10} startColor="#727272" radius={30}>
        <Shadow offset={[-3, -2]} distance={10} startColor="#ffffff" radius={30}>
          {/* PROBABILITIES DIV */}
          <View style={styles.predictions_view}>
          {
            probabilities && 
            <View>
              <ClassificationBar percentage={probabilities[0]} name={"Daisy"}/>
              <ClassificationBar percentage={probabilities[1]} name={"Dandelion"}/>
              <ClassificationBar percentage={probabilities[2]} name={"Roses"}/>
              <ClassificationBar percentage={probabilities[3]} name={"Sunflowers"}/>
              <ClassificationBar percentage={probabilities[4]} name={"Tulips"}/>
            </View>
          }
          </View>
        </Shadow>
      </Shadow>
      {/* BUTTONS DIV */}
      <View style={{marginTop: 30}}>
        <Shadow  offset={[3, 3]} distance={10} startColor="#727272" radius={30}>
          <Shadow offset={[-3, -2]} distance={10} startColor="#ffffff" radius={30}>
            <View style={styles.buttons_view}>
              <Pressable title="SELECT" onPress={pickImage} style={styles.button}>
                <Text style={styles.standar_text}>SELECT</Text>
              </Pressable>
              <Pressable title="SEND" onPress={sendImage} style={[styles.button, {backgroundColor: image?"green":"red"}]}>
                <Text style={styles.standar_text}>CLASSIFY</Text>
              </Pressable>
            </View>
          </Shadow>
        </Shadow>
      </View>
    </View>
  );
}


function ClassificationBar({percentage, name}) {
  const [value, setValue] = useState(0.01); //MIN WIDTH TO BE VISIBLE

  useEffect(()=>{
    if(percentage>0.01) setValue(Math.round(percentage * 100/ 2));
    else setValue(Math.round(0.01 * 100/ 2))
  },[])

  useEffect(()=>{
    if(value!=0.01) console.log(value);
  },[value])

  return (
    <View style={styles.prediction_bar}>
      <Text style={styles.prediction_text} >{name}  </Text>
      <View style={[styles.prediction_bar_p, {width: `${value}%`}]}/>
      <Text>  {Math.round(percentage * 100)}%</Text>
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: "10%",
  },
  image_view: {
    width: SCREEN.width * 0.8,
    height: SCREEN.width * 0.8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    borderRadius: 30,
  },
  predictions_view: {
    width: SCREEN.width * 0.9,
    height: SCREEN.width * 0.5,
    backgroundColor: "#e0e0e0",
    padding: 10,
    borderRadius: 30,
    alignItems: "flex-start",
    justifyContent: "center"
  },
  buttons_view : {
    backgroundColor: "#e0e0e0",
    width: SCREEN.width * 0.9,
    height: SCREEN.height * 0.10,
    justifyContent: "space-evenly",
    alignItems: "center",
    flexDirection: "row",
    padding: 10,
    borderRadius: 30,
  },
  button: {
    width:  SCREEN.width * 0.35,
    height:  SCREEN.width * 0.15,
    backgroundColor: "red",
    alignItems:"center",
    justifyContent:"center",
    borderRadius: 20
  },
  standar_text: {
    color: "white"
  },
  title_text: {
    fontSize: 20,
    fontStyle: 'italic'
  },
  prediction_bar: {
    flexDirection: "row",
    alignItems: "center"
  },
  prediction_bar_p: {
    backgroundColor: "blue",
    height: 10,
    width: "50%",
  },
  prediction_text: {
    width: SCREEN.width*0.3,
    fontSize: 16,
    fontStyle: 'italic',
    fontWeight: "700"
  }
  
});
