var ctx;
let canvas = document.getElementById('canvas');
ctx = canvas.getContext('2d');
const bubbles = [];
var timeCount;
var moves = [];
var moveCount = 0;
var score;
var animationMoveTime;
const images = [rose, orange, lemon, orchard, lime, grapefruit, blue];
var againBtn = document.getElementById('againBtn');
var scoreTitle = document.getElementById('score');
var timeBtn = document.getElementById('timeBtn');
var basicBtn = document.getElementById('basicBtn');
var startPosX = null;
var startPosY = null;
var sound = document.getElementById('sound');
var bgm = document.getElementById('bgm');
bgm.loop = true;
var background = document.getElementById('bg');
var body = document.getElementById('body');
var description = document.getElementById('description');
var clouds = document.getElementById("clouds1");
var clouds2 = document.getElementById("clouds2");
var title = document.getElementById("title");
var right = document.getElementById("right");
var left = document.getElementById("left");
var mute = document.getElementById("mute");
var mic = document.getElementById("mic");
var timerMode = false;
var canPlay = true;

// *********************************************************************
// Main functions
basicBtn.onclick = function(){
  setJS('');
};

// var countDown = document.getElementById('countDown');
timeBtn.onclick = function(){
  setJS('');
  timerMode = true;

};

mute.onclick = function(){
  canPlay = false;
  bgm.pause();
};

 mic.onclick = function(){
   canPlay = true;
   bgm.play();
 };

function initialize(){
  // startBtn.style.display = 'none';
  moveCount = 100;
  if (timerMode){
    timeCount = 60 * 1000;
  }
  score = 0;
  initBubbleBoard();
  initBubbleColor();
  initCanvas();

  animationMoveTime = setInterval(checkBubbleStatus, 25);//swapping motion time
  // call continuesly . will always run down from 25 animationInteval. but will control the run down speed
  bgm.play();
  // console.log(animationMoveTime);
}

function gameOver(){
  ctx.clearRect(0, 0, 600, 700);
  againBtn.style.display = 'inline';
  scoreTitle.style.display = 'inline';
  addElement();
}

function addElement(){
  var newDiv = document.createElement("h2");
  var newContent = document.createTextNode(score);
  newDiv.setAttribute("id", "finalScore");
  newDiv.appendChild(newContent);
  scoreTitle.appendChild(newDiv);
}

// ********************************************************************
// Bubble Move Logic

function checkBubbleStatus(){
  if(timerMode){
    timeCount -= 25;
    changePlayBackRate();
  }

  if(moves.length > 0){
     console.log(moves);
    for(let i = 0; i < moves.length; i++){
      moves[i].update()
    }

    moves = moves.filter(
      function(bubble) {
        return bubble.animationInterval !== 0;
      }
    );

    if(moves.length === 0) {
      setRemoveMark();
      fall();
    }
  }

  draw();

  if(timerMode) {
    if(moves.length === 0 && timeCount <= 0) {
      resetGame();
    }
  } else {
    if(moves.length == 0 && moveCount == 0) {
      resetGame();
    }
  }
}



function setRemoveMark(){
  setHorizontalRemoveMark();
  setVerticalRemoveMark();
}

function pressMouse(e) {
  // curBubble.animateUnClick();
  startPosX = e.offsetX;
  startPosY = e.offsetY;
  // console.log(startPosY);
  // console.log(startPosX);
  let bubbleX = Math.floor(startPosX / 60);
  let bubbleY = Math.floor((startPosY - 100) / 60);
  let curBubble = bubbles[bubbleX][bubbleY];
  curBubble.animateOnClick();
}

function releaseMouse(e){
  let oldX = Math.floor(startPosX / 60);
  let oldY = Math.floor((startPosY - 100) / 60);
  // console.log('bubbleX:' + oldX);
  // console.log('bubbleY:' + oldY);
  let endPosX = e.offsetX;
  let endPosY = e.offsetY;
  let curBubble = bubbles[Math.floor(endPosX/60)][Math.floor((endPosY-100)/60)];
  // console.log(endPosX);
  // console.log(endPosY);
  curBubble.animateUnClick();
  let newPos = calcNewPos(startPosX, endPosX, startPosY, endPosY, oldX, oldY);
  let newX = newPos[0];
  let newY = newPos[1];
  //
  // console.log('bubbleX:' + newX);
  // console.log('bubbleY:' + newY);
  // debugger;
  if(bubbles[oldX][oldY].moving || bubbles[newX][newY].moving || animationMoveTime == null) {
    // let it drops
    return
  }
  swapColorsAndPos(oldX, oldY, newX, newY); // drop to the ideal position. stops.
  moveCount--;
  draw();
}


// **********************************************************
// help method starts here

function setJS(fileName) {
  var ele = document.createElement('script');
  ele.type = 'text/javascript';
  ele.src = fileName;
  document.body.appendChild(ele);

  setTimeout(function() {
    resetBackground();
    initialize();
  }, 200);
}


function Bubble(x, y) {
  // assign bubble
  this.x1 = x;
  this.y1 = y;
  this.animationInterval = 0;

  this.x2 = x;
  this.y2 = y;
  this.width = 40;
  this.height = 40;

  this.getY = function(){
    // move the fruit gradually
    return (this.y1 + (this.y2-this.y1) * (this.animationInterval)/25) * 60 + 100;
  };

  this.setBubbleProp = function (x2, y2, colorIdx){
    this.x2 = x2;
    this.y2 = y2;
    this.colorIdx = colorIdx;
    this.moving = true;
    this.animationInterval = 25;// cnotrol the time between drop and swap
    moves.push(this);
  };

  this.animateOnClick = function(){
    this.width = 45;
    this.height =  45;
  };

  this.animateUnClick = function(){
    this.width = 40;
    this.height =  40;
  };
  this.update = function(){
    this.width = 40;
    this.height =  40;
    this.animationInterval--;
    // console.log(this.animationInterval);
    if(this.animationInterval <= 0) {
      this.moving = false;
    }
  };

}

function initBubbleBoard(){
  for(let x = 0; x < 8; x++) {
    bubbles[x] = [];
    for(let y = 0; y < 8; y++) {
      bubbles[x][y] = new Bubble(x, y);
    }
  }
}

function initBubbleColor(){
  for(let x = 0; x < 8; x ++){
    for(let y = 0; y < 8; y ++){
      let foundcolor = false;
      while(!foundcolor){
        foundcolor = false;
        let randomIndex = getRandomNum(6);
        if(!hasStraight3colors(x, y, randomIndex)){
          bubbles[x][y].colorIdx = randomIndex;
          foundcolor = true;
        }
      }
    }
  }
}

function initCanvas(){
  canvas.onmousedown = pressMouse;
  canvas.onmouseup = releaseMouse;
}

function changePlayBackRate(){
  if (bgm.playbackRate == 1 && timeCount < 5000) {
      bgm.pause();
      bgm.playbackRate = 1.5;
      if (canPlay) {bgm.play();}
  }
}
function setMoves(){

}
function resetGame(){
  clearInterval(animationMoveTime);
  animationMoveTime = null;
  bgm.pause();
  bgm.currentTime = 0;

  setTimeout(gameOver, 0);
  bringBackBackground();
  // gameOver();
}


function setHorizontalRemoveMark(){
  for(let x = 0; x < 8; x++){
    let currentColorIdx = bubbles[x][0].colorIdx;
    let numSameColor = 1;
    for(let y = 1; y < 8; y ++){
      let nextColorIdx = bubbles[x][y].colorIdx;
      if(currentColorIdx == nextColorIdx) {
        numSameColor ++;
        if ( numSameColor >= 3){
          bubbles[x][y-2].remove = true
          bubbles[x][y-1].remove = true
          bubbles[x][y].remove = true
        }
      } else {
        currentColorIdx = nextColorIdx;
        numSameColor = 1;
      }
    }
  }
}

function setVerticalRemoveMark(){
  for(let y = 0; y < 8; y++){
    let currentColorIdx = bubbles[0][y].colorIdx;
    var numSameColor = 1;
    for(let x = 1; x < 8; x++){
      let nextColorIdx = bubbles[x][y].colorIdx;
      if(currentColorIdx == nextColorIdx) {
        numSameColor++;
        if(numSameColor >= 3){
          bubbles[x-2][y].remove = true;
          bubbles[x-1][y].remove = true;
          bubbles[x][y].remove = true;
        }
      } else {
        currentColorIdx = nextColorIdx;
        numSameColor = 1;
      }
    }
  }
}



function fall(){
  for(let x = 0; x < 8; x++){
    for(let y = 7, newIdx = 7; y >= 0; y--, newIdx--){
      while (newIdx >= 0){
        if (bubbles[x][newIdx].remove){
          newIdx--;
        } else {
          break;
        }
      }

      if(y != newIdx) {
        var colorIdx = (newIdx >= 0) ? bubbles[x][newIdx].colorIdx : getRandomNum(6);
        bubbles[x][y].setBubbleProp(x,newIdx,colorIdx);
      }
    }
  }

  resetMark();
}


function resetMark(){
  if (canPlay){ var playSound = true;}
  for(let x = 0; x < 8; x++){
    for(let y = 0; y < 8; y++) {
      if(bubbles[x][y].remove){
        bubbles[x][y].remove = false;
        score += 100;
        if(playSound){
          sound.pause();
          sound.currentTime = 0;
          sound.play();
          playSound = false;
        }
      }
    }
  }
}


function getRandomNum(n){
  return  Math.floor(Math.random() * n);
}


function hasStraight3colors(x,y,curBubble){
  let hasStraight3colors = false;
  if(y > 1) {
    let bottomBubble = bubbles[x][y-2].colorIdx;
    let middleBubble = bubbles[x][y-1].colorIdx;
    if(bottomBubble == middleBubble && middleBubble == curBubble){
      hasStraight3colors = true;
    }
  }

  if(x > 1) {
    let leftBubble = bubbles[x-2][y].colorIdx;
    let middleBubble = bubbles[x-1][y].colorIdx;
    if (leftBubble == middleBubble && middleBubble == curBubble){
      hasStraight3colors = true;
    }
  }

  return hasStraight3colors;
}


function draw() {
  ctx.clearRect(0,0,500,600);
  for(let x = 0; x < 8; x ++) {
    for(let y = 0; y < 8; y ++) {
      let idx = bubbles[x][y].colorIdx;
      ctx.drawImage(images[idx],
      x * 60 + 8, bubbles[x][y].getY(), bubbles[x][y].width, bubbles[x][y].height);
    }
  }

  ctx.font = 'bold 20px Comic Sans MS';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#pink';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 15;
  ctx.shadowOffsetY = 15;

  if(timerMode) {
  var sec = Math.floor(timeCount / 1000);


  if (sec < 0) {
      sec = '00';
  } else if (sec < 10) {
      sec = '0' + sec;
  }
  ctx.fillText('Time Left : ' + sec, 100, 50);
} else {
  ctx.fillText('Moves Left:'+ moveCount, 100, 50);

}

ctx.fillText('Score :' + score, 380, 50);

}

function swapColorsAndPos(oldX, oldY, newX, newY){
  let oldBubble = bubbles[oldX][oldY];
  let newBubble = bubbles[newX][newY];
  let oldColorIdx = oldBubble.colorIdx;
  oldBubble.setBubbleProp(newX, newY, newBubble.colorIdx);
  newBubble.setBubbleProp(oldX, oldY, oldColorIdx);

}

function calcNewPos (startPosX, endPosX, startPosY, endPosY, oldX, oldY) {
  let xDistance = endPosX - startPosX;
  let yDistance = endPosY - startPosY;
  let x = oldX;
  let y = oldY;
  if(Math.abs(xDistance) == 0 && Math.abs(yDistance) == 0){
    return;
  } else if (Math.abs(endPosX - startPosX) > Math.abs(yDistance)) {
    x += (xDistance > 0) ? 1 : -1;
  } else {
    y += (yDistance > 0) ? 1 : -1;
  }
  return [x,y];
}

function resetBackground(){
  basicBtn.style.display = 'none';
  timeBtn.style.display = 'none';
  description.style.display= 'none';
  background.style.display = 'none';
  clouds.style.display = 'none';
  clouds2.style.display = 'none';
  title.style.display = 'none';
  right.style.display = 'flex';
  left.style.display = 'flex';
  body.classList.add('newBg');
}


function bringBackBackground(){

  description.style.display= 'inline';
  body.classList.remove('newBg');
  background.style.display = 'block';
  clouds.style.display = 'inline';
  clouds2.style.display = 'inline';
  title.style.display = 'inline';
  right.style.display = 'none';
  left.style.display = 'none';

}
