const PORT = process.env.PORT || 3000;
import express from 'express';
import { Worker } from 'worker_threads';
const stockfish = new Worker('./node_modules/stockfish/src/stockfish-nnue-16.js');

const app = express();

stockfish.onmessage = function(event) {
  let message = event.data;
  console.log('Received message from Stockfish:', message);
  // Check if Stockfish is ready
  if (message?.startsWith('Stockfish')) {
      console.log('Stockfish is ready');
      stockfish.postMessage('uci');
      stockfish.postMessage('ucinewgame');
      stockfish.postMessage('position startpos');
      stockfish.postMessage('go depth 1');
  }

  // Check if Stockfish made a move
  if (message?.startsWith('bestmove')) {
      const move = message.split(' ')[1];
      console.log('Stockfish played move:', move);
  }
};

stockfish.onerror = function(error) {
  console.error('Stockfish error:', error);
};

console.log('Starting Stockfish...');
stockfish.postMessage("uci");

app.listen(PORT, () => console.log(`listening on port ${PORT}`));
// Serve static files from the `public` folder.