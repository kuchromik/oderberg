<script>
	import ChooseLocation from '$lib/ChooseLocation.svelte';

    /** @type {import('./$types').PageData} */
	export let data;
	
</script>
<center>
    <h1>Einzelbild</h1>
    <p>{data.post.location}</p>
    <p>{data.post.image}</p>
</center>
