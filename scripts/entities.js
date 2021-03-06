var Entity = Class.extend({
    init: function(newEntity, pos, angle) {
        var that=this;
        var thisImage = new Image();
        thisImage.src = newEntity.imageURL;
        that.image = new Kinetic.Image({
            x: pos.x,
            y: pos[1],
            image: thisImage,
            width: newEntity.size[0],
            height: newEntity.size[1],
            //offset: [0,0]
            offset:[(newEntity.size[0]/2)+newEntity.bonusOffset[0],(newEntity.size[1]/2)+newEntity.bonusOffset[1]]
        });

        if(newEntity.name) that.name = newEntity.name;
        this.hitPoints = newEntity.hitPoints;
        this.explosion = newEntity.explosion;
        this.explosionSound = newEntity.explosionSound;
        this.pos = {x:pos.x, y:pos.y};
        this.speed = [0,0];
        this.thrust = false;
        this.reverse = false;
        this.distanceTravelled = 0;

        if (newEntity.sprites) {
            this.sprites = newEntity.sprites;
        }

        if (angle!=undefined) {
            this.angle = angle;
        } else {
            this.angle = 90;
        }
        gameLayer.add(this.image);
    },

    fireTurret: function(target){

        var dX = target.x - this.image.getAbsolutePosition().x;
        var dY = target.y - this.image.getAbsolutePosition().y;

        var costempAngle = dX / (Math.sqrt(Math.pow(dX,2)+Math.pow(dY,2)));
        var tempAngle = Math.acos(costempAngle);
        if (dY<0) tempAngle = 2*Math.PI - Math.abs(tempAngle);

        var degAngle = tempAngle*(180/Math.PI)+90;

        return new Bullet(entitiesJSON.weapons.redLaser, this.pos, degAngle);
    },

    hit: function(attacker) {
        if (this.hitPoints > 0){
            this.hitPoints = this.hitPoints - attacker.damage;
            if (this.hitPoints <= 0) {
                return "dead";
            }
        }
    },

    destroy: function(fading){
        if (this.explosion && this.explosion != "" && fading!==true){
            var newExplosion = new Explosion(this.explosion,this.pos);
            gameLayer.add(newExplosion.expAnim);
            newExplosion.expAnim.start();
            if (this.explosionSound) this.explosionSound.play();
        }
        this.image.destroy();
    }
});

var Ship = Entity.extend({
    init: function(newShip, pos, angle) {
        this._super(newShip, pos, angle);
        this.acceleration = newShip.acceleration;
        this.accReverse = newShip.accReverse;
        this.maxReverse = newShip.maxReverse;
        this.maxSpeed = newShip.maxSpeed;
        this.rotation = newShip.rotationSpeed;
        if (newShip.thrustURL){
            var thrustImg = new Image();
            thrustImg.src =newShip.thrustURL;
            this.thrustImage = new Kinetic.Image({
                x: pos.x+newShip.thrustPosition[0],
                y: pos.y+newShip.thrustPosition[1],
                image: thrustImg,
                opacity:0,
                offset:[newShip.thrustSize[0]/2,newShip.thrustSize[1]/2],
                width: newShip.thrustSize[0],
                height: newShip.thrustSize[1]
            });
            this.thrustPosition = newShip.thrustPosition;
            gameLayer.add(this.thrustImage);
        }
        if (newShip.thrustSound){
            this.thrustSound = newShip.thrustSound;
            this.thrustPlaying = false;
        }


    }
});

var Asteroid = Entity.extend({
    init: function(newAsteroid, pos, astSpeed) {
        this._super(newAsteroid, pos, 0);
        this.speed = astSpeed;
        this.rotation = Math.floor(Math.random() * (newAsteroid.rotationSpeed * 2 + 1)) - newAsteroid.rotationSpeed;
        this.rotating = true;
    }
});

var Bullet = Entity.extend({
    init: function(newBullet, pos, angle) {
        this._super(newBullet, pos, angle);
        this.speed = [newBullet.speed, toRadians(angle-90)];
        this.damage = newBullet.damage;
        this.range = newBullet.range;
        this.type = 'simple'; //simple entity has only points for collision, no polygons
        this.collisionPoints = newBullet.collisionPoints;
        this.fireSound = newBullet.fireSound;
        this.fireSound.play();
    },
    checkRange: function() {
        if (this.distanceTravelled >= this.range){
            this.destroy(true);
            return true;
        }
        return false;
    }
});

var Explosion = Class.extend({
    init: function(newExplosion, pos){
        this.x = pos.x - newExplosion.size[0]/2;
        this.y = pos.y - newExplosion.size[1]/2;
        this.img = new Image();
        this.expAnim;
        var that = this;
        this.img.onLoad = new function() {
            that.expAnim = new Kinetic.Sprite({
                x: that.x,
                y: that.y,
                image: that.img,
                animation: 'explosion',
                animations: {"explosion":newExplosion.animation},
                frameRate: newExplosion.frameRate
            });
            var lastFrame = newExplosion.animation.length -1;
            that.expAnim.afterFrame(lastFrame, that.endExplosion);

        };
        this.img.src = newExplosion.spritesheet;
    },
    endExplosion: function(){
        this.destroy();

    }
})

function createEntity(toCreate, entityType, position, angle, creator, target){
    /*
    var toReturn;
    switch (entityType){
        case 'asteroid':
            var direction = randomInt(1,4);
            var astPosition =[];
            var astSpeed = [randomInt(toCreate.minSpeed, toCreate.maxSpeed),0];
            switch (direction){
                case 1:
                    astPosition = [randomInt(0,wWidth), -50];
                    astSpeed[1] = randomReal(0, Math.PI);
                    break;
                case 2:
                    astPosition = [wWidth+50, randomInt(0,wHeight)];
                    astSpeed[1] = randomReal(Math.PI/2, Math.PI *1.5);
                    break;
                case 3:
                    astPosition = [randomInt(0,wWidth), wHeight+50];
                    astSpeed[1] = randomReal(Math.PI, Math.PI*2);
                    break;
                case 4:
                    astPosition = [-50, randomInt(0,wHeight)];
                    var tempAngle = randomInt(1,2);
                    if (tempAngle ==1){
                        astSpeed[1] = randomReal(Math.PI*1.5, Math.PI*2);
                    } else {
                        astSpeed[1] = randomReal(0, Math.PI/2);
                    }

                    break;
            }
            toReturn = new Asteroid(toCreate, astPosition, angle, astSpeed);
            break;
    }
    return toReturn;   */
}

var explosions = {
    "asteroidExplosion":{
        "size":[128,128],
            "frameRate":50,
            "spritesheet": "images/asteroidExplosion.png",
            "animation":createSpriteData([1024,1024], 8, 8, [128,128], 4)
    },
    "laserExplosion":{
        "size":[16,16],
        "frameRate":150,
        "spritesheet": "images/laserExplosion.png",
        "animation":createSpriteData([128,128], 8, 8, [16,16], 4)
    }
}

entitiesJSON = {
    "ships":{
        "corvette":{
            "name": "corvette",
            "hitPoints": 5,
            "imageURL": "images/playerShip.png",
            "size": [48,32],
            "bonusOffset": [0,0],
            "acceleration": 50,
            "accReverse": 20,
            "maxSpeed": 150,
            "maxReverse": 50,
            "rotationSpeed": 90,
            "thrustURL": "images/playerExhaust.png",
            "thrustPosition": [-28,0],
            "thrustSize": [20,12],
            "thrustSound": new Howl ({
                urls: ['sounds/effects/playerThrust.mp3', 'sounds/effects/playerThrust.ogg'],
                volume:1.0,
                autoplay: false,
                buffer: true,
                loop: true
            }),
            "explosion":""
        }
    },
    "asteroids":{
        "asteroid3":{
            "name": "asteroid3",
            "hitPoints": 5,
            "imageURL": "images/asteroid3.png",
            "size": [100,92],
            "bonusOffset": [0,0],
            "minSpeed": 25,
            "maxSpeed": 200,
            "rotationSpeed": 120,
            "explosion": explosions.asteroidExplosion,
            "explosionSound": new Howl ({
                urls: ['sounds/effects/asteroidExplosion.mp3', 'sounds/effects/asteroidExplosion.ogg'],
                volume:0.4,
                autoplay: false,
                buffer: true,
                loop: false
            })
        }
    },
    "weapons":{
        "redLaser":{
            name:"redLaser",
            hitPoints: 1,
            "imageURL": "images/redLaser.png",
            "size": [11,25],
            "bonusOffset": [0,0],
            "speed": 600,
            "damage": 1,
            "range": 1500,
            "collisionPoints": [[4,1], [5,1], [3,8], [4,18], [6,13]],
            "explosion": explosions.laserExplosion,
            "fireSound": new Howl ({
                urls: ['sounds/effects/laserSound.mp3', 'sounds/effects/laserSound.ogg'],
                volume:0.15,
                autoplay: false,
                buffer: true
            }),
            "explosionSound": new Howl ({
                urls: ['sounds/effects/laserSoundHit.mp3', 'sounds/effects/laserSoundHit.ogg'],
                volume:0.6,
                autoplay: false,
                buffer: true
            })
        }
    }
}