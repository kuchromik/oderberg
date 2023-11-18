<script>
    import {app} from "../firebase.js";
    import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
    import { db } from "../firebase";
    import { doc, addDoc, deleteDoc, collection, onSnapshot, updateDoc } from "@firebase/firestore";
    import { authStore } from "../store/store";

    // get userinfo
    let pseudo = "";
    authStore.subscribe((curr) => {
        // @ts-ignore
        pseudo = curr.data.pseudo;
    });

    // connection to Firebase Storage (images)
    const storage = getStorage(app);
    const listRef = ref(storage, '');

    //// get images (imgList) from Firestore

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
            for ( let i=0; i< imgList.length; i++ ) {
                comWatch.push(false)
            }
            })
            
    /////

    //// get locations (locList) from Firestore

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

    //// get comments (comList) from Firestore

    let comList = [];
    const comRef = collection(db, "comments");

    const unsubscribe3 = onSnapshot(comRef, querysnapshot => {
            let fbJobs = [];
            querysnapshot.forEach((doc) => {
            let job = { ...doc.data(), id: doc.id};
            fbJobs = [job, ...fbJobs];  
            })
            comList = fbJobs;
            comList.sort((a, b) => b.date.localeCompare(a.date))
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

    // handle comments
    
    let comment = 'Neuer Kommentar';
    let comWatch = []; // Array of Booleans on make a comment -> set visibility of comment-part
    let commentEditMode = false;
    let commToEdit;
    let commToEditContent;

    const comClearAndSet = (i) => {
        for ( let i=0; i< imgList.length; i++ ) {
                comWatch[i] = false
            };
        comWatch[i] = true;
        }

    const createNewComment =(newcomm, image, i)=> {        
            let newComment = newcomm;
            let commentImage = image;

            const date = new Date().toLocaleString('de-de') ;
            
            const commentRef = collection(db, 'comments');
            addDoc(commentRef, { comment: newComment, author: pseudo, image: commentImage, date: date });

            comWatch[i] = false;
            comment = 'Neuer Kommentar'
        }

    const deleteComment =(delcom)=> {        
        const docRef = doc(db, "comments", delcom);
        deleteDoc(docRef) .then(() => { console.log("Comment deleted") }) .catch(error => { console.log(error); })
        }

        const editComment =(editcom, updatedDoc)=> {   
        const date = new Date().toLocaleString('de-de') ;     
        const docRef = doc(db, "comments", editcom);
        updateDoc(docRef, {"comment": updatedDoc, "date": date}) .then(() => { console.log("Comment updated") }) .catch(error => { console.log(error); });
        commentEditMode = false;
        comment = 'Neuer Kommentar'
        }
    
</script>
<div class="mainContainer">
<center>
    <h3>Zu welchem Ort möchtest Du gehen?</h3>
    <br>
    <div class="locationContainer">
        {#each locList as loc, id(loc)}
        
            <button on:click={() => showImagesOfLoc(loc.loc_name)}>{loc.loc_name}</button>
        
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
            {#if (imgList[i].location === choosedLog)} <!--Probleme mit der imgList wenn imgList.length != urlList.length-->
            <div class="images headerContainer">
                <img src = "{url}" alt="Image from Firebase">
                <br>
                {#if pseudo}
                <button on:click={() => comClearAndSet(i)}>Neuer Kommentar zu diesem Bild? {i}</button>
                {/if}
                <br>
                <!--<button on:click={() => (comWatch[i] = true)}>Neuer Kommentar zu diesem Bild? {i}</button>-->
                {#if comWatch[i]}
                    <form on:submit={() => createNewComment(comment, imgList[i].imagename, i)}>
                    <textarea bind:value="{comment}" rows="10" cols="80"></textarea>
                    <button type="submit">Kommentar absenden</button>
                    </form>
                <br>
                {/if}
                <h5>Kommentare zu diesem Bild:</h5>
                {#each comList as com}
                <br>
                {#if com.image === imgList[i].imagename}
                    <small>von {com.author} am {com.date}: </small>
                    
                    <p align="left">{com.comment}</p>

                    {#if (com.author === pseudo)}
                        <div class="actions">
                            {#if !commentEditMode}
                            <i
                                on:click={() => {
                                    commentEditMode = true;
                                    commToEdit = com.id;
                                    commToEditContent = com.comment
                                }
                                }
                                on:keydown={() => {}}
                                class="fa-regular fa-pen-to-square"
                            />
                            <i
                                on:click={() => {
                                    deleteComment(com.id);
                                }}
                                on:keydown={() => {}}
                                class="fa-regular fa-trash-can"
                            />
                            {/if}
                            {#if commentEditMode && (commToEdit === com.id)}
                            <form on:submit={() => editComment(com.id, commToEditContent)}>
                                <textarea bind:value="{commToEditContent}" rows="10" cols="80"></textarea>
                                <button type="submit">Kommentar ändern</button>
                                </form>
                            {/if}
                        </div>
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
</div>
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
.actions {
        display: flex;
        align-items: center;
        gap: 14px;
        font-size: 1.3rem;
    }

    .actions i {
        cursor: pointer;
    }

    .actions i:hover {
        color: coral;
    }
</style>