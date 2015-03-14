// JavaScript Document
//get canvas context
var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");

// Setup game timer -- independent of animation timer
//var gameTimer = Object.create(objTimer);
var gameTimer = new Object(objTimer);

var sprite = {
	source: 256,  // empty sprite position in the spritesheet is default
	SIZE: 64,     // width and height of sprite
	SHOWLOC: 0,   // normal sprite positon in the spritesheet
	HITLOC: 192,
	HIDELOC: 256,   // hit position in the spritesheet
	x: undefined,         // origin of sprite in canvas
	y: undefined,
	horizontalMove: undefined,  //flag for  moving horizontlly or vertically
	HIDING: 0,   // sprite states
	MOVING: 1, 
	HIT: 2,  
	state: 0,    // default state is HIDING
	speed: 5,    // speed is 5 pixels
	waitTime: undefined,  // stores the random time to wait before displaying
	
	//Properties needed to help reset the animation
  	timeToReset: 10,
  	resetCounter: 0,
	
	//Method to setup sprite starting position and randomly decide horizontally moving or vertically moving
	setStartingPosition: function(){
		var flag = Math.random();
		if (flag <= 0.5){		//horizonlly moving
			this.x = 0;
			this.y = Math.ceil(Math.random()*420)+2;
			this.horizontalMove = true;
		}
		else{					//vertically moving
			this.x = Math.ceil(Math.random()*720)+2;
			this.y = 0;
			this.horizontalMove = false;
		}
	},

	// Method to find random animation time
	setWaitTime: function() { 
		//this.waitTime =	Math.ceil( Math.random() * 10 ) * 60;
		this.waitTime =	Math.ceil( Math.random() * 60 );
	},
	
	updateAnimation: function() {		
		//Figure out the monster's state
		if(this.state !== this.HIT)
		{
		  if(this.waitTime > 0  || this.waitTime === undefined)
		  {
			this.state = this.HIDING;
		  }
		  else
		  {
			this.state = this.MOVING;
		  }
		}		
		// Change the behavior of animation based on the state
		switch(this.state) {
			case this.HIDING:
				this.waitTime--;
				break; 
			case this.HIT:
				this.source = this.HITLOC;
				this.resetCounter++;
				if(this.resetCounter === this.timeToReset) {
					this.resetCounter = 0;
					this.state = this.HIDING;
					this.source = this.HIDELOC;
					this.setStartingPosition();
					this.setWaitTime();
		    	}
				break;
			case this.MOVING:
				// sprite is visible
				this.source = this.SHOWLOC;
				// horizontally move				
				if(this.horizontalMove){
					// check if sprite has moved out of bounds
					if (this.x > canvas.width-this.SIZE || this.x < 0 ) {
						this.speed = -this.speed;
					}
					this.x += this.speed;
				}
				// vertically move
				else{
					//check if sprite have moved out of bounds
					if (this.y > canvas.height-this.SIZE || this.y < 0 ) {
						this.speed = -this.speed;
					}
					this.y += this.speed;				
				}
				break;				
		 }		
	} 
	
};

// Initialize game stats
var monstersHit = 0;
var spriteObjects = [];
var Sprite_Maximum = 3;
var showLocation = [0, 64, 128];
var displayScore = document.querySelector( "#score");
var displayTimeLeft = document.querySelector( "#timeLeft");

// Load image
var image = new Image();
image.src = "images/spriteSheet3.png";
image.addEventListener("load", loadHandler, false);

// Listen for mouse down events
canvas.addEventListener("mousedown",mouseDownHandler,false);

function loadHandler() {
	for (var i = 0; i < Sprite_Maximum; i++){
		var newSpritObject = Object.create(sprite);
		newSpritObject.SHOWLOC = showLocation[i];
		newSpritObject.setStartingPosition();
      	newSpritObject.setWaitTime();
      	spriteObjects.push(newSpritObject);
	}

	// Start the game timer
	gameTimer.time = 30;
	gameTimer.start();
	// Start the animation loop (runs indefinitely)
	animationLoop();
}

function mouseDownHandler(event) {
     // Calculate mouse (x,y) relative to canvas origin
     // Note: the event.pageX and event.pageY mouse coordinates are relative
     //       to the top-left corner of the screen, so need to use the canvas
     //       offsetLeft and offsetTop properties to get canvas (0,0) 
     var canvas_x = event.pageX - canvas.offsetLeft;
     var canvas_y = event.pageY - canvas.offsetTop;

     // Check if mouse was clicked on the sprite
	 for(var i = 0; i < spriteObjects.length; i++) {
		 if ( canvas_x > spriteObjects[i].x  && canvas_x < spriteObjects[i].x + spriteObjects[i].SIZE &&
			  canvas_y > spriteObjects[i].y  && canvas_y < spriteObjects[i].y + spriteObjects[i].SIZE ) 
		 {
			 // Yes! Stop the animation
			 spriteObjects[i].state = spriteObjects[i].HIT;
			 monstersHit++
		 }
	 }
}

// Game animation loop: fires every frame (60 times/sec)
function animationLoop() {
	// As long as game timer is positive, run the game animation loop
	if (gameTimer.time > 0) {
		// Animation loop runs about 60 frames/sec
		requestAnimationFrame( animationLoop, canvas);
	}
	
	//Loop through all the sprite in
	//the sprites array and call their
	//updateAnimation methods
	for(var i = 0; i < spriteObjects.length; i++)
	{
	 	spriteObjects[i].updateAnimation();
	}
	
	// Update the sprite's animation -- even once after game time reaches 0
	//sprite.updateAnimation();		
	// Check for end of game
	if ( gameTimer.time === 0 ) {
		endGame();
	}
	// Display the game
	render();
}

//**************************************************************************

// End game
function endGame() {
	gameTimer.stop();
}

// Draw game 
function render() {
	// Clear context
    ctx.clearRect( 0, 0, canvas.width, canvas.height);
    // Draw new game state
	for(var i = 0; i < spriteObjects.length; i++) {
		var sprite = spriteObjects[i];
		ctx.drawImage(image, 
					  sprite.source, 0, 64, 64,
					  Math.floor(sprite.x), Math.floor(sprite.y), 64, 64);
	}
    // Display game stats
    displayScore.innerHTML = "Monsters Zapped:: " + monstersHit;
    displayTimeLeft.innerHTML = "Time Left: " + gameTimer.time;
}