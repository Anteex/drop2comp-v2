import React, { Component } from 'react';
import NavigationBar from './components/NavigationBar';
import FooterBar from './components/FooterBar';
import { Switch, Route } from 'react-router-dom';
import Home from './components/Home';
import Overview from './components/Overview';
import PrivatePolicy from './components/PrivatePolicy';
import Page404 from './components/Page404';
import SideNav, { NavItem, NavIcon, NavText } from '@trendmicro/react-sidenav';
import '@trendmicro/react-sidenav/dist/react-sidenav.css';
import { mainMenu } from './config'
import ScrollToTop from './components/ScrollToTop'


export default class App extends Component {

  constructor(props){
      super(props);
      this.menu = mainMenu;
  }

  render() {
    let menuItems = this.menu.map((item, key) => {
        return (
            <NavItem eventKey={item.path} key={key}>
                <NavIcon>
                    <i className={item.icon + " fa sidenav-icon"} aria-hidden="true"></i>
                </NavIcon>
                <NavText>
                    {item.title}
                </NavText>
            </NavItem>
        )
    })
    return (
      <div className="App">
          <Route render={({ location, history }) => (
              <ScrollToTop>
                  <React.Fragment>
                      <div className="d-none d-md-block">
                          <SideNav onSelect={(selected) => {
                              if (selected.startsWith('http:') || selected.startsWith("https:")) {
                                  window.location.href = selected;
                              } else {
                                  const to = '/' + selected;
                                  if (location.pathname !== to) {
                                      history.push(to);
                                  }
                              }
                          }}
                          >
                              <SideNav.Toggle />
                              <SideNav.Nav defaultSelected="">
                                  {menuItems}
                              </SideNav.Nav>
                          </SideNav>
                      </div>
                      <main className="sidenav-main">
                          <div className="content">
                              <NavigationBar />
                              <Switch>
                                  <Route exact path="/" component={Home} />
                                  <Route path="/overview/" component={Overview} />
                                  <Route path="/private_policy/" component={PrivatePolicy} />
                                  <Route component={Page404} />
                              </Switch>
                          </div>
                          <FooterBar />
                      </main>
                  </React.Fragment>
              </ScrollToTop>
          )}
          />

      </div>
    );
  }
}
