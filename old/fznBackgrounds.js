var fzn = fzn || {};
fzn.Background = function (game,params){
	if(game instanceof fzn.Game){
		// Data Vars
		this.game = game;
		this.menu = params.menu || false;
		this.data = params.data || {};
		this.parent = params.menu || game.level || false;
		this.size = params.size || [this.game.cnv.width,this.game.cnv.height];
		this.pos = params.pos || [0,0];
		this.color = params.color || "transparent";
		this.opacity = (typeof params.opacity != "undefined") ? params.opacity : 1;
		this.source = params.source || false;
		this.repeat = params.repeat || false;
		this.fixed = params.fixed || false;
		this.id = params.id;
		this.animation = params.animation || false;
		this.init();
	}else{
		return false;
	}
}
fzn.Background.prototype = {
	init: function(){
		var w,h;
		if(this.pos == "center"){
			this.pos = [];
			this.pos[0] = (this.game.cnv.width / 2) - (this.size[0] / 2);
			this.pos[1] = (this.game.cnv.height / 2) - (this.size[1] / 2);
		}else{
			w = this.parent.size[0] || this.game.cnv.width;
			h = this.parent.size[1] || this.game.cnv.height;
			this.pos[0] = (this.pos[0] == "center") ? (w / 2) - (this.size[0] / 2) : this.pos[0];
			this.pos[1] = (this.pos[1] == "center") ? (h / 2) - (this.size[1] / 2) : this.pos[1];
		}
		this.anim = new fzn.Animation(this,this.animation);
		this.game.loadImage(this.source);
	},
	go: function(){
		this.anim.go();
		this.redraw();
	},
	redraw: function(){
		var x,y,sX,sY,
			pos=this.pos;
		this.game.canvas.save();
		if(this.fixed === true){
			x = pos[0];
			y = pos[1];
			sX = pos[0];
			sY = pos[0];
		}else if(this.fixed === false){
			y = pos[1] - this.parent.pos[1];
			x = pos[0] - this.parent.pos[0]; 
			sX = this.parent.pos[0];
			sY = this.parent.pos[1];
		}else{
			x = pos[0] - (this.parent.pos[0]*this.fixed); 
			y = pos[1] - (this.parent.pos[1]*this.fixed);
			sX = this.parent.pos[0]*this.fixed;
			sY = this.parent.pos[1]*this.fixed;
		}
		this.game.canvas.globalAlpha = (this.menu) ?  this.menu.opacity * this.opacity : this.opacity;
		if(this.color != "transparent"){
			this.game.canvas.fillStyle = this.color;
			this.game.canvas.fillRect(
				x,
				y,
				this.size[0],
				this.size[1]
			);
		}
		if(this.source){
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
			}else{
				this.game.canvas.drawImage(
					this.game.images[this.source],
					x,
					y,
					this.size[0],
					this.size[1]
				);
			}
		}
		this.game.canvas.restore();
	}
}
