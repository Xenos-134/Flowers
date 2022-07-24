import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, Button } from 'react-native';
import { Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useState, useEffect } from 'react';
import FormData from 'form-data'

const SCREEN = Dimensions.get("screen");
var axios = require('axios');


export default function App() {
  const [image, setImage] = useState(null);
  const [form_data, setForm] = useState(null);
  const [status, requestPermission] = ImagePicker.useCameraPermissions();



  async function sendImage() {

    console.log(form_data)
    axios({
      method: "post",
      //url: SERVER_ADDR+"/item/newCar",
      url: "http://192.168.1.224:3000/evaluate",
      data: form_data,
      headers: {
          "Content-Type": "multipart/form-data", 
      }

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
      <View style={styles.image_view}>
        {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
        <Text>IMAGE</Text>
      </View>
      <View style={styles.predictions_view}>
        <Text>
          PREDICTIONS
        </Text>
      </View>
      <View style={styles.buttons_view}>
        <Button title="SELECT" onPress={pickImage} />
        <Button title="SEND" onPress={sendImage} />
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
    paddingTop: "10%"
  },
  image_view: {
    backgroundColor: "red",
    width: SCREEN.width * 0.95,
    height: SCREEN.width * 0.95
  },
  predictions_view: {
    width: SCREEN.width * 0.9,
    height: SCREEN.width * 0.5,
    backgroundColor: "blue",
    marginTop: 10,
  },
  buttons_view : {
    marginTop: 10,
    backgroundColor: "yellow",
    width: SCREEN.width * 0.8,
    height: SCREEN.height * 0.15,
    justifyContent: "space-evenly",
    flexDirection: "row",
    padding: 20
  }
  
});
