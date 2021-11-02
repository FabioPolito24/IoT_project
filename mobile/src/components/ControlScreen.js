import React, { PureComponent } from 'react';
import { View, Text, Button, Image, StyleSheet, TouchableOpacity, ScrollView, TextInput,  Dimensions, AsyncStorage, ActivityIndicator } from 'react-native';
import { Card, ListItem, Icon, Badge, SearchBar } from 'react-native-elements'
import CalendarPicker from 'react-native-calendar-picker';
import PlotGlucose from './PlotGlucose';
import PlotHeartbeat from './PlotHeartbeat';
import ViewTags from './ViewTags';
import GLOBALS from './Globals';

class Home extends PureComponent {
    constructor(props){
        super(props)
        var now = new Date();
        this.handleLogout = this.handleLogout.bind(this)
        this.onDateChange = this.onDateChange.bind(this)
        this.getMeasurements = this.getMeasurements.bind(this)
        this.updateSearch = this.updateSearch.bind(this)
		this.search = this.search.bind(this)
        this.getTags = this.getTags.bind(this)
        this.state = {
            loading: true,
            measurements: [],
            tags: [],
            search: "",
            startDate: new Date().toISOString().slice(0,10),
            endDate: null
        }
    }
    updateSearch(search){
        this.setState({ search: search});
    }
	async search(){
	    const w = await this.setState({loading: true})
        var TARGET = 'measurements/?user=1'
        var PARAMS = '&tag='+this.state.search
        const userId = await AsyncStorage.getItem('userId');
        var response = await fetch(GLOBALS.API_ENDPOINT+TARGET+PARAMS);
        const measurements = await response.json();
        TARGET = 'tags/?user=1'
        var response = await fetch(GLOBALS.API_ENDPOINT+TARGET+PARAMS);
        const tags = await response.json();
        this.setState({measurements: measurements, tags: tags, loading: false})
	}
    async getMeasurements(startDate, endDate){
        var TARGET = 'measurements/?user=1'
        var PARAMS = ''
        const userId = await AsyncStorage.getItem('userId');
        if (endDate === null){
            PARAMS += '&date='+startDate
        }
        else{
            PARAMS += '&date__gte='+startDate+'&date__lte='+endDate
        }
        var response = await fetch(GLOBALS.API_ENDPOINT+TARGET+PARAMS);
        const measurements = await response.json();
        return measurements
    }
    async getTags(startDate, endDate){
        var TARGET = 'tags/?user=1'
        var PARAMS = ''
        const userId = await AsyncStorage.getItem('userId');
        if (endDate === null){
            PARAMS += '&date='+startDate
        }
        else{
            PARAMS += '&date__gte='+startDate+'&date__lte='+endDate
        }
        var response = await fetch(GLOBALS.API_ENDPOINT+TARGET+PARAMS);
        const tags = await response.json();
        return tags
    }
    async componentDidMount(){
        const now = new Date().toISOString().slice(0,10)
        const measurements = await this.getMeasurements(now, null)
        const tags = await this.getTags(now, null)
        try {
            this.setState({measurements: measurements, tags: tags, loading: false});
        } catch(err) {
            console.log("Error fetching data-----------", err);
        }
    }
    static navigationOptions = { headerShown: false }
    async handleLogout(){
        const value = await AsyncStorage.getItem('userId')
        this.props.navigation.navigate("Home")
    }
    async onDateChange(date, type) {
        const w = await this.setState({loading: true})
        date = date.format('YYYY-MM-DD')
        if (type === 'END_DATE') {
          if (date != this.state.startDate){
              const measurements = await this.getMeasurements(this.state.startDate, date)
              const tags = await this.getTags(this.state.startDate, date)
              this.setState({
                  endDate: date,
                  measurements: measurements,
                  tags: tags,
                  loading: false
                });
           }
        } else {
          const measurements = await this.getMeasurements(date, null)
          const tags = await this.getTags(date, null)
          this.setState({
            startDate: date,
            endDate: null,
            measurements: measurements,
            tags: tags,
            loading: false
          });
        }
      }
    render() {
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
            <ScrollView style={styles.container}>
                <View style={styles.info}>
                    <Card>
                        <Text style={{color: GLOBALS.COLOR.SECONDARY, fontSize: 60}}>
                        <Icon
                        iconProps={{size:70}}
                        type="font-awesome"
                        name='tint'
                        color={GLOBALS.COLOR.MAIN} />
                        &nbsp;Blo.
                        </Text>
                        <Card.Divider />
                        <Text style={{color: GLOBALS.COLOR.SECONDARY, fontSize: 20, textAlign: 'center'}}>
                        Pick date or range
                        </Text>
                        <CalendarPicker
                            allowRangeSelection={true}
                          onDateChange={this.onDateChange}
                          width={Dimensions.get("window").width - Dimensions.get("window").width*0.1}
                         height={Dimensions.get("window").height*0.3}
                        />
                        <Card.Divider />

                        <View style={{flexDirection: 'row'}}>
							<View style={{flex: 2}}>
								<TouchableOpacity style={styles.controlButton}
									onPress={this.search}>
									<Icon
									iconProps={{size:15}}
									type="font-awesome"
									name='search'
									color='white' />
								</TouchableOpacity>
							</View>
							<View style={{flex: 8}}>
                                <TextInput style={styles.input} placeholder="search by tag" onChangeText={this.updateSearch} />
                            </View>
						</View>
                    </Card>
                </View>
                    <View style={styles.chart}>
                            <PlotGlucose data={this.state.measurements.filter((e) => e.type == "G")} />
                    </View>
                    <View style={styles.chart}>
                        <ViewTags data={this.state.tags.concat(this.state.measurements.filter((e) => e.type == "I"))} />
                    </View>

                    <View style={styles.chart}>
                            <PlotHeartbeat  data={this.state.measurements.filter((e) => e.type == "H")} />
                    </View>

                <View style={styles.info}>
                    <Text>{''}</Text>
                </View>
            </ScrollView>
            <View style={styles.controlContainer}>
                <TouchableOpacity style={styles.controlButton}
                    onPress={() => this.props.navigation.navigate("Add tag")}>
                    <Icon
                    iconProps={{size:20}}
                    type="font-awesome"
                    name='plus'
                    color='white' />
                    <Text style={styles.controlText}>Add tag</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlButton}
                    onPress={() => this.props.navigation.navigate("Predict")}>
                    <Icon
                    iconProps={{size:20}}
                    type="font-awesome"
                    name='tint'
                    color='white' />
                    <Text style={styles.controlText}>Predict</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlButton}
                    onPress={this.handleLogout}>
                    <Icon
                    iconProps={{size:20}}
                    type="font-awesome"
                    name='sign-out'
                    color='white' />
                    <Text style={styles.controlText}>Logout</Text>
                </TouchableOpacity>
            </View>
            </>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column'
    },
    controlContainer:{
        flex: 0.1,
        flexDirection: 'row',
        backgroundColor: 'white'
    },
    chart:{
        flex: 5
    },
    info: {
        flex: 5,
        justifyContent: 'center'
    },
    loader: {
        position:'absolute',
        bottom: 300,
        left: 50,
        alignSelf:'flex-end'
    },
    infoTop: {
        flex: 5,
        justifyContent: 'center',
        textAlign: 'center'
    },
    controlButton: {
        flex: 1,
        padding: 2,
        backgroundColor: GLOBALS.COLOR.MAIN,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'white'
    },
    controlText: {
        color: 'white',
        fontSize:10
    },
    input: {
        fontSize: 22,
        padding: 3,
        borderColor: GLOBALS.COLOR.BG_SCALE[3],
        backgroundColor: GLOBALS.COLOR.BG_SCALE[3],
    },
})

export default Home;
