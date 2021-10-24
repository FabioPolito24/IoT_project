import React, { PureComponent } from 'react';
import { View, Text, Button, Image, StyleSheet, TextInput, Alert } from 'react-native';
import { Card, ListItem, Icon, Badge, SearchBar } from 'react-native-elements'
import * as Crypto from 'expo-crypto';
import GLOBALS from './Globals';

class Signup extends PureComponent {
    constructor(props){
        super(props)
        this.state = {
            username: null,
            password: null,
            confirmPassword: null
        }
        this.handleSubmit = this.handleSubmit.bind(this)
    }
    async handleSubmit() {
        if ((this.state.password == this.state.confirmPassword) && (this.state.password != null) && (this.state.username != null)){
            var response = await fetch(GLOBALS.API_ENDPOINT+'users/', {
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
            Alert.alert("Account successfully created!")
            this.props.navigation.navigate("Home")
        }
        else{
            Alert.alert("Please fill in all the fields and make sure passwords correspond")
        }
    };
    render() {
        const navigation = this.props.navigation
        return (
            <View style={styles.container}>
                <Card>
                  <Card.Title style={{fontSize: 30}}>
                    Sign up
                  </Card.Title>
                  <Card.Divider/>
                  <TextInput placeholder="Username" style={styles.input}
                  onChangeText={text => this.setState({'username': text})} />
                  <TextInput placeholder="Password"  secureTextEntry={true} style={styles.input}
                  onChangeText={async (text) => {
                    const digest = await Crypto.digestStringAsync(
                        Crypto.CryptoDigestAlgorithm.SHA256,
                        '1234'+text
                      );
                    this.setState({password: digest});
                  }}/>
                  <TextInput placeholder="Confirm password" secureTextEntry={true} style={styles.input}
                  onChangeText={async (text) => {
                    const digest = await Crypto.digestStringAsync(
                        Crypto.CryptoDigestAlgorithm.SHA256,
                        '1234'+text
                      );
                    this.setState({confirmPassword: digest});
                  }}/>
                  <Card.Divider/>
                  <Button
                      onPress={this.handleSubmit}
                      color={GLOBALS.COLOR.MAIN}
                      title="Sign up"
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


export default Signup;
