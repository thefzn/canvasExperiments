var fzn = fzn || {};
fzn.Wall = function (game,params){
	if(game instanceof fzn.Game){
		// Data Vars
		this.game = game;
		this.data = params.data || {};
		this.size = params.size || [10,10];
		this.type = params.type || "wall";
		this.alive = true;
		this.source = params.source || false;
		this.color = params.color || false;
		this.opacity = (typeof params.opacity != "undefined") ? params.opacity : 1;
		this.fixed = params.fixed || false;
		this.pos = params.pos || [0,0];
		this.id = params.id;
		this.init();
	}else{
		return false;
	}
}
fzn.Wall.prototype = {
	init: function(){
		if(this.source){
			this.game.loadImage(this.source);
		}
	},
	go: function(){
		this.redraw();
	},
	redraw: function(){
		var x,y,sX,sY;
		if(!this.source && !this.color){
			return false;
		}
		this.game.canvas.save();
		if(this.fixed === true){
			x = this.pos[0];
			y = this.pos[1];
			sX = this.pos[0];
			sY = this.pos[0];
		}else if(this.fixed === false){
			x = this.pos[0] - this.game.level.pos[0]; 
			y = this.pos[1] - this.game.level.pos[1];
			sX = this.game.level.pos[0];
			sY = this.game.level.pos[1];
		}else{
			x = this.pos[0] - (this.game.level.pos[0]*this.fixed); 
			y = this.pos[1] - (this.game.level.pos[1]*this.fixed);
			sX = this.game.level.pos[0]*this.fixed;
			sY = this.game.level.pos[1]*this.fixed;
		}
		if(this.opacity != 1){
			this.game.canvas.globalAlpha = this.opacity;
		}
		if(this.repeat == "repeat" || this.repeat == "repeat-x" || this.repeat == "repeat-y"){
			this.game.canvas.translate(x,y);
			sY = (!this.fixed && (this.repeat == "repeat-x" || this.repeat == "repeat")) ? 0 : sY;
			sX = (!this.fixed && (this.repeat == "repeat-y" || this.repeat == "repeat")) ? 0 : sX;
			var ptrn = this.game.canvas.createPattern(this.game.images[this.source],this.repeat);
			this.game.canvas.fillStyle = ptrn;
			this.game.canvas.fillRect(
				sX,
				sY,
				this.game.cnv.width,
				this.game.cnv.height
			);
		}else if(this.source){
			this.game.canvas.drawImage(
				this.game.images[this.source],
				x,
				y,
				this.size[0],
				this.size[1]
			);
		}else if(this.color){
			this.game.canvas.fillStyle = this.color;
			this.game.canvas.fillRect(
				x,
				y,
				this.size[0],
				this.size[1]
			);
		}
		this.game.canvas.restore();
	}
}
