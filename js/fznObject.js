var fzn = fzn || {};
fzn.Object = function (){
	this.game = false;
	this.parent = false;
	this.parentIsStage = false;
};
fzn.Object.prototype = {
	validateCoords: function(arr,def){
		var arr = arr || false,
			def = def || [0,0],
			res = false,
			val = true,
			i = 0,
			len;
		if(arr && arr instanceof Array){
			for(len = arr.length; i < len; i++){
				if(typeof arr[i] !== "number"){
					val = false;
					break;
				}
			}
			res = true;
		}
		return (val && res) ? arr : def;
	},
	validateImage: function(image){
		var img = image || false,
			res;
		return (!img) ? false : (img instanceof Image) ? img : (this.game) ? this.game.get("images",image) : false;
	},
	setParent: function(parent){
		if(parent instanceof fzn.Stage){
			this.parent = parent;
			this.parentIsStage = true;
		}
		//this.parentIsMenu = (parent instanceof fzn.Menu) ? true : false;
	},
	setGame: function(game){
		this.game = (game instanceof fzn.Game) ? game : this.game;
		this.canvas = (this.game.canvas && this.game.canvas instanceof CanvasRenderingContext2D) ? this.game.canvas : false;
		if(!(this.image instanceof Image)){
			this.image = this.validateImage(this.image);
		}
	},
	getClassName: function(rawName){
		var name,fLetter;
		if(typeof rawName != "string" || rawName.length <= 0)
			return false;
		name = rawName.substr(1,rawName.length-2) || "";
		fLetter = rawName[0].toUpperCase();
		return fLetter + name;
	},
	extend: function(obj){
		var self = this,
			meth;
		for(meth in obj){
			self[meth] = obj[meth];
		}
		self = null;
		obj = null
	}
}