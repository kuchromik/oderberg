<script>
    import { db } from "../../firebase";
    import { authHandlers, authStore } from "../../store/store";
    // @ts-ignore
    import { doc, updateDoc } from "@firebase/firestore";
    import Merkliste from "$lib/Merkliste.svelte";
    import ChooseLocation from "$lib/ChooseLocation.svelte";
    
    

    // @ts-ignore
    let todoList = [];
    
    let pseudo = "";
    let pseudoinput = "";

    authStore.subscribe((curr) => {
        // @ts-ignore
        todoList = curr.data.todos;
        pseudo = curr.data.pseudo;
    });

    async function addPseudonym() {
    
        // @ts-ignore
        pseudo = pseudoinput;

        try {
            // @ts-ignore
            const userRef = doc(db, "users", $authStore.user.uid);
            await updateDoc(
                userRef,
                {
                    // @ts-ignore
                    todos: todoList,
                    pseudo: pseudo
                }
            );
        } catch (err) {
            console.log("Fehler beim speichern des Pseudonyms");
            pseudoinput = "";
        }

        window.location.href = "/dashboard";

    }

// showimages

	/** @type {import('./$types').PageData} */
	// @ts-ignore
	export let data;
  // @ts-ignore
  let urlArray = Object.values(data);
  
</script>
<div class="headerContainer">
        {#if pseudo}
        <h3>Hallo {pseudo}</h3>
        <button on:click={authHandlers.logout}>
        <i class="fa-solid fa-right-from-bracket" />
        <p>Logout</p></button>
        {:else if !$authStore.loading}
        <h3>Willkommen</h3>
        <h4>Welchen Namen möchtest Du hier verwenden?</h4>
        <form>
        <label>
        <p class={pseudoinput ? " above" : " center"}>Pseudonym</p>
        <input bind:value={pseudoinput} type="text" placeholder="Pseudonym" />
        </label>
        <button on:click={addPseudonym}>Speichern</button>
        </form>
        {/if}
</div>

{#if pseudo}
<ChooseLocation />
<br>
<Merkliste />
{/if}
<style>

form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }


    form input {
        width: 100%;
    }


    form label {
        position: relative;
        border: 1px solid black;
        border-radius: 5px;
    }

    form input {
        border: none;
        background: white;
        color: black;
        padding: 14px;
    }

    form input:focus {
        border: none;
        outline: none;
    }

    form label:focus-within {
        border-color: black;
    }

    form button {
        background: grey;
        color: white;
        border: none;
        padding: 14px 0;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1rem;
        display: grid;
        place-items: center;
    }

    form button:hover {
        background: black;
    }

     .above,
    .center {
        position: absolute;
        transform: translateY(-50%);
        pointer-events: none;
        color: white;
        border-radius: 4px;
        padding: 0 6px;
        font-size: 0.8rem;
    }

    .above {
        top: 0;
        left: 24px;
        background: grey;
        border: 1px solid darkgrey;
        font-size: 0.7rem;
    }

    .center {
        top: 50%;
        left: 6px;
        border: 1px solid transparent;
        opacity: 0;
    }

</style>
