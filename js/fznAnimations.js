var fzn = fzn || {};

fzn.Animation = function (item,anim,params){
	// Data Vars
	params = params || {};
	this.item = item;
	this.game = item.game;
	this.size = params.size || [50,20];
	this.pos = item.pos || [0,0];
	this.apos = params.apos || [0,0];
	this.velDown = params.velDown || 0;
	this.gravity = params.gravity || 1;
	this.maxVel = params.maxVel || 11;
	this.anim = anim || false;
	this.opacity = (typeof params.opacity != "undefined") ? params.opacity : 1;
	this.loop = params.loop || false;
	this.id = params.id;
	this.init();
}
fzn.Animation.prototype = {
	init: function(){
		switch(this.anim){
			case "bounce":
				this.apos = [this.pos[0],0-this.size[1]];
			break;
			default:
				this.apos = this.pos;
		}
		this.item.pos = this.apos;
	},
	go: function(){
		var item,target;
		target = this.anims[this.anim];
		if(typeof target == "function" && !this.animationEnd){
				target.call(this);
		}
	},
	anims: {
		fall: function(){
			if(this.apos[1] < this.pos[1]){
				this.velDown += this.gravity;
				this.velDown = (this.velDown > this.maxVel) ? this.maxVel : this.velDown;
				this.apos[1] += this.velDown;
				this.item.pos = this.apos
			}else{
				this.item.pos = this.pos
				this.animationEnd = true
			}
		},
		bounce: function(){
			this.velDown += this.gravity;
			this.apos[1] += this.velDown;
			if(this.apos[1] > this.pos[1]){
				this.apos[1] = this.pos[1]
				this.item.pos = this.apos;	
				if(this.velDown<0.5){
					this.item.pos = this.pos;
					this.animationEnd = true
				}else{
					this.velDown = -(this.velDown/2);
				}
			}	
		}			
	}
}
