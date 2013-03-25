function updateMovement(entity, dT){ //entity to update and delta time

    //oldSpeed = [firstValue, secondValue]

    var angleRad = (entity.angle) * (Math.PI / 180);

    if (entity.thrust || entity.reverse){

        if (entity.thrust) {
            var acceleration = [entity.acceleration * dT, angleRad];
        } else {
            if (angleRad > Math.PI*2){
                angleRad = angleRad - (2* Math.PI);
            }
            var acceleration = [(-1)*entity.accReverse * dT, angleRad];
        }
        var oldSpeed = [entity.speed[0], entity.speed[1]];
        var destinationPoint = [oldSpeed[0]*Math.cos(oldSpeed[1]) + acceleration[0]*Math.cos(acceleration[1]),oldSpeed[0]*Math.sin(oldSpeed[1]) + acceleration[0]*Math.sin(acceleration[1])];
        entity.speed[0] = Math.sqrt(Math.pow( destinationPoint[0],2) + Math.pow(destinationPoint[1],2));
        var cosineNewAngle = destinationPoint[0] / entity.speed[0];

        //limiting destination point and speed to maxSpeed
        if (oldSpeed[0] >= entity.maxSpeed){
            destinationPoint[0] = limit(destinationPoint[0], entity.maxSpeed, entity.maxSpeed*(-1));
            destinationPoint[1] = limit(destinationPoint[1], entity.maxSpeed, entity.maxSpeed*(-1));
            entity.speed[0] = limit(entity.speed[0], entity.maxSpeed, entity.maxSpeed*(-1));
        }


        entity.speed[1] = Math.acos(cosineNewAngle);
        if (destinationPoint[1] < 0) entity.speed[1] = 2*Math.PI - entity.speed[1];

    }

    if (entity.rotating){
        entity.angle += entity.rotation *dT;
        if (entity.angle < 0){
            entity.angle += 360
        } else if (entity.angle > 360) {
            entity.angle -= 360;
        }
    }
    var dX = entity.speed[0]*Math.cos(entity.speed[1])*dT;
    var dY = entity.speed[0]*Math.sin(entity.speed[1])*dT;
    var distance = Math.sqrt(Math.pow(dX,2)+ Math.pow(dY,2));
    entity.pos[0] = entity.pos[0]+(dX);
    entity.pos[1] = entity.pos[1]+(dY);
    entity.distanceTravelled += distance;
    entity.image.setRotationDeg(entity.angle); //Kinetic method for rotating image

    function limit (value, maxValue, minValue){

        if (value > maxValue){
            return maxValue;
        } else if (value < minValue) {
            return minValue;
        }
        return value;

    }
}