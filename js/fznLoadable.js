var fzn = fzn || {};
fzn.Loadable = function (canvas,parent,params){
	this.loadingQueue = 0;
	this.pos = [0,0];
}
fzn.Loadable.prototype = new fzn.Object();
fzn.Loadable.prototype.extend({
	resourceLoaded: function(){
		this.loadingQueue--;
		if(this.loadingQueue <= 0){
			this.loadingQueue = 0;
			this.onLoad(this);
		}
	},
	onLoad: function(){
		"Load Completed";
	},
	loadResource: function(res){
		var self = this;
		this.loadingQueue++;
		if(res instanceof fzn.Loadable){
			res.onLoad = function(){
				self.resourceLoaded();
			}
		}else{
			res.addEventListener("load", function() {
				self.resourceLoaded();
			}, false);
		}
		
	}
});
