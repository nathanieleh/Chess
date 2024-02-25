# Chess
TODO:
- Research different implementations made by other people
- Ensure all rules are read upon to implement game
- Implement chess board and pieces (create board)
- try to make sure the player can move the pieces first
- make sure moves are valid and ensure player is only doing valid moves
- Allow for player vs player functionality
- Add AI for player vs computer (stockfish implementation vs own implementation?)
- Allow for game history

Notes from reading others projects:\
CARTER SEMRAD [website](http://cleverlynamedwebsite.pw/codeperweek/fairy-chess/)
- The canvas tag is required in order to create the board as it can let me draw whatever I want in it
```
var c = document.createElement("canvas");
document.body.appendChild(c);
```
- I will need to find all chess pieces as transparent png files to import them through the drawImage method?
- I will need a board function, with an 8x8 array that stores the position of each piece
- p=pawn, b=bishop, n=knight, r=rook, q=queen, k=king
- make a general Piece function that can be further defined as functions for each individual piece
- Piece function will need to know its position (x,y) and its color
- When creating further defined Piece functions, extend from the Piece function and define what type of moves the piece can do, and provide the image of the piece to render itself

TECHY WEB DEV [video](https://www.youtube.com/watch?v=wYRRVRrK0R8)
- represented the board with 64 li elements with each row being represented by a div, each box is given a unique id
- colored using css classes
- utilized the innertext of each div in order to place the pieces in the correct spots
- example of reading an id from the project: `b${a + i * 100}` used to parse text from a number
- used a toggle to keep track of which player was making the move
- did not create classes, checked innerHTML to see how to treat the piece being moved

SEBASTIAN LAGUE [video](https://www.youtube.com/watch?v=U4ogK0MIzqk)
- used similar approach to CARTER SEMRAD, using an array to represent the board
- Forsyth-Edwards Notation (FEN)
- Start FEN notation: `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`
- in order to evaluate legal moves, he keeps track of all the different lines each piece has on the king to ensure that if the king is in check, the player tries to resolve that rather than doing other moves
- used a single array with index 0 as bottom left and index 63 as top right
- [Chess Engine Guide](https://www.chessprogramming.org/Main_Page)

Code with Ania Kubów [video](https://www.youtube.com/watch?v=Qv0fvm5B0EM)
- utilized svgs from fontawesome to create the chess pieces
- 2d array representing the board and placed the pieces manually
- If we are setting an id for each square, we must reverse the id each time a player moves as if we flipped the board to look in the other player's perspective