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
            offset:[(size[0]/2)+bonusOffset[0],(size[1]/2)+bonusOffset[1]]
        });

        if(name) that.name = name;
        this.hitPoints = hitPoints;
        this.pos = [pos[0], pos[1]];
        this.speed = [0,0];
        this.thrust = false;
        this.reverse = false;

        if (angle) {
            this.angle = angle;
        } else {
            this.angle = 90;
        }
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
})

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
    }
    return toReturn;
}

entitiesJSON = {
    "ships":{
        "corvette":{
            "name": "corvette",
            "hitPoints": 5,
            "imageURL": "images/playerShip.png",
            "size": [32,48],
            "bonusOffset": [0,6],
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
    }
}