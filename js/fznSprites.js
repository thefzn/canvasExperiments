var fzn = fzn || {};
fzn.Sprite = function (game,params){
	if(game instanceof fzn.Game){
		this.game = game;
		this.size = [];
		this.velDown = 0;
		this.gravity = 1.19;
		this.action = "stand";
		this.frame = 0;
		this.params = params;
		this.pos = [];
		this.id = "fznSP_"+Math.round(Math.random()*100000);
		this.init();
	}else{
		return false;
	}
}
fzn.Sprite.prototype = {
	init: function(){
		// Apply defaults
		this.params.step = this.params.step || 2;
		this.params.actions = this.params.actions || [];
		this.action = this.params.action || this.action;
		this.pos = this.params.pos || [0,0];
		
		// Generate a canvas for Sprite
		this.loadSheet(this.params.source);
	},
	go: function(){
		var frame = this.frame;
		if(this.gravity>0){
			this.velDown = this.velDown + this.gravity;
			this.pos[1] = this.pos[1]+this.velDown;
			this.pos[1] = (this.pos[1] > (this.game.cnv.height - this.size[1])) ? this.game.cnv.height - this.size[1] : this.pos[1];
		}
		this.active = this.params.actions[this.action];
		if(this.active.turn != 0 && this.game.turn % this.active.turn == 0){
			frame++;
			this.frame = (frame >= this.active.steps.length) ? 0 : frame;
		}
		this.redraw();
	},
	please:function(newState){
		if(typeof this.params.actions[newState] != "undefined"){
			this.frame = 0;
			this.action = newState;
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
	loadSheet: function(source){
		var src = source || false,
			self = this;
		this.size = this.params.size;
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
