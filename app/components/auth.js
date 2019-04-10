import React from 'react';
import { Image, KeyboardAvoidingView, TextInput, TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { f, auth, database, storage } from '../../config/config.js';

class UserAuth extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      authStep: 0,
      email: '',
      pass: '',
      moveScreen: false
    }
  }

  login = async () => {
    //Force user to login

    var email = this.state.email;
    var pass = this.state.pass;
    if (email != '' && pass != '') {
      try {
        let user = await auth.signInWithEmailAndPassword(email, pass);
      } catch (error) {
        console.log(error);
        alert(error);
      }
    } else {
      alert('Email or Password is empty')
    }
  }

  createUserObj = (userObj, email) => {
    var uObj = {
      name: 'Enter name',
      username: '@name',
      avatar: 'https://www.gravatar.com/avatar',
      email: email
    }
    database.ref('users').child(userObj.uid).set(uObj);
  }

  signup = async () => {
    //Force user to login

    var email = this.state.email;
    var pass = this.state.pass;
    if (email != '' && pass != '') {
      try {
        let user = await auth.createUserWithEmailAndPassword(email, pass)
          .then((userObj) => this.createUserObj(userObj.user, email))
          .catch((error) => alert(error));

      } catch (error) {
        console.log(error);
        alert(error);
      }
    } else {
      alert('Email or Password is empty')
    }
  }


  componentDidMount = () => {
    if (this.props.moveScreen == true) {
      this.setState({ moveScreen: true });
    }
  }

  showLogin = () => {
    if (this.state.moveScreen == true) {
      this.props.navigation.navigate('Profile');
      return false
    }
    this.setState({ authStep: 1 });
  }

  showSignup = () => {
    if (this.state.moveScreen == true) {
      this.props.navigation.navigate('Profile');
      return false
    }
    this.setState({ authStep: 2 });
  }

  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Image 
          source={require('../../assets/images/logo_transparent.png')}
          style={{width: 200, height: 200}}
        />
        <Text>{this.props.message}</Text>
        {this.state.authStep == 0 ? (
          //login
          <View style={{ marginVertical: 20, flexDirection: 'column', alignItems: 'center' }}>
            <TouchableOpacity
              style={{ paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5, backgroundColor: '#0099ff', marginHorizontal: 'auto', alignSelf: 'center',  }}
              onPress={() => this.showSignup()}>
              <Text style={{ fontWeight: 'bold', color: 'white' }}>Sign Up</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ paddingVertical: 20}}
              onPress={() => this.showLogin()}>
              <Text style={{ fontWeight: 'bold', color: '#0099ff' }}>Log In</Text>
            </TouchableOpacity>
          </View>
        ) : (
            <View style={{ marginVertical: 20 }}>
              {this.state.authStep == 1 ? (
                //Login
                <View>
                  <TouchableOpacity
                    onPress={() => this.setState({ authStep: 0 })}
                    style={{ borderBottomWidth: 1, paddingVertical: 5, marginBottom: 10, bordreBottomColor: 'black' }}>
                    <Text style={{ fontWeight: 'bold' }}>◀ Cancel</Text>
                  </TouchableOpacity>
                  <Text style={{ fontWeight: 'bold', marginBottom: 20 }}>Login</Text>
                  <Text>Email Address:</Text>
                  <TextInput
                    editable={true}
                    keyboardType={'email-address'}
                    placeholder={'Enter your email address'}
                    onChangeText={(text) => this.setState({ email: text })}
                    value={this.state.email}
                    style={{ width: 250, marginVertical: 10, padding: 5, borderColor: 'grey', borderRadius: 3, borderWidth: 1 }}
                  />
                  <Text>Password:</Text>
                  <TextInput
                    editable={true}
                    secureTextEntry={true}
                    placeholder={'Enter your password'}
                    onChangeText={(text) => this.setState({ pass: text })}
                    value={this.state.pass}
                    style={{ width: 250, marginVertical: 10, padding: 5, borderColor: 'grey', borderRadius: 3, borderWidth: 1 }}
                  />
                  <TouchableOpacity
                    style={{ backgroundColor: 'green', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5 }}
                    onPress={() => { this.login() }}
                  >
                    <Text style={{ color: 'white' }}>Login</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                  //sign up
                  <View>
                    <TouchableOpacity
                      onPress={() => this.setState({ authStep: 0 })}
                      style={{ borderBottomWidth: 1, paddingVertical: 5, marginBottom: 10, bordreBottomColor: 'black' }}>
                      <Text style={{ fontWeight: 'bold' }}>◀ Cancel</Text>
                    </TouchableOpacity>
                    <Text style={{ fontWeight: 'bold', marginBottom: 20 }}>Sign Up</Text>
                    <Text>Email Address:</Text>
                    <TextInput
                      editable={true}
                      keyboardType={'email-address'}
                      placeholder={'Enter your email address'}
                      onChangeText={(text) => this.setState({ email: text })}
                      value={this.state.email}
                      style={{ width: 250, marginVertical: 10, padding: 5, borderColor: 'grey', borderRadius: 3, borderWidth: 1 }}
                    />
                    <Text>Password:</Text>
                    <TextInput
                      editable={true}
                      secureTextEntry={true}
                      placeholder={'Enter your password'}
                      onChangeText={(text) => this.setState({ pass: text })}
                      value={this.state.pass}
                      style={{ width: 250, marginVertical: 10, padding: 5, borderColor: 'grey', borderRadius: 3, borderWidth: 1 }}
                    />
                    <TouchableOpacity
                      style={{ backgroundColor: '#0099ff', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5 }}
                      onPress={() => { this.signup() }}
                    >
                      <Text style={{ color: 'white' }}>Sign Up</Text>
                    </TouchableOpacity>
                  </View>
                )}
            </View>
          )}
      </View>
    )
  }


}

export default UserAuth;