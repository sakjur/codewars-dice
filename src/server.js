var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

	server.listen(8888);

app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});

app.get('/sp', function (req, res) {
    res.sendfile(__dirname + '/singleplayer.html');
});

app.get('/mp', function (req, res) {
    res.sendfile(__dirname + '/multiplayer.html');
});

app.get('/upupdowndownleftrightleftrightba', function (req, res) {
    res.sendfile(__dirname + '/bot.html');
});

app.get('/main.js', function (req, res) {
	res.sendfile(__dirname + '/main.js');
});

var runs = true;

function Ball() {
    this.direction = 90;
    this.x = 50;
    this.y = 20; 
    this.w=  14; 
    this.h= 14;
    this.speed = 1.00;
    this.update_position = function(x ,y){


        this.x = x;
        this.y = y;
        var win = 0;

        if(x > 583 || x < 17){
            if(x > 583) 
                win = -1;
            else
                win = 1;

            this.respawn();

            }
        if(y >= 266 || y <= 20){
            if (y > 266)
            {
                this.y = 260-this.speed;
            } else {
                this.y = 25+this.speed;
            }
            if(this.direction < 90 && this.direction > 0)
                this.direction = 360-this.direction;
            else if (this.direction < 270 && this.direction > 180)
                this.direction -= 90;
            else if(this.direction < 180 && this.direction > 90)
                this.direction = (this.direction+90) ;
            else if(this.direction < 360 && this.direction > 270)
                this.direction = 360-this.direction;
        }

        this.direction = this.direction % 360;
        return win;
    }

    this.detect = function(paddle){

        if((this.x > paddle.x - this.w) && (this.x < paddle.x + paddle.w) &&
            this.y > paddle.y && this.y < paddle.y+paddle.h

            ){

            this.speed *= 1.2; 

            var paddle_middle = paddle.y + paddle.h/2;
            var ball_middle = this.y + this.h/2;
            var ball_direction_var = (paddle_middle-ball_middle) / paddle.h;
            this.direction = (this.direction + 90 + (ball_direction_var*85)) % 360;
        }

    }
    
    this.respawn = function(){

    
        do{

            this.direction = Math.random()*360; 
        }
        while(Math.abs(Math.sin(deg2rad(this.direction))) > Math.sin(deg2rad(85)) )
        
        this.x = 200 + 200 * Math.random() - (this.w / 2);
        this.y = 20 + (260 - this.h) * Math.random();
        this.speed = Math.random() * 3 + 2;


    }


};

function Paddle(ctx) {
    this.ctx = ctx;
    
    this.x= 0;
    this.y= 0; 
    this.w= 14; 
    this.h= 56;
    this.move = 0;
    this.speed = 3.00;
    this.score = 0;
    this.bot = 0;
    this.update_position = function(){
        y = this.y;

        if (this.move != 0) {
            y += this.move*this.speed;
        };

        if( y < 20 )
            y = 20;
        else if (y > 280-this.h)
            y = 280-this.h;

        this.y = y;
    }
    this.addScore = function(){
        this.score++;
    }
    this.botMove = function(ball){
        if(Math.abs((this.y+this.h/2) - (ball.y+ball.h/2)) < this.h)
            this.y = ball.y-ball.h/2-this.h/2;
        else
        {
            if ((this.y+this.h/2) - (ball.y+ball.h/2) > 0)
                sign = 1
            else
                sign = -1
            this.y = this.y - sign * this.h;
        }
    }

}

function deg2rad(x){
    return x * Math.PI / 180;
}

var ball = new Ball();
var paddle_r = new Paddle();
var paddle_l = new Paddle();
paddle_l.x = 10
paddle_r.x = 570
paddle_l.y = 40
paddle_r.y = 40

ball.respawn();
players = [];


setInterval(function(){
    if (paddle_r.bot)
        paddle_r.botMove(ball);
    if (paddle_l.bot)
        paddle_l.botMove(ball);
}, 1000/3);

setInterval(function(){
    if (players.length < 2 && paddle_r.bot != true && paddle_r.bot != true)
        runs = false
    if (players.length == 0)
        runs = false

    if (runs == false)
        return;

    ball.detect(paddle_r);
    ball.detect(paddle_l);

    var x_new = ball.x + ball.speed * Math.cos(deg2rad(ball.direction));
    var y_new = ball.y + ball.speed * Math.sin(deg2rad(ball.direction));
    var result = ball.update_position(x_new, y_new);

    if (result == -1)
        paddle_l.addScore();
    else if (result == 1)
        paddle_r.addScore();

    paddle_r.update_position();
    paddle_l.update_position();
}, 1000/30);

io.sockets.on('connection', function (socket) {
    console.log("Connection established")
	
    players.push(1)

    setInterval(function(){
        if (players.length > 1 || paddle_r.bot == true || paddle_l.bot == true)
            runs = true


        io.sockets.emit('board', { 
            left_x: paddle_l.x,
            left_y: paddle_l.y,
            left_score: paddle_l.score,
            right_x: paddle_r.x,
            right_y: paddle_r.y,
            right_score: paddle_r.score,
            ball: ball,
            players: players
        });
    }, 1000/30);


    socket.on('move', function (data) {
        paddle_r.move = data.right;
        paddle_l.move = data.left;
    });

    socket.on('setBot', function (data) {
        paddle_r.bot = data.right;
        paddle_l.bot = data.left;
    });

    socket.on('disconnect', function (data) {
        players.pop();
    });
    
});