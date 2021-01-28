import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
  setActiveViewAction,
  setGameIdAction,
  flushDataAction,
  setIsHostAction,
  setGameConfigAction,
} from '../actions/mainActions';
import ConfigureGame from '../components/ConfigureGame';
import { sounds } from '../data/sounds';
import { emitMessage, getNewGameId, pushGameUpdate, shuffle } from '../utils';
import JoinGame from './JoinGame';

export const PrePairingSetup = ({
  setGameId,
  setActiveView,
  gameId,
  flushData,
  setIsHost,
  setGameConfig,
  isHost,
  levelType,
  hostData,
  soundTypes,
  nextMove,
  rounds,
}) => {
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [isJoiningGame, setIsJoiningGame] = useState(false);
  const [isAwaitingOtherPlayer, setIsAwaitingOtherPlayer] = useState(false);

  

  const onRequestJoinGame = () => {
    emitMessage('JOIN_GAME');
  };
  const onRequestNewGame = () => {
    setGameId(getNewGameId());
    emitMessage('NEW_GAME');
  };
  const onClickCreateGame = () => {
    flushData();
    setIsHost(true);
    setIsCreatingGame(true);
    setIsAwaitingOtherPlayer(false);
  };
  const onClickJoinGame = () => {
    flushData();
    setIsJoiningGame(true);
  };

  useEffect(() => {
    window.socket.on('PAIRING_SUCCESS', () => {
      if (isHost) {
        pushGameUpdate({
          levelType,
          hostData,
          soundTypes,
          nextMove,
          rounds,
        });
      } else {
      }
      setActiveView('SELECT_THEME');
    });
  }, [levelType, hostData, soundTypes, nextMove, rounds]);

  if (!isCreatingGame && !isJoiningGame) {
    return (
      <div>
        <h1>Landing</h1>
        <button onClick={onClickCreateGame}>Create game</button>
        <button onClick={onClickJoinGame}>Join Game</button>
      </div>
    );
  }

  if (isJoiningGame) {
    return (
      <JoinGame
        onClickConfirmJoinGame={(name) => {
          onRequestJoinGame();
          pushGameUpdate({ guestData: { name } });
          setIsJoiningGame(false);
        }}
      />
    );
  }

  if (isCreatingGame && !isAwaitingOtherPlayer) {
    return (
      <ConfigureGame
        onConfigReady={(config) => {
          setGameConfig(config);
          setIsAwaitingOtherPlayer(true);
          onRequestNewGame();
        }}
        onClickBack={() => {
          setIsCreatingGame(false);
          setIsHost(false);
        }}
      />
    );
  }

  if (isAwaitingOtherPlayer) {
    return (
      <div>
        <h1>Awaiting player to join</h1>
        <h3>Here is your code: {gameId}</h3>
        <button onClick={() => setIsAwaitingOtherPlayer(false)}>Back</button>
      </div>
    );
  }

  return <div>error</div>;
};

const mapStateToProps = (state) => ({
  isPaired: state.isPared,
  isHost: state.isHost,
  gameId: state.gameId,
  hostData: state.hostData,
  soundTypes: state.soundTypes,
  levelType: state.levelType,
  rounds: state.rounds,
  nextMove: state.nextMove,
});

const mapDispatchToProps = {
  setGameId: setGameIdAction,
  setGameConfig: setGameConfigAction,
  setActiveView: setActiveViewAction,
  setIsHost: setIsHostAction,
  flushData: flushDataAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(PrePairingSetup);
