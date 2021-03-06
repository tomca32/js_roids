

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

        var player = new Ship(entitiesJSON.ships.corvette, {x:0, y:0}, 0);//createEntity(entitiesJSON.ships.corvette, 'ship', [200,200], 0);
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

            var newscale = z.scale * zoom;
            if (newscale > 5 || newscale<0.2) return;
            z.origin.x = mx / z.scale + z.origin.x - mx / newscale;
            targetOffset.x = mx / z.scale + z.origin.x - mx / newscale;
            z.origin.y = my / z.scale + z.origin.y - my / newscale;
            targetOffset.y = my / z.scale + z.origin.y - my / newscale;
            gameLayer.setScale(newscale);

            z.scale *= zoom;
        }

        function randomAngle() {
            return randomReal(0, 2*Math.PI);
        }

        function getMinimum(){
            //gets minimum spawn distance
            var min = Math.sqrt(Math.pow(wWidth,2)+Math.pow(wHeight,2)) / z.scale;

            return min;
        }

        function getRandomPosition(origin, minDistance, range){
            var distance = randomInt(minDistance, minDistance+range);
            var angle = randomAngle();
            return {x:origin.x+Math.cos(angle)*distance, y:origin.y+Math.sin(angle)*distance};
        }

        function getRandomVector(position, target, minSpeed, maxSpeed) {
            var speed = randomInt(minSpeed, maxSpeed);

            var tempVector = [target.x - position.x, target.y - position.y];


            var magnitude = Math.sqrt(Math.pow(tempVector[0],2) + Math.pow(tempVector[1],2));
            tempVector =[tempVector[0]/magnitude, tempVector[1]/magnitude];
            console.log(tempVector);
            var angle = Math.atan2(tempVector[0], tempVector[1]*(-1))-Math.PI/2;
            console.log(angle);
            return [speed, angle];
        }

        // Update game objects
        function update(dt) {
            gameTime += dt;
            if (Math.random() < 0.02){
                var center = {x:gameLayer.getOffset().x + (wWidth / z.scale)/2, y: gameLayer.getOffset().y + (wHeight / z.scale)/2};
                var enemyPosition = getRandomPosition(center, getMinimum(), 100);
                var enemySpeed = getRandomVector(enemyPosition, center, entitiesJSON.asteroids.asteroid3.minSpeed, entitiesJSON.asteroids.asteroid3.maxSpeed);
                var newEnemy = new Asteroid(entitiesJSON.asteroids.asteroid3, enemyPosition, enemySpeed);//createEntity(entitiesJSON.asteroids.asteroid3, 'asteroid', 0,0);
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

            if(input.isDown('SPACE') && Date.now() - lastFire > 100) {
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
            player.image.setPosition(player.pos.x, player.pos.y);
            for(var i=0; i<enemies.length; i++) {
                enemies[i].image.setPosition(enemies[i].pos.x, enemies[i].pos.y);
            }

            for(var i=0; i<bullets.length; i++) {
                bullets[i].image.setPosition(bullets[i].pos.x, bullets[i].pos.y);
            }

            gameLayer.setOffset(player.pos.x-(wWidth/2)/z.scale, player.pos.y-(wHeight/2)/z.scale);

            //gameLayer.setOffset(z.origin.x, z.origin.y);
            //console.log(gameLayer.getOffset());

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
                "<p unselectable='on'>X: "+player.pos.x+"</p>" +
                "<p unselectable='on'>Y: "+player.pos.y+"</p>" +
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


