import { fail } from '@sveltejs/kit';

export const POST = (event) => {
    throw fail(405, { message: 'Method Not Allowed' });
};