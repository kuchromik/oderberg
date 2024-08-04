<script>
    import { onMount } from 'svelte';
    import { goto } from "$app/navigation";
    import { doc, addDoc, deleteDoc, collection, onSnapshot, updateDoc, getDocs, query, where, getDoc } from "@firebase/firestore";
    import { db } from "../firebase";

    let searchStringTitel = '';
    let searchStringComments = '';
    let searchStringAnswers = '';
    let searchID = '';
    let images = [];
    let comments = [];
    let answers = [];

    let IDnotFound = false;
    let TitlenotFound = false;
    let CommentsnotFound = false;
    let AnswersnotFound = false;

    const searchByTitel = async () => {
        searchStringComments = '';
        searchStringAnswers = '';
        comments = [];
        answers = [];
        searchID = '';
        IDnotFound = false;
        TitlenotFound = false;
        CommentsnotFound = false;
        AnswersnotFound = false;
        const q = query(collection(db, "images"));
        const querySnapshot = await getDocs(q);
        images = [];
        querySnapshot.forEach((doc) => {
            if(doc.data().imagetitel.includes(searchStringTitel)) {
                images = [...images, { ...doc.data(), id: doc.id }];
            } 
        })
        if (images.length == 0) {
                    TitlenotFound = true;
                }
    }

    const searchByComments = async () => {
        searchStringTitel = '';
        images = [];
        answers = [];
        searchID = '';
        searchStringAnswers = '';
        IDnotFound = false;
        TitlenotFound = false;
        CommentsnotFound = false;
        AnswersnotFound = false;
        const q = query(collection(db, "comments"));
        const querySnapshot = await getDocs(q);
        comments = [];
        querySnapshot.forEach((doc) => {
            if(doc.data().comment.includes(searchStringComments)) {
                
                let point = doc.data().comment.indexOf(searchStringComments);
                let prestring = doc.data().comment.substring(0, point);
                let afterstring = doc.data().comment.substring(point + searchStringComments.length);
                prestring = removeTags(prestring);
                afterstring = removeTags(afterstring);
                comments = [...comments, { ...doc.data(), id: doc.id, comment: prestring + '<span style="background-color: yellow;">' + searchStringComments + '</span>' + afterstring }];
            }
            else {
                console.log("No such comment!");
                CommentsnotFound = true;
            }
        })
    }

    const searchByAnswers = async () => {
        searchStringTitel = '';
        images = [];
        comments = [];
        searchStringComments = '';
        searchID = '';
        IDnotFound = false;
        TitlenotFound = false;
        CommentsnotFound = false;
        AnswersnotFound = false;
        const q = query(collection(db, "answers"));
        const querySnapshot = await getDocs(q);
        answers = [];
        querySnapshot.forEach((doc) => {
            if(doc.data().answer.includes(searchStringAnswers)) {
                let point = doc.data().answer.indexOf(searchStringAnswers);
                let prestring = doc.data().answer.substring(0, point);
                
                let afterstring = doc.data().answer.substring(point + searchStringAnswers.length);
                prestring = removeTags(prestring);
                afterstring = removeTags(afterstring);
                answers = [...answers, { ...doc.data(), id: doc.id, answer: prestring + '<span style="background-color: yellow;">' + searchStringAnswers + '</span>' + afterstring}]
            }
            else {
                console.log("No such answer!");
                AnswersnotFound = true;
            }
        })
    }

    const searchByImageID = async () => {
        searchStringTitel = '';
        searchStringComments = '';
        searchStringAnswers = '';
        comments = [];
        answers = [];
        images = [];
        IDnotFound = false;
        TitlenotFound = false;
        CommentsnotFound = false;
        AnswersnotFound = false;
        const q = query(collection(db, "images"), where("imagename", "==", searchID));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const docRef = querySnapshot.docs[0].ref;
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
            images = [{ ...docSnap.data(), id: docSnap.id }]
            }
        } else {
            console.log("No such ID!");
            IDnotFound = true;
        }
    }
    function removeTags(str) {
    if ((str === null))
        return false;
    else
        str = str.toString();

    // Regular expression to identify HTML tags in
    // the input string. Replacing the identified
    // HTML tag with a null string.
    return str.replace(/(<([^>]+)>)/ig, '');
}
  
</script>
<div class="inColoumn">
    <div class="searchinput">
        <input type="text" bind:value={searchStringTitel} placeholder="im Bildtitel ist enthalten ..." />
        <button on:click={searchByTitel}>Suche starten</button>
    </div>
    {#if TitlenotFound}
    <p style="color: red;">Bild mit dem Titel {searchStringTitel} nicht gefunden</p>
    {/if}
</div>
<div class="inColoumn">
    <div class="searchinput">
        <input type="text" bind:value={searchStringComments} placeholder="in Kommentaren ist enthalten ..." />
        <button on:click={searchByComments}>Suche starten</button>
    </div>
    {#if CommentsnotFound}
    <p style="color: red;">Kommentare mit {searchStringComments} nicht gefunden</p>
    {/if}
</div>
<div class="inColoumn">
    <div class="searchinput">
        <input type="text" bind:value={searchStringAnswers} placeholder="in Anworten auf Kommentare ist enthalten ..." />
        <button on:click={searchByAnswers}>Suche starten</button>
    </div>
    {#if AnswersnotFound}
    <p style="color: red;">Antworten mit {searchStringAnswers} nicht gefunden</p>
    {/if}
</div>
<div class="inColoumn">
    <div class="searchinput">
        <input type="text" bind:value={searchID} placeholder="Bild nach ID suchen" />
        <button on:click={searchByImageID}>Suche starten</button>
    </div>
    {#if IDnotFound}
        <p style="color: red;">Bild mit ID {searchID} nicht gefunden</p>
    {/if}
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
            <p>{@html comment.comment}</p>
            <a href="/locations/{comment.location}/images/{comment.imageID}">zum kommentierten Bild</a>
        </div>
    {/each}
</div>

<div class="commentdivision">
    {#each answers as answer}
        <div class="comment">
           <small>Antwort von {answer.author} vom {answer.date.toDate().toLocaleString()}</small>
            <p>{@html answer.answer}</p>
            <a href="/locations/{answer.location}/images/{answer.imageID}">zum kommentierten Bild</a>
        </div>
    {/each}
</div>
</center>
<style>

    .inColoumn {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        align-items: center;
        justify-content: center;
    }
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