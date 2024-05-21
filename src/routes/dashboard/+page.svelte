<script>
    import { authHandlers, authStore } from "../../store/store";
    import Merkliste from "$lib/Merkliste.svelte";
    import ChooseLocation from "$lib/ChooseLocation.svelte";
    import Textsearch from "$lib/Textsearch.svelte";

    let todoList = [];
    let pseudo = "";
   
    
    authStore.subscribe((curr) => {
        
        todoList = curr.data.todos;
        pseudo = curr.data.pseudo;
    });

</script>

<div class="headerContainer">
        {#if pseudo}
        <h3>Hallo {pseudo}</h3>
        <button on:click|preventDefault={authHandlers.logout}>
        <i class="fa-solid fa-right-from-bracket" />
        <p>Logout</p></button>
        {/if}
</div>

{#if pseudo}
    <ChooseLocation />
    <br>
    <Textsearch />
    <br>
    <Merkliste />
{/if}
<style>
</style>
