#!/usr/bin/python
#==============================================================#
#                       TRAIN MODEL                            #                                        
#==============================================================#
from cProfile import label
from concurrent.futures import process
from http.client import TEMPORARY_REDIRECT
from operator import ne
from statistics import mode
import sys
from tabnanny import verbose
from tkinter.filedialog import Directory
from traceback import print_tb
from turtle import width

import tensorflow as tf
from tensorflow.keras import datasets, layers, models
import matplotlib.pyplot as plt

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv1D, Dense, MaxPooling1D, Flatten
from tensorflow.keras.optimizers import Adam

import numpy as np
from sklearn.preprocessing import LabelBinarizer
from sklearn.model_selection import train_test_split

from sklearn.metrics import confusion_matrix
import itertools
import seaborn as sn
import pandas as pd
import matplotlib.pyplot as plt

from enum import  Enum
from tensorflow.python.client import device_lib

import PIL
import PIL.Image
import pathlib
import json

FLOWER_LABELS = ["daisy", "dandelion", "roses", "sunflowers", "tulips"];

def vgg16_image_preprocess():
    dataset_url = "https://storage.googleapis.com/download.tensorflow.org/example_images/flower_photos.tgz"
    data_dir = tf.keras.utils.get_file('flower_photos', origin=dataset_url, untar=True)
    data_dir = pathlib.Path(data_dir)
    image_count = len(list(data_dir.glob('*/*.jpg')))
    print(image_count)
    roses = list(data_dir.glob('roses/*'))
    batch_size = 32
    img_height = 180
    img_width = 180

    train_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        validation_split=0.2,
        subset="training",
        seed=123,
        image_size=(img_height, img_width),
        batch_size=batch_size)

    val_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        validation_split=0.2,
        subset="validation",
        seed=123,
        image_size=(img_height, img_width),
        batch_size=batch_size)

    class_names = train_ds.class_names
    print(class_names)

    AUTOTUNE = tf.data.AUTOTUNE

    train_ds = train_ds.cache().shuffle(1000).prefetch(buffer_size=AUTOTUNE)
    val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)
    normalization_layer = layers.Rescaling(1./255)
    normalized_train_ds = train_ds.map(lambda x, y: (normalization_layer(x), y))
    normalized_val_ds = val_ds.map(lambda x, y: (normalization_layer(x), y))
    image_batch, labels_batch = next(iter(normalized_train_ds))
    first_image = image_batch[0]
    # Notice the pixel values are now in `[0,1]`.
    print(np.min(first_image), np.max(first_image))

    num_classes = len(class_names)


    ''' 
    model = Sequential([
        layers.Conv2D(16, 3, padding='same', activation='relu'),
        layers.MaxPooling2D(),
        layers.Conv2D(32, 3, padding='same', activation='relu'),
        layers.MaxPooling2D(),
        layers.Conv2D(64, 3, padding='same', activation='relu'),
        layers.MaxPooling2D(),
        layers.Flatten(),
        layers.Dense(128, activation='relu'),
        layers.Dense(num_classes)
    ])'''


    model = Sequential([
        layers.Conv2D(16, 3, padding='same', activation='relu'),
        layers.MaxPooling2D(),
        layers.Conv2D(32, 3, padding='same', activation='relu'),
        layers.MaxPooling2D(),
        layers.Conv2D(64, 3, padding='same', activation='relu'),
        layers.MaxPooling2D(),
        layers.Flatten(),
        layers.Dense(128, activation='relu'),
        layers.Dense(num_classes)
        ])


    model.compile(optimizer='adam',
              loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True),
              metrics=['accuracy'])

    epochs= 5
    history = model.fit(
        normalized_train_ds,
        validation_data=normalized_val_ds,
        epochs=epochs
    )

    #SAVE MODEL
    print(history)
    model.save("./model.h5")
    #with open('model.json', 'w') as f:
        #json.dump(data, f)
    model.save_weights("./weights.h5")


def classify():
    dataset_url = "https://storage.googleapis.com/download.tensorflow.org/example_images/flower_photos.tgz"
    data_dir = tf.keras.utils.get_file('flower_photos', origin=dataset_url, untar=True)

    train_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        validation_split=0.2,
        subset="training",
        seed=123,
        image_size=(180, 180),
        batch_size=10)


    class_names = train_ds.class_names
    print(class_names)

    model = tf.keras.models.load_model("./model.h5")
    #model.load_weights("./weights.h5")
    image = tf.keras.preprocessing.image.load_img(
        "./test.jpg",
        target_size = (180, 180)
        )
    input_arr = tf.keras.preprocessing.image.img_to_array(image)
    input_arr = np.array([input_arr])  # Convert single image to a batch.
    predictions = model.predict(input_arr)
    score = tf.nn.softmax(predictions[0])
    print(score)
    print(FLOWER_LABELS[np.argmax(score)])
    score = tf.nn.softmax(predictions[0])

    print(
        "This image most likely belongs to {} with a {:.2f} percent confidence."
        .format(FLOWER_LABELS[np.argmax(score)], 100 * np.max(score))
    )



def get_flags(flags):
    flags_obj = {
        "file_path": "./test5.jpg", #or dir path
        "is_train": False, #DEFAULT IS TO TEST SOME IMAGE
    }

    if("-d" in flags): flags_obj['file_path'] = flags[flags.index("-d")+1]
    if("-t" in flags): flags_obj['is_train'] = True

    print(flags_obj)
    return flags_obj



if __name__ == "__main__":
    flags = get_flags(sys.argv)
    if (flags["is_train"]): vgg16_image_preprocess()
    else: classify()

