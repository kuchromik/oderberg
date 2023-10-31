<script>
    import {app} from "../firebase.js";
    import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
    import { db } from "../firebase";
    import { doc, addDoc, deleteDoc, collection, onSnapshot } from "@firebase/firestore";
    import { authStore } from "../store/store";

    let pseudo = "";

    authStore.subscribe((curr) => {
        // @ts-ignore
        pseudo = curr.data.pseudo;
    });

    const storage = getStorage(app);
    const listRef = ref(storage, '');

    //// get images (imgList)

    let imgList = [];
    const imgRef = collection(db, "images");

    const unsubscribe1 = onSnapshot(imgRef, querysnapshot => {
            let fbJobs = [];
            querysnapshot.forEach((doc) => {
            let job = { ...doc.data(), id: doc.id};
            fbJobs = [job, ...fbJobs];  
            })
            imgList = fbJobs;
            imgList.sort((a, b) => a.imagename.localeCompare(b.imagename))
            })
            
    /////

    //// get locations (locList)

    let locList = [];
    const locRef = collection(db, "locations");

    const unsubscribe2 = onSnapshot(locRef, querysnapshot => {
            let fbJobs = [];
            querysnapshot.forEach((doc) => {
            let job = { ...doc.data(), id: doc.id};
            fbJobs = [job, ...fbJobs];  
            })
            locList = fbJobs;
            locList.sort((a, b) => a.loc_name.localeCompare(b.loc_name));
            })
            
    /////

    //// get comments (comList)

    let comList = [];
    const comRef = collection(db, "comments");

    const unsubscribe3 = onSnapshot(comRef, querysnapshot => {
            let fbJobs = [];
            querysnapshot.forEach((doc) => {
            let job = { ...doc.data(), id: doc.id};
            fbJobs = [job, ...fbJobs];  
            })
            comList = fbJobs;
            comList.sort((a, b) => a.image.localeCompare(b.image));
            console.log(comList)
            })
            
    /////

    let choosedLog = "";

    const showImagesOfLoc = (value) => {
        choosedLog = value;
    }

    //// Load all images in storage
    let promise = imageload();


    async function imageload() {
        let urlList = [];
        const res = await listAll(listRef);
        for (let itemRef of res.items) {
        let url = await getDownloadURL(ref(itemRef));
        urlList.push(url)
        }
        if (res) {
            return urlList
        } else {
            throw new Error('Probleme')
        }
    }
    /////-------------------------

    let makeComment = false;
    let comment = ''

    const createNewComment =(comment, image)=> {        
            let newComment = comment;
            let commentImage = image;
            makeComment = false;
            const commentRef = collection(db, 'comments');
            addDoc(commentRef, { comment: newComment, author: pseudo, image: commentImage });
        }

    const deleteComment =(delcom)=> {        
        const docRef = doc(db, "comments", delcom);
        deleteDoc(docRef) .then(() => { console.log("Entire Document has been deleted successfully.") }) .catch(error => { console.log(error); })
        }
    
</script>
<center>
    <h3>Zu welchem Ort in Oderberg möchtest Du gehen?</h3>
    <br>
    <div>
        {#each locList as loc, id(loc)}
        <div class="locListe">
            <button on:click={() => showImagesOfLoc(loc.loc_name)} role="tab">{loc.loc_name}</button>
        </div>
        {/each}
    </div>
</center>
<center>
    {#if choosedLog}
    
    <div>
        <center><h1>{choosedLog}</h1></center>
        <br>
        <br>
        {#await promise}
	    <center><p>Lade Bilder ...</p></center>
        {:then urlList}
        {#each urlList as url, i (i)}
            {#if (imgList[i].location === choosedLog)}
            <div class="images">
                <img src = "{url}" alt="Image from Firebase">
                <br>
                {#if pseudo}
                <button on:click={() => (makeComment = true)}>Neuer Kommentar zu diesem Bild?</button>
                {/if}
                <br>
                {#if makeComment}
                <form on:submit={() => createNewComment(comment, imgList[i].imagename)}>
                <textarea bind:value="{comment}" rows="10" cols="80"></textarea>
                <button type="submit">Kommentar absenden</button>
                </form>
                <br>
                {/if}
            <h5>Kommentare zu diesem Bild:</h5>
            {#each comList as com}
                <br>
                {#if com.image === imgList[i].imagename}
                    <p>{com.comment}</p><small> von {com.author}</small>
                    {#if (com.author === pseudo)}
                        <form on:submit={() => deleteComment(com.id)}>
                            <button type="submit">Kommentar löschen</button>
                        </form>
                    {/if}
                {/if}
            {/each}
            <br>
            </div>
            {/if}
        {/each}
        {:catch error}
	    <p style="color: red">{error.message}</p>
        {/await}
      </div>
    {/if}
</center>
<style>
.images {
    margin: auto;
    display: flex;
    flex-direction: column;
	align-items: center;
	justify-content: center;
	
}
.images img {
    max-width: 80vw;
}
.locListe > button {
    margin-bottom: .5rem;
    font-size: medium;
}

textarea {

}
</style>