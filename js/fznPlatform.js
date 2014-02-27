var fzn = fzn || {};

window.requestAnimFrame = (function(callback) {
	//return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
	return function(callback) {
	  window.setTimeout(callback, 1000/30);
	};
})();
fzn.Game = function(canvasID){
	this.cnv = (typeof canvasID == "string") ? document.getElementById(canvasID) : canvasID;
	this.canvas = (typeof this.cnv.getContext != "undefined" ) ? this.cnv.getContext('2d'): false;
	this.loadQueue = 0;
	this.start = true;
	this.level = false;
	this.images = {};
	this.fonts = [];
	this.menus = [];
	this.turn = 0;
	this.init();
};
fzn.Game.prototype = {
	init: function(){
		if(!this.canvas){
			console.log("Canvas not supported or error loading")
			return false;
		}
		this.catchClick();
		this.go();
	},
	go: function(){
		var self = this,
			key,len, menu;
		if(!this.start){
			return false;
		}
		if(this.loadQueue == 0){
			this.clear();
			if(typeof this.level == "object" && this.level){
				this.turn = (this.turn < 2520) ? this.turn + 1 : 0;
				this.level.go();
			}
			for(key = 0,len = this.menus.length; key < len; key++){
				menu = this.menus[key];
				menu.go();
			}
		}
		window.requestAnimFrame(function() {
          self.go();
        });
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
		this.menus.push(menu);
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
	}
}
fzn.Catalog = function(game,type){
	this.type = type || "generic";
	this.items = {};
	this.instances = 0;
	this.game = game;
}
fzn.Catalog.prototype = {
	store: function(params){
		var par = params || false;
		
		if(par && typeof par.name != "undefined"){
			this.items[par.name] = par;
		}
	},
	generate: function(name,id,params){
		var n = name || false,
			p = {},
			itm = this.items[n],
			def;
		if(!n || typeof this.items[n] == "undefined"){
			return false;
		}
		this.instances++;
		params = params || {};
		for(def in itm){
			p[def] = itm[def];
		}
		for(def in params){
			p[def] = params[def];
		}
		p.id = p.id || id || this.type+"_"+name+"_"+this.instances;
		switch(this.type){
			case "sprite":
				return new fzn.Sprite(this.game,p);
			break;
			case "background":
				return new fzn.Background(this.game,p);
			break;
			case "overlay":
				return new fzn.Background(this.game,p);
			break;
			case "level":
				return new fzn.Level(this.game,p);
			break;
			case "wall":
				return new fzn.Wall(this.game,p);
			break;
			case "button":
				var parent = p.menu || this.game.level || false;
				return new fzn.Button(parent,p);
			break;
			case "menu":
				return new fzn.Menu(this.game,p);
			break;
			default:
				return p;
		}
	},
	remove: function(){
		
	}
}
