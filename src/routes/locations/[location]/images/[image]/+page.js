/** @type {import('./$types').PageLoad} */
export function load({ params }) {
    
	return {
		post: {
			location: params.location,
			image: params.image,
		}
	};
}