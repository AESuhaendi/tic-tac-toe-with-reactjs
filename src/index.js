import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

function Square(props) {
  return (
    <button
      className={props.highlight ? 'square highlight' : 'square'}
      onClick={() => props.onClick()}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    const linesWon = this.props.linesWon;
    const highlight = (linesWon && linesWon.includes(i)) ? true : false;

    return <Square
      highlight={highlight}
      key={i}
      value={this.props.squares[i]}
      onClick={() => this.props.onClick(i)}
    />;
  }

  renderBoard(grid) {
    return Array(grid).fill(null).map((val, i) => {
      const contentBoardRow = [];
      const pos = i * grid;
      for (let j = pos; j < pos + grid; j++) {
        contentBoardRow.push(this.renderSquare(j));
      }
      return <div className="board-row" key={i}>{contentBoardRow}</div>;
    });
  }

  render() {
    return (
      <div>
        {this.renderBoard(this.props.grid)}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      stepNumber: 0,
      xIsNext: true,
      isMovesDesc: false,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  handleSortMoves() {
    this.setState({
      isMovesDesc: !this.state.isMovesDesc,
    });
  }

  render() {
    const grid = 3;
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      let col, row;
      if (move) {
        const prev = history[move - 1];
        for (let x = 0; x < step.squares.length; x++) {
          if (step.squares[x] !== prev.squares[x]) {
            const pos = x + 1;
            row = Math.ceil(pos / grid);
            col = (pos % grid) ? (pos % grid) : grid;
          }
        }
      }

      let desc = move ?
        `Go to move #${move} (${col}, ${row})` :
        'Go to game start';

      if (move === this.state.stepNumber) {
        desc = <strong>{desc}</strong>;
      }

      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>
            {desc}
          </button>
        </li>
      );
    });

    let sortMoves = 'Ascending';
    if (this.state.isMovesDesc) {
      sortMoves = 'Descending';
      moves.reverse();
    }

    let status, linesWon;
    if (winner) {
      status = 'Winner: ' + winner.player;
      linesWon = winner.linesWon;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            linesWon={linesWon}
            grid={grid}
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div>
            <button onClick={() => this.handleSortMoves()}>
              {sortMoves}
            </button>
          </div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {player: squares[a], linesWon: lines[i]};
    }
  }
  return null;
}