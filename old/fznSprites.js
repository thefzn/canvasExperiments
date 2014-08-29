var fzn = fzn || {};
fzn.Sprite = function (game,params){
	if(game instanceof fzn.Game){
		// Data Vars
		this.game = game;
		this.level = game.level;
		this.data = params.data || {};
		this.size = params.size || [10,10];
		this.type = params.type || "generic";
		this.pos = params.pos || [0,0];
		this.shoot = params.shoot || false;
		this.opacity = (typeof params.opacity != "undefined") ? params.opacity : 1;
		this.id = params.id;
		this.sprite = params.sprite || false;
		this.source = params.source || false;
		this.life = params.life || 1;
		this.lifetime = params.lifetime || false;
		this.alive = true;
		
		// Movement Vars
		this.gravity = params.gravity || 0;
		this.velDown = params.velDown || 0;
		this.maxVelDown = params.maxVelDown || 3;
		this.movement = params.movement || 0.5,
		this.velHor = params.velHor || 0;
		this.maxVelHor = params.maxVelHor || 3;
		this.dir = params.dir || "R";
		this.jumpForce = params.jumpForce || 10;
		this.floor = params.floor || this.level.floor;
		this.collide = params.collide || [];
		this.collideItems = [];
		this.activateNPC = params.NPC || false;
		this.NPC = false;
		
		// Animation Vars
		this.action = params.action || "stand";
		this.frame = 0;
		this.shooting = false;
		this.shootLag = false;
		this.jumping = false;
		this.falling = false;
		this.moving = false;
		this.inmune = false;
		this.blinking = false;
		this.abilities = {};
		this.onDie = params.onDie || this.onDie;
		this.init();
	}else{
		return false;
	}
}
fzn.Sprite.prototype = {
	init: function(){
		this.mapAbilities();
		if(this.type != "user" && this.activateNPC){
			this.NPC = new fzn.NPC(this);
		}
		// Generate a canvas for Sprite
		this.game.loadImage(this.source);
	},
	go: function(){
		var frame = this.frame,
			newposx = this.pos[0],
			newposy = this.pos[1],
			dir,skills;
		if(this.activateNPC){
			this.NPC.move();
		}
		
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
		if(!this.dying){
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
		this.active = 
			(this.dying) ?
				dir["dead"] || dir["stand"] 
			:
				(this.shooting) ? 
					dir["shoot"] || dir["jump"] || dir["walk"] || dir["stand"]
				:
					(this.jumping) ? 
						dir["jump"] || dir["walk"] || dir["stand"]
					:
						(this.falling) ?
							dir["fall"] || dir["jump"] || dir["walk"] || dir["stand"]
						:
							dir[this.action] || dir["stand"];
		
		if(this.active.delay != 0 && this.game.turn % this.active.delay == 0){
			frame++;
		}
		this.frame = (frame >= this.active.steps.length) ? 0 : frame;
		this.shooting = false;
		
		if(this.dying && this.pos[1] > this.level.size[1]){
			this.alive = false;
		}
		if(this.lifetime !== false){
			this.lifetime--;
			if(this.lifetime<0){
				this.alive=false;
			}
		}
		if(this.inmune){
			this.actions.blink.call(this);
		}else{
			this.blinking = false;
		}
		this.redraw();
	},
	please:function(action){
		var target = this.actions[action];
		if(typeof target == "function" && !this.dying && this.alive){
			target.call(this);
		}
	},
	actions:{
		jump: function(){
			if(!this.jumping && !this.falling && this.velDown > 0){
				this.frame = 0;
				this.velDown = 0-this.jumpForce;
			}
		},
		move: function(){
			this.moving = true;
			this.velHor += this.movement;
			this.velHor = (this.velHor > this.maxVelHor) ? this.maxVelHor : this.velHor;
		},
		die: function(){
			if(!this.dying && !this.inmune){
				this.dying = true;
				this.floor = this.level.size[1] + this.size[1] + 10;
				this.velDown = 0-this.jumpForce;
				this.action = "dead";
				this.onDie(this);
			}
		},
		shoot: function(){
			var bName,
				pos = [],
				params = {};
			if(this.shoot && !this.shootLag){
				pos[0] = (this.dir == "R") ? this.pos[0] + this.size[0] - 5 : this.pos[0] + 5;
				pos[1] = this.pos[1] + (this.size[1] / 2) - 5;
				
				if(typeof this.shoot == "object"){
					bName = this.shoot.name || false;
					params = this.shoot.params;
				}else{
					bName = this.shoot
				}
				params.pos = pos;
				params.dir = this.dir;
				this.shooting = true;
				this.shootLag = true;
				this.level.add("sprite",bName,false,params,false);
			}
		},
		blink: function(){
			if(this.game.turn % 2 == 0){
				this.blinking = (this.blinking) ? false : true;
			}
		}
	},
	turn: function(dir){
		if(!this.game.start || !this.alive){
			return false;
		}
		var d = dir || false;
		if(!d){
			this.dir = (this.dir == "L") ? "R" : "L";
		}else if(d == "L" || d =="R"){
			this.dir = d;
		}
	},
	redraw: function(){
		var opacity;
		this.game.canvas.save();
		if(this.opacity != 1 || this.lifetime !== false){
			if(this.lifetime !== false && this.lifetime < 5){
				opacity = this.opacity * (this.lifetime/5);
				opacity = (opacity >= 0) ? opacity : 0;
			}else{
				opacity = this.opacity;
			}
			this.game.canvas.globalAlpha = opacity;
		}
		if(this.blinking){
			this.game.canvas.globalCompositeOperation = "lighter";
		}
		if(this.type == "user"){
			this.pos[0] = (!this.level.size[0]) ? this.pos[0] : (this.pos[0] < 0) ? 0 : (this.pos[0] > (this.level.size[0]-this.size[0])) ? this.level.size[0]-this.size[0] : this.pos[0];
		}
		this.game.canvas.drawImage(
			this.game.images[this.source],
			this.active.steps[this.frame][0],
			this.active.steps[this.frame][1],
			this.size[0],
			this.size[1],
			this.pos[0] - this.level.pos[0],
			this.pos[1] - this.level.pos[1],
			this.size[0],
			this.size[1]
		);
		this.game.canvas.restore();
	},
	checkCollide: function(posx,posy){
		var i,len,itm,
			tolx = this.maxVelHor,
			toly = this.maxVelDown,
			all = {},
			coll = {},
			itmsOnDir = [],
			newpos = [Math.round(posx),Math.round(posy)];
		if(this.collideItems.length>0){
			for(i=0,len=this.collideItems.length;i<len;i++){
				coll = {
					B:false,
					T:false,
					L:false,
					R:false,
					Any:false
				}
				itm = this.level.sprites[this.collideItems[i]] || this.level.walls[this.collideItems[i]] || false;
				if(itm && !itm.dying && itm.alive){
					if((newpos[0]+this.size[0]-tolx) > itm.pos[0] && (newpos[0] + tolx)  < (itm.pos[0]+itm.size[0])){
						if((newpos[1]+this.size[1]) > itm.pos[1] && (newpos[1]+this.size[1]) < (itm.pos[1]+itm.size[1])){
							coll.B = true;
							coll.Any = true;
						}
						if(newpos[1]  < (itm.pos[1]+itm.size[1]) && newpos[1]  > itm.pos[1]){
							coll.T = true;
							coll.Any = true;
						}
					}
					if((newpos[1]+this.size[1]-toly) > itm.pos[1] && (newpos[1] + toly)  < (itm.pos[1]+itm.size[1])){
						if((newpos[0]+this.size[0]) > itm.pos[0] && (newpos[0]+this.size[0]) < (itm.pos[0]+itm.size[0] )){
							coll.R = true;
							coll.Any = true;
						}
						if(newpos[0]  < (itm.pos[0]+itm.size[0]) && newpos[0]  > itm.pos[0]){
							coll.L = true;
							coll.Any = true;
						}
					}
					if(coll.Any){
						newpos = this.onCollide(coll,itm,newpos[0],newpos[1]);
						//Execute Custom Collide Function
						if(typeof this.collide[itm.type] == "function"){
							this.collide[itm.type](this,itm,coll)
						}
						if(this.activateNPC){
							this.NPC.onCollide(this,newpos,coll);
						}
					}
				}
			}
		}
		return newpos;
	},
	onCollide: function(coll,itm,posx,posy){
		var itm;
		if(coll.B){
			posy = itm.pos[1] - this.size[1];
			this.velDown = (this.velDown > 0 ) ? 0.01 : this.velDown;
			this.falling = false;
			this.jumping = false;
		}
		if(coll.T){
			posy = itm.pos[1] + itm.size[1];
			this.velDown = 0;
			this.falling = false;
			this.jumping = false;
		}
		if(coll.R){
			posx = itm.pos[0] - this.size[0];
			this.velHor == 0;
		}
		if(coll.L){
			posx = itm.pos[0] + itm.size[0];
			this.velHor == 0;
		}
		return [Math.round(posx),Math.round(posy)];
	},
	onDie:function(){
	
	},
	getCollideItems: function(){
		var item,target,type;
		this.collideItems = [];
		this.level = this.game.level;
		for(type in this.collide){
			target = this.level.spriteTypes[type];
			if(typeof target != "undefined"){
				for(item in target){
					if(item != this.id){
						this.collideItems.push(item);
					}
				}
			}else{
				for(item in this.level.walls){
					if(this.level.walls[item].type == type){
						this.collideItems.push(this.level.walls[item].id)
					}
				}
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
	}
}
