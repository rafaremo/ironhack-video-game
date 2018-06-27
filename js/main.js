//canvas
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

//constants
var interval;
var frames = 0;
var p1 = '';
var p2 = '';
var instrucciones = new Image();
instrucciones.src = './assets/instrucciones.png';
var obstaculosP1 = [];
var obstaculosP2 = [];
var funcionesObstaculos = [generarBache];

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
    this.width = 32;
    this.height = 64;
    this.x = this.player===2 ? 528 + 60 - (this.width/2) : 16 + 60 - (this.width/2);
    this.y = canvas.height-this.height - 32;
    this.image = new Image();
    this.image.src = './assets/bicicle.png';
    this.pause = false;
    this.km = 0;
    this.isFallen = false;
    this.speed = 0;
    this.isJumping = false;
    this.jumpCounter = 0;
    this.counterCrash = 0;
  }

  jump(){
    this.isJumping = !this.isJumping;
  }

  addKm(){
    if(!this.pause && !this.isFallen){
      this.km += this.speed;
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

  drawCrash(){
    var posX = this.player===2 ? 528 : 16;
    ctx.beginPath();
    ctx.font = "40px monospace";
    ctx.fillStyle = 'white';
    ctx.fillText('Chocaste', posX + 150,240);
    ctx.closePath();
  }

  draw(){
    this.addKm();

    //Puntaje Jugador
    ctx.beginPath();
    ctx.font = "20px monospace";
    ctx.fillStyle = 'white';
    ctx.fillText((this.km/1200).toFixed(2) + ' km', this.player===2?1024-150:512-150,30);
    ctx.closePath();

    //Bici
    if(this.isJumping){
      this.jumpCounter++;
      ctx.drawImage(this.image, this.x, this.y, this.width*1.5, this.height*1.5);
      var jumpC = 180 / this.speed;
      if(this.jumpCounter === jumpC){
        this.isJumping = false;
        this.jumpCounter = 0;
      }
    } else {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
  }
}

class Bache{
  constructor(jugador){
    this.jugador = jugador;
    this.laneNum = Math.floor(Math.random() * 4);
    this.width = 40;
    this.height = 40;
    this.xStart = jugador.player==1 ? 16 : 528;
    this.x = this.xStart + (120*this.laneNum) + 60 - (this.width/2);
    this.y = 10;
    this.image = new Image();
    this.image.src = './assets/hole.png';
  }

  checkIfCrash(item){
    if(item.isJumping){
      return false;
    } else {
      return  (this.x < item.x + item.width) &&
            (this.x + this.width > item.x) &&
            (this.y < item.y + item.height) &&
            (this.y + this.height > item.y);
    }
  }

  draw(){
    
    if(this.checkIfCrash(this.jugador)){
      this.jugador.isFallen = true;
      this.x = -100;
    }
    if (this.jugador.isFallen) {
      this.jugador.counterCrash++;
      this.jugador.drawCrash();
      if(this.jugador.counterCrash === 480*this.jugador.speed){
        this.jugador.counterCrash = 0;
        this.jugador.isFallen = false;
      }
    } else {
      this.y += 1*this.jugador.speed;
    }
    ctx.drawImage(this.image,this.x,this.y,this.width,this.height);
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
  drawObstacles();
  bike1.draw();
  bike2.draw();
  win();
}

function start(){
  getNames();
  roadPlayer1 = new Road(0, p1);
  roadPlayer2 = new Road(512, p2);
  interval = setInterval(update, 1000/60);
}

function restart(){
  clearInterval(interval);
  ctx.clearRect(0,0,canvas.width,canvas.height);
  frames=0;
  roadPlayer1 = null;
  roadPlayer2 = null;
  bike1 = new Bike(1);
  bike2 = new Bike(2);
  roadPlayer1 = new Road(0, p1);
  roadPlayer2 = new Road(512, p2);
  obstaculosP1 = [];
  obstaculosP2 = [];
  getNames();
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
  ctx.drawImage(instrucciones, 200, 280);
  ctx.closePath();
}

function unpause(){
  roadPlayer1.pause = false;
  roadPlayer2.pause = false;
  bike1.pause = false;
  bike2.pause = false;
  interval = setInterval(update, 1000/60);
}

function win(){
  if(bike1.km/1200 >= 20 || bike2.km/1200 >= 20){
    var ganador = '';
    var perdedor = '';
    if (bike1.km > bike2.km){
      ganador = roadPlayer1.playerName;
      perdedor = roadPlayer2.playerName;
    } else {
      ganador = roadPlayer2.playerName;
      perdedor = roadPlayer1.playerName;
    }
    clearInterval(interval);
    roadPlayer1.pause = true;
    roadPlayer2.pause = true;
    bike1.pause = true;
    bike2.pause = true;
    ctx.beginPath();
    ctx.font = "40px monospace";
    ctx.fillStyle = 'white';
    ctx.fillText(ganador + ' ha llegado a Ironhack', 200,200);
    ctx.font = "20px monospace";
    ctx.fillStyle = 'white';
    ctx.fillText('buen intento ' + perdedor, 200,250);
    ctx.closePath();
    document.getElementById('restart').removeAttribute('class');
    document.getElementById('pausa').classList.add("hide");
  }
}

//aux functions
function getNames(){
  var name1 = document.getElementById('p1').value;
  var name2 = document.getElementById('p2').value;
  if(name1 != ''){
    p1 = name1;
  } else {
    p1 = 'player 1';
  }
  if(name2 != ''){
    p2 = name2;
  } else {
    p2 = 'player 2';
  }
}

function speedUp(){
  var kmP1 = bike1.km;
  var kmP2 = bike2.km;

  //obstacles
  if((kmP1 % 120 === 0)){
    generateObstaculosP1();
  }

  if(kmP2 % 120 === 0){
    generateObstaculosP2();
  }

  //speed up
  if(kmP1%1200 == 0  && bike1.speed < 6){
    bike1.speed += 1;
    roadPlayer1.sY += 1;
  }
  if(kmP2%1200 == 0 && bike2.speed < 6){
    bike2.speed +=1;
    roadPlayer2.sY +=1;
  }

  //fallen
  roadPlayer1.pause = bike1.isFallen ? true : false;
  roadPlayer2.pause = bike2.isFallen ? true : false;
}

function generateObstaculosP1(){
  var obstaculoSeleccionado = Math.floor(Math.random()*funcionesObstaculos.length);
  funcionesObstaculos[obstaculoSeleccionado](bike1);
}

function generateObstaculosP2(){
  var obstaculoSeleccionado = Math.floor(Math.random()*funcionesObstaculos.length);
  funcionesObstaculos[obstaculoSeleccionado](bike2);
}

function generarBache(jugador){
  var bache = new Bache(jugador);
  if(jugador.player === 1){
    obstaculosP1.push(bache);
  } else {
    obstaculosP2.push(bache);
  }
}

function generarArbol(jugador){

}

function generarCharco(jugador){

}

function drawObstacles(){
  obstaculosP1.forEach(function(obstaculo){
    obstaculo.draw();
  });
  obstaculosP2.forEach(function(obstaculo){
    obstaculo.draw();
  });
}

//listeners
document.getElementById('startGame').addEventListener('click', function(){
  start();
  document.getElementById('pausa').removeAttribute('class');
  document.getElementById('startGame').classList.add("hide");
  document.getElementById('p1').classList.add("hide");
  document.getElementById('p2').classList.add("hide");
});

document.getElementById('pausa').addEventListener('click', function(){
  if(!roadPlayer1.pause){
    pausa();
    document.getElementById('restart').removeAttribute('class');
    document.getElementById('pausa').innerHTML = "Continuar";
  } else {
    unpause();
    document.getElementById('restart').classList.add("hide");
    document.getElementById('pausa').innerHTML = "Pausa";
  }
});

document.getElementById('restart').addEventListener('click', function(){
  restart();
  unpause();
  document.getElementById('restart').classList.add("hide");
  document.getElementById('pausa').removeAttribute('class');
  document.getElementById('pausa').innerHTML = "Pausa";
});

addEventListener('keydown', function(e){
  switch(e.which){
    case 39:
      bike2.moveBike('right');
      break;
    case 37:
      bike2.moveBike('left');
      break;
    case 38:
      bike2.jump();
      break;
    case 90:
      bike1.moveBike('left');
      break;
    case 67:
      bike1.moveBike('right');
      break;
    case 68:
      bike1.jump();
      break;
  } 
});