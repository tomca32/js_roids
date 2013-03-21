function updateMovement(entity, dT){
    var debug = false;
    //entity to update and delta time
    var angleRad = (entity.angle-90) * (Math.PI / 180);

    if (entity.thrust){

        var acceleration = [entity.acceleration * dT, angleRad];

        var oldSpeed = [entity.speed[0], entity.speed[1]];
        var destinationPoint = [oldSpeed[0]*Math.cos(oldSpeed[1]) + acceleration[0]*Math.cos(acceleration[1]),oldSpeed[0]*Math.sin(oldSpeed[1]) + acceleration[0]*Math.sin(acceleration[1])];
        entity.speed[0] = Math.sqrt(Math.pow( destinationPoint[0],2) + Math.pow(destinationPoint[1],2));
        var cosineNewAngle = destinationPoint[0] / entity.speed[0];

        //limiting destination point and speed to maxSpeed
        destinationPoint[0] = limit(destinationPoint[0], entity.maxSpeed, entity.maxSpeed*(-1));
        destinationPoint[1] = limit(destinationPoint[1], entity.maxSpeed, entity.maxSpeed*(-1));
        entity.speed[0] = limit(entity.speed[0], entity.maxSpeed, entity.maxSpeed*(-1));

        entity.speed[1] = Math.acos(cosineNewAngle);
        if (destinationPoint[1] < 0) entity.speed[1] = 2*Math.PI - entity.speed[1];

    }
    entity.pos[0] = entity.pos[0]+(entity.speed[0]*Math.cos(entity.speed[1])*dT);
    entity.pos[1] = entity.pos[1]+(entity.speed[0]*Math.sin(entity.speed[1])*dT);
    entity.image.setRotationDeg(entity.angle);

    function limit (value, maxValue, minValue){

        if (value > maxValue){
            return maxValue;
        } else if (value < minValue) {
            return minValue;
        }
        return value;

    }
}