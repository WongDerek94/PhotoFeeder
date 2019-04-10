import React from 'react';
import { TextInput, ActivityIndicator, TouchableOpacity, FlatList, StyleSheet, Text, View, Image } from 'react-native';
import { f, auth, database, storage } from '../../config/config.js';
import { Permissions, ImagePicker } from 'expo';
import { Font } from 'expo';

import UserAuth from '../components/auth.js'

class upload extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      loggedin: false,
      imageId: this.uniqueId(),
      imageSelected: false,
      uploading: false,
      caption: "",
      progress: 0,
      fontLoaded: false,
    };
  }

  _checkPermissions = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({camera: status})    
    const { statusRoll } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    this.setState({cameraRoll: statusRoll})
  }

  s4 = () => {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  };

  uniqueId = () => {
    return(
      this.s4() + this.s4() + "-" + this.s4() + "-" + this.s4() + "-" + this.s4() + "-" + this.s4() + "-" + this.s4() + "-" + this.s4()
    );
  }

  findNewImage = async () => {
    this._checkPermissions();

    //mediaTypes = only show images
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'Images',
      allowsEditing: true, 
      quality: 1
    })

    console.log(result);

    if(!result.cancelled){

      //process image and upload to firebase storage
      console.log('upload image');
      this.setState({
        imageSelected: true,
        imageId: this.uniqueId(),
        uri: result.uri
      })
      // this.uploadImage(result.uri)
    } else {
      console.log('cancel');
      this.setState({
        imageSelected: false
      });
    }
  }

  uploadPublish = () => {
    if (this.state.uploading == false) {
      if (this.state.caption != "") {
        //
        this.uploadImage(this.state.uri);
      } else {
        alert("Please enter a caption..");
      }
    } else {
      console.log("Ignore button tap as already uploading");
    }
  };

  uploadImage = async (uri) => {
    //
    var that = this;
    var userid = f.auth().currentUser.uid;
    var imageId = this.state.imageId;

    //what type of extension did user use?
    var re = /(?:\.([^.]+))?$/;
    //get everything after the dot image.png
    var ext = re.exec(uri)[1];
    this.setState({
      currentFileType: ext,
      uploading:true
    });

    //turn image uri into blob to upload to firebase storage
    var FilePath = imageId + "." + that.state.currentFileType;

    const oReq = new XMLHttpRequest();
    oReq.open("GET", uri, true);
    oReq.responseType = "blob";
    oReq.onload = () => {
      const blob = oReq.response;
      //Call function to complete upload with the new blob to handle the uploadTask
      this.completeUploadBlob(blob, FilePath);
    };
    oReq.send();
  }

  completeUploadBlob = (blob, FilePath) => {
    var that = this;
    var userid = f.auth().currentUser.uid;
    var imageId = this.state.imageId;
 
    var uploadTask = storage
      .ref("user/" + userid + "/img")
      .child(FilePath)
      .put(blob);
 
    uploadTask.on(
      "state_changed",
      function(snapshot) {
        var progress = (
          (snapshot.bytesTransferred / snapshot.totalBytes) *
          100
        ).toFixed(0);
        console.log("Upload is " + progress + "% complete");
        that.setState({
          progress: progress
        });
      },
      function(error) {
        console.log("error with upload - " + error);
      },
      function() {
        //complete
        that.setState({ progress: 100 });
        uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
          console.log(downloadURL);
          that.processUpload(downloadURL);
        });
      }
    );
  };

  processUpload = (imageUrl) => {
    //Process here...
 
    //Set needed info
    var imageId = this.state.imageId;
    var userId = f.auth().currentUser.uid;
    var caption = this.state.caption;
    var dateTime = Date.now();
    var timestamp = Math.floor(dateTime / 1000);
    //Build photo object
    //author, caption, posted, url
 
    var photoObj = {
      author: userId,
      caption: caption,
      posted: timestamp,
      url: imageUrl,
    };
 
    //Update database
 
    //Add to main feed
    database.ref(`/photos/${imageId}`).set(photoObj);
 
    //Set user photos object
    database.ref(`/users/${userId}/photos/${imageId}`).set(photoObj);
 
    alert("Image Uploaded!!");
 
    this.setState({
      uploading: false,
      imageSelected: false,
      caption: "",
      uri: ""
    });
  };


  async componentDidMount(){
    var that = this;
    f.auth().onAuthStateChanged(function(user){
      if(user){
        //Logged in
        that.setState({
          loggedin: true
        });
      } else {
        //Not logged in
        that.setState({
          loggedin: false
        });
      }
    })

    await Font.loadAsync({
      'Montserrat-Light': require('../../assets/fonts/Montserrat-Light.ttf'),
      'Montserrat-Regular': require('../../assets/fonts/Montserrat-Regular.ttf'),
      'Montserrat-Bold': require('../../assets/fonts/Montserrat-Bold.ttf'),
      'OpenSans-Bold': require('../../assets/fonts/OpenSans-Bold.ttf'),
      'OpenSans-Light': require('../../assets/fonts/OpenSans-Bold.ttf'),
      'OpenSans-Regular': require('../../assets/fonts/OpenSans-Bold.ttf'),
    })

    this.setState({ fontLoaded: true })
  }

  render(){
    return(
      <View style={{flex: 1}}>
        { this.state.loggedin == true ? (
          //logged in
          <View style={{flex: 1}}>
            { this.state.imageSelected == true ? (
              //image is selected
              <View style={{flex: 1}}>
                <View style={styles.headerContainer}>
                  <Text style={styles.title}>Upload</Text>
                </View>
                <View style={{padding:5}}>
                  <Text style={styles.captionText}>Caption:</Text>
                  <TextInput
                    editable={true}
                    placeholder={'Enter your caption...'}
                    maxLength={150}
                    multiline={true}
                    numberOfLines={4}
                    onChangeText={(text) => this.setState({caption: text})}
                    style={{marginVertical:10, height: 100, padding: 5, borderColor: 'grey', borderWidth: 1, borderRadius: 3, backgroundColor: 'white', color: 'black'}}
                    />
                  
                  <TouchableOpacity
                  onPress={ () => this.uploadPublish()}
                  style={styles.button}>
                    <Text style={styles.buttonText}>Upload and Publish</Text>
                  </TouchableOpacity>

                  { this.state.uploading == true ? (
                    //button is pressed and uploading is happening
                    <View style={{marginTop: 10}}>
                      <Text>{this.state.progress}%</Text>
                      { this.state.progress != 100 ? (
                        <ActivityIndicator size="small" color="blue" />
                      ) : (
                        <Text style={styles.details}>Processing</Text>
                      )}
                    </View>
                  ) : (
                    <View></View>
                  )}

                  <Image
                  source={{uri: this.state.uri}}
                  style={{marginTop:10, resizeMode: 'cover', width: '100%', height: 275}}
                  />

                </View>
              </View>
            ): (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <Text style={styles.upload}>Upload</Text>
              <TouchableOpacity
              onPress={() => this.findNewImage()}
              style={styles.button}>
                <Text style={styles.buttonText}>Select Photo</Text>
              </TouchableOpacity>
            </View>
            )}
          </View>
        ) : (
          //not logged in
          <UserAuth message={'Please login to upload a photo'} />
        )}
      </View>
    )
  }


}

export default upload;

const styles = StyleSheet.create({
  headerContainer: {
    height: 70, 
    paddingTop: 20, 
    backgroundColor: 'white', 
    borderColor: 'lightgrey', 
    borderBottomWidth: 0.5, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Montserrat-Regular'
  },
  upload: {
    fontSize: 28,
    paddingBottom: 15,
    fontFamily: 'Montserrat-Regular'
  },
  captionText: {
    marginTop: 5,
    fontFamily: 'Montserrat-Light'
  },
  button: {
    alignSelf:'center',
    width: 190,
    marginHorizontal: 'auto',
    backgroundColor: '#0099ff',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20
  },
  buttonText: {
    textAlign: 'center',
    color: 'white',
    fontFamily: 'Montserrat-Light'
  },
  details: {
    fontFamily: 'Montserrat-Light'
  }
});