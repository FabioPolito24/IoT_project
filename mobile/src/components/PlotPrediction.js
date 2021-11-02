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

        let datasets = []
        let legend = null
        let last_time = data[data.length - 1].time
        let last_val = data[data.length - 1].value
        var i;

        for (i = 0; i < 6; ++i){
            data.push({
                'time': this.props.predictions[i].time,
                'value': last_val
            })
        }

        let times = [...new Set(data.map(s => s.time.slice(0,5)))].sort()
        let values = data.map(s => s.value)
        let pred_values = Array(values.length)
        let data_pred = []

        for (i = 0; i < times.length; ++i){
            if (i >= times.length -  this.props.predictions.length){
                values[i] = last_val
                pred_values[i] = this.props.predictions[ this.props.predictions.length - (times.length - i)].value
                data_pred.push({
                    'time': times[i],
                    'value': pred_values[i]
                })
            }
            else{
                pred_values[i] = values[i]
            }
            if (i % 8 != 0){
                times[i] = ""
            }
        }

        const boundaries = [60, 250]
        var b;
        for(var j=0; j<2; j++){
            var color = GLOBALS.COLOR.DANGER
            b = Array(288).fill(null).map((u, i) => boundaries[j])
            datasets.push({
                data: b,
                fill: false,
                color: new Function('name', 'return "'+color+'"')
            })
        }

        datasets.push({
            data: values,
            fill: false,
            color: new Function('name', 'return "'+GLOBALS.COLOR.SCALE[0]+'"')
        })

        datasets.push({
            data: pred_values,
            fill: true,
            color: new Function('name', 'return "'+GLOBALS.COLOR.MAIN+'"')
        })


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
                <View
                    style={{margin:0,  flexDirection: 'row'}}>
                      <View style={{flex:1, textAlign: 'center', margin:2, padding:5, borderRadius: 5, backgroundColor: GLOBALS.COLOR.BG_SCALE[0] }}>
                          <Text style={{textAlign:'right'}}>Last</Text>
                        </View>
                        <View style={{flex:1, textAlign: 'center', margin:2, padding:5, borderRadius: 5, backgroundColor: GLOBALS.COLOR.BG_SCALE[0] }}>
                             <Text style={{textAlign:'center'}}>{last_time.slice(0,5)}</Text>
                        </View>
                        <View style={{flex:1, textAlign: 'center', margin:2, padding:5, borderRadius: 5, backgroundColor: GLOBALS.COLOR.BG_SCALE[0] }}>
                            <Text style={{textAlign:'center'}}>{last_val}</Text>
                        </View>
                  </View>
              {data_pred.map((e,i) => {
                return(
                    <View key={i}
                        style={{margin:0,  flexDirection: 'row'}}>
                          <View style={{flex:1, textAlign: 'center', margin:2, padding:5, borderRadius: 5, backgroundColor: GLOBALS.COLOR.BG_SCALE[1] }}>
                              <Text style={{textAlign:'right'}}>Pred</Text>
                            </View>
                            <View style={{flex:1, textAlign: 'center', margin:2, padding:5, borderRadius: 5, backgroundColor: GLOBALS.COLOR.BG_SCALE[1] }}>
                                 <Text style={{textAlign:'center'}}>{e.time}</Text>
                            </View>
                            <View style={{flex:1, textAlign: 'center', margin:2, padding:5, borderRadius: 5, backgroundColor: GLOBALS.COLOR.BG_SCALE[1] }}>
                                <Text style={{textAlign:'center'}}>{e.value}</Text>
                            </View>
                      </View>
                )
              })}
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
                        height={Dimensions.get("window").height*0.32}
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
