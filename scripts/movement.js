function updateMovement(entity, dT){ //entity to update and delta time

    //oldSpeed = [firstValue, secondValue]

    var angleRad = toRadians(entity.angle);

    if (entity.thrust || entity.reverse){

        if (entity.thrustSound){
            //console.log(entity.thrustSound._pos);
            if (!entity.thrustPlaying) {
                entity.thrustPlaying = true;
                entity.thrustSound.volume(0.0);
                entity.thrustSound.play();
                entity.thrustSound.fadeIn(0.3, 800);
            }
        }


        if (entity.thrust) {
            var acceleration = [entity.acceleration * dT, angleRad];
            //console.log(entity.thrustImage.getPosition());


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

    } else {
        if (entity.thrustSound && entity.thrustPlaying){
            entity.thrustSound.fadeOut(0.0, 500, function() {
               entity.thrustSound.stop();
                entity.thrustPlaying = false;
            });
        }
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

    if (entity.thrustImage){
        entity.thrustImage.setPosition(entity.pos[0]+entity.thrustPosition[0]*Math.cos(angleRad), entity.pos[1]+entity.thrustPosition[0]*Math.sin(angleRad));
        entity.thrustImage.setRotationDeg(entity.angle);

        if (entity.thrust){
            entity.thrustImage.setOpacity(1);
        } else {
            entity.thrustImage.setOpacity(0);
        }

    }

    function limit (value, maxValue, minValue){

        if (value > maxValue){
            return maxValue;
        } else if (value < minValue) {
            return minValue;
        }
        return value;

    }
}