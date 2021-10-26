import React, { PureComponent } from 'react';
import { View, Text, Button, Image, StyleSheet, TextInput, Alert, Dimensions, FlatList } from 'react-native';
import { Card, ListItem, Icon, Badge, SearchBar, Header } from 'react-native-elements'
import { LineChart, BarChart } from "react-native-chart-kit";
import GLOBALS from './Globals';

export default class PlotPrediction extends PureComponent {
    constructor(props){
        super(props)
        this.state = {

        }
    }
    render() {
        let data = this.props.data.sort((a,b) => (a.time > b.time) ? 1 : ((b.time > a.time) ? -1 : 0))

        if (data.length == 0){
            return (
                <View style={styles.info}>
                    <Card>
                        <Text style={{color: GLOBALS.COLOR.SECONDARY, fontSize: 20}}>No glucose data found</Text>
                        <Icon
                        iconProps={{size:150}}
                        type="font-awesome"
                        name='tint'
                        color={GLOBALS.COLOR.SECONDARY} />
                    </Card>
                </View>
            )
        }

        let times = [...new Set(data.map(s => s.time.slice(0,5)))].sort()
        const step = Math.floor(times.length/5)
        let avg = 0
        let sum = 0
        let tir = 0
        let values = []
        let datasets = []
        let averages = []
        let legend = null
        const boundaries = [0, 60, 250, 270]
        var i;
        for (i = 0; i < times.length; ++i){
            if (i % step != 0){
                times[i] = ""
            }
        }

        values = data.map(s => s.value)
        datasets.push({
            data: values,
            fill: false,
            color: new Function('name', 'return "'+GLOBALS.COLOR.SCALE[0]+'"')
        })

        if (this.props.predictions == 1){
            let buf = [...new Set(data.map(s => s.time))].sort()
            let idx = 0
            i = 0

            while(idx == 0){
                if (buf[i] >= '17:15:00'){
                    idx = i
                }
                else{
                    i += 1
                }
            }
            let pred = [215, 215, 215, 215, 215, 215]

            for(var j=0; j<6; j++){
                values[idx+j] = pred[j]
            }

            datasets.push({
                data: values,
                fill: false,
                color: new Function('name', 'return "'+GLOBALS.COLOR.MAIN+'"')
            })
        }

        return(
            <Card>
                <Text style={{color: GLOBALS.COLOR.SECONDARY, fontSize: 40}}>
                <Icon
                iconProps={{size:40}}
                type="font-awesome"
                name='tint'
                color={GLOBALS.COLOR.MAIN} />
                &nbsp;Prediction
                </Text>
               <View style={{marginLeft: -25}}>
               <LineChart
                        bezier
                        withVerticalLines={false}
                        fromZero={false}
                        yAxisInterval={50}
                        data={{
                            labels: times,
                            datasets: datasets,
                        }}
                        width={Dimensions.get("window").width - Dimensions.get("window").width*0.1} // from react-native
                        height={Dimensions.get("window").height*0.3}
                        withShadow={false}
                        chartConfig={{
                            backgroundColor: '#ffffff',
                            backgroundGradientFrom: '#ffffff',
                            backgroundGradientTo: '#ffffff',
                            backgroundGradientFromOpacity: 0,
                            backgroundGradientToOpacity: 0,
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            strokeWidth: 1,
                            style: {
                                borderRadius: 1,
                            },
                            propsForDots: {
                               r: "0",
                             }
                        }}
                        style={{
                            marginVertical: 2,
                            borderRadius: 20,
                        }}
                    />
                    </View>
             </Card>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: 'white',
        margin: 10
    },
    column1: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'flex-end'
        },
    column2: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'flex-start',
            paddingLeft: 10
        }
})
