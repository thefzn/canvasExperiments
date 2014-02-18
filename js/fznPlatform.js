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
	this.turn = 0;
	this.init();
}
fzn.Game.prototype = {
	init: function(){
		if(!this.canvas){
			console.log("Canvas not supported or error loading")
			return false;
		}
		this.go();
	},
	go: function(){
		var self = this;
		if(!this.start){
			return false;
		}
		if(this.loadQueue == 0 && typeof this.level == "object" && this.level){
			this.clear();
			this.turn = (this.turn < 100) ? this.turn + 1 : 0;
			this.level.go();
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
			}
		}else{
			this.libs[target].store(params);
		}
	},
	loadLevel: function(lvl,params){
		this.level = this.libs.level.generate(lvl,false,params);
		this.level.reset();
	}
}
fzn.Catalog = function(game,type){
	this.type = type || "generic";
	this.items = {};
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
		params = params || {};
		p.id = id || params.id || this.type+"_"+name+"_"+Math.round(Math.random()*10000);
		p.source = params.source || itm.source || false;
		p.pos = params.pos || itm.pos || [0,0];
		p.opacity = (typeof params.opacity != "undefined") ? params.opacity : (typeof itm.opacity != "undefined") ?  itm.opacity : 1;
		p.size = params.size || itm.size || [10,10];
		p.data = params.data || itm.data || {};
		
		switch(this.type){
			case "sprite":
				p.type = params.type || itm.type || "generic";
				p.gravity = params.gravity || itm.gravity || 0;
				p.sprite = params.sprite || itm.sprite || {};
				p.collide = params.collide || itm.collide || [];
				p.onCollide = params.onCollide || itm.onCollide || false;
				p.action = params.action || itm.action || "stand";
				p.NPC = params.NPC || itm.NPC || false;
				return new fzn.Sprite(this.game,p);
			break;
			case "background":
				p.fixed = params.fixed || itm.fixed || false;
				p.repeat = params.repeat || itm.repeat || false;
				return new fzn.Background(this.game,p);
			break;
			case "level":
				p.size = params.size || itm.size || [this.game.cnv.width,this.game.cnv.height];
				p.floor = params.floor || itm.floor || this.game.cnv.height;
				p.color = params.color || itm.color || "white";
				p.sprites = params.sprites || itm.sprites || [];
				p.pos = params.pos || itm.pos || [0,0];
				p.backgrounds = params.backgrounds || itm.backgrounds || [];
				p.walls = params.walls || itm.walls || [];
				return new fzn.Level(this.game,p);
			break;
			case "wall":
				p.color = params.color || itm.color || false;
				p.fixed = params.fixed || itm.fixed || false;
				return new fzn.Wall(this.game,p);
			break;
			default:
				for(def in itm){
					p[def] = itm[def];
				}
				for(def in params){
					p[def] = params[def];
				}
				return p;
		}
	}
}
