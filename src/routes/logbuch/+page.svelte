<script>
    import { db } from "../../firebase";
    import { getDocs, deleteDoc, collection, onSnapshot } from "@firebase/firestore";
    import { authStore } from "../../store/store";

     // get userinfo
     let pseudo = "";
    authStore.subscribe((curr) => {
        // @ts-ignore
        pseudo = curr.data.pseudo;
    });

    const adminData = {
        pseudo: import.meta.env.VITE_ADMIN_PSEUDO,
        };

     //// get comments (comList) from Firestore

    let logList = [];
    const logRef = collection(db, "logbuch");

    const unsubscribe3 = onSnapshot(logRef, querysnapshot => {
            let logListInsideSnapshot = [];
            querysnapshot.forEach((doc) => {
            let log = { ...doc.data(), id: doc.id};
            logListInsideSnapshot = [log, ...logListInsideSnapshot];  
            })
            logList = logListInsideSnapshot;
            // nach Datum absteigend sortieren
            logList.sort((a, b) => b.date-(a.date))
            })

    // delete logbuch
    const deleteLogbuch = async () => {
        const logRef = collection(db, "logbuch");
        const querySnapshot = await getDocs(logRef);
        querySnapshot.forEach((doc) => {
            deleteDoc(doc.ref);
        })
    }

</script>
<center>
    <div class="log">
    {#if pseudo === adminData.pseudo}
    <h1>Logbuch</h1>
    {#if pseudo}
    <a class="a-btn-red logbutton" href="/dashboard">Zur Hauptseite</a>
    {:else}
    <a class="a-btn-red logbutton" href="/">Zur Hauptseite</a>
    {/if}
    {#if logList.length === 0}
        <p>Das Logbuch ist leer.</p>
    {/if}
    
    {#each logList as log, i (i)}
        <div class="logentry">
            <p>{log.date.toDate()}</p>
            <p>{log.user}</p>
            <p>{log.image}</p>
            <p>{log.action}</p>
        </div>
    {/each}
    <a class="a-btn-red logbutton" style="background-color: red" on:click|preventDefault={deleteLogbuch} on:keydown={deleteLogbuch}>Logbuch leeren</a>
    {/if}
    {#if pseudo}
    <a class="a-btn-red logbutton" href="/dashboard">Zur Hauptseite</a>
    {:else}
    <a class="a-btn-red logbutton" href="/">Zur Hauptseite</a>
    {/if}
    </div>
    
</center>
<style>

    .log {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 10px;
        padding: 10px;
    }
    .logentry {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        border: 1px solid grey;
        margin: 10px;
        padding: 10px;
    }

    .logbutton {
        text-align: center;
        text-decoration: none;
        color: white;
        border-radius: 5px;
        max-width: fit-content;
    }

</style>