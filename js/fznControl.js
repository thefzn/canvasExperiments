var fzn = fzn || {};
fzn.Control = function (params,target){
	if(!(target instanceof fzn.Sprite))
		return false;
	
	this.parent = target;
	this.keys = {};
	this.controls = {};
	
	this.setControls(params);
	this.attachEvents();
}
fzn.Control.prototype = {
	go: function(){
		var itm,check;
		for(itm in this.controls){
			check = this.keys[itm] || false;
			if(check){
				this.controls[itm](this.parent);
			}
		}
	},
	attachEvents: function(){
		var self = this;
		document.addEventListener( "keydown", function(e){self.keys[e.which] = true}, true);
		document.addEventListener( "keyup", function(e){self.keys[e.which] = false}, true);
	},
	setControls: function(p){
		var c = (typeof p == "object") ? p : this.getDefault(p);
		this.controls = c || this.controls;
	},
	getDefault: function(n){
		var defaults = [
			{},
			{
				38: function(t){console.log("up")},
				40: function(t){console.log("down")},
				37: function(t){t.please("turn","L");t.please("move")},
				39: function(t){t.please("turn","R");t.please("move")},
				33: function(t){t.please("jump")},
				34: function(t){t.please("shoot")},
			},
			{
				87: function(t){console.log("up")},
				83: function(t){console.log("down")},
				65: function(t){t.please("turn","L");t.please("move")},
				68: function(t){t.please("turn","R");t.please("move")},
				81: function(t){t.please("jump")},
				69: function(t){t.please("shoot")},
			}
		];
		if(typeof n != "number")
			return false;
		if(n < defaults.length){
			return defaults[n];
		}else{
			return false;
		}
	}
};
