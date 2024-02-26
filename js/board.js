const chessBoard = document.getElementById('chessBoard');
const startBoard = [64];

const startFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

// interprets the given FENCode to populate the startBoard array with the correct pieces
function loadFEN(FENCode) {
  let row = 0;
  let col = 0;
  for(const c of FENCode){
    // we are done with the FENCode
    if(c == ' ')
      break;
    // indicates a new row
    if(c == '/'){
      col = 0;
      row++;
    }
    // properly populates startBoard with information given by FENCode character
    else {
      if(c >= '0' && c <= '8'){
        for(let i = 0; i < parseInt(c); i++){
          startBoard[row * 8 + col] = '';
          col++;
        }
      }
      else {
        startBoard[row * 8 + col] = pieces.get(c);
        col++;
      }
    }
  }
}

// creates a chess board for the start of the game
function createBoard() {
  loadFEN(startFEN);
  for(let i = 0; i < 64; i++) {
    const square = document.createElement('div');
    square.classList.add('square');
    square.innerHTML = startBoard[i];
    square.setAttribute('square-id', i);
    // calculates the row to see if the row is even or not
    const row = Math.floor((63 - i) / 8) + 1;
    if(row%2==0){
      square.classList.add(i%2==0 ? 'white' : 'lightgreen');
    }
    else {
      square.classList.add(i%2==0 ? 'lightgreen' : 'white');
    }
    chessBoard.append(square);
  }
}