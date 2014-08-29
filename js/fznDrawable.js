var fzn = fzn || {};
fzn.Drawable = function (){}
fzn.Drawable.prototype = new fzn.Object();
fzn.Drawable.prototype.extend({
	Drawable:function(params,parent){
		var params = params || {};
		var parent   = parent || false;
		this.setParent(parent);
		
		// Basic data
		this.canvas   = params.canvas || this.canvas;
		this.name       = params.name || "item" + Math.random();
		this.UID      = params.UID || "INVALID";
		this.fixed    = params.fixed || false;
		
		// Drawing data
		this.pos      = this.validateCoords(params.pos);
		this.size     = this.validateCoords(params.size,[10,10]);
		this.opacity  = (typeof params.opacity != "undefined") ? params.opacity : 1;
		this.blinking = params.blinking || false;
		this.color    = params.color || false;
		this.image    = params.image || false;
		this.imagePos = this.validateCoords(params.imagePos);
		this.tile     = params.tile || false;
		this.isMoving = [false,false];
		this.floor    = params.floor || false;
		
		// Animation data
		var s  = parseInt(params.speedUp) || false,
			g  = parseInt(params.gravity) || false;
		this.mov = {
			x:{
				vel   : parseInt(params.xVel) || 0,
				acc   : (s) ? s : 0,
				max   : parseInt(params.xMaxVel) || 10,
				min   : 0 - parseInt(params.xMaxVel) || -10
			},
			y:{
				vel   : parseInt(params.yVel) || 0,
				acc   : (g) ? g : 0,
				max   : parseInt(params.yMaxVel) || 15,
				min   : 0 - parseInt(params.yMaxVel) || -15
			}
		}
	},
	go: function(){
		this.eachFrame();
		this.calcPosition();
		this.beforeRedraw();
		this.redraw();
	},
	calcPosition: function(){
		var res = [],
			c = 0,
			axis,a,tar,f,vel;
		for(axis in this.mov){
			a = this.mov[axis];
			tar = this.pos[c];
			if(a.vel == 0 && a.acc == 0){
				res.push(tar);
				c++;
				continue;
			}
			
			a.vel += a.acc;
			a.vel = this["adjust" + axis](a.vel);
			vel = (a.max != 0 && a.vel > a.max) ? a.max : a.vel;
			vel = (a.min != 0 && vel < a.min) ? a.min : vel;
			r = tar + vel;
			
			if(axis == "y" && this.floor){
				f = this.floor - this.size[1];
				r = (r <= f) ? r : f;
			}
		
			res.push(r);
			this.isMoving[c] = (tar == r) ? false : true;
			c++;
		}
		this.pos = res;
	},
	redraw: function(){
		if(!this.canvas)
			return false;
		var posX,posY,pat;
		this.canvas.save();
		if(this.opacity != 1){
			this.canvas.globalAlpha = (this.parent) ? this.opacity * this.parent.opacity : this.opacity;
		}
		if(this.blinking){
			this.canvas.globalCompositeOperation = "lighter";
		}
		if(this.parent && !this.fixed){
			posX = this.pos[0] + this.parent.pos[0];
			posY = this.pos[1] + this.parent.pos[1];
		}else{
			posX = this.pos[0];
			posY = this.pos[1];
		}
		if(this.color || (this.tile && this.image)){
			pat = (this.tile && this.image) ? this.canvas.createPattern(this.image,'repeat') : false;
			this.canvas.fillStyle = pat || this.color;
			this.canvas.fillRect(
				posX,
				posY,
				this.size[0],
				this.size[1]
			);
		}
		if(this.image instanceof Image && !this.tile){
			this.canvas.drawImage(
				this.image,
				this.imagePos[0],
				this.imagePos[1],
				this.size[0],
				this.size[1],
				posX,
				posY,
				this.size[0],
				this.size[1]
			);
		}
		this.canvas.restore();
	},
	// Placeholders
	eachFrame: function(){},
	beforeRedraw: function(){},
	adjustx: function(r){return r},
	adjusty: function(r){return r}
});
