var fzn = fzn || {};
fzn.Sprite = function (game,params){
	if(game instanceof fzn.Game){
		// Data Vars
		this.game = game;
		this.level = game.level;
		this.data = params.data;
		this.size = params.size;
		this.type = params.type;
		this.pos = params.pos;
		this.opacity = params.opacity;
		this.id = params.id;
		this.sprite = params.sprite;
		this.source = params.source;
		this.alive = true;
		
		// Movement Vars
		this.gravity = params.gravity;
		this.velDown = 0;
		this.maxVelDown = 8;
		this.movement = 0.5,
		this.velHor = 0;
		this.maxVelHor = 5;
		this.dir = "R";
		this.jumpForce = 10;
		this.floor = this.level.floor;
		this.collide = params.collide;
		this.collideItems = [];
		
		// Animation Vars
		this.action = params.action;
		this.frame = 0;
		this.jumping = false;
		this.falling = false;
		this.moving = false;
		this.abilities = {};
		this.init();
	}else{
		return false;
	}
}
fzn.Sprite.prototype = {
	init: function(){
		this.mapAbilities();
		// Generate a canvas for Sprite
		this.loadSheet(this.source);
	},
	go: function(){
		var frame = this.frame,
			newposx = this.pos[0],
			newposy = this.pos[1],
			dir,skills;
		if(this.gravity != 0){
			this.velDown = this.velDown + this.gravity;
			this.velDown = (this.velDown > this.maxVelDown) ? this.maxVelDown : this.velDown;
			newposy = newposy+this.velDown;
			newposy = (newposy > (this.floor-this.size[1])) ? this.floor-this.size[1] : newposy;
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
		if(this.alive){
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
		}else{
			this.pos = [newposx,newposy];
		}
		dir = this.sprite[this.dir];
		this.active = (!this.alive) ? dir["dead"] || dir["stand"] : (this.jumping) ? dir["jump"] || dir["stand"] : (this.falling) ? dir["fall"] || dir["jump"] || dir["stand"] : dir[this.action] || dir["stand"];
		if(this.active.delay != 0 && this.game.turn % this.active.delay == 0){
			frame++;
		}
		this.frame = (frame >= this.active.steps.length) ? 0 : frame;
		this.redraw();
	},
	please: function(newState){
		if(!this.game.start || !this.alive){
			return false;
		}
		switch(newState){
			case "jump":
				if(!this.jumping && !this.falling && this.velDown > 0){
					this.frame = 0;
					this.velDown = 0-this.jumpForce;
				}
				break
			case "move":
				this.moving = true;
				this.velHor += this.movement;
				this.velHor = (this.velHor > this.maxVelHor) ? this.maxVelHor : this.velHor;
			break
			case "die":
				this.alive = false;
				this.floor = this.level.size[1] + this.size[1] + 10;
				this.velDown = 0-this.jumpForce;
				this.action = "dead";
			break
			default:
				if(typeof this.sprite[this.dir][newState] != "undefined"){
					this.frame = 0;
					this.action = newState;
				}
		}
	},
	turn: function(dir){
		if(!this.game.start || !this.alive){
			return false;
		}
		var d = dir || false;
		if(d == "L" || d =="R"){
			this.dir = d;
		}
	},
	redraw: function(){
		if(this.opacity != 1){
			this.game.canvas.save();
			this.game.canvas.globalAlpha = this.opacity;
		}
		this.pos[0] = (!this.level.size[0]) ? this.pos[0] : (this.pos[0] < 0) ? 0 : (this.pos[0] > (this.level.size[0]-this.size[0])) ? this.level.size[0]-this.size[0] : this.pos[0];
		this.game.canvas.drawImage(
			this.sheet,
			this.active.steps[this.frame][0],
			this.active.steps[this.frame][1],
			this.size[0],
			this.size[1],
			this.pos[0] - this.level.pos[0],
			this.pos[1] - this.level.pos[1],
			this.size[0],
			this.size[1]
		);
		if(this.opacity != 1){
			this.game.canvas.restore();
		}
	},
	checkCollide: function(posx,posy){
		var i,len,itm,
			tolx = 5,
			toly = 10,
			coll = {
				T:[],
				B:[],
				L:[],
				R:[]
			},
			itmsOnDir = [],
			newpos = [Math.round(posx),Math.round(posy)];
		if(this.collideItems.length>0){
			for(i=0,len=this.collideItems.length;i<len;i++){
				itm = this.level.sprites[this.collideItems[i]] || this.level.walls[this.collideItems[i]] || false;
				if(itm){
					if((posx+this.size[0]-tolx) > itm.pos[0] && (posx + tolx)  < (itm.pos[0]+itm.size[0])){
						if((posy+this.size[1]) > itm.pos[1] && (posy+this.size[1]) < (itm.pos[1]+itm.size[1] )){
							coll.B.push(itm);
						}
						if(posy  < (itm.pos[1]+itm.size[1]) && posy  > itm.pos[1]){
							coll.T.push(itm);
						}
					}
					if((posy+this.size[1]-toly) > itm.pos[1] && (posy + toly)  < (itm.pos[1]+itm.size[1])){
						if((posx+this.size[0]) > itm.pos[0] && (posx+this.size[0]) < (itm.pos[0]+itm.size[0] )){
							coll.R.push(itm)
						}
						if(posx  < (itm.pos[0]+itm.size[0]) && posx  > itm.pos[0]){
							coll.L.push(itm)
						}
					}
				}
			}
			if(coll.B.length > 0 || coll.T.length > 0 || coll.R.length > 0 || coll.L.length > 0){
				newpos = this.onCollide(coll,posx,posy);
				//Execute Custom Collide Function
				if(typeof this.collide[itm.type] == "function"){
					this.collide[itm.type](this,[posx,posy],coll);
				}
			}
		}
		return newpos;
	},
	onCollide: function(coll,posx,posy){
		var itm;
		if(coll.B.length > 0){
			itm = coll.B[0];
			posy = (posy < itm.pos[1]) ? itm.pos[1] - this.size[1] : itm.pos[1] + itm.size[1];
			this.velDown = 0.01;
			this.falling = false;
			this.jumping = false;
		}
		if(coll.T.length > 0){
			itm = coll.T[0];
			posy = (posy < itm.pos[1]) ? itm.pos[1] - this.size[1] : itm.pos[1] + itm.size[1];
			this.velDown = 0;
			this.falling = false;
			this.jumping = false;
		}
		if(coll.R.length > 0){
			itm = coll.R[0];
			posx = itm.pos[0] - this.size[0];
			this.velHor == 0;
		}
		if(coll.L.length > 0){
			itm = coll.L[0];
			posx = itm.pos[0] + itm.size[0];
			this.velHor == 0;
		}
		return [Math.round(posx),Math.round(posy)];
	},
	getCollideItems: function(){
		var type, sps;
		this.collideItems = [];
		this.level = game.level;
		for(type in this.collide){
			for(sps in this.level.spriteTypes[type]){
				this.collideItems.push(this.level.spriteTypes[type][sps])
			}
		}
		for(sps in this.level.walls){
			if(!sps.negative){
				this.collideItems.push(this.level.walls[sps].id)
			}
		}
	},
	mapAbilities: function(){
		var item
		if(typeof this.sprite == "undefined"){
			return false
		}
		this.sprite.L = this.sprite.L || {};
		this.sprite.R = this.sprite.R || {};
		
		for(item in this.sprite){
			if(item != "L" && item != "R"){
				this.sprite.L[item] = this.sprite[item];
				this.sprite.R[item] = this.sprite[item];
			}
		}
		this.abilities["L"] = {};
		this.abilities["R"] = {};
		for(item in this.sprite.L){
			this.abilities["L"][item] = item;
		}
		for(item in this.sprite.R){
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
