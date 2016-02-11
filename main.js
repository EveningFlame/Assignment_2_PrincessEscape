var sb1 = 0;
var sb2 = 0;
var totalDistance = 0;
var maxX = 0;

var defaultGround = 705;
var defaultSpeed = 0.1;
var defaultScroll = 250;
var defaultJumpHeight = 200;
var defaultScrollSpeed = 2.5;

var unlocked;
var bgmove;

var standLeft;
// platforms animation
function AnimationPlatform(image, frameWidth, frameHeight, imageX, imageY) {
    this.image = image;
    this.width = frameWidth;
    this.height = frameHeight;
    this.imageX = imageX;
    this.imageY = imageY;
    this.elapsedTime = 0;
}

AnimationPlatform.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;

/*     if (this.scroll) {
        ctx.drawImage(this.image,
                  sb2, 0,  // source from sheet
                  this.width, this.height,
                  this.imageX, this.imageY,
                  this.width, this.height
                  );

        ctx.drawImage(this.image,
                  sb1, 0,  // source from sheet
                  this.width, this.height,
                  this.imageX, this.imageY,
                  this.width, this.height
                  );
    } else if (maxX >= 250){
        ctx.drawImage(this.image,
            0, 0, this.width, this.height,
            this.imageX - maxX, this.imageY,
            this.width, this.height);
    } else { */
        ctx.drawImage(this.image,
            0, 0, this.width, this.height,
            this.imageX, this.imageY,
            this.width, this.height);
   // }
}
AnimationPlatform.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

AnimationPlatform.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

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
}

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
}

AnimationSprite.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

AnimationSprite.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
 }

function Platform(game, platformSprite, width, height, startX, startY, scroll) {
    this.animation = new AnimationPlatform(platformSprite, width, height, startX, startY, scroll);
    this.startX = startX;
    this.startY = startY;
    this.width = width;
    this.height = height;
    Entity.call(this, game, startX, startY);
    this.radius = height / 2;
}

Platform.prototype = new Entity();

Platform.prototype.constructor = Platform;

Platform.prototype.beginingX = function () {
    return this.startX - maxX;
}

Platform.prototype.endingX = function () {
    return this.startY + this.width - maxX;
}

Platform.prototype.top = function () {
    return this.startY;
}

Platform.prototype.bottom = function () {
    return this.startY + this.height;
}

Platform.prototype.update = function () {
    Entity.prototype.update.call(this);
}

Platform.prototype.draw = function (ctx) {
    this.animation.drawFrame(this.game.clockTick, ctx, 0, 0, 0);
    Entity.prototype.draw.call(this);
}
/*
* Hero
* Game: the gameEngine that it will use
* heroSprite: The sprite sheet for the hero you want to use.
* standAnimation: the amount of animations in the hero's standing movement
* walkAnimation: the amount of animations in the hero's walking movement
* jumpAnimation: the amount of animations in the hero's jumping movement
*/
function Hero(game, heroSprite, frameWidth, frameHeight, startX, startY, charYOffset, heroHeight, standAnimation, walkAnimation, jumpAnimation) {
    this.animation = new AnimationSprite(heroSprite, startX, (startY * 0) + charYOffset,
        frameWidth, frameHeight - charYOffset, defaultSpeed, standAnimation, true, false);
    this.jumpAnimation = new AnimationSprite(heroSprite, startX, (startY * 2) + charYOffset,
        frameWidth, frameHeight - charYOffset, defaultSpeed, jumpAnimation, false, false);
    this.rightWalkAnimation = new AnimationSprite(heroSprite, startX, (startY * 6) + charYOffset,
        frameWidth, frameHeight - charYOffset, defaultSpeed, walkAnimation, true, false);
    this.animationStandLeft = new AnimationSprite(heroSprite, startX, startY + charYOffset,
        frameWidth, frameHeight - charYOffset, defaultSpeed, standAnimation, true, true);
    this.jumpAnimationLeft = new AnimationSprite(heroSprite, startX, (startY * 3) + charYOffset,
        frameWidth, frameHeight - charYOffset, defaultSpeed, jumpAnimation, false, true);
    this.leftWalkAnimation = new AnimationSprite(heroSprite, startX, (startY * 7) + charYOffset,
        frameWidth, frameHeight - charYOffset, defaultSpeed, walkAnimation, true, true);
    this.radius = 100;
    this.heroHeight = heroHeight;
    this.ground = defaultGround - heroHeight;
    this.scrollSpeed = defaultScrollSpeed;
    this.jumpHeight = defaultJumpHeight;
    Entity.call(this, game, 0, 400);
}

Hero.prototype = new Entity();
Hero.prototype.constructor = Hero;

Hero.prototype.update = function () {
    //console.log("total distance = " + totalDistance);
    this.jumpHeight = underPlatform(this.x, this.game);
    if (this.jumpHeight < 0) {
        this.jumpHeight = defaultJumpHeight;
    }

    if (this.game.space) this.jumping = true;
    if (this.jumping) {
        if (this.jumpAnimation.isDone()) {
            this.jumpAnimation.elapsedTime = 0;
            this.jumping = false;
        }
        var jumpDistance = this.jumpAnimation.elapsedTime / this.jumpAnimation.totalTime;
        var totalHeight = this.jumpHeight;

        if (jumpDistance > 0.5)
            jumpDistance = 1 - jumpDistance;

        var height = totalHeight*(-4 * (jumpDistance * jumpDistance - jumpDistance));
        this.y = this.ground - height;
    }

    if (this.jumping && standLeft) {
        if (this.jumpAnimationLeft.isDone()) {
            this.jumpAnimationLeft.elapsedTime = 0;
            this.jumping = false;
        }
        var jumpDistance = this.jumpAnimationLeft.elapsedTime / this.jumpAnimationLeft.totalTime;
        var totalHeight = this.jumpHeight;

        if (jumpDistance > 0.5)
            jumpDistance = 1 - jumpDistance;

        var height = totalHeight*(-4 * (jumpDistance * jumpDistance - jumpDistance));
        this.y = this.ground - height;
    }
    
    if (bgmove && this.game.walkRight) { 
        sb1 += this.scrollSpeed;           // background movement lock
        sb2 += this.scrollSpeed;
    }

    if (unlocked && this.game.walkRight) {
        this.x += this.scrollSpeed;
    }

    if (unlocked && this.game.walkLeft) {
        this.x -= this.scrollSpeed;
    }

    //console.log("sb1: " + sb1 + " sb2: " + sb2 + " x: " + this.x);

    Entity.prototype.update.call(this);
}

Hero.prototype.draw = function (ctx) {
	var yPlace = this.ground;
    if (sb1 > 2400) {
        sb1 = 0;
    }
    if (sb2 > 2400) {
        sb2 = 0;
    }
    if (this.x >= defaultScroll) {
        unlocked = false;
        bgmove = true;
    }
    if (this.x < defaultScroll || totalDistance > 4600) {
        unlocked = true;
        bgmove = false;
    }
    if (this.game.walkLeft && this.x > 5) {
        unlocked = true;
    }
    if (this.game.walkLeft && this.x < 5) {
        unlocked = false;
    }

    if (this.jumping) {
        if (standLeft) {
            this.jumpAnimationLeft.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2);
            if (this.game.walkLeft) if (unlocked) totalDistance -= this.scrollSpeed;
        } else {
            this.jumpAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2);
            if (this.game.walkRight) {
                totalDistance += this.scrollSpeed;
                if (totalDistance > maxX) maxX += this.scrollSpeed;
            }
        }
    } else if (this.game.walkRight) {
        standLeft = false;
        this.rightWalkAnimation.drawFrame(this.game.clockTick, ctx, this.x, yPlace, 2);
        totalDistance += this.scrollSpeed;
        if (totalDistance > maxX) maxX += this.scrollSpeed;
    } else if (this.game.walkLeft) {
        standLeft = true;
        this.leftWalkAnimation.drawFrame(this.game.clockTick, ctx, this.x, yPlace, 2);
        if (unlocked) totalDistance -= this.scrollSpeed;
    } else {
        if (standLeft) {
            this.animationStandLeft.drawFrame(this.game.clockTick, ctx, this.x, yPlace, 2);
        } else {
            this.animation.drawFrame(this.game.clockTick, ctx, this.x, yPlace, 2);
        }
    }

    Entity.prototype.draw.call(this);
}

function underPlatform(currentX, game) {
    var newHeight = -1;
    //if (currentX >= game.p1.beginingX() && currentX <= game.p1.endingX()) {
    //    newHeight = defaultGround - game.p1.bottom();
    //}
    return newHeight;
}
/*
 * Minions
 Minion(gameEngine, Koopa, 688, 417, 200, 688, 6, defaultGround, 600, true);
 */
function Minion(game, minionSprite, frameHeight, frameWidth, startX, startY,
    walking1, placeX, placeY, loop) {
		//AnimationSprite(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse)
		
this.animationWalkingLeft1 = new AnimationSprite(minionSprite, startX, (startY * 0),
        frameWidth, frameHeight, defaultSpeed, walking1, loop, false);
		
/*     this.animationWalkingLeft1 = new AnimationSprite(minionSprite, startX, (startY * 0),
        frameWidth, frameHeight, defaultSpeed, walking1, loop, false);
    this.animationWalkingRight1 = new AnimationSprite(minionSprite, startX, (startY * 1),
        frameWidth, frameHeight, defaultSpeed, walking1, loop, false); */

/*     if (walking2 > 0) {
        this.animationWalkingLeft2 = new AnimationSprite(minionSprite, startX, (startY * 5),
        frameWidth, frameHeight, defaultSpeed, walking2, loop, false);
        this.animationWalkingRight2 = new AnimationSprite(minionSprite, startX, (startY * 6),
            frameWidth, frameHeight, defaultSpeed, walking2, loop, false);
    } */
    
    this.radius = frameHeight / 2;
    this.y = placeY;
    this.x = placeX;
    this.moveRight = false;
    Entity.call(this, game, placeX, placeY);
}

Minion.prototype = new Entity();

Minion.prototype.constructor = Minion;

Minion.prototype.update = function () {

    if (this.moveRight) {
        this.x += 1;
    } else {
        this.x -= 1;
    }
    Entity.prototype.update.call(this);
}

Minion.prototype.draw = function (ctx) {
	//tick, ctx, x, y, scaleBy
	//this.animationWalkingLeft1.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2);
    if (this.moveRight) {
        this.animationWalkingRight1.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2);
    } else {
        this.animationWalkingLeft1.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2);
    }
    Entity.prototype.draw.call(this);
}
//Create the box for collisions
function BoundingBox(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.left = x;
    this.top = y;
    this.right = this.left + width;
    this.bottom = this.top + height;
}

BoundingBox.prototype.collide = function (oth) {
    if (this.right > oth.left && this.left < oth.right && this.top < oth.bottom && this.bottom > oth.top) return true;
    return false;
}

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();
var ASSET_MUSIC_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/Olimpo.png");
ASSET_MANAGER.queueDownload("./img/Ariel.png");
ASSET_MANAGER.queueDownload("./img/Cinderella.png");
ASSET_MANAGER.queueDownload("./img/SnowWhite.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var worldBackground = ASSET_MANAGER.getAsset("./img/Olimpo.png");
	var aBaseSprite = ASSET_MANAGER.getAsset("./img/Ariel.png");
	var cBaseSprite = ASSET_MANAGER.getAsset("./img/Cinderella.png");
	var sBaseSprite = ASSET_MANAGER.getAsset("./img/SnowWhite.png");
	
    var gameEngine = new GameEngine();
    //background
	var backgr = new Platform(gameEngine, worldBackground, 1920, 1080, 0, 0);
	
	//princess bases
	var arielBase = new Platform(gameEngine, aBaseSprite, 230, 244, 45, 485);
	var cinderellaBase = new Platform(gameEngine, cBaseSprite, 1920, 1080, 510, 40); 
	var snowBase = new Platform(gameEngine, sBaseSprite, 1920, 1080, 1035, 325);
	
	//add the characters to the game
    gameEngine.addEntity(backgr);
	gameEngine.addEntity(arielBase);
	gameEngine.addEntity(cinderellaBase);
	gameEngine.addEntity(snowBase);
	
	
    gameEngine.init(ctx);
    gameEngine.start();

});