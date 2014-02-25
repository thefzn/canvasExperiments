var fzn = fzn || {};
fzn.Background = function (game,params){
	if(game instanceof fzn.Game){
		// Data Vars
		this.game = game;
		this.image = null;
		this.data = params.data || {};
		this.size = params.size || [10,10];
		this.pos = params.pos || [0,0];
		this.velDown = 0;
		this.gravity = 1;
		this.maxVel = 11;
		this.apos = [0,0];
		this.animation = params.animation || false;
		this.animationEnd = false;
		this.opacity = (typeof params.opacity != "undefined") ? params.opacity : 1;
		this.source = params.source || false;
		this.repeat = params.repeat || false;
		this.fixed = params.fixed || false;
		this.id = params.id;
		this.init();
	}else{
		return false;
	}
}
fzn.Background.prototype = {
	init: function(){
		// Generate a canvas for BG
		if(this.pos == "center"){
			this.pos = []
			this.pos[0] = (this.game.cnv.width / 2) - (this.size[0] / 2);
			this.pos[1] = (this.game.cnv.height / 2) - (this.size[1] / 2);
		}
		if(this.animation){
			switch(this.animation){
				case "bounce":
					this.apos = [this.pos[0],0-this.size[1]];
				break;
			}
		}
		this.loadImage(this.source);
	},
	go: function(){
		if(this.animation && !this.animationEnd){
			switch(this.animation){
				case "fall":
					if(this.apos[1] < this.pos[1]){
						this.velDown += this.gravity;
						this.velDown = (this.velDown > this.maxVel) ? this.maxVel : this.velDown;
						this.apos[1] += this.velDown;
					}else{
						this.apos[1] == this.pos[1];
						this.animationEnd = true
					}
				break;
				case "bounce":
					this.velDown += this.gravity;
					this.apos[1] += this.velDown;
					if(this.apos[1] > this.pos[1]){
							this.apos[1] = this.pos[1]
						if(this.velDown<0.5){
							this.animationEnd = true
						}else{
							this.velDown = -(this.velDown/2);
						}
					}
				break;
			}
		}
		this.redraw();
	},
	redraw: function(){
		var x,y,sX,sY,
			pos=(this.animation && !this.animationEnd) ? this.apos : this.pos;
		this.game.canvas.save();
		if(this.fixed === true){
			x = pos[0];
			y = pos[1];
			sX = pos[0];
			sY = pos[0];
		}else if(this.fixed === false){
			y = pos[1] - this.game.level.pos[1];
			x = pos[0] - this.game.level.pos[0]; 
			sX = this.game.level.pos[0];
			sY = this.game.level.pos[1];
		}else{
			x = pos[0] - (this.game.level.pos[0]*this.fixed); 
			y = pos[1] - (this.game.level.pos[1]*this.fixed);
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
		}else{
			this.game.canvas.drawImage(
				this.image,
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
