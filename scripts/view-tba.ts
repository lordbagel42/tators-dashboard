import { Event } from '../src/lib/server/utils/tba';
import { openStructs } from '../src/lib/server/cli/struct';
import { Struct } from 'drizzle-struct/back-end';
import { DB } from '../src/lib/server/db';
import { toType, toZodType } from '../src/lib/utils/generate-type';
import fs from 'fs';
import path from 'path';

export default async () => {
	await openStructs();
	await Struct.buildAll(DB);
	const data = (await Event.getEvent('2025utwv')).unwrap();
	const m = (await data.getMatches()).unwrap().find((m) => m.teams.includes(2122));
	// console.log(toType(m));
	fs.writeFileSync(
		path.join(__dirname, 'data.ts'),
		`
		import { z } from 'zod';
		type Match2025 = ${toType(m?.tba)};

		const match2025Schema = ${toZodType(m?.tba)};
	`
	);
};
