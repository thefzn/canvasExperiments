var fzn = fzn || {};
fzn.Stage = function (){
	this.sprites = {};
	this.active = {};
	this.params = {};
	this.instances = {};
	this.players = [];
	this.followPlayer = false;
	this.size = [0,0];
}
fzn.Stage.prototype = new fzn.Drawable();
fzn.Stage.prototype.extend({
	Stage: function(params,parent){
		this.params = params || false;
		this.Drawable(params,parent);
	},
	start: function(){
		var sprites = this.params.sprites || [],
			players = this.params.players || [];
		this.size = this.params.size || [this.game.cnv.width,this.game.cnv.height];
		this.generateSprites(players,"players");
		this.generateSprites(sprites);
	},
	generateSprites: function(sprites,type){
		var ss = sprites || [],
			type = type || "sprites",
			i = 0,
			len = ss.length || 0,
			s,itm,a,tmp,f;
		for(; i < len; i++){
			s = ss[i];
			itm = this.game.generate([type,s.from],s);
			if(!itm || !(itm instanceof fzn.Sprite))
				continue;
			itm.setParent(this);
			this.sprites[itm.UID] = itm;
			a = s.active || false;
			if(a){
				this.activate(itm.UID);
				this.registerType(itm);
				f = itm.follow || false;
				if(f){
					this.followPlayer = itm.UID;
				}
			}
			if(type == "players"){
				tmp = "," + this.players.toString + ",";
				if(tmp.indexOf("," + itm.UID + ",") < 0){
					this.players.push(itm.UID)
				}
			}
		}
	},
	afterRedraw: function(){
		var itm;
		for(itm in this.active){
			if(this.active[itm])
				this.sprites[itm].go();
		}
	},
	activate: function(itm,del){
		var id = (itm) ? itm.id || itm || false : false,
			del = del || false;
		if(!id)
			return;
		if(del){
			this.active[id] = false;
		}else{
			this.active[id] = true;
		}
	},
	registerType: function(itm){
		var name = itm.name || false,
			id = itm.UID || false,
			found = false,
			itm, check;
		if(!id || !name)
			return;
		this.instances[name] = this.instances[name] || {};
		this.instances[name][id] = true;
	},
	getActiveInstancesOf: function(instance){
		var res = [],
			instList = this.instances[instance],
			id;
		for(id in instList){
			res.push(this.sprites[id])
		}
		return res;
	}
});
