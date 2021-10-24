import React, { PureComponent } from 'react';
import { View, Text, Button, Image, StyleSheet, TextInput, Alert, Dimensions, FlatList } from 'react-native';
import { Card, ListItem, Icon, Badge, SearchBar, Header } from 'react-native-elements'
import { LineChart, BarChart } from "react-native-chart-kit";
import GLOBALS from './Globals';

export default class ViewTags extends PureComponent {
    constructor(props){
        super(props)
        this.render_day = this.render_day.bind(this)
        this.render_visual = this.render_visual.bind(this)
        this.state = {
        }
    }
    render_visual(data, date, i){
        data = data.sort((a,b) => (a.time > b.time) ? 1 : ((b.time > a.time) ? -1 : 0))
        return data.map((s, j) => {
            return (
                <View key={String(i)+'-'+String(j)}
                   style={{fontSize: 5, margin:0, flexDirection: 'row' }} >
                     <View style={{ textAlign: 'center', margin:2, padding:5, borderRadius: 5, backgroundColor: GLOBALS.COLOR.BG_SCALE[i] }}>
                         <Text>
                            {'  '.repeat(parseInt(s.time.slice(0,2))) + s.time.slice(0,5)}
                         </Text>
                       </View>
                       <View style={{ textAlign: 'center', margin:2, padding:5, borderRadius: 5, backgroundColor: GLOBALS.COLOR.SECONDARY_BG }}>

                                {s.hasOwnProperty('type') ? (
                                <Text>
                                <Icon
                                iconProps={{size:15}}
                                type="font-awesome"
                                name='flask'
                                color={GLOBALS.COLOR.SECONDARY} />&nbsp;
                                {' '.repeat(s.value) + String(s.value) + 'u'}
                                </Text>
                                ):(
                                <Text>
                                <Icon
                                iconProps={{size:15}}
                                type="font-awesome"
                                name='tag'
                                color={GLOBALS.COLOR.SECONDARY} />&nbsp;
                                {s.value.toUpperCase()}
                                </Text>
                                )}
                       </View>
                 </View>
            )
        })
    }
    render_day(data, date, i) {
        const visual = this.render_visual(data, date, i)
        return (
            <>
                <View style={{ textAlign: 'center', margin:2, padding:5, borderRadius: 5, backgroundColor: GLOBALS.COLOR.BG_SCALE[i] }}>
                    <Text> {date}</Text>
               </View>
                {visual}
                <View style={{ textAlign: 'center', margin:2, padding:5, borderRadius: 5 }}>
                    <Text> {' '}</Text>
               </View>
            </>
        )
    }
    render() {
        data = this.props.data
        if (data.length == 0){
            return (
                <View style={styles.info}>
                    <Card>
                        <Text style={{color: GLOBALS.COLOR.SECONDARY, fontSize: 20}}>No tags nor insulin found</Text>
                        <Icon
                        iconProps={{size:100}}
                        type="font-awesome"
                        name='tag'
                        color={GLOBALS.COLOR.SECONDARY} />
                        <Icon
                        iconProps={{size:100}}
                        type="font-awesome"
                        name='flask'
                        color={GLOBALS.COLOR.SECONDARY} />
                    </Card>
                </View>
            )
        }
        var sorted = {};
        let unique_dates = [...new Set(data.map(item => item.date))]
        unique_dates = unique_dates.sort()

        for( var i = 0;  i < data.length; i++ ){
             if( sorted[data[i].date] == undefined ){
              sorted[data[i].date] = [];
             }
             sorted[data[i].date].push(data[i]);
        }
        let arr = []

        for ( var i = 0;  i < unique_dates.length; i++ ) {
            arr.push(this.render_day(sorted[unique_dates[i]], unique_dates[i], i))
        }
        return(
            <Card>
                <Text style={{color: GLOBALS.COLOR.SECONDARY, fontSize: 40}}>
                <Icon
                iconProps={{size:40}}
                type="font-awesome"
                name='tag'
                color={GLOBALS.COLOR.MAIN} />
                <Icon
                iconProps={{size:40}}
                type="font-awesome"
                name='flask'
                color={GLOBALS.COLOR.MAIN} />
                &nbsp;Tags & Insulin
                </Text>
                <View>
                    {arr.map((e, i) => {return (
                        <View key={i}>
                        {e}
                        </View>
                    )})}
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
    }
})
