var fzn = fzn || {};
fzn.Background = function (game,params){
	if(game instanceof fzn.Game){
		// Data Vars
		this.game = game;
		this.image = null;
		this.data = params.data;
		this.size = params.size;
		this.source = params.source;
		this.repeat = params.repeat;
		this.fixed = params.fixed;
		this.pos = params.pos;
		this.id = params.id;
		this.init();
	}else{
		return false;
	}
}
fzn.Background.prototype = {
	init: function(){
		// Generate a canvas for BG
		this.loadImage(this.source);
	},
	go: function(){
		var newposx = this.pos[0],
			newposy = this.pos[1];
		
		this.pos = [newposx,newposy]
		this.redraw();
	},
	redraw: function(){
		if(this.repeat == "repeat" || this.repeat == "repeat-x" || this.repeat == "repeat-y"){
			this.game.canvas.save();
			this.game.canvas.translate(this.pos[0], this.pos[1]);
			var ptrn = this.game.canvas.createPattern(this.image,this.repeat);
			this.game.canvas.fillStyle = ptrn;
			this.game.canvas.fillRect(0,0,this.game.cnv.width,this.game.cnv.height);
			this.game.canvas.restore();
		
		}else{
			this.game.canvas.drawImage(
				this.image,
				this.pos[0],
				this.pos[1],
				this.size[0],
				this.size[1]
			);
		}
	},
	loadImage: function(source){
		var src = source || false,
			self = this;
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
