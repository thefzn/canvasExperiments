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
	},
	onCollide: function(self,pos,col){
		if(col.sides.L.collision || col.sides.R.collision){
			this.item.turn();
		}
	}
}
