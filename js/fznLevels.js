var fzn = fzn || {};
fzn.Level = function (game,params){
	if(game instanceof fzn.Game){
		// Data Vars
		this.game = game;
		this.id = params.id;
		this.data = params.data || {};
		this.size = params.size || [this.game.cnv.width,this.game.cnv.height];
		this.pos = params.pos || [0,0];
		this.color = params.color || "white";
		this.items = {
			sprites: params.sprites || [],
			backgrounds: params.backgrounds || [],
			walls: params.walls || []
		}
		this.user = false;
		this.keys = [];
		this.spriteTypes = {};
		this.floor =  params.floor || this.game.cnv.height;
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
					this.add(lib,item.copyOf,item.id,item.params,false);
				}
			}
		}
		this.updateCollitions();
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
		this.draw("Overlay");
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
	add: function(type,name,id,params,update){
		var catalog,item,target,lib,
			update = (typeof update == "undefined") ? true : update;
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
					if(update){
						this.updateCollitions();
					}else{
						item.getCollideItems();
					}
				}
			}
		}
	},
	remove: function(type,id,spriteType){
		var item,i,len,
			spriteType = spriteType || false,
			type = type.toLowerCase(),
			target = this[type+"s"] || false;
		if(target){
			if(typeof target[id] != "undefined"){
				delete target[id];
			}
		}
		if(type == "sprite" && spriteType){
			target = this.spriteTypes[spriteType] || false;
			if(target && target[id]){
				delete target[id];
			}
		}
		//this.updateCollitions();
	},
	updateCollitions: function(){
		var s;
		for(s in this.sprites){
			this.sprites[s].getCollideItems();
		}
	},
	userInput: function(){
		if(this.game.start && this.user && this.user.alive){
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
			if(typeof this.keys[17] != "undefined" && this.keys[17]){
				this.user.please("shoot");
			}else{
				this.user.shootLag=false;
			}
		}
	},
	attachEvents: function(){
		var self = this;
		document.addEventListener( "keydown", function(e){self.keys[e.which] = true}, true);
		document.addEventListener( "keyup", function(e){delete self.keys[e.which]}, true);
	}
}
