var fzn = fzn || {};
fzn.Level = function (params,parent){
	var params = params || false;
	var parent = parent || false;
	if(params){
		this.Level(params,parent);
	}
}
fzn.Level.prototype = new fzn.Stage();
fzn.Level.prototype.extend({
	Level: function(params,parent){
		this.Stage(params,parent)
	}
});
