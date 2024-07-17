let FENCode = startFEN;
let gameStates = [FENCode];
let playerWhite = "Player";
let playerBlack = "Player";
let moveDelay = 50;
createBoard(FENCode);

const playerMoved = new CustomEvent("playerMoved");
const buttonWhite = document.getElementById('buttonWhite');
const buttonBlack = document.getElementById('buttonBlack');
const buttonStart = document.getElementById('buttonStart');
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

let turn = 'White';
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
let attackedPieces = new Array(64).fill(0);
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
        attackedPieces[newId] = allSquares[newId];
        break;
      }
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
        attackedPieces[newId] = allSquares[newId];
        break;
      }
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
        attackedPieces[newId] = allSquares[newId];
        break;
      }
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
        attackedPieces[newId] = allSquares[newId];
        break;
      }
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
        attackedPieces[newId] = allSquares[newId];
        break;
      }
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
        attackedPieces[newId] = allSquares[newId];
        break;
      }
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
        attackedPieces[newId] = allSquares[newId];
        break;
      }
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
        attackedPieces[newId] = allSquares[newId];
        break;
      }
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
        allSquares[newId].firstChild.getAttribute("color") != color){
      attackedPieces[newId] = allSquares[newId];
    }
    else if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = allSquares[newId];
    }
  }
  newId = id - 10;
  if(col - 2 >= 0 && row - 1 >= 0){
    if(allSquares[newId].firstChild &&
        allSquares[newId].firstChild.getAttribute("color") != color){
      attackedPieces[newId] = allSquares[newId];
    }
    else if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = allSquares[newId];
    }
  }
  newId = id - 15;
  if(col + 1 <= 7 && row - 2 >= 0){
    if(allSquares[newId].firstChild &&
        allSquares[newId].firstChild.getAttribute("color") != color){
      attackedPieces[newId] = allSquares[newId];
    }
    else if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = allSquares[newId];
    }
  }
  newId = id - 17;
  if(col - 1 >= 0 && row - 2 >= 0){
    if(allSquares[newId].firstChild &&
        allSquares[newId].firstChild.getAttribute("color") != color){
      attackedPieces[newId] = allSquares[newId];
    }
    else if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = allSquares[newId];
    }
  }
  newId = id + 6;
  if(col - 2 >= 0 && row + 1 <= 7){
    if(allSquares[newId].firstChild &&
        allSquares[newId].firstChild.getAttribute("color") != color){
      attackedPieces[newId] = allSquares[newId];
    }
    else if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = allSquares[newId];
    }
  }
  newId = id + 10;
  if(col + 2 <= 7 && row + 1 <= 7){
    if(allSquares[newId].firstChild &&
        allSquares[newId].firstChild.getAttribute("color") != color){
      attackedPieces[newId] = allSquares[newId];
    }
    else if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = allSquares[newId];
    }
  }
  newId = id + 15;
  if(col - 1 >= 0 && row + 2 <= 7){
    if(allSquares[newId].firstChild &&
        allSquares[newId].firstChild.getAttribute("color") != color){
      attackedPieces[newId] = allSquares[newId];
    }
    else if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = allSquares[newId];
    }
  }
  newId = id + 17;
  if(col + 1 <= 7 && row + 2 <= 7){
    if(allSquares[newId].firstChild &&
        allSquares[newId].firstChild.getAttribute("color") != color){
      attackedPieces[newId] = allSquares[newId];
    }
    else if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = allSquares[newId];
    }
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
  let tempMoves = moves;
  const row = Math.floor(id / 8);
  const col = id % 8;
  newId = id - 1;
  if(col - 1 >= 0){
    if(allSquares[newId].firstChild?.getAttribute("color") == color){
    }
    else {
      if(allSquares[newId].firstChild){
        let tempPiece = allSquares[newId].innerHTML;
        transposeKing(allSquares[id], allSquares[newId]);
        moves = tempMoves;
        if(allSquares[newId].style.backgroundColor != 'orange'){
          moves.push(allSquares[newId]);
          tempMoves = moves;
        }
        allSquares[newId].innerHTML = tempPiece;
        calculateChecksNoKing(allSquares[id].firstChild);
        moves = tempMoves;
      }
      else{
        transposeKing(allSquares[id], allSquares[newId]);
        moves = tempMoves;
        if(allSquares[newId].style.backgroundColor != 'orange'){
          moves.push(allSquares[newId]);
          tempMoves = moves;
        }
        calculateChecksNoKing(allSquares[id].firstChild);
        moves = tempMoves;
      }
    }
  }
  newId = id + 1;
  if(col + 1 <= 7){
    if(allSquares[newId].firstChild?.getAttribute("color") == color){
    }
    else {
      if(allSquares[newId].firstChild){
        let tempPiece = allSquares[newId].innerHTML;
        transposeKing(allSquares[id], allSquares[newId]);
        moves = tempMoves;
        if(allSquares[newId].style.backgroundColor != 'orange'){
          moves.push(allSquares[newId]);
          tempMoves = moves;
        }
        allSquares[newId].innerHTML = tempPiece;
        calculateChecksNoKing(allSquares[id].firstChild);
        moves = tempMoves;
      }
      else{
        transposeKing(allSquares[id], allSquares[newId]);
        moves = tempMoves;
        if(allSquares[newId].style.backgroundColor != 'orange'){
          moves.push(allSquares[newId]);
          tempMoves = moves;
        }
        calculateChecksNoKing(allSquares[id].firstChild);
        moves = tempMoves;
      }
    }
  }
  newId = id - 8;
  if(row - 1 >= 0){
    if(allSquares[newId].firstChild?.getAttribute("color") == color){
    }
    else {
      if(allSquares[newId].firstChild){
        let tempPiece = allSquares[newId].innerHTML;
        transposeKing(allSquares[id], allSquares[newId]);
        moves = tempMoves;
        if(allSquares[newId].style.backgroundColor != 'orange'){
          moves.push(allSquares[newId]);
          tempMoves = moves;
        }
        allSquares[newId].innerHTML = tempPiece;
        calculateChecksNoKing(allSquares[id].firstChild);
        moves = tempMoves;
      }
      else{
        transposeKing(allSquares[id], allSquares[newId]);
        moves = tempMoves;
        if(allSquares[newId].style.backgroundColor != 'orange'){
          moves.push(allSquares[newId]);
          tempMoves = moves;
        }
        calculateChecksNoKing(allSquares[id].firstChild);
        moves = tempMoves;
      }
    }
  }
  newId = id + 8;
  if(row + 1 <= 7){
    if(allSquares[newId].firstChild?.getAttribute("color") == color){
    }
    else {
      if(allSquares[newId].firstChild){
        let tempPiece = allSquares[newId].innerHTML;
        transposeKing(allSquares[id], allSquares[newId]);
        moves = tempMoves;
        if(allSquares[newId].style.backgroundColor != 'orange'){
          moves.push(allSquares[newId]);
          tempMoves = moves;
        }
        allSquares[newId].innerHTML = tempPiece;
        calculateChecksNoKing(allSquares[id].firstChild);
        moves = tempMoves;
      }
      else{
        transposeKing(allSquares[id], allSquares[newId]);
        moves = tempMoves;
        if(allSquares[newId].style.backgroundColor != 'orange'){
          moves.push(allSquares[newId]);
          tempMoves = moves;
        }
        calculateChecksNoKing(allSquares[id].firstChild);
        moves = tempMoves;
      }
    }
  }
  newId = id + 9;
  if(col + 1 <= 7 && row + 1 <= 7){
    if(allSquares[newId].firstChild?.getAttribute("color") == color){
    }
    else {
      if(allSquares[newId].firstChild){
        let tempPiece = allSquares[newId].innerHTML;
        transposeKing(allSquares[id], allSquares[newId]);
        moves = tempMoves;
        if(allSquares[newId].style.backgroundColor != 'orange'){
          moves.push(allSquares[newId]);
          tempMoves = moves;
        }
        allSquares[newId].innerHTML = tempPiece;
        calculateChecksNoKing(allSquares[id].firstChild);
        moves = tempMoves;
      }
      else{
        transposeKing(allSquares[id], allSquares[newId]);
        moves = tempMoves;
        if(allSquares[newId].style.backgroundColor != 'orange'){
          moves.push(allSquares[newId]);
          tempMoves = moves;
        }
        calculateChecksNoKing(allSquares[id].firstChild);
        moves = tempMoves;
      }
    }
  }
  newId = id + 7;
  if(col - 1 >= 0 && row + 1 <= 7){
    if(allSquares[newId].firstChild?.getAttribute("color") == color){
    }
    else {
      if(allSquares[newId].firstChild){
        let tempPiece = allSquares[newId].innerHTML;
        transposeKing(allSquares[id], allSquares[newId]);
        moves = tempMoves;
        if(allSquares[newId].style.backgroundColor != 'orange'){
          moves.push(allSquares[newId]);
          tempMoves = moves;
        }
        allSquares[newId].innerHTML = tempPiece;
        calculateChecksNoKing(allSquares[id].firstChild);
        moves = tempMoves;
      }
      else{
        transposeKing(allSquares[id], allSquares[newId]);
        moves = tempMoves;
        if(allSquares[newId].style.backgroundColor != 'orange'){
          moves.push(allSquares[newId]);
          tempMoves = moves;
        }
        calculateChecksNoKing(allSquares[id].firstChild);
        moves = tempMoves;
      }
    }
  }
  newId = id - 7;
  if(col + 1 <= 7 && row - 1 >= 0){
    if(allSquares[newId].firstChild?.getAttribute("color") == color){
    }
    else {
      if(allSquares[newId].firstChild){
        let tempPiece = allSquares[newId].innerHTML;
        transposeKing(allSquares[id], allSquares[newId]);
        moves = tempMoves;
        if(allSquares[newId].style.backgroundColor != 'orange'){
          moves.push(allSquares[newId]);
          tempMoves = moves;
        }
        allSquares[newId].innerHTML = tempPiece;
        calculateChecksNoKing(allSquares[id].firstChild);
        moves = tempMoves;
      }
      else{
        transposeKing(allSquares[id], allSquares[newId]);
        moves = tempMoves;
        if(allSquares[newId].style.backgroundColor != 'orange'){
          moves.push(allSquares[newId]);
          tempMoves = moves;
        }
        calculateChecksNoKing(allSquares[id].firstChild);
        moves = tempMoves;
      }
    }
  }
  newId = id - 9;
  if(col - 1 >= 0 && row - 1 >= 0){
    if(allSquares[newId].firstChild?.getAttribute("color") == color){
    }
    else {
      if(allSquares[newId].firstChild){
        let tempPiece = allSquares[newId].innerHTML;
        transposeKing(allSquares[id], allSquares[newId]);
        moves = tempMoves;
        if(allSquares[newId].style.backgroundColor != 'orange'){
          moves.push(allSquares[newId]);
          tempMoves = moves;
        }
        allSquares[newId].innerHTML = tempPiece;
        calculateChecksNoKing(allSquares[id].firstChild);
        moves = tempMoves;
      }
      else{
        transposeKing(allSquares[id], allSquares[newId]);
        moves = tempMoves;
        if(allSquares[newId].style.backgroundColor != 'orange'){
          moves.push(allSquares[newId]);
          tempMoves = moves;
        }
        calculateChecksNoKing(allSquares[id].firstChild);
        moves = tempMoves;
      }
    }
  }
  tempMoves = moves;
  // checks if castling is possible
  if(allSquares[id]?.firstChild?.getAttribute("castle") == 'true' && !checks.includes(allSquares[id])){
    for(let i = 1; i < 4; i++){
      newId = id + i;
      if(i == 3 && allSquares[newId]?.firstChild?.getAttribute("id").toLowerCase() == 'r' &&
          allSquares[newId].firstChild.getAttribute("castle") == 'true'){
        transposeKing(allSquares[id], allSquares[id + 1]);
        moves = tempMoves;
        if(allSquares[id + 1].style.backgroundColor != 'orange'){
          allSquares[id + 2].innerHTML = allSquares[id].innerHTML;
          allSquares[id].innerHTML = '';
          calculateChecksNoKing();
          moves = tempMoves;
          if(allSquares[id + 2].style.backgroundColor != 'orange'){
            moves.push(allSquares[id + 2]);
            calculateKingCheck(allSquares[id + 2].firstChild);
            moves = moves.filter(element => !checks.includes(element));
            tempMoves = moves;
          }
          allSquares[id].innerHTML = allSquares[id + 2].innerHTML;
          allSquares[id + 2].innerHTML = '';
          moves = tempMoves;
        }
        calculateChecksNoKing();
        moves = tempMoves;
        allSquares[id].firstChild.setAttribute("castle", 'true');
      }
      if(allSquares[newId]?.firstChild)
        break;
    }
    for(let i = -1; i > -5; i--){
      newId = id + i;
      if(i == -4 && allSquares[newId]?.firstChild?.getAttribute("id").toLowerCase() == 'r' &&
          allSquares[newId].firstChild.getAttribute("castle") == 'true'){
        transposeKing(allSquares[id], allSquares[id - 1]);
        moves = tempMoves;
        if(allSquares[id - 1].style.backgroundColor != 'orange'){
          allSquares[id - 2].innerHTML = allSquares[id].innerHTML;
          allSquares[id].innerHTML = '';
          calculateChecksNoKing();
          moves = tempMoves;
          if(allSquares[id - 2].style.backgroundColor != 'orange'){
            moves.push(allSquares[id - 2]);
            calculateKingCheck(allSquares[id - 2].firstChild);
            moves = moves.filter(element => !checks.includes(element));
            tempMoves = moves;
          }
          allSquares[id].innerHTML = allSquares[id - 2].innerHTML;
          allSquares[id - 2].innerHTML = '';
          moves = tempMoves;
        }
        calculateChecksNoKing();
        moves = tempMoves;
        allSquares[id].firstChild.setAttribute("castle", 'true');
      }
      if(allSquares[newId]?.firstChild)
        break;
    }
  }
  calculateKingCheck(allSquares[id].firstChild);
  moves = moves.filter(element => !checks.includes(element));
  tempMoves = moves;
  calculateChecksNoKing();
  moves = tempMoves;
}

/**
 * Calculates the possible attacks for a king piece on the chessboard.
 * 
 * @param {number} id - The ID of the square where the king is located.
 * @param {string} color - The color of the king piece ('white' or 'black').
 */
function kingAttacksDefense(id, color){
  let newId = id;
  let tempMoves = moves;
  const row = Math.floor(id / 8);
  const col = id % 8;
  newId = id - 1;
  if(col - 1 >= 0){
    if(allSquares[newId].firstChild && allSquares[newId].firstChild.getAttribute("color") != color){
      attackedPieces[newId] = allSquares[newId];
    }
    else if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = allSquares[newId];
    }
  }
  newId = id + 1;
  if(col + 1 <= 7){
    if(allSquares[newId].firstChild && allSquares[newId].firstChild.getAttribute("color") != color){
      attackedPieces[newId] = allSquares[newId];
    }
    else if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = allSquares[newId];
    }
  }
  newId = id - 8;
  if(row - 1 >= 0){
    if(allSquares[newId].firstChild && allSquares[newId].firstChild.getAttribute("color") != color){
      attackedPieces[newId] = allSquares[newId];
    }
    else if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = allSquares[newId];
    }
  }
  newId = id + 8;
  if(row + 1 <= 7){
    if(allSquares[newId].firstChild && allSquares[newId].firstChild.getAttribute("color") != color){
      attackedPieces[newId] = allSquares[newId];
    }
    else if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = allSquares[newId];
    }
  }
  newId = id + 9;
  if(col + 1 <= 7 && row + 1 <= 7){
    if(allSquares[newId].firstChild && allSquares[newId].firstChild.getAttribute("color") != color){
      attackedPieces[newId] = allSquares[newId];
    }
    else if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = allSquares[newId];
    }
  }
  newId = id + 7;
  if(col - 1 >= 0 && row + 1 <= 7){
    if(allSquares[newId].firstChild && allSquares[newId].firstChild.getAttribute("color") != color){
      attackedPieces[newId] = allSquares[newId];
    }
    else if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = allSquares[newId];
    }
  }
  newId = id - 7;
  if(col + 1 <= 7 && row - 1 >= 0){
    if(allSquares[newId].firstChild && allSquares[newId].firstChild.getAttribute("color") != color){
      attackedPieces[newId] = allSquares[newId];
    }
    else if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = allSquares[newId];
    }
  }
  newId = id - 9;
  if(col - 1 >= 0 && row - 1 >= 0){
    if(allSquares[newId].firstChild && allSquares[newId].firstChild.getAttribute("color") != color){
      attackedPieces[newId] = allSquares[newId];
    }
    else if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = allSquares[newId];
    }
  }
}

/**
 * Helper function to check if king position at "to" is valid.
 * 
 * @param {HTMLElement} from - The original king position.
 * @param {HTMLElement} to - The position to check.
 */
function transposeKing(from, to){
  makeMove(from, to, false);
  calculateChecksNoKing();
  makeMove(to, from, false);
}

/**
 * Helper function to check if the given king is in check by the other king.
 * 
 * @param {HTMLElement} king - The original king.
 */
function calculateKingCheck(givenKing){
  checks = [];
  let givenKingId;
  let checkKingId;
  if(givenKing.color == "black"){
    givenKingId = parseInt(document.querySelector('#k').parentNode.getAttribute("square-id"));
    checkKingId = parseInt(document.querySelector('#K').parentNode.getAttribute("square-id"));
  }
  else{
    givenKingId = parseInt(document.querySelector('#K').parentNode.getAttribute("square-id"));
    checkKingId = parseInt(document.querySelector('#k').parentNode.getAttribute("square-id"));
  }
  let possKingMoves = [givenKingId - 9, givenKingId - 8, givenKingId - 7, givenKingId - 1, givenKingId + 1, givenKingId + 7, givenKingId + 8, givenKingId + 9];
  let occupiedKingMoves = [checkKingId - 9, checkKingId - 8, checkKingId - 7, checkKingId - 1, checkKingId + 1, checkKingId + 7, checkKingId + 8, checkKingId + 9];
  let intersection = possKingMoves.filter(element => occupiedKingMoves.includes(element));
  intersection.forEach(element => checks.push(allSquares[element]));
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
      if(col + 1 <= 7 && allSquares[newId].firstChild && allSquares[newId].firstChild.getAttribute("color") != color){
        attackedPieces[newId] = allSquares[newId];
      }
      else if(col + 1 <= 7 && allSquares[newId].firstChild &&
        allSquares[newId].firstChild.getAttribute("color") == color){
        defendedPieces[newId] = allSquares[newId];
      }
      if(col + 1 <= 7 && allSquares[id + 1].firstChild?.getAttribute("id").toLowerCase() == 'p' &&
        allSquares[id + 1].firstChild.getAttribute("enpassant") == 'true' &&
        allSquares[id + 1].firstChild.getAttribute("color") != color){
          attackedPieces[id + 1] = allSquares[id + 1];
      }
      newId = id - 9;
      if(col - 1 >= 0 && allSquares[newId].firstChild && allSquares[newId].firstChild.getAttribute("color") != color){
        attackedPieces[newId] = allSquares[newId];
      }
      else if(col - 1 >= 0 && allSquares[newId].firstChild &&
        allSquares[newId].firstChild.getAttribute("color") == color){
        defendedPieces[newId] = allSquares[newId];
      }
      if(col - 1 >= 0 && allSquares[id - 1].firstChild?.getAttribute("id").toLowerCase() == 'p' &&
        allSquares[id - 1].firstChild.getAttribute("enpassant") == 'true' &&
        allSquares[id - 1].firstChild.getAttribute("color") != color){
          attackedPieces[id - 1] = allSquares[id - 1];
      }
      break;
    case "black":
      // checks if there is a piece on its diagonals or en passant
      newId = id + 7;
      if(col - 1 >= 0 && allSquares[newId].firstChild && allSquares[newId].firstChild.getAttribute("color") != color){
        attackedPieces[newId] = allSquares[newId];
      }
      else if(col - 1 >= 0 && allSquares[newId].firstChild &&
        allSquares[newId].firstChild.getAttribute("color") == color){
        defendedPieces[newId] = allSquares[newId];
      }
      if(col - 1 >= 0 && allSquares[id - 1].firstChild?.getAttribute("id").toLowerCase() == 'p' &&
        allSquares[id - 1].firstChild.getAttribute("enpassant") == 'true' &&
        allSquares[id - 1].firstChild.getAttribute("color") != color){
          attackedPieces[id - 1] = allSquares[id - 1];
      }
      newId = id + 9;
      if(col + 1 <= 7 && allSquares[newId].firstChild && allSquares[newId].firstChild.getAttribute("color") != color){
        attackedPieces[newId] = allSquares[newId];
      }
      else if(col + 1 <= 7 && allSquares[newId].firstChild &&
        allSquares[newId].firstChild.getAttribute("color") == color){
        defendedPieces[newId] = allSquares[newId];
      }
      if(col + 1 <= 7 && allSquares[id + 1].firstChild?.getAttribute("id").toLowerCase() == 'p' &&
        allSquares[id + 1].firstChild.getAttribute("enpassant") == 'true' &&
        allSquares[id + 1].firstChild.getAttribute("color") != color){
          attackedPieces[id + 1] = allSquares[id + 1];
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
  attackedPieces = new Array(64).fill(0);
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
 * @param {HTMLElement} selectedPiece - The selected chess piece.
 * @returns {string} - The color(s) of the checked player(s).
 */
function calculateChecks(selectedPiece) {
  checks.forEach(check => {
    check.style.backgroundColor = '';
  });
  allPieces = document.querySelectorAll(".piece");
  checks = [];
  allPieces.forEach(piece => {
    calculateMoves(piece.parentNode);
    moves = [];
  });
  checks.forEach(check => {
    check.style.backgroundColor = 'orange';
  });
  if(selectedPiece)
    calculateMoves(selectedPiece);
  if(checks.includes(document.querySelector("#k")?.parentNode) && checks.includes(document.querySelector("#K")?.parentNode)) {
    return "white black";
  }
  else if(checks.includes(document.querySelector("#k")?.parentNode)) {
    return "black";
  }
  else if(checks.includes(document.querySelector("#K")?.parentNode)) {
    return "white";
  }
  return '';
}

/**
 * Calculates the checks in the chess game without kings.
 * @param {HTMLElement} selectedPiece - The king to skip.
 */
function calculateChecksNoKing() {
  checks.forEach(check => {
    check.style.backgroundColor = '';
  });
  allPieces = document.querySelectorAll(".piece");
  checks = [];
  allPieces.forEach(piece => {
  if(piece.id.toLowerCase() != 'k'){
      calculateMoves(piece.parentNode);
      moves = [];
    }
  });
  checks.forEach(check => {
    check.style.backgroundColor = 'orange';
  });
}

/**
 * Reverts the last move in the game.
 * This function pops the last game state from the `gameStates` array,
 * recreates the board based on the previous state, switches turns,
 * and reattaches event listeners to the squares.
 */
function revertMove() {
  gameStates.pop();
  createBoard(gameStates[gameStates.length - 1]);
  switchTurns();
  listenOnSquares();
}

/**
 * Animates the invalid move by changing the background color of the king piece.
 * @param {string} color - The color of the king piece ('white' or 'black').
 */
function animateInvalidMove(color) {
  switch (color){
    case 'white':
      let whiteKing = document.getElementById("K");
      if(whiteKing.style.backgroundColor == 'red')
        whiteKing.style.backgroundColor = '';
      else
        whiteKing.style.backgroundColor = 'red';
      break;
    case 'black':
      let blackKing = document.getElementById("k");
      if(blackKing.style.backgroundColor == 'red')
        blackKing.style.backgroundColor = '';
      else
        blackKing.style.backgroundColor = 'red';
  }
}

//! might need to modify
/**
 * Checks if the current game state is a checkmate.
 * @returns {boolean} Returns true if the game state is a checkmate, false otherwise.
 */
function checkForCheckMate(){
  let possibleMoves = [];
  let color = '';
  turn.toLowerCase() == 'white' ? color = 'black' : color = 'white';
  possibleMoves = calculateColorMoves(color);
  return possibleMoves.length == 0;
}

/**
 * Makes a move for the bot player.
 * @param {string} botColor - the turn which tells which color the bot needs to make the move for
 * @returns {Object} The move object containing the piece and destination.
 */
// TODO: Implement the minimax algorithm for the bot to play against human players
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
    makeMove(piece, destination, false);
    gameStates.push(updateFEN());
    console.log(move, updateFEN());
    switchTurns();
    let oppScore = searchMoves(1, -Infinity, Infinity);
    switchTurns();
    gameStates.pop();
    createBoard(gameStates[gameStates.length - 1]);
    listenOnSquares();
    if (oppScore < bestMinOppScore) {
      bestMinOppScore = oppScore;
      bestMove = move;
    }
  }
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
    makeMove(piece, destination, false);
    console.log(move);
    gameStates.push(updateFEN());
    switchTurns();
    score = -searchMoves(depth - 1, -beta, -alpha);
    switchTurns();
    gameStates.pop();
    createBoard(gameStates[gameStates.length - 1]);
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
      if(pinnedPieces[parseInt(piece.parentNode.getAttribute('square-id'))][0] != 0){
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
  console.log(attackedPieces, 'attacked pieces');
  console.log(defendedPieces, 'defended pieces');
  for(let i = 0; i < attackedPieces.length; i++){
    console.log(attackedPieces[i] != 0);
    if(attackedPieces[i] != 0 && defendedPieces[i] == 0){
      let attackedPieceCol = attackedPieces[i].firstChild.getAttribute('color');
      let pieceType = attackedPieces[i].firstChild.id.toLowerCase();
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
            score = -Infinity;
          else if(attackedPieceCol == 'black')
            score = Infinity;
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
      score += calculateMoves(piece.parentNode).length * 0.1;
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
      score += calculateMoves(piece.parentNode).length * 0.1;
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
        if(calculateChecks(selectedPiece).includes(selectedPiece?.firstChild?.getAttribute("color")))
          teamInCheck = true;
        if(checks.length != 0 && teamInCheck && selectedPiece?.firstChild?.id.toLowerCase() != 'k'){
          moves = moves.filter(move => checks.includes(move));
        }
        if(pinnedPieces[parseInt(selectedPiece.getAttribute('square-id'))][0] != 0 &&
            pinnedPieces[parseInt(selectedPiece.getAttribute('square-id'))][1] != 0){
          moves = moves.filter(move => pinnedPieces.map(pair => pair[0]).includes(move));
        }
        colorMoves();
      }
      // there is already a selected piece, so check if the move the player makes is valid
      else if(!gameOver){
        selectedPiece.style.backgroundColor = '';
        if(moves.includes(destination)){
          const color = selectedPiece.firstChild.getAttribute("color");
          if(color == turn.toLowerCase()){
            makeMove(selectedPiece, destination, true);
            calculateChecks();
            if(document.getElementById("K").parentNode.style.backgroundColor == 'orange' && color == 'white' ||
              document.getElementById("k").parentNode.style.backgroundColor == 'orange' && color == 'black'){
                revertMove();
                illegalMove.play();
                let kingWarning = setInterval(function() {
                  animateInvalidMove(color);
                }, 150);
                setTimeout(() => {
                  clearInterval(kingWarning);
                }, 600);
            }
            else if(checks.length > 0 && (gameOver = checkForCheckMate())){
              checkmate.play();
            }
            else if(gameOver = checkForCheckMate()){
              scatter.play();
              draw = true;
            }
            else if(checks.length > 0)
              check.play();
            else if(pieces != allPieces.length)
              capture.play();
            else
              color == 'white' ? selfMove.play() : oppMove.play();
            if(!gameOver){
              switchTurns();
              if(playerWhite == 'Bot' && turn == "White" || playerBlack == 'Bot' && turn == "Black")
                setTimeout(function() {document.dispatchEvent(new Event("playerMoved"))}, moveDelay);
              document.getElementById('numMoves').innerHTML = `Move ${gameStates.length - 1}`;
              document.getElementById("evaluation").innerHTML = `Evaluation: ${evaluateBoard(turn).toFixed(2)}`;
            }
          }
        }
        allSquares.forEach(square => {
          square.style.backgroundColor = '';
        });
        moves = [];
        selectedPiece = '';
        calculateChecks();
        calculatePins();
        pinnedPieces.forEach(piece => {
          if(piece[0] != 0)
            piece[0].style.backgroundColor = 'yellow';
        });
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

document.addEventListener("playerMoved", function () {
  let draw = false;
  let pieces = allPieces.length;
  let botMove = makeBotMove(turn);
  let botPiece = document.querySelector(`[square-id="${botMove.piece}"]`);
  let botDestination = document.querySelector(`[square-id="${botMove.destination}"]`);
  makeMove(botPiece, botDestination, true);
  calculateChecks();
  if(checks.length > 0 && (gameOver = checkForCheckMate())){
    checkmate.play();
  }
  else if(gameOver = checkForCheckMate()){
    scatter.play();
    draw = true;
  }
  else if(checks.length > 0)
    check.play();
  else if(pieces != allPieces.length)
    capture.play();
  else
    turn.toLowerCase() == 'white' ? selfMove.play() : oppMove.play();
  if(!gameOver){
    switchTurns();
    if(playerWhite == 'Bot' && turn == "White" || playerBlack == 'Bot' && turn == "Black")
      setTimeout(function() {document.dispatchEvent(new Event("playerMoved"))}, moveDelay);
    document.getElementById('numMoves').innerHTML = `Move ${gameStates.length - 1}`;
    document.getElementById("evaluation").innerHTML = `Evaluation: ${evaluateBoard(turn).toFixed(2)}`;
  }
  allSquares.forEach(square => {
    square.style.backgroundColor = '';
  });
  moves = [];
  selectedPiece = '';
  calculateChecks();
  calculatePins();
  pinnedPieces.forEach(piece => {
    if(piece[0] != 0)
      piece[0].style.backgroundColor = 'yellow';
  });
  if(draw){
    document.getElementById('turn').innerHTML = `It's a Draw!`;
    document.getElementById('turn').style.fontSize = '30px';
    setTimeout(function() {alert(`It's a Draw!`)}, 100);
  }
  if(!draw && gameOver){
    document.getElementById('turn').innerHTML = `${turn} Wins!`;
    setTimeout(function() {alert(`${turn} wins!`)}, 100);
  }
});