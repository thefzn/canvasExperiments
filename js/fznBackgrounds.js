var fzn = fzn || {};
fzn.Background = function (game,params){
	if(game instanceof fzn.Game){
		// Data Vars
		this.game = game;
		this.data = params.data || {};
		this.size = params.size || [10,10];
		this.pos = params.pos || [0,0];
		this.animation = params.animation || false;
		this.anim = null;
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
		this.pos[0] = (this.pos[0] == "center") ? (game.cnv.width / 2) - (this.size[0] / 2) : this.pos[0];
		this.pos[1] = (this.pos[1] == "center") ? (game.cnv.height / 2) - (this.size[1] / 2) : this.pos[1];
		if(this.animation){
			this.anim = new fzn.Animation(this,this.animation);
		}
		this.game.loadImage(this.source);
	},
	go: function(){
		if(this.animation){
			this.anim.go();
		}
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
		this.game.canvas.restore();
	}
}
