import { Potato } from '$lib/server/structs/potato.js';

export const load = async (event) => {
	const rankings = (await Potato.getRankings()).unwrap();
	const you = rankings.find((r) => r.username === event.locals.account?.data.username);
	return {
		rankings,
		you: you
	};
};
