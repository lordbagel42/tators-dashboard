import { browser } from '$app/environment';
import { Navbar } from '$lib/model/navbar';
import type { TBAEvent } from 'tatorscout/tba';

export default (event: TBAEvent) => {
	Navbar.addSection({
		name: 'Robot Display',
		links: [
			{
				name: 'Event',
				href: '/dashboard/event/' + event.key,
				icon: 'event',
				type: 'material-icons'
			},
			{
				name: 'Pit Scouting',
				href: '/dashboard/event/' + event.key + '/pit-scouting',
				icon: 'question_answer',
				type: 'material-icons'
			},
			{
				name: 'Edit Pit Scouting',
				href: '/dashboard/event/' + event.key + '/edit-pit-scouting',
				icon: 'edit',
				type: 'material-icons'
			}
		],
		priority: 0
	});

	const s1 = Navbar.getSections().data.find((s) => s.priority === 1);
	if (s1) Navbar.removeSection(s1);

	Navbar.addSection({
		name: `${event.name} Dashboard`,
		priority: 1,
		links: [
			{
				name: 'Matches',
				href: `/dashboard/event/${event.key}/matches`,
				icon: 'view_list',
				type: 'material-icons'
			},
			{
				name: 'Team Compare',
				href: `/dashboard/event/${event.key}/compare`,
				icon: 'compare',
				type: 'material-icons'
			},
			{
				name: 'Checlist',
				href: `/dashboard/event/${event.key}/checklist`,
				icon: 'list',
				type: 'material-icons'
			},
			{
				name: 'Archived Matches',
				href: `/dashboard/event/${event.key}/archived-matches`,
				icon: 'archive',
				type: 'material-icons'
			}
		]
	});

	Navbar.addSection({
		name: 'Other',
		priority: 2,
		links: [
			{
				name: 'Potato Leaderboard',
				href: '/dashboard/potato',
				icon: 'leaderboard',
				type: 'material-icons'
			},
			{
				name: 'Potato Logs',
				href: '/dashboard/potato/logs',
				icon: 'history',
				type: 'material-icons'
			}
		]
	});
};
