<script>
    import { authStore } from "../store/store";
    let pseudo = "";
    authStore.subscribe((curr) => {
        // @ts-ignore
        pseudo = curr.data.pseudo;
    });
</script>
<center>
    {#if pseudo}
    <a href="/dashboard"><h1 id="wappentext">Willkommen im alten Oderberg</h1></a>
    {:else}
    <a href="/"><h1 id="wappentext">Willkommen im alten Oderberg</h1></a>
    {/if}
</center>

<style>
    center {
        padding: 1rem;
    }
    #wappentext {
        font-family: 'Berkshire Swash', cursive;
        font-size: 3rem;
    }

    a {
        color: #000000;
        text-decoration: none;
    }
</style>