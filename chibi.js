/*
 * 
 Chibi(gameEngine, Koopa, 688, 417, 200, 688, 6, defaultGround, 600, true);
 */
var princessSize = 1.25;
function Chibi(game, minionSprite, frameHeight, frameWidth, startX, startY,
    walking, placeX, placeY, loop, nameInitial, veloX, veloY) {
//AnimationSprite(spriteSheet, startX, startY, frameWidth, frameHeight, 
//frameDuration, frames, loop, reverse)
    this.gamePlay = game;
    this.spriteSheet = minionSprite;
    this.stand = new AnimationSprite(minionSprite, startX, (startY * 0), frameWidth, frameHeight, defaultSpeed, 0, loop, false);
    this.walkForward = new AnimationSprite(minionSprite, startX, (startY * 0), frameWidth, frameHeight, defaultSpeed, walking, loop, false);
    this.walkLeft = new AnimationSprite(minionSprite, startX, (startY * 1), frameWidth, frameHeight, defaultSpeed, walking, loop, false);
    this.walkRight = new AnimationSprite(minionSprite, startX, (startY * 2), frameWidth, frameHeight, defaultSpeed, walking, loop, false);
    this.walkBackward = new AnimationSprite(minionSprite, startX, (startY * 3), frameWidth, frameHeight, defaultSpeed, walking, loop, false);
	
    //this.size = 1.5;
    this.frameWidth = frameWidth * princessSize;
    this.frameHeight = frameHeight * princessSize;
    this.name = "Princess";
    this.boxes = false;
    this.radius = 30;
    this.visualRadius = 70;
    this.runAway = false;
    //this.radius = frameHeight / 2;
    this.y = placeY;
    this.x = placeX;
    this.lastX = 0;
    this.lastY = 0;
    this.change = true;
    this.alive = true;
    this.timeOut = 5;
    	
    this.identity = nameInitial;
    //(x, y, width, height)
    this.boundingbox = new BoundingBox(this.x + 5, this.y + 5, this.frameWidth - 10, this.frameHeight - 10);
	
    this.velocity = { x: veloX, y: veloY };	
    Entity.call(this, game, placeX, placeY);
};

Chibi.prototype = new Entity();

Chibi.prototype.constructor = Chibi;

Chibi.prototype.insideBase = function (other) {
    //bounding box is always changing due to the always moving Chibi. So it gets updated in the update	
    //little princess needs to be inside of the bounding box of the base in order to make it.
    return (this.boundingbox.x + this.boundingbox.width < other.boundingbox.x + other.boundingbox.width &&
		this.boundingbox.x > other.boundingbox.x &&
        this.boundingbox.height + this.boundingbox.y < other.boundingbox.y + other.boundingbox.height &&
        this.boundingbox.y > other.boundingbox.y);

};

Chibi.prototype.collideLeft = function () {
    return (this.x - this.radius) < -62;
};
//1298+32
Chibi.prototype.collideRight = function () {
    return (this.x + this.radius) > 1330;
};

Chibi.prototype.collideTop = function () {
    return (this.y - this.radius) < -90;
};
//730+48
Chibi.prototype.collideBottom = function () {
    return (this.y + this.radius) > 753;
};

Chibi.prototype.circleCollision = function(other){	
	return distanceBetween(this, other) < this.radius + other.radius;
};

Chibi.prototype.update = function () {
    var screenWidth = 1325;
    var screenHeight = 811;
    var maxSpeed = 100;
    var acceleration = 100000;
    var run = 90000;
    var slowerAcceleration = 70000;

    if(this.alive){
    	//console.log(this.game.clockTick);
        if(this.change){
            this.lastX = this.x;
            this.lastY = this.y;
            this.change = false;
        }   


        var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        if (speed > maxSpeed) {
            var ratio = maxSpeed / speed;
            this.velocity.x *= ratio;
            this.velocity.y *= ratio;
        }
        this.x += this.velocity.x * this.game.clockTick;//.002;//this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;//.002;//this.game.clockTick;
        //change variable allows for the last x coordinate to be saved to find the slope
        this.change = true;	
        this.boundingbox.setChangingBox(this, this.x, this.y);
	
        for(var i = 0; i < this.game.princesses.length; i++){
            var princess = this.game.princesses[i];
        
            var dist = distanceBetween(this, princess);

            if(princess !== this && this.boundingbox.collide(this, princess)){			
                var difX = (princess.x - this.x) / dist;
                var difY = (princess.y - this.y) / dist;
                this.velocity.x -= difX * slowerAcceleration / (dist * dist);
                this.velocity.y -= difY * slowerAcceleration / (dist * dist);
            }
        
        }
        //check for home base for each princess
        for(var i = 0; i < this.game.bases.length; i++){
            var base = this.game.bases[i];
            var dist = distanceBetween(base, this);
        
            if(base.identity === this.identity && this.circleCollision({x: base.centerX, y: base.centerY, radius: 120})){
                //console.log(base.identity + "     " + this.identity);
                var difX = (base.centerX - this.x) / dist;
                var difY = (base.centerY - this.y) / dist;
                this.velocity.x += difX * acceleration / (dist * dist);
                this.velocity.y += difY * acceleration / (dist * dist);
            	//638  490
                if(this.insideBase(base)){
                    this.alive = false; //they are alive, but I want them to timeOut....poorly named variable.
                    this.x = 638;
                    this.y = 490;
                    
                    
                    var fire = ASSET_MANAGER.getAsset("./img/fireworks.png");
                    var fireX = 0;
                    var fireY = 0;
                    
                    if(this.identity === "a"){//Ariel = 80 400
                        fireX = 80;
                        fireY = 410;
                    } else if(this.identity === "c"){//Cinder = 590 0
                        fireX = 590;
                        fireY = 0;
                    } else {//Snow = 1068 20
                        fireX = 1068;
                        fireY = 250;
                    }    
                   
                    var boom = new Firework(this.gamePlay, fire, 70, 96, 0, 70, 8, fireX, fireY, false);
                    this.gamePlay.addEntity(boom);
                    
                } 
            
            }  else if(base.identity !== this.identity && this.circleCollision({x: base.centerX, y: base.centerY, radius: 120})){
                var difX = (base.centerX - this.x) / dist;
                var difY = (base.centerY - this.y) / dist;
                this.velocity.x -= difX * slowerAcceleration / (dist * dist);
                this.velocity.y -= difY * slowerAcceleration / (dist * dist);
            }
        }
        var villian = this.game.villian;
        //Collide with the villian
        if(this.circleCollision({x: villian.centerX, y: villian.centerY, radius: this.visualRadius})){
            
            if(this.boundingbox.collide(this, villian)){
                this.alive = false;
            } else {        
                var dist = distanceBetween(villian, this);
                var difX = (villian.centerX - this.x) / dist;
                var difY = (villian.centerY - this.y) / dist;
                this.velocity.x -= difX * run / (dist * dist);
                this.velocity.y -= difY * run / (dist * dist);
            }
        }
    
    
        if(this.collideRight()){
            this.x -= screenWidth;
        }
        if(this.collideLeft()){
            this.x += screenWidth;
        }
        if(this.collideTop()){
            this.y += screenHeight;
        }
        if(this.collideBottom()){
            this.y -= screenHeight;
        }
    } else {        
        this.timeOut -= this.game.clockTick;
        if(this.timeOut < 0){
            this.alive = true;
            this.x = 638;
            this.y = 490;
            this.timeOut = 5;
        }
    }
    Entity.prototype.update.call(this);
};

Chibi.prototype.draw = function (ctx) {
    
    if(this.alive){
            //lastY = y1   y = y2
        //lastX = x1   x = x2
        var slope = findSlope(this);
        //console.log(slope);
        //if this y is bigger than the previous state of y, then chibi moving in a more downward motion making the y positive
        //if the slope is not a decimal and bigger than 1 or less than -1 it is moving more up or down.
        if(this.y > this.lastY && (slope > 1 || slope < -1)){
            this.walkForward.drawFrame(this.game.clockTick, ctx, this.x, this.y, princessSize);
        } else if(this.y < this.lastY && (slope > 1 || slope < -1)){
            this.walkBackward.drawFrame(this.game.clockTick, ctx, this.x, this.y, princessSize);
        } else if(this.x < this.lastX && (-1 < slope || slope < 1)){
            this.walkLeft.drawFrame(this.game.clockTick, ctx, this.x, this.y, princessSize);
        } else if(this.x > this.lastX && (-1 < slope || slope < 1)){
            this.walkRight.drawFrame(this.game.clockTick, ctx, this.x, this.y, princessSize);
        } else {
            this.stand.drawFrame(this.game.clockTick, ctx, this.x, this.y, princessSize);
        }
    }

    if (this.boxes) {
        ctx.strokeStyle = "red";
        ctx.strokeRect(this.x, this.y, this.frameWidth, this.frameHeight);
        ctx.strokeStyle = "yellow";
        ctx.strokeRect(this.x + 5, this.y + 5, this.boundingbox.width, this.boundingbox.height);

		
	ctx.strokeStyle = "black";
	ctx.beginPath();
	ctx.arc(this.x + this.frameWidth / 2, this.y + this.frameHeight / 2, 60, 0, 2*Math.PI, false);
	ctx.stroke();
    }
	
	
    Entity.prototype.draw.call(this);
};