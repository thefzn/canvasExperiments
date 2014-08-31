var fzn = fzn || {};
fzn.Sprite = function (params,parent){
	var params = params || false,
		parent = parent || false;

	// Sprite Options vars
	this.sprite = params.sprite || false;
	this.jumpForce = params.jumpForce || 30;
	this.walkSpeed = params.walkSpeed || 3;

	// Sprite Status vars
	this.action = "stand";
	this.active = {};
	this.alive = true;
	this.dir = "R";
	this.frame = 0;
	this.userAction = false;

	if(params){
		this.Sprite(params,parent);
	}
}
fzn.Sprite.prototype = new fzn.Collidable();
fzn.Sprite.prototype.extend({
	Sprite: function(params,parent){
		this.Collidable(params,parent);

		this.action = params.action || this.action;
		this.dir = params.dir || this.dir;
		this.sprite = params.sprite || this.sprite;
		this.jumpForce = params.jumpForce || this.jumpForce;
		this.walkSpeed = params.walkSpeed || this.walkSpeed;

		this.mapDirections();
	},
	eachFrame: function(){
		var dir = this.sprite[this.dir],
			jump = (this.isMoving[1]) ? this.mov.y.vel : false,
			walk = (this.isMoving[0]) ? Math.abs(this.mov.x.vel) : false;
		if(!this.sprite)
			return;
		this.checkInput();

		// Set Active Action
		this.active =
			(!this.alive) ?
				dir["dead"] || dir["stand"]
			:
				(this.userAction) ?
					dir[this.action] || dir["jump"] || dir["walk"] || dir["stand"]
				:
					(jump && jump < 0) ?
						dir["jump"] || dir["walk"] || dir["stand"]
					:
						(jump && jump > 0) ?
							dir["fall"] || dir["jump"] || dir["walk"] || dir["stand"]
						:
							(walk && walk > 5) ?
								dir["run"] || dir["walk"] || dir["stand"]
							:
								(walk) ?
									dir["walk"] || dir["stand"]
								:
									dir["stand"];
		// Set Active Action Frame
		if(this.active.delay != 0 && this.game.turn % this.active.delay == 0){
			this.frame++;
		}
		this.frame = (this.frame >= this.active.steps.length) ? 0 : this.frame;
		this.imagePos = this.active.steps[this.frame].slice();
	},
	checkInput: function(){},
	please:function(action,p){
		var target = this.actions[action] || false,
			p = p || false;
		if(this.alive){
			target.call(this,p);
		}
	},
	actions:{
		jump: function(){
			if(!this.isMoving[1]){
				this.frame = 0;
				this.mov.y.vel = 0 - this.jumpForce;
			}
		},
		turn: function(p){
			var dir;
			if(p == "L" || p == "R"){
				this.dir = p;
				dir = (p == "R") ? 1 : -1;
				this.walkSpeed = Math.abs(this.walkSpeed) * dir;
			}
		},
		move: function(){
			this.mov.x.vel += this.walkSpeed;
		},
		die: function(){
			/*
			if(!this.dying && !this.inmune){
				this.dying = true;
				this.floor = this.level.size[1] + this.size[1] + 10;
				this.velDown = 0-this.jumpForce;
				this.action = "dead";
				this.onDie(this);
			}
			*/
		},
		shoot: function(){
			/*
			var bName,
				pos = [],
				params = {};
			if(this.shoot && !this.shootLag){
		pos[0] = (this.dir == "R") ? this.pos[0] + this.size[0] - 5 : this.pos[0] + 5;
		pos[1] = this.pos[1] + (this.size[1] / 2) - 5;

		if(typeof this.shoot == "object"){
			bName = this.shoot.name || false;
			params = this.shoot.params;
		}else{
			bName = this.shoot
		}
		params.pos = pos;
		params.dir = this.dir;
		this.shooting = true;
		this.shootLag = true;
		this.level.add("sprite",bName,false,params,false);
			}
			*/
		},
		blink: function(){
			/*
			if(this.game.turn % 2 == 0){
				this.blinking = (this.blinking) ? false : true;
			}
			*/
		}
	},
	mapDirections: function(){
		var tmp = {},
			item;
		if(!this.sprite){
			return;
		}
		tmp.L = this.sprite.L || {};
		tmp.R = this.sprite.R || {};

		for(item in this.sprite){
			if(item != "L" && item != "R"){
				tmp.L[item] = this.sprite[item];
				tmp.R[item] = this.sprite[item];
			}
		}
		this.sprite = tmp;
	}
});
