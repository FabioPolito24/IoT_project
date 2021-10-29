import React, { PureComponent } from 'react';
import { View, Text, Button, Image, StyleSheet, TextInput, Alert, Dimensions, FlatList } from 'react-native';
import { Card, ListItem, Icon, Badge, SearchBar, Header } from 'react-native-elements'
import { LineChart, BarChart } from "react-native-chart-kit";
import GLOBALS from './Globals';

export default class PlotHeartbeat extends PureComponent {
    constructor(props){
        super(props)
        this.render_chart = this.render_chart.bind(this)
        this.state = {

        }
    }

    render_chart(data, date, i) {
        let times = [...new Set(data.map(s => s.time.slice(0,5)))]
        let values = data.map(s => s.value)
        const k = values.length

        return(
                <>
                <View style={{ marginTop:10,padding:5, borderRadius: 5, backgroundColor: GLOBALS.COLOR.BG_SCALE[i] }}>
                    <Text style={{ textAlign: 'center'}}> {date}</Text>
               </View>
               <View style={{marginLeft: -60}}>
               <BarChart
                   data={{
                     labels: times,
                     datasets: [{data: values}],
                     legend: [date]
                   }}
                   width={Dimensions.get("window").width - Dimensions.get("window").width*0.05} // from react-native
                  height={Dimensions.get("window").height*0.22}
                   withInnerLines={false}
                   withHorizontalLabels={false}
                   showValuesOnTopOfBars={true}
                   fromZero={true}
                   withShadow={false}
                   chartConfig={{
                     backgroundColor: '#ffffff',
                      backgroundGradientFrom: '#ffffff',
                      backgroundGradientTo: '#ffffff',
                      backgroundGradientFromOpacity: 0,
                      backgroundGradientToOpacity: 0,
                      decimalPlaces: 0,
                      barPercentage: 1,
                     color:  new Function('name', 'return "'+GLOBALS.COLOR.SCALE[i]+'"'),
                     labelColor: () => 'black',
                     propsForBackgroundLines:{
                       stroke:"#ffffff"
                     },
                     style: {
                       borderRadius: 16,
                       paddingLeft: 0,
                       marginLeft: 0
                     },
                     propsForDots: {
                       r: "0",
                       strokeWidth: "1",
                       stroke: GLOBALS.COLOR.SECONDARY
                     }
                   }}
                   bezier
                   style={{
                     borderRadius: 16
                   }}
                 />
                 </View>
                 </>
        )
    }

    render(){
            const data = this.props.data.sort((a,b) => (a.time > b.time) ? 1 : ((b.time > a.time) ? -1 : 0))
            if (data.length == 0){
                return (
                    <View style={styles.info}>
                        <Card>
                            <Text style={{color: GLOBALS.COLOR.SECONDARY, fontSize: 20}}>No heartbeat data found</Text>
                            <Icon
                            iconProps={{size:150}}
                            type="font-awesome"
                            name='heartbeat'
                            color={GLOBALS.COLOR.SECONDARY} />
                        </Card>
                    </View>
                )
            }
            let unique_dates = [...new Set(data.map(item => item.date))]
            unique_dates = unique_dates.sort()
            var sorted = {};
            for( var i = 0;  i < data.length; i++ ){
             if( sorted[data[i].date] == undefined ){
              sorted[data[i].date] = [];
             }
             sorted[data[i].date].push(data[i]);
            }
            let arr = []
            let insights = []
            i = 0
            let avg = 0
            let sum = 0
            var values;

            for ( var i = 0;  i < unique_dates.length; i++ ) {
                arr.push(this.render_chart(sorted[unique_dates[i]], unique_dates[i], i))
                values = sorted[unique_dates[i]].map(e => e.value)
                sum = values.reduce((a, b) => a + b, 0)
                avg = Math.round(sum / values.length)
                insights.push({
                    date: unique_dates[i],
                    avg: avg,
                    max: Math.max(...values),
                    min: Math.min(...values)
                })
            }


            return(
                <Card>
                    <Text style={{color: GLOBALS.COLOR.SECONDARY, fontSize: 40}}>
                    <Icon
                    iconProps={{size:40}}
                    type="font-awesome"
                    name='heartbeat'
                    color={GLOBALS.COLOR.MAIN} />
                    &nbsp;Heartbeat
                    </Text>
                            <View style={{flexDirection: 'row',}}>
                                  <View style={{flex:3, textAlign: 'center', margin:2, padding:5, borderRadius: 5 }}>
                                    <Text style={{textAlign:'right'}}>Date</Text>
                                  </View>
                                  <View style={{flex:2, textAlign: 'center', margin:2, padding:5, borderRadius: 5 }}>
                                       <Text style={{textAlign:'center'}}>AVG</Text>
                                  </View>
                                  <View style={{flex:2, textAlign: 'center', margin:2, padding:5, borderRadius: 5 }}>
                                    <Text style={{textAlign:'center'}}>MIN</Text>
                                </View>
                                  <View style={{flex:2, textAlign: 'center', margin:2, padding:5, borderRadius: 5 }}>
                                      <Text style={{textAlign:'center'}}>MAX</Text>
                                  </View>
                            </View>
                            {
                                insights.map((s, i) => {
                                    return (
                                        <View key={i}
                                        style={{margin:0,  flexDirection: 'row'}}>
                                          <View style={{flex:3, textAlign: 'center', margin:2, padding:5, borderRadius: 5, backgroundColor: GLOBALS.COLOR.BG_SCALE[i] }}>
                                              <Text style={{textAlign:'right'}}>{s.date}</Text>
                                            </View>
                                            <View style={{flex:2, textAlign: 'center', margin:2, padding:5, borderRadius: 5, backgroundColor: GLOBALS.COLOR.BG_SCALE[i] }}>
                                                 <Text style={{textAlign:'center'}}>{s.avg}</Text>
                                            </View>
                                            <View style={{flex:2, textAlign: 'center', margin:2, padding:5, borderRadius: 5, backgroundColor: GLOBALS.COLOR.BG_SCALE[i] }}>
                                                <Text style={{textAlign:'center'}}>{s.min}</Text>
                                            </View>
                                            <View style={{flex:2, textAlign: 'center', margin:2, padding:5, borderRadius: 5, backgroundColor: GLOBALS.COLOR.BG_SCALE[i] }}>
                                                <Text style={{textAlign:'center'}}>{s.max}</Text>
                                            </View>
                                      </View>
                                   )
                                })
                            }
                    {arr.map((e, i) => {return (
                        <View key={i} >
                        {e}
                        </View>
                    )})}
                 </Card>
            )

        }
}



const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: 'white',
        margin: 10
    }
})
