var fzn = fzn || {};
fzn.Menu = function (game,params){
	if(game instanceof fzn.Game){
		// Data Vars
		this.game = game;
		this.data = params.data || {};
		this.size = params.size || [this.game.cnv.width,this.game.cnv.height];
		this.pos = params.pos || [0,0];
		this.opacity = (typeof params.opacity != "undefined") ? params.opacity : 1;
		this.source = params.source || false;
		this.color = params.color || "transparent";
		this.items = {
			backgrounds: params.backgrounds || [],
			buttons: params.buttons || [],
			ovelays: params.overlays || []
		}
		this.repeat = params.repeat || false;
		this.id = params.id;
		this.click = params.click || true;
		this.keys = params.keys || true;
		this.animation = params.animation || false;
		this.init();
	}else{
		return false;
	}
}
fzn.Menu.prototype = {
	init: function(){
		if(this.pos == "center"){
			this.pos = [];
			this.pos[0] = (this.game.cnv.width / 2) - (this.size[0] / 2);
			this.pos[1] = (this.game.cnv.height / 2) - (this.size[1] / 2);
		}else{
			this.pos[0] = (this.pos[0] == "center") ? (this.game.cnv.width / 2) - (this.size[0] / 2) : this.pos[0];
			this.pos[1] = (this.pos[1] == "center") ? (this.game.cnv.height / 2) - (this.size[1] / 2) : this.pos[1];
		}
		this.anim = new fzn.Animation(this,this.animation);
		// Generate a canvas for BG
		this.game.loadImage(this.source);
		this.loadItems();
	},
	go: function(){
		this.anim.go();
		this.redraw();
		this.draw("background");
		this.draw("button");
		this.draw("overlays");
	},
	loadItems: function(){
		var i,len,item,lib,theLib;
		for(lib in this.game.libs){
			theLib = this.items[lib+"s"] || false;
			if(theLib){
				for(i=0,len=theLib.length;i<len;i++){
					item = theLib[i];
					item.params = item.params || {};
					item.params.menu = this;
					this.add(lib,item.copyOf,item.id,item.params);
				}
			}
		}
	},
	add: function(type,name,id,params){
		var catalog,item,target,lib;
		target = type.toLowerCase();
		lib = this.game.libs[target] || false;
		if(lib){
			item = lib.generate(name,id,params);
			if(item){
				target = type.toLowerCase()+"s";
				this[target] = this[target] || {};
				this[target][item.id] = item;
				if(type.toLowerCase() == "sprite"){
					item.floor = this.floor;
					this.spriteTypes[item.type] = this.spriteTypes[item.type] || {};
					this.spriteTypes[item.type][item.id] = true;
					if(item.type == "user"){
						this.user = item;
						this.attachEvents();
					}
				}
			}
		}
	},
	remove: function(type,id){
		var item,i,len,
			type = type.toLowerCase(),
			target = this[type+"s"] || false;
		if(target){
			if(typeof target[id] != "undefined"){
				delete target[id];
			}
		}
	},
	draw: function(type){
		var item,
			target = this[type.toLowerCase()+"s"] || false;
		if(target){
			for(item in target){
				if(type.toLowerCase() == "sprite"){
					if(target[item].alive){
						target[item].go();
					}else{
						this.remove(type,target[item].id,target[item].type);
					}
				}else{
					target[item].go();
				}
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
	},
	redraw: function(){
		var pos = this.pos,
			x = pos[0],
			y = pos[1];
		this.game.canvas.save();
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
		}else if(this.color != "transparent"){
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
fzn.Button = function (menu,params){
	// Data Vars
	this.menu = menu || false;
	this.game = menu.game;
	this.data = params.data || {};
	this.size = params.size || [50,20];
	this.parent = params.menu || game.level || false;
	this.pos = params.pos || [0,0];
	this.action = params.action || function(){}; 
	this.opacity = (typeof params.opacity != "undefined") ? params.opacity : 1;
	this.source = params.source || false;
	this.color = params.color || "transparent";
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
	this.animation = params.animation || false;
	this.init();
}
fzn.Button.prototype = {
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
		// Generate a canvas for BG
		this.game.loadImage(this.source);
	},
	go: function(){
		this.anim.go();
		this.redraw();
		this.state = "stand";
	},
	redraw: function(){
		var state = this.sprite[this.state] || [0,0],
			pos = this.pos,
			x = pos[0] + this.menu.pos[0],
			y = pos[1] + this.menu.pos[1];
		this.game.canvas.save();
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
					x,
					y,
					this.game.cnv.width,
					this.game.cnv.height
				);
			}else{
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
			}
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
			this.state = "press"
			this.action(this.game,this.menu);
			return true;
		}
	}
}
