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
        'sounds': ['howler.min'],
        'entities': ['inheritance'],
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

require(["jquery", "bootstrap", "howler.min", "sounds", "TweenLite.min", "CSSPlugin.min", "resources", "input", "sprite", "movement", "kinetic-v4.3.3.min", "inheritance", "entities"], function($) {
    //the jquery.alpha.js and jquery.beta.js plugins have been loaded.
    $(function() {
        loaded();
    });
});
var stage;
function randomInt (rMin, rMax){
    return Math.floor(Math.random() * (rMax - rMin + 1)) + rMin;
}
function randomReal(rmin, rmax) {
    return Math.random() * (rmax - rmin) + rmin;
}

wWidth = window.innerWidth;
wHeight = window.innerHeight;


function loaded(){

    stage = new Kinetic.Stage({
        container: 'game',
        height: wHeight,
        width: wWidth
    });
    var mousePos = stage.getMousePosition();

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
        rect.setWidth(wWidth);
        rect.setHeight(wHeight);
    });

    function startGame(){
        $('body').append('<div id="cursor"></div>');
        var cursorHeight = $('#cursor').height() / 2;
        var cursorWidth = $('#cursor').width() / 2;
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
            'images/redLaser.png',
            'images/asteroid3.png'
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

        var player = createEntity(entitiesJSON.ships.corvette, 'ship', [200,200], 90);
        //var player = new Ship("player", 1, [200,200], 90, 'images/playerShip.png', [32,48], [0, 6], 50, 20, 150, 50, 90);
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
            mousePos = stage.getMousePosition();
            if (Math.random() < 0.02){
                var astPosition = [Math.floor(Math.random() * (1200 - 0 + 1)) + 0, Math.floor(Math.random() * (800 - 0 + 1)) + 0];
                var newEnemy = createEntity(entitiesJSON.asteroids.asteroid3, 'asteroid', astPosition,0);
                gameLayer.add(newEnemy.image);
                enemies.push(newEnemy);
            }
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
            player.reverse = false;
            if(input.isDown('UP') || input.isDown('w')) {
                player.thrust = true;
                player.reverse = false;
            } else {
                player.thrust = false;
                if(input.isDown('DOWN') || input.isDown('s')) {
                    player.reverse = true;
                }
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
                updateMovement(enemies[i], dt);
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
            for(var i=0; i<enemies.length; i++) {
                enemies[i].image.setPosition(enemies[i].pos[0], enemies[i].pos[1]);
            }

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
            if (mousePos){
                $('#cursor').css({top: mousePos.y - cursorHeight, left: mousePos.x - cursorWidth});
            }
            $('#hud').html("" +
                "<p unselectable='on'>X: "+player.pos[0]+"</p>" +
                "<p unselectable='on'>Y: "+player.pos[1]+"</p>" +
                "<p unselectable='on'>Speed: "+player.speed[0]+"</p>" +
                "<p unselectable='on'>Speed Angle: "+player.speed[1]+"</p>" +
                "<punselectable='on'>Angle: "+player.angle+"</p>");
        }

    } //end startGame
}


