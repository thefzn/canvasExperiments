var fzn = fzn || {};

window.requestAnimFrame = (function(callback) {
	//return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
	return function(callback) {
	  window.setTimeout(callback, 1000/12);
	};
})();
fzn.Game = function(canvasID){
	var canvasID = canvasID || false;
	this.cnv = (typeof canvasID == "string") ? document.getElementById(canvasID) : canvasID;
	if(!canvasID || !this.cnv)
		return false;
	
	this.canvas = (typeof this.cnv.getContext != "undefined" ) ? this.cnv.getContext('2d'): false;
	this.start = true;
	this.turn = 0;
	this.stages = {
		lenght:0
	};
	this.init();
};
fzn.Game.prototype = new fzn.Collection('game');
fzn.Game.prototype.extend({
	init: function(){
		var self = this;
		if(!this.canvas){
			console.log("Canvas not supported or error loading")
			return false;
		}
		//this.catchClick();
		//this.go();
	},
	go: function(){
		var self = this,
			key,len,menu;
		if(!this.start || this.loadQueue == 0){
			return false;
		}
		this.clear();
		this.refresh(this.stages);
		
		window.requestAnimFrame(function() {
			self.go();
        });
		this.turn++;
	},
	pause: function(){
		if(this.start){
			this.start = false;
		}else{
			this.start = true;
			this.go();
		}
	},
	clear: function(){
		this.canvas.clearRect(0,0,this.cnv.width,this.cnv.height);
		if(typeof this.level != "undefined" && this.level){
			this.canvas.save();
			this.canvas.fillStyle = this.level.color;
			this.canvas.fillRect(0,0,this.cnv.width,this.cnv.height);
			this.canvas.restore();
		}
		
	},
	refresh: function(target){
		var t = (typeof target == "object") ? target : {},
			i,itm;
		for(i in t){
			itm = t[i];
			if(itm instanceof fzn.Drawable){
				itm.go();
			}
		}
	},
	loadStage: function(type,name,config){
		var t = type || false,
			n = name || false,
			p = this.generate([t,n],config),
			id = p.name || false;
		console.log(p)
		if(!p || id == "length")
			return;
		if(typeof this.stages[id] == "undefined"){
			p.size = p.size || [this.cnv.width,this.cnv.height];
			this.stages[id] = p;
			this.stages.lenght++;
		}
		p.start();
	},
	newGame: function(config){
		var conf = config || false,
			self = this,
			itm;
		if(!conf)
			return;
		for(itm in config){
			this.addItem(itm,config[itm]);
		}
	},
	onLoad: function(){
		console.log("Game loaded");
	}
	/*,
	define: function(type,params){
		var i,len,target,
			type = type || false;
		if(!type){
			return false;
		}
		this.libs = this.libs || {};
		target = type.toLowerCase();
		this.libs[target] = this.libs[target] || new fzn.Catalog(this,type.toLowerCase());
		if(params instanceof Array){
			for(i=0,len=params.length;i<len;i++){
				this.libs[target].store(params[i]);
				if(typeof params[i].source === "string"){
					this.loadImage(params[i].source);
				}
			}
		}else{
			this.libs[target].store(params);
			if(typeof params.source === "string"){
				this.loadImage(params.source);
			}
		}
	},
	loadLevel: function(lvl,params){
		this.level = this.libs.level.generate(lvl,false,params);
		this.level.reset();
	},
	loadMenu: function(menu,params){
		var params = params || {},
			menu = this.libs.menu.generate(menu,false,params);
		menu.index = this.menus.length;
		this.menus.push(menu);
		return menu;
	},
	removeMenu: function(menu){
		var index = menu.index;
		this.menus[index] = null;
		menu = null;
		this.menus.splice(index,1);
	},
	loadImage: function(source){
		var src = source || false,
			self = this,
			image = this.images[src];
		if(src && typeof image == "undefined"){
			this.images[src] = new Image()
			this.images[src].addEventListener("load", function() {
				self.loadQueue--;
			}, false);
			this.loadQueue++;
			this.images[src].src = src;
		}
	},
	catchClick: function(){
		var self = this;
		this.cnv.addEventListener("mousedown", function(event){
			var pos = [event.offsetX,event.offsetY];
			self.onClick(pos); 
		}, false);
	},
	onClick: function(pos){
		var catched = false,
			key,len,menu;
		for(len = this.menus.length; len > 0; len--){
			menu = this.menus[len-1];
			if(menu.click){
				catched = menu.checkClicked(pos);
			}
			if(catched){
				break;
			}
		}
	},
	checkFont: function(font){
		var i, len, choosen = "Arial";
		for(i = 0, len = this.fonts.length; i < len; i++){
			if(font == this.fonts[i]){
				choosen = font;
			}
		}
		return choosen;
	}*/
})