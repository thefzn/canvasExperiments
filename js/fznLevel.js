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
	},
    beforeRedraw: function(){
        var fP = this.followPlayer,
            pPos = [],
            moved = [],
            p;
        if(fP){
            p = this.sprites[fP];
            pPos[0] = p.pos[0] - (this.pos[0]+(this.game.cnv.width/2));
            pPos[1] = p.pos[1] - (this.pos[1]+(this.game.cnv.height/2));
            moved[0] = this.pos[0] + pPos[0];
            moved[1] = this.pos[1] + pPos[1];
            this.pos[0] = (moved[0] > (this.size[0]-this.game.cnv.width)) ?
                                0 - (this.size[0]-this.game.cnv.width)
                            :
                                (moved[0] >= 0) ?
                                    0 - moved[0]
                                :
                                    0;
            this.pos[1] = (moved[1] > (this.size[1]-this.game.cnv.height)) ?
                                0 - (this.size[1]-this.game.cnv.height)
                            :
                                (moved[1] >= 0) ?
                                    0 - moved[1]
                                :
                                    0;
        }
    }
});
