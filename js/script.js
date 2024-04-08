let FENCode = startFEN;
let gameStates = [FENCode];
createBoard(FENCode);

const playerMoved = new CustomEvent("playerMoved");
const button = document.getElementById('button');
button.addEventListener("click", function () {
  const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);

  // Change the button's background color
  button.style.backgroundColor = randomColor;
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
          enPassantPiece.firstChild.getAttribute("id").toLowerCase() == "p"
          && enPassantPiece.firstChild.getAttribute("enpassant") == 'true'){}
            enPassantPiece.innerHTML = '';
      }
      else {
        const enPassantPiece = document.querySelector(`[square-id="${to - 8}"]`);
        if(enPassantPiece && enPassantPiece.firstChild &&
          enPassantPiece.firstChild.getAttribute("id").toLowerCase() == "p"
          && enPassantPiece.firstChild.getAttribute("enpassant") == 'true')
            enPassantPiece.innerHTML = '';
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
      if(allSquares[newId].firstChild) break;
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
 * Calculates the possible moves for a bishop on the chessboard.
 * 
 * @param {number} id - The ID of the bishop square.
 * @param {string} color - The color of the bishop ('white' or 'black').
 */
function bishopMoves(id, color){
  let newId = id;
  const row = Math.floor(id / 8);
  const col = id % 8;
  let line = [];
  for(let offset = -1; offset > -8; offset--){
    newId = id + offset * 9;
    if(col + offset >= 0 && row + offset >= 0){
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
    newId = id + offset * 9;
    if(col + offset <= 7 && row + offset <= 7){
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
    newId = id + offset * 7;
    if(col - offset <= 7 && row + offset >= 0){
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
    newId = id + offset * 7;
    if(col - offset >= 0 && row + offset <= 7){
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
 * Calculates the possible moves for a king piece on the chessboard.
 * 
 * @param {number} id - The ID of the square where the king is located.
 * @param {string} color - The color of the king piece ('white' or 'black').
 */
//! Modify how the kings moves are calculated so we don't have to calculate checks every time
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
  //! castling issues need to get resolved when king is occupying the square
  if(allSquares[id]?.firstChild?.getAttribute("castle") == 'true' && !checks.includes(allSquares[id])){
    for(let i = 1; i < 4; i++){
      newId = id + i;
      if(i == 3 && allSquares[newId]?.firstChild?.getAttribute("id").toLowerCase() == 'r' &&
          allSquares[newId].firstChild.getAttribute("castle") == 'true'){
        transposeKing(allSquares[id], allSquares[id + 1]);
        console.log(allSquares[id].firstChild.getAttribute("castle"));
        moves = tempMoves;
        if(allSquares[id + 1].style.backgroundColor != 'orange'){
          allSquares[id + 2].innerHTML = allSquares[id].innerHTML;
          allSquares[id].innerHTML = '';
          calculateChecksNoKing();
          if(allSquares[id + 2].style.backgroundColor != 'orange'){
            moves.push(allSquares[id + 2]);
            calculateKingCheck(allSquares[id + 2].firstChild);
            moves = moves.filter(element => !checks.includes(element));
            tempMoves = moves;
            console.log(moves);
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

/**
 * Checks if the current game state is a checkmate.
 * @returns {boolean} Returns true if the game state is a checkmate, false otherwise.
 */
function checkForCheckMate(){
  let possibleMoves = [];
  if(turn.toLowerCase() == 'white'){
    allBlack.forEach(piece => {
      let checkMoves = calculateMoves(piece.parentNode);
      checkMoves.forEach(move => possibleMoves.push(move));
    });
    possibleMoves = possibleMoves.filter(move => checks.includes(move));
    if(possibleMoves.length == 0){
      return true;
    }
  }
  if(turn.toLowerCase() == 'black'){
    allWhite.forEach(piece => {
      let checkMoves = calculateMoves(piece.parentNode);
      checkMoves.forEach(move => possibleMoves.push(move));
    });
    possibleMoves = possibleMoves.filter(move => checks.includes(move));
    if(possibleMoves.length == 0){
      return true;
    }
  }
  return false;
}

/**
 * Makes a move for the bot player.
 * @returns {Object} The move object containing the piece and destination.
 */
// TODO: Implement the minimax algorithm for the bot to play against human players
function makeBotMove() {
  let allMoves = [];
  let bestMove = {};
  let bestScore = -Infinity;
  let color = 'black';
  let allBlackPieces = document.querySelectorAll("div[color='black']");
  let allWhitePieces = document.querySelectorAll("div[color='white']");
  allBlackPieces.forEach(piece => {
    let moves = calculateMoves(piece.parentNode);
    moves.forEach(move => {
      allMoves.push({piece: piece, destination: move.getAttribute("square-id")});
    });
  });
  // allMoves.forEach(move => {
  //   let originalPiece = document.querySelector(`#${move.piece}`);
  //   let originalDestination = document.querySelector(`[square-id="${move.destination}"]`);
  //   makeMove(originalPiece, originalDestination);
  //   calculateChecks();
  //   let score = minimax(2, -Infinity, Infinity, false);
  //   makeMove(originalDestination, originalPiece);
  //   if(score > bestScore){
  //     bestScore = score;
  //     bestMove = move;
  //   }
  // });
  let randomMove = Math.floor(Math.random() * allMoves.length);
  console.log(allMoves[randomMove]);
  return allMoves[randomMove];
}


/**
 * Listens for click events on the chess squares and handles the logic for selecting and moving pieces.
 */
function listenOnSquares() {
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
            else if(checks.length > 0)
              check.play();
            else if(pieces != allPieces.length)
              capture.play();
            else
              color == 'white' ? selfMove.play() : oppMove.play();
            if(!gameOver){
              switchTurns();
              //! document.dispatchEvent(new Event("playerMoved"));
              document.getElementById('numMoves').innerHTML = `Move ${gameStates.length - 1}`;
            }
          }
        }
        allSquares.forEach(square => {
          square.style.backgroundColor = '';
        });
        moves = [];
        selectedPiece = '';
        calculateChecks();
        if(gameOver){
          setTimeout(function() {alert(`${turn} wins!`)}, 100);
        }
      }
    });
  });
}
listenOnSquares();

document.addEventListener("playerMoved", function (e) {
  console.log("bot");
  if (turn === 'Black') {
    let botMove = makeBotMove();
    let botPiece = botMove.piece.parentNode;
    let botDestination = document.querySelector(`[square-id="${botMove.destination}"]`);
    makeMove(botPiece, botDestination, true);
    calculateChecks();
    //! makes sure the random move is valid, remove this later
    if(document.getElementById("k").parentNode.style.backgroundColor == 'orange'){  
      while(document.getElementById("k").parentNode.style.backgroundColor == 'orange'){
          revertMove();
          //! when king puts himself in check, errors occur
          botMove = makeBotMove();
          botPiece = botMove.piece.parentNode;
          botDestination = document.querySelector(`[square-id="${botMove.destination}"]`);
          makeMove(botPiece, botDestination, true);
          calculateChecks();
        }
    }
    else if(checks.length > 0 && (gameOver = checkForCheckMate())){
      checkmate.play();
    }
    else if(checks.length > 0)
      check.play();
    else
      oppMove.play();
    if(turn == "Black")
      switchTurns();
    document.getElementById('numMoves').innerHTML = `Move ${gameStates.length - 1}`;
  }
});