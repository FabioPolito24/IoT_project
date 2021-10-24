//import styleSheet for creating a css abstraction.
import { StyleSheet } from 'react-native';
//import React form react
import React, { PureComponent } from 'react';
import { TouchableOpacity, Text, View, Image, TextInput, ActivityIndicator, ScrollView, Dimensions, Alert, Picker, AsyncStorage } from 'react-native';
import { Card, ListItem, Button, Icon, Badge, Input } from 'react-native-elements'
import CalendarPicker from 'react-native-calendar-picker';
import GLOBALS from './Globals';


class AddTag extends PureComponent {
    constructor(props){
        super(props)
        Date.prototype.addHours= function(h){
            this.setHours(this.getHours()+h);
            return this;
        }
        const now = new Date().addHours(2).toISOString()
        this.onDateChange = this.onDateChange.bind(this)
        this.onHourChange = this.onHourChange.bind(this)
        this.onMinuteChange = this.onMinuteChange.bind(this)
        this.onValueChange = this.onValueChange.bind(this)
        this.submit = this.submit.bind(this)
        this.state = {
            date: now.slice(0,10),
            hour: now.slice(11, 13),
            minute: now.slice(14, 16),
            value: '',
        }
    }
    onDateChange(date) {
        date = date.format('YYYY-MM-DD')
        this.setState({date: date})
    }
    onHourChange(h) {
        this.setState({hour: h})
    }
    onMinuteChange(m) {
        this.setState({minute: m})
    }
    onValueChange(v) {
        this.setState({value: v})
    }
    async submit(){
        if (!this.state.value){
            Alert.alert("Please insert a tag value")
            return
        }
        var response = await fetch(GLOBALS.API_ENDPOINT+'/tags/', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                date: this.state.date,
                time: this.state.hour+':'+this.state.minute,
                value: this.state.value,
                user: 1
            })
        });
        Alert.alert("Tag saved!")

    }
    render(){
        const hours = Array(24).fill(null).map((u, i) => String(i).padStart(2, "0"))
        let minutes = Array(4).fill(null).map((u, i) => String(i*15).padStart(2, "0"))
        if ((this.state.minute % 15) != 0){
            minutes.push(this.state.minute)
        }
        return (
            <ScrollView>
            <Card>
                <Text style={styles.label}>Select date</Text>
                <CalendarPicker
                onDateChange={this.onDateChange}
                width={Dimensions.get("window").width - Dimensions.get("window").width*0.1}
                height={Dimensions.get("window").height*0.3}
                />
                <Text style={styles.label}>Select time</Text>
                <View style={styles.container}>
                    <View style={styles.column8}>
                        <Picker
                        onValueChange={this.onHourChange}
                        selectedValue={this.state.hour}
                        itemStyle={styles.picker} >
                                {hours.map((h) => {
                                    return(
                                        <Picker.Item label={h} value={h} key={"h"+h} />
                                    )
                                })}
                          </Picker>
                      </View>
                      <View style={styles.column}>
                        <Text style={styles.label}>:</Text>
                      </View>
                      <View style={styles.column8}>
                          <Picker
                          onValueChange={this.onMinuteChange}
                          selectedValue={this.state.minute}
                          itemStyle={styles.picker} >
                                  {minutes.map((m) => {
                                      return(
                                          <Picker.Item label={m} value={m} key={"m"+m} />
                                      )
                                  })}
                            </Picker>
                        </View>
                </View>
                <Text style={styles.label}>Insert tag</Text>
                <TextInput placeholder=""  style={styles.input} onChangeText={this.onValueChange} />
                <Card.Divider />
				<View>
				<Button
                    color={GLOBALS.COLOR.MAIN}
                     onPress={this.submit}
                     title="SUBMIT"
                   /></View>
            </Card>

            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
    },
    column: {
        flex: 1
    },
    column8: {
        flex: 8
    },
    column2: {
        flex: 2
    },
    input: {
        fontSize: 30,
        margin: 10,
        marginTop: 4,
        padding: 3,
        textAlign: 'center',
        textTransform: 'uppercase',
        borderWidth: 1,
        borderColor: GLOBALS.COLOR.BG_SCALE[3],
        borderRadius: 20,
        backgroundColor: GLOBALS.COLOR.BG_SCALE[3]
    },
    label: {
        fontWeight: 'bold',
        fontSize: 27,
    },
    picker: {
        transform: [
              { scaleX: 1.5 },
              { scaleY: 1.5 },
           ],
    },
})

export default AddTag;