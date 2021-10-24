import React, { PureComponent } from 'react';
import { View, Text, Button, Image, StyleSheet, TextInput, Alert, AsyncStorage } from 'react-native';
import { Card, ListItem, Icon, Badge, SearchBar } from 'react-native-elements'
import * as Crypto from 'expo-crypto';
import GLOBALS from './Globals';

class Login extends PureComponent {
    constructor(props){
        super(props)
        this.state = {
            username: null,
            password: null
        }
        this.handleSubmit = this.handleSubmit.bind(this)
    }
    async handleSubmit() {
        var response = await fetch(GLOBALS.API_ENDPOINT+'login/', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
            },
          body: JSON.stringify({
            username: this.state.username,
            password: this.state.password
          })
        });
        const data = await response.json()
        if ((data.token === undefined) || (data.token == null) || (data.token == "undefined")){
            Alert.alert("Invalid login")
        }
        else{
            await AsyncStorage.setItem(
              'userId',
              data.userId.toString()
            );

            this.props.navigation.navigate("Control screen")
        }
    };
    render() {
        const navigation = this.props.navigation
        return (
            <View style={styles.container}>
                <Card>
                  <Card.Title style={{fontSize: 30}}>
                    Login
                  </Card.Title>
                  <Card.Divider/>
                  <TextInput placeholder="Username"  style={styles.input}
                  onChangeText={text => this.setState({'username': text})}/>
                  <TextInput secureTextEntry={true} placeholder="Password"  style={styles.input}
                  onChangeText={async (text) => {
                      const digest = await Crypto.digestStringAsync(
                          Crypto.CryptoDigestAlgorithm.SHA256,
                          '1234'+text
                        );
                      this.setState({password: digest});
                    }}/>
                   <Card.Divider/>
                 <Button
                    color={GLOBALS.COLOR.MAIN}
                     onPress={this.handleSubmit}
                     title="Login"
                   />
                </Card>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    input: {
        fontSize: 20,
        margin: 10,
        padding: 3,
        borderBottomWidth: 1
    }
})

export default Login;
