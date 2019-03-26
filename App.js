import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createStackNavigator, createBottomTabNavigator, createAppContainer, createMaterialBottomTabNavigator } from 'react-navigation';
import { f, auth, database, storage } from './config/config.js';
import { Ionicons } from '@expo/vector-icons';

import feed from './app/screens/feed.js';
import upload from './app/screens/upload.js';
import profile from './app/screens/profile.js';
import userProfile from './app/screens/userProfile.js';
import comments from './app/screens/comments.js';


const mainTabs = createBottomTabNavigator(
  {

    Feed: {
      screen: feed,
    },
    Upload: { screen: upload },
    Profile: { screen: profile }
  }
)

const MainStack = createStackNavigator(
  {
    Home: { screen: mainTabs },
    User: { screen: userProfile },
    Comments: { screen: comments }
  },
  {
    initialRouteName: 'Home',
    mode: 'modal',
    headerMode: 'none',

  }
)

const AppContainer = createAppContainer(MainStack);

export default class App extends React.Component {
  constructor(props){
    super(props);
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
