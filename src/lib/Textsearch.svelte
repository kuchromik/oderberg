<script>
    import { onMount } from 'svelte';
    import { goto } from "$app/navigation";
    import { doc, addDoc, deleteDoc, collection, onSnapshot, updateDoc, getDocs, query, where, getDoc } from "@firebase/firestore";
    import { db } from "../firebase";

    let searchStringTitel = '';
    let searchStringComments = '';
    let searchStringAnswers = '';
    let images = [];
    let comments = [];
    let answers = [];

    const searchByTitel = async () => {
        searchStringComments = '';
        comments = [];
        answers = [];
        const q = query(collection(db, "images"));
        const querySnapshot = await getDocs(q);
        images = [];
        querySnapshot.forEach((doc) => {
            if(doc.data().imagetitel.includes(searchStringTitel)) {
                images = [...images, { ...doc.data(), id: doc.id }]
            }
        })
    }

    const searchByComments = async () => {
        searchStringTitel = '';
        images = [];
        answers = [];
        const q = query(collection(db, "comments"));
        const querySnapshot = await getDocs(q);
        comments = [];
        querySnapshot.forEach((doc) => {
            if(doc.data().comment.includes(searchStringComments)) {
                comments = [...comments, { ...doc.data(), id: doc.id }]
            }
        })
    }

    const searchByAnswers = async () => {
        searchStringTitel = '';
        images = [];
        comments = [];
        const q = query(collection(db, "answers"));
        const querySnapshot = await getDocs(q);
        answers = [];
        querySnapshot.forEach((doc) => {
            if(doc.data().answer.includes(searchStringAnswers)) {
                answers = [...answers, { ...doc.data(), id: doc.id }]
            }
        })
    }
  
</script>
<div class="searchinput">
    <input type="text" bind:value={searchStringTitel} placeholder="im Bildtitel ist enthalten ..." />
    <button on:click={searchByTitel}>Suche starten</button>
</div>
<div class="searchinput">
    <input type="text" bind:value={searchStringComments} placeholder="in Kommentaren ist enthalten ..." />
    <button on:click={searchByComments}>Suche starten</button>
</div>
<div class="searchinput">
    <input type="text" bind:value={searchStringAnswers} placeholder="in Anworten auf Kommentare ist enthalten ..." />
    <button on:click={searchByAnswers}>Suche starten</button>
</div>
<center>
<div class="imagedivision">
    {#each images as image}
        <div>
            <a href="/locations/{image.location}/images/{image.id}">
                <img src={image.url} alt={image.imagetitel} /></a>
            <center>
                <p>{image.imagetitel}</p>
            </center>
        </div>
    {/each}
</div>

<div class="commentdivision">
    {#each comments as comment}
        <div class="comment">
           <small>Kommentar von {comment.author} vom {comment.date.toDate().toLocaleString()}</small>
            <p>{comment.comment}</p>
            <a href="/locations/{comment.location}/images/{comment.imageID}">zum kommentierten Bild</a>
        </div>
    {/each}
</div>

<div class="commentdivision">
    {#each answers as answer}
        <div class="comment">
           <small>Antwort von {answer.author} vom {answer.date.toDate().toLocaleString()}</small>
            <p>{answer.answer}</p>
            <a href="/locations/{answer.location}/images/{answer.imageID}">zum kommentierten Bild</a>
        </div>
    {/each}
</div>
</center>
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


    .imagedivision {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        align-items: center;
        justify-content: center;
        
    }

    .imagedivision img {
        width: 300px;
        height: auto;
    }

    .commentdivision {
        flex-direction: column;
        max-width: 52rem;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .commentdivision p {
        margin-top: 1rem;
    }

    .comment {
        border: 2px solid #ccc;
        border-radius: 5px;
        padding: 1rem;
        margin-top: 1rem;
        width: 100%;
    }
</style>