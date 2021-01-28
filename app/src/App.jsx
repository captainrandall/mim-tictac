import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import io from 'socket.io-client';
import { autoUpdateGameDataAction } from './actions/mainActions';
import { views } from './data';
import { dispatchRequestedData } from './utils';
import './App.css'

window.socket = io('http://localhost:4000');

export const App = ({ activeView, autoUpdateGameData }) => {
  useEffect(() => {
    window.socket.on('REQUEST_DATA', dispatchRequestedData);
    window.socket.on('INCOMING_GAME_DATA', autoUpdateGameData);
  }, []);
  const ActiveView = views[activeView].component;

  return <ActiveView />;
};

const mapStateToProps = (state) => ({
  activeView: state.activeView,
});

const mapDispatchToProps = {
  autoUpdateGameData: autoUpdateGameDataAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
