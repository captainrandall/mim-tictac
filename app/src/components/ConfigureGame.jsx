import React, { useState } from 'react';
import { connect } from 'react-redux';
import { sounds } from '../data/sounds';
import {
  setLevelTypeAction,
  updateSoundTypesAction,
  setFirstMoveAction,
} from '../actions/mainActions';
import { populateAllQuestions, shuffle } from '../utils';

export const ConfigureGame = ({
  soundTypes: storedSoundTypes,
  nextMove: storedNextMove,
  // setFirstMove,
  // updateSoundTypes,
  // setLevelType,
  levelType: storedLevelType,
  rounds: storedRounds,
  hostData,
  onConfigReady,
  onClickBack,
}) => {
  const [isErrorAlertOpen, setIsErrorAlertOpen] = useState(false);
  const [soundTypes, setSoundTypes] = useState(storedSoundTypes || []);
  const [nextMove, setNextMove] = useState(storedNextMove || 'HOST');
  const [levelType, setLevelType] = useState(storedLevelType || 'WORD');
  const [rounds, setRounds] = useState(
    storedRounds.length
      ? storedRounds
      : [
          {
            questions: new Array(9).fill({
              soundType: {},
              word: '',
              image: '',
              completedBy: '',
            }),
          },
        ]
  );
  const [name, setName] = useState(hostData.name || '');

  const onSelectSound = ({ sound, position, isSelected }) => {
    if (soundTypes.length < 9 || !isSelected) {
      setSoundTypes(
        isSelected
          ? [...soundTypes, { sound, position }]
          : soundTypes.filter(
              (type) => type.sound !== sound || type.position !== position
            )
      );
      setIsErrorAlertOpen(false);
    } else {
      setIsErrorAlertOpen(true);
    }
  };

  const onResetConfig = () => {
    setSoundTypes([]);
    setNextMove('HOST');
    setLevelType('WORD');
    setName('');
  };

  return (
    <div>
      <h1>Configure</h1>
      <button onClick={onClickBack}>Back</button>
      <button onClick={onResetConfig}>Reset</button>
      <button
        onClick={() =>
          onConfigReady({
            soundTypes,
            nextMove,
            levelType,
            hostData: { name },
            rounds: populateAllQuestions(rounds, soundTypes),
          })
        }
      >
        Submit
      </button>
      <h3>Enter your name</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <h3>Number of rounds</h3>
      <input
        value={rounds.length}
        onChange={(e) => {
          setRounds(
            new Array(parseInt(e.target.value)).fill({
              questions: new Array(9).fill({
                soundType: {},
                word: '',
                image: '',
                completedBy: '',
              }),
            })
          );
        }}
        type="number"
      />
      <h3>Who takes first move</h3>
      <label htmlFor="first-move-host">
        Me
        <input
          checked={nextMove === 'HOST'}
          type="checkbox"
          id="first-move-host"
          onChange={() => setNextMove('HOST')}
        />
      </label>
      <label htmlFor="first-move-guest">
        Other player
        <input
          checked={nextMove === 'GUEST'}
          type="checkbox"
          id="first-move-guest"
          onChange={() => setNextMove('GUEST')}
        />
      </label>
      <h3>Select level</h3>
      <div style={{ background: 'gray' }}>
        <label htmlFor="word-level">
          Word level
          <input
            checked={levelType === 'WORD'}
            type="checkbox"
            id="word-level"
            onChange={() => setLevelType('WORD')}
          />
        </label>
        <label htmlFor="sentence-level">
          Sentence level
          <input
            checked={levelType === 'SENTENCE'}
            type="checkbox"
            id="sentence-level"
            onChange={() => setLevelType('SENTENCE')}
          />
        </label>
      </div>
      <h3>Select sound</h3>
      {isErrorAlertOpen && <h1>Oi - too many sounds</h1>}
      {Object.keys(sounds).map((sound) => (
        <div style={{ background: 'gray' }}>
          <h3>{sound}</h3>
          {Object.keys(sounds[sound]).map((position) => (
            <label htmlFor={`${sound}-${position}`}>
              {position}
              <input
                id={`${sound}-${position}`}
                type="checkbox"
                checked={
                  soundTypes.findIndex(
                    (type) => type.sound === sound && type.position === position
                  ) !== -1
                }
                onChange={(e) =>
                  onSelectSound({
                    sound,
                    position,
                    isSelected: e.target.checked,
                  })
                }
              />
            </label>
          ))}
        </div>
      ))}
    </div>
  );
};

const mapStateToProps = (state) => ({
  soundTypes: state.soundTypes,
  levelType: state.levelType,
  nextMove: state.nextMove,
  hostData: state.hostData,
  guestData: state.guestData,
  rounds: state.rounds,
});

const mapDispatchToProps = {
  // updateSoundTypes: updateSoundTypesAction,
  // setLevelType: setLevelTypeAction,
  // setFirstMove: setFirstMoveAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(ConfigureGame);
