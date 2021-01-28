import mapActionToReducer from 'redux-action-reducer-mapper';
import reduceReducers from 'reduce-reducers';

export const initialState = {
  gameId: '',
  isPaired: false,
  isHost: false,
  activeView: 'POST_PAIRING_SETUP',
  soundTypes: [],
  levelType: 'WORD',
  theme: '',
  chars: {},
  board: {},
  score: {},
};

const setIsPaired = (state, action) => {
  const { isPaired } = action.payload;

  return {
    ...state,
    isPaired,
  };
};

const setIsHost = (state, action) => {
  const { isHost } = action.payload;

  return {
    ...state,
    isHost,
  };
};

const setActiveView = (state, action) => {
  const { activeView } = action.payload;

  return {
    ...state,
    activeView,
  };
};

const setGameId = (state, action) => {
  const { gameId } = action.payload;
  return {
    ...state,
    gameId,
  };
};

const setGameConfig = (state, action) => {
  const { config } = action.payload;

  return {
    ...state,
    levelType: config.levelType || state.levelType,
    guestData: config.guestData || state.guestData,
    hostData: config.hostData || state.hostData,
    nextMove: config.nextMove || state.nextMove,
    soundTypes: config.soundTypes || state.soundTypes,
    rounds: config.rounds || state.rounds,
  };
};

const setFirstMove = (state, action) => {
  const { firstMove } = action.payload;

  return {
    ...state,
    nextMove: firstMove,
  };
};

const setTheme = (state, action) => {
  const { theme, character } = action.payload;

  return {
    ...state,
    theme: theme || state.theme,
    character: character || state.character,
  };
};

const updateSoundTypes = (state, action) => {
  const { sound, position, isSelected } = action.payload;
  if (!sound && !position && !isSelected) {
    return {
      ...state,
      soundTypes: [],
    };
  }
  return {
    ...state,
    soundTypes: isSelected
      ? [...state.soundTypes, { sound, position }]
      : state.soundTypes.filter(
          (type) => type.sound !== sound || type.position !== position
        ),
  };
};

const flushData = (state, action) => {
  return {
    ...initialState,
    gameId: '',
    isPaired: false,
    isHost: false,
    hostData: {},
    guestData: {},
    soundTypes: [],
    rounds: [],
    levelType: 'WORD',
    theme: '',
    hostCharacter: '',
    guestCharacter: '',
    nextMove: 'HOST',
    board: ['', '', '', '', '', '', '', '', ''],
    score: {},
    activeRound: 0,
    activeQuestion: null,
  };
};

const syncGameData = (state, action) => {
  const { gameData } = action.payload;

  return {
    ...state,
    ...gameData,
  };
};

const autoUpdateGameData = (state, action) => {
  return {
    ...state,
    ...action.payload,
  };
};

const mainReducer = mapActionToReducer({
  default: initialState,
  SET_IS_PAIRED: setIsPaired,
  SET_ACTIVE_VIEW: setActiveView,
  SET_IS_HOST: setIsHost,
  SET_IS_GAME_CONFIG: setGameConfig,
  SET_FIRST_MOVE: setFirstMove,
  SET_GAME_ID: setGameId,
  FLUSH_DATA: flushData,
  SYNC_GAME_DATA: syncGameData,
  AUTO_UPDATE_GAME_DATA: autoUpdateGameData,
  SET_THEME: setTheme,
});

export default reduceReducers(mainReducer);
