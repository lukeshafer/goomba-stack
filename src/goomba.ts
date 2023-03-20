import Matter from 'matter-js';

export function gooma_anim(props: {
	canvas: HTMLCanvasElement;
	goombas: {
		path: string;
		width: number;
		height: number;
	}[];
	highscore: number;
	score: number;
	setWinner: (winner: number) => void;
}) {
	props.highscore = Number(localStorage.getItem('highscore'));
	if (props.highscore === 0) localStorage.setItem('highscore', '10000000');
	// module aliases
	const Engine = Matter.Engine,
		Events = Matter.Events,
		Render = Matter.Render,
		Runner = Matter.Runner,
		Bodies = Matter.Bodies,
		Composite = Matter.Composite;

	// create an engine
	const engine = Engine.create();

	let w = window.innerWidth;
	let h = window.innerHeight;

	// create a renderer
	const render = Render.create({
		element: document.body,
		engine: engine,
		canvas: props.canvas,

		options: {
			width: w,
			height: h,
			background: 'transparent',
			wireframes: false,
			pixelRatio: window.devicePixelRatio
		}
	});

	// create two boxes and a ground
	const ground = Bodies.rectangle(w / 2, h, w, h / 4, {
		isStatic: true,
		render: {
			fillStyle: 'transparent'
		}
	});

	const collider = Bodies.rectangle(w / 2, 0, w, 4, {
		isSensor: true,
		isStatic: true,
		render: {
			strokeStyle: '#00FF3F',
			fillStyle: '#00FF3F',
			lineWidth: 1
		}
	});

	let index = Math.random() * props.goombas.length;

	let fastClicks = 0;
	let locked = false;

	const screenRatio = h / 6000;

	const addGoomba = (x: number, y: number) => {
		if (locked) {
			fastClicks++;
			if (fastClicks > 1) {
				alert("Don't click so fast!");
			}
			return;
		}
		props.score = props.score + 1;
		locked = true;
		const imgHeight = props.goombas.at(index)?.width || 50 * screenRatio;
		const imgWidth = props.goombas.at(index)?.width || 50 * screenRatio;
		const goomH = imgHeight * screenRatio;
		const goomW = imgWidth * screenRatio; // h is used here intentionally

		if (y < goomH) y = goomH + 10;

		const vertex = [
			[
				{ x: 0, y: goomH },
				{ x: 0, y: goomW * 0.25 },
				{ x: goomW * 0.25, y: 0 },
				{ x: goomW * 0.75, y: 0 },
				{ x: goomW, y: goomH * 0.25 },
				{ x: goomW, y: goomH }
			]
		];

		let goomba = Bodies.fromVertices(x, y, vertex, {
			render: {
				sprite: {
					texture: `/goomba/${props.goombas.at(index)?.path}`,
					xScale: screenRatio,
					yScale: screenRatio
				}
			}
		});
		Composite.add(engine.world, goomba);
		index = Math.random() * props.goombas.length;
		setTimeout(() => (locked = false), 200);
	};

	// add all of the bodies to the world
	Composite.add(engine.world, [ground, collider]);

	let winner = false;
	Events.on(engine, 'collisionStart', function (event) {
		var pairs = event.pairs;

		for (var i = 0, j = pairs.length; i != j; ++i) {
			var pair = pairs[i]!;

			if (pair.bodyA === collider || pair.bodyB === collider) {
				if (!winner) {
					winner = true;
					const finalScore = props.score;
					props.setWinner(finalScore);
					if (finalScore < props.highscore) {
						localStorage.setItem('highscore', `${finalScore}`);
					}
				}
			}
		}
	});

	// run the renderer
	Render.run(render);

	// create runner
	var runner = Runner.create();

	// run the engine
	Runner.run(runner, engine);

	return {
		add: addGoomba
	};
}
