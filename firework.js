function Firework(game, minionSprite, frameHeight, frameWidth, startX, startY, fire, placeX, placeY, loop, nameInitial) {
//AnimationSprite(spriteSheet, startX, startY, frameWidth, frameHeight, 
//frameDuration, frames, loop, reverse)
    this.boom = new AnimationSprite(minionSprite, startX, (startY * 0), frameWidth, frameHeight, .16, fire, loop, false);
    
    //this.size = 1.5;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.name = "Fireworks";
    this.boxes = false;
    //this.radius = frameHeight / 2;
    this.y = placeY;
    this.x = placeX;
	
    this.identity = nameInitial;

    Entity.call(this, game, placeX, placeY);
};

Firework.prototype = new Entity();

Firework.prototype.constructor = Chibi;



Firework.prototype.update = function () {
    
    Entity.prototype.update.call(this);
};

Firework.prototype.draw = function (ctx) {
    
    this.boom.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1);

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