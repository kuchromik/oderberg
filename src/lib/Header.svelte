<script>
    import { page } from '$app/stores';
    import { authStore, authHandlers } from "../store/store";
    import { db } from "../firebase";
    import { doc, setDoc } from "@firebase/firestore";


    let pseudo = "";
    let todoList = [];
    let lastViewedImage = "";

    authStore.subscribe((curr) => {
        // @ts-ignore
        pseudo = curr.data.pseudo;
        todoList = curr.data.todos;
        lastViewedImage = curr.data.lastViewedImage;
    });

    let localName = import.meta.env.VITE_LOCAL_NAME;

    
    async function saveTodosAndLogout() {
        try {
            // @ts-ignore
            const userRef = doc(db, "users", $authStore.user.uid);
            await setDoc(
                userRef,
                {
                    // @ts-ignore
                    todos: todoList,
                    lastViewedImage: lastViewedImage
                },
                { merge: true }
            );
           
        } catch (err) {
            console.log(err);
        }
        authHandlers.logout()
    }
    
    

</script>
<div class="headerbox">
    <div class="logstatus">
        {#if pseudo}
        <p style="font-size: 0.8rem;">angemeldet als {pseudo}</p>
        <button on:click|preventDefault={saveTodosAndLogout}>
        <i class="fa-solid fa-right-from-bracket" />
        <p>Abmelden</p></button>
        {/if}

    </div>
    <center>
        {#if pseudo}
        <a href="/dashboard"><h1 id="wappentext">Willkommen im alten {localName}</h1></a>
        {:else}
        <a href="/"><h1 id="wappentext">Willkommen im alten {localName}</h1></a>
        {/if}
        <h3 style="color: gray;">Ortsansichten aus früherer Zeit</h3>
        <!-- some words of welcome if not logged in and on main page -->
        {#if !pseudo && $page.url.pathname === "/"} 
        <br>
        <blockquote>
            <b>
            &raquo;Wer in der Zukunft lesen will, muss in der Vergangenheit blättern.&laquo;
            </b>
            <i><a href="https://de.wikipedia.org/wiki/Andr%C3%A9_Malraux" target="_blank">André Malraux</a></i>
        </blockquote>
       
        {/if}
    </center>
</div>
<style>
    center {
        padding: .5rem;
    }
    #wappentext {
        font-family: 'Berkshire Swash', cursive;
        font-size: 3rem;
    }

    a {
        color: #000000;
        text-decoration: none;
    }

    .headerbox {
       position: relative;
    }

    .logstatus {
        position: absolute;
        top: 0;
        right: 0;
        padding: 2px;
        
        color: grey;
        padding: 0rem;

        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 1rem;
    }

    .logstatus button {
			background: dimgrey;
			color: white;
			margin-top: .5rem;
			padding: 4px;
			border: none;
			border-radius: 4px;
			font-weight: 500;
			display: flex;
			align-items: center;
			gap: .5rem;
			cursor: pointer;
			}
			.logstatus button:hover {
			background: black;
			}

</style>