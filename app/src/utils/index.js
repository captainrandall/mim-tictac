import { v4 as uuidv4 } from 'uuid';
import { sounds } from '../data/sounds';
import store from '../store';

/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
export const shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export const getNewGameId = () =>
  uuidv4()
    .split('')
    .filter((n) => Number.isInteger(parseInt(n)))
    .join('')
    .substring(0, 4);

/**
 * Retrieve specified state properties.
 * To be used for sending to other client.
 *
 * @param {array} dataRefs requested state property names
 */
export const getStateGameData = (dataRefs) => {
  if (!dataRefs) {
    return;
  }

  const state = store.getState();
  const gameData = {
    gameId: state.gameId,
    soundTypes: state.soundTypes,
    levelType: state.levelType,
    firstMove: state.firstMove,
    theme: state.theme,
    chars: state.chars,
    board: state.board,
    score: state.score,
  };

  const requestedData = {};
  for (const dataRef of dataRefs) {
    requestedData[dataRef] = gameData[dataRef];
  }

  return requestedData;
};

/**
 * Emit a simple message string.
 * Attach any additional data to payload
 *
 * @param {string} message
 * @param {object} additionalData
 */
export const emitMessage = (message, additionalData) => {
  if (!message) {
    return;
  }

  window.socket.emit('MESSAGE', {
    message,
    gameId: getStateGameData(['gameId']).gameId,
    ...additionalData,
  });
};

/**
 * Flow:
 * CLIENT(refs) > SERVER(refs) > OTHER CLIENT - dispatchRequestData(payload) > SERVER(payload) > CLIENT - resolve(payload)
 *
 * Request specified data from other client.
 * Send a message with refs of required data, server will then emit this data
 * to other client hitting the dispatchRequestData() and return the required payload.
 *
 * @param {array} requestedDataRefs property names of other client's state data
 */
export const requestGameData = (requestedDataRefs) => {
  if (!requestedDataRefs) {
    return;
  }

  window.socket.emit('REQUEST_DATA', {
    gameId: getStateGameData(['gameId']).gameId,
    requestedData: requestedDataRefs,
  });

  return new Promise((resolve, reject) => {
    window.socket.on('REQUESTED_DATA_PAYLOAD', (payload) => resolve(payload));
  });
};

/**
 * Flow: SERVER(payload) > OTHER CLIENT - requestGameData.resolve(payload)
 *
 * Send back the requested data after it has been retrieved from state.
 * When server receives the payload and the gameId, it will emit
 * this data back to other client.
 *
 * @param {array} requestedDataRef property names of requested state data
 */
export const dispatchRequestedData = (requestedDataRef) => {
  if (!requestedDataRef) {
    return;
  }

  window.socket.emit('REQUESTED_DATA_PAYLOAD', {
    gameId: getStateGameData(['gameId']).gameId,
    requestedData: getStateGameData(requestedDataRef),
  });
};

/**
 * Request sepecific game state properties from other client, then
 * automatically update local state.
 *
 * @param {array} requestedDataRefs requested state property names
 */
export const autoSyncGameData = (requestedDataRefs) => {
  requestGameData(requestedDataRefs).then((data) => {
    store.dispatch({
      type: 'SYNC_GAME_DATA',
      payload: { requestedData: data },
    });
  });
};

export const pushGameUpdate = (providedData) => {
  window.socket.emit('PUSH_PAYLOAD_TO_All', {
    gameId: getStateGameData(['gameId']).gameId,
    providedData,
  });
};

store.subscribe(getStateGameData);



/**
 * Ensure all rounds, have populated questions.
 * Accomodate for more rounds than sound types by
 * duplicating, shuffling & adding the original list of available sound types.
 * 
 * @param {array} rounds 
 * @param {array} soundTypes 
 */
export const populateAllQuestions = (rounds, soundTypes) => {
  // Get a list of all available sound types to work with
  let allSounds = soundTypes.reduce(
    (acc, soundType) => [
      ...acc,
      ...sounds[soundType.sound][soundType.position].map((position) => ({
        word: position.name,
        soundType: soundType.sound,
        position: soundType.position,
      })),
    ],
    []
  );

  allSounds = shuffle(allSounds);

  // If we end up with more rounds than can accomodate the selected amount of
  // sound types, we get the full amount of questions, duplicate & suffle the
  // available sounds, and add to each excess question.
  let index = 0;
  const soundsToUse = new Array(rounds.length * 9).fill(null).map(() => {
    if (index === allSounds.length - 1) {
      allSounds = shuffle(allSounds);
      index = 0;
    }

    index += 1;

    return allSounds[index - 1];
  });

  // Now simple add each question to the rounds.
  let questionsAdded = 0;
  return rounds.map((round) => ({
    ...round,
    questions: round.questions.map((question) => {
      questionsAdded += 1;
      return {
        ...question,
        ...soundsToUse[questionsAdded - 1],
      };
    }),
  }));
};
