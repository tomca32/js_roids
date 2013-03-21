// A cross-browser requestAnimationFrame
// See https://hacks.mozilla.org/2011/08/animating-with-javascript-from-setinterval-to-requestanimationframe/
var requestAnimFrame = (function(){
    return window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
})();

requirejs.config({
    shim: {
        'bootstrap' : ['jquery'],
        'sounds': 'howler.min',
        'CSSPlugin.min': 'TweenLite.min',
        'jquery': {
            exports: '$'
        }
    },
    paths: {
        'jquery': 'http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min',
        'bootstrap': 'http://netdna.bootstrapcdn.com/twitter-bootstrap/2.2.1/js/bootstrap.min'
    }
});

require(["jquery", "bootstrap", "howler.min", "sounds", "TweenLite.min", "CSSPlugin.min", "resources", "input", "sprite", "movement", "kinetic-v4.3.3.min"], function($) {
    //the jquery.alpha.js and jquery.beta.js plugins have been loaded.
    $(function() {
        loaded();
    });
});
var stage;
wWidth = window.innerWidth;
wHeight = window.innerHeight;


function loaded(){
    stage = new Kinetic.Stage({
        container: 'game',
        height: wHeight,
        width: wWidth
    });

    $('button').on('click', function (e){
        TweenLite.to('#mainTitle, #startGame', 1, {alpha:0, onComplete: startGame});

    });
    var layer = new Kinetic.Layer();
    var rect = new Kinetic.Rect({
        x: 0,
        y: 0,
        width: wWidth,
        height: wHeight,
        fill: 'black'
    });

    $(window).resize(function(){
        wWidth = window.innerWidth;
        wHeight = window.innerHeight;
        $('#game').css({'height': wHeight, 'width': wWidth});
        stage.setSize(wWidth, wHeight);
        rect.width = wWidth;
        rect.height = wHeight;
    });

    function startGame(){
        $('#game').css({'z-index':'10'});

        layer.add(rect);
        stage.add(layer);
        $(window).resize();

        //MAIN LOOP
        var lastTime;
        function main() {
            var now = Date.now();
            var dt = (now - lastTime) / 1000.0;

            update(dt);
            render();

            lastTime = now;
            requestAnimFrame(main);
        };

        //Resource Load
        resources.load([
            'images/playerShip.png',
            'images/redLaser.png'
        ]);
        resources.onReady(init);

        //Initialize
        function init() {

            TweenLite.to('#game',1,{opacity:1});

            /*document.getElementById('play-again').addEventListener('click', function() {
             reset();
             });*/

            //reset();
            lastTime = Date.now();
            main();
        }

        //Game State
        var playerImage = new Image();
        playerImage.src = 'images/playerShip.png';
        var player = {
            pos: [200, 200],
            image: new Kinetic.Image({
                x: 200,
                y: 200,
                image: playerImage,
                width: 32,
                height: 48,
                offset:[16,30]
            }),
            size: [32,48], //image size
            acceleration: 50, //pixels per seconds squared
            speed: [0,0], //Speed vector [pixels per second, angle of speed(0-360)]
            maxSpeed: 150, //max speed in pixels per second
            angle: 90,
            thrust: false,
            rotation: 90, //rotation speed in degrees per second,
            center: []
        };
        player.center = [player.pos[0]+player.size[0],player.pos[1]+player.size[1]];
        gameLayer = new Kinetic.Layer();
        gameLayer.add(player.image);
        stage.add(gameLayer);
        var bullets = [];
        var enemies = [];
        var explosions = [];

        var lastFire = Date.now();
        var gameTime = 0;
        var isGameOver;
        var terrainPattern;

        // Update game objects
        function update(dt) {
            gameTime += dt;

            handleInput(dt);
            updateEntities(dt);

            // It gets harder over time by adding enemies using this
            // equation: 1-.993^gameTime
            /*if(Math.random() < 1 - Math.pow(.993, gameTime)) {
                enemies.push({
                    pos: [canvas.width,
                        Math.random() * (canvas.height - 39)],
                    sprite: new Sprite('img/sprites.png', [0, 78], [80, 39],
                        6, [0, 1, 2, 3, 2, 1])
                });
            } */

            //checkCollisions();

            //scoreEl.innerHTML = score;
        }

        //Input Handler
        function handleInput(dt) {
            if(input.isDown('DOWN') || input.isDown('s')) {
               //player.pos[1] += playerSpeed * dt;
            }

            if(input.isDown('UP') || input.isDown('w')) {
                player.thrust = true;
            } else {
                player.thrust = false;
            }

            if(input.isDown('LEFT') || input.isDown('a')) {
                player.angle -= player.rotation * dt;
                if (player.angle < 0) player.angle += 360;
            }

            if(input.isDown('RIGHT') || input.isDown('d')) {
                player.angle += player.rotation * dt;
                if (player.angle > 360) player.angle -= 360;
            }

            /*if(input.isDown('SPACE') &&
                !isGameOver &&
                Date.now() - lastFire > 100) {
                var x = player.pos[0] + player.sprite.size[0] / 2;
                var y = player.pos[1] + player.sprite.size[1] / 2;

                bullets.push({ pos: [x, y],
                    dir: 'forward',
                    sprite: new Sprite('img/sprites.png', [0, 39], [18, 8]) });
                bullets.push({ pos: [x, y],
                    dir: 'up',
                    sprite: new Sprite('img/sprites.png', [0, 50], [9, 5]) });
                bullets.push({ pos: [x, y],
                    dir: 'down',
                    sprite: new Sprite('img/sprites.png', [0, 60], [9, 5]) });

                lastFire = Date.now();
            }*/
        }

        function updateEntities(dt) {
            // Update the player sprite animation
            //player.sprite.update(dt);
            updateMovement (player, dt);
            // Update all the bullets
            for(var i=0; i<bullets.length; i++) {
                var bullet = bullets[i];

                switch(bullet.dir) {
                    case 'up': bullet.pos[1] -= bulletSpeed * dt; break;
                    case 'down': bullet.pos[1] += bulletSpeed * dt; break;
                    default:
                        bullet.pos[0] += bulletSpeed * dt;
                }

                // Remove the bullet if it goes offscreen
                if(bullet.pos[1] < 0 || bullet.pos[1] > canvas.height ||
                    bullet.pos[0] > canvas.width) {
                    bullets.splice(i, 1);
                    i--;
                }
            }

            // Update all the enemies
            for(var i=0; i<enemies.length; i++) {
                enemies[i].pos[0] -= enemySpeed * dt;
                enemies[i].sprite.update(dt);

                // Remove if offscreen
                if(enemies[i].pos[0] + enemies[i].sprite.size[0] < 0) {
                    enemies.splice(i, 1);
                    i--;
                }
            }

            // Update all the explosions
            for(var i=0; i<explosions.length; i++) {
                explosions[i].sprite.update(dt);

                // Remove if animation is done
                if(explosions[i].sprite.done) {
                    explosions.splice(i, 1);
                    i--;
                }
            }
        } //end updateEntities

        function render() {
            //layer.clear();
            //layer.add(rect);
            player.image.setPosition(player.pos[0], player.pos[1]);
            stage.draw();
            updateHud();
           /*
            ctx.fillStyle = terrainPattern;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Render the player if the game isn't over
            if(!isGameOver) {
                renderEntity(player);
            }

            renderEntities(bullets);
            renderEntities(enemies);
            renderEntities(explosions);*/
        }

        function updateHud(){
            $('#hud').html("" +
                "<p>X: "+player.pos[0]+"</p>" +
                "<p>Y: "+player.pos[1]+"</p>" +
                "<p>Speed: "+player.speed[0]+"</p>" +
                "<p>Speed Angle: "+player.speed[1]+"</p>" +
                "<p>Angle: "+player.angle+"</p>");
        }

    } //end startGame
}


