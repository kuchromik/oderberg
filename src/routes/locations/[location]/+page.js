/** @type {import('./$types').PageLoad} */
export function load({ params }) {
	return {
		post: {
			title: params.location,
			content: params.location
		}
	};
}