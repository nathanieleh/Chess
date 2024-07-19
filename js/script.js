let FENCode = startFEN;
// let FENCode = testFEN;
let gameStates = [];
let turn = 'White';
let numHalfMoves = 0;
let numMoves = 0;
let historyMove = 0;
let playerWhite = "Player";
let playerBlack = "Player";
let moveDelay = 0;
createBoard(FENCode, true);
document.getElementById('turn').innerHTML = `${turn}'s Turn`;

const openings = [
  { value: startFEN, text: 'New Game' },
  { value: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2', text: 'Sicilian Defense' },
  { value: 'rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', text: 'French Defense' },
  { value: 'rnbqkb1r/pppppp1p/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 1 3', text: 'King\'s Indian Defense' },
  { value: '', text: 'Custom FEN Position'}
];
const dropdown = document.getElementById('myDropdown');
openings.forEach(option => {
  const opt = document.createElement('option');
  opt.value = option.value;
  opt.textContent = option.text;
  dropdown.appendChild(opt);
});
dropdown.addEventListener('change', function() {
  const selectedOption = dropdown.value;
  if(selectedOption == '')
    FENCode = prompt("Enter FEN Code (MAKE SURE IT IS A VALID POSITION):");
  else
    FENCode = selectedOption;
  gameStates = [];
  createBoard(FENCode, true);
  listenOnSquares();
  document.getElementById('numMoves').innerHTML = `Move ${parseInt(numMoves / 2)}`;
  document.getElementById("evaluation").innerHTML = `Evaluation: ${selectedOption == startFEN ? 0 : evaluateBoard(turn).toFixed(2)}`;
});

const playerMoved = new CustomEvent("playerMoved");
const buttonWhite = document.getElementById('buttonWhite');
const buttonBlack = document.getElementById('buttonBlack');
const buttonStart = document.getElementById('buttonStart');
const buttonPrevious = document.getElementById('previous');
const buttonNext = document.getElementById('next');
buttonWhite.innerHTML = `Click to Change White: ${playerWhite}`;
buttonWhite.addEventListener("click", function () {
  playerWhite == "Bot" ? playerWhite = "Player" : playerWhite = "Bot";
  buttonWhite.innerHTML = `Click to Change White: ${playerWhite}`;
});

buttonBlack.innerHTML = `Click to Change Black: ${playerBlack}`;
buttonBlack.addEventListener("click", function () {
  playerBlack == "Bot" ? playerBlack = "Player" : playerBlack = "Bot";
  buttonBlack.innerHTML = `Click to Change Black: ${playerBlack}`;
});

buttonStart.addEventListener("click", function () {
  if(playerWhite == 'Bot' && turn == "White" || playerBlack == 'Bot' && turn == "Black")
    document.dispatchEvent(new Event("playerMoved"));
});

buttonPrevious.addEventListener("click", function () {
  if(historyMove > 0){
    switchTurns();
    historyMove % 2 == 1 ? selfMove.play() : oppMove.play();
    historyMove--;
    createBoard(gameStates[historyMove], false);
    document.getElementById('numMoves').innerHTML = `Move ${parseInt(numMoves / 2)}`;
    document.getElementById("evaluation").innerHTML = `Evaluation: ${historyMove == 0 ? 0 : evaluateBoard(turn).toFixed(2)}`;
  }
});

buttonNext.addEventListener("click", function () {
  if(historyMove < gameStates.length - 1){
    switchTurns();
    historyMove % 2 == 1 ? selfMove.play() : oppMove.play();
    historyMove++;
    createBoard(gameStates[historyMove], false);
    document.getElementById('numMoves').innerHTML = `Move ${parseInt(numMoves / 2)}`;
    document.getElementById("evaluation").innerHTML = `Evaluation: ${evaluateBoard(turn).toFixed(2)}`;
  }
  if(historyMove == gameStates.length - 1)
    listenOnSquares();
});

let selectedPiece;
let allPawns = document.querySelectorAll('.square #p, .square #P');
let allPieces = document.querySelectorAll(".piece");
let allBlack = document.querySelectorAll("div[color='black']");
let allWhite = document.querySelectorAll("div[color='white']");
let allSquares = document.querySelectorAll("div.square");
let gameOver = false;
let moves = [];
let checks = [];
let pinnedPieces = new Array(64).fill([0,0]);
let attackedSquares = new Array(64).fill([0,0,0]);
let defendedPieces = new Array(64).fill(0);
let capture = new Audio('./audio/capture.mp3');
let castle = new Audio('./audio/castle.mp3');
let checkmate = new Audio('./audio/game-end.webm');
let gameStart = new Audio('./audio/game-start.mp3');
let illegalMove = new Audio('./audio/illegal.mp3');
let check = new Audio('./audio/move-check.mp3');
let oppMove = new Audio('./audio/move-opponent.mp3');
let selfMove = new Audio('./audio/move-self.mp3');
let promote = new Audio('./audio/promote.mp3');
let scatter = new Audio('./audio/scatter.mp3');

//! gameStart.play();

/**
 * Makes a move on the chessboard.
 * @param {HTMLElement} piece - The piece being moved.
 * @param {HTMLElement} destination - The destination square where the piece is being moved to.
 * @param {boolean} realMove - Flag to determine if this move was made by the player or the system.
 */
function makeMove(piece, destination, realMove) {
  const pieceType = piece.firstChild.getAttribute("id").toLowerCase();
  const color = piece.firstChild.getAttribute("color");
  const from = parseInt(piece.getAttribute("square-id"));
  const to = parseInt(destination.getAttribute("square-id"));
  let placementHandled = false;
  allPawns = document.querySelectorAll('.square #p, .square #P');
  // handles enpassant for pawns and queen promotion
  if(pieceType == 'p'){
    if(Math.abs(from - to) == 16){
      piece.firstChild.setAttribute("enpassant", 'true');
    }
    if(Math.abs(from - to) != 8){
      if(color == "white"){
        const enPassantPiece = document.querySelector(`[square-id="${to + 8}"]`);
        if(enPassantPiece && enPassantPiece.firstChild &&
          enPassantPiece.firstChild.getAttribute("id") == "p" &&
          enPassantPiece.firstChild.getAttribute("enpassant") == 'true'){
            enPassantPiece.innerHTML = '';
          }
      }
      else {
        const enPassantPiece = document.querySelector(`[square-id="${to - 8}"]`);
        if(enPassantPiece && enPassantPiece.firstChild &&
          enPassantPiece.firstChild.getAttribute("id") == "P" &&
          enPassantPiece.firstChild.getAttribute("enpassant") == 'true'){
            enPassantPiece.innerHTML = '';
          }
      }
    }
    if(Math.floor(to / 8) == 0 || Math.floor(to / 8) == 7){
      color == "white" ? destination.innerHTML = Q : destination.innerHTML = q;
      placementHandled = true;
    }
  }
  // handles castling
  if(pieceType == 'k' && realMove){
    piece.firstChild.setAttribute("castle", 'false');
    // castling king side
    if(from - to == -2){
      const rookFrom = document.querySelector(`[square-id="${to + 1}"]`);
      const rookTo = document.querySelector(`[square-id="${to - 1}"]`);
      color == "white" ? rookTo.innerHTML = R : rookTo.innerHTML = r;
      rookFrom.innerHTML = '';
    }
    // castling queen side
    if(from - to == 2){
      const rookFrom = document.querySelector(`[square-id="${to - 2}"]`);
      const rookTo = document.querySelector(`[square-id="${to + 1}"]`);
      color == "white" ? rookTo.innerHTML = R : rookTo.innerHTML = r;
      rookFrom.innerHTML = '';
    }
  }
  if(pieceType == 'r'){
    piece.firstChild.setAttribute("castle", 'false');
  }
  if(!placementHandled)
    destination.innerHTML = piece.innerHTML;
  piece.innerHTML = '';
  if(realMove){
    allPawns.forEach(pawn => pawn.setAttribute("enpassant", 'false'));
    gameStates.push(updateFEN());
  }
}

/**
 * Calculates the possible moves for a rook on the chessboard.
 * 
 * @param {number} id - The ID of the rook square.
 * @param {string} color - The color of the rook ('white' or 'black').
 */
function rookMoves(id, color){
  let newId = id;
  const row = Math.floor(id / 8);
  const col = id % 8;
  let line = [];
  for(let offset = -1; offset > -8; offset--){
    newId = id + offset;
    if(col + offset >= 0){
      if(allSquares[newId].firstChild?.getAttribute("color") == color) break;
      moves.push(allSquares[newId]);
      line.push(allSquares[newId]);
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k'){
        if(col + offset - 1 >= 0){
          checks.push(newId - 1);
        }
        line.forEach(element => checks.push(element));
        checks.push(allSquares[id]);
      }
      if(allSquares[newId].firstChild){
        break;
      }
    }
  }
  line = [];
  for(let offset = 1; offset < 8; offset++){
    newId = id + offset;
    if(col + offset <= 7){
      if(allSquares[newId].firstChild?.getAttribute("color") == color) break;
      moves.push(allSquares[newId]);
      line.push(allSquares[newId]);
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k'){
        if(col + offset + 1 <= 7){
          checks.push(newId + 1);
        }
        line.forEach(element => checks.push(element));
        checks.push(allSquares[id]);
      }
      if(allSquares[newId].firstChild) break;
    }
  }
  line = [];
  for(let offset = -1; offset > -8; offset--){
    newId = id + offset*8;
    if(row + offset >= 0){
      if(allSquares[newId].firstChild?.getAttribute("color") == color) break;
      moves.push(allSquares[newId]);
      line.push(allSquares[newId]);
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k'){
        if(row + offset - 1 >= 0){
          checks.push(newId - 8);
        }
        line.forEach(element => checks.push(element));
        checks.push(allSquares[id]);
      }
      if(allSquares[newId].firstChild) break;
    }
  }
  line = [];
  for(let offset = 1; offset < 8; offset++){
    newId = id + offset*8;
    if(row + offset <= 7){
      if(allSquares[newId].firstChild?.getAttribute("color") == color) break;
      moves.push(allSquares[newId]);
      line.push(allSquares[newId]);
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k'){
        if(row + offset + 1 <= 7){
          checks.push(newId + 8);
        }
        line.forEach(element => checks.push(element));
        checks.push(allSquares[id]);
      }
      if(allSquares[newId].firstChild) break;
    }
  }
}

/**
 * Calculates the possible attacks by the rook
 * 
 * @param {number} id - The ID of the rook square.
 * @param {string} color - The color of the rook ('white' or 'black').
 */
function rookAttacksDefense(id, color){
  let newId = id;
  const row = Math.floor(id / 8);
  const col = id % 8;
  for(let offset = -1; offset > -8; offset--){
    newId = id + offset;
    if(col + offset >= 0){
      if(allSquares[newId].firstChild?.getAttribute("color") == color){
        defendedPieces[newId] = allSquares[newId];
        break;
      }
      if(allSquares[newId].firstChild){
        color == 'white' ? attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2]] : attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color];
        break;
      }
      color == 'white' ? attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2]] : attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color];
    }
  }
  for(let offset = 1; offset < 8; offset++){
    newId = id + offset;
    if(col + offset <= 7){
      if(allSquares[newId].firstChild?.getAttribute("color") == color){
        defendedPieces[newId] = allSquares[newId];
        break;
      }
      if(allSquares[newId].firstChild){
        color == 'white' ? attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2]] : attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color];
        break;
      }
      color == 'white' ? attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2]] : attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color];
    }
  }
  for(let offset = -1; offset > -8; offset--){
    newId = id + offset*8;
    if(row + offset >= 0){
      if(allSquares[newId].firstChild?.getAttribute("color") == color){
        defendedPieces[newId] = allSquares[newId];
        break;
      }
      if(allSquares[newId].firstChild){
        color == 'white' ? attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2]] : attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color];
        break;
      }
      color == 'white' ? attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2]] : attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color];
    }
  }
  for(let offset = 1; offset < 8; offset++){
    newId = id + offset*8;
    if(row + offset <= 7){
      if(allSquares[newId].firstChild?.getAttribute("color") == color){
        defendedPieces[newId] = allSquares[newId];
        break;
      }
      if(allSquares[newId].firstChild){
        color == 'white' ? attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2]] : attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color];
        break;
      }
      color == 'white' ? attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2]] : attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color];
    }
  }
}

/**
 * Calculates the possible moves for a bishop on the chessboard.
 * 
 * @param {number} id - The ID of the bishop square.
 * @param {string} color - The color of the bishop ('white' or 'black').
 */
function bishopMoves(id, color){
  let newId = id;
  const row = Math.floor(id / 8);
  const col = id % 8;
  let checkLine = [];
  for(let offset = -1; offset > -8; offset--){
    newId = id + offset * 9;
    if(col + offset >= 0 && row + offset >= 0){
      if(allSquares[newId].firstChild?.getAttribute("color") == color) break;
      moves.push(allSquares[newId]);
      checkLine.push(allSquares[newId]);
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k'){
        if(col + offset - 1 >= 0 && row + offset - 1 >= 0){
          checks.push(newId - 9);
        }
        checkLine.forEach(element => checks.push(element));
        checks.push(allSquares[id]);
      }
      if(allSquares[newId].firstChild) break;
    }
  }
  checkLine = [];
  for(let offset = 1; offset < 8; offset++){
    newId = id + offset * 9;
    if(col + offset <= 7 && row + offset <= 7){
      if(allSquares[newId].firstChild?.getAttribute("color") == color) break;
      moves.push(allSquares[newId]);
      checkLine.push(allSquares[newId]);
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k'){
        if(col + offset + 1 <= 7 && row + offset + 1 <= 7){
          checks.push(newId + 9);
        }
        checkLine.forEach(element => checks.push(element));
        checks.push(allSquares[id]);
      }
      if(allSquares[newId].firstChild) break;
    }
  }
  checkLine = [];
  for(let offset = -1; offset > -8; offset--){
    newId = id + offset * 7;
    if(col - offset <= 7 && row + offset >= 0){
      if(allSquares[newId].firstChild?.getAttribute("color") == color) break;
      moves.push(allSquares[newId]);
      checkLine.push(allSquares[newId]);
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k'){
        if(col + offset + 1 <= 7 && row + offset - 1 >= 0){
          checks.push(newId - 7);
        }
        checkLine.forEach(element => checks.push(element));
        checks.push(allSquares[id]);
      }
      if(allSquares[newId].firstChild) break;
    }
  }
  checkLine = [];
  for(let offset = 1; offset < 8; offset++){
    newId = id + offset * 7;
    if(col - offset >= 0 && row + offset <= 7){
      if(allSquares[newId].firstChild?.getAttribute("color") == color) break;
      moves.push(allSquares[newId]);
      checkLine.push(allSquares[newId]);
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k'){
        if(col + offset - 1 >= 0 && row + offset + 1 <= 7){
          checks.push(newId + 7);
        }
        checkLine.forEach(element => checks.push(element));
        checks.push(allSquares[id]);
      }
      if(allSquares[newId].firstChild) break;
    }
  }
}

/**
 * Calculates the possible attacks for a bishop on the chessboard.
 * 
 * @param {number} id - The ID of the bishop square.
 * @param {string} color - The color of the bishop ('white' or 'black').
 */
function bishopAttacksDefense(id, color){
  let newId = id;
  const row = Math.floor(id / 8);
  const col = id % 8;
  for(let offset = -1; offset > -8; offset--){
    newId = id + offset * 9;
    if(col + offset >= 0 && row + offset >= 0){
      if(allSquares[newId].firstChild?.getAttribute("color") == color){
        defendedPieces[newId] = allSquares[newId];
        break;
      }
      if(allSquares[newId].firstChild){
        color == 'white' ? attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2]] : attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color];
        break;
      }
      color == 'white' ? attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2]] : attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color];
    }
  }
  for(let offset = 1; offset < 8; offset++){
    newId = id + offset * 9;
    if(col + offset <= 7 && row + offset <= 7){
      if(allSquares[newId].firstChild?.getAttribute("color") == color){
        defendedPieces[newId] = allSquares[newId];
        break;
      }
      if(allSquares[newId].firstChild){
        color == 'white' ? attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2]] : attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color];
        break;
      }
      color == 'white' ? attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2]] : attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color];
    }
  }
  for(let offset = -1; offset > -8; offset--){
    newId = id + offset * 7;
    if(col - offset <= 7 && row + offset >= 0){
      if(allSquares[newId].firstChild?.getAttribute("color") == color){
        defendedPieces[newId] = allSquares[newId];
        break;
      }
      if(allSquares[newId].firstChild){
        color == 'white' ? attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2]] : attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color];
        break;
      }
      color == 'white' ? attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2]] : attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color];
    }
  }
  for(let offset = 1; offset < 8; offset++){
    newId = id + offset * 7;
    if(col - offset >= 0 && row + offset <= 7){
      if(allSquares[newId].firstChild?.getAttribute("color") == color){
        defendedPieces[newId] = allSquares[newId];
        break;
      }
      if(allSquares[newId].firstChild){
        color == 'white' ? attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2]] : attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color];
        break;
      }
      color == 'white' ? attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2]] : attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color];
    }
  }
}

/**
 * Calculates the possible moves for a knight on a chessboard.
 * @param {number} id - The current position of the knight on the chessboard.
 * @param {string} color - The color of the knight ('white' or 'black').
 */
function knightMoves(id, color){ // -6, -10, -15, -17, 6, 10, 15, 17
  let newId = id;
  const row = Math.floor(id / 8);
  const col = id % 8;
  newId = id - 6;
  if(col + 2 <= 7 && row - 1 >= 0){
    if(allSquares[newId].firstChild?.getAttribute("color") == color){
    }
    else {
      moves.push(allSquares[newId]);
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k'){
        checks.push(allSquares[newId]);
        checks.push(allSquares[id]);
      }
    }
  }
  newId = id - 10;
  if(col - 2 >= 0 && row - 1 >= 0){
    if(allSquares[newId].firstChild?.getAttribute("color") == color){
    }
    else {
      moves.push(allSquares[newId]);
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k'){
        checks.push(allSquares[newId]);
        checks.push(allSquares[id]);
      }
    }
  }
  newId = id - 15;
  if(col + 1 <= 7 && row - 2 >= 0){
    if(allSquares[newId].firstChild?.getAttribute("color") == color){
    }
    else {
      moves.push(allSquares[newId]);
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k'){
        checks.push(allSquares[newId]);
        checks.push(allSquares[id]);
      }
    }
  }
  newId = id - 17;
  if(col - 1 >= 0 && row - 2 >= 0){
    if(allSquares[newId].firstChild?.getAttribute("color") == color){
    }
    else {
      moves.push(allSquares[newId]);
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k'){
        checks.push(allSquares[newId]);
        checks.push(allSquares[id]);
      }
    }
  }
  newId = id + 6;
  if(col - 2 >= 0 && row + 1 <= 7){
    if(allSquares[newId].firstChild?.getAttribute("color") == color){
    }
    else {
      moves.push(allSquares[newId]);
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k'){
        checks.push(allSquares[newId]);
        checks.push(allSquares[id]);
      }
    }
  }
  newId = id + 10;
  if(col + 2 <= 7 && row + 1 <= 7){
    if(allSquares[newId].firstChild?.getAttribute("color") == color){
    }
    else {
      moves.push(allSquares[newId]);
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k'){
        checks.push(allSquares[newId]);
        checks.push(allSquares[id]);
      }
    }
  }
  newId = id + 15;
  if(col - 1 >= 0 && row + 2 <= 7){
    if(allSquares[newId].firstChild?.getAttribute("color") == color){
    }
    else {
      moves.push(allSquares[newId]);
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k'){
        checks.push(allSquares[newId]);
        checks.push(allSquares[id]);
      }
    }
  }
  newId = id + 17;
  if(col + 1 <= 7 && row + 2 <= 7){
    if(allSquares[newId].firstChild?.getAttribute("color") == color){
    }
    else {
      moves.push(allSquares[newId]);
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k'){
        checks.push(allSquares[newId]);
        checks.push(allSquares[id]);
      }
    }
  }
}

/**
 * Calculates the possible attacks for a knight on a chessboard.
 * @param {number} id - The current position of the knight on the chessboard.
 * @param {string} color - The color of the knight ('white' or 'black').
 */
function knightAttacksDefense(id, color){ // -6, -10, -15, -17, 6, 10, 15, 17
  let newId = id;
  const row = Math.floor(id / 8);
  const col = id % 8;
  newId = id - 6;
  if(col + 2 <= 7 && row - 1 >= 0){
    if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = allSquares[newId];
    }
    else
      color == 'white' ? attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2]] : attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color];
  }
  newId = id - 10;
  if(col - 2 >= 0 && row - 1 >= 0){
    if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = allSquares[newId];
    }
    else
      color == 'white' ? attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2]] : attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color];
  }
  newId = id - 15;
  if(col + 1 <= 7 && row - 2 >= 0){
    if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = allSquares[newId];
    }
    else
      color == 'white' ? attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2]] : attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color];
  }
  newId = id - 17;
  if(col - 1 >= 0 && row - 2 >= 0){
    if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = allSquares[newId];
    }
    else
      color == 'white' ? attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2]] : attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color];
  }
  newId = id + 6;
  if(col - 2 >= 0 && row + 1 <= 7){
    if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = allSquares[newId];
    }
    else
      color == 'white' ? attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2]] : attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color];
  }
  newId = id + 10;
  if(col + 2 <= 7 && row + 1 <= 7){
    if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = allSquares[newId];
    }
    else
      color == 'white' ? attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2]] : attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color];
  }
  newId = id + 15;
  if(col - 1 >= 0 && row + 2 <= 7){
    if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = allSquares[newId];
    }
    else
      color == 'white' ? attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2]] : attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color];
  }
  newId = id + 17;
  if(col + 1 <= 7 && row + 2 <= 7){
    if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = allSquares[newId];
    }
    else
      color == 'white' ? attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2]] : attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color];
  }
}

/**
 * Calculates the possible moves for a king piece on the chessboard.
 * 
 * @param {number} id - The ID of the square where the king is located.
 * @param {string} color - The color of the king piece ('white' or 'black').
 */
function kingMoves(id, color){
  let newId = id;
  const row = Math.floor(id / 8);
  const col = id % 8;
  newId = id - 1;
  if(col - 1 >= 0){
    if(!(allSquares[newId].firstChild?.getAttribute("color") == color)){
      if(allSquares[newId].firstChild && defendedPieces[newId] == 0){
        moves.push(allSquares[newId]);
      }
      if(!(allSquares[newId].firstChild || checks.includes(allSquares[newId]) || checks.includes(newId))){
        if(attackedSquares[newId][color == 'white' ? 2 : 1] == 0){
          moves.push(allSquares[newId]);
        }
      }
    }
  }
  newId = id + 1;
  if(col + 1 <= 7){
    if(!(allSquares[newId].firstChild?.getAttribute("color") == color)){
      if(allSquares[newId].firstChild && defendedPieces[newId] == 0){
        moves.push(allSquares[newId]);
      }
      if(!(allSquares[newId].firstChild || checks.includes(allSquares[newId]) || checks.includes(newId))){
        if(attackedSquares[newId][color == 'white' ? 2 : 1] == 0){
          moves.push(allSquares[newId]);
        }
      }
    }
  }
  newId = id - 8;
  if(row - 1 >= 0){
    if(!(allSquares[newId].firstChild?.getAttribute("color") == color)){
      if(allSquares[newId].firstChild && defendedPieces[newId] == 0){
        moves.push(allSquares[newId]);
      }
      if(!(allSquares[newId].firstChild || checks.includes(allSquares[newId]) || checks.includes(newId))){
        if(attackedSquares[newId][color == 'white' ? 2 : 1] == 0){
          moves.push(allSquares[newId]);
        }
      }
    }
  }
  newId = id + 8;
  if(row + 1 <= 7){
    if(!(allSquares[newId].firstChild?.getAttribute("color") == color)){
      if(allSquares[newId].firstChild && defendedPieces[newId] == 0){
        moves.push(allSquares[newId]);
      }
      if(!(allSquares[newId].firstChild || checks.includes(allSquares[newId]) || checks.includes(newId))){
        if(attackedSquares[newId][color == 'white' ? 2 : 1] == 0){
          moves.push(allSquares[newId]);
        }
      }
    }
  }
  newId = id + 9;
  if(col + 1 <= 7 && row + 1 <= 7){
    if(!(allSquares[newId].firstChild?.getAttribute("color") == color)){
      if(allSquares[newId].firstChild && defendedPieces[newId] == 0){
        moves.push(allSquares[newId]);
      }
      if(!(allSquares[newId].firstChild || checks.includes(allSquares[newId]) || checks.includes(newId))){
        if(attackedSquares[newId][color == 'white' ? 2 : 1] == 0){
          moves.push(allSquares[newId]);
        }
      }
    }
  }
  newId = id + 7;
  if(col - 1 >= 0 && row + 1 <= 7){
    if(!(allSquares[newId].firstChild?.getAttribute("color") == color)){
      if(allSquares[newId].firstChild && defendedPieces[newId] == 0){
        moves.push(allSquares[newId]);
      }
      if(!(allSquares[newId].firstChild || checks.includes(allSquares[newId]) || checks.includes(newId))){
        if(attackedSquares[newId][color == 'white' ? 2 : 1] == 0){
          moves.push(allSquares[newId]);
        }
      }
    }
  }
  newId = id - 7;
  if(col + 1 <= 7 && row - 1 >= 0){
    if(!(allSquares[newId].firstChild?.getAttribute("color") == color)){
      if(allSquares[newId].firstChild && defendedPieces[newId] == 0){
        moves.push(allSquares[newId]);
      }
      if(!(allSquares[newId].firstChild || checks.includes(allSquares[newId]) || checks.includes(newId))){
        if(attackedSquares[newId][color == 'white' ? 2 : 1] == 0){
          moves.push(allSquares[newId]);
        }
      }
    }
  }
  newId = id - 9;
  if(col - 1 >= 0 && row - 1 >= 0){
    if(!(allSquares[newId].firstChild?.getAttribute("color") == color)){
      if(allSquares[newId].firstChild && defendedPieces[newId] == 0){
        moves.push(allSquares[newId]);
      }
      if(!(allSquares[newId].firstChild || checks.includes(allSquares[newId]) || checks.includes(newId))){
        if(attackedSquares[newId][color == 'white' ? 2 : 1] == 0){
          moves.push(allSquares[newId]);
        }
      }
    }
  }
  // checks if castling is possible
  if(allSquares[id]?.firstChild?.getAttribute("castle") == 'true' && !checks.includes(allSquares[id])){
    if(allSquares[id + 3].firstChild?.getAttribute("castle") == 'true' && !allSquares[id + 1].firstChild && !allSquares[id + 2].firstChild){
      if(attackedSquares[id][color == 'white' ? 2 : 1] == 0 &&
          attackedSquares[id + 1][color == 'white' ? 2 : 1] == 0 &&
          attackedSquares[id + 2][color == 'white' ? 2 : 1] == 0){
        moves.push(allSquares[id + 2]);
      }
    }
    if(allSquares[id - 4].firstChild?.getAttribute("castle") == 'true' && !allSquares[id - 1].firstChild && !allSquares[id - 2].firstChild && !allSquares[id - 3].firstChild){
      if(attackedSquares[id][color == 'white' ? 2 : 1] == 0 &&
          attackedSquares[id - 1][color == 'white' ? 2 : 1] == 0 &&
          attackedSquares[id - 2][color == 'white' ? 2 : 1] == 0){
        moves.push(allSquares[id - 2]);
      }
    }
  }
}

/**
 * Calculates the possible attacks for a king piece on the chessboard.
 * 
 * @param {number} id - The ID of the square where the king is located.
 * @param {string} color - The color of the king piece ('white' or 'black').
 */
function kingAttacksDefense(id, color){
  let newId = id;
  const row = Math.floor(id / 8);
  const col = id % 8;
  newId = id - 1;
  if(col - 1 >= 0){
    if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = allSquares[newId];
    }
    else
      color == 'white' ? attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2]] : attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color];
  }
  newId = id + 1;
  if(col + 1 <= 7){
    if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = allSquares[newId];
    }
    else
      color == 'white' ? attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2]] : attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color];
  }
  newId = id - 8;
  if(row - 1 >= 0){
    if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = allSquares[newId];
    }
    else
      color == 'white' ? attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2]] : attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color];
  }
  newId = id + 8;
  if(row + 1 <= 7){
    if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = allSquares[newId];
    }
    else
      color == 'white' ? attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2]] : attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color];
  }
  newId = id + 9;
  if(col + 1 <= 7 && row + 1 <= 7){
    if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = allSquares[newId];
    }
    else
      color == 'white' ? attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2]] : attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color];
  }
  newId = id + 7;
  if(col - 1 >= 0 && row + 1 <= 7){
    if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = allSquares[newId];
    }
    else
      color == 'white' ? attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2]] : attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color];
  }
  newId = id - 7;
  if(col + 1 <= 7 && row - 1 >= 0){
    if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = allSquares[newId];
    }
    else
      color == 'white' ? attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2]] : attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color];
  }
  newId = id - 9;
  if(col - 1 >= 0 && row - 1 >= 0){
    if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = allSquares[newId];
    }
    else
      color == 'white' ? attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2]] : attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color];
  }
}

/**
 * Calculates the possible moves for a pawn on the chessboard.
 * 
 * @param {number} id - The ID of the pawn.
 * @param {string} color - The color of the pawn ('white' or 'black').
 */
function pawnMoves(id, color){
  let newId = id;
  const row = Math.floor(id / 8);
  const col = id % 8;
  switch(color) {
    case "white":
      // focuses on whether the pawn can move two spaces or not
      if (row == 6) {
        for(let i = 1; i < 3; i++) {
          newId = id - i * 8;
          if(!allSquares[newId].firstChild){
            moves.push(allSquares[newId]);
          }
          else {
            break;
          }
        }
      }
      else {
        newId = id - 8;
          if(!allSquares[newId].firstChild){
            moves.push(allSquares[newId]);
          }
      }
      // checks if there is a piece on its diagonals or en passant
      newId = id - 7;
      if(col + 1 <= 7 && allSquares[newId].firstChild && allSquares[newId].firstChild.getAttribute("color") != color ||
        col + 1 <= 7 && allSquares[id + 1].firstChild?.getAttribute("id").toLowerCase() == 'p' &&
        allSquares[id + 1].firstChild.getAttribute("enpassant") == 'true' &&
        allSquares[id + 1].firstChild.getAttribute("color") != color){
          moves.push(allSquares[newId]);
          if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k'){
            checks.push(allSquares[newId]);
            checks.push(allSquares[id]);
          }
      }
      newId = id - 9;
      if(col - 1 >= 0 && allSquares[newId].firstChild && allSquares[newId].firstChild.getAttribute("color") != color ||
        col - 1 >= 0 && allSquares[id - 1].firstChild?.getAttribute("id").toLowerCase() == 'p' &&
        allSquares[id - 1].firstChild.getAttribute("enpassant") == 'true' &&
        allSquares[id - 1].firstChild.getAttribute("color") != color){
          moves.push(allSquares[newId]);
          if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k'){
            checks.push(allSquares[newId]);
            checks.push(allSquares[id]);
          }
      }
      break;
    case "black":
      if (row == 1) {
        for(let i = 1; i < 3; i++) {
          newId = id + i * 8;
          if(!allSquares[newId].firstChild){
            moves.push(allSquares[newId]);
          }
          else {
            break;
          }
        }
      }
      else {
        newId = id + 8;
          if(!allSquares[newId].firstChild){
            moves.push(allSquares[newId]);
          }
      }
      // checks if there is a piece on its diagonals or en passant
      newId = id + 7;
      if(col - 1 >= 0 && allSquares[newId].firstChild && allSquares[newId].firstChild.getAttribute("color") != color ||
        col - 1 >= 0 && allSquares[id - 1].firstChild?.getAttribute("id").toLowerCase() == 'p' &&
        allSquares[id - 1].firstChild.getAttribute("enpassant") == 'true' &&
        allSquares[id - 1].firstChild.getAttribute("color") != color){
          moves.push(allSquares[newId]);
          if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k'){
            checks.push(allSquares[newId]);
            checks.push(allSquares[id]);
          }
      }
      newId = id + 9;
      if(col + 1 <= 7 && allSquares[newId].firstChild && allSquares[newId].firstChild.getAttribute("color") != color ||
        col + 1 <= 7 && allSquares[id + 1].firstChild?.getAttribute("id").toLowerCase() == 'p' &&
        allSquares[id + 1].firstChild.getAttribute("enpassant") == 'true' &&
        allSquares[id + 1].firstChild.getAttribute("color") != color){
          moves.push(allSquares[newId]);
          if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k'){
            checks.push(allSquares[newId]);
            checks.push(allSquares[id]);
          }
      }
      break;
  }
}

/**
 * Calculates the possible attacks for a pawn on the chessboard.
 * 
 * @param {number} id - The ID of the pawn.
 * @param {string} color - The color of the pawn ('white' or 'black').
 */
function pawnAttacksDefense(id, color){
  let newId = id;
  const row = Math.floor(id / 8);
  const col = id % 8;
  switch(color) {
    case "white":
      // checks if there is a piece on its diagonals or en passant
      newId = id - 7;
      if(col + 1 <= 7){
        attackedSquares[newId] = [allSquares[newId], color, allSquares[newId][2]];
      }
      else if(col + 1 <= 7 && allSquares[newId].firstChild &&
        allSquares[newId].firstChild.getAttribute("color") == color){
        defendedPieces[newId] = allSquares[newId];
      }
      if(col + 1 <= 7 && allSquares[id + 1].firstChild?.getAttribute("id").toLowerCase() == 'p' &&
        allSquares[id + 1].firstChild.getAttribute("enpassant") == 'true' &&
        allSquares[id + 1].firstChild.getAttribute("color") != color){
          attackedSquares[id + 1] = [allSquares[id + 1], color, allSquares[id + 1][2]];
      }
      newId = id - 9;
      if(col - 1 >= 0){
        attackedSquares[newId] = [allSquares[newId], color, allSquares[newId][2]];
      }
      else if(col - 1 >= 0 && allSquares[newId].firstChild &&
        allSquares[newId].firstChild.getAttribute("color") == color){
        defendedPieces[newId] = allSquares[newId];
      }
      if(col - 1 >= 0 && allSquares[id - 1].firstChild?.getAttribute("id").toLowerCase() == 'p' &&
        allSquares[id - 1].firstChild.getAttribute("enpassant") == 'true' &&
        allSquares[id - 1].firstChild.getAttribute("color") != color){
          attackedSquares[id - 1] = [allSquares[id - 1], color, allSquares[id - 1][2]];
      }
      break;
    case "black":
      // checks if there is a piece on its diagonals or en passant
      newId = id + 7;
      if(col - 1 >= 0){
        attackedSquares[newId] = [allSquares[newId], allSquares[newId][1], color];
      }
      else if(col - 1 >= 0 && allSquares[newId].firstChild &&
        allSquares[newId].firstChild.getAttribute("color") == color){
        defendedPieces[newId] = allSquares[newId];
      }
      if(col - 1 >= 0 && allSquares[id - 1].firstChild?.getAttribute("id").toLowerCase() == 'p' &&
        allSquares[id - 1].firstChild.getAttribute("enpassant") == 'true' &&
        allSquares[id - 1].firstChild.getAttribute("color") != color){
          attackedSquares[id - 1] = [allSquares[id - 1], allSquares[id - 1][1], color];
      }
      newId = id + 9;
      if(col + 1 <= 7){
        attackedSquares[newId] = [allSquares[newId], allSquares[newId][1], color];
      }
      else if(col + 1 <= 7 && allSquares[newId].firstChild &&
        allSquares[newId].firstChild.getAttribute("color") == color){
        defendedPieces[newId] = allSquares[newId];
      }
      if(col + 1 <= 7 && allSquares[id + 1].firstChild?.getAttribute("id").toLowerCase() == 'p' &&
        allSquares[id + 1].firstChild.getAttribute("enpassant") == 'true' &&
        allSquares[id + 1].firstChild.getAttribute("color") != color){
          attackedSquares[id + 1] = [allSquares[id + 1], allSquares[id + 1][1], color];
      }
      break;
  }
}

/**
 * Calculates the possible moves for a selected chess piece.
 * @param {HTMLElement} selectedPiece - The selected chess piece.
 * @returns {Array} - An array of possible moves for the selected piece.
 */
function calculateMoves(selectedPiece) {
  moves = [];
  if(!selectedPiece)
    return [];
  let pieceType = selectedPiece.firstChild?.getAttribute("id").toLowerCase();
  let color = selectedPiece.firstChild?.getAttribute("color");
  let id = parseInt(selectedPiece.getAttribute("square-id"));
  // based on the piece type, add the proper moves for that piece to moves
  switch (pieceType) {
    case "r":
      rookMoves(id, color);
      break;
    case "b":
      bishopMoves(id, color);
      break;
    case "q":
      rookMoves(id, color);
      bishopMoves(id, color);
      break;
    case "n":
      knightMoves(id, color);
      break;
    case "k":
      calculateAttacksDefense();
      kingMoves(id, color);
      break;
    case "p":
      pawnMoves(id, color);
      break;
  }
  return moves;
}

/**
 * Calculates the pinned pieces on the chessboard
 */
function calculatePins(){
  pinnedPieces = new Array(64).fill([0,0]);
  allPieces = document.querySelectorAll(".piece");
  allPieces.forEach(piece => {
    let id = parseInt(piece.parentNode.getAttribute("square-id"));
    let pieceType = piece.getAttribute("id").toLowerCase();
    let color = piece.getAttribute("color");
    switch (pieceType) {
      case "r":
        rookPins(id, color);
        break;
      case "b":
        bishopPins(id, color);
        break;
      case "q":
        rookPins(id, color);
        bishopPins(id, color);
    }
  });
}

/**
 * Calculates attacked pieces on the chessboard
 */
function calculateAttacksDefense(){
  attackedSquares = new Array(64).fill([0,0,0]);
  defendedPieces = new Array(64).fill(0);
  allPieces = document.querySelectorAll(".piece");
  allPieces.forEach(piece => {
    let id = parseInt(piece.parentNode.getAttribute("square-id"));
    let pieceType = piece.getAttribute("id").toLowerCase();
    let color = piece.getAttribute("color");
    switch (pieceType) {
      case "r":
        rookAttacksDefense(id, color);
        break;
      case "b":
        bishopAttacksDefense(id, color);
        break;
      case "q":
        rookAttacksDefense(id, color);
        bishopAttacksDefense(id, color);
        break;
      case "n":
        knightAttacksDefense(id, color);
        break;
      case "k":
        kingAttacksDefense(id, color);
        break;
      case "p":
        pawnAttacksDefense(id, color);
        break;
    }
  });
}

/**
 * Calculates the pinned pieces from a bishop on the chessboard.
 * 
 * @param {number} id - The ID of the square where the bishop is located.
 * @param {string} color - The color of the bishop piece ('white' or 'black').
 */
function bishopPins(id, color){
  let pinLine = [];
  let pinned = -1;
  const row = Math.floor(id / 8);
  const col = id % 8;
  let newId = 0;
  for(let offset = -1; offset > -8; offset--){
    newId = id + offset * 9;
    if(col + offset >= 0 && row + offset >= 0){
      if(allSquares[newId].firstChild?.getAttribute("color") == color) break;
      if(pinned == -1){
        pinLine.push(newId);
      }
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k' && pinned != -1){
        pinLine.forEach(element => {
          if(element != pinned)
            pinnedPieces[element] = [allSquares[element], 0];
          else
            pinnedPieces[element] = [allSquares[element], pinnedPieces[element][1] + 1];
        });
        pinnedPieces[id] = [allSquares[id], 0];
      }
      else if(allSquares[newId].firstChild && pinned != -1)
          break;
      if(allSquares[newId].firstChild &&
        pinned == -1)
          pinned = newId;
    }
  }
  pinLine = [];
  pinned = -1;
  for(let offset = 1; offset < 8; offset++){
    newId = id + offset * 9;
    if(col + offset <= 7 && row + offset <= 7){
      if(allSquares[newId].firstChild?.getAttribute("color") == color) break;
      if(pinned == -1){
        pinLine.push(newId);
      }
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k' && pinned != -1){
        pinLine.forEach(element => {
          if(element != pinned)
            pinnedPieces[element] = [allSquares[element], 0];
          else
            pinnedPieces[element] = [allSquares[element], pinnedPieces[element][1] + 1];
        });
        pinnedPieces[id] = [allSquares[id], 0];
      }
      else if(allSquares[newId].firstChild && pinned != -1)
          break;
      if(allSquares[newId].firstChild &&
        pinned == -1)
          pinned = newId;
    }
  }
  pinLine = [];
  pinned = -1;
  for(let offset = -1; offset > -8; offset--){
    newId = id + offset * 7;
    if(col - offset <= 7 && row + offset >= 0){
      if(allSquares[newId].firstChild?.getAttribute("color") == color) break;
      if(pinned == -1){
        pinLine.push(newId);
      }
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k' && pinned != -1){
        pinLine.forEach(element => {
          if(element != pinned)
            pinnedPieces[element] = [allSquares[element], 0];
          else
            pinnedPieces[element] = [allSquares[element], pinnedPieces[element][1] + 1];
        });
        pinnedPieces[id] = [allSquares[id], 0];
      }
      else if(allSquares[newId].firstChild && pinned != -1)
          break;
      if(allSquares[newId].firstChild &&
        pinned == -1)
          pinned = newId;
    }
  }
  pinLine = [];
  pinned = -1;
  for(let offset = 1; offset < 8; offset++){
    newId = id + offset * 7;
    if(col - offset >= 0 && row + offset <= 7){
      if(allSquares[newId].firstChild?.getAttribute("color") == color) break;
      if(pinned == -1){
        pinLine.push(newId);
      }
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k' && pinned != -1){
        pinLine.forEach(element => {
          if(element != pinned)
            pinnedPieces[element] = [allSquares[element], 0];
          else
            pinnedPieces[element] = [allSquares[element], pinnedPieces[element][1] + 1];
        });
        pinnedPieces[id] = [allSquares[id], 0];
      }
      else if(allSquares[newId].firstChild && pinned != -1)
          break;
      if(allSquares[newId].firstChild &&
        pinned == -1)
          pinned = newId;
    }
  }
}

/**
 * Calculates the pinned pieces from a rook on the chessboard.
 * 
 * @param {number} id - The ID of the square where the rook is located.
 * @param {string} color - The color of the rook piece ('white' or 'black').
 */
function rookPins(id, color){
  let pinLine = [];
  let pinned = -1;
  const row = Math.floor(id / 8);
  const col = id % 8;
  let newId = 0;
  for(let offset = -1; offset > -8; offset--){
    newId = id + offset;
    if(col + offset >= 0){
      if(allSquares[newId].firstChild?.getAttribute("color") == color) break;
      if(pinned == -1){
        pinLine.push(newId);
      }
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k' && pinned != -1){
        pinLine.forEach(element => {
          if(element != pinned)
            pinnedPieces[element] = [allSquares[element], 0];
          else
            pinnedPieces[element] = [allSquares[element], pinnedPieces[element][1] + 1];
        });
        pinnedPieces[id] = [allSquares[id], 0];
      }
      else if(allSquares[newId].firstChild && pinned != -1)
          break;
      if(allSquares[newId].firstChild &&
        pinned == -1)
          pinned = newId;
    }
  }
  pinLine = [];
  pinned = -1;
  for(let offset = 1; offset < 8; offset++){
    newId = id + offset;
    if(col + offset <= 7){
      if(allSquares[newId].firstChild?.getAttribute("color") == color) break;
      if(pinned == -1){
        pinLine.push(newId);
      }
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k' && pinned != -1){
        pinLine.forEach(element => {
          if(element != pinned)
            pinnedPieces[element] = [allSquares[element], 0];
          else
            pinnedPieces[element] = [allSquares[element], pinnedPieces[element][1] + 1];
        });
        pinnedPieces[id] = [allSquares[id], 0];
      }
      else if(allSquares[newId].firstChild && pinned != -1)
          break;
      if(allSquares[newId].firstChild &&
        pinned == -1)
          pinned = newId;
    }
  }
  pinLine = [];
  pinned = -1;
  for(let offset = -1; offset > -8; offset--){
    newId = id + offset*8;
    if(row + offset >= 0){
      if(allSquares[newId].firstChild?.getAttribute("color") == color) break;
      if(pinned == -1){
        pinLine.push(newId);
      }
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k' && pinned != -1){
        pinLine.forEach(element => {
          if(element != pinned)
            pinnedPieces[element] = [allSquares[element], 0];
          else
            pinnedPieces[element] = [allSquares[element], pinnedPieces[element][1] + 1];
        });
        pinnedPieces[id] = [allSquares[id], 0];
      }
      else if(allSquares[newId].firstChild && pinned != -1)
          break;
      if(allSquares[newId].firstChild &&
        pinned == -1)
          pinned = newId;
    }
  }
  pinLine = [];
  pinned = -1;
  for(let offset = 1; offset < 8; offset++){
    newId = id + offset*8;
    if(row + offset <= 7){
      if(allSquares[newId].firstChild?.getAttribute("color") == color) break;
      if(pinned == -1){
        pinLine.push(newId);
      }
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k' && pinned != -1){
        pinLine.forEach(element => {
          if(element != pinned)
            pinnedPieces[element] = [allSquares[element], 0];
          else
            pinnedPieces[element] = [allSquares[element], pinnedPieces[element][1] + 1];
        });
        pinnedPieces[id] = [allSquares[id], 0];
      }
      else if(allSquares[newId].firstChild && pinned != -1)
          break;
      if(allSquares[newId].firstChild &&
        pinned == -1)
          pinned = newId;
    }
  }
}

/**
 * Changes the background color of each square in the moves array to crimson.
 */
function colorMoves() {
  moves.forEach(square => {
    square.style.backgroundColor = 'crimson';
  });
}

/**
 * Switches the turns between 'White' and 'Black' and updates the turn display.
 */
function switchTurns() {
  if (turn === 'White') {
    turn = 'Black';
  } else {
    turn = 'White';
  }
  document.getElementById('turn').innerHTML = `${turn}'s Turn`;
}

/**
 * Calculates the checks in the chess game.
 * @returns {string} - The color(s) of the checked player(s).
 */
function calculateChecks() {
  allPieces = document.querySelectorAll(".piece");
  checks = [];
  allPieces.forEach(piece => {
    calculateMoves(piece.parentNode);
  });
}

//! might need to modify
/**
 * Checks if the current game state is a checkmate.
 * @returns {boolean} Returns true if the game state is a checkmate, false otherwise.
 */
function checkForCheckMate(){
  let possibleMoves = [];
  possibleMoves = calculateColorMoves(turn);
  return possibleMoves.length == 0;
}

/**
 * Chooses a move for the bot player.
 * @param {string} botColor - the turn which tells which color the bot needs to choose the move for
 * @returns {Object} The move object containing the piece and destination.
 */
function makeBotMove(botColor) {
  let allMoves = [];
  let bestMove = {};
  let bestMinOppScore = Infinity;
  allMoves = calculateColorMoves(botColor);

  // all possible moves have been calculated for the bot's position
  // now sift through all future moves and find the best result
  for (let i = 0; i < allMoves.length; i++) {
    const move = allMoves[i];
    let piece = document.querySelector(`[square-id="${move.piece}"]`);
    let destination = document.querySelector(`[square-id="${move.destination}"]`);
    let possiblePosition = '';
    switchTurns();
    makeMove(piece, destination, true);
    possiblePosition = updateFEN();
    console.log(move, possiblePosition, turn);
    let oppScore = searchMoves(1, -Infinity, Infinity);
    gameStates.pop();
    createBoard(gameStates[gameStates.length - 1], false);
    listenOnSquares();
    if (oppScore < bestMinOppScore) {
      bestMinOppScore = oppScore;
      bestMove = move;
    }
  }
  console.log(bestMove, gameStates);
  return bestMove;
}


/**
 * Searches for the best score using the minimax algorithm with alpha-beta pruning.
 * @param {number} depth - The depth of the search tree.
 * @param {number} alpha - The alpha value for alpha-beta pruning.
 * @param {number} beta - The beta value for alpha-beta pruning.
 * @returns {number} - The best score found.
 */
function searchMoves(depth, alpha, beta){
  let allMoves = [];
  let score = 0;
  if(depth == 0){
    return evaluateBoard(turn);
  }
  allMoves = calculateColorMoves(turn);
  for(let i = 0; i < allMoves.length; i++){
    let move = allMoves[i];
    let piece = document.querySelector(`[square-id="${move.piece}"]`);
    let destination = document.querySelector(`[square-id="${move.destination}"]`);
    switchTurns();
    makeMove(piece, destination, true);
    console.log(move);
    score = -searchMoves(depth - 1, -beta, -alpha);
    gameStates.pop();
    createBoard(gameStates[gameStates.length - 1], false);
    listenOnSquares();
    if(score >= beta){
      console.log("snip");
      return beta;
    }
    if(score > alpha){
      alpha = score;
    }
  }
  return alpha;
}

/**
 * Calculates all possible moves for the given color
 * @param color - the color of the pieces to calculate
 * 
 * @returns a list of all possible moves for the color
 */
function calculateColorMoves(color){
  let allMoves = [];
  let allColorPieces = document.querySelectorAll(`div[color='${color.toLowerCase()}']`);
  calculatePins();
  allColorPieces.forEach(piece => {
    if(piece.id.toLowerCase() != 'k'){
      let moves = calculateMoves(piece.parentNode);
      if(pinnedPieces[parseInt(piece.parentNode.getAttribute('square-id'))][1] != 0){
        moves = moves.filter(move => pinnedPieces.map(pair => pair[0]).includes(move));
      }
      moves.forEach(move => {
        if(checks.length > 0){
          if(checks.includes(move)){
            allMoves.push({piece: piece.parentNode.getAttribute("square-id"), destination: move.getAttribute("square-id")});
          }
        }
        else{
          allMoves.push({piece: piece.parentNode.getAttribute("square-id"), destination: move.getAttribute("square-id")});
        }
      });
    }
  });
  let kingPiece = '';
  color.toLowerCase() == 'white' ? kingPiece = 'K' : kingPiece = 'k';
  let kingMoves = calculateMoves(document.getElementById(kingPiece).parentNode);
  let kingPosition = document.getElementById(kingPiece).parentNode.getAttribute("square-id");
  kingMoves.forEach(move => {
    allMoves.push({piece: kingPosition, destination: move.getAttribute("square-id")});
  });
  return allMoves;
}

/**
 * Calculates the evaluation of the current board for the bot to consider
 * @param color determines whether or not the evaluation should be for the white player or black player
 * 
 * @returns the score of the current position
 */
function evaluateBoard(color){
  let playerPerspective = 1;
  if(color.toLowerCase() == 'black')
    playerPerspective = -1;
  let score = countPieceVal('white') - countPieceVal('black');
  calculateAttacksDefense();
  for(let i = 0; i < attackedSquares.length; i++){
    if(attackedSquares[i][0] != 0 && attackedSquares[i][0].innerHTML != '' && defendedPieces[i] == 0){
      let attackedPieceCol = attackedSquares[i][0].firstChild.getAttribute('color');
      let pieceType = attackedSquares[i][0].firstChild.id.toLowerCase();
      switch(pieceType){
        case 'p':
          if(attackedPieceCol == "white")
            score -= 1;
          else if(attackedPieceCol == 'black')
            score += 1;
          break;
        case 'r':
          if(attackedPieceCol == "white")
            score -= 5;
          else if(attackedPieceCol == 'black')
            score += 5;
          break;
        case 'n':
          if(attackedPieceCol == "white")
            score -= 3;
          else if(attackedPieceCol == 'black')
            score += 3;
          break;
        case 'b':
          if(attackedPieceCol == "white")
            score -= 3;
          else if(attackedPieceCol == 'black')
            score += 3;
          break;
        case 'q':
          if(attackedPieceCol == "white")
            score -= 9;
          else if(attackedPieceCol == 'black')
            score += 9;
        case 'k': 
          if(attackedPieceCol == "white")
            score -= 5;
          else if(attackedPieceCol == 'black')
            score += 5;
          break;
      }
    }
  }
  return score * playerPerspective;
}


/**
 * Calculates the total value of pieces for a given color.
 * @param {string} color - The color of the pieces ('black' or 'white').
 * @returns {number} - The total value of the pieces.
 */
function countPieceVal(color){
  let score = 0;
  if(color.toLowerCase() == 'black'){
    allBlack = document.querySelectorAll("div[color='black']");
    allBlack.forEach(piece => {
      switch(piece.id){
        case 'p':
          score += 1;
          const row = Math.floor(parseInt(piece.parentNode.getAttribute('square-id')) / 8);
          score += row * .1;
          break;
        case 'r':
          score += 5;
          break;
        case 'n':
          score += 3;
          break;
        case 'b':
          score += 3;
          break;
        case 'q':
          score += 9;
          break;
      }
      let moves = calculateMoves(piece.parentNode);
      if(pinnedPieces[parseInt(piece.parentNode.getAttribute('square-id'))][1] != 0){
        moves = moves.filter(move => pinnedPieces.map(pair => pair[0]).includes(move));
      }
      score += moves.length * 0.1;
    });
  }
  else {
    allWhite = document.querySelectorAll("div[color='white']");
    allWhite.forEach(piece => {
      switch(piece.id.toLowerCase()){
        case 'p':
          score += 1;
          const row = Math.floor(parseInt(piece.parentNode.getAttribute('square-id')) / 8);
          score += (8 - row) * .1;
          break;
        case 'r':
          score += 5;
          break;
        case 'n':
          score += 3;
          break;
        case 'b':
          score += 3;
          break;
        case 'q':
          score += 9;
          break;
      }
      let moves = calculateMoves(piece.parentNode);
      if(pinnedPieces[parseInt(piece.parentNode.getAttribute('square-id'))][1] != 0){
        moves = moves.filter(move => pinnedPieces.map(pair => pair[0]).includes(move));
      }
      score += moves.length * 0.1;
    });
  }
  return score;
}


/**
 * Listens for click events on the chess squares and handles the logic for selecting and moving pieces.
 */
function listenOnSquares() {
  let draw = false;
  allSquares = document.querySelectorAll("div.square");
  allSquares.forEach(square => {
    square.addEventListener("click", function (e) {
      let destination = e.target;
      let teamInCheck = false;
      let pieces = allPieces.length;
      // no piece has been selected yet, so select this one and show possible moves
      if(!selectedPiece && !gameOver){
        selectedPiece = e.target;
        if(selectedPiece.innerHTML == ''){
          selectedPiece = '';
          return;
        }
        selectedPiece.style.backgroundColor='deepskyblue';
        calculateChecks();
        checks.forEach(position => {
          if(position == document.getElementById(turn == 'White' ? 'K' : 'k').parentNode)
            teamInCheck = true;
        });
        calculatePins();
        calculateMoves(selectedPiece);
        if(checks.length != 0 && teamInCheck && selectedPiece?.firstChild?.id.toLowerCase() != 'k'){
          moves = moves.filter(move => checks.includes(move));
        }
        if(pinnedPieces[parseInt(selectedPiece.getAttribute('square-id'))][0] != 0 &&
            pinnedPieces[parseInt(selectedPiece.getAttribute('square-id'))][1] != 0){
          moves = moves.filter(move => pinnedPieces.map(pair => pair[0])[parseInt(move.getAttribute('square-id'))] != 0);
        }
        colorMoves();
      }
      // there is already a selected piece, so check if the move the player makes is valid
      else if(!gameOver){
        selectedPiece.style.backgroundColor = '';
        if(moves.includes(destination)){
          numHalfMoves++;
          numMoves++;
          historyMove++;
          const color = selectedPiece.firstChild.getAttribute("color");
          if(color == turn.toLowerCase()){
            if(selectedPiece.firstChild.id.toLowerCase() == 'p' || destination.firstChild)
              numHalfMoves = 0;
            switchTurns();
            makeMove(selectedPiece, destination, true);
            calculateChecks();
            gameOver = checkForCheckMate();
            if(checks.length > 0 && gameOver){
              switchTurns();
              checkmate.play();
            }
            else if(gameOver || numHalfMoves == 100){
              scatter.play();
              draw = true;
            }
            else if(checks.length > 0){
              check.play();
            }
            else if(pieces != allPieces.length){
              capture.play();
            }
            else
              color == 'white' ? selfMove.play() : oppMove.play();
            if(!gameOver){
              if(playerWhite == 'Bot' && turn == "White" || playerBlack == 'Bot' && turn == "Black")
                setTimeout(function() {document.dispatchEvent(new Event("playerMoved"))}, moveDelay);
              document.getElementById('numMoves').innerHTML = `Move ${parseInt(numMoves / 2)}`;
              document.getElementById("evaluation").innerHTML = `Evaluation: ${evaluateBoard(turn).toFixed(2)}`;
            }
          }
        }
        allSquares.forEach(square => {
          square.style.backgroundColor = '';
        });
        moves = [];
        selectedPiece = '';
        if(draw){
          document.getElementById('turn').innerHTML = `It's a Draw!`;
          document.getElementById('turn').style.fontSize = '30px';
          setTimeout(function() {alert(`It's a Draw!`)}, 100);
        }
        if(!draw && gameOver){
          document.getElementById('turn').innerHTML = `${turn} Wins!`;
          document.getElementById('turn').style.fontSize = '30px';
          setTimeout(function() {alert(`${turn} wins!`)}, 100);
        }
      }
    });
  });
}
listenOnSquares();

/**
 * Calculates and makes the move for the bot
 */
document.addEventListener("playerMoved", function () {
  if(historyMove == gameStates.length - 1){
    let botMove = makeBotMove(turn);
    let botPiece = document.querySelector(`[square-id="${botMove.piece}"]`);
    let botDestination = document.querySelector(`[square-id="${botMove.destination}"]`);
    botPiece.click();
    botDestination.click();
  }
});