import React from 'react';
import { TouchableOpacity, FlatList, StyleSheet, Text, View, Image } from 'react-native';
import { f, auth, database, storage } from '../../config/config.js';
import { Font } from 'expo'

import PhotoList from '../components/PhotoList.js'

export default class feed extends React.Component{

    constructor(props){
      super(props);
      this.state = {
        photo_feed: [],
        refresh: false,
        loading: true,
        fontLoaded: false,
      }
    }

    // componentDidMount = () => {
    //   //load the feed from the database
      
    // }

    async componentDidMount() {
      await Font.loadAsync({
        'Montserrat-Light': require('../../assets/fonts/Montserrat-Light.ttf'),
        'Montserrat-Regular': require('../../assets/fonts/Montserrat-Regular.ttf'),
        'Montserrat-Bold': require('../../assets/fonts/Montserrat-Bold.ttf'),
        'OpenSans-Bold': require('../../assets/fonts/OpenSans-Bold.ttf'),
        'OpenSans-Light': require('../../assets/fonts/OpenSans-Bold.ttf'),
        'OpenSans-Regular': require('../../assets/fonts/OpenSans-Bold.ttf'),
      });

      this.setState({ fontLoaded: true });
    }

    render(){
      return(
        <View style={{flex: 1}}>
          
          <View style={styles.headerContainer}>
            {
              this.state.fontLoaded ? (
                <Text style={styles.title}>Feed</Text>
              ) : null
            }
          </View>

          <PhotoList isUser={false} navigation={this.props.navigation} />
        </View>
      )
    }
}

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
  details: {
    fontFamily: 'Montserrat-Light'
  },
  detailsOpenSans: {
    fontFamily: 'OpenSans-Regular'
  },
  loading: {
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewComments: {
    color: 'blue',
    marginTop: 10,
    textAlign: 'center',
    fontFamily: 'Montserrat-Light'
  },
  feedImage: {
    resizeMode: 'cover',
    width: '100%',
    height: 275
  },
  feedContainer: {
    width: '100%',
    overflow: 'hidden',
    marginBottom: 5,
    justifyContent:'space-between',
    borderBottomWidth: 1,
    borderColor: 'grey'
  },
  feedHeaderContainer: {
    padding: 5,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  flatListContainer: {
    flex:1,
    backgroundColor: '#eee'
  }
});