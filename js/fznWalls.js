var fzn = fzn || {};
fzn.Wall = function (game,params){
	if(game instanceof fzn.Game){
		// Data Vars
		this.game = game;
		this.data = params.data || {};
		this.size = params.size || [10,10];
		this.type = "wall";
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
			var ptrn = this.game.canvas.createPattern(this.image,this.repeat);
			this.game.canvas.fillStyle = ptrn;
			this.game.canvas.fillRect(
				sX,
				sY,
				this.game.cnv.width,
				this.game.cnv.height
			);
		}else if(this.source){
			this.game.canvas.drawImage(
				this.image,
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
	},
	loadImage: function(source){
		var src = source || false,
			self = this;
		if(!this.source){
			return false;
		}
		self.image = new Image()
		self.image.addEventListener("load", function() {
			self.game.loadQueue--;
		}, false);
		self.game.loadQueue++;
		if(src){
			self.image.src = src;
		}
	}
}
