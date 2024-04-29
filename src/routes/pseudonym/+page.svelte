<script>
    import { db } from "../../firebase";
    import { authHandlers, authStore } from "../../store/store";
    // @ts-ignore
    import { doc, updateDoc, getDocs, collection } from "@firebase/firestore";
    import { goto } from '$app/navigation';

    
    let userList = [];
    let pseudoList = [];

    async function getUsers() {
        const userRef = collection(db, "users");
        const querySnapshot_loc = await getDocs(userRef);
        let userListInsideGetDocs = [];
        querySnapshot_loc.forEach((doci) => {
            let user = { ...doci.data(), id: doci.id};
            userListInsideGetDocs = [user, ...userListInsideGetDocs]; 
            })
    
    userList = userListInsideGetDocs;
    userList.forEach((user) => {
        pseudoList.push(user.pseudo);
    })

    }

    getUsers();

    
    let currentMail = "";
    let pseudo = "";
    let pseudoinput = "";
    let alreadyExists = false;

    authStore.subscribe((curr) => {
        pseudo = curr.data.pseudo;
        currentMail = curr.email;
    });

    async function addPseudonym() {
    
        // @ts-ignore
        pseudo = pseudoinput;

        if (pseudoList.includes(pseudo)) {
            // Pseudo exists in userList
            // Add your logic here
            alreadyExists = true;
            pseudo = "";
            goto("/pseudonym");
        }
        
        else {
            // Pseudo does not exist in userList
            // Add your logic here
            try {
            // @ts-ignore
            const userRef = doc(db, "users", $authStore.user.uid);
            await updateDoc(
                userRef,
                {
                    pseudo: pseudo
                }
            );
            let dataToSetToStore;
            dataToSetToStore = {
                        email: currentMail,
                        pseudo: pseudo,
                        todos: [],
                    };
            authStore.update((curr) => {
                return {
                    ...curr,
                    data: dataToSetToStore,
                    loading: false,
                };
                });
            } catch (err) {
                console.log("Fehler beim speichern des Pseudonyms", err);
                pseudoinput = "";
                }
            goto("/dashboard");
        }

    }
</script>
<div class="headerContainer">
       
        {#if alreadyExists == false}
        <h3>Willkommen</h3>
        <h4>Welches Pseudonym möchtest Du hier verwenden?</h4>
        <p>Dein Pseudonym wird an den Bildern und Kommentaren vermerkt, die Du einstellst.</p>
        <p>Es ist nicht zu empfehlen, Deinen echten Namen zu verwenden.</p>
        <form>
        <label>
        <p class={pseudoinput ? " above" : " center"}>Pseudonym</p>
        <input bind:value={pseudoinput} type="text" placeholder="Pseudonym" />
        </label>
        <button on:click|preventDefault={addPseudonym}>Speichern</button>
        </form>
        {/if}
        {#if alreadyExists}
        <p style="color:red">Das Pseudonym {pseudoinput} existiert bereits.</p>
        <button on:click|preventDefault={() => {alreadyExists = false; pseudoinput = ""}}>Bitte wähle ein anderes</button>
        {/if}
</div>

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
