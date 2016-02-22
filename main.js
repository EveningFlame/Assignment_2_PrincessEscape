var defaultSpeed = 0.1;
var maxSpeed = 105;
var acceleration = 100000;
var chase = 90000;
var slowerAcceleration = 70000;
// platforms animation
function AnimateBackground(image, frameWidth, frameHeight, imageX, imageY) {
    this.image = image;
    this.width = frameWidth;
    this.height = frameHeight;
    this.imageX = imageX;
    this.imageY = imageY;
    this.elapsedTime = 0;
};

AnimateBackground.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;

    ctx.drawImage(this.image,
        0, 0, this.width, this.height,
        this.imageX, this.imageY,
        this.width, this.height);

};

// sprites animation
function AnimationSprite(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
};

AnimationSprite.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;

    ctx.drawImage(this.spriteSheet,
            index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
            this.frameWidth, this.frameHeight,
            locX, locY,
            this.frameWidth * scaleBy,
            this.frameHeight * scaleBy);
};

AnimationSprite.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
};

AnimationSprite.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
 };

function Background(game, platformSprite, width, height, startX, startY, type) {
    this.animation = new AnimateBackground(platformSprite, width, height, startX, startY);
    this.x = startX;
    this.y = startY;
    this.width = width;
    this.height = height;
    this.radius = 120;
    //add the next 2 variables to x or y to reach the center line
    this.centerX = this.x + this.width/2;
    this.centerY = this.y + this.height/2;
    this.identity = type;

    if(type === "a" || type === "c" || type === "s"){
        this.boundingbox = new BoundingBox(this.x + 45, this.y + 35, this.width - 80, this.height - 80); 
    	this.name = "Base";
    }

    this.boxes = false;
    //(x, y, width, height)
     
    Entity.call(this, game, startX, startY);
};

Background.prototype = new Entity();

Background.prototype.constructor = Background;

Background.prototype.update = function () {
    Entity.prototype.update.call(this);
};

Background.prototype.draw = function (ctx) {
	
    if (this.boxes && this.identity !== "b") {
        ctx.strokeStyle = "red";
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = "black";
        ctx.strokeRect(this.boundingbox.x , this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
		
			
        ctx.strokeStyle = "green";
	ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, 20, 0, 2*Math.PI);
        ctx.fillStyle = 'green';
        ctx.fill();
	//ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
	ctx.arc(this.centerX, this.centerY, this.radius, 0, 2*Math.PI);
       

	ctx.stroke();
	//ctx.closePath();
    }

	
	
    this.animation.drawFrame(this.game.clockTick, ctx, 0, 0, 0);
    Entity.prototype.draw.call(this);
};

/*
 * 
 Chibi(gameEngine, Koopa, 688, 417, 200, 688, 6, defaultGround, 600, true);
 */
function Villian(game, minionSprite, frameHeight, frameWidth, startX, startY, flying, placeX, placeY, loop) {
    //frame animations
    this.flyingRight = new AnimationSprite(minionSprite, startX, (startY * 0), frameWidth, frameHeight, .16, flying, loop, false);
    this.flyingLeft = new AnimationSprite(minionSprite, startX, (startY * 1), frameWidth, frameHeight, .16, flying, loop, false);
    //villian information
    this.width = frameWidth;
    this.height = frameHeight;
    this.name = "Villian";
    this.boxes = false;
    this.radius = 60;
    this.visualRadius = 100;
    this.change = true;
    this.y = placeY;
    this.x = placeX;	
    this.centerX = 1;
    this.centerY = 1;

    this.timeElapsed = 0;
    
    //(x, y, width, height)
    this.boundingbox = new BoundingBox(this.x, this.y, this.width - 60, this.height - 65);
    this.velocity = { x: Math.random() * 150, y: Math.random() * 150 };
	
    Entity.call(this, game, placeX, placeY);
};

Villian.prototype = new Entity();

Villian.prototype.constructor = Villian;

Villian.prototype.collideLeft = function () {
    return (this.boundingbox.x) < -10;
};
//1298+32
Villian.prototype.collideRight = function () {
    return (this.boundingbox.x + 70) > 1318;
};

Villian.prototype.collideTop = function () {
    return this.boundingbox.y < -10;
};
//730+48
Villian.prototype.collideBottom = function () {
    return (this.boundingbox.y + 60) > 750;
};

Villian.prototype.canSee = function(other){	
	return distanceBetween(this, other) < this.radius + other.radius;
};

Villian.prototype.distance = function (other){
    var distanceOnX = this.x - other.x;
    var distanceOnY = this.y - other.y;	
    return Math.sqrt(distanceOnX * distanceOnX + distanceOnY * distanceOnY);
};


Villian.prototype.update = function () {
    var princess = this.game.princesses[0];
    var closest = 12000;
    var target = princess;
    this.boundingbox.setChangingBox(this, this.x, this.y);
    
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

    
    this.centerX = this.x + this.width/2;
    this.centerY = this.y + this.height/2;
    //change variable allows for the last x coordinate to be saved to find the slope
    this.change = true;	
    this.boundingbox.setChangingBox(this, this.x, this.y);
	
    for(var i = 0; i < this.game.princesses.length; i++){
    	var princess = this.game.princesses[i];

	var dist = this.distance(princess);
        
        if(princess.alive && (princess.x < 1298 && princess.x > 0 && princess.y > 0 && princess.y < 730) && this.canSee({x: princess.x, y: princess.y, radius: this.visualRadius})){	
            var difX = (princess.x - this.x) / dist;
            var difY = (princess.y - this.y) / dist;
            this.velocity.x += difX * chase / (dist * dist);
            this.velocity.y += difY * chase / (dist * dist);
        }  
 
    }
  
    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x;
        if (this.collideLeft()) this.x = -40;
        if (this.collideRight()) this.x = 1298 - 90;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y;
        if (this.collideTop()) this.y = -40;
        if (this.collideBottom()) this.y = 730 - 95;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }
    
    Entity.prototype.update.call(this);
};

Villian.prototype.draw = function (ctx) {
       // console.log(this.x + "      " + this.lastX);
       //this.flyingRight.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1);
       //this.flyingLeft.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1);
	if(this.x < this.lastX){		
		this.flyingLeft.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1);		
	}  if(this.x > this.lastX ){		
		this.flyingRight.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1);
	}
		

    if (this.boxes) {
        ctx.strokeStyle = "red";
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = "yellow";
        ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
				
		
	ctx.strokeStyle = "black";
	ctx.beginPath();
        
        ctx.arc(this.centerX, this.centerY, 20, 0, 2*Math.PI);
        ctx.fillStyle = 'green';
        ctx.fill();
        
	ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.visualRadius, 0, 2*Math.PI, false);
	ctx.stroke();
    }
	
	
    Entity.prototype.draw.call(this);
};

//Create the box for collisions
function BoundingBox(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    
    

};
//Set change in bounding box for continual moving pieces
//Size 1 only needed if the same adjustment for the box. Size 2 in case they are different numbers.
BoundingBox.prototype.setChangingBox = function(entity, updateX, updateY){
    //console.log(entity.name);
	if(entity.name === "Princess"){
		this.x = updateX + 5;
		this.y = updateY + 5;
	} else {
		this.x = updateX + 30;//20
		this.y = updateY + 40;//30
	}
	
};

BoundingBox.prototype.collide = function(entity, other){
		return (entity.boundingbox.x < other.boundingbox.x + other.boundingbox.width &&
			entity.boundingbox.x + entity.boundingbox.width > other.boundingbox.x &&
			entity.boundingbox.y < other.boundingbox.y + other.boundingbox.height &&
			entity.boundingbox.height + entity.boundingbox.y > other.boundingbox.y);
};


// the "main" code begins here

function findSlope(entity){
	return ((entity.y - entity.lastY) / (entity.x - entity.lastX));

};



function distanceBetween(ent1, entity2, i) {
    //console.log(ent1 + "  " + i);
    var distanceOnX = ent1.x - entity2.x;
    var distanceOnY = ent1.y - entity2.y;	
    return Math.sqrt(distanceOnX * distanceOnX + distanceOnY * distanceOnY);
};




//1298+32+32 = 1362   730+48+48 = 866 - 48 = 816
var screenWidth = 1325;
var screenHeight = 811;


var ASSET_MANAGER = new AssetManager();
var ASSET_MUSIC_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/Olimpo.png");
ASSET_MANAGER.queueDownload("./img/castle.png");
ASSET_MANAGER.queueDownload("./img/gargoyle.png");
ASSET_MANAGER.queueDownload("./img/Ariel.png");
ASSET_MANAGER.queueDownload("./img/Cinderella.png");
ASSET_MANAGER.queueDownload("./img/SnowWhite.png");
ASSET_MANAGER.queueDownload("./img/arielChibi.png");
ASSET_MANAGER.queueDownload("./img/cinderellaChibi.png");
ASSET_MANAGER.queueDownload("./img/snowwhiteChibi.png");
ASSET_MANAGER.queueDownload("./img/fireworks.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var worldBackground = ASSET_MANAGER.getAsset("./img/Olimpo.png");
	var castle = ASSET_MANAGER.getAsset("./img/castle.png");
	var villian = ASSET_MANAGER.getAsset("./img/gargoyle.png");
	var aBaseSprite = ASSET_MANAGER.getAsset("./img/Ariel.png");
	var cBaseSprite = ASSET_MANAGER.getAsset("./img/Cinderella.png");
	var sBaseSprite = ASSET_MANAGER.getAsset("./img/SnowWhite.png");
	var arielSprite = ASSET_MANAGER.getAsset("./img/arielChibi.png");
	var cinderellaSprite = ASSET_MANAGER.getAsset("./img/cinderellaChibi.png");
	var snowSprite = ASSET_MANAGER.getAsset("./img/snowwhiteChibi.png");

	
    var gameEngine = new GameEngine();
   
    //background - the last two digits are for the bounding box. unecessary for the background
	var backgr = new Background(gameEngine, worldBackground, 1920, 1080, 0, 0, "b");
	var castleRespawn = new Background(gameEngine, castle, 198, 194, 560, 350, "b");
 //function Background(game, platformSprite, width, height, startX, startY, frameWidth,frameHeight, type) {
//610, 440
	//princess bases
	var arielBase = new Background(gameEngine, aBaseSprite, 181, 192, 45, 485, "a");
	var cinderellaBase = new Background(gameEngine, cBaseSprite, 172, 200, 510, 40, "c"); 
	var snowBase = new Background(gameEngine, sBaseSprite, 146, 181, 1035, 325, "s");
	
	
	
/* 	function Chibi(game, minionSprite, frameHeight, frameWidth, startX, startY,
    frames, placeX, placeY, loop) { */
	//add the background and bases to the game
    gameEngine.addEntity(backgr);
	gameEngine.addEntity(castleRespawn);
	gameEngine.addEntity(arielBase);
	gameEngine.addEntity(cinderellaBase);
	gameEngine.addEntity(snowBase);
	
	//638  490

	//var gargoyle = new Villian(gameEngine, villian, 110, 110.2, 0, 110, 6, 500, 500, true);
        //gameEngine.addEntity(gargoyle);
        gameEngine.villian = new Villian(gameEngine, villian, 110, 110.2, 0, 110, 6, 500, 500, true);
	gameEngine.addEntity(gameEngine.villian);
	//CHIBI PRINCESSESS
	for(var i = 0; i < 6; i ++){		
	    var airChibi = new Chibi(gameEngine, arielSprite, 48, 32, 0, 48, 4, 1230, 152, true, "a");		
		gameEngine.addEntity(airChibi);		
	}

	for(var i = 0; i < 6; i ++){	
		var snowChibi = new Chibi(gameEngine, snowSprite, 48, 32, 0, 48, 4, 40, 225, true, "s");		
		gameEngine.addEntity(snowChibi);		
	}
	for(var i = 0; i < 6; i ++){		
		var cinderChibi = new Chibi(gameEngine, cinderellaSprite, 48, 32, 0, 48, 4, 1150, 650, true, "c");		
		gameEngine.addEntity(cinderChibi);		
	} 
        
    gameEngine.init(ctx);
    gameEngine.start();

});