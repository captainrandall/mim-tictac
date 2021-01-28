import React from 'react';
import { connect } from 'react-redux';
import { pushGameUpdate } from '../utils';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const winCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

const Game = ({
  isHost,
  selectedTheme,
  hostCharacter,
  guestCharacter,
  board,
  score,
  nextMove,
  rounds,
  hostData,
  guestData,
  levelType,
  activeRound: activeRoundIndex,
  activeQuestion: activeQuestionIndex,
}) => {
  const playerAlias = isHost ? 'HOST' : 'GUEST';
  const isNextMove =
    (isHost && nextMove === 'HOST') || (!isHost && nextMove === 'GUEST');
  const [isModalOpen, setIsModalOpen] = React.useState(true);

  const round = rounds[activeRoundIndex];
  const question =
    rounds[activeRoundIndex].questions[activeQuestionIndex] || null;
  const [isClickingForGuest, setIsClickingForGuest] = React.useState(false);
  const getQuestionByIndex = (questionIndex) => {
    return rounds[activeRoundIndex].questions[questionIndex];
  };
  const getHasWon = () => {
    const selectedIndexes = rounds[activeRoundIndex].questions
      .map((q, i) => (q.completedBy === playerAlias ? i : null))
      .filter((q, i) => q !== null);
    return winCombinations.some((combo) =>
      combo.every((comboIndex) => selectedIndexes.includes(comboIndex))
    );
  };

  const hasNextRound = activeRoundIndex + 1 < rounds.length;

  if (getHasWon() && !round.winner) {
    pushGameUpdate({
      rounds: rounds.map((r, roundIndex) =>
        roundIndex === activeRoundIndex ? { ...r, winner: playerAlias } : r
      ),
    });
  }

  const onCancelQuestion = () => {
    pushGameUpdate({ activeQuestion: null });
  };

  const onConfirmQuestion = (completedBy) => {
    pushGameUpdate({
      activeQuestion: null,
      nextMove: completedBy === 'HOST' ? 'GUEST' : 'HOST',
      rounds: rounds.map((r, roundIndex) => {
        if (roundIndex === activeRoundIndex) {
          return {
            ...r,
            questions: r.questions.map((q, questionIndex) => {
              if (questionIndex === activeQuestionIndex) {
                return {
                  ...q,
                  completedBy,
                };
              }
              return q;
            }),
          };
        }

        return r;
      }),
    });
  };

  const onClickCell = (index) => {
    if (
      !round.winner &&
      (isNextMove || isClickingForGuest) &&
      !getQuestionByIndex(index).completedBy
    ) {
      pushGameUpdate({ activeQuestion: index });
    }
  };

  const startNextRound = () => {
    if (hasNextRound) {
      pushGameUpdate({ activeRound: activeRoundIndex + 1 });
    }
  };

  return (
    <div>
      <Modal
        isOpen={!!question}
        onRequestClose={onCancelQuestion}
        style={customStyles}
        contentLabel="Example Modal"
      >
        {!!question && (
          <div style={{ width: 400, padding: 20 }}>
            <h2>Word: {question.word}</h2>
            <div>
              {levelType === 'WORD' ? 'Say it then...' : 'Say it - then in a sentence - ta'}
            </div>
            {isHost && (
              <div>
                <button
                  onClick={() =>
                    onConfirmQuestion(isNextMove ? 'HOST' : 'GUEST')
                  }
                >
                  Confirm
                </button>
                <button onClick={onCancelQuestion}>Cancel</button>
              </div>
            )}
          </div>
        )}
      </Modal>
      {!round.winner && (
        <h1>
          {isNextMove
            ? 'Your turn'
            : `${isHost ? guestData.name : hostData.name}'s turn`}
        </h1>
      )}
      {round.winner && (
        <h1>
          {round.winner === 'HOST' ? hostData.name : guestData.name}{' '}
          {hasNextRound ? 'has won this round!' : 'has won!'}
        </h1>
      )}
      <section>
        <div className="game--container">
          {round.questions.map((question, index) => (
            <div
              onClick={() => onClickCell(index)}
              className="cell"
              style={{ position: 'relative', cursor: 'pointer' }}
            >
              <div
                style={{
                  position: 'absolute',
                  fontSize: '18px',
                  opacity: 0.5,
                  marginTop: '-20px',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  left: 0,
                  right: 0,
                }}
              >
                {question.completedBy}
              </div>
              <div style={{ fontSize: 15 }}>{question.word}</div>
            </div>
          ))}
        </div>
      </section>
      {rounds.map((round, index) => (
        <div
          style={{
            border: activeRoundIndex === index ? '1px solid black' : null,
          }}
        >
          {`Round ${index}`}
          {rounds[index].winner &&
            (rounds[index].winner === 'GUEST'
              ? ` - Won by ${guestData.name}`
              : ` - Won by ${hostData.name}`)}
        </div>
      ))}
      {isClickingForGuest && <h1>Clicking for guest active</h1>}
      {isHost && !isClickingForGuest && (
        <button onClick={() => setIsClickingForGuest(true)}>
          Click for guest
        </button>
      )}
      {isHost && isClickingForGuest && (
        <button onClick={() => setIsClickingForGuest(false)}>
          Stop clicking for guest
        </button>
      )}
      {round.winner && hasNextRound && (
        <div>
          <label htmlFor="host-first">
            I'll go first
            <input
              type="radio"
              id="host-first"
              checked={nextMove === 'HOST'}
              onChange={() => pushGameUpdate({ nextMove: 'HOST' })}
            />
          </label>
          <label htmlFor="guest-first">
            {`${guestData.name} can go first`}
            <input
              type="radio"
              id="guest-first"
              checked={nextMove === 'GUEST'}
              onChange={() => pushGameUpdate({ nextMove: 'GUEST' })}
            />
          </label>
          <button onClick={startNextRound}>Next Round</button>
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
  board: state.board,
  score: state.score,
  nextMove: state.nextMove,
  rounds: state.rounds,
  activeRound: state.activeRound,
  activeQuestion: state.activeQuestion,
  hostData: state.hostData,
  guestData: state.guestData,
  levelType: state.levelType,
});

const mapDispatchToProps = {
  // setActiveView: setActiveViewAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(Game);
