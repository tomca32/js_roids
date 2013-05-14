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
                if (i == points -1) return false; //if last point return no collision
            } else {
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
    removed = sort_unique(removed); //error checking to prevent duplicate removal
    var remLength = removed.length;
    for (var i=remLength-1; i>=0; i--){
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

function createSpriteData(textureSize,rows, cols, imgSize, startFrame, endFrame){
    var totalFrames = rows*cols;
    var toReturn = [];
    var startFramePosition = getFramePosition(startFrame, rows, cols, imgSize);
    var firstRow = true;
    for (var currentY = startFramePosition.y; currentY<textureSize[1]; currentY += imgSize[1]){
        if (currentY != startFramePosition.y) firstRow = false;
        for (var currentX = 0; currentX<textureSize[0]; currentX += imgSize[0]){
            if (firstRow && currentX< startFramePosition.x) currentX = startFramePosition.x;
            toReturn.push({x: currentX, y:currentY, width:imgSize[0], height: imgSize[1]});
        }
    }
    return toReturn;
}

function getFramePosition(frameNumber, rows, cols, size){
    var framePosition = {y: Math.floor(frameNumber/rows)*size[1], x: (frameNumber%rows)*size[0]};
    if (framePosition.x <1) framePosition.x = 0;
    if (framePosition.y <1) framePosition.y = 0;
    return framePosition;
}