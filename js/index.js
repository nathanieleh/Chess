const PORT = process.env.PORT || 3000;
const express = require('express');
const Stockfish = require('stockfish');

const app = express();
const stockfish = Stockfish;

stockfish.onmessage = function(event) {
  console.log('Received message from Stockfish:', event);

  // Check if Stockfish is ready
  if (event?.startsWith('Stockfish')) {
      // Stockfish is ready, set up the starting position
      stockfish.postMessage('uci');
      stockfish.postMessage('ucinewgame');
      stockfish.postMessage('position startpos');
      stockfish.postMessage('go depth 1');
  }

  // Check if Stockfish made a move
  if (event?.startsWith('bestmove')) {
      const move = event.split(' ')[1];
      console.log('Stockfish played move:', move);
  }
};

// Start the engine
stockfish.postMessage('uci');

app.listen(PORT, () => console.log(`listening on port ${PORT}`));
// Serve static files from the `public` folder.