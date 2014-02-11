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
	this.user = false;
	this.keys = [];
	this.sprites = {};
	this.spriteTypes = {};
	this.backgrounds = [];
	this.floor = this.cnv.height;
	this.turn = 0;
	this.init();
}
fzn.Game.prototype = {
	init: function(){
		if(!this.canvas){
			console.log("canvas not supported or error loading")
			return false;
		}else{
			console.log(this.canvas)
		}
		this.go();
	},
	go: function(){
		var self = this;
		if(!this.start){
			return false;
		}
		if(this.loadQueue == 0){
			this.clear();
			this.turn = (this.turn < 100) ? this.turn + 1 : 0;
			this.drawBackgrounds();
			this.userInput();
			this.drawSprites();
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
	drawBackgrounds: function(){
		var i,len, item;
		// create pattern
		for(i=0,len=this.backgrounds.length;i<len;i++){
			item = this.backgrounds[i];
			this.canvas.drawImage(
				item.img,
				item.pos[0],
				item.pos[1]
			);
		}
	},
	drawSprites: function(){
		var s;
		for(s in this.sprites){
			this.sprites[s].go();
		}
	},
	addSprite: function(params){
		var sprite = new fzn.Sprite(this,params),
			type = params.type || "generic";
		this.sprites[sprite.id] = sprite;
		this.spriteTypes[type] = this.spriteTypes[type] || [];
		this.spriteTypes[type].push(sprite.id);
		if(sprite.type == "user"){
			this.user = sprite;
			this.attachEvents();
		}
		this.updateCollitions();
	},
	addBackground: function(source,pos){
		var src = source || false,
			self = this,
			bk;
		if(src){
			bk = new Image()
			bk.addEventListener("load", function() {
				self.loadQueue--;
			}, false);
			this.loadQueue++;
			this.backgrounds.push({
				img: bk,
				pos: pos || [0,0]
			});
			bk.src = src;
		}
	},
	updateCollitions: function(){
		var s;
		for(s in this.sprites){
			this.sprites[s].getCollideItems();
		}
	},
	attachEvents: function(){
		var self = this;
		document.addEventListener( "keydown", function(e){self.keys[e.which] = true}, true);
		document.addEventListener( "keyup", function(e){delete self.keys[e.which]}, true);
	},
	getRes: function(){
		var res;
		if(document.getElementById("fznResources") == null){
			res = document.createElement("div")
			res.id = "fznResources";
			document.body.appendChild(res);
			this.res = res;
		}else{
			this.res = document.getElementById("fznResources");
			this.res.style.display = "none";
		}
		return res;
	}
}
