let FENCode = testFEN;
let gameStates = [FENCode];
createBoard(FENCode);

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
let moves = [];
let checks = [];

// assuming the move is legal, it correctly moves the given piece on the board
function makeMove(piece, destination) {
  const pieceType = piece.firstChild.getAttribute("id").toLowerCase();
  const color = piece.firstChild.getAttribute("color");
  const from = parseInt(piece.getAttribute("square-id"));
  const to = parseInt(destination.getAttribute("square-id"));
  let placementHandled = false;
  allPawns = document.querySelectorAll('.square #p, .square #P');
  // handles enpassant for pawns and queen promotion
  if(pieceType == 'p'){
    if(Math.abs(from - to) == 16)
      piece.firstChild.setAttribute("enpassant", 'true');
    if(Math.abs(from - to) != 8){
      if(color == "white"){
        const enPassantPiece = document.querySelector(`[square-id="${to + 8}"]`);
        if(enPassantPiece && enPassantPiece.firstChild &&
          enPassantPiece.firstChild.getAttribute("id").toLowerCase() == "p"
          && enPassantPiece.firstChild.getAttribute("enpassant") == 'true')
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
  if(pieceType == 'k'){
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
  allPawns.forEach(pawn => pawn.setAttribute("enpassant", 'false'));
}

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
      }
    }
  }
}

function kingMoves(id, color){
  let newId = id;
  const row = Math.floor(id / 8);
  const col = id % 8;
  newId = id - 1;
  if(col - 1 >= 0){
    if(allSquares[newId].firstChild?.getAttribute("color") == color){
    }
    else {
      if(allSquares[newId].style.backgroundColor != 'orange'){
        moves.push(allSquares[newId]);
        if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k'){
          checks.push(allSquares[newId]);
          checks.push(allSquares[id]);
        }
      }
      else if(allSquares[newId].firstChild){
        moves.push(allSquares[newId]);
        if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k'){
          checks.push(allSquares[newId]);
          checks.push(allSquares[id]);
        }
      }
    }
  }
  newId = id + 1;
  if(col + 1 <= 7){
    if(allSquares[newId].firstChild?.getAttribute("color") == color){
    }
    else {
      if(allSquares[newId].style.backgroundColor != 'orange'){
        moves.push(allSquares[newId]);
        if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k'){
          checks.push(allSquares[newId]);
          checks.push(allSquares[id]);
        }
      }
      else if(allSquares[newId].firstChild){
        moves.push(allSquares[newId]);
        if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k'){
          checks.push(allSquares[newId]);
          checks.push(allSquares[id]);
        }
      }
    }
  }
  newId = id - 8;
  if(row - 1 >= 0){
    if(allSquares[newId].firstChild?.getAttribute("color") == color){
    }
    else {
      if(allSquares[newId].style.backgroundColor != 'orange'){
        moves.push(allSquares[newId]);
        if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k'){
          checks.push(allSquares[newId]);
          checks.push(allSquares[id]);
        }
      }
      else if(allSquares[newId].firstChild){
        moves.push(allSquares[newId]);
        if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k'){
          checks.push(allSquares[newId]);
          checks.push(allSquares[id]);
        }
      }
    }
  }
  newId = id + 8;
  if(row + 1 <= 7){
    if(allSquares[newId].firstChild?.getAttribute("color") == color){
    }
    else {
      if(allSquares[newId].style.backgroundColor != 'orange'){
        moves.push(allSquares[newId]);
        if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k'){
          checks.push(allSquares[newId]);
          checks.push(allSquares[id]);
        }
      }
      else if(allSquares[newId].firstChild){
        moves.push(allSquares[newId]);
        if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k'){
          checks.push(allSquares[newId]);
          checks.push(allSquares[id]);
        }
      }
    }
  }
  newId = id + 9;
  if(col + 1 <= 7 && row + 1 <= 7){
    if(allSquares[newId].firstChild?.getAttribute("color") == color){
    }
    else {
      if(allSquares[newId].style.backgroundColor != 'orange'){
        moves.push(allSquares[newId]);
        if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k'){
          checks.push(allSquares[newId]);
          checks.push(allSquares[id]);
        }
      }
      else if(allSquares[newId].firstChild){
        moves.push(allSquares[newId]);
        if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k'){
          checks.push(allSquares[newId]);
          checks.push(allSquares[id]);
        }
      }
    }
  }
  newId = id + 7;
  if(col - 1 >= 0 && row + 1 <= 7){
    if(allSquares[newId].firstChild?.getAttribute("color") == color){
    }
    else {
      if(allSquares[newId].style.backgroundColor != 'orange'){
        moves.push(allSquares[newId]);
        if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k'){
          checks.push(allSquares[newId]);
          checks.push(allSquares[id]);
        }
      }
      else if(allSquares[newId].firstChild){
        moves.push(allSquares[newId]);
        if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k'){
          checks.push(allSquares[newId]);
          checks.push(allSquares[id]);
        }
      }
    }
  }
  newId = id - 7;
  if(col + 1 <= 7 && row - 1 >= 0){
    if(allSquares[newId].firstChild?.getAttribute("color") == color){
    }
    else {
      if(allSquares[newId].style.backgroundColor != 'orange'){
        moves.push(allSquares[newId]);
        if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k'){
          checks.push(allSquares[newId]);
          checks.push(allSquares[id]);
        }
      }
      else if(allSquares[newId].firstChild){
        moves.push(allSquares[newId]);
        if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k'){
          checks.push(allSquares[newId]);
          checks.push(allSquares[id]);
        }
      }
    }
  }
  newId = id - 9;
  if(col - 1 >= 0 && row - 1 >= 0){
    if(allSquares[newId].firstChild?.getAttribute("color") == color){
    }
    else {
      if(allSquares[newId].style.backgroundColor != 'orange'){
        moves.push(allSquares[newId]);
        if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k'){
          checks.push(allSquares[newId]);
          checks.push(allSquares[id]);
        }
      }
      else if(allSquares[newId].firstChild){
        moves.push(allSquares[newId]);
        if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k'){
          checks.push(allSquares[newId]);
          checks.push(allSquares[id]);
        }
      }
    }
  }
  let tempMoves = moves;
  // checks if castling is possible
  if(allSquares[id].firstChild?.getAttribute("castle") == 'true' && !checks.includes(allSquares[id])){
    for(let i = 1; i < 4; i++){
      newId = id + i;
      if(i == 3 && allSquares[newId]?.firstChild?.getAttribute("id").toLowerCase() == 'r' &&
          allSquares[newId].firstChild.getAttribute("castle") == 'true'){
        makeMove(allSquares[id], allSquares[id + 1]);
        calculateChecks();
        moves = tempMoves;
        if(allSquares[id + 1].style.backgroundColor != 'orange'){
          moves.push(allSquares[id + 2]);
          tempMoves = moves;
        }
        makeMove(allSquares[id + 1], allSquares[id]);
        calculateChecks();
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
        makeMove(allSquares[id], allSquares[id - 1]);
        calculateChecks();
        moves = tempMoves;
        if(allSquares[id - 1].style.backgroundColor != 'orange'){
          moves.push(allSquares[id - 2]);
          tempMoves = moves;
        }
        makeMove(allSquares[id - 1], allSquares[id]);
        calculateChecks();
        moves = tempMoves;
        allSquares[id].firstChild.setAttribute("castle", 'true');
      }
      if(allSquares[newId]?.firstChild)
        break;
    }
  }
}

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
      if(allSquares[newId].firstChild && allSquares[newId].firstChild.getAttribute("color") != color ||
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
      if(allSquares[newId].firstChild && allSquares[newId].firstChild.getAttribute("color") != color ||
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
      if(allSquares[newId].firstChild && allSquares[newId].firstChild.getAttribute("color") != color ||
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
      if(allSquares[newId].firstChild && allSquares[newId].firstChild.getAttribute("color") != color ||
        col - 1 >= 0 && allSquares[id + 1].firstChild?.getAttribute("id").toLowerCase() == 'p' &&
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

// populates moves array based on the position of the piece and the type it is
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

// signify to the player all possible moves by coloring squares red
function colorMoves() {
  moves.forEach(square => {
    square.style.backgroundColor = 'crimson';
  });
}

function switchTurns() {
  if (turn === 'White') {
    turn = 'Black';
  } else {
    turn = 'White';
  }
  document.getElementById('turn').innerHTML = `${turn}'s Turn`;
}

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

function revertMove() {
  console.log("revertMove");
  gameStates.pop();
  createBoard(gameStates[gameStates.length - 1]);
  switchTurns();
  listenOnSquares();
}

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

// allows for the player to click a piece on the board to receive information or make a move
function listenOnSquares() {
  allSquares = document.querySelectorAll("div.square");
  allSquares.forEach(square => {
    square.addEventListener("click", function (e) {
      let destination = e.target;
      let teamInCheck = false;
      let gameOver = false;
      // no piece has been selected yet, so select this one and show possible moves
      if(!selectedPiece){
        console.log('selected');
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
      else{
        selectedPiece.style.backgroundColor = '';
        if(moves.includes(destination)){
          console.log('move');
          const color = selectedPiece.firstChild.getAttribute("color");
          if(destination.firstChild?.id.toLowerCase() == 'k'){
            gameOver = true;
          }
          if(color == turn.toLowerCase()){
            if(!gameOver)
              switchTurns();
            makeMove(selectedPiece, destination);
            gameStates.push(updateFEN());
            calculateChecks();
            if(document.getElementById("K").parentNode.style.backgroundColor == 'orange' && color == 'white' ||
              document.getElementById("k").parentNode.style.backgroundColor == 'orange' && color == 'black'){
                revertMove();
                let kingWarning = setInterval(function() {
                  animateInvalidMove(color);
                }, 150);
                setTimeout(() => {
                  clearInterval(kingWarning);
                }, 600);
            }
            if(gameOver){
              alert(`${turn} wins!`);
              location.reload();
            }
          }
        }
        allSquares.forEach(square => {
          square.style.backgroundColor = '';
        });
        moves = [];
        selectedPiece = '';
        calculateChecks();
      }
    });
  });
}
listenOnSquares();