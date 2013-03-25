function randomInt (rMin, rMax){
    return Math.floor(Math.random() * (rMax - rMin + 1)) + rMin;
}
function randomReal(rmin, rmax) {
    return Math.random() * (rmax - rmin) + rmin;
}
function toRadians (degrees) {
    return degrees * (Math.PI/180);
}

function toDegrees (radians) {
    return radians * (180/Math.PI);
}

//x' = x*cos(t) - y*sin(t)
//y' = x*sin(t) + y*cos(t)
//float tX = (hWidth * cosf(rad) + hHeight * sinf(rad) ) + _xpos;
//float tY = (hWidth * sinf(rad) - hHeight * cosf(rad) ) + _ypos;

function debugPixelPosition(pixelEntity, trackEntity, pixelType) {
    var pW = trackEntity.image.getWidth()/2;
    var pH = trackEntity.image.getHeight()/2;
    var pX = trackEntity.pos[0];
    var pY = trackEntity.pos[1];
    var radius = Math.sqrt(Math.pow(pW*2,2)+Math.pow(pH*2,2));


    var pAngle = trackEntity.angle;
    pAngle = toRadians(pAngle);

    switch (pixelType){
        case 1:
            pixelEntity.pos = [pX-(pW * Math.cos(pAngle)- pH * Math.sin(pAngle)), pY -(pW * Math.sin(pAngle)+ pH *Math.cos(pAngle))];
            break;
        case 2:
           pixelEntity.pos = [pX-(pW * Math.cos(pAngle)+pH * Math.sin(pAngle)), pY -(pW * Math.sin(pAngle)- pH *Math.cos(pAngle))];
            break;
        case 3:
           pixelEntity.pos = [pX+(pW * Math.cos(pAngle)-pH * Math.sin(pAngle)), pY +(pW * Math.sin(pAngle)+ pH *Math.cos(pAngle))];
            break;
        case 4:
            pixelEntity.pos = [pX+(pW * Math.cos(pAngle)+pH * Math.sin(pAngle)), pY +(pW * Math.sin(pAngle)- pH *Math.cos(pAngle))];
            break;
    }


}

function simpleCollision(entity1, entity2) {
    if (entity1.type == 'simple' || entity2.type == 'simple') {
        var simpleType;
        var complexType;
        if (entity1.type == 'simple') {
            simpleType = entity1;
            complexType = entity2;
        } else {
            simpleType = entity2;
            complexType = entity1;
        }

        var simpleEntityX = simpleType.pos[0]-complexType.pos[0];
        var simpleEntityY = simpleType.pos[1]-complexType.pos[1];
        var distanceBetweenEntities = Math.sqrt(Math.pow(simpleEntityX,2)+Math.pow(simpleEntityY,2));
        var complexEntityRadius = Math.sqrt(Math.pow(complexType.image.getWidth()/2, 2) + Math.pow(complexType.image.getHeight()/2,2));
        if (distanceBetweenEntities > complexEntityRadius) {
            return false;

        }


        var complexEntityAngle = toRadians(complexType.angle);
        var points = simpleType.collisionPoints.length;
        for (var i = 0; i < points; i++ ) {
            var cx = [complexType.image.getWidth(), complexType.image.getHeight()]; //Complex Entity width and height
            var pointPosition = [simpleEntityX + simpleType.collisionPoints[i][0], simpleEntityY + simpleType.collisionPoints[i][1]];
            var pointAngle = Math.atan(pointPosition[0] / pointPosition[1]*(-1));
            var distance = Math.sqrt(Math.pow(pointPosition[0],2)+Math.pow(pointPosition[1],2));
            var pointNewAngle = complexEntityAngle - pointAngle;
            var pp = [distance * Math.cos(pointNewAngle), distance * Math.sin(pointNewAngle)]; //New point position

            if (pp[0] >  cx[0]/2 || pp[0] < cx[0] / -2 || pp[1] > cx[1]/2 || pp[1] < cx[1]/-2) {
                console.log(pp);
                if (i == points -1) return false; //if last point return no collision
            } else {
                console.log('kolizija!');
                return true;
            }

        }



    } else {

    }

}//END simpleCollision

//REMOVAL FUNCTION returns original array without the removed elements
function remove (original, removed){
    if (removed.length<1) {
        return original;
    }
    removed = sort_unique(removed);
    var remLength = removed.length;
    for (var i=remLength-1; i>=0; i--){
        console.log(removed);
        original.splice(removed[i],1);
    }
    return original;
}

function sort_unique(arr) {
    arr = arr.sort(function (a, b) { return a*1 - b*1; });
    var ret = [arr[0]];
    for (var i = 1; i < arr.length; i++) { // start loop at 1 as element 0 can never be a duplicate
        if (arr[i-1] !== arr[i]) {
            ret.push(arr[i]);
        }
    }
    return ret;
}