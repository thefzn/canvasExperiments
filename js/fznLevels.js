var fzn = fzn || {};
fzn.Level = function (game,params){
	if(game instanceof fzn.Game){
		// Data Vars
		this.game = game;
		this.id = params.id;
		this.data = params.data;
		this.size = params.size;
		this.pos = params.pos;
		this.color = params.color;
		this.items = {
			sprites: params.sprites,
			backgrounds: params.backgrounds,
			walls: params.walls
		}
		this.user = false;
		this.keys = [];
		this.spriteTypes = {};
		this.floor =  params.floor || this.cnv.height;
		this.init();
	}else{
		return false;
	}
}
fzn.Level.prototype = {
	init: function(){
	},
	reset: function(){
		var i,len,item,lib,theLib;
		for(lib in this.game.libs){
			theLib = this.items[lib+"s"] || false;
			if(theLib){
				for(i=0,len=theLib.length;i<len;i++){
					item = theLib[i];
					this.add(lib,item.copyOf,item.id,item.params);
				}
			}
		}
		this.onLoad();
	},
	onLoad: function(){
		// Custom code
	},
	go: function(){
		this.checkPosition();
		this.draw("Background");
		this.userInput();
		this.draw("Sprite");
		this.draw("Wall");
	},
	draw: function(type){
		var item,
			target = this[type.toLowerCase()+"s"] || false;
		if(target){
			for(item in target){
				target[item].go();
			}
		}
	},
	checkPosition: function(){
		var movedX,posX,movedY,posY;
		if(this.user){
			posX = this.user.pos[0] - (this.pos[0]+(this.game.cnv.width/2));
			posY = this.user.pos[1] - (this.pos[1]+(this.game.cnv.height/2));
			movedX = this.pos[0] + posX;
			movedY = this.pos[1] + posY;
			this.pos[0] = (!this.size[0]) ? movedX : (movedX > (this.size[0]-this.game.cnv.width)) ? this.size[0]-this.game.cnv.width : (movedX >= 0) ? movedX : 0 ;
			this.pos[1] = (!this.size[1]) ? movedY : (movedY > (this.size[1]-this.game.cnv.height)) ? this.size[1]-this.game.cnv.height : (movedY >= 0) ? movedY : 0 ;
		}
	},
	add: function(type,name,id,params){
		var catalog,item,target;
		target = type.toLowerCase();
		item = this.game.libs[target].generate(name,id,params);
		if(item){
			target = type.toLowerCase()+"s";
			this[target] = this[target] || {};
			this[target][item.id] = item;
			if(type.toLowerCase() == "sprite"){
				item.floor = this.floor;
				this.spriteTypes[item.type] = this.spriteTypes[item.type] || [];
				this.spriteTypes[item.type].push(item.id);
				if(item.type == "user"){
					this.user = item;
					this.attachEvents();
				}
				this.updateCollitions();
			}
		}
	},
	updateCollitions: function(){
		var s;
		for(s in this.sprites){
			this.sprites[s].getCollideItems();
		}
	},
	userInput: function(){
		if(this.user){
			if(typeof this.keys[32] != "undefined" && this.keys[32]){
				this.user.please("jump");
			}
			if(typeof this.keys[37] != "undefined" && this.keys[37]){
				this.user.turn("L");
				this.user.please("move");
			}
			if(typeof this.keys[39] != "undefined" && this.keys[39]){
				this.user.turn("R");
				this.user.please("move");
			}
		}
	},
	attachEvents: function(){
		var self = this;
		document.addEventListener( "keydown", function(e){self.keys[e.which] = true}, true);
		document.addEventListener( "keyup", function(e){delete self.keys[e.which]}, true);
	}
}
