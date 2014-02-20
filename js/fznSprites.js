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
		this.maxVelDown = params.maxVelDown || 8;
		this.movement = params.movement || 0.5,
		this.velHor = params.velHor || 0;
		this.maxVelHor = params.maxVelHor || 5;
		this.dir = params.dir || "R";
		this.jumpForce = params.jumpForce || 10;
		this.floor = params.floor || this.level.floor;
		this.collide = params.collide || [];
		this.cOnCollide = params.onCollide || false;
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
		this.abilities = {};
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
		this.loadSheet(this.source);
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
			this.dying = true;
			this.floor = this.level.size[1] + this.size[1] + 10;
			this.velDown = 0-this.jumpForce;
			this.action = "dead";
		},
		shoot: function(){
			var pos = [];
			if(this.shoot && !this.shootLag){
				pos[0] = (this.dir == "R") ? this.pos[0] + this.size[0] - 2 : this.pos[0] - 5;
				pos[1] = this.pos[1] + (this.size[1] / 2) - 5;
				this.shooting = true;
				this.shootLag = true;
				this.level.add("sprite",this.shoot,false,{pos:pos,dir:this.dir});
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
		if(this.opacity != 1 || this.lifetime !== false){
			if(this.lifetime !== false && this.lifetime < 5){
				opacity = this.opacity * (this.lifetime/5);
				opacity = (opacity >= 0) ? opacity : 0;
			}else{
				opacity = this.opacity;
			}
			this.game.canvas.save();
			this.game.canvas.globalAlpha = opacity;
		}
		if(this.type == "user"){
			this.pos[0] = (!this.level.size[0]) ? this.pos[0] : (this.pos[0] < 0) ? 0 : (this.pos[0] > (this.level.size[0]-this.size[0])) ? this.level.size[0]-this.size[0] : this.pos[0];
		}
		this.game.canvas.drawImage(
			this.game.sheets[this.source],
			this.active.steps[this.frame][0],
			this.active.steps[this.frame][1],
			this.size[0],
			this.size[1],
			this.pos[0] - this.level.pos[0],
			this.pos[1] - this.level.pos[1],
			this.size[0],
			this.size[1]
		);
		if(this.opacity != 1 || this.lifetime !== false){
			this.game.canvas.restore();
		}
	},
	checkCollide: function(posx,posy){
		var i,len,itm,
			tolx = 5,
			toly = 10,
			all = {},
			coll = {
				T:{},
				B:{},
				L:{},
				R:{},
				detected:false
			},
			itmsOnDir = [],
			newpos = [Math.round(posx),Math.round(posy)];
		if(this.collideItems.length>0){
			for(i=0,len=this.collideItems.length;i<len;i++){
				itm = this.level.sprites[this.collideItems[i]] || this.level.walls[this.collideItems[i]] || false;
				if(itm && !itm.dying){
					if((posx+this.size[0]-tolx) > itm.pos[0] && (posx + tolx)  < (itm.pos[0]+itm.size[0])){
						if((posy+this.size[1]) > itm.pos[1] && (posy+this.size[1]) < (itm.pos[1]+itm.size[1])){
							coll.B.collision = true;
							coll.B.items = coll.B.items || [];
							coll.B.types = coll.B.types || {};
							coll.B.items.push(itm);
							coll.B.types[itm.type] = true;
							all[itm.id]=itm;
							coll.detected = true;
						}
						if(posy  < (itm.pos[1]+itm.size[1]) && posy  > itm.pos[1]){
							coll.T.collision = true;
							coll.T.items = coll.T.items || [];
							coll.T.types = coll.T.types || {};
							coll.T.items.push(itm);
							coll.T.types[itm.type] = true;
							all[itm.id]=itm;
							coll.detected = true;
						}
					}
					if((posy+this.size[1]-toly) > itm.pos[1] && (posy + toly)  < (itm.pos[1]+itm.size[1])){
						if((posx+this.size[0]) > itm.pos[0] && (posx+this.size[0]) < (itm.pos[0]+itm.size[0] )){
							coll.R.collision = true;
							coll.R.items = coll.R.items || [];
							coll.R.types = coll.R.types || {};
							coll.R.items.push(itm);
							coll.R.types[itm.type] = true;
							all[itm.id]=itm;
							coll.detected = true;
						}
						if(posx  < (itm.pos[0]+itm.size[0]) && posx  > itm.pos[0]){
							coll.L.collision = true;
							coll.L.items = coll.L.items || [];
							coll.L.types = coll.L.types || {};
							coll.L.items.push(itm);
							coll.L.types[itm.type] = true;
							all[itm.id]=itm;
							coll.detected = true;
						}
					}
				}
			}
			if(coll.detected){
				newpos = this.onCollide(coll,posx,posy);
				//Execute Custom Collide Function
				if(typeof this.cOnCollide == "function"){
					this.cOnCollide(this,[posx,posy],{
						sides: coll,
						all: all
					});
				}
				if(this.activateNPC){
					this.NPC.onCollide(this,[posx,posy],{
						sides: coll,
						all: all
					});;
				}
			}
		}
		return newpos;
	},
	onCollide: function(coll,posx,posy){
		var itm;
		if(coll.B.collision){
			itm = coll.B.items[0];
			posy = (posy < itm.pos[1]) ? itm.pos[1] - this.size[1] : itm.pos[1] + itm.size[1];
			this.velDown = 0.01;
			this.falling = false;
			this.jumping = false;
		}
		if(coll.T.collision){
			itm = coll.T.items[0];
			posy = (posy < itm.pos[1]) ? itm.pos[1] - this.size[1] : itm.pos[1] + itm.size[1];
			this.velDown = 0;
			this.falling = false;
			this.jumping = false;
		}
		if(coll.R.collision){
			itm = coll.R.items[0];
			posx = itm.pos[0] - this.size[0];
			this.velHor == 0;
		}
		if(coll.L.collision){
			itm = coll.L.items[0];
			posx = itm.pos[0] + itm.size[0];
			this.velHor == 0;
		}
		return [Math.round(posx),Math.round(posy)];
	},
	getCollideItems: function(){
		var i,len,item,target,type;
		this.collideItems = [];
		this.level = game.level;
		for(i=0,len=this.collide.length;i<len;i++){
			type = this.collide[i];
			target = this.level.spriteTypes[type];
			if(typeof target != "undefined"){
				for(item in target){
					if(item != this.id){
						this.collideItems.push(item);
					}
				}
			}
		}
		for(item in this.level.walls){
			this.collideItems.push(this.level.walls[item].id)
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
			self = this,
			sheet = self.game.sheets[src];
		if(src && typeof sheet == "undefined"){
			self.game.sheets[src] = new Image()
			self.game.sheets[src].addEventListener("load", function() {
				self.game.loadQueue--;
			}, false);
			self.game.loadQueue++;
			self.game.sheets[src].src = src;
		}
	}
}
