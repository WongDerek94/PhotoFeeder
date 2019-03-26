import React from 'react';
import { TouchableOpacity, FlatList, StyleSheet, Text, View, Image } from 'react-native';
import { f, auth, database, storage } from '../../config/config.js';
import { Font } from 'expo'

class PhotoList extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      photo_feed: [],
      refresh: false,
      loading: true,
      empty: false,
      fontLoaded: false
    }
  }

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
    
    const { isUser, userId } = this.props;

    if(isUser == true){
      //Profile
      //userid
      this.loadFeed(userId);

    } else {
      this.loadFeed('');
    }
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
    // console.log(data)
    // console.log(photo)
    var that = this;
    var photoObj = data[photo];
    database.ref('users').child(`${photoObj.author}`).child('username').once('value').then(function(snapshot) {
      const exists = (snapshot.val() !== null)
      if(exists) data = snapshot.val();
        photo_feed.push({
          id: photo,
          url: photoObj.url,
          caption: photoObj.caption,
          posted: that.timeConverter(photoObj.posted),
          timestamp: photoObj.posted,
          // author: data,
          authorId: photoObj.author
        });

        var myData = [].concat(photo_feed).sort((a,b) => a.timestamp < b.timestamp)

        that.setState({
          refresh: false,
          loading: false,
          photo_feed: myData
        });
    }).catch(error => console.log(error));
  }

  loadFeed = (userId) => {
    //reset state
    this.setState({
      refresh: true,
      photo_feed: []
    });

    //making fetch to firebase won't allow us to access 'this'
    var that = this;

    var loadRef = database.ref('photos');

    if(userId != ''){
      loadRef = database.ref('users').child(`${userId}`).child('photos');
    }

    //order by date they are posted, fetch data once (so it won't get more data as they are added),
    loadRef.orderByChild('posted').once('value').then(function(snapshot) {
      //check if photos found in database
      const exists = (snapshot.val() !== null)
      if(exists) {
        data = snapshot.val();
        //allow updates state with each new photo fetched from database
        var photo_feed = that.state.photo_feed;
        that.setState({empty: false})

        for(var photo in data){
          that.addToFlatList(photo_feed, data, photo);
      }
    } else {
      that.setState({empty: true});
    }
    }).catch(error => console.log(error));

  }

  loadNew = () => {
    this.loadFeed();
  }

  render(){
    return(
      <View style={{flex: 1}}>
        { this.state.loading == true ? (
          <View style={styles.loading}>
            { this.state.empty == true ? (
              <Text>No photos found...</Text> 
            ) : (
            <Text>Loading...</Text>
            )}
          </View>
        ) : (

        <FlatList
          refreshing={this.state.refresh}
          onRefresh={this.loadNew}
          data={this.state.photo_feed}
          keyExtractor={(item, index) => index.toString()}
          style={styles.flatListContainer}
          renderItem={({item, index}) => (
            <View key={index} style={styles.feedContainer}>

              <View style={styles.feedHeaderContainer}>
                {
                  this.state.fontLoaded ? (
                    <Text style={styles.details}>{item.posted}</Text>
                  ) : null
                }
                <TouchableOpacity
                onPress={ () => this.props.navigation.navigate('User', {userId: item.authorId})}>
                {
                  this.state.fontLoaded ? (
                    <Text style={styles.details}>{item.authorId}</Text>
                  ) : null
                }
                </TouchableOpacity>
              </View>

              <View>
                <Image
                source={{uri: item.url}}
                style={styles.feedImage}
                />
              </View>

              <View style={{padding:5}}>
                {
                  this.state.fontLoaded ? (
                    <Text style={styles.detailsOpenSans}>{item.caption}</Text>
                  ) : null
                }
                <TouchableOpacity
                onPress={ () => this.props.navigation.navigate('Comments', {photoId: item.id})}>
                {
                  this.state.fontLoaded ? (
                    <Text style={styles.viewComments}>[ View comments... ]</Text>
                  ) : null
                }
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

export default PhotoList;