//canvas
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

//constants
var interval;
var frames = 0;
var p1 = '';
var p2 = '';

//class
class Road{
  constructor(x=0, playerName='incognito'){
    this.x = x;
    this.y = -512;
    this.width = canvas.width / 2;
    this.height = canvas.height;
    this.sY = 0;
    this.playerName = playerName;
    this.pause = false;
    this.km = 0;
    this.isFallen = false;
  }

  moveY(){
    if (this.pause) return;
    if (this.y <= 0){
      this.y += 1 * this.sY;
    } else {
      this.y = -512;
    }
  }

  draw(){
    //move road
    this.moveY();

    //Camino y nombre
    ctx.beginPath();
    ctx.fillStyle = 'darkgrey';
    ctx.fillRect(this.x,this.y,this.width,this.height*2);
    ctx.font = "20px monospace";
    ctx.fillStyle = 'white';
    ctx.fillText(this.playerName, this.x + 200,30);
    ctx.closePath();

    //Borde derecho
    ctx.beginPath();
    ctx.strokeStyle = 'limegreen';
    ctx.lineWidth=16;
    ctx.setLineDash([]);
    ctx.moveTo(this.x + 504,this.y);
    ctx.lineTo(this.x + 504,this.y+1024);
    ctx.stroke();
    ctx.closePath();

    //Borde Izquierdo
    ctx.beginPath();
    ctx.strokeStyle = 'gold';
    ctx.lineWidth=16;
    ctx.setLineDash([]);
    ctx.moveTo(this.x + 8,this.y);
    ctx.lineTo(this.x + 8,this.y+1024);
    ctx.stroke();
    ctx.closePath();

    //lineas calle
    ctx.beginPath();
    ctx.strokeStyle = 'white';
    ctx.lineWidth=2;
    ctx.setLineDash([10,10]);
    ctx.moveTo(this.x + 136,this.y);
    ctx.lineTo(this.x + 136,this.y+1024);
    ctx.moveTo(this.x + 256,this.y);
    ctx.lineTo(this.x + 256,this.y+1024);
    ctx.moveTo(this.x + 376,this.y);
    ctx.lineTo(this.x + 376,this.y+1024);
    ctx.stroke();
    ctx.closePath();
  }
}

class Bike{
  constructor(player=1){
    this.player = player;
    this.width = 16;
    this.height = 64;
    this.x = this.player===2 ? 528 + 60 - (this.width/2) : 16 + 60 - (this.width/2);
    this.y = canvas.height-this.height;
    this.pause = false;
    this.km = 0;
    this.isFallen = false;
    this.speed = 0;
  }

  addKm(){
    if(!this.pause && !this.isFallen){
      this.km+= 1*this.speed;
    }
  }

  moveBike(movement){
    if(!this.pause && !this.isFallen){
      if((this.player === 1 && movement=='left' && this.x-120 > 0) || (this.player === 2 && movement=='left' && this.x-120 > 512)){
        this.x -= 120;
      } else if ((this.player === 1 && movement=='right' && this.x+120 < 512) || (this.player === 2 && movement=='right' && this.x+120 < 1024)){
        this.x += 120;
      }
    }
  }

  draw(){
    this.addKm();
    //Puntaje Jugador
    ctx.beginPath();
    ctx.font = "20px monospace";
    ctx.fillStyle = 'white';
    ctx.fillText((this.km/1200).toFixed(2) + ' km', this.player===2?1024-150:512-150,30);
    ctx.closePath();

    //Bici prueba
    ctx.beginPath();
    ctx.fillStyle = 'red';
    ctx.fillRect(this.x,this.y,this.width,this.height);
    ctx.closePath();
  }
}

//instances
var roadPlayer1;
var roadPlayer2;
var bike1 = new Bike(1);
var bike2 = new Bike(2);

//mainFunctions
function update(){
  frames++;
  speedUp();
  ctx.clearRect(0,0,canvas.width,canvas.height);
  roadPlayer1.draw();
  roadPlayer2.draw();
  bike1.draw();
  bike2.draw();
}

function start(){
  if(interval) return;
  getNames();
  roadPlayer1 = new Road(0, p1);
  roadPlayer2 = new Road(512, p2);
  interval = setInterval(update, 1000/60);
}

function restart(){
  start();
}

function pausa(){
  clearInterval(interval);
  roadPlayer1.pause = true;
  roadPlayer2.pause = true;
  bike1.pause = true;
  bike2.pause = true;
  ctx.beginPath();
  ctx.fillStyle = 'peru';
  ctx.fillRect(128,64,768,384);
  ctx.font = "60px monospace";
  ctx.fillStyle = 'white';
  ctx.fillText('Se hace tarde...', 200,200);
  ctx.font = "20px monospace";
  ctx.fillStyle = 'white';
  ctx.fillText('¡Preciona Continuar para llegar a tiempo!', 200,250);
  ctx.closePath();
}

function unpause(){
  roadPlayer1.pause = false;
  roadPlayer2.pause = false;
  bike1.pause = false;
  bike2.pause = false;
  interval = setInterval(update, 1000/60);
}

//aux functions
function getNames(){
  var name1 = document.getElementById('p1').value;
  var name2 = document.getElementById('p2').value;
  if(name1 != ''){
    p1 = name1;
  } else {
    p1 = undefined;
  }
  if(name2 != ''){
    p2 = name2;
  } else {
    p2 = undefined;
  }
}

function speedUp(){
  if((bike1.km%1200) == 0){
    bike1.speed +=0.5;
    roadPlayer1.sY +=0.5;
  }
  if((bike2.km%1200) == 0){
    bike2.speed +=0.5;
    roadPlayer2.sY +=0.5;
  }
}

//listeners
document.getElementById('startGame').addEventListener('click', function(){
  start();
  document.getElementById('pausa').removeAttribute('class');
  document.getElementById('restart').removeAttribute('class');
  document.getElementById('startGame').classList.add("hide");
  document.getElementById('p1').classList.add("hide");
  document.getElementById('p2').classList.add("hide");
});

document.getElementById('pausa').addEventListener('click', function(){
  if(!roadPlayer1.pause){
    pausa();
    document.getElementById('pausa').innerHTML = "Continuar";
  } else {
    unpause();
    document.getElementById('pausa').innerHTML = "Pausa";
  }
});

addEventListener('keydown', function(e){
  switch(e.which){
    case 39:
      bike2.moveBike('right');
      break;
    case 37:
      bike2.moveBike('left');
      break;
    case 90:
      bike1.moveBike('left');
      break;
    case 67:
      bike1.moveBike('right');
      break;
  } 
});