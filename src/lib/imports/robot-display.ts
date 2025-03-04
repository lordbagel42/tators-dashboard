import { browser } from '$app/environment';
import { Navbar } from '$lib/model/navbar';

let eventKey = 'unknown';
if (browser) eventKey = location.pathname.split('/')[3];

Navbar.addSection({
	name: 'Robot Display',
	links: [
		{
			name: 'Event',
			href: '/dashboard/event/' + eventKey,
			icon: 'event',
			type: 'material-icons'
		},
		{
			name: 'Pit Scouting',
			href: '/dashboard/event/' + eventKey + '/pit-scouting',
			icon: 'question_answer',
			type: 'material-icons'
		},
		{
			name: 'Edit Pit Scouting',
			href: '/dashboard/event/' + eventKey + '/create-pit-scouting',
			icon: 'edit',
			type: 'material-icons'
		}
	],
	priority: 0
});
