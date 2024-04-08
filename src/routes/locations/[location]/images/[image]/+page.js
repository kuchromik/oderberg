/** @type {import('./$types').PageLoad} */
export function load({ params }) {
    console.log("Params", params);
	return {
		post: {
			location: params.location,
			image: params.image,
		}
	};
}