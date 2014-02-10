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
	this.sprites = [];
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
		var self = this,
			i,len;
		if(this.loadQueue == 0){
			self.turn = (self.turn < 100) ? self.turn + 1 : 0;
			for(i=0,len=this.sprites.length;i<len;i++){
				this.sprites[i].go();
			}
		}
		window.requestAnimFrame(function() {
          self.go();
        });
	},
	addSprite: function(params){
		var sprite = new fzn.Sprite(this,params);
		this.sprites.push(sprite);
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
