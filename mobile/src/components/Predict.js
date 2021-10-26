//import React form react
import React, { PureComponent } from 'react';
import { View, Text, Button, Image, StyleSheet, AsyncStorage, TextInput, Alert, Dimensions, Picker, ScrollView } from 'react-native';
import { Card, ListItem, Icon, Badge, SearchBar } from 'react-native-elements'
import CalendarPicker from 'react-native-calendar-picker';
import GLOBALS from './Globals';
import PlotPrediction from './PlotPrediction';


class Predict extends PureComponent {
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
        this.state = {
            date: now.slice(0,10),
            hour: now.slice(11, 13),
            minute: now.slice(14, 16),
            loading: true,
            measurements: [],
        }
    }
    async onDateChange(date) {
        date = date.format('YYYY-MM-DD')
        const measurements = await this.getMeasurements(date)
        this.setState({
            date: date,
            measurements: measurements,
        });
    }
    onHourChange(h) {
        this.setState({hour: h})
    }
    onMinuteChange(m) {
        this.setState({minute: m})
    }
    async getMeasurements(date){
        var TARGET = 'measurements/?user=1'
        var PARAMS = ''
        const userId = await AsyncStorage.getItem('userId');
        const time_lt = this.state.hour+":"+this.state.minute+":00"
        const time_gt = String(parseInt(this.state.hour) - 3)+":00:00"
        PARAMS += '&date='+date + '&time__lte='+time_lt + '&time__gte='+time_gt
        var response = await fetch(GLOBALS.API_ENDPOINT+TARGET+PARAMS);
        const measurements = await response.json();
        return measurements
    }
    async componentDidMount(){
        const measurements = await this.getMeasurements(this.state.date, null)
        try {
            this.setState({measurements: measurements, loading: false});
        } catch(err) {
            console.log("Error fetching data-----------", err);
        }
    }
    render(){
        const hours = Array(24).fill(null).map((u, i) => String(i).padStart(2, "0"))
        let minutes = Array(4).fill(null).map((u, i) => String(i*15).padStart(2, "0"))

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
            </Card>
            <View style={styles.chart}>
                    <PlotPrediction
                    data={this.state.measurements.filter((e) => e.type == "G")}
                    predictions={1}
                    />
            </View>

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
    chart:{
        flex: 5
    },
})

export default Predict;