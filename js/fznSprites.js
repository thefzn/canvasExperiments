var fzn = fzn || {};
fzn.Sprite = function (game,params){
	if(game instanceof fzn.Game){
		this.game = game;
		this.canvas = null;
		this.cnv = null;
		this.size = [];
		this.action = "stand";
		this.frame = 0;
		this.params = params;
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
		
		// Generate a canvas for Sprite
		this.setRes();
		this.loadSheet(this.params.source);
	},
	go: function(){
		var frame = this.frame;
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
		this.canvas.clearRect(0,0,this.cnv.width,this.cnv.height);
		this.canvas.drawImage(
			this.sheet,
			this.active.steps[this.frame][0],
			this.active.steps[this.frame][1],
			this.size[0],
			this.size[1],
			0,
			0,
			this.size[0],
			this.size[1]
		);
	},
	setRes: function(){
		var i,len,theID,
			found=false;
		this.res = this.game.getRes();
		for(i=0,len=this.res.childNodes.length;i<len;i++){
			theID = this.res.childNodes[i].id || false;
			if(theID && theID = this.id){
				this.cnv = this.res.childNodes[i];
				found = true;
			}
		}
		if(!found){
			this.size = this.params.size;
			this.cnv = document.createElement("canvas");
			this.cnv.id = this.id;
			this.cnv.width = this.size[0];
			this.cnv.height = this.size[1];
			this.res.appendChild(this.cnv);
		}
		this.canvas = this.cnv.getContext('2d')
	},
	loadSheet: function(source){
		var src = source || false,
			self = this;
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
