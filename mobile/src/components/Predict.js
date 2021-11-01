//import React form react
import React, { PureComponent } from 'react';
import { View, Text, Button, Image, StyleSheet, AsyncStorage, TextInput, Alert, Dimensions,ActivityIndicator, Picker, ScrollView } from 'react-native';
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
        const w = await this.setState({loading: true})
        const measurements = await this.getMeasurements(date)
        this.setState({
            date: date,
            measurements: measurements.measurements,
            predictions: measurements.predictions,
            loading: false
        });
    }
    async onHourChange(h) {
        const w = await this.setState({hour: h, loading: true})
        const measurements = await this.getMeasurements(this.state.date)
        this.setState({
            measurements: measurements.measurements,
            predictions: measurements.predictions,
            loading: false
        });
    }
    async onMinuteChange(m) {
        const w = await this.setState({minute: m, loading: true})
        const measurements = await this.getMeasurements(this.state.date)
        this.setState({
            measurements: measurements.measurements,
            predictions: measurements.predictions,
            loading: false
        });
    }
    async getMeasurements(date){
        var TARGET = 'predict/?user=1&type=G'
        var PARAMS = ''
        const userId = await AsyncStorage.getItem('userId');
        const time_lt = this.state.hour+":"+this.state.minute+":00"
        const time_gt = String(parseInt(this.state.hour) - 3)+":"+this.state.minute+":00"
        PARAMS += '&date='+date + '&time__lte='+time_lt + '&time__gte='+time_gt
        console.log(PARAMS)
        var response = await fetch(GLOBALS.API_ENDPOINT+TARGET+PARAMS);
        let measurements = await response.json();
        return measurements
    }
    async componentDidMount(){
        const measurements = await this.getMeasurements(this.state.date, null)
        try {
            this.setState({measurements: measurements.measurements, predictions: measurements.predictions, loading: false});
        } catch(err) {
            console.log("Error fetching data-----------", err);
        }
    }
    render(){
        const hours = Array(24).fill(null).map((u, i) => String(i).padStart(2, "0"))
        let minutes = Array(4).fill(null).map((u, i) => String(i*15).padStart(2, "0"))
        if ((this.state.minute % 15) != 0){
            minutes.push(this.state.minute)
        }

        return (
            <>
            {this.state.loading == true ? (
                <View style={styles.loader}>
                    <Card>
                        <Text style={{color: GLOBALS.COLOR.MAIN, fontSize: 30}}>
                            <ActivityIndicator size="large" color={GLOBALS.COLOR.MAIN} />
                            {'  '}Loading...
                        </Text>
                    </Card>
                </View>
            ) : null}
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
                    data={this.state.measurements}
                    predictions={this.state.predictions}
                    />
            </View>

            </ScrollView>
            </>
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
    loader: {
        position:'absolute',
        bottom: 300,
        left: 50,
        alignSelf:'flex-end'
    },
    chart:{
        flex: 5
    },
})

export default Predict;