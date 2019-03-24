import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator, createAppContainer } from 'react-navigation';
import { f, auth, database, storage } from './config/config.js';

import feed from './app/screens/feed.js';
import upload from './app/screens/upload.js';
import profile from './app/screens/profile.js';


const MainStack = createBottomTabNavigator(
  {
    Feed: { screen: feed },
    Upload: { screen: upload },
    Profile: { screen: profile }
  }
)

const AppContainer = createAppContainer(MainStack);

export default class App extends React.Component {

  login = async() => {
    //Force user to login
    try {
      let user = await auth.signInWithEmailAndPassword('test@user.com', 'password');
    } catch(error){
      console.log(error);
    }
  }

  constructor(props){
    super(props);
    this.login();
  }

  render() {
    return (
      <AppContainer />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
