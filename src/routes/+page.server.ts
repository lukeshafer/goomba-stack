import * as fs from 'fs';
import sizeOf from 'image-size';
import type { PageServerLoad } from './$types';

const goomba: {
	path: string;
	height: number;
	width: number;
}[] = [];

export const load: PageServerLoad = async () => {
	const gommabs = fs.readdirSync('static/goomba');

	gommabs.forEach((gomb, index) => {
		const dimensions = sizeOf(`static/goomba/${gomb}`);
		goomba.push({
			path: gomb,
			height: dimensions.height || 500,
			width: dimensions.width || 300
		});
	});

	return {
		goombas: goomba
	};
};
