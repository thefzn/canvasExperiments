var fzn = fzn || {};
fzn.Sprite = function (game,params){
	if(game instanceof fzn.Game){
		// Data Vars
		this.game = game;
		this.size = params.size || [10,10];
		this.type = params.type || false;
		this.pos = params.pos || [0,0];
		this.id = params.id || "fznSP_"+Math.round(Math.random()*100000);
		
		// Movement Vars
		this.gravity = (typeof params.gravity == "undefined") ? 1.5 : params.gravity;
		this.velDown = 0;
		this.maxVelDown = 8;
		this.movement = 0.5,
		this.velHor = 0;
		this.maxVelHor = 5;
		this.dir = "R";
		this.jumpForce = 14;
		this.floor = this.game.floor - this.size[1];
		this.collide = params.collide || [];
		this.collideItems = [];
		
		// Animation Vars
		this.action = params.action || "stand";
		this.frame = 0;
		this.params = params;
		this.jumping = false;
		this.falling = false;
		this.moving = false;
		this.abilities = [];
		this.init();
	}else{
		return false;
	}
}
fzn.Sprite.prototype = {
	init: function(){
		this.mapAbilities();
		// Generate a canvas for Sprite
		this.loadSheet(this.params.source);
	},
	go: function(){
		var frame = this.frame,
			newposx = this.pos[0],
			newposy = this.pos[1],
			dir,skills;
		if(this.gravity>0){
			this.velDown = this.velDown + this.gravity;
			this.velDown = (this.velDown > this.maxVelDown) ? this.maxVelDown : this.velDown;
			newposy = newposy+this.velDown;
			newposy = (newposy > this.floor) ? this.floor : newposy;
			this.jumping = false;
			this.falling = false;
			if(newposy != this.pos[1]){
				if(newposy<this.pos[1]){
					this.jumping = true;
				}else{
					this.falling = true;
				}
			}
		}
		if(this.moving){
			if(this.velHor <= 0){
				this.velHor = 0;
				this.moving = false;
				frame = 0;
				this.action = "stand";
			}else{
				newposx = (this.dir == "R") ? newposx + this.velHor :  newposx - this.velHor;
				skills = this.abilities[this.dir];
				if(this.velHor > (this.maxVelHor/1.1)){
					this.action = skills["run"] || skills["walk"] || skills["stand"];
				}else{
					this.action = skills["walk"] || skills["run"] || skills["stand"];
				}
				this.velHor = this.velHor - (this.movement/2);
			}
		}
		this.pos = this.checkCollide(newposx,newposy);
		dir = this.params.sprite[this.dir];
		this.active = (this.jumping) ? dir["jump"] || dir["stand"] : (this.falling) ? dir["fall"] || dir["jump"] || dir["stand"] : dir[this.action];
		if(this.active.delay != 0 && this.game.turn % this.active.delay == 0){
			frame++;
		}
		this.frame = (frame >= this.active.steps.length) ? 0 : frame;
		this.redraw();
	},
	please: function(newState){
		if(!this.game.start){
			return false;
		}
		switch(newState){
			case "jump":
				if(!this.jumping && !this.falling){
					this.frame = 0;
					this.velDown = 0-this.jumpForce;
				}
				break
			case "move":
				this.moving = true;
				this.velHor += this.movement;
				this.velHor = (this.velHor > this.maxVelHor) ? this.maxVelHor : this.velHor;
			break
			default:
				if(typeof this.params.sprite[this.dir][newState] != "undefined"){
					this.frame = 0;
					this.action = newState;
				}
		}
	},
	turn: function(dir){
		if(!this.game.start){
			return false;
		}
		var d = dir || false;
		if(d == "L" || d =="R"){
			this.dir = d;
		}
	},
	redraw: function(){
		this.game.canvas.drawImage(
			this.sheet,
			this.active.steps[this.frame][0],
			this.active.steps[this.frame][1],
			this.size[0],
			this.size[1],
			this.pos[0],
			this.pos[1],
			this.size[0],
			this.size[1]
		);
	},
	checkCollide: function(posx,posy){
		var i,len,itm,
			//indx = (axis=="y") ? 1 : 0,
			itmsOnDir = [];
		if(this.collideItems.length>0){
			for(i=0,len=this.collideItems.length;i<len;i++){
				itm = this.game.sprites[this.collideItems[i]];
				if((posx+this.size[0]) > itm.pos[0] && posx  < (itm.pos[0]+itm.size[0]) && (posy+this.size[1]) > itm.pos[1] && posy  < (itm.pos[1]+itm.size[1])){
					if(this.jumping || this.falling){
						posy = (posy < itm.pos[1]) ? itm.pos[1] - this.size[1] : itm.pos[1] + itm.size[1];
						this.velDown = 0;
						this.falling = false;
						this.jumping = false;
					}else{
						posx = (posx < itm.pos[0]) ? itm.pos[0] - this.size[0] : itm.pos[0] + itm.size[0];
						this.velHor == 0;
					}
					break;
				}
			}
		}
		return [posx,posy];
	},
	getCollideItems: function(){
		var type, sps;
		this.collideItems = [];
		for(type in this.collide){
			for(sps in this.game.spriteTypes[type]){
				this.collideItems.push(this.game.spriteTypes[type][sps])
			}
		}
	},
	mapAbilities: function(){
		var item,
			temp = {
				L:{},
				R:{}
			},
			sprite = this.params.sprite || false;
		if(!sprite){
			return false
		}
		if(typeof sprite.R == "undefined"){
			for(item in sprite){
				temp.L[item] = sprite[item];
				temp.R[item] = sprite[item];
			}
			this.params.sprite = temp;
		}
		this.abilities["L"] = [];
		this.abilities["R"] = [];
		for(item in sprite.L){
			this.abilities["L"][item] = item;
		}
		for(item in sprite.R){
			this.abilities["R"][item] = item;
		}
	},
	loadSheet: function(source){
		var src = source || false,
			self = this;
		self.sheet = new Image()
		self.sheet.addEventListener("load", function() {
			self.game.loadQueue--;
		}, false);
		self.game.loadQueue++;
		if(src){
			self.sheet.src = src;
		}
	}
}
