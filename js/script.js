const k = '<div class="piece" color="black" castle="true" id="k"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M248 24c0-13.3-10.7-24-24-24s-24 10.7-24 24V56H168c-13.3 0-24 10.7-24 24s10.7 24 24 24h32v40H59.6C26.7 144 0 170.7 0 203.6c0 8.2 1.7 16.3 4.9 23.8L59.1 352h52.3L49 208.2c-.6-1.5-1-3-1-4.6c0-6.4 5.2-11.6 11.6-11.6H224 388.4c6.4 0 11.6 5.2 11.6 11.6c0 1.6-.3 3.2-1 4.6L336.5 352h52.3l54.2-124.6c3.3-7.5 4.9-15.6 4.9-23.8c0-32.9-26.7-59.6-59.6-59.6H248V104h32c13.3 0 24-10.7 24-24s-10.7-24-24-24H248V24zM101.2 432H346.8l16.6 32H84.7l16.6-32zm283.7-30.7c-5.5-10.6-16.5-17.3-28.4-17.3H91.5c-12 0-22.9 6.7-28.4 17.3L36.6 452.5c-3 5.8-4.6 12.2-4.6 18.7C32 493.8 50.2 512 72.8 512H375.2c22.5 0 40.8-18.2 40.8-40.8c0-6.5-1.6-12.9-4.6-18.7l-26.5-51.2z"/></svg></div>'
const K = '<div class="piece" color="white" castle="true" id="K"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#bbbbbb" d="M248 24c0-13.3-10.7-24-24-24s-24 10.7-24 24V56H168c-13.3 0-24 10.7-24 24s10.7 24 24 24h32v40H59.6C26.7 144 0 170.7 0 203.6c0 8.2 1.7 16.3 4.9 23.8L59.1 352h52.3L49 208.2c-.6-1.5-1-3-1-4.6c0-6.4 5.2-11.6 11.6-11.6H224 388.4c6.4 0 11.6 5.2 11.6 11.6c0 1.6-.3 3.2-1 4.6L336.5 352h52.3l54.2-124.6c3.3-7.5 4.9-15.6 4.9-23.8c0-32.9-26.7-59.6-59.6-59.6H248V104h32c13.3 0 24-10.7 24-24s-10.7-24-24-24H248V24zM101.2 432H346.8l16.6 32H84.7l16.6-32zm283.7-30.7c-5.5-10.6-16.5-17.3-28.4-17.3H91.5c-12 0-22.9 6.7-28.4 17.3L36.6 452.5c-3 5.8-4.6 12.2-4.6 18.7C32 493.8 50.2 512 72.8 512H375.2c22.5 0 40.8-18.2 40.8-40.8c0-6.5-1.6-12.9-4.6-18.7l-26.5-51.2z"/></svg></div>'
const q = '<div class="piece" color="black" id="q"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 96a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm-95.2-8c-18.1 0-31.3 12.8-35.6 26.9c-8 26.2-32.4 45.2-61.2 45.2c-10 0-19.4-2.3-27.7-6.3c-7.6-3.7-16.7-3.3-24 1.2C.7 162.1-3.1 177.1 3.7 188.9L97.6 352H153l-83-144.1c40.5-2.2 75.3-25.9 93.1-59.8c22 26.8 55.4 43.9 92.8 43.9s70.8-17.1 92.8-43.9c17.8 34 52.6 57.7 93.1 59.8L359 352h55.4l93.9-163.1c6.8-11.7 3-26.7-8.6-33.8c-7.3-4.5-16.4-4.9-24-1.2c-8.4 4-17.7 6.3-27.7 6.3c-28.8 0-53.2-19-61.2-45.2C382.5 100.8 369.3 88 351.2 88c-14.5 0-26.3 8.5-32.4 19.3c-12.4 22-35.9 36.7-62.8 36.7s-50.4-14.8-62.8-36.7C187.1 96.5 175.4 88 160.8 88zM133.2 432H378.8l16.6 32H116.7l16.6-32zm283.7-30.7c-5.5-10.6-16.5-17.3-28.4-17.3h-265c-12 0-22.9 6.7-28.4 17.3L68.6 452.5c-3 5.8-4.6 12.2-4.6 18.7c0 22.5 18.2 40.8 40.8 40.8H407.2c22.5 0 40.8-18.2 40.8-40.8c0-6.5-1.6-12.9-4.6-18.7l-26.5-51.2z"/></svg></div>'
const Q = '<div class="piece" color="white" id="Q"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#bbbbbb" d="M256 96a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm-95.2-8c-18.1 0-31.3 12.8-35.6 26.9c-8 26.2-32.4 45.2-61.2 45.2c-10 0-19.4-2.3-27.7-6.3c-7.6-3.7-16.7-3.3-24 1.2C.7 162.1-3.1 177.1 3.7 188.9L97.6 352H153l-83-144.1c40.5-2.2 75.3-25.9 93.1-59.8c22 26.8 55.4 43.9 92.8 43.9s70.8-17.1 92.8-43.9c17.8 34 52.6 57.7 93.1 59.8L359 352h55.4l93.9-163.1c6.8-11.7 3-26.7-8.6-33.8c-7.3-4.5-16.4-4.9-24-1.2c-8.4 4-17.7 6.3-27.7 6.3c-28.8 0-53.2-19-61.2-45.2C382.5 100.8 369.3 88 351.2 88c-14.5 0-26.3 8.5-32.4 19.3c-12.4 22-35.9 36.7-62.8 36.7s-50.4-14.8-62.8-36.7C187.1 96.5 175.4 88 160.8 88zM133.2 432H378.8l16.6 32H116.7l16.6-32zm283.7-30.7c-5.5-10.6-16.5-17.3-28.4-17.3h-265c-12 0-22.9 6.7-28.4 17.3L68.6 452.5c-3 5.8-4.6 12.2-4.6 18.7c0 22.5 18.2 40.8 40.8 40.8H407.2c22.5 0 40.8-18.2 40.8-40.8c0-6.5-1.6-12.9-4.6-18.7l-26.5-51.2z"/></svg></div>'
const p = '<div class="piece" color="black" enpassant="false" id="p"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M232 152A72 72 0 1 0 88 152a72 72 0 1 0 144 0zm24 120H243.4l10.7 80H205.7L195 272H160 125l-10.7 80H65.9l10.7-80H64c-13.3 0-24-10.7-24-24s10.7-24 24-24c-15.1-20.1-24-45-24-72C40 85.7 93.7 32 160 32s120 53.7 120 120c0 27-8.9 51.9-24 72c13.3 0 24 10.7 24 24s-10.7 24-24 24zM52.7 464H267.3l-16.6-32H69.2L52.7 464zm207.9-80c12 0 22.9 6.7 28.4 17.3l26.5 51.2c3 5.8 4.6 12.2 4.6 18.7c0 22.5-18.2 40.8-40.8 40.8H40.8C18.2 512 0 493.8 0 471.2c0-6.5 1.6-12.9 4.6-18.7l26.5-51.2C36.5 390.7 47.5 384 59.5 384h201z"/></svg></div>'
const P = '<div class="piece" color="white" enpassant="false" id="P"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill="#bbbbbb" d="M232 152A72 72 0 1 0 88 152a72 72 0 1 0 144 0zm24 120H243.4l10.7 80H205.7L195 272H160 125l-10.7 80H65.9l10.7-80H64c-13.3 0-24-10.7-24-24s10.7-24 24-24c-15.1-20.1-24-45-24-72C40 85.7 93.7 32 160 32s120 53.7 120 120c0 27-8.9 51.9-24 72c13.3 0 24 10.7 24 24s-10.7 24-24 24zM52.7 464H267.3l-16.6-32H69.2L52.7 464zm207.9-80c12 0 22.9 6.7 28.4 17.3l26.5 51.2c3 5.8 4.6 12.2 4.6 18.7c0 22.5-18.2 40.8-40.8 40.8H40.8C18.2 512 0 493.8 0 471.2c0-6.5 1.6-12.9 4.6-18.7l26.5-51.2C36.5 390.7 47.5 384 59.5 384h201z"/></svg></div>'
const b = '<div class="piece" color="black" id="b"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M104 0C90.7 0 80 10.7 80 24c0 11.2 7.6 20.6 18 23.2c-7.8 8-16.1 17-24.4 27C38.2 116.7 0 178.8 0 250.9c0 44.8 24.6 72.2 48 87.8V352H96V325c0-9-5-17.2-13-21.3c-18-9.3-35-24.7-35-52.7c0-55.5 29.8-106.8 62.4-145.9c16-19.2 32.1-34.8 44.2-45.5c1.9-1.7 3.7-3.2 5.3-4.6c1.7 1.4 3.4 3 5.3 4.6c12.1 10.7 28.2 26.3 44.2 45.5c5.3 6.3 10.5 13 15.5 20L159 191c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l57.8-57.8c12.8 25.9 21.2 54.3 21.2 83.8c0 28-17 43.4-35 52.7c-8 4.1-13 12.3-13 21.3v27h48V338.7c23.4-15.6 48-42.9 48-87.8c0-72.1-38.2-134.2-73.6-176.7c-8.3-9.9-16.6-19-24.4-27c10.3-2.7 18-12.1 18-23.2c0-13.3-10.7-24-24-24H160 104zM52.7 464l16.6-32H250.8l16.6 32H52.7zm207.9-80H59.5c-12 0-22.9 6.7-28.4 17.3L4.6 452.5c-3 5.8-4.6 12.2-4.6 18.7C0 493.8 18.2 512 40.8 512H279.2c22.5 0 40.8-18.2 40.8-40.8c0-6.5-1.6-12.9-4.6-18.7l-26.5-51.2c-5.5-10.6-16.5-17.3-28.4-17.3z"/></svg></div>'
const B = '<div class="piece" color="white" id="B"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill="#bbbbbb" d="M104 0C90.7 0 80 10.7 80 24c0 11.2 7.6 20.6 18 23.2c-7.8 8-16.1 17-24.4 27C38.2 116.7 0 178.8 0 250.9c0 44.8 24.6 72.2 48 87.8V352H96V325c0-9-5-17.2-13-21.3c-18-9.3-35-24.7-35-52.7c0-55.5 29.8-106.8 62.4-145.9c16-19.2 32.1-34.8 44.2-45.5c1.9-1.7 3.7-3.2 5.3-4.6c1.7 1.4 3.4 3 5.3 4.6c12.1 10.7 28.2 26.3 44.2 45.5c5.3 6.3 10.5 13 15.5 20L159 191c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l57.8-57.8c12.8 25.9 21.2 54.3 21.2 83.8c0 28-17 43.4-35 52.7c-8 4.1-13 12.3-13 21.3v27h48V338.7c23.4-15.6 48-42.9 48-87.8c0-72.1-38.2-134.2-73.6-176.7c-8.3-9.9-16.6-19-24.4-27c10.3-2.7 18-12.1 18-23.2c0-13.3-10.7-24-24-24H160 104zM52.7 464l16.6-32H250.8l16.6 32H52.7zm207.9-80H59.5c-12 0-22.9 6.7-28.4 17.3L4.6 452.5c-3 5.8-4.6 12.2-4.6 18.7C0 493.8 18.2 512 40.8 512H279.2c22.5 0 40.8-18.2 40.8-40.8c0-6.5-1.6-12.9-4.6-18.7l-26.5-51.2c-5.5-10.6-16.5-17.3-28.4-17.3z"/></svg></div>'
const n = '<div class="piece" color="black" id="n"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M226.6 48H117.3l17.1 12.8c6 4.5 9.6 11.6 9.6 19.2s-3.6 14.7-9.6 19.2l-6.5 4.9c-10 7.5-16 19.3-16 31.9l-.3 91c0 10.2 4.9 19.9 13.2 25.8l1.9 1.3c9.9 7.1 23.3 7 33.2-.1l49.9-36.3c10.7-7.8 25.7-5.4 33.5 5.3s5.4 25.7-5.3 33.5l-49.9 36.3-53.8 39.1c-7.3 5.3-13 12.2-16.9 20.1H66.8c5.3-22.1 17.8-41.9 35.9-56.3c-1.3-.8-2.6-1.7-3.8-2.6L97 291.8c-21-15-33.4-39.2-33.3-65l.3-91c.1-19.8 6.7-38.7 18.6-53.9l-.4-.3C70.7 73 64 59.6 64 45.3C64 20.3 84.3 0 109.3 0H226.6C331.2 0 416 84.8 416 189.4c0 11.1-1 22.2-2.9 33.2L390.1 352H341.3l24.5-137.8c1.5-8.2 2.2-16.5 2.2-24.8C368 111.3 304.7 48 226.6 48zM85.2 432L68.7 464H379.3l-16.6-32H85.2zm315.7-30.7l26.5 51.2c3 5.8 4.6 12.2 4.6 18.7c0 22.5-18.2 40.8-40.8 40.8H56.8C34.2 512 16 493.8 16 471.2c0-6.5 1.6-12.9 4.6-18.7l26.5-51.2C52.5 390.7 63.5 384 75.5 384h297c12 0 22.9 6.7 28.4 17.3zM172 128a20 20 0 1 1 0 40 20 20 0 1 1 0-40z"/></svg></div>'
const N = '<div class="piece" color="white" id="N"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#bbbbbb" d="M226.6 48H117.3l17.1 12.8c6 4.5 9.6 11.6 9.6 19.2s-3.6 14.7-9.6 19.2l-6.5 4.9c-10 7.5-16 19.3-16 31.9l-.3 91c0 10.2 4.9 19.9 13.2 25.8l1.9 1.3c9.9 7.1 23.3 7 33.2-.1l49.9-36.3c10.7-7.8 25.7-5.4 33.5 5.3s5.4 25.7-5.3 33.5l-49.9 36.3-53.8 39.1c-7.3 5.3-13 12.2-16.9 20.1H66.8c5.3-22.1 17.8-41.9 35.9-56.3c-1.3-.8-2.6-1.7-3.8-2.6L97 291.8c-21-15-33.4-39.2-33.3-65l.3-91c.1-19.8 6.7-38.7 18.6-53.9l-.4-.3C70.7 73 64 59.6 64 45.3C64 20.3 84.3 0 109.3 0H226.6C331.2 0 416 84.8 416 189.4c0 11.1-1 22.2-2.9 33.2L390.1 352H341.3l24.5-137.8c1.5-8.2 2.2-16.5 2.2-24.8C368 111.3 304.7 48 226.6 48zM85.2 432L68.7 464H379.3l-16.6-32H85.2zm315.7-30.7l26.5 51.2c3 5.8 4.6 12.2 4.6 18.7c0 22.5-18.2 40.8-40.8 40.8H56.8C34.2 512 16 493.8 16 471.2c0-6.5 1.6-12.9 4.6-18.7l26.5-51.2C52.5 390.7 63.5 384 75.5 384h297c12 0 22.9 6.7 28.4 17.3zM172 128a20 20 0 1 1 0 40 20 20 0 1 1 0-40z"/></svg></div>'
const r = '<div class="piece" color="black" castle="true" id="r"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M80 80V192c0 2.5 1.2 4.9 3.2 6.4l51.2 38.4c6.8 5.1 10.4 13.4 9.5 21.9L133.5 352H85.2l9.4-85L54.4 236.8C40.3 226.2 32 209.6 32 192V72c0-22.1 17.9-40 40-40H376c22.1 0 40 17.9 40 40V192c0 17.6-8.3 34.2-22.4 44.8L353.4 267l9.4 85H314.5l-10.4-93.3c-.9-8.4 2.7-16.8 9.5-21.9l51.2-38.4c2-1.5 3.2-3.9 3.2-6.4V80H304v24c0 13.3-10.7 24-24 24s-24-10.7-24-24V80H192v24c0 13.3-10.7 24-24 24s-24-10.7-24-24V80H80zm4.7 384H363.3l-16.6-32H101.2L84.7 464zm271.9-80c12 0 22.9 6.7 28.4 17.3l26.5 51.2c3 5.8 4.6 12.2 4.6 18.7c0 22.5-18.2 40.8-40.8 40.8H72.8C50.2 512 32 493.8 32 471.2c0-6.5 1.6-12.9 4.6-18.7l26.5-51.2C68.5 390.7 79.5 384 91.5 384h265zM208 288c-8.8 0-16-7.2-16-16V224c0-17.7 14.3-32 32-32s32 14.3 32 32v48c0 8.8-7.2 16-16 16H208z"/></svg></div>'
const R = '<div class="piece" color="white" castle="true" id="R"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#bbbbbb" d="M80 80V192c0 2.5 1.2 4.9 3.2 6.4l51.2 38.4c6.8 5.1 10.4 13.4 9.5 21.9L133.5 352H85.2l9.4-85L54.4 236.8C40.3 226.2 32 209.6 32 192V72c0-22.1 17.9-40 40-40H376c22.1 0 40 17.9 40 40V192c0 17.6-8.3 34.2-22.4 44.8L353.4 267l9.4 85H314.5l-10.4-93.3c-.9-8.4 2.7-16.8 9.5-21.9l51.2-38.4c2-1.5 3.2-3.9 3.2-6.4V80H304v24c0 13.3-10.7 24-24 24s-24-10.7-24-24V80H192v24c0 13.3-10.7 24-24 24s-24-10.7-24-24V80H80zm4.7 384H363.3l-16.6-32H101.2L84.7 464zm271.9-80c12 0 22.9 6.7 28.4 17.3l26.5 51.2c3 5.8 4.6 12.2 4.6 18.7c0 22.5-18.2 40.8-40.8 40.8H72.8C50.2 512 32 493.8 32 471.2c0-6.5 1.6-12.9 4.6-18.7l26.5-51.2C68.5 390.7 79.5 384 91.5 384h265zM208 288c-8.8 0-16-7.2-16-16V224c0-17.7 14.3-32 32-32s32 14.3 32 32v48c0 8.8-7.2 16-16 16H208z"/></svg></div>'
const pieces = new Map([
  ["k", k],
  ["K", K],
  ["q", q],
  ["Q", Q],
  ["p", p],
  ["P", P],
  ["b", b],
  ["B", B],
  ["n", n],
  ["N", N],
  ["r", r],
  ["R", R]
]);

const button = document.getElementById('button');
button.addEventListener("click", function () {
  const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);

  // Change the button's background color
  button.style.backgroundColor = randomColor;
});

const chessBoard = document.getElementById('chessBoard');
const startBoard = [64];
let turn = 'White';

const startFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

// interprets the given FENCode to populate the startBoard array with the correct pieces
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

// creates a chess board for the start of the game
function createBoard() {
  loadFEN(startFEN);
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
}
createBoard();

let selectedPiece;
let allPawns = document.querySelectorAll('.square #p, .square #P');

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

const allSquares = document.querySelectorAll("div.square");
let moves = [];

function rookMoves(id, color){
  let newId = id;
  const row = Math.floor(id / 8);
  const col = id % 8;
  for(let offset = -1; offset > -8; offset--){
    newId = id + offset;
    if(col + offset >= 0){
      if(allSquares[newId].firstChild?.getAttribute("color") == color) break;
      moves.push(allSquares[newId]);
      if(allSquares[newId].firstChild) break;
    }
  }
  for(let offset = 1; offset < 8; offset++){
    newId = id + offset;
    if(col + offset <= 7){
      if(allSquares[newId].firstChild?.getAttribute("color") == color) break;
      moves.push(allSquares[newId]);
      if(allSquares[newId].firstChild) break;
    }
  }
  for(let offset = -1; offset > -8; offset--){
    newId = id + offset*8;
    if(row + offset >= 0){
      if(allSquares[newId].firstChild?.getAttribute("color") == color) break;
      moves.push(allSquares[newId]);
      if(allSquares[newId].firstChild) break;
    }
  }
  for(let offset = 1; offset < 8; offset++){
    newId = id + offset*8;
    if(row + offset <= 7){
      if(allSquares[newId].firstChild?.getAttribute("color") == color) break;
      moves.push(allSquares[newId]);
      if(allSquares[newId].firstChild) break;
    }
  }
}

function bishopMoves(id, color){
  let newId = id;
  const row = Math.floor(id / 8);
  const col = id % 8;
  for(let offset = -1; offset > -8; offset--){
    newId = id + offset * 9;
    if(col + offset >= 0 && row + offset >= 0){
      if(allSquares[newId].firstChild?.getAttribute("color") == color) break;
      moves.push(allSquares[newId]);
      if(allSquares[newId].firstChild) break;
    }
  }
  for(let offset = 1; offset < 8; offset++){
    newId = id + offset * 9;
    if(col + offset <= 7 && row + offset <= 7){
      if(allSquares[newId].firstChild?.getAttribute("color") == color) break;
      moves.push(allSquares[newId]);
      if(allSquares[newId].firstChild) break;
    }
  }
  for(let offset = -1; offset > -8; offset--){
    newId = id + offset * 7;
    if(col - offset <= 7 && row + offset >= 0){
      if(allSquares[newId].firstChild?.getAttribute("color") == color) break;
      moves.push(allSquares[newId]);
      if(allSquares[newId].firstChild) break;
    }
  }
  for(let offset = 1; offset < 8; offset++){
    newId = id + offset * 7;
    if(col - offset >= 0 && row + offset <= 7){
      if(allSquares[newId].firstChild?.getAttribute("color") == color) break;
      moves.push(allSquares[newId]);
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
    }
  }
  newId = id - 10;
  if(col - 2 >= 0 && row - 1 >= 0){
    if(allSquares[newId].firstChild?.getAttribute("color") == color){
    }
    else {
      moves.push(allSquares[newId]);
    }
  }
  newId = id - 15;
  if(col + 1 <= 7 && row - 2 >= 0){
    if(allSquares[newId].firstChild?.getAttribute("color") == color){
    }
    else {
      moves.push(allSquares[newId]);
    }
  }
  newId = id - 17;
  if(col - 1 >= 0 && row - 2 >= 0){
    if(allSquares[newId].firstChild?.getAttribute("color") == color){
    }
    else {
      moves.push(allSquares[newId]);
    }
  }
  newId = id + 6;
  if(col - 2 >= 0 && row + 1 <= 7){
    if(allSquares[newId].firstChild?.getAttribute("color") == color){
    }
    else {
      moves.push(allSquares[newId]);
    }
  }
  newId = id + 10;
  if(col + 2 <= 7 && row + 1 <= 7){
    if(allSquares[newId].firstChild?.getAttribute("color") == color){
    }
    else {
      moves.push(allSquares[newId]);
    }
  }
  newId = id + 15;
  if(col - 1 >= 0 && row + 2 <= 7){
    if(allSquares[newId].firstChild?.getAttribute("color") == color){
    }
    else {
      moves.push(allSquares[newId]);
    }
  }
  newId = id + 17;
  if(col + 1 <= 7 && row + 2 <= 7){
    if(allSquares[newId].firstChild?.getAttribute("color") == color){
    }
    else {
      moves.push(allSquares[newId]);
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
      moves.push(allSquares[newId]);
    }
  }
  newId = id + 1;
  if(col + 1 <= 7){
    if(allSquares[newId].firstChild?.getAttribute("color") == color){
    }
    else {
      moves.push(allSquares[newId]);
    }
  }
  newId = id - 8;
  if(row - 1 >= 0){
    if(allSquares[newId].firstChild?.getAttribute("color") == color){
    }
    else {
      moves.push(allSquares[newId]);
    }
  }
  newId = id + 8;
  if(row + 1 <= 7){
    if(allSquares[newId].firstChild?.getAttribute("color") == color){
    }
    else {
      moves.push(allSquares[newId]);
    }
  }
  newId = id + 9;
  if(col + 1 <= 7 && row + 1 <= 7){
    if(allSquares[newId].firstChild?.getAttribute("color") == color){
    }
    else {
      moves.push(allSquares[newId]);
    }
  }
  newId = id + 7;
  if(col - 1 >= 0 && row + 1 <= 7){
    if(allSquares[newId].firstChild?.getAttribute("color") == color){
    }
    else {
      moves.push(allSquares[newId]);
    }
  }
  newId = id - 7;
  if(col + 1 <= 7 && row - 1 >= 0){
    if(allSquares[newId].firstChild?.getAttribute("color") == color){
    }
    else {
      moves.push(allSquares[newId]);
    }
  }
  newId = id - 9;
  if(col - 1 >= 0 && row - 1 >= 0){
    if(allSquares[newId].firstChild?.getAttribute("color") == color){
    }
    else {
      moves.push(allSquares[newId]);
    }
  }
  // checks if castling is possible
  if(allSquares[id].firstChild.getAttribute("castle") == 'true'){
    for(let i = 1; i < 4; i++){
      newId = id + i;
      if(i == 3 && allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'r' &&
          allSquares[newId].firstChild.getAttribute("castle") == 'true'){
        moves.push(allSquares[id + 2]);
      }
      if(allSquares[newId].firstChild)
        break;
    }
    for(let i = -1; i > -5; i--){
      newId = id + i;
      if(i == -4 && allSquares[newId].firstChild?.getAttribute("id").toLowerCase() == 'r' &&
          allSquares[newId].firstChild.getAttribute("castle") == 'true'){
        moves.push(allSquares[id - 2]);
      }
      if(allSquares[newId].firstChild)
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
      }
      newId = id - 9;
      if(allSquares[newId].firstChild && allSquares[newId].firstChild.getAttribute("color") != color ||
        col - 1 >= 0 && allSquares[id - 1].firstChild?.getAttribute("id").toLowerCase() == 'p' &&
        allSquares[id - 1].firstChild.getAttribute("enpassant") == 'true' &&
        allSquares[id - 1].firstChild.getAttribute("color") != color){
          moves.push(allSquares[newId]);
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
      }
      newId = id + 9;
      if(allSquares[newId].firstChild && allSquares[newId].firstChild.getAttribute("color") != color ||
        col - 1 >= 0 && allSquares[id + 1].firstChild?.getAttribute("id").toLowerCase() == 'p' &&
        allSquares[id + 1].firstChild.getAttribute("enpassant") == 'true' &&
        allSquares[id + 1].firstChild.getAttribute("color") != color){
          moves.push(allSquares[newId]);
      }
      break;
  }
}

// populates moves array based on the position of the piece and the type it is
function calculateMoves(selectedPiece) {
  let pieceType = selectedPiece.firstChild.getAttribute("id").toLowerCase();
  let color = selectedPiece.firstChild.getAttribute("color");
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
  // signify to the player all possible moves by coloring squares red
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

// allows for the player to click a piece on the board to receive information or make a move
allSquares.forEach(square => {
  square.addEventListener("click", function (e) {
    let destination = e.target;
    // no piece has been selected yet, so select this one and show possible moves
    if(!selectedPiece){
      selectedPiece = e.target;
      if(selectedPiece.innerHTML == ''){
        selectedPiece = '';
        return;
      }
      selectedPiece.style.backgroundColor='deepskyblue';
      calculateMoves(selectedPiece);
    }
    // there is already a selected piece, so check if the move the player makes is valid
    else{
      selectedPiece.style.backgroundColor='';
      if(moves.includes(destination)){
        const color = selectedPiece.firstChild.getAttribute("color");
        if(color == turn.toLowerCase()){
          switchTurns();
          makeMove(selectedPiece, destination);
        }
      }
      allSquares.forEach(square => {
        square.style.backgroundColor = '';
      });
      moves = [];
      selectedPiece = '';
    }
  });
});