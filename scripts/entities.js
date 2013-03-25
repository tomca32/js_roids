var Entity = Class.extend({
    init: function(name, hitPoints, pos, angle, imageURL, size, bonusOffset) {
        var that=this;
        var thisImage = new Image();
        thisImage.src = imageURL;
        that.image = new Kinetic.Image({
            x: pos[0],
            y: pos[1],
            image: thisImage,
            width: size[0],
            height: size[1],
            //offset: [0,0]
            offset:[(size[0]/2)+bonusOffset[0],(size[1]/2)+bonusOffset[1]]
        });

        if(name) that.name = name;
        this.hitPoints = hitPoints;
        this.pos = [pos[0], pos[1]];
        this.speed = [0,0];
        this.thrust = false;
        this.reverse = false;
        this.distanceTravelled = 0;

        if (angle!=undefined) {
           // this.angle = angle;
            this.angle = angle;
        } else {
            this.angle = 90;
        }
    },

    fireTurret: function(){
        var newBullet = createEntity(entitiesJSON.weapons.redLaser, 'turretBullet', this.pos, this.angle);
       return newBullet;
    },

    hit: function(attacker) {
        if (this.hitPoints > 0){
            this.hitPoints = this.hitPoints - attacker.damage;
            if (this.hitPoints <= 0) {
                return "dead";
            }
        }
    },

    destroy: function(){
        if (this.name) console.log(this.name+" destroyed!");
        this.image.destroy();
    }
});

var Ship = Entity.extend({
    init: function(name, hitPoints, pos, angle, imageURL, size, bonusOffset, acceleration, accReverse, maxSpeed, maxReverse, rotation) {
        this._super(name, hitPoints, pos, angle, imageURL, size, bonusOffset);
        this.acceleration = acceleration;
        this.accReverse = accReverse;
        this.maxReverse = maxReverse;
        this.maxSpeed = maxSpeed;
        this.rotation = rotation;
    }
});

var Asteroid = Entity.extend({
    init: function(name,hitPoints,pos,angle,imageURL,size, bonusOffset, speed, rotation) {
        this._super(name, hitPoints, pos, angle, imageURL, size, bonusOffset);
        this.speed = speed;
        //this.rotation = rotation;
        this.rotation = Math.floor(Math.random() * (rotation * 2 + 1)) - rotation;
        this.rotating = true;
    }
});

var Bullet = Entity.extend({
    init: function(name, hitPoints, pos, angle, imageURL, size, bonusOffset, speed, damage, range, collisionPoints) {
        this._super(name, hitPoints, pos, angle, imageURL, size, bonusOffset);
        this.speed = speed;
        this.damage = damage;
        this.range = range;
        this.type = 'simple'; //simple entity has only points for collision, no polygons
        this.collisionPoints = collisionPoints;
    },
    checkRange: function() {
        if (this.distanceTravelled >= this.range){
            console.log(this);
            console.log(this.distanceTravelled);
            this.destroy(this);
            return true;
        }
        return false;
    }
});

function createEntity(toCreate, entityType, position, angle){
    var toReturn;
    switch (entityType){
        case 'ship':
            toReturn = new Ship(toCreate.name, toCreate.hitPoints, position, angle, toCreate.imageURL, toCreate.size, toCreate.bonusOffset, toCreate.acceleration, toCreate.accReverse, toCreate.maxSpeed, toCreate.maxReverse, toCreate.rotationSpeed);
            break;
        case 'asteroid':
            var direction = randomInt(1,4);
            var astPosition =[];
            var astSpeed = [Math.floor(Math.random() * (toCreate.maxSpeed - toCreate.minSpeed + 1)) +toCreate.minSpeed,0];
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
            toReturn = new Asteroid(toCreate.name, toCreate.hitPoints, astPosition, angle, toCreate.imageURL, toCreate.size, toCreate.bonusOffset,astSpeed, toCreate.rotationSpeed);
            break;
        case 'turretBullet':
            var dX = stage.getMousePosition().x - position[0];
            var dY = stage.getMousePosition().y - position[1];

            var costempAngle = dX / (Math.sqrt(Math.pow(dX,2)+Math.pow(dY,2)));
            var tempAngle = Math.acos(costempAngle);
            if (dY<0) tempAngle = 2*Math.PI - Math.abs(tempAngle);

            var degAngle = tempAngle*(180/Math.PI)+90;

            toReturn = new Bullet(toCreate.name, toCreate.hitPoints, position, degAngle, toCreate.imageURL, toCreate.size, toCreate.bonusOffset, [toCreate.speed, tempAngle], toCreate.damage, toCreate.range, toCreate.collisionPoints);
            //console.log(toReturn);
    }
    return toReturn;
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
            "rotationSpeed": 90
        }
    },
    "asteroids":{
        "asteroid3":{
            "name": "asteroid3",
            "hitPoints": 3,
            "imageURL": "images/asteroid3.png",
            "size": [100,92],
            "bonusOffset": [0,0],
            "minSpeed": 25,
            "maxSpeed": 200,
            "rotationSpeed": 120
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
            "collisionPoints": [[4,1], [5,1], [3,8], [4,18], [6,13]]
        }
    }
}