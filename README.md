# Flowers
Small project to test tensorflow model with react native and node. Because of dependencies problem between expo and tensorflow.js was unable to use model directliy inside of app. Due to that I consume generated model in backend.

---
**ModelTraining**

Generates model from dataset (https://storage.googleapis.com/download.tensorflow.org/example_images/flower_photos.tgz)
```
# flag [t] to train model. default is to classify image using generated model.
python3 model.py [-t] 
```
convert model from .h5 to json in order to consume inside of node 
```
tensorflowjs_converter --input_format=keras --weight_shard_size_bytes {WEIGHT_SHARD_SIZE_BYTES} ./name_of_in.h5 ./name_of_out
```![test](https://user-images.githubusercontent.com/87715226/180664081-ddc02845-838b-46fc-a2d9-1ea65821a253.gif)
```

---
**Back**

Backend for app
```
npm run start
```
---
**App**

RN app to send images to backend and display classification

```
  expo start
```
