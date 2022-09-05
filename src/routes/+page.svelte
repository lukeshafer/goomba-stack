<script lang="ts">
	import type { PageData } from './$types';

	import Matter from 'matter-js';
	import { onMount } from 'svelte';
	import { binding_callbacks } from 'svelte/internal';
	import '@fontsource/silkscreen';

	export let data: PageData;
	const { goombas } = data;

	let canvas: HTMLCanvasElement;

	let addGoomba: (x: number, y: number) => void;
	let count = 0;

	let winner = false;
	let finalCount = 0;
	let highscore = 10000000;

	onMount(async () => {
		highscore = Number(localStorage.getItem('highscore'));
		if (highscore === 0) localStorage.setItem('highscore', '10000000');
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
			canvas,

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

		let index = Math.random() * goombas.length;

		let fastClicks = 0;
		let locked = false;

		const screenRatio = h / 6000;

		addGoomba = (x: number, y: number) => {
			if (locked) {
				fastClicks++;
				if (fastClicks > 1) {
					alert("Don't click so fast!");
				}
				return;
			}
			count++;
			locked = true;
			const imgHeight = goombas.at(index)?.width || 50 * screenRatio;
			const imgWidth = goombas.at(index)?.width || 50 * screenRatio;
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
						texture: `/goomba/${goombas.at(index)?.path}`,
						xScale: screenRatio,
						yScale: screenRatio
					}
				}
			});
			Composite.add(engine.world, goomba);
			index = Math.random() * goombas.length;
			setTimeout(() => (locked = false), 200);
		};

		// add all of the bodies to the world
		Composite.add(engine.world, [ground, collider]);

		Events.on(engine, 'collisionStart', function (event) {
			var pairs = event.pairs;

			for (var i = 0, j = pairs.length; i != j; ++i) {
				var pair = pairs[i];

				if (pair.bodyA === collider || pair.bodyB === collider) {
					if (!winner) {
						winner = true;
						finalCount = count;
						if (finalCount < highscore) {
							localStorage.setItem('highscore', `${finalCount}`);
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
	});

	const handleMouse = (evt: MouseEvent) => {
		const x = evt.x;
		const y = evt.y;

		addGoomba(x, y);
	};
</script>

<canvas bind:this={canvas} on:click={handleMouse} />

<div>
	<h1>Goomba Stack!</h1>
	<h2>Score: {count ? count : ''}</h2>
	{#if highscore < 100000}
		<h2>High score: {highscore}</h2>
	{/if}
</div>

{#if winner}
	<div class="win">
		<p>Winner!!!!</p>
		<p>Score: {finalCount} goombas!</p>
		{#if finalCount < highscore}
			<p>New high score!</p>
		{/if}
		<button on:click={() => location.reload()}>Play Again?</button>
	</div>
{/if}

<style>
	:global(body) {
		margin: 0;
		overflow: hidden;
		background: url('/background.png');
		background-size: auto 100%;
		font-family: 'Silkscreen';
		user-select: none;
	}

	button {
		margin-top: 1em;
		font-family: 'Silkscreen';
		font-size: inherit;
		background: #99ffdf;
		border: none;
	}

	div {
		position: absolute;
		top: 5%;
		left: 5%;
		color: white;
	}

	.win {
		display: flex;
		gap: 0.1em;
		width: 100vw;
		top: 0;
		left: 0;
		height: 100vh;
		font-size: 300%;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.win p {
		margin: 0;
		background: black;
	}
</style>
