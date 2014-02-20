var fzn = fzn || {};
fzn.NPC = function (item){
	if(game instanceof fzn.Game){
		// Data Vars
		this.game = item.game;
		this.type = item.activateNPC;
		this.item = item;
		this.active = null;
		
		this.configs = {
			walk: {
				speed:1
			},	
			run: {
				speed:3
			},
			jump: {
				speed:1,
				jumpDelay:30
			},
			bounce: {
				speed:3,
				jumpDelay:1
			}
		}
		this.init();
	}else{
		return false;
	}
}
fzn.NPC.prototype = {
	init: function(){
		this.active = this.configs[this.type] || false;
		this.item.maxVelHor = this.active.speed;
		this.item.movement = this.active.speed;
	},
	move: function(){
		this.item.please("move");
		if(this.type == "jump" || this.type == "bounce"){
			if(!this.item.jumping  && !this.item.falling && this.game.turn % this.active.jumpDelay == 0){
				this.item.please("jump");
			}
		}
	},
	onCollide: function(self,pos,col){
		if(col.sides.L.collision){
			this.item.turn("R");
		}else if(col.sides.R.collision){
			this.item.turn("L");
		}
		
	}
}
