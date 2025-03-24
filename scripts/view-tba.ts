import { Event } from '../src/lib/server/utils/tba';
import { openStructs } from '../src/lib/server/cli/struct';
import { Struct } from 'drizzle-struct/back-end';
import { DB } from '../src/lib/server/db';

export default async () => {
	await openStructs();
	await Struct.buildAll(DB);
	const data = (await Event.getEvent('2025caoc')).unwrap();
	const matches = (await data.getMatches()).unwrap();
};
