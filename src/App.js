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
import { mainMenu, google } from './config'
import ScrollToTop from './components/ScrollToTop'
import { renderToStaticMarkup } from "react-dom/server";
import { withLocalize } from "react-localize-redux";
import { Translate } from "react-localize-redux";
import globalTranslations from "./translations/global.json";
import ReactGA from 'react-ga';
import { ToastContainer } from 'react-toastify';


class App extends Component {

  constructor(props) {
      super(props);
      this.menu = mainMenu;
      this.props.initialize({
          languages: [
              { name: "English", code: "en" },
              { name: "Russian", code: "ru" }
          ],
          translation: globalTranslations,
          options: {
              renderToStaticMarkup,
              renderInnerHtml: true,
              defaultLanguage: localStorage.getItem("lang") || "en"
          }
      });
      console.log("MODE: " + process.env.NODE_ENV);
      if (!process.env.NODE_ENV || process.env.NODE_ENV === 'production') {
        ReactGA.initialize(google.ga);
        ReactGA.pageview(window.location.pathname + window.location.search);
      }
  }

  render() {
    let menuItems = this.menu.map((item, key) => {
        return (
            <NavItem eventKey={item.path} key={key}>
                <NavIcon>
                    <i className={item.icon + " fa sidenav-icon"} aria-hidden="true"></i>
                </NavIcon>
                <NavText>
                    <Translate id={"mainMenu." + item.titleId} />
                </NavText>
            </NavItem>
        )
    })
    return (
      <div className="App">
          <Route render={({ location, history }) => (
              <ScrollToTop>
                  <React.Fragment>
                      <ToastContainer
                          position="top-right"
                          autoClose={3000}
                          hideProgressBar
                          newestOnTop
                          closeOnClick
                          rtl={false}
                          pauseOnVisibilityChange
                          draggable
                          pauseOnHover
                      />
                      <div className="d-none d-md-block">
                          <SideNav onSelect={(selected) => {
                              if (selected.startsWith('http:') || selected.startsWith("https:")) {
                                  window.location.href = selected;
                              } else {
                                  const to = '/' + selected;
                                  if (location.pathname !== to) {
                                      history.push(to);
                                  }
                                  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'production') {
                                    ReactGA.pageview(window.location.pathname + window.location.search);
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
                                  <Route component={Page404} status={404} />
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

export default withLocalize(App);
