export const setGameIdAction = (gameId) => ({
  type: 'SET_GAME_ID',
  payload: { gameId },
});

export const setActiveViewAction = (activeView) => ({
  type: 'SET_ACTIVE_VIEW',
  payload: { activeView },
});

export const setIsHostAction = (isHost) => ({
  type: 'SET_IS_HOST',
  payload: { isHost },
});

export const setGameConfigAction = (config) => ({
  type: 'SET_IS_GAME_CONFIG',
  payload: { config },
});

export const setFirstMoveAction = (firstMove) => ({
  type: 'SET_FIRST_MOVE',
  payload: { firstMove },
});

export const setThemeAction = ({ theme, character }) => ({
  type: 'SET_THEME',
  payload: { theme, character },
});

export const flushDataAction = () => ({
  type: 'FLUSH_DATA',
  payload: {},
});

export const syncGameDataAction = (gameData) => ({
  type: 'SYNC_GAME_DATA',
  payload: gameData,
});

export const autoUpdateGameDataAction = (gameData) => ({
  type: 'AUTO_UPDATE_GAME_DATA',
  payload: gameData,
});
