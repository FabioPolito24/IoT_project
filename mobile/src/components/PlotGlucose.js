import React, { PureComponent } from 'react';
import { View, Text, Button, Image, StyleSheet, TextInput, Alert, Dimensions, FlatList } from 'react-native';
import { Card, ListItem, Icon, Badge, SearchBar, Header } from 'react-native-elements'
import { LineChart, BarChart } from "react-native-chart-kit";
import GLOBALS from './Globals';

export default class PlotGlucose extends PureComponent {
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
        let unique_dates = [...new Set(data.map(item => item.date))]
        unique_dates = unique_dates.sort()
        let times = [...new Set(data.map(s => s.time.slice(0,2)))].sort()
        const step = Math.floor(times.length/6)

        for (var i = 0; i < times.length; ++i){
            if ((i % step != 0)&(i != times.length -1)){
                times[i] = ""
            }
        }
        let avg = 0
        let sum = 0
        let tir = 0
        let values = []
        let datasets = []
        let averages = []
        let legend = null
        const boundaries = [0, 60, 250, 270]
        var b;
        for(var j=0; j<4; j++){
            var color;
            if (j == 0 | j == 3){
                color = GLOBALS.COLOR.WHITE
            }
            else{
                color = GLOBALS.COLOR.DANGER
            }
            if (j == 0){
                b = Array(288).fill(null).map((u, i) => i)
            }
            else{
                b = Array(288).fill(null).map((u, i) => boundaries[j])
            }
            datasets.push({
                data: b,
                fill: false,
                color: new Function('name', 'return "'+color+'"')
            })
        }

        var sorted = {};
        for( var i = 0;  i < data.length; i++ ){
         if( sorted[data[i].date] == undefined ){
          sorted[data[i].date] = [];
         }
         sorted[data[i].date].push(data[i]);
        }
        var i = 0;
        for (const [key, value] of Object.entries(sorted)) {
          values = value.map(s => s.value)
          datasets.push({
            data: values,
            fill: false,
            color: new Function('name', 'return "'+GLOBALS.COLOR.SCALE[i]+'"')
            })
          sum = values.reduce((a, b) => a + b, 0)
          avg = Math.round(sum / values.length)
          tir = Math.round((values.filter((e) => (e >=60 )&&(e <= 250)).length / values.length)*100)
          averages.push({ date: unique_dates[i], avg: avg, tir: tir})
          i = i+1
        }

        legend = unique_dates

        return(
            <Card>
                <Text style={{color: GLOBALS.COLOR.SECONDARY, fontSize: 40}}>
                <Icon
                iconProps={{size:40}}
                type="font-awesome"
                name='tint'
                color={GLOBALS.COLOR.MAIN} />
                &nbsp;Glucose
                </Text>
               <View>
                    <View style={{flexDirection: 'row',}}>
                          <View style={{flex:1, textAlign: 'center', margin:2, padding:5, borderRadius: 5, backgroundColor: GLOBALS.COLOR.SECONDARY_BG[i] }}>
                            <Text style={{textAlign:'right'}}>Date</Text>
                          </View>
                          <View style={{flex:1, textAlign: 'center', margin:2, padding:5, borderRadius: 5, backgroundColor: GLOBALS.COLOR.SECONDARY_BG[i] }}>
                               <Text style={{textAlign:'center'}}>AVG (mg/dL)</Text>
                          </View>
                          <View style={{flex:1, textAlign: 'center', margin:2, padding:5, borderRadius: 5, backgroundColor: GLOBALS.COLOR.SECONDARY_BG[i] }}>
                              <Text style={{textAlign:'center'}}>Time in range</Text>
                          </View>
                    </View>
                    {
                        averages.map((s, i) => {
                            return (
                                <View key={i}
                                style={{margin:0,  flexDirection: 'row'}}>
                                  <View style={{flex:1, textAlign: 'center', margin:2, padding:5, borderRadius: 5, backgroundColor: GLOBALS.COLOR.BG_SCALE[i] }}>
                                      <Text style={{textAlign:'right'}}>{s.date}</Text>
                                    </View>
                                    <View style={{flex:1, textAlign: 'center', margin:2, padding:5, borderRadius: 5, backgroundColor: GLOBALS.COLOR.BG_SCALE[i] }}>
                                         <Text style={{textAlign:'center'}}>{s.avg}</Text>
                                    </View>
                                    <View style={{flex:1, textAlign: 'center', margin:2, padding:5, borderRadius: 5, backgroundColor: GLOBALS.COLOR.BG_SCALE[i] }}>
                                        <Text style={{textAlign:'center'}}>{s.tir}%</Text>
                                    </View>
                              </View>
                           )
                        })
                    }
               </View>
               <View style={{marginLeft: -25}}>
               <LineChart
                        bezier
                        withVerticalLines={false}
                        fromZero={false}
                        yAxisInterval={50}
                        //yAxisLabel={'mg/dL'}
                        data={{
                            labels: times,
                            datasets: datasets,
                            //legend: legend,
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
