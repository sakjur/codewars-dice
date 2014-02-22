var socket = io.connect('http://10.30.0.104:8888');

function Ball(ctx) {
	this.ctx = ctx;
	this.direction = 90;
	this.x = 50;
	this.y = 20; 
	this.w = 14; 
	this.h = 14;
	this.speed = 1.00;
	this.draw = function(){
		ctx.fillStyle = "blue";
		ctx.fillRect(this.x, this.y, this.w, this.h);
	}

};

function Paddle(ctx) {
    this.ctx = ctx;
    this.x= 50;
	this.y= 20; 
	this.w= 14; 
	this.h= 56;
	this.move = 0;
	this.speed = 3.00;
	this.score = 0;
	this.draw = function(){
		ctx.fillStyle = "red";
		ctx.fillRect(this.x, this.y, this.w, this.h);

		ctx.fillStyle = "white";
		ctx.fillText(this.score, this.x, 10);
	}
}

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

function drawTable(){

	//background
	ctx.fillStyle = "gray";
	ctx.fillRect(0,0,600,300);

	//upper wall
	ctx.fillStyle = "black";
	ctx.fillRect(0,0,600,20);

	//lower wall
	ctx.fillStyle = "black";
	ctx.fillRect(0,280,600,20);

	// middle
	ctx.fillstyle = "black";
	ctx.fillRect(299,0,2,300)

	if (players == 1 && l_bot != true && r_bot != true)
	{
		ctx.fillStyle = "white";
		ctx.fillText("Waiting for players!", 250, 10);
	}

}

// drawTable();

var ball = new Ball(ctx);
var paddle_r = new Paddle(ctx);
var paddle_l = new Paddle(ctx);
var players = 0;

document.addEventListener('keydown', function(event){

	console.log(event.keyCode);

	// A
	if(event.keyCode == 65){
		paddle_l.move = -1;
	}
	// Z
	else if(event.keyCode == 90){
		paddle_l.move = 1;

	}
	// UP
	if(event.keyCode == 38){
		paddle_r.move = -1;
	}
	// DOWN
	else if(event.keyCode == 40){
		paddle_r.move = 1;
	}

	push_moves(socket, paddle_l, paddle_r)
	
});

document.addEventListener('keyup', function(event){

	// A
	if(event.keyCode == 65){
		paddle_l.move = 0;
	}
	// Z
	else if(event.keyCode == 90){
		paddle_l.move = 0;

	}
	// UP
	if(event.keyCode == 38){
		paddle_r.move = 0;
	}
	// DOWN
	else if(event.keyCode == 40){
		paddle_r.move = 0;
	}

	push_moves(socket, paddle_l, paddle_r)
	
});

   


function push_moves(socket, left, right)
{
	socket.emit('move', {
		left: left.move,
		right: right.move
	});
}

socket.emit('setBot', {
	left: l_bot,
	right: r_bot
});

socket.on('board', function (data) {
	drawTable();
	paddle_l.x = data.left_x;
	paddle_l.y = data.left_y;
	paddle_l.score = data.left_score;
	paddle_r.x = data.right_x;
	paddle_r.y = data.right_y;
	paddle_r.score = data.right_score;
	ball.speed = data.ball.speed;
	ball.direction = data.ball.direction;
	ball.x = data.ball.x;
	ball.y = data.ball.y;
	ball.h = data.ball.h;
	ball.w = data.ball.w;
	players = data.players;

	paddle_l.draw();
	paddle_r.draw();
	ball.draw();
});
