export const GET = (event) => {
    return new Response('pong', {
        status: 200,
        headers: {
            'Content-Type': 'text/plain',
        }
    });
};