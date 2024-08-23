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
let moveDelay = 300;

// custom event so bot knows when to start its calculations for the current position
const playerMoved = new CustomEvent("playerMoved");

// event listeners for the buttons on the website
const buttonStart = document.getElementById('buttonStart');
const buttonPrevious = document.getElementById('previous');
const buttonNext = document.getElementById('next');
const buttonCopy = document.getElementById('copyCurrentPosition');
buttonStart.addEventListener("click", function () {
  if(playerWhite == 'Bot' && turn == "White" || playerBlack == 'Bot' && turn == "Black")
    document.dispatchEvent(new Event("playerMoved"));
});
buttonPrevious.addEventListener("click", function () {
  if(historyMove > 0){
    if (turn === 'White') {
      turn = 'Black';
    } else {
      turn = 'White';
    }
    historyMove % 2 == 1 ? selfMove.play() : oppMove.play();
    historyMove--;
    createBoard(gameStates[historyMove], false);
    document.getElementById('numMoves').innerHTML = `Move ${parseInt(numMoves / 2)}`;
    let evaluation = evaluateBoard(turn);
    document.getElementById("evaluation").innerHTML = `Evaluation: ${turn == 'White' ? evaluation.toFixed(2) : -evaluation.toFixed(2)}`;
    updateEvalBar(evaluation);
  }
});
buttonNext.addEventListener("click", function () {
  if(historyMove < gameStates.length - 1){
    if (turn === 'White') {
      turn = 'Black';
    } else {
      turn = 'White';
    }
    historyMove % 2 == 1 ? selfMove.play() : oppMove.play();
    historyMove++;
    createBoard(gameStates[historyMove], false);
    if(historyMove == gameStates.length - 1)
      listenOnSquares();
    document.getElementById('numMoves').innerHTML = `Move ${parseInt(numMoves / 2)}`;
    let evaluation = evaluateBoard(turn);
    document.getElementById("evaluation").innerHTML = `Evaluation: ${turn == 'White' ? evaluation.toFixed(2) : -evaluation.toFixed(2)}`;
    updateEvalBar(evaluation);
  }
});
buttonCopy.addEventListener("click", function () {
  const copyText = updateFEN();
  navigator.clipboard.writeText(copyText).then(function() {
    alert('Copied FEN code to clipboard');
  }, function(err) {
    alert('Failed to copy FEN code to clipboard');
  });
});

document.getElementById('optionsForm').addEventListener('submit', function(event) {
  event.preventDefault();
  const players = document.querySelector('input[name="players"]:checked').value;
  const customFEN = document.querySelector('input[name="FENCode"]').value;
  switch(players){
    case 'PvP':
      playerWhite = 'Player';
      playerBlack = 'Player';
      break;
    case 'PvAI':
      playerWhite = 'Player';
      playerBlack = 'Bot';
      break;
    case 'AIvP':
      playerWhite = 'Bot';
      playerBlack = 'Player';
      break;
    case 'AIvAI':
      playerWhite = 'Bot';
      playerBlack = 'Bot';
      buttonStart.style.display = 'flex';
      break;
  }

  if(customFEN){
    if(!isValidFEN(customFEN)){
      alert('Invalid FEN code');
      return;
    }
    createBoard(customFEN, true);
  }
  else
    createBoard(FENCode, true);
  listenOnSquares();
  document.getElementById('turn').innerHTML = `${turn}'s Turn`;
  document.getElementById('numMoves').innerHTML = `Move ${parseInt(numMoves / 2)}`;
  let evaluation = evaluateBoard(turn);
  document.getElementById("evaluation").innerHTML = `Evaluation: ${turn == 'White' ? evaluation.toFixed(2) : -evaluation.toFixed(2)}`;
  updateEvalBar(evaluation);
  gameStart.play();
  document.getElementById("chessBoardContainer").style.display = 'flex';
  document.getElementById("evaluationBar").style.display = 'flex';
  document.getElementById("evaluationBarContainer").style.display = 'flex';
  document.getElementById("chessBoard").style.display = 'flex';
  document.getElementById("information").style.display = 'flex';
  document.getElementById("controlMoves").style.display = 'flex';
  document.querySelector('.options-menu').style.display = 'none';
  document.getElementById('buttonStart').click();
});

// piece that has been selected by the user / bot so we know which moves to show
let selectedSquare;

// selection of pieces to keep track of (these will be redefined throughout runtime)
let allPawns;
let allPieces;
let allBlack;
let allWhite;

// keeps track of all squares of the board (will also be redefined throughout runtime)
let allSquares;

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
  allPieces = document.querySelectorAll(".piece");
  allSquares.forEach(square => {
    square.addEventListener("click", function (e) {
      let destination = e.target;
      let teamInCheck = false;
      let numPieces = allPieces.length;
      // no piece has been selected yet, so select this one and show possible moves
      if(!selectedSquare && !gameOver){
        selectedSquare = e.target;
        if(selectedSquare.innerHTML == ''){
          selectedSquare = '';
          return;
        }

        // colors the selected square to visually let the player know the selection was made
        selectedSquare.style.backgroundColor='rgb(204, 153, 102)';

        // filters the moves depending on if the team is currently in check
        calculateChecks();
        checks.forEach(position => {
          if(position == document.getElementById(selectedSquare.firstChild.getAttribute('color') == 'white' ? 'K' : 'k').parentNode){
            teamInCheck = true;
          }
        });
        calculatePins();
        calculateMovesChecks(selectedSquare);
        if(checks.length != 0 && teamInCheck && selectedSquare?.firstChild?.id.toLowerCase() != 'k'){
          // add the square that includes enpassant in checks if that is included
          let enPassantPiece = document.querySelector('[enpassant="true"]');
          if(enPassantPiece && checks.includes(enPassantPiece.parentNode)){
            console.log('pushing piece', checks);
            if(enPassantPiece.id == 'p')
              checks.push(document.querySelector(`[square-id="${parseInt(enPassantPiece.parentNode.getAttribute('square-id')) - 8}"]`));
            else
              checks.push(document.querySelector(`[square-id="${parseInt(enPassantPiece.parentNode.getAttribute('square-id')) + 8}"]`));
            console.log('pushed piece', checks);
          }
          // filters the moves if the king is in check and the player must move the king
          moves = moves.filter(move => checks.includes(move));
        }

        // filters the moves if the piece is pinned
        let squareId = parseInt(selectedSquare.getAttribute('square-id'));
        if(pinnedPieces[squareId][0] != 0 && pinnedPieces[squareId][1] >= 2){
          let pinningId = 0;
          let pinningColor = 0;
          let pinLine = [];
          pinnedPieces.forEach(element => {
            if((element[1] == 1 || element[1] >= 3) && pinLine.length == 0 && element[0] != selectedSquare){
              pinningId = parseInt(element[0].getAttribute('square-id'));
              pinningColor = element[0].firstChild.getAttribute('color');
              pinningType = element[0].firstChild.id.toLowerCase();
              if(pinningType == 'r' || pinningType == 'q'){
                pinLine = rookPins(pinningId, pinningColor);
              }
              if(pinLine.length == 0 || !pinLine.includes(selectedSquare)){
                pinLine = [];
              }
              if(pinLine.length == 0 && (pinningType == 'b' || pinningType == 'q')){
                pinLine = bishopPins(pinningId, pinningColor);
              }
              if(pinLine.length == 0 || !pinLine.includes(selectedSquare)){
                pinLine = [];
              }
            }
          });
          moves = moves.filter(move => pinLine.includes(move));
        }

        // now that we have the correct moves to display, color the moves
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
            let piece = selectedSquare.firstChild.id;
            if(piece.toLowerCase() == 'p' || destination.firstChild)
              numHalfMoves = 0;
            
            // updates the last move made in the game
            let lastMove = document.getElementById('lastMove');
            let startCol = String.fromCharCode('a'.charCodeAt(0) + (parseInt(selectedSquare.getAttribute('square-id')) % 8));
            let endCol = String.fromCharCode('a'.charCodeAt(0) + (parseInt(destination.getAttribute('square-id')) % 8));
            let endRow = (8 - Math.floor(parseInt(destination.getAttribute('square-id')) / 8)).toString();
            let parser = new DOMParser();
            let doc = parser.parseFromString(pieces.get(piece), 'text/html');
            let div = doc.querySelector('div');
            let svg = doc.querySelector('svg');
            svg.classList.add('lastMovePiece');
            let pieceImage = div.innerHTML;
            if(piece.toLowerCase() == 'p'){
              if(destination.firstChild){
                lastMove.innerHTML = `Last Move: ${pieceImage}${startCol}x${endCol + endRow}`;
              }
              else{
                lastMove.innerHTML = `Last Move: ${pieceImage}${endCol + endRow}`;
              }
            }
            else if(piece.toLowerCase() == 'k' && Math.abs(parseInt(selectedSquare.getAttribute('square-id')) - parseInt(destination.getAttribute('square-id'))) == 2){
              lastMove.innerHTML = `Last Move: ${pieceImage}0-0${endCol == 'c' ? '-0' : ''}`;
            }
            else{
              lastMove.innerHTML = `Last Move: ${pieceImage}${piece}${destination.firstChild ? 'x' : ''}${endCol + endRow}`;
            }

            // handles the move and updates checks array
            switchTurns();
            makeMove(selectedSquare, destination);
            calculateChecks();


            gameOver = checkForCheckMateOrDraw();
            if(checks.length > 0 && gameOver){
              // the current position is checkmate
              lastMove.innerHTML += '#';
              switchTurns();
              checkmate.play();
            }
            else if(gameOver || numHalfMoves == 100 || checkForThreeFoldRepetition()){
              // the current position is a draw or 100 halfMoves occur or position has been repeated, which are all draws
              scatter.play();
              draw = true;
              gameOver = true;
            }
            else if(checks.length > 0){
              // just a check is made
              lastMove.innerHTML += '+';
              check.play();
            }
            else if(numPieces != allPieces.length){
              // a capture occurred
              capture.play();
            }
            else{
              // only a piece move occurred
              color == 'white' ? selfMove.play() : oppMove.play();
            }
            if(!gameOver && !draw){
              if(playerWhite == 'Bot' && turn == "White" || playerBlack == 'Bot' && turn == "Black"){
                // if the player to move now is a bot, make the bot move
                setTimeout(function() {document.dispatchEvent(new Event("playerMoved"))}, moveDelay);
              }
              document.getElementById('numMoves').innerHTML = `Move ${parseInt(numMoves / 2)}`;
              let evaluation = evaluateBoard(turn);
              document.getElementById("evaluation").innerHTML = `Evaluation: ${turn == 'White' ? evaluation.toFixed(2) : -evaluation.toFixed(2)}`;
              updateEvalBar(evaluation);
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

// Calculates and makes the move for the bot
document.addEventListener("playerMoved", function () {
  // checks to make sure we are not looking back at a previous position
  if(historyMove == gameStates.length - 1){
    let botMove = makeBotMove(turn);
    // console.log(botMove, 'chosen move');
    let botStart = document.querySelector(`[square-id="${botMove.start}"]`);
    let botDestination = document.querySelector(`[square-id="${botMove.destination}"]`);
    botStart.click();
    botDestination.click();
  }
});

/**
 * Updates the evaluation bar given the input evaluation number
 * 
 * @param {number} evaluation - The evaluation of the current position
 */
function updateEvalBar(evaluation) {
  let evalBar = document.getElementById("evaluationBar");
  let width = (turn == 'White' ? evaluation : -evaluation) * 5 + 50;
  if(width < 0)
    evalBar.style.width = `0`;
  else
    evalBar.style.width = `${width}%`;
}

/**
 * Checks if the current position has been repeated three times and is a draw.
 * @returns {boolean} - True if the position is a draw, False otherwise.
 */
function checkForThreeFoldRepetition(){
  let count = 0;
  let currPosition = updateFEN().split(' ');
  for(let i = 0; i < gameStates.length; i++){
    let iteratedPosition = gameStates[i].split(' ');
    if(iteratedPosition[0] == currPosition[0] && iteratedPosition[1] == currPosition[1] && iteratedPosition[2] == currPosition[2])
      count++;
  }
  return count >= 3;
}

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
  
  // in the instance that there is a double check, the only valid move is a king move
  let checkCount = 0;
  let checkColor = '';
  checks.forEach(square => {
    if(square.firstChild && square.firstChild.id.toLowerCase() != 'k'){
      checkCount++;
    }
    if(square.firstChild && square.firstChild.id == 'k'){
      checkColor = 'black';
    }
    if(square.firstChild && square.firstChild.id == 'K'){
      checkColor = 'white';
    }
  });
  if(checkCount > 1 && checkColor == color.toLowerCase() && pieceType != 'k'){
    return [];
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
  let pins = [];
  let pinned = -1;
  const row = Math.floor(id / 8);
  const col = id % 8;
  let newId = 0;
  for(let offset = -1; offset > -8; offset--){
    newId = id + offset;
    if(col + offset >= 0){
      if(allSquares[newId].firstChild?.getAttribute("color") == color) break;
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() != 'k')
        pinLine.push(newId);
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k' && pinned != -1){
        pinLine.forEach(element => {
          if(!allSquares[element].firstChild)
            pinnedPieces[element] = [allSquares[element], 0];
          else{
            if(pinnedPieces[element][1] == 1)
              pinnedPieces[element] = [allSquares[element], 3];
            else
              pinnedPieces[element] = [allSquares[element], 2];
          }
        });
        if(pinnedPieces[id][1] == 2)
          pinnedPieces[id] = [allSquares[id], 3];
        else
          pinnedPieces[id] = [allSquares[id], 1];
        pinLine.forEach(id => {
          pins.push(allSquares[id]);
        });
        pins.push(allSquares[id]);
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
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() != 'k')
        pinLine.push(newId);
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k' && pinned != -1){
        pinLine.forEach(element => {
          if(!allSquares[element].firstChild)
            pinnedPieces[element] = [allSquares[element], 0];
          else{
            if(pinnedPieces[element][1] == 1)
              pinnedPieces[element] = [allSquares[element], 3];
            else
              pinnedPieces[element] = [allSquares[element], 2];
          }
        });
        if(pinnedPieces[id][1] == 2)
          pinnedPieces[id] = [allSquares[id], 3];
        else
          pinnedPieces[id] = [allSquares[id], 1];
        pinLine.forEach(id => {
          pins.push(allSquares[id]);
        });
        pins.push(allSquares[id]);
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
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() != 'k')
        pinLine.push(newId);
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k' && pinned != -1){
        pinLine.forEach(element => {
          if(!allSquares[element].firstChild)
            pinnedPieces[element] = [allSquares[element], 0];
          else{
            if(pinnedPieces[element][1] == 1)
              pinnedPieces[element] = [allSquares[element], 3];
            else
              pinnedPieces[element] = [allSquares[element], 2];
          }
        });
        if(pinnedPieces[id][1] == 2)
          pinnedPieces[id] = [allSquares[id], 3];
        else
          pinnedPieces[id] = [allSquares[id], 1];
        pinLine.forEach(id => {
          pins.push(allSquares[id]);
        });
        pins.push(allSquares[id]);
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
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() != 'k')
        pinLine.push(newId);
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k' && pinned != -1){
        pinLine.forEach(element => {
          if(!allSquares[element].firstChild)
            pinnedPieces[element] = [allSquares[element], 0];
          else{
            if(pinnedPieces[element][1] == 1)
              pinnedPieces[element] = [allSquares[element], 3];
            else
              pinnedPieces[element] = [allSquares[element], 2];
          }
        });
        if(pinnedPieces[id][1] == 2)
          pinnedPieces[id] = [allSquares[id], 3];
        else
          pinnedPieces[id] = [allSquares[id], 1];
        pinLine.forEach(id => {
          pins.push(allSquares[id]);
        });
        pins.push(allSquares[id]);
      }
      else if(allSquares[newId].firstChild && pinned != -1)
          break;
      if(allSquares[newId].firstChild &&
        pinned == -1)
          pinned = newId;
    }
  }
  return pins;
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
  let pins = [];
  let pinned = -1;
  const row = Math.floor(id / 8);
  const col = id % 8;
  let newId = 0;
  for(let offset = -1; offset > -8; offset--){
    newId = id + offset * 9;
    if(col + offset >= 0 && row + offset >= 0){
      if(allSquares[newId].firstChild?.getAttribute("color") == color) break;
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() != 'k')
        pinLine.push(newId);
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k' && pinned != -1){
        pinLine.forEach(element => {
          if(!allSquares[element].firstChild)
            pinnedPieces[element] = [allSquares[element], 0];
          else{
            if(pinnedPieces[element][1] == 1)
              pinnedPieces[element] = [allSquares[element], 3];
            else
              pinnedPieces[element] = [allSquares[element], 2];
          }
        });
        if(pinnedPieces[id][1] == 2)
          pinnedPieces[id] = [allSquares[id], 3];
        else
          pinnedPieces[id] = [allSquares[id], 1];
        pinLine.forEach(id => {
          pins.push(allSquares[id]);
        });
        pins.push(allSquares[id]);
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
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() != 'k')
        pinLine.push(newId);
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k' && pinned != -1){
        pinLine.forEach(element => {
          if(!allSquares[element].firstChild)
            pinnedPieces[element] = [allSquares[element], 0];
          else{
            if(pinnedPieces[element][1] == 1)
              pinnedPieces[element] = [allSquares[element], 3];
            else
              pinnedPieces[element] = [allSquares[element], 2];
          }
        });
        if(pinnedPieces[id][1] == 2)
          pinnedPieces[id] = [allSquares[id], 3];
        else
          pinnedPieces[id] = [allSquares[id], 1];
        pinLine.forEach(id => {
          pins.push(allSquares[id]);
        });
        pins.push(allSquares[id]);
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
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() != 'k')
        pinLine.push(newId);
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k' && pinned != -1){
        pinLine.forEach(element => {
          if(!allSquares[element].firstChild)
            pinnedPieces[element] = [allSquares[element], 0];
          else{
            if(pinnedPieces[element][1] == 1)
              pinnedPieces[element] = [allSquares[element], 3];
            else
              pinnedPieces[element] = [allSquares[element], 2];
          }
        });
        if(pinnedPieces[id][1] == 2)
          pinnedPieces[id] = [allSquares[id], 3];
        else
          pinnedPieces[id] = [allSquares[id], 1];
        pinLine.forEach(id => {
          pins.push(allSquares[id]);
        });
        pins.push(allSquares[id]);
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
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() != 'k')
        pinLine.push(newId);
      if(allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'k' && pinned != -1){
        pinLine.forEach(element => {
          if(!allSquares[element].firstChild)
            pinnedPieces[element] = [allSquares[element], 0];
          else{
            if(pinnedPieces[element][1] == 1)
              pinnedPieces[element] = [allSquares[element], 3];
            else
              pinnedPieces[element] = [allSquares[element], 2];
          }
        });
        if(pinnedPieces[id][1] == 2)
          pinnedPieces[id] = [allSquares[id], 3];
        else
          pinnedPieces[id] = [allSquares[id], 1];
        pinLine.forEach(id => {
          pins.push(allSquares[id]);
        });
        pins.push(allSquares[id]);
      }
      else if(allSquares[newId].firstChild && pinned != -1)
          break;
      if(allSquares[newId].firstChild &&
        pinned == -1)
          pinned = newId;
    }
  }
  return pins;
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
      if(allSquares[newId].firstChild && defendedPieces[newId][0] == 0 && !checks.includes(newId)){
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
      if(allSquares[newId].firstChild && defendedPieces[newId][0] == 0 && !checks.includes(newId)){
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
      if(allSquares[newId].firstChild && defendedPieces[newId][0] == 0 && !checks.includes(newId)){
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
      if(allSquares[newId].firstChild && defendedPieces[newId][0] == 0 && !checks.includes(newId)){
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
      if(allSquares[newId].firstChild && defendedPieces[newId][0] == 0 && !checks.includes(newId)){
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
      if(allSquares[newId].firstChild && defendedPieces[newId][0] == 0 && !checks.includes(newId)){
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
      if(allSquares[newId].firstChild && defendedPieces[newId][0] == 0 && !checks.includes(newId)){
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
      if(allSquares[newId].firstChild && defendedPieces[newId][0] == 0 && !checks.includes(newId)){
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
  let allMoves = calculateColorMoves(botColor);
  let bestMove = allMoves[0];
  let bestMinOppScore = Infinity;

  // now sift through all future moves and find the best result
  for (let i = 0; i < allMoves.length; i++) {
    // chooses and makes a move to see how well the opponent can respond
    const move = allMoves[i];
    let start = document.querySelector(`[square-id="${move.start}"]`);
    let destination = document.querySelector(`[square-id="${move.destination}"]`);
    // let possiblePosition = '';
    switchTurns();
    makeMove(start, destination);
    possiblePosition = updateFEN();
    // console.log(move, possiblePosition, turn);

    // resolve the initial depth of the search given the current position
    let depth = 1;
    // allPieces = document.querySelectorAll(".piece");
    // allQueens = document.querySelectorAll(".q, .Q");
    // if((allPieces.length <= 8 && allQueens.length == 0) || allPieces.length <= 4){
    //   depth++;
    // }

    // determines the best score for the opponent given the new position
    let oppScore = searchMoves(depth, -Infinity, Infinity);
    // console.log('bestOppResponse', oppScore);

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
  // console.log(bestMove, gameStates);
  // console.log(calculatedMoves, 'number of positions calculated');
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
  // let bestMove = 0;
  if(depth == 0 || checkForThreeFoldRepetition() || checkForCheckMateOrDraw()){
    // the line is complete so return the final position
    calculatedMoves++;
    return evaluateBoard(turn);
  }
  allMoves = calculateColorMoves(turn);
  if(allMoves.length == 0){
    // no moves left so the game would be over in this position
    calculatedMoves++;
    return -Infinity;
  }
  for(let i = 0; i < allMoves.length; i++){
    // chooses a new move to start a new line of calculation
    let move = allMoves[i];
    // console.log(move, 'potential move');
    let start = document.querySelector(`[square-id="${move.start}"]`);
    let destination = document.querySelector(`[square-id="${move.destination}"]`);
    switchTurns();
    makeMove(start, destination);

    // calculate whether or not to extend the depth of the search
    let depthExtension = calculateDepthExtension();

    // search through the new position
    score = -searchMoves(depth - 1 + depthExtension, -beta, -alpha);
    // console.log(score, 'potential position score');

    // undo the previous move made
    gameStates.pop();
    createBoard(gameStates[gameStates.length - 1], false);
    listenOnSquares();

    if(score >= beta){
      // this score is too bad for the player so we cut this calculation short
      // console.log(beta, "snip");
      return beta;
    }
    if(score > alpha){
      // store this as the new best value achievable
      bestMove = move;
      alpha = score;
    }
  }
  // console.log(bestMove, 'bestMove for opponent');
  return alpha;
}

/**
 * Calculates a value to extend the depth of the search function based on the current position
 * 
 * @returns the number of moves to extend the search by
 */
function calculateDepthExtension(){
  let extension = 0;
  allPieces = document.querySelectorAll(".piece");
  calculateChecks();

  // there is a check so it is valuable to know where this ends up
  if(checks.length > 0){
    extension++;
  }
  return extension;
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
    if(attackedSquares[i][0] != 0 &&
        attackedSquares[i][0].firstChild &&
        attackedSquares[i][0].firstChild.id.toLowerCase() != 'k' &&
        attackedSquares[i][0].firstChild.getAttribute('color') != color.toLowerCase()){
      let calculatedSquare = calculateCaptures(i);
      score += calculatedSquare / 2;
    }
  }
  // check if the king is in check to determine if the evaluation should be -Infinity or 0
  if(checkForCheckMateOrDraw() || checkForThreeFoldRepetition()){
    let kingPieceId = color.toLowerCase() == 'white' ? 'K' : 'k';
    let kingPiece = document.querySelector(`#${kingPieceId}`);
    let kingSquare = kingPiece.parentNode;
    let kingSquareId = parseInt(kingSquare.getAttribute('square-id'));
    if(attackedSquares[kingSquareId][0] != 0){
      score = -Infinity * playerPerspective;
    }
    else {
      score = 0;
    }
  }

  score *= playerPerspective;
  allPieces = document.querySelectorAll('.piece');
  // if the current player is winning, add points for moving the kings closer
  if(allPieces.length <= 10){
    let whiteKing = document.querySelector('#K').parentNode;
    let blackKing = document.querySelector('#k').parentNode;
    let whiteRow = Math.floor(whiteKing.getAttribute('square-id') / 8);
    let whiteCol = whiteKing.getAttribute('square-id') % 8;
    let blackRow = Math.floor(blackKing.getAttribute('square-id') / 8);
    let blackCol = blackKing.getAttribute('square-id') % 8;
    if(score > 0)
      score += 14 - (Math.abs(whiteRow - blackRow) + Math.abs(whiteCol - blackCol));
    else
      score -= 14 - (Math.abs(whiteRow - blackRow) + Math.abs(whiteCol - blackCol));
  }
  return score;
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
  allPieces = document.querySelectorAll(".piece");
  if(color.toLowerCase() == 'black'){
    allBlack = document.querySelectorAll("div[color='black']");
    allBlack.forEach(piece => {
      let squareId = parseInt(piece.parentNode.getAttribute('square-id'));
      let row = Math.floor(squareId / 8);
      let col = squareId % 8;
      score += pieceScore(piece);
      if(piece.id == 'p'){
        if(allPieces.length < 10 && row != 7){
          score += row * .5;
        }
        if(allPieces.length >= 10 && row != 7){
          score += row * .2;
        }
        if(row == 7){
          score += 8;
        }
      }
      if(piece.id == 'k'){
        // incentivize the king to move to the center
        if(allPieces.length < 10){
          score -= Math.abs(col - 3.5) * .1;
          score -= Math.abs(row - 3.5) * .1;
        }
        // incentivize the king to stay on the edge protected
        if(allPieces.length >= 10){
          score += col * .2;
          score -= row * .2;
        }
      }
      // keep the queen from leaving her square too early
      if(piece.id == 'q'){
        if(allPieces.length >= 10){
          score -= Math.abs(col - 3.5) * .1;
          score -= row * .1;
        }
      }
      let moves = calculateMovesChecks(piece.parentNode);
      score += moves.length * 0.1;
    });
  }
  else {
    allWhite = document.querySelectorAll("div[color='white']");
    allWhite.forEach(piece => {
      let squareId = parseInt(piece.parentNode.getAttribute('square-id'));
      let row = Math.floor(squareId / 8);
      let col = squareId % 8;
      score += pieceScore(piece);
      if(piece.id == 'P'){
        if(allPieces.length < 10 && row != 0){
          score += (7 - row) * .5;
        }
        if(allPieces.length >= 10 && row != 0){
          score += (7 - row) * .2;
        }
        if(row == 7){
          score += 8;
        }
      }
      if(piece.id == 'K'){
        // incentivize the king to move to the center
        if(allPieces.length < 10){
          score -= Math.abs(col - 3.5) * .1;
          score -= Math.abs(row - 3.5) * .1;
        }
        // incentivize the king to stay on the edge protected
        if(allPieces.length >= 10){
          score += col * .2;
          score -= (7 - row) * .2;
        }
      }
      // keep the queen from leaving her square too early
      if(piece.id == 'Q'){
        if(allPieces.length >= 10){
          score -= Math.abs(col - 3.5) * .1;
          score -= (7 - row) * .1;
        }
      }
      let moves = calculateMovesChecks(piece.parentNode);
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

  // so we can filter moves for pieces accordingly
  calculatePins();
  calculateChecks();

  // calculates all pieces except for the king since we want king moves to be considered last
  allColorPieces.forEach(piece => {
    if(piece.id.toLowerCase() != 'k'){
      let moves = calculateMovesChecks(piece.parentNode);
      let position = piece.parentNode.getAttribute('square-id');
      if(pinnedPieces[parseInt(position)][0] != 0 && pinnedPieces[parseInt(position)][1] >= 2){
        let pinningId = 0;
        let pinningColor = 0;
        let pinLine = [];
        pinnedPieces.forEach(element => {
          if((element[1] == 1 || element[1] >= 3) && pinLine.length == 0 && element[0] != piece.parentNode){
            pinningId = parseInt(element[0].getAttribute('square-id'));
            pinningColor = element[0].firstChild.getAttribute('color');
            pinningType = element[0].firstChild.id.toLowerCase();
            if(pinningType == 'r' || pinningType == 'q'){
              pinLine = rookPins(pinningId, pinningColor);
            }
            if(pinLine.length == 0 || !pinLine.includes(piece.parentNode)){
              pinLine = [];
            }
            if(pinLine.length == 0 && (pinningType == 'b' || pinningType == 'q')){
              pinLine = bishopPins(pinningId, pinningColor);
            }
            if(pinLine.length == 0 || !pinLine.includes(piece.parentNode)){
              pinLine = [];
            }
          }
        });
        moves = moves.filter(move => pinLine.includes(move));
      }
      moves.forEach(move => {
        if(checks.length > 0){
          if(checks.includes(move)){
            allMoves.push({start: position, destination: move.getAttribute("square-id")});
          }
        }
        else{
          allMoves.push({start: position, destination: move.getAttribute("square-id")});
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
 * Changes the background color of each square in the moves array.
 */
function colorMoves() {
  moves.forEach(square => {
    square.style.backgroundColor = 'rgb(204, 85, 0)';
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