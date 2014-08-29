var fzn = fzn || {};
fzn.Collidable = function (){
	this.collideList = [];
}
fzn.Collidable.prototype = new fzn.Drawable();
fzn.Collidable.prototype.extend({
	Collidable: function(params,parent){
		var parms = params || {};
		this.collideList = parms.collideList || [];
		this.Drawable(params,parent);
	},
	beforeRedraw: function(){
		var targets = [],
			i,len,name,j,len2;
		if(!this.parentIsStage)
			return;
		for(i = 0, len = this.collideList.length; i < len; i++){
			name = this.collideList[i];
			targets = this.parent.getActiveInstancesOf(name);
			len2 = targets.length;
			for(j = 0; j < len2; j++){
				this.checkCollision(targets[j])
			}
		}
	},
	checkCollision: function(target){
		var i,len,itm,
			all = {},
			itmsOnDir = [],
			newpos = [Math.round(this.pos[0]),Math.round(this.pos[0])];
		myBonds = this.getBonds();
		theirBonds = target.getBonds();
		
		itm = target || false;
		if(itm && itm.alive){
			coll = this.compareBonds(myBonds,theirBonds);
			if(coll){
				this.handleCollition(coll,myBonds,theirBonds)
			}
		/*
			if(coll.Any){
				newpos = this.onCollide(coll,itm,newpos[0],newpos[1]);
				//Execute Custom Collide Function
				/ *
				if(typeof this.collide[itm.type] == "function"){
					this.collide[itm.type](this,itm,coll)
				}
				if(this.activateNPC){
					this.NPC.onCollide(this,newpos,coll);
				}
				* /
			}
			//this.pos = newpos;
			*/
		}
	},
	getBonds: function(){
		return {
				T : this.pos[1],
				B : this.pos[1] + this.size[1],
				L : this.pos[0],
				R : this.pos[0] + this.size[0],
		}
	},
	compareBonds: function(b1,b2){
		var tolx = this.size[0]/4,
			toly = this.mov.y.max,
			coll = {
				B:false,
				T:false,
				L:false,
				R:false,
				Any:false
			};
		if( (b1.R - tolx) > b2.L && (b1.L + tolx) < b2.R){
			if(b1.B > b2.T && b1.B < b2.B){
				coll.B = true;
				coll.Any = true;
			}
			if(b1.T < b2.B && b1.T > b2.T){
				coll.T = true;
				coll.Any = true;
			}
		}
		if((b1.B - toly) > b2.T && (b1.T + toly) < b2.B){
			if(b1.R > b2.L && b1.R < b2.R){
				coll.R = true;
				coll.Any = true;
			}
			if(b1.L < b2.R && b1.L > b2.L){
				coll.L = true;
				coll.Any = true;
			}
		}
		return (coll.Any) ? coll : false;
	},
	handleCollition: function(coll,myBonds,theirBonds){
		var posy = myBonds.T, 
			posx = myBonds.L;
		if(coll.B){
			posy = theirBonds.T - this.size[1];
			this.mov.y.vel = (this.mov.y.vel > 0 ) ? 0 : this.mov.y.vel;
			this.isMoving[1] = false;
		}
		if(coll.T){
			posy = theirBonds.B;
			this.mov.y.vel = (this.mov.y.vel < 0 ) ? 0 : this.mov.y.vel;
		}
		if(coll.R){
			posx = theirBonds.L - this.size[0];
			this.mov.x.vel = (this.mov.x.vel < 0 ) ? 0 : this.mov.x.vel;
			this.isMoving[0] = false;
		}
		if(coll.L){
			posx = theirBonds.R;
			this.mov.x.vel = (this.mov.x.vel > 0 ) ? 0 : this.mov.x.vel;
			this.isMoving[0] = false;
		}
		this.pos = [Math.round(posx),Math.round(posy)];
	}
});
