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
        this.rotation = rotation;
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
            toReturn = new Asteroid(toCreate.name, toCreate.hitPoints, position, angle, toCreate.imageURL, toCreate.size, toCreate.bonusOffset,[Math.floor(Math.random() * (toCreate.maxSpeed - toCreate.minSpeed + 1)) +toCreate.minSpeed, Math.random() * (Math.PI*2 + 1)], toCreate.rotationSpeed);
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