import React, { useState } from 'react';
import { connect } from 'react-redux';
import { setGameIdAction } from '../actions/mainActions';

const JoinGame = ({ setGameId, gameId, onClickConfirmJoinGame }) => {
  const [name, setName] = useState('');
  return (
    <div>
      <h1>Name</h1>
      <input onChange={(e) => setName(e.target.value)} value={name} />
      <h1>Enter code</h1>
      <input onChange={(e) => setGameId(e.target.value)} value={gameId} />
      <button onClick={() => onClickConfirmJoinGame(name)}>Join</button>
      <button onClick={() => {}}>Back</button>
    </div>
  );
};

const mapStateToProps = (state) => ({
  gameId: state.gameId,
});

const mapDispatchToProps = {
  setGameId: setGameIdAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(JoinGame);
