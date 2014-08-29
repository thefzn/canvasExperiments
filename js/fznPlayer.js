var fzn = fzn || {};
fzn.Player = function (params,parent){
	var params = params || false;
	var parent = parent || false;
	this.control = false;
	if(params){
		this.Player(params,parent);
	}
}
fzn.Player.prototype = new fzn.Sprite();
fzn.Player.prototype.extend({
	Player: function(params,parent){
		this.Sprite(params,parent);
		this.setControl(params.controls)
	},
	checkInput: function(){
		if(this.control){
			this.control.go();
		}
	},
	setControl: function(c){
		var c = c || false;
		if(c){
			if(this.control instanceof fzn.Control){
				this.control.setControls(c);
			}else{
				this.control = new fzn.Control(c,this);
			}
		}
	},
	adjustx: function(r){
		// Deacelerate on x
		var rel = 1.2,
			val = (r < 0) ? Math.ceil(r / rel) : Math.floor(r / rel);
		return val;
	}
});
