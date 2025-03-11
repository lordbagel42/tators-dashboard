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
				href: '/dashboard/event/' + event.key + '/create-pit-scouting',
				icon: 'edit',
				type: 'material-icons'
			}
		],
		priority: 0
	});

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
				name: 'Archived Matches',
				href: `/dashboard/event/${event.key}/archived-matches`,
				icon: 'archive',
				type: 'material-icons',
			}
		]
	});
};
