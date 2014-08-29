var fzn = fzn || {};
fzn.NPC = function (item){
	if(game instanceof fzn.Game){
		// Data Vars
		this.game = item.game;
		this.types = item.activateNPC;
		this.item = item;
		this.active = {
			walk: false,
			jump: false,
			shoot: false,
			follow: false
		};
		this.defaults = {
			speed: 1,
			jumpDelay:30,
			shootDelay: 50,
			followDelay: 10
		}
		this.init();
	}else{
		return false;
	}
}
fzn.NPC.prototype = {
	init: function(){
		var i, len, type;
		if(this.types instanceof Array){
			for(i=0,len=this.types.length;i<len;i++){
				type = this.types[i];
				this.active[type] = true
			}
		}else if(typeof this.types == "object"){
			for(type in this.types){
				this.active[type] = this.types[type];
			}
		}else if(typeof this.types == "string"){
			this.active[this.types] = true;
		}else{
			return false;
		}
		if(this.active.shoot){
			this.item.shoot = this.active.shoot;
		}
		if(this.active.follow == true){
			this.active.follow = false;
		}
		if(this.active.walk){
			this.item.maxVelHor = this.active.walk.speed || this.defaults.speed;
			this.item.movement = this.active.walk.speed || this.defaults.speed;
		}
	},
	move: function(){
		var jumpDelay = this.active.jump.jumpDelay || this.defaults.jumpDelay,
			followDelay = this.active.follow.followDelay || this.defaults.followDelay,
			shootDelay = this.active.shoot.shootDelay || this.defaults.shootDelay,
			target = this.active.follow.id || this.active.follow || false,
			dir,tItem;
		if(this.active.jump && this.game.turn % jumpDelay == 0){
			this.item.please("jump");
		}
		if(this.active.follow && this.game.turn % followDelay == 0 && target){
			tItem = this.game.level.sprites[target] || false;
			if(tItem){
				dir = (tItem.pos[0]+(tItem.size[0]/2) > this.item.pos[0]+(this.item.size[0]/2)) ? "R" : "L";
				this.item.turn(dir);
			}
		}
		if(this.active.walk){
			this.item.please("move");
		}
		if(this.active.shoot && this.game.turn % shootDelay == 0){
			this.item.shootLag = false;
			this.item.please("shoot");
		}
	},
	onCollide: function(self,pos,col){
		if(col.L){
			this.item.turn("R");
		}else if(col.R){
			this.item.turn("L");
		}
		
	}
}
