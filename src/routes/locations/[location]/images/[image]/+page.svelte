<script>
	import { app } from "../../../../../firebase";
    import { db } from "../../../../../firebase";
    import { doc, addDoc, deleteDoc, collection, onSnapshot, updateDoc, getDocs } from "@firebase/firestore";
    import { authStore } from "../../../../../store/store";

    /** @type {import('./$types').PageData} */
	export let data;
	
     // get userinfo
     let pseudo = "";
    authStore.subscribe((curr) => {
        // @ts-ignore
        pseudo = curr.data.pseudo;
    });

    let selected_Location;

     //// get the image from Firestore
    let img;
    let imageReady = false;

    async function getImage() {
        const imgRef = collection(db, "images");
        const querySnapshot_img = await getDocs(imgRef);
        
        querySnapshot_img.forEach((doc) => {
            
            if (doc.id === data.post.image) {
                img = doc.data();
                console.log(img);
                imageReady = true;
            }
        })
        
    }
    getImage();


    
    //// get comments (comList) from Firestore

    let comList = [];
    const comRef = collection(db, "comments");
    let comListReady = false; // wait for comList to be ready

    const unsubscribe3 = onSnapshot(comRef, querysnapshot => {
            let comListInsideSnapshot = [];
            querysnapshot.forEach((doc) => {
            let comment = { ...doc.data(), id: doc.id};
            comListInsideSnapshot = [comment, ...comListInsideSnapshot]; 
            })
            comList = comListInsideSnapshot;
            // Comment-Liste sortieren
            comList.sort((a, b) => b.date.localeCompare(a.date));
            comListReady = true;
            console.log("comList: ", comList);
            })
            
   
    //// delete image from storage and image from Firestore incl. comments
    let deleteImgRealy = false;
    let deleteCommentRealy = false;

    async function deleteImage(imageID, url) {

        // delete image-url from imgList

        let delIMGIndex = imgList.indexOf(imageID);
        
        if (delIMGIndex !== -1) {
            imgList.splice(delIMGIndex, 1)
        }

        
        // delete image from storage and image from Firestore incl. comments

        const searchTerm = 'images%2F';
        const indexOfFirst = url.indexOf(searchTerm);

        let imageName = `images/${url.slice(indexOfFirst + 9,indexOfFirst + 45)}`;

        const desertRef = ref(storage, imageName);
        deleteObject(desertRef);
        console.log("Image deleted from Storage successfully", url);
        const docRef = doc(db, "images", imageID);
        deleteDoc(docRef);
        console.log("Image deleted from Store successfully", imageID);
        comList.forEach(function(com) {
            if (com.image === url.slice(indexOfFirst + 9,indexOfFirst + 45)) {
                const docRef = doc(db, "comments", com.id);
                deleteDoc(docRef) .then(() => { console.log("Comment deleted") }) .catch(error => { console.log(error); })
                }
            }
        )
        deleteImgRealy = false;
        }
    

    // handle comments
    
    let comment = 'Neuer Kommentar';
    let newComWatch = false; // Array of Booleans on make a new comment -> set visibility of new-comment-part
    let comWatch = false; // Array of Booleans -> set visibility of comments
    let commentEditMode = false;
    let commToEdit;
    let commToDelete;
    let commToEditContent;
    
    
    const createNewComment =(newcomm, image)=> {        
            let newComment = newcomm;
            let commentImage = image;

            const date = new Date().toLocaleString('de-de') ;
            
            const commentRef = collection(db, 'comments');
            addDoc(commentRef, { comment: newComment, author: pseudo, image: commentImage, date: date });

            newComWatch = false;
            comment = 'Neuer Kommentar'
        }

    const deleteComment =(delcom)=> {        
        const docRef = doc(db, "comments", delcom);
        deleteDoc(docRef) .then(() => { console.log("Comment deleted") }) .catch(error => { console.log(error); });
        deleteCommentRealy = false
        }

    const editComment =(editcom, updatedDoc)=> {   
        const date = new Date().toLocaleString('de-de') ;     
        const docRef = doc(db, "comments", editcom);
        updateDoc(docRef, {"comment": updatedDoc, "date": date}) .then(() => { console.log("Comment updated") }) .catch(error => { console.log(error); });
        commentEditMode = false;
        comment = 'Neuer Kommentar'
        }

    

    async function setImageLoc(location, url) {

        console.log("Start Location setting: ", location, url);

        const searchTerm = 'images%2F';
        const indexOfFirst = url.indexOf(searchTerm);

        let imageName = `${url.slice(indexOfFirst + 9,indexOfFirst + 45)}`;

        

        
        for (let i = 0; i < imgList.length; i++) {
            if (imgList[i].imagename === imageName) {
            const docRef = doc(db, "images", imgList[i].id);
            await updateDoc(docRef, {
            location: location
            });
            console.log("Location updated successfully", location);
            selected_Location = "";
            }
        } 
        
    }

    
    function countComments() {
        let commentCounter = 0;
        comList.forEach(com => {
            if (com.image === img.imagename) {
                commentCounter++
                }
            })
        
        return commentCounter;
    }
    
</script>
<center>
    {#if imageReady}
        <a href="/locations/{data.post.location}"><h1>{data.post.location}</h1></a>
        <br>
        <small>Bild-ID: {img.imagename}</small>
        <img src={img.url} alt="Bild" style="width: 100%; height: auto;">
        <small>eingestellt von {img.uploader} am {img.uploadDate.toDate().toLocaleString()}</small>

        {#if (pseudo === img.uploader)}
            <div class="actions">
                {#if !deleteImgRealy}
                    <i
                        on:click={() => deleteImgRealy = true}
                        on:keydown={() => {}}
                        class="fa-regular fa-trash-can"
                    />
                {/if}
                {#if deleteImgRealy}
                    <button on:click|preventDefault={() => {
                        deleteImage(img.id, img.url);
                        }}>Dieses Bild wirklich löschen? Alle Kommentare gehen dabei verloren</button>
                    <button on:click|preventDefault={() => {
                        deleteImgRealy = false;
                        }}>Abbruch</button>
                {/if}
            </div>
        {:else if (pseudo === "Horst Kippowski")}
            <div class="actions">
                {#if !deleteImgRealy}
                <i
                    on:click={() => deleteImgRealy = true}
                    on:keydown={() => {}}
                    class="fa-regular fa-trash-can"
                />
                {/if}
                {#if deleteImgRealy}
                <button on:click|preventDefault={() => {
                    deleteImage(img.id, img.url);
                    }}>Dieses Bild wirklich löschen? Alle Kommentare gehen dabei verloren</button>
                <button on:click|preventDefault={() => {
                    deleteImgRealy = false;
                    }}>Abbruch</button>
                {/if}
            </div>
        {/if}
           
        <!-- nicht zugeordnetes Bild einer Location zuordnen 
        {#if pseudo}
            {#if img.location === "z.Z. nicht zugeordnet"}
                <p>Dem Bild einen Ort zuordnen?</p>
                 <ChooseLocation /> 
                <select bind:value={selected_Location} on:change ={() => setImageLoc(selected_Location, img.url)}>
                    {#each locListToCleanUp as location}
                        <option value={location.loc_name}>{location.loc_name}</option>
                    {/each}
                </select>
            {/if}
        {/if}
        -->     
        {#if !comWatch}
            {#if comListReady}
                <p>Zu diesem Bild gibt es {countComments()} Kommentare</p>
            {/if}    
            <br>
            <button on:click|preventDefault={() => comWatch = !comWatch}>Kommentare anzeigen bzw. neu erstellen</button>
        {/if}
        <br>
        {#if comWatch}
            <br>
            <button on:click|preventDefault={() => comWatch = !comWatch}>Kommentare verbergen</button>
            <br>
            {#if pseudo}
                <button on:click|preventDefault={() => newComWatch = true}>Neuer Kommentar zu diesem Bild?</button>
            {/if}
            <br>
                
            {#if newComWatch}
                <form on:submit|preventDefault={() => createNewComment(comment, img.imagename)}>
                    <textarea bind:value="{comment}" rows="15" cols="40"></textarea>
                    <div class="actions">
                        <button type="submit">Kommentar absenden</button>
                        <button on:click|preventDefault={() => {newComWatch = false; comment = 'Neuer Kommentar'; console.log("klick")}}>Abbruch</button>
                    </div>
                </form>
            {/if}
            <h5>Kommentare zu diesem Bild:</h5>
            {#each comList as com}
                {#if com.image === img.imagename}
                    <small>von {com.author} am {com.date}: </small>
                    <p class="commentcolor" align="left">&#187;{com.comment}&#171;</p>
                    {#if (pseudo === com.author)}
                        <div class="actions">
                            {#if (!commentEditMode && !deleteCommentRealy)}
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
                                on:click={() => {deleteCommentRealy = true; commToDelete = com.id}}
                                on:keydown={() => {}}
                                class="fa-regular fa-trash-can"
                                />
                            {/if}
                            {#if deleteCommentRealy && (commToDelete === com.id)}
                                <button on:click|preventDefault={() => {
                                    deleteComment(com.id);
                                    }}>Diesen Kommentar wirklich löschen?</button>
                                <button on:click|preventDefault={() => {
                                    deleteCommentRealy = false;
                                    }}>Abbruch</button>
                            {/if}
                            {#if commentEditMode && (commToEdit === com.id)}
                                <form on:submit|preventDefault={() => editComment(com.id, commToEditContent)}>
                                    <textarea bind:value="{commToEditContent}" rows="15" cols="60"></textarea>
                                    <button type="submit">Änderung speichern</button>
                                </form>
                            {/if}
                            <br>
                        </div>
                    {:else if pseudo === "Horst Kippowski"}
                        <div class="actions">
                            {#if (!commentEditMode && !deleteCommentRealy)}
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
                                on:click={() => {deleteCommentRealy = true; commToDelete = com.id}}
                                on:keydown={() => {}}
                                class="fa-regular fa-trash-can"
                                />
                            {/if}
                            {#if deleteCommentRealy && (commToDelete === com.id)}
                                <button on:click|preventDefault={() => {
                                    deleteComment(com.id);
                                    }}>Diesen Kommentar wirklich löschen?</button>
                                <button on:click|preventDefault={() => {
                                    deleteCommentRealy = false;
                                    }}>Abbruch</button>
                            {/if}
                            {#if commentEditMode && (commToEdit === com.id)}
                                <form on:submit|preventDefault={() => editComment(com.id, commToEditContent)}>
                                    <textarea bind:value="{commToEditContent}" rows="15" cols="60"></textarea>
                                    <button type="submit">Änderung speichern</button>
                                </form>
                            {/if}
                            <br>
                        </div>
                    {/if}
                {/if}
            {/each}
            <br>
        {/if}
        
    {/if}
</center>
