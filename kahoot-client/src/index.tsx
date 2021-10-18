import React from 'react';
import ReactDOM from 'react-dom';
import { GlobalStateProvider } from './context';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import './index.css';
import "@fontsource/rubik"

import Home from './pages/home';
import Create from './pages/create';
import Quizzes from './pages/quizzes';
import Host from './pages/host';
import Play from './pages/play';

function Navigation() {
  return (
    <Router>
      <Switch>
        <GlobalStateProvider>
          <Route exact path="/create" component={Create} />
          <Route exact path="/quizzes" component={Quizzes} />
          <Route exact path="/host/:quizId" component={Host} />
          <Route exact path="/play/:gamePin" component={Play} />
          <Route exact path="/" component={Home} />
        </GlobalStateProvider>
      </Switch>
    </Router>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <Navigation />
  </React.StrictMode>,
  document.getElementById('root')
);