import React from 'react';
import { TextInput, TouchableOpacity, FlatList, StyleSheet, Text, View, Image } from 'react-native';
import { f, auth, database, storage } from '../../config/config.js';
import { Font } from 'expo';

import PhotoList from '../components/PhotoList.js'
import UserAuth from '../components/auth.js'

class profile extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      loggedin: false,
      fontLoaded: false,
    }
  }

  async componentDidMount(){
    var that = this;
    f.auth().onAuthStateChanged(function(user){
      if(user){
        //Logged in
        that.fetchUserInfo(user.uid);
      } else {
        //Not logged in
        that.setState({
          loggedin: false
        });
      }
    });

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

  fetchUserInfo = (userId) => {
    var that = this;
    database.ref('users').child(`${userId}`).once('value').then(function(snapshot){
      const exists = (snapshot.val() !== null);
      if(exists) data = snapshot.val();
        that.setState({
          username: data.username,
          name: data.name,
          avatar: data.avatar,
          loggedin: true,
          userId: userId
        })
    });
  }

  saveProfile = () => {

    var name = this.state.name;
    var username = this.state.username;

    if(name !== ''){
      database.ref('users').child(`${this.state.userId}`).child('name').set(name);
    }
    if(username !== ''){
      database.ref('users').child(`${this.state.userId}`).child('username').set(username);
    }
    this.setState({editingProfile: false})
  }

  logoutUser = () => {
    f.auth().signOut();
    alert('Logged out')
  }

  editProfile = () => {
    this.setState({editingProfile: true})
  }

  render(){
    return(
      <View style={{flex: 1}}>
        { this.state.loggedin == true ? (
          //logged in
          <View style={{flex: 1}}>
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Profile</Text>
            </View>
            <View style={{justifyContent:'space-evenly', alignItems: 'center', flexDirection: 'row', paddingVertical: 10}}>
              <Image source={{ uri: this.state.avatar }} style={{marginLeft: 10, width:100, height:100, borderRadius: 50}} />
              <View style={{marginRight: 10}}>
                <Text style={styles.details}>{this.state.name}</Text>
                <Text style={styles.detailsReg}>{this.state.username}</Text>
              </View>
            </View>
            { this.state.editingProfile == true ? (
                <View style={{alignItems: 'center', justifyContent: 'center', paddingBottom:20, borderBottomWidth:1}}>
                  <Text style={styles.details}>Name: </Text>
                  <TextInput
                    editable={true}
                    placehodler={'Enter your name'}
                    onChangeText={(text) => this.setState({name: text})}
                    value={this.state.name}
                    style={{width: 250, marginVertical: 10, padding: 5, borderColor: 'grey', borderWidth: 1}}
                  />
                  <Text style={styles.details}>Username: </Text>
                  <TextInput
                    editable={true}
                    placehodler={'Enter your name'}
                    onChangeText={(text) => this.setState({username: text})}
                    value={this.state.username}
                    style={{width: 250, marginVertical: 10, padding: 5, borderColor: 'grey', borderWidth: 1}}
                  />
                  <TouchableOpacity
                  style={styles.button}
                  onPress={() => this.saveProfile()}>
                    <Text style={styles.buttonText}>Save Changes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => this.setState({editingProfile: false})}
                    style={styles.button}>
                    <Text style={styles.buttonText}>Cancel Editing</Text>
                  </TouchableOpacity>
                </View>
            ) : (

              <View>
                <View style={{paddingBottom:20, borderBottomWidth:1}}>
                  <TouchableOpacity 
                  onPress={() => this.logoutUser()}
                  style={{marginTop: 10, marginHorizontal: 40, paddingVertical: 15, borderRadius: 20, borderColor: 'grey', borderWidth: 1.5}}>
                    <Text style={{textAlign: 'center', color: 'grey', fontFamily: 'Montserrat-Regular'}}>Logout</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                  onPress={() => this.editProfile()}
                  style={{marginTop: 10, marginHorizontal: 40, paddingVertical: 15, borderRadius: 20, borderColor: 'grey', borderWidth: 1.5}}>
                    <Text style={{textAlign: 'center', color: 'grey', fontFamily: 'Montserrat-Regular'}}>Edit Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                  onPress={() => this.props.navigation.navigate('Upload')}
                  style={{backgroundColor: 'grey', marginTop: 10, marginHorizontal: 40, paddingVertical: 35, borderRadius: 20, borderColor: 'grey', borderWidth: 1.5}}>
                    <Text style={{textAlign: 'center', color: 'white', fontFamily: 'Montserrat-Regular'}}>Upload New</Text>
                  </TouchableOpacity>
                </View>
              </View>

            )}

            <PhotoList isUser={true} userId={this.state.userId} navigation={this.props.navigation} />
          </View>
        ) : (
          //not logged in
          <UserAuth message={'Please login to view your profile'} />
        )}
      </View>
    )
  }


}

export default profile;

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
    paddingHorizontal: 20,
    marginTop: 10,
  },
  buttonText: {
    textAlign: 'center',
    color: 'white',
    fontFamily: 'Montserrat-Light'
  },
  details: {
    fontFamily: 'Montserrat-Light'
  },
  detailsOpenSans: {
    fontFamily: 'OpenSans-Regular'
  },
  detailsReg: {
    fontFamily: 'Montserrat-Regular'
  },
});