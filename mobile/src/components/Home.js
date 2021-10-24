import React, { PureComponent } from 'react';
import { View, Text, Button, Image, StyleSheet } from 'react-native';
import { Card, ListItem, Icon, Badge, SearchBar } from 'react-native-elements'
import GLOBALS from './Globals';

class Home extends PureComponent {
    static navigationOptions = { headerShown: false }
    render() {
        const navigation = this.props.navigation
        return (
            <View style={styles.container}>
                <Card>
                    <Card.Title>
                        <Icon
                        iconProps={{size:150}}
                        type="font-awesome"
                        name='tint'
                        color={GLOBALS.COLOR.MAIN} />
                    </Card.Title>
                    <Card.Title>
                        <Text style={{fontSize: 70, fontWeight: 'bold'}}>
                            Blo.
                        </Text>
                    </Card.Title>
                    <Card.Divider/>
                    <Button color={GLOBALS.COLOR.MAIN}
                        onPress={() => navigation.navigate("Login")}
                        title="Log in"
                    />
                    <Card.Divider/>
                    <Button color={GLOBALS.COLOR.SECONDARY}
                        onPress={() => navigation.navigate("Sign up")}
                        title="Sign up"
                    />
                </Card>
            </View>
        )
    }
}

export default Home;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    }
})