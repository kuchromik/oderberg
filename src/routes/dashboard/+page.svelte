<script>
    import { db } from "../../firebase";
    import { authHandlers, authStore } from "../../store/store";
    // @ts-ignore
    import { getDoc, doc, setDoc, updateDoc } from "@firebase/firestore";
    import Merkliste from "$lib/Merkliste.svelte";
    import ShowImages from "$lib/ShowImages.svelte";
    import Upload from "$lib/Upload.svelte";
    

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
        }

        pseudoinput = "";
    }

// showimages

	/** @type {import('./$types').PageData} */
	// @ts-ignore
	export let data;
  // @ts-ignore
  let urlArray = Object.values(data);
  
</script>
<div class="mainContainer">
    <div class="headerContainer">
        {#if pseudo}
        <h2>Hallo {pseudo}</h2>
        <div class="headerBtns">
        <button on:click={authHandlers.logout}>
        <i class="fa-solid fa-right-from-bracket" />
        <p>Logout</p></button>
        </div>
    
{:else if !$authStore.loading}
<div class="headerContainer2">
    <h3>Willkommen</h3>
    <h4>Welchen Namen möchten Sie hier verwenden?</h4>
    <div class="headerBtns">
        <input bind:value={pseudoinput} type="text" placeholder="Pseudonym" />
        <button on:click={addPseudonym}>Speichern</button>
    </div>
</div>
{/if}
</div>
</div>
{#if pseudo}
<Upload />
<br>
<ShowImages />
<br>
<Merkliste />
{/if}
<style>
    .mainContainer {
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding: 24px;
        width: 100%;
        max-width: 1280px;
        margin: 0 auto;
    }

    .headerContainer {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
    }

    .headerContainer2 {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 24px;
        margin: auto;
    }

    .headerBtns {
        display: flex;
        align-items: center;
        gap: 14px;
    }

    .headerContainer button {
        background: #003c5b;
        color: white;
        padding: 10px 18px;
        border: none;
        border-radius: 4px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
    }

    .headerContainer button i {
        font-size: 1.1rem;
    }

    .headerContainer button:hover {
        opacity: 0.7;
    }
</style>
