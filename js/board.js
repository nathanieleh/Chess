const chessBoard = document.getElementById('chessBoard');
const startBoard = [64];


const startFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const testFEN = '1q6/1P6/8/6k1/8/6K1/8/Q7 w KQkq - 0 1';
let currFEN = '';

/**
 * Loads the FEN (Forsyth–Edwards Notation) code into the startBoard array.
 * 
 * @param {string} FENCode - The FEN code representing the chess position.
 */
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

/**
 * Updates the FEN (Forsyth–Edwards Notation) string based on the current state of the chessboard.
 * @returns {string} The updated FEN string.
 */
function updateFEN(){
  currFEN = '';
  let emptySquares = 0;
  let allSquares = document.querySelectorAll("div.square");
  allSquares.forEach(square => {
    let piece = '';
    if(square.firstChild){
      piece = square.firstChild.id;
    }
    if(parseInt(square.getAttribute("square-id")) != 0 && parseInt(square.getAttribute("square-id")) % 8 == 0){
      if(emptySquares > 0){
        currFEN += emptySquares.toString();
      }
      currFEN += "/";
      emptySquares = 0;
    }
    if(piece && emptySquares > 0){
      currFEN += emptySquares.toString();
      currFEN += piece;
      emptySquares = 0;
    }
    else if(piece){
      currFEN += piece;
    }
    else{
      emptySquares++;
    }
  });
  if(emptySquares > 0)
    currFEN += emptySquares.toString();
  return currFEN;
}

/**
 * Creates the chessboard based on the given FEN code.
 * @param {string} FENCode - The FEN code representing the initial state of the chessboard.
 */
function createBoard(FENCode) {
  chessBoard.innerHTML = '';
  loadFEN(FENCode);
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