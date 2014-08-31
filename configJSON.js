var config = {
	images: [
		{src:"img/ground.jpg",name:"randomImage"},
		{src:"img/luigi-sprites.png",name:"luigi"},
		{src:"img/blocks.png",name:"block"},
		{src:"img/enemies.png",name:"enemies"},
		"img/hills.png",
		"img/gameover.png",
		"img/clouds.png"
	],
	example: [
		"stuff01",
		"stuff02",
		"stuff03",
		"stuff04"
	],
	players: [
		{
			name: "player01",
			image: "luigi",
			size:[16,22],
			gravity: 4,
			jumpForce: 30,
			floor: 300,
			controls: 1,
			limit: true,
			collide: {
				qBlock: true,
				spike: function(){
					console.log("outch!")
				}
			},
			sprite: {
				R:{
					stand:{ delay:0, steps:[[234,0]]},
					walk:{  delay:2, steps:[[234,0],[263,0]]},
					run:{   delay:1, steps:[[321,0],[348,0]]},
					jump:{  delay:0, steps:[[294,30]]},
					fall:{  delay:0, steps:[[264,30]]},
					shoot:{ delay:0, steps:[[405,60]]}
				},
				L:{
					stand:{ delay:0, steps:[[198,0]]},
					walk:{  delay:2, steps:[[198,0],[169,0]]},
					run:{   delay:1, steps:[[111,0],[84,0]]},
					jump:{  delay:0, steps:[[139,30]]},
					fall:{  delay:0, steps:[[168,30]]},
					shoot:{ delay:0, steps:[[27,60]]}
				},
				dead:{  delay:3, steps:[[0,57],[432,57]]}
			},
		}
	],
	sprites: [
		{
			name: "test01",
			pos: [0,0],
			image: "randomImage",
			size: [20, 20],
			gravity: 1,
			yBreaks: 0,
			yVel: 1
		},
		{
			name: "test02",
			pos: [0,0],
			color: "black",
			size: [20, 20],
			gravity: 5,
			yBreaks: 1,
			yVel: 1
		},
		{
			name: "qBlock",
			image: "block",
			size:[16,16],
			sprite: {
				stand:{ delay:1, steps:[[0,0],[0,0],[0,0],[0,0],[0,0],[51,0],[34,0],[17,0]]}
			}
		},
		{
			name: "spike",
			image: "enemies",
			collide: {
				qBlock:true,
				tube: true,
				player01: true,
				deadly:true
			},
			gravity: 3,
			jumpForce:5,
			size:[18,18],
			floor: 300,
			sprite: {
				L:{
					stand:{ delay:5, steps:[[0,77],[19,77]]},
					dead: { delay:0, steps:[[94,77]]}
				},
				R:{
					stand:{ delay:5, steps:[[459,320],[478,320]]},
					dead: { delay:0, steps:[[365,320]]}
				}
			}
		}
	],
	levels: [
		{
			name: "level_0",
			size: [600,400],
			color:"green",
			sprites: [
				{from:"spike",pos: [100,100],active: true},
				{from:"qBlock",pos: [50,164],active: true},
				{from:"qBlock",pos: [50,180],active: true},
				{from:"qBlock",pos: [66,180],active: true},
				{from:"qBlock",pos: [82,220],active: true},
				{from:"qBlock",pos: [98,284],active: true},
				{from:"qBlock",pos: [98,260],active: true}
			],
			players: [
				{from:"player01",follow:true,active: true}
			]
		}
	]

}