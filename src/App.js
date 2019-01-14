import React, { Component } from 'react';
import NavigationBar from './components/NavigationBar';
import { Switch, Route } from 'react-router-dom';
import Home from './components/Home';
import Overview from './components/Overview';
import PrivatePolicy from './components/PrivatePolicy';
import Page404 from './components/Page404';


export default class App extends Component {
  render() {
    return (
      <div className="App">
          <NavigationBar />
          <Switch>
              <Route exact path="/" component={Home} />
              <Route path="/overview/" component={Overview} />
              <Route path="/private_policy/" component={PrivatePolicy} />
              <Route component={Page404} />
          </Switch>

      </div>
    );
  }
}
