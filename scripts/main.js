

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

require(["functions", "jquery", "bootstrap", "howler.min", "sounds", "TweenLite.min", "CSSPlugin.min", "resources", "input", "sprite", "movement", "kinetic-v4.4.3.min", "inheritance", "entities"], function($) {loaded();});
var stage;


wWidth = window.innerWidth;
wHeight = window.innerHeight;


function loaded(){

    stage = new Kinetic.Stage({
        container: 'game',
        height: wHeight,
        width: wWidth
    });
    //var mousePos = stage.getMousePosition();
    var mousePos = { x: -1, y: -1 };
    $(document).mousemove(function(event) {
        mousePos.x = event.pageX;
        mousePos.y = event.pageY;
    });


    $('button#startGame').on('click', function (e){
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
            removal();

            lastTime = now;
            requestAnimFrame(main);
        };

        //Resource Load
        resources.load([
            'images/playerShip.png',
            'images/redLaser.png',
            'images/asteroid3.png',
            'images/debugPixel.jpg',
            'images/playerExhaust.png',
            'images/asteroidExplosion.png'
        ]);
        resources.onReady(init);

        //Initialize
        function init() {

            TweenLite.to('#game',1,{opacity:1});

            lastTime = Date.now();
            main();
        }

        //Game State
        gameLayer = new Kinetic.Layer();

        var player = createEntity(entitiesJSON.ships.corvette, 'ship', [200,200], 0);
        stage.add(gameLayer);
        var bullets = [];
        var bulletsToRemove =[];
        var enemies = [];
        var enemiesToRemove = [];

        var lastFire = Date.now();
        var gameTime = 0;
        var isGameOver;
        var targetOffset= {};
        var ui = {
            centerPlayer: true
        }

        //ZOOM

        document.addEventListener("mousewheel", zoom);
        var z = {
            scale: 1,
            zoomFactor: 1.1,
            origin: {
                x: 0,
                y: 0
            },
            currentScale:1
        };
        function zoom (event) {
            event.preventDefault();
            var evt = event,
                mx = evt.clientX /* - canvas.offsetLeft */,
                my = evt.clientY /* - canvas.offsetTop */;
            var zoom = (z.zoomFactor - (evt.wheelDelta < 0 ? 0.2 : 0));
            console.log(evt.wheelDelta);
            var newscale = z.scale * zoom;
            if (newscale > 5 || newscale<0.2) return;
            z.origin.x = mx / z.scale + z.origin.x - mx / newscale;
            targetOffset.x = mx / z.scale + z.origin.x - mx / newscale;
            z.origin.y = my / z.scale + z.origin.y - my / newscale;
            targetOffset.y = my / z.scale + z.origin.y - my / newscale;
            gameLayer.setScale(newscale);

            z.scale *= zoom;
        }
        // Update game objects
        function update(dt) {
            gameTime += dt;
            if (Math.random() < 0.02){
                var astPosition = [Math.floor(Math.random() * (1200 - 0 + 1)) + 0, Math.floor(Math.random() * (800 - 0 + 1)) + 0];
                var newEnemy = createEntity(entitiesJSON.asteroids.asteroid3, 'asteroid', astPosition,0);
                enemies.push(newEnemy);
            }
            handleInput(dt);
            updateEntities(dt);

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

            if(input.isDown('SPACE') &&
                !isGameOver &&
                Date.now() - lastFire > 100) {
                fireButton();
            }

        }

        function fireButton() {
            if (mousePos){
                var newBullet = player.fireTurret(mousePos);
                bullets.push(newBullet);

                //gameLayer.add(newBullet.image);
                lastFire = Date.now();
            }
        }

        function updateEntities(dt) {
            // Update the player sprite animation
            //player.sprite.update(dt);
            updateMovement (player, dt);

            // Update all the enemies
            var eneLength = enemies.length; //optimizing for loop
            for(var i=0; i<eneLength; i++) {
                updateMovement(enemies[i], dt);
            }

            // Update all the bullets
            var bulLength = bullets.length; //optimizing for loop
            for(var i=0; i<bulLength; i++) {
                updateMovement(bullets[i], dt);
                //removing bullets out of range
                if (bullets[i].checkRange()){
                    bulletsToRemove.push([i]);
                } else {
                }
            }

            bullets = remove(bullets, bulletsToRemove);
            bulletsToRemove = [];

            //COLLISION DETECTION
            //Bullets to Enemies
            var bulLen = bullets.length;
            var eneLen = enemies.length;
            for (var i = 0; i < bulLen; i++){
                for (var j = 0; j < eneLen; j++){
                    if (simpleCollision(bullets[i], enemies[j])) {
                        if (bullets[i].hit(bullets[i]) == 'dead') {
                            bullets[i].destroy();
                            bulletsToRemove.push(i);
                        }
                        if (enemies[j].hit(bullets[i]) == 'dead'){
                            enemies[j].destroy();
                            enemiesToRemove.push(j);
                        }
                    }
                }
            }

            //

        } //end updateEntities

        function render() {
            player.image.setPosition(player.pos[0], player.pos[1]);
            for(var i=0; i<enemies.length; i++) {
                enemies[i].image.setPosition(enemies[i].pos[0], enemies[i].pos[1]);
            }

            for(var i=0; i<bullets.length; i++) {
                bullets[i].image.setPosition(bullets[i].pos[0], bullets[i].pos[1]);
            }

            gameLayer.setOffset(player.pos[0]-(wWidth/2)/z.scale, player.pos[1]-(wHeight/2)/z.scale);

            stage.draw();
            updateHud();
        }

        function removal(){

            bullets = remove(bullets, bulletsToRemove);
            bulletsToRemove = [];
            enemies = remove(enemies, enemiesToRemove);
            enemiesToRemove = [];
        }

        function updateHud(){

            $('#hud').html("" +
                "<p unselectable='on'>X: "+player.pos[0]+"</p>" +
                "<p unselectable='on'>Y: "+player.pos[1]+"</p>" +
                "<p unselectable='on'>Speed: "+player.speed[0]+"</p>" +
                "<p unselectable='on'>Speed Angle: "+player.speed[1]+"</p>" +
                "<p unselectable='on'>Angle: "+player.angle+"</p>" +
                "<p id='mx' unselectable='on'></p>" +
                "<p id='my' unselectable='on'></p>");
            if (mousePos){
                $('#cursor').css({top: mousePos.y - cursorHeight, left: mousePos.x - cursorWidth});
                $('#mx').html("Mouse X: "+mousePos.x);
                $('#my').html("Mouse Y: "+mousePos.y);
            } else {
                $('#mx').html("Mouse X: Unknown");
                $('#my').html("Mouse Y: Unknown");
            }
        }

    } //end startGame
}


