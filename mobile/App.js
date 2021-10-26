import React from 'react';
//first import createStackNavigator from react-navigation
//then import StackNavigator for creatign nested routes
import { createStackNavigator } from 'react-navigation-stack';
import { createAppContainer } from "react-navigation";
//Import your screens
import Home from './src/components/Home';
import Login from './src/components/Login';
import Signup from './src/components/Signup';
import ControlScreen from './src/components/ControlScreen';
import AddTag from './src/components/AddTag';
import Predict from './src/components/Predict';


//Define your routes using createStackNavigator, which will be a object full of options.
const RootStack = createStackNavigator({
    //Define your screens.
    'Home': { screen: Home },
    'Login': {screen: Login},
    'Sign up': {screen: Signup},
    'Control screen': {screen: ControlScreen},
    'Add tag': {screen: AddTag},
    'Predict': {screen: Predict},
  },
  {
    initialRouteName:  'Home'
  })


//Export default the stateless component
const App = createAppContainer(RootStack)

export default App;