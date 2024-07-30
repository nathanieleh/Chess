const chessBoard = document.getElementById('chessBoard');
const startBoard = [64];


const startFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const testFEN = '8/4k3/8/8/4q3/3R4/2K5/1r2R3 b - - 0 5';
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
  let castleBK = '';
  let castleBQ = '';
  let castleWK = '';
  let castleWQ = '';
  let enPassant = '';
  allSquares.forEach(square => {
    let piece = '';
    let squareId = parseInt(square.getAttribute("square-id"));
    if(square.firstChild){
      piece = square.firstChild;
    }
    if(squareId != 0 && squareId % 8 == 0){
      if(emptySquares > 0){
        currFEN += emptySquares.toString();
      }
      currFEN += "/";
      emptySquares = 0;
    }
    if(piece && emptySquares > 0){
      currFEN += emptySquares.toString();
      currFEN += piece.id;
      emptySquares = 0;
    }
    else if(piece){
      currFEN += piece.id;
    }
    else{
      emptySquares++;
    }
    if(piece.id == 'r'){
      if(piece.getAttribute("castle") == "true"
          && document.getElementById('k').getAttribute('castle') == 'true'){
        if(squareId == 0){
          castleBQ += 'q';
        }
        else{
          castleBK += 'k';
        }
      }
    }
    if(piece.id == 'R'){
      if(piece.getAttribute("castle") == "true"
          && document.getElementById('K').getAttribute('castle') == 'true'){
        if(squareId == 63){
          castleWK += 'K';
        }
        else{
          castleWQ += 'Q';
        }
      }
    }
    if(piece.id == 'p'){
      if(piece.getAttribute("enpassant") == "true"){
        enPassant = String.fromCharCode('a'.charCodeAt(0) + (squareId % 8)) + '6';
      }
    }
    if(piece.id == 'P'){
      if(piece.getAttribute("enpassant") == "true"){
        enPassant = String.fromCharCode('a'.charCodeAt(0) + (squareId % 8)) + '3';
      }
    }
  });
  if(emptySquares > 0)
    currFEN += emptySquares.toString();
  if(turn == 'White'){
    currFEN += ' w';
  }
  else{
    currFEN += ' b';
  }
  let castleWhite = castleWK + castleWQ;
  let castleBlack = castleBK + castleBQ;
  currFEN += ' ' + (castleWhite.length + castleBlack.length != 0 ? castleWhite + castleBlack : '-');
  currFEN += ' ' + (enPassant.length != 0 ? enPassant : '-');
  currFEN += ' ' + numHalfMoves + ' ' + parseInt(numMoves / 2);
  return currFEN;
}

/**
 * Creates the chessboard based on the given FEN code.
 * @param {string} FENCode - The FEN code representing the initial state of the chessboard.
 * @param {string} startingBoard - flag to see if createBoard is being used for the start of the game
 */
function createBoard(FENCode, startingBoard) {
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
  let params = FENCode.split(' ');
  if(startingBoard)
    gameStates.push(FENCode);
  if(params[1] == 'w'){
    turn = 'White';
  }
  else{
    turn = 'Black';
  }
  if(params[2].includes('k') || params[2].includes('q')){
    document.getElementById('k').setAttribute('castle', 'true');
    if(params[2].includes('k')){
      document.querySelector('div[square-id="7"]').firstChild.setAttribute('castle', 'true');
    }
    if(params[2].includes('q')){
      document.querySelector('div[square-id="0"]').firstChild.setAttribute('castle', 'true');
    }
  }
  if(params[2].includes('K') || params[2].includes('Q')){
    document.getElementById('K').setAttribute('castle', 'true');
    if(params[2].includes('Q')){
      document.querySelector('div[square-id="56"]').firstChild.setAttribute('castle', 'true');
    }
    if(params[2].includes('K')){
      document.querySelector('div[square-id="63"]').firstChild.setAttribute('castle', 'true');
    }
  }
  if(params[3] != '-'){
    let file = params[3].charAt(0);
    let rank = params[3].charAt(1);
    let fileNumber = file.charCodeAt(0) - 'a'.charCodeAt(0);
    let rankNumber = 8 - parseInt(rank);
    let positionNumber = fileNumber + rankNumber * 8;
    if(turn == 'White')
      document.querySelector(`div[square-id="${positionNumber + 8}"]`).firstChild.setAttribute('enpassant', 'true');
    else
      document.querySelector(`div[square-id="${positionNumber - 8}"]`).firstChild.setAttribute('enpassant', 'true');
  }
  numHalfMoves = parseInt(params[4]);
  numMoves = parseInt(turn == 'White' ? params[5]*2 : params[5]*2 + 1);

}