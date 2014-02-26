var fzn = fzn || {};
fzn.Menu = function (game,params){
	if(game instanceof fzn.Game){
		// Data Vars
		this.game = game;
		this.data = params.data || {};
		this.size = params.size || [this.game.cnv.width,this.game.cnv.height];
		this.pos = params.pos || [0,0];
		this.velDown = 0;
		this.gravity = 1;
		this.maxVel = 11;
		this.apos = [0,0];
		this.animation = params.animation || false;
		this.animationEnd = false;
		this.opacity = (typeof params.opacity != "undefined") ? params.opacity : 1;
		this.source = params.source || false;
		this.color = params.color || "white";
		this.items = {
			sprites: params.sprites || [],
			backgrounds: params.backgrounds || [],
			walls: params.walls || []
		}
		this.repeat = params.repeat || false;
		this.id = params.id;
		this.btns = params.buttons || [];
		this.buttons = {};
		this.click = params.click || true;
		this.keys = params.keys || true;
		this.init();
	}else{
		return false;
	}
}
fzn.Menu.prototype = {
	init: function(){
		// Generate a canvas for BG
		this.pos[0] = (this.pos[0] == "center") ? (this.menu.size[0] / 2) - (this.size[0] / 2) : this.pos[0];
		this.pos[1] = (this.pos[1] == "center") ? (this.menu.size[1] / 2) - (this.size[1] / 2) : this.pos[1];
		if(this.animation){
			switch(this.animation){
				case "bounce":
					this.apos = [this.pos[0],0-this.size[1]];
				break;
			}
		}
		this.game.loadImage(this.source);
		this.loadButtons();
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
		for(item in this.buttons){
			this.buttons[item].go();
		}
	},
	redraw: function(){
		var pos=(this.animation && !this.animationEnd) ? this.apos : this.pos,
			x = pos[0],
			y = pos[1];
		this.game.canvas.save();
		if(this.opacity != 1){
			this.game.canvas.globalAlpha = this.opacity;
		}
		if(this.repeat == "repeat" || this.repeat == "repeat-x" || this.repeat == "repeat-y"){
			this.game.canvas.translate(x,y);
			var ptrn = this.game.canvas.createPattern(this.game.images[this.source],this.repeat);
			this.game.canvas.fillStyle = ptrn;
			this.game.canvas.fillRect(
				x,
				y,
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
		}else{
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
	loadButtons: function(){
		var i,len,item,lib,name;
		lib = this.game.libs.button;
		for(i = 0, len = this.btns.length; i < len; i++ ){
			name = this.btns[i].name;
			id = this.btns[i].id || false;
			this.btns[i].menu = this;
			item = lib.generate(name, id, this.btns[i]);
			if(item){
				this.buttons = this.buttons || {};
				this.buttons[item.id] = item;
			}
		}
	},
	checkClicked: function(pos){
		var insidePos = [], item;
		if(pos[0] > this.pos[0] && pos[0] < this.pos[0]+this.size[0] && pos[1] > this.pos[1] && pos[1] < this.pos[1]+this.size[1]){
			insidePos[0] =  pos[0] - this.pos[0];
			insidePos[1] =  pos[1] - this.pos[1];
			for(item in this.buttons){
				this.buttons[item].checkClicked(insidePos);
			}
			return true;
		}
	}
}
fzn.Button = function (menu,params){
	// Data Vars
	this.menu = menu;
	this.game = menu.game;
	this.data = params.data || {};
	this.size = params.size || [50,20];
	this.pos = params.pos || [0,0];
	this.velDown = 0;
	this.gravity = 1;
	this.maxVel = 11;
	this.apos = [0,0];
	this.action = params.action || function(){};
	this.animation = params.animation || false;
	this.animationEnd = false;
	this.opacity = (typeof params.opacity != "undefined") ? params.opacity : 1;
	this.source = params.source || false;
	this.color = params.color || "white";
	this.font = {family:"Arial",color:"black",size:"6px",align:"center"};
	if(typeof params.font != "undefined"){
		this.font.family = params.font.family || this.font.family;
		this.font.color = params.font.color || this.font.color;
		this.font.size = params.font.size || this.font.size;
		this.font.align = params.font.align || this.font.align;
	}
	this.sprite = params.sprite || {stand:[0,0]};
	this.state = "stand";
	this.repeat = params.repeat || false;
	this.text = params.text || false;
	this.id = params.id;
	this.states = params.states || {};
	this.init();
}
fzn.Button.prototype = {
	init: function(){
		// Generate a canvas for BG
		this.pos[0] = (this.pos[0] == "center") ? (this.menu.size[0] / 2) - (this.size[0] / 2) : this.pos[0];
		this.pos[1] = (this.pos[1] == "center") ? (this.menu.size[1] / 2) - (this.size[1] / 2) : this.pos[1];
		if(this.animation){
			switch(this.animation){
				case "bounce":
					this.apos = [this.pos[0],0-this.size[1]];
				break;
			}
		}
		this.game.loadImage(this.source);
	},
	go: function(){
		var item;
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
		this.state = "stand";
	},
	redraw: function(){
		var state = this.sprite[this.state] || [0,0];
		var pos=(this.animation && !this.animationEnd) ? this.apos : this.pos,
			x = pos[0] + this.menu.pos[0],
			y = pos[1] + this.menu.pos[1];
		this.game.canvas.save();
		if(this.opacity != 1){
			this.game.canvas.globalAlpha = this.opacity;
		}
		if(this.repeat == "repeat" || this.repeat == "repeat-x" || this.repeat == "repeat-y"){
			this.game.canvas.translate(x,y);
			var ptrn = this.game.canvas.createPattern(this.game.images[this.source],this.repeat);
			this.game.canvas.fillStyle = ptrn;
			this.game.canvas.fillRect(
				x,
				y,
				this.game.cnv.width,
				this.game.cnv.height
			);
		}else if(this.source){
			this.game.canvas.drawImage(
				this.game.images[this.source],
				state[0],
				state[1],
				this.size[0],
				this.size[1],
				x,
				y,
				this.size[0],
				this.size[1]
			);
		}else{
			this.game.canvas.fillStyle = this.color;
			this.game.canvas.fillRect(
				x,
				y,
				this.size[0],
				this.size[1]
			);
		}
		if(this.text){
			this.game.canvas.fillStyle = this.font.color;
			this.game.canvas.font = this.font.size + " '" + this.font.family + "', sans-serif";
			y += (parseInt(this.font.size)/2)+(this.size[1]/2);
			switch(this.font.align){
				case "left":
					x += 0;
				break
				case "right":
					x += this.size[0];
				break
				case "center":
					x += this.size[0]/2;
				break
			}
			this.game.canvas.textAlign = this.font.align;
			
			this.game.canvas.fillText(this.text, x, y);
		}
		this.game.canvas.restore();
	},
	checkClicked: function(pos){
		if(pos[0] > this.pos[0] && pos[0] < this.pos[0]+this.size[0] && pos[1] > this.pos[1] && pos[1] < this.pos[1] + this.size[1]){
			console.log("clicked",this.id);
			this.state = "press"
			this.action(this.game,this.menu);
			return true;
		}
	}
}
