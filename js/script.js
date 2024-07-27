// used for debugging purposes if I want to start the game with a custom position
let FENCode = startFEN;
// let FENCode = testFEN;

// keeps track of all positions run through in the current game so we can look back to previous positions of the same game
let gameStates = [];

// the current player to move
let turn = 'White';

// keeps track of the number of half moves and full moves in the game
let numHalfMoves = 0;
let numMoves = 0;

// keeps track of the current position in the gameStates array
let historyMove = 0;

// keeps track of whether the given player is a "Player" or a "Bot"
let playerWhite = "Player";
let playerBlack = "Player";

// delay between bot moves if site is running a bot game 
let moveDelay = 0;

// creates the starting position of the game
createBoard(FENCode, true);
document.getElementById('turn').innerHTML = `${turn}'s Turn`;

// creates the dropdown menu for the user to select the opening they want to play
const dropdown = document.getElementById('myDropdown');
const openings = [
  { value: startFEN, text: 'New Game' },
  { value: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2', text: 'Sicilian Defense' },
  { value: 'rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', text: 'French Defense' },
  { value: 'rnbqkb1r/pppppp1p/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 1 3', text: 'King\'s Indian Defense' },
  { value: '', text: 'Custom FEN Position'}
];
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
  gameStart.play();
  document.getElementById('numMoves').innerHTML = `Move ${parseInt(numMoves / 2)}`;
  document.getElementById("evaluation").innerHTML = `Evaluation: ${selectedOption == startFEN ? 0 : evaluateBoard(turn).toFixed(2)}`;
});

// custom event so bot knows when to start its calculations for the current position
const playerMoved = new CustomEvent("playerMoved");

// event listeners for the buttons on the website
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
    console.log(gameStates[historyMove]);
    console.log(pinnedPieces, 'pinned pieces');
    console.log(attackedSquares, 'attacked squares');
    console.log(defendedPieces, 'defended pieces');
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
    if(historyMove == gameStates.length - 1)
      listenOnSquares();
    console.log(pinnedPieces, 'pinned pieces');
    console.log(attackedSquares, 'attacked squares');
    console.log(defendedPieces, 'defended pieces');
    document.getElementById('numMoves').innerHTML = `Move ${parseInt(numMoves / 2)}`;
    document.getElementById("evaluation").innerHTML = `Evaluation: ${evaluateBoard(turn).toFixed(2)}`;
  }
});

// piece that has been selected by the user / bot so we know which moves to show
let selectedSquare;

// selection of pieces to keep track of (these will be redefined throughout runtime)
let allPawns = document.querySelectorAll('.square #p, .square #P');
let allPieces = document.querySelectorAll(".piece");
let allBlack = document.querySelectorAll("div[color='black']");
let allWhite = document.querySelectorAll("div[color='white']");

// keeps track of all squares of the board (will also be redefined throughout runtime)
let allSquares = document.querySelectorAll("div.square");

// tells the website if the game has finished
let gameOver = false;

let moves = [];
let checks = [];

// pinnedPieces[0] = piece involved in pin
// pinnedPieces[1] = 0 if piece is not pinned 1 if it is
let pinnedPieces = new Array(64).fill([0,0]);

// attackedSquares[0] = square attacked
// attackedSquares[1] = whether square is attacked by white, stored as "white" if true
// attackedSquares[2] = whether square is attacked by black, stored as "black" if true
// attackedSquares[3] = pieces attacking square
let attackedSquares = new Array(64).fill([0,0,0,new Array()]);

// defendedPieces[0] = square defended
// defendedPieces[1] = pieces defending square
let defendedPieces = new Array(64).fill([0,new Array()]);

// all audio files used during play
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
      if(!selectedSquare && !gameOver){
        selectedSquare = e.target;
        if(selectedSquare.innerHTML == ''){
          selectedSquare = '';
          return;
        }
        selectedSquare.style.backgroundColor='deepskyblue';
        calculateChecks();
        checks.forEach(position => {
          if(position == document.getElementById(turn == 'White' ? 'K' : 'k').parentNode)
            teamInCheck = true;
        });
        calculatePins();
        calculateMovesChecks(selectedSquare);
        if(checks.length != 0 && teamInCheck && selectedSquare?.firstChild?.id.toLowerCase() != 'k'){
          moves = moves.filter(move => checks.includes(move));
        }
        if(pinnedPieces[parseInt(selectedSquare.getAttribute('square-id'))][0] != 0 &&
            pinnedPieces[parseInt(selectedSquare.getAttribute('square-id'))][1] != 0){
          moves = moves.filter(move => pinnedPieces.map(pair => pair[0])[parseInt(move.getAttribute('square-id'))] != 0);
        }
        colorMoves();
      }

      // there is already a selected square, so check if the move the player makes is valid
      else if(!gameOver){
        selectedSquare.style.backgroundColor = '';
        if(moves.includes(destination)){
          // updates all global variables so we can create the correct FEN position, and look through history
          numHalfMoves++;
          numMoves++;
          historyMove++;

          const color = selectedSquare.firstChild.getAttribute("color");
          // if the selected piece the player wants to move is for the color to move, handle movement
          if(color == turn.toLowerCase()){
            // updates halfMoves to 0 if pawn is pushed or a capture happens
            if(selectedSquare.firstChild.id.toLowerCase() == 'p' || destination.firstChild)
              numHalfMoves = 0;

            // handles the move and updates checks array
            switchTurns();
            makeMove(selectedSquare, destination);
            calculateChecks();

            gameOver = checkForCheckMateOrDraw();
            if(checks.length > 0 && gameOver){
              // the current position is checkmate
              switchTurns();
              checkmate.play();
            }
            else if(gameOver || numHalfMoves == 100){
              // the current position is a draw or 100 halfMoves occur, which is also a draw
              scatter.play();
              draw = true;
            }
            else if(checks.length > 0){
              // just a check is made
              check.play();
            }
            else if(pieces != allPieces.length){
              // a capture occurred
              capture.play();
            }
            else{
              // only a piece move occurred
              color == 'white' ? selfMove.play() : oppMove.play();
            }
            if(!gameOver){
              if(playerWhite == 'Bot' && turn == "White" || playerBlack == 'Bot' && turn == "Black"){
                // if the player to move now is a bot, make the bot move
                setTimeout(function() {document.dispatchEvent(new Event("playerMoved"))}, moveDelay);
              }
              document.getElementById('numMoves').innerHTML = `Move ${parseInt(numMoves / 2)}`;
              document.getElementById("evaluation").innerHTML = `Evaluation: ${evaluateBoard(turn).toFixed(2)}`;
            }
          }
          // reset all moves for the piece and deselect the square
          allSquares.forEach(square => {
            square.style.backgroundColor = '';
          });
          moves = [];
          selectedSquare = '';
        }
        else{
          // the click is not valuable information for a move so deselect the current square
          // and select this new square as if the previous selection did not happen resetting all moves for the piece
          allSquares.forEach(square => {
            square.style.backgroundColor = '';
          });
          moves = [];
          selectedSquare = '';
          destination.click();
        }
        if(draw){
          // the game is a draw so present that on the site
          document.getElementById('turn').innerHTML = `It's a Draw!`;
          document.getElementById('turn').style.fontSize = '30px';
          setTimeout(function() {alert(`It's a Draw!`)}, 100);
        }
        if(!draw && gameOver){
          // the game is over and has a winner so present that on the site
          document.getElementById('turn').innerHTML = `${turn} Wins!`;
          document.getElementById('turn').style.fontSize = '30px';
          setTimeout(function() {alert(`${turn} wins!`)}, 100);
        }
      }
    });
  });
}
listenOnSquares();

// Calculates and makes the move for the bot
document.addEventListener("playerMoved", function () {
  // checks to make sure we are not looking back at a previous position
  if(historyMove == gameStates.length - 1){
    let botMove = makeBotMove(turn);
    let botStart = document.querySelector(`[square-id="${botMove.start}"]`);
    let botDestination = document.querySelector(`[square-id="${botMove.destination}"]`);
    botStart.click();
    botDestination.click();
  }
});

/**
 * Makes a move on the chessboard and ensures rules like enpassant, promotion, and castling are maintained.
 * 
 * @param {HTMLElement} start - The start square for the piece being moved.
 * @param {HTMLElement} destination - The destination square where the piece is being moved to.
 */
function makeMove(start, destination) {
  const pieceType = start.firstChild.getAttribute("id").toLowerCase();
  const color = start.firstChild.getAttribute("color");
  const from = parseInt(start.getAttribute("square-id"));
  const to = parseInt(destination.getAttribute("square-id"));
  let placementHandled = false; // tells function whether move has been handled in special cases for the destination
  allPawns = document.querySelectorAll('.square #p, .square #P');

  // handles enpassant for pawns and queen promotion
  if(pieceType == 'p'){
    if(Math.abs(from - to) == 16){
      start.firstChild.setAttribute("enpassant", 'true');
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
  if(pieceType == 'k'){
    start.firstChild.setAttribute("castle", 'false');
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
    start.firstChild.setAttribute("castle", 'false');
  }

  if(!placementHandled)
    destination.innerHTML = start.innerHTML;
  start.innerHTML = '';
  
  allPawns.forEach(pawn => pawn.setAttribute("enpassant", 'false'));
  gameStates.push(updateFEN());
}

/**
 * Calculates the possible moves and checks for a selected chess piece.
 * ! this also updates the global checks array
 * 
 * @param {HTMLElement} selectedSquare - The selected chess piece.
 * @returns {Array} - An array of possible moves for the selected piece.
 */
function calculateMovesChecks(selectedSquare) {
  moves = [];
  if(!selectedSquare)
    return [];
  let pieceType = selectedSquare.firstChild?.getAttribute("id").toLowerCase();
  let color = selectedSquare.firstChild?.getAttribute("color");
  let id = parseInt(selectedSquare.getAttribute("square-id"));
  // based on the piece type, add the proper moves for that piece to moves
  switch (pieceType) {
    case "r":
      rookMovesChecks(id, color);
      break;
    case "b":
      bishopMovesChecks(id, color);
      break;
    case "q":
      rookMovesChecks(id, color);
      bishopMovesChecks(id, color);
      break;
    case "n":
      knightMovesChecks(id, color);
      break;
    case "k":
      calculateAttacksDefense();
      kingMovesChecks(id, color);
      break;
    case "p":
      pawnMovesChecks(id, color);
      break;
  }
  return moves;
}

/**
 * Calculates attacked and defended squares/pieces and updates the global attack and defense arrays
 */
function calculateAttacksDefense(){
  attackedSquares = new Array(64).fill([0,0,0,new Array()]);
  defendedPieces = new Array(64).fill([0,new Array()]);
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
 * Calculates the pinned pieces on the chessboard and updates the pinned pieces array
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
 * Calculates the possible moves and checks for a rook.
 * ! this also updates the global checks array
 * 
 * @param {number} id - The ID of the rook square.
 * @param {string} color - The color of the rook ('white' or 'black').
 */
function rookMovesChecks(id, color){
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
 * Calculates the possible attacks and defended pieces by the rook and updates
 * the global attacks and defense arrays
 * 
 * @param {number} id - The ID of the rook square.
 * @param {string} color - The color of the rook ('white' or 'black').
 */
function rookAttacksDefense(id, color){
  let newId = id;
  const row = Math.floor(id / 8);
  const col = id % 8;
  let rookPiece = document.querySelector(`[square-id="${id}"]`).firstChild;
  for(let offset = -1; offset > -8; offset--){
    newId = id + offset;
    if(col + offset >= 0){
      if(allSquares[newId].firstChild?.getAttribute("color") == color){
        defendedPieces[newId] = [allSquares[newId], defendedPieces[newId][1].concat(rookPiece)];
        break;
      }
      if(allSquares[newId].firstChild){
        color == 'white' ?
        attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2], attackedSquares[newId][3].concat(rookPiece)] :
        attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color, attackedSquares[newId][3].concat(rookPiece)];
        break;
      }
      color == 'white' ?
        attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2], attackedSquares[newId][3].concat(rookPiece)] :
        attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color, attackedSquares[newId][3].concat(rookPiece)];
    }
  }
  for(let offset = 1; offset < 8; offset++){
    newId = id + offset;
    if(col + offset <= 7){
      if(allSquares[newId].firstChild?.getAttribute("color") == color){
        defendedPieces[newId] = [allSquares[newId], defendedPieces[newId][1].concat(rookPiece)];
        break;
      }
      if(allSquares[newId].firstChild){
        color == 'white' ?
        attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2], attackedSquares[newId][3].concat(rookPiece)] :
        attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color, attackedSquares[newId][3].concat(rookPiece)];
        break;
      }
      color == 'white' ?
        attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2], attackedSquares[newId][3].concat(rookPiece)] :
        attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color, attackedSquares[newId][3].concat(rookPiece)];
    }
  }
  for(let offset = -1; offset > -8; offset--){
    newId = id + offset*8;
    if(row + offset >= 0){
      if(allSquares[newId].firstChild?.getAttribute("color") == color){
        defendedPieces[newId] = [allSquares[newId], defendedPieces[newId][1].concat(rookPiece)];
        break;
      }
      if(allSquares[newId].firstChild){
        color == 'white' ?
        attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2], attackedSquares[newId][3].concat(rookPiece)] :
        attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color, attackedSquares[newId][3].concat(rookPiece)];
        break;
      }
      color == 'white' ?
        attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2], attackedSquares[newId][3].concat(rookPiece)] :
        attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color, attackedSquares[newId][3].concat(rookPiece)];
    }
  }
  for(let offset = 1; offset < 8; offset++){
    newId = id + offset*8;
    if(row + offset <= 7){
      if(allSquares[newId].firstChild?.getAttribute("color") == color){
        defendedPieces[newId] = [allSquares[newId], defendedPieces[newId][1].concat(rookPiece)];
        break;
      }
      if(allSquares[newId].firstChild){
        color == 'white' ?
        attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2], attackedSquares[newId][3].concat(rookPiece)] :
        attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color, attackedSquares[newId][3].concat(rookPiece)];
        break;
      }
      color == 'white' ?
        attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2], attackedSquares[newId][3].concat(rookPiece)] :
        attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color, attackedSquares[newId][3].concat(rookPiece)];
    }
  }
}

/**
 * Calculates the pinned pieces from a rook on the chessboard and updates the global pinned array
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
 * Calculates the possible moves and checks for a bishop.
 * ! this also updates the global checks array
 * 
 * @param {number} id - The ID of the bishop square.
 * @param {string} color - The color of the bishop ('white' or 'black').
 */
function bishopMovesChecks(id, color){
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
 * Calculates the possible attacks and defended pieces by the bishop and updates
 * the global attacks and defense arrays
 * 
 * @param {number} id - The ID of the bishop square.
 * @param {string} color - The color of the bishop ('white' or 'black').
 */
function bishopAttacksDefense(id, color){
  let newId = id;
  const row = Math.floor(id / 8);
  const col = id % 8;
  let bishopPiece = document.querySelector(`[square-id="${id}"]`).firstChild;
  for(let offset = -1; offset > -8; offset--){
    newId = id + offset * 9;
    if(col + offset >= 0 && row + offset >= 0){
      if(allSquares[newId].firstChild?.getAttribute("color") == color){
        defendedPieces[newId] = [allSquares[newId], defendedPieces[newId][1].concat(bishopPiece)];
        break;
      }
      if(allSquares[newId].firstChild){
        color == 'white' ?
        attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2], attackedSquares[newId][3].concat(bishopPiece)] :
        attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color, attackedSquares[newId][3].concat(bishopPiece)];
        break;
      }
      color == 'white' ?
        attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2], attackedSquares[newId][3].concat(bishopPiece)] :
        attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color, attackedSquares[newId][3].concat(bishopPiece)];
    }
  }
  for(let offset = 1; offset < 8; offset++){
    newId = id + offset * 9;
    if(col + offset <= 7 && row + offset <= 7){
      if(allSquares[newId].firstChild?.getAttribute("color") == color){
        defendedPieces[newId] = [allSquares[newId], defendedPieces[newId][1].concat(bishopPiece)];
        break;
      }
      if(allSquares[newId].firstChild){
        color == 'white' ?
        attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2], attackedSquares[newId][3].concat(bishopPiece)] :
        attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color, attackedSquares[newId][3].concat(bishopPiece)];
        break;
      }
      color == 'white' ?
        attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2], attackedSquares[newId][3].concat(bishopPiece)] :
        attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color, attackedSquares[newId][3].concat(bishopPiece)];
    }
  }
  for(let offset = -1; offset > -8; offset--){
    newId = id + offset * 7;
    if(col - offset <= 7 && row + offset >= 0){
      if(allSquares[newId].firstChild?.getAttribute("color") == color){
        defendedPieces[newId] = [allSquares[newId], defendedPieces[newId][1].concat(bishopPiece)];
        break;
      }
      if(allSquares[newId].firstChild){
        color == 'white' ?
        attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2], attackedSquares[newId][3].concat(bishopPiece)] :
        attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color, attackedSquares[newId][3].concat(bishopPiece)];
        break;
      }
      color == 'white' ?
        attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2], attackedSquares[newId][3].concat(bishopPiece)] :
        attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color, attackedSquares[newId][3].concat(bishopPiece)];
    }
  }
  for(let offset = 1; offset < 8; offset++){
    newId = id + offset * 7;
    if(col - offset >= 0 && row + offset <= 7){
      if(allSquares[newId].firstChild?.getAttribute("color") == color){
        defendedPieces[newId] = [allSquares[newId], defendedPieces[newId][1].concat(bishopPiece)];
        break;
      }
      if(allSquares[newId].firstChild){
        color == 'white' ?
        attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2], attackedSquares[newId][3].concat(bishopPiece)] :
        attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color, attackedSquares[newId][3].concat(bishopPiece)];
        break;
      }
      color == 'white' ?
        attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2], attackedSquares[newId][3].concat(bishopPiece)] :
        attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color, attackedSquares[newId][3].concat(bishopPiece)];
    }
  }
}

/**
 * Calculates the pinned pieces from a bishop on the chessboard and updates the global pinned array
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
 * Calculates the possible moves and checks for a knight.
 * ! this also updates the global checks array
 * 
 * @param {number} id - The current position of the knight on the chessboard.
 * @param {string} color - The color of the knight ('white' or 'black').
 */
function knightMovesChecks(id, color){ // -6, -10, -15, -17, 6, 10, 15, 17
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
 * Calculates the possible attacks and defended pieces by the knight and updates
 * the global attacks and defense arrays
 * 
 * @param {number} id - The current position of the knight on the chessboard.
 * @param {string} color - The color of the knight ('white' or 'black').
 */
function knightAttacksDefense(id, color){ // -6, -10, -15, -17, 6, 10, 15, 17
  let newId = id;
  const row = Math.floor(id / 8);
  const col = id % 8;
  let knightPiece = document.querySelector(`[square-id="${id}"]`).firstChild;
  newId = id - 6;
  if(col + 2 <= 7 && row - 1 >= 0){
    if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
        defendedPieces[newId] = [allSquares[newId], defendedPieces[newId][1].concat(knightPiece)];
    }
    else
      color == 'white' ?
      attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2], attackedSquares[newId][3].concat(knightPiece)] :
      attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color, attackedSquares[newId][3].concat(knightPiece)];
  }
  newId = id - 10;
  if(col - 2 >= 0 && row - 1 >= 0){
    if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = [allSquares[newId], defendedPieces[newId][1].concat(knightPiece)];
    }
    else
      color == 'white' ?
      attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2], attackedSquares[newId][3].concat(knightPiece)] :
      attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color, attackedSquares[newId][3].concat(knightPiece)];
  }
  newId = id - 15;
  if(col + 1 <= 7 && row - 2 >= 0){
    if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = [allSquares[newId], defendedPieces[newId][1].concat(knightPiece)];
    }
    else
      color == 'white' ?
      attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2], attackedSquares[newId][3].concat(knightPiece)] :
      attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color, attackedSquares[newId][3].concat(knightPiece)];
  }
  newId = id - 17;
  if(col - 1 >= 0 && row - 2 >= 0){
    if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = [allSquares[newId], defendedPieces[newId][1].concat(knightPiece)];
    }
    else
      color == 'white' ?
      attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2], attackedSquares[newId][3].concat(knightPiece)] :
      attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color, attackedSquares[newId][3].concat(knightPiece)];
  }
  newId = id + 6;
  if(col - 2 >= 0 && row + 1 <= 7){
    if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = [allSquares[newId], defendedPieces[newId][1].concat(knightPiece)];
    }
    else
      color == 'white' ?
      attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2], attackedSquares[newId][3].concat(knightPiece)] :
      attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color, attackedSquares[newId][3].concat(knightPiece)];
  }
  newId = id + 10;
  if(col + 2 <= 7 && row + 1 <= 7){
    if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = [allSquares[newId], defendedPieces[newId][1].concat(knightPiece)];
    }
    else
      color == 'white' ?
      attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2], attackedSquares[newId][3].concat(knightPiece)] :
      attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color, attackedSquares[newId][3].concat(knightPiece)];
  }
  newId = id + 15;
  if(col - 1 >= 0 && row + 2 <= 7){
    if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = [allSquares[newId], defendedPieces[newId][1].concat(knightPiece)];
    }
    else
      color == 'white' ?
      attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2], attackedSquares[newId][3].concat(knightPiece)] :
      attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color, attackedSquares[newId][3].concat(knightPiece)];
  }
  newId = id + 17;
  if(col + 1 <= 7 && row + 2 <= 7){
    if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = [allSquares[newId], defendedPieces[newId][1].concat(knightPiece)];
    }
    else
      color == 'white' ?
      attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2], attackedSquares[newId][3].concat(knightPiece)] :
      attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color, attackedSquares[newId][3].concat(knightPiece)];
  }
}

/**
 * Calculates the possible moves and checks for a king.
 * ! this also updates the global checks array
 * 
 * @param {number} id - The ID of the square where the king is located.
 * @param {string} color - The color of the king piece ('white' or 'black').
 */
function kingMovesChecks(id, color){
  let newId = id;
  const row = Math.floor(id / 8);
  const col = id % 8;
  newId = id - 1;
  if(col - 1 >= 0){
    if(!(allSquares[newId].firstChild?.getAttribute("color") == color)){
      if(allSquares[newId].firstChild && defendedPieces[newId][0] == 0){
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
      if(allSquares[newId].firstChild && defendedPieces[newId][0] == 0){
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
      if(allSquares[newId].firstChild && defendedPieces[newId][0] == 0){
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
      if(allSquares[newId].firstChild && defendedPieces[newId][0] == 0){
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
      if(allSquares[newId].firstChild && defendedPieces[newId][0] == 0){
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
      if(allSquares[newId].firstChild && defendedPieces[newId][0] == 0){
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
      if(allSquares[newId].firstChild && defendedPieces[newId][0] == 0){
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
      if(allSquares[newId].firstChild && defendedPieces[newId][0] == 0){
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
 * Calculates the possible attacks and defended pieces by the king and updates
 * the global attacks and defense arrays
 * 
 * @param {number} id - The ID of the square where the king is located.
 * @param {string} color - The color of the king piece ('white' or 'black').
 */
function kingAttacksDefense(id, color){
  let newId = id;
  const row = Math.floor(id / 8);
  const col = id % 8;
  let kingPiece = document.querySelector(`[square-id="${id}"]`).firstChild;
  newId = id - 1;
  if(col - 1 >= 0){
    if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
        defendedPieces[newId] = [allSquares[newId], defendedPieces[newId][1].concat(kingPiece)];
    }
    else
      color == 'white' ?
      attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2], attackedSquares[newId][3].concat(kingPiece)] :
      attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color, attackedSquares[newId][3].concat(kingPiece)];
  }
  newId = id + 1;
  if(col + 1 <= 7){
    if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = [allSquares[newId], defendedPieces[newId][1].concat(kingPiece)];
    }
    else
      color == 'white' ?
      attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2], attackedSquares[newId][3].concat(kingPiece)] :
      attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color, attackedSquares[newId][3].concat(kingPiece)];
  }
  newId = id - 8;
  if(row - 1 >= 0){
    if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = [allSquares[newId], defendedPieces[newId][1].concat(kingPiece)];
    }
    else
      color == 'white' ?
      attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2], attackedSquares[newId][3].concat(kingPiece)] :
      attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color, attackedSquares[newId][3].concat(kingPiece)];
  }
  newId = id + 8;
  if(row + 1 <= 7){
    if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = [allSquares[newId], defendedPieces[newId][1].concat(kingPiece)];
    }
    else
      color == 'white' ?
      attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2], attackedSquares[newId][3].concat(kingPiece)] :
      attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color, attackedSquares[newId][3].concat(kingPiece)];
  }
  newId = id + 9;
  if(col + 1 <= 7 && row + 1 <= 7){
    if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = [allSquares[newId], defendedPieces[newId][1].concat(kingPiece)];
    }
    else
      color == 'white' ?
      attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2], attackedSquares[newId][3].concat(kingPiece)] :
      attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color, attackedSquares[newId][3].concat(kingPiece)];
  }
  newId = id + 7;
  if(col - 1 >= 0 && row + 1 <= 7){
    if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = [allSquares[newId], defendedPieces[newId][1].concat(kingPiece)];
    }
    else
      color == 'white' ?
      attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2], attackedSquares[newId][3].concat(kingPiece)] :
      attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color, attackedSquares[newId][3].concat(kingPiece)];
  }
  newId = id - 7;
  if(col + 1 <= 7 && row - 1 >= 0){
    if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = [allSquares[newId], defendedPieces[newId][1].concat(kingPiece)];
    }
    else
      color == 'white' ?
      attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2], attackedSquares[newId][3].concat(kingPiece)] :
      attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color, attackedSquares[newId][3].concat(kingPiece)];
  }
  newId = id - 9;
  if(col - 1 >= 0 && row - 1 >= 0){
    if(allSquares[newId].firstChild &&
      allSquares[newId].firstChild.getAttribute("color") == color){
      defendedPieces[newId] = [allSquares[newId], defendedPieces[newId][1].concat(kingPiece)];
    }
    else
      color == 'white' ?
      attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2], attackedSquares[newId][3].concat(kingPiece)] :
      attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color, attackedSquares[newId][3].concat(kingPiece)];
  }
}

/**
 * Calculates the possible moves and checks for a pawn.
 * ! this also updates the global checks array
 * 
 * @param {number} id - The ID of the pawn.
 * @param {string} color - The color of the pawn ('white' or 'black').
 */
function pawnMovesChecks(id, color){
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
 * Calculates the possible attacks and defended pieces by the pawn and updates
 * the global attacks and defense arrays
 * 
 * @param {number} id - The ID of the pawn.
 * @param {string} color - The color of the pawn ('white' or 'black').
 */
function pawnAttacksDefense(id, color){
  let newId = id;
  const col = id % 8;
  let pawnPiece = document.querySelector(`[square-id="${id}"]`).firstChild;
  switch(color) {
    case "white":
      // checks if there is a piece on its diagonals or en passant
      newId = id - 7;
      if(col + 1 <= 7 && (!allSquares[newId].firstChild || allSquares[newId].firstChild.getAttribute("color") != color)){
        attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2], attackedSquares[newId][3].concat(pawnPiece)];
      }
      if(col + 1 <= 7 && allSquares[newId].firstChild &&
        allSquares[newId].firstChild.getAttribute("color") == color){
          defendedPieces[newId] = [allSquares[newId], defendedPieces[newId][1].concat(pawnPiece)];
      }
      if(col + 1 <= 7 && allSquares[id + 1].firstChild?.getAttribute("id").toLowerCase() == 'p' &&
        allSquares[id + 1].firstChild.getAttribute("enpassant") == 'true' &&
        allSquares[id + 1].firstChild.getAttribute("color") != color){
          attackedSquares[id + 1] = [allSquares[id + 1], color, attackedSquares[id + 1][2], attackedSquares[id + 1][3].concat(pawnPiece)];
      }
      newId = id - 9;
      if(col - 1 >= 0 && (!allSquares[newId].firstChild || allSquares[newId].firstChild.getAttribute("color") != color)){
        attackedSquares[newId] = [allSquares[newId], color, attackedSquares[newId][2], attackedSquares[newId][3].concat(pawnPiece)];
      }
      if(col - 1 >= 0 && allSquares[newId].firstChild &&
        allSquares[newId].firstChild.getAttribute("color") == color){
          defendedPieces[newId] = [allSquares[newId], defendedPieces[newId][1].concat(pawnPiece)];
      }
      if(col - 1 >= 0 && allSquares[id - 1].firstChild?.getAttribute("id").toLowerCase() == 'p' &&
        allSquares[id - 1].firstChild.getAttribute("enpassant") == 'true' &&
        allSquares[id - 1].firstChild.getAttribute("color") != color){
          attackedSquares[id - 1] = [allSquares[id - 1], color, attackedSquares[id - 1][2], attackedSquares[id - 1][3].concat(pawnPiece)];
      }
      break;
    case "black":
      // checks if there is a piece on its diagonals or en passant
      newId = id + 7;
      if(col - 1 >= 0 && (!allSquares[newId].firstChild || allSquares[newId].firstChild.getAttribute("color") != color)){
        attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color, attackedSquares[newId][3].concat(pawnPiece)];
      }
      if(col - 1 >= 0 && allSquares[newId].firstChild &&
        allSquares[newId].firstChild.getAttribute("color") == color){
          defendedPieces[newId] = [allSquares[newId], defendedPieces[newId][1].concat(pawnPiece)];
      }
      if(col - 1 >= 0 && allSquares[id - 1].firstChild?.getAttribute("id").toLowerCase() == 'p' &&
        allSquares[id - 1].firstChild.getAttribute("enpassant") == 'true' &&
        allSquares[id - 1].firstChild.getAttribute("color") != color){
          attackedSquares[id - 1] = [allSquares[id - 1], attackedSquares[id - 1][1], color, attackedSquares[id - 1][3].concat(pawnPiece)];
      }
      newId = id + 9;
      if(col + 1 <= 7 && (!allSquares[newId].firstChild || allSquares[newId].firstChild.getAttribute("color") != color)){
        attackedSquares[newId] = [allSquares[newId], attackedSquares[newId][1], color, attackedSquares[newId][3].concat(pawnPiece)];
      }
      if(col + 1 <= 7 && allSquares[newId].firstChild &&
        allSquares[newId].firstChild.getAttribute("color") == color){
          defendedPieces[newId] = [allSquares[newId], defendedPieces[newId][1].concat(pawnPiece)];
      }
      if(col + 1 <= 7 && allSquares[id + 1].firstChild?.getAttribute("id").toLowerCase() == 'p' &&
        allSquares[id + 1].firstChild.getAttribute("enpassant") == 'true' &&
        allSquares[id + 1].firstChild.getAttribute("color") != color){
          attackedSquares[id + 1] = [allSquares[id + 1], attackedSquares[id + 1][1], color, attackedSquares[id + 1][3].concat(pawnPiece)];
      }
      break;
  }
}

let calculatedMoves = 0;

/**
 * Chooses a move for the bot player.
 * 
 * @param {string} botColor - the turn which tells which color the bot needs to choose the move for
 * @returns {Object} The move object containing the starting square and destination.
 */
function makeBotMove(botColor) {
  let allMoves = [];
  let bestMove = {};
  let bestMinOppScore = Infinity;

  // all possible moves have been calculated for the bot's position
  allMoves = calculateColorMoves(botColor);

  // now sift through all future moves and find the best result
  for (let i = 0; i < allMoves.length; i++) {
    // chooses and makes a move to see how well the opponent can respond
    const move = allMoves[i];
    let start = document.querySelector(`[square-id="${move.start}"]`);
    let destination = document.querySelector(`[square-id="${move.destination}"]`);
    let possiblePosition = '';
    switchTurns();
    makeMove(start, destination);
    possiblePosition = updateFEN();
    console.log(move, possiblePosition, turn);

    // determines the best score for the opponent given the new position
    let oppScore = searchMoves(1, -Infinity, Infinity);
    console.log('bestOppResponse', oppScore);

    // undoes the previous move made
    gameStates.pop();
    createBoard(gameStates[gameStates.length - 1], false);
    listenOnSquares();

    if (oppScore < bestMinOppScore) {
      // this score is more favorable for the player so we save this move
      bestMinOppScore = oppScore;
      bestMove = move;
    }
  }
  console.log(bestMove, gameStates);
  console.log(calculatedMoves, 'number of positions calculated');
  calculatedMoves = 0;
  return bestMove;
}


/**
 * Searches for the best score using the minimax algorithm with alpha-beta pruning given a new position.
 * 
 * @param {number} depth - The depth of the search tree.
 * @param {number} alpha - The best value for the player maximizing the position.
 * @param {number} beta - The best value for the player minimizing the position.
 * @returns {number} - The best score found as a result of a particular move.
 */
function searchMoves(depth, alpha, beta){
  let allMoves = [];
  let score = 0;
  let bestMove = 0;
  if(depth == 0){
    // the line is complete so return the final position
    calculatedMoves++;
    return evaluateBoard(turn);
  }
  allMoves = calculateColorMoves(turn);
  for(let i = 0; i < allMoves.length; i++){
    // chooses a new move to start a new line of calculation
    let move = allMoves[i];
    let start = document.querySelector(`[square-id="${move.start}"]`);
    let destination = document.querySelector(`[square-id="${move.destination}"]`);
    switchTurns();
    makeMove(start, destination);

    // search through the new position
    score = -searchMoves(depth - 1, -beta, -alpha);
    console.log(score, 'potential position score');

    // undo the previous move made
    gameStates.pop();
    createBoard(gameStates[gameStates.length - 1], false);
    listenOnSquares();

    if(score >= beta){
      // this score is too bad for the player so we cut this calculation short
      console.log(beta, "snip");
      return beta;
    }
    if(score > alpha){
      // store this as the new best value achievable
      bestMove = move;
      alpha = score;
    }
  }
  console.log(bestMove, 'bestMove for opponent');
  return alpha;
}

/**
 * Calculates the evaluation of the current board for the bot to consider
 * 
 * @param color determines whether or not the evaluation should be for the white player or black player
 * @returns the score of the current position
 */
function evaluateBoard(color){
  let playerPerspective = 1;
  if(color.toLowerCase() == 'black')
    playerPerspective = -1;
  let score = countPieceVal('white') - countPieceVal('black');
  calculateAttacksDefense();
  for(let i = 0; i < attackedSquares.length; i++){
    if(attackedSquares[i][0] != 0 && attackedSquares[i][0].innerHTML != ''){
      let calculatedSquare = calculateCaptures(i);
      score += calculatedSquare;
    }
  }
  return score * playerPerspective;
}

/**
 * Calculates squares that are attacked and returns a number after series of captures are evaluated
 * 
 * @param {number} squareId - the square position
 * @returns {number} - the evaluation after calculating the specific square
 */
function calculateCaptures(squareId){
  let piece = attackedSquares[squareId][0].firstChild;
  let playerPerspective = 1;
  piece.getAttribute('color') == 'white' ? playerPerspective = 1 : playerPerspective = -1;

  let attacking = false;
  let pieceToCapture = 0;
  let attackingPieces = attackedSquares[squareId][3].map(piece => pieceScore(piece)).sort();
  let defendingPieces = defendedPieces[squareId][1].map(piece => pieceScore(piece)).sort();
  let attackingScore = 0;
  let defendingScore = 0;
  attackingScore += pieceScore(piece);
  pieceToCapture = attackingPieces[0];
  while(attackingPieces.length != 0 && defendingPieces.length != 0){
    if(attacking && (defendingPieces[0] > attackingPieces[0] || defendingPieces.length == 1)){
      attackingScore += defendingPieces.shift();
      attacking = false;
      pieceToCapture = attackingPieces[0];
    }
    else if(attacking) {
      break;
    }
    else if(defendingPieces[0] < attackingPieces[0] || attackingPieces.length == 1){
      defendingScore += attackingPieces.shift();
      attacking = true;
      pieceToCapture = defendingPieces[0];
    }
    else{
      break;
    }
  }
  if(attackingScore - defendingScore > 0){
    return -pieceScore(piece) * playerPerspective;
  }
  return 0;
}

/**
 * Calculates the score of the given piece
 * 
 * @param {Object} piece - piece to find value of
 * @returns {number} - score of the piece
 */
function pieceScore(piece){
  switch(piece.id){
    case 'p':
    case 'P':
      return 1;
    case 'r':
    case 'R':
      return 5;
    case 'n':
    case 'N':
      return 3;
    case 'b':
    case 'B':
      return 3;
    case 'q':
    case 'Q':
      return 9;
    case 'k':
    case 'K':
      return 10;
    default:
      return 0;
  }
}

/**
 * Calculates the total value of pieces for a given color.
 * 
 * @param {string} color - The color of the pieces ('black' or 'white').
 * @returns {number} - The total value of the pieces.
 */
function countPieceVal(color){
  let score = 0;
  if(color.toLowerCase() == 'black'){
    allBlack = document.querySelectorAll("div[color='black']");
    allBlack.forEach(piece => {
      let squareId = parseInt(piece.parentNode.getAttribute('square-id'));
      score += pieceScore(piece);
      if(piece.id == 'p')
        score += Math.floor(squareId / 8) * .1;
      let moves = calculateMovesChecks(piece.parentNode);
      if(pinnedPieces[squareId][1] != 0){
        moves = moves.filter(move => pinnedPieces.map(pair => pair[0]).includes(move));
      }
      score += moves.length * 0.1;
    });
  }
  else {
    allWhite = document.querySelectorAll("div[color='white']");
    allWhite.forEach(piece => {
      let squareId = parseInt(piece.parentNode.getAttribute('square-id'));
      score += pieceScore(piece);
      if(piece.id == 'p')
        score += (8 - Math.floor(squareId / 8)) * .1;
      let moves = calculateMovesChecks(piece.parentNode);
      if(pinnedPieces[squareId][1] != 0){
        moves = moves.filter(move => pinnedPieces.map(pair => pair[0]).includes(move));
      }
      score += moves.length * 0.1;
    });
  }
  return score;
}

/**
 * Calculates all possible moves for the given color
 * 
 * @param color - the color of the pieces to calculate
 * @returns a list of all possible moves for the color
 */
function calculateColorMoves(color){
  let allMoves = [];
  let allColorPieces = document.querySelectorAll(`div[color='${color.toLowerCase()}']`);

  // so we can filter moves for pinned pieces accordingly
  calculatePins();
  calculateChecks();

  // calculates all pieces except for the king since we want king moves to be considered last
  allColorPieces.forEach(piece => {
    if(piece.id.toLowerCase() != 'k'){
      let moves = calculateMovesChecks(piece.parentNode);
      if(pinnedPieces[parseInt(piece.parentNode.getAttribute('square-id'))][1] != 0){
        moves = moves.filter(move => pinnedPieces.map(pair => pair[0]).includes(move));
      }
      moves.forEach(move => {
        if(checks.length > 0){
          if(checks.includes(move)){
            allMoves.push({start: piece.parentNode.getAttribute("square-id"), destination: move.getAttribute("square-id")});
          }
        }
        else{
          allMoves.push({start: piece.parentNode.getAttribute("square-id"), destination: move.getAttribute("square-id")});
        }
      });
    }
  });

  // deals with calculating king moves
  let kingPiece = '';
  color.toLowerCase() == 'white' ? kingPiece = 'K' : kingPiece = 'k';
  let kingMoves = calculateMovesChecks(document.getElementById(kingPiece).parentNode);
  let kingPosition = document.getElementById(kingPiece).parentNode.getAttribute("square-id");
  kingMoves.forEach(move => {
    allMoves.push({start: kingPosition, destination: move.getAttribute("square-id")});
  });
  return allMoves;
}

/**
 * Changes the background color of each square in the moves array to crimson.
 */
function colorMoves() {
  moves.forEach(square => {
    square.style.backgroundColor = 'crimson';
  });
  // attackedSquares.forEach(square => {
  //   if(square[0] != 0)
  //   square[0].style.backgroundColor = 'blue';
  // });
  // defendedPieces.forEach(piece => {
  //   if(piece[0] != 0)
  //   piece[0].style.backgroundColor = 'yellow';
  // });
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
 * Calculates the checks in the chess game which updates the global checks array
 */
function calculateChecks() {
  allPieces = document.querySelectorAll(".piece");
  checks = [];
  allPieces.forEach(piece => {
    calculateMovesChecks(piece.parentNode);
  });
}

/**
 * Checks if the current game state is a checkmate or draw.
 * 
 * @returns {boolean} Returns true if the game state is a checkmate or draw, false otherwise.
 */
function checkForCheckMateOrDraw(){
  let possibleMoves = [];
  possibleMoves = calculateColorMoves(turn);
  return possibleMoves.length == 0;
}