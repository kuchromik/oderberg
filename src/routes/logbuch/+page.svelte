<script>
     import { db } from "../../firebase";
    import { addDoc, updateDoc, deleteDoc, collection, onSnapshot } from "@firebase/firestore";
    import { goto } from '$app/navigation';
    import { authStore } from "../../store/store";

     // get userinfo
     let pseudo = "";
    authStore.subscribe((curr) => {
        // @ts-ignore
        pseudo = curr.data.pseudo;
    });

     //// get comments (comList) from Firestore

    let logList = [];
    const logRef = collection(db, "logbuch");
    let logListReady = false; // wait for logList to be ready

    const unsubscribe3 = onSnapshot(logRef, querysnapshot => {
            let logListInsideSnapshot = [];
            querysnapshot.forEach((doc) => {
            let log = { ...doc.data(), id: doc.id};
            logListInsideSnapshot = [log, ...logListInsideSnapshot];  
            })
            logList = logListInsideSnapshot;
            // nach Datum absteigend sortieren
            logList.sort((a, b) => b.date-(a.date));
            logListReady = true;
            console.log("sortedlogList", logList);
            })


</script>
<center>
    {#if pseudo === "Horst Kippowski"}
    <h1>Logbuch</h1>
    
    {#each logList as log, i (i)}
        <div class="log">
            <p>{log.date.toDate()}</p>
            <p>{log.user}</p>
            <p>{log.image}</p>
            <p>{log.action}</p>
        </div>
    {/each}
    {/if}
    {#if pseudo}
    <a class="a-btn-red" href="/dashboard">Zur Hauptseite</a>
    {:else}
    <a class="a-btn-red" href="/">Zur Hauptseite</a>
    {/if}
    
</center>
<style>
    .log {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        border: 1px solid black;
        margin: 10px;
        padding: 10px;
    }
</style>