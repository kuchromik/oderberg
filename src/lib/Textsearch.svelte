<script>
    import { onMount } from 'svelte';

    let searchString = '';

    // Function to search for the string in comments and answers
    function search() {
        // Logic to search for the string in comments and answers
        // ...
    }

    // Trigger the search function when the component is mounted
    onMount(search);
</script>
<div class="searchinput">
<input type="text" bind:value={searchString} placeholder="Nach Begriff suchen" />

<button on:click={search}>Suche starten</button>
</div>

<style>
    .searchinput {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
        
    }

    input {
        padding: 5px;
        border: 1px solid #ccc;
        border-radius: 5px;
        font-size: 1.2rem;
    }

    button {
        padding: 5px 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
        font-size: 1.2rem;
        background-color: #f0f0f0;
    }
</style>