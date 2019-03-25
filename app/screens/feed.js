import React from 'react';
import { TouchableOpacity, FlatList, StyleSheet, Text, View, Image } from 'react-native';
import { f, auth, database, storage } from '../../config/config.js';

class feed extends React.Component{

    constructor(props){
      super(props);
      this.state = {
        photo_feed: [],
        refresh: false,
        loading: true
      }
    }

    componentDidMount = () => {
      //load the feed from the database
      this.loadFeed();
    }

    pluralCheck = (s) => {
      
      if(s == 1) {
        return ' ago';
      } else {
        return 's ago';
      }

    }

    timeConverter = (timestamp) => {

      var a = new Date(timestamp * 1000);
      var seconds = Math.floor((new Date() - a) / 1000)
      
      //check how many years
      var interval = Math.floor(seconds / 31536000);
      if (interval > 1){
        return interval + ' year' + this.pluralCheck(interval)
      }

      //check how many months
      interval = Math.floor(seconds / 2592000);
      if (interval > 1){
        return interval + ' month' + this.pluralCheck(interval)
      }

      //check how many days
      interval = Math.floor(seconds / 84600);
      if (interval > 1){
        return interval + ' day' + this.pluralCheck(interval)
      }

      //check how many hours
      interval = Math.floor(seconds / 3600);
      if (interval > 1){
        return interval + ' hour' + this.pluralCheck(interval)
      }

      //check how many minutes
      interval = Math.floor(seconds / 60);
      if (interval > 1){
        return interval + ' minute' + this.pluralCheck(interval)
      }

      return Math.floor(seconds) + ' second' + this.pluralCheck(seconds)
      
    }

    addToFlatList = (photo_feed, data, photo) => {
      console.log(data)
      console.log(photo)
      var that = this;
      var photoObj = data[photo];
      database.ref('users').child(`${photoObj.author}`).child('username').once('value').then(function(snapshot) {
        const exists = (snapshot.val() !== null)
        if(exists) data = snapshot.val();
          photo_feed.push({
            // id: photo,
            url: photoObj.url,
            caption: photoObj.caption,
            posted: that.timeConverter(photoObj.posted),
            // author: data,
            authorId: photoObj.author
          });

          that.setState({
            refresh: false,
            loading: false,
            
          });
      }).catch(error => console.log(error));
    }

    loadFeed = () => {
      //reset state
      this.setState({
        refresh: true,
        photo_feed: []
      });

      //making fetch to firebase won't allow us to access 'this'
      var that = this;

      //order by date they are posted, fetch data once (so it won't get more data as they are added),
      database.ref('photos').orderByChild('posted').once('value').then(function(snapshot) {
        //check if photos found in database
        const exists = (snapshot.val() !== null)
        if(exists) data = snapshot.val();
        //allow updates state with each new photo fetched from database
        var photo_feed = that.state.photo_feed;

        for(var photo in data){
          that.addToFlatList(photo_feed, data, photo);
        }
      }).catch(error => console.log(error));

    }

    loadNew = () => {
      this.loadFeed();
    }

    //keyExtractor sets unique index for every item in the flatlist

    render(){
      return(
        <View style={{flex: 1}}>
          
          <View style={{height: 70, paddingTop: 30, backgroundColor: 'white', borderColor: 'lightgrey', borderBottomWidth: 0.5, justifyContent: 'center', alignItems: 'center'}}>
            <Text>Feed</Text>
          </View>

          { this.state.loading == true ? (
            <View style={{flex:1, justifyContent: 'center', alignItems: 'center'}}>
              <Text>Loading...</Text>
            </View>
          ) : (

          <FlatList
            refreshing={this.state.refresh}
            onRefresh={this.loadNew}
            data={this.state.photo_feed}
            keyExtractor={(item, index) => index.toString()}
            style={{flex:1, backgroundColor: '#eee'}}
            renderItem={({item, index}) => (
              <View key={index} style={{width: '100%', overflow: 'hidden', marginBottom: 5, justifyContent:'space-between', borderBottomWidth: 1, borderColor: 'grey'}}>
                <View style={{padding: 5, width: '100%', flexDirection: 'row', justifyContent: 'space-between'}}>
                  <Text>{item.posted}</Text>
                  <TouchableOpacity
                  onPress={ () => this.props.navigation.navigate('User', {userId: item.authorId})}>
                  <Text>{item.authorId}</Text>
                  </TouchableOpacity>
                </View>

                <View>
                  <Image
                  source={{uri: item.url}}
                  style={{resizeMode: 'cover', width: '100%', height: 275}}
                  />
                </View>

                <View style={{padding:5}}>
                  <Text>{item.caption}</Text>
                  <TouchableOpacity
                  onPress={ () => this.props.navigation.navigate('Comments', {userId: item.authorId})}>
                    <Text style={{color: 'blue', marginTop: 10, textAlign: 'center'}}>[ View comments... ]</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            /> 
            )}
        </View>
      )
    }

}

export default feed;