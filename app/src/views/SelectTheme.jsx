import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import themesData from '../data/themes';
import characters from '../data/characters';
import { pushGameUpdate, emitMessage } from '../utils';
import { setActiveViewAction } from '../actions/mainActions';

export const SelectTheme = ({
  selectedTheme,
  hostCharacter,
  guestCharacter,
  isHost,
  setActiveView,
}) => {
  const selectedCharacter = isHost ? hostCharacter : guestCharacter;
  const isAwaitingOtherPlayer = ![hostCharacter, guestCharacter].every(
    (c) => c
  );
  const themes = ['jurassic', 'princess'];
  const onSelectTheme = (theme) => pushGameUpdate({ theme });
  const onSelectCharacter = (character) =>
    pushGameUpdate({
      [isHost ? 'hostCharacter' : 'guestCharacter']: character,
    });
  const onStartGame = () => {
    emitMessage('START_GAME');
  };

  if (
    selectedTheme &&
    !themesData[selectedTheme].characters.find((c) => c === selectedCharacter)
  ) {
    pushGameUpdate({
      [isHost ? 'hostCharacter' : 'guestCharacter']: null,
    });
  }

  useEffect(() => {
    window.socket.on('START_GAME', () => setActiveView('GAME'));
  }, []);

  return (
    <div>
      {!selectedTheme && (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {themes.map((theme) => (
            <div onClick={() => onSelectTheme(theme)}>
              <h1>{themesData[theme].label}</h1>
              <img src="https://via.placeholder.com/350" alt="" />
            </div>
          ))}
        </div>
      )}

      {selectedTheme && !selectedCharacter && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {themesData[selectedTheme].characters.map((character) => (
              <div onClick={() => onSelectCharacter(character)}>
                <h3>{characters[selectedTheme][character].label}</h3>
                <img src="https://via.placeholder.com/200" alt="" />
              </div>
            ))}
          </div>
          <button onClick={() => onSelectTheme(null)}>Go back</button>
        </>
      )}

      {selectedCharacter && selectedTheme && (
        <div>
          {isAwaitingOtherPlayer && <div>Awaiting other player...</div>}
          <button disabled={isAwaitingOtherPlayer} onClick={onStartGame}>
            Start
          </button>
          <button onClick={() => onSelectCharacter(null)}>Go back</button>
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state) => ({
  isHost: state.isHost,
  selectedTheme: state.theme,
  hostCharacter: state.hostCharacter,
  guestCharacter: state.guestCharacter,
});

const mapDispatchToProps = {
  setActiveView: setActiveViewAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(SelectTheme);
