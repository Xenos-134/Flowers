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
  const [image, setImage] = useState(null);
  const [form_data, setForm] = useState(null);
  const [status, requestPermission] = ImagePicker.useCameraPermissions();
  const [prediction, setPrediction] = useState(null);



  async function sendImage() {

    console.log(form_data)
    await axios({
      method: "post",
      //url: SERVER_ADDR+"/item/newCar",
      url: "http://192.168.1.224:3000/evaluate",
      data: form_data,
      headers: {
          "Content-Type": "multipart/form-data", 
      }
    }).then(res => {
      console.log("RECEIVED RESPONSE: ",res.data);
      setPrediction(res.data);
    })
  }


  async function testConnection() {
    axios.get("http://192.168.1.224:3000/")
      .then(function (response) {
        // handle success
        console.log(response.data);
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
      allowsEditing: true,
      quality: 1,
    });

    console.log('SELECTED NEW IAMGE TTO CLASSIFY:\n ', result);

    if (!result.cancelled) {
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



  return (
    <View style={styles.container}>
      <Text>Image classification of flowersusing tensorflow </Text>
      <View style={{marginVertical: 20}}>
        <Shadow  offset={[3, 3]} distance={10} startColor="#727272" radius={30}>
          <Shadow offset={[-3, -2]} distance={10} startColor="#ffffff" radius={30}>
              <View style={styles.image_view}>
                {image && <Image source={{ uri: image }} style={{ width: SCREEN.width * 0.7, height: SCREEN.width*0.7, borderRadius: 30 }} />}
              </View>
          </Shadow>
        </Shadow>
      </View>

      <Shadow  offset={[3, 3]} distance={10} startColor="#727272" radius={30}>
        <Shadow offset={[-3, -2]} distance={10} startColor="#ffffff" radius={30}>
          <View style={styles.predictions_view}>
            {!prediction?<Text>NO PREDICTIONS</Text>:<Text>{prediction}</Text>}
          </View>
        </Shadow>
      </Shadow>
      <View style={{marginTop: 30}}>
        <Shadow  offset={[3, 3]} distance={10} startColor="#727272" radius={30}>
          <Shadow offset={[-3, -2]} distance={10} startColor="#ffffff" radius={30}>
            <View style={styles.buttons_view}>
              <Pressable title="SELECT" onPress={pickImage} style={styles.button}>
                <Text>SELECT</Text>
              </Pressable>
              <Pressable title="SEND" onPress={sendImage} style={[styles.button, {backgroundColor: "green"}]}>
                <Text>CLASSIFY</Text>
              </Pressable>
            </View>
          </Shadow>
        </Shadow>
      </View>
    </View>
  );
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
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center"
  },
  buttons_view : {
    backgroundColor: "#e0e0e0",
    width: SCREEN.width * 0.9,
    height: SCREEN.height * 0.15,
    justifyContent: "space-evenly",
    alignItems: "center",
    flexDirection: "row",
    padding: 20,
    borderRadius: 30,
  },
  button: {
    width:  SCREEN.width * 0.35,
    height:  SCREEN.width * 0.15,
    backgroundColor: "red",
    alignItems:"center",
    justifyContent:"center",
    borderRadius: 20
  }
  
});
