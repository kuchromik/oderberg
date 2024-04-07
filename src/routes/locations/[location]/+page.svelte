<script>
    import { app } from "../../../firebase";
    import { getStorage, ref, listAll, getDownloadURL, deleteObject } from "firebase/storage";
    import { db } from "../../../firebase";
    import { doc, addDoc, deleteDoc, collection, onSnapshot, updateDoc, getDocs } from "@firebase/firestore";
    import { authStore } from "../../../store/store";

	/** @type {import('./$types').PageData} */
	export let data;
	let choosedLocation = data.post.title;

    // get userinfo
    let pseudo = "";
    authStore.subscribe((curr) => {
        // @ts-ignore
        pseudo = curr.data.pseudo;
    });

    // connection to Firebase Storage (images)
    const storage = getStorage(app);
    const listRef = ref(storage, 'images/');

    let locListToCleanUp = [];
    let selected_Location;

    async function getLocations() {
        const locRef = collection(db, "locations");
        const querySnapshot_loc = await getDocs(locRef);
        let locListInsideGetDocs = [];
        querySnapshot_loc.forEach((doci) => {
            let location = { ...doci.data(), id: doci.id};
        
            // check if location is empty comming soon
            if (location.loc_name !== "") {
                locListInsideGetDocs = [location, ...locListInsideGetDocs]; 
            }
            else {
                const locRef = doc(db, "locations", location.id);
                deleteDoc(locRef);
                console.log("Location without a name deleted successfully", location.id);
            }
        })
    locListToCleanUp = locListInsideGetDocs.filter(location => location.loc_name !== "z.Z. nicht zugeordnet");
    locListToCleanUp.sort((a, b) => a.loc_name.localeCompare(b.loc_name));
    
}

 getLocations();

    //// get images (imgList) from Firestore
    let imgList = [];

    const imgRef = collection(db, "images");

    const unsubscribe1 = onSnapshot(imgRef, querysnapshot => {
            let imgListInsideSnapshot = [];
            querysnapshot.forEach((doc) => {
            let image = { ...doc.data(), id: doc.id};
            imgListInsideSnapshot = [image, ...imgListInsideSnapshot];  
            })
            // Image-Liste sortieren
            imgList = imgListInsideSnapshot.sort(
                (b, a) => Number(a.uploadDate) - Number(b.uploadDate)
            );
            // set newComWatch to false for all images
            for ( let i=0; i< imgList.length; i++ ) {
                newComWatch.push(false)
            }
        }
    )

    //// get comments (comList) from Firestore

    let comList = [];
    const comRef = collection(db, "comments");

    const unsubscribe3 = onSnapshot(comRef, querysnapshot => {
            let comListInsideSnapshot = [];
            querysnapshot.forEach((doc) => {
            let comment = { ...doc.data(), id: doc.id};
            comListInsideSnapshot = [comment, ...comListInsideSnapshot];  
            })
            comList = comListInsideSnapshot;
            // Comment-Liste sortieren
            comList.sort((a, b) => b.date.localeCompare(a.date))
            })
            
    
    //// Load all images in storage
    let promise = imageload();
    let urlList = [];
    let urlListByDate = [];

    async function imageload() {
        const res = await listAll(listRef);
        for (let itemRef of res.items) {
        let url = await getDownloadURL(ref(itemRef));
        urlList.push(url)
        }
        if (res) {
            for (let i = 0; i < imgList.length; i++) {
                const substr = imgList[i].imagename;
                const subArr = urlList.filter(str => str.includes(substr));
                urlListByDate.push(subArr[0]);
            }
            return urlListByDate
        } else {
            throw new Error('Probleme')
        }
    }

    //// delete image from storage and image from Firestore incl. comments
    let deleteImgRealy = false;
    let deleteCommentRealy = false;

    async function deleteImage(imageID, url) {

        // delete image-url from urlList and imgList
        
        let delURLIndex = urlListByDate.indexOf(url);
        if (delURLIndex !== -1) {
            urlListByDate.splice(delURLIndex, 1);
        }

        let delIMGIndex = imgList.indexOf(imageID);
        
        if (delIMGIndex !== -1) {
            imgList.splice(delIMGIndex, 1);
            console.log(imgList);
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
        //window.location.href = "/dashboard"
        }
    

    // handle comments
    
    let comment = 'Neuer Kommentar';
    let newComWatch = []; // Array of Booleans on make a new comment -> set visibility of new-comment-part
    let comWatch = []; // Array of Booleans -> set visibility of comments
    let commentEditMode = false;
    let commToEdit;
    let commToDelete;
    let commToEditContent;

    const newComClearAndSet = (i) => {
        for ( let i=0; i< imgList.length; i++ ) {
                newComWatch[i] = false
            };
        newComWatch[i] = true;
        }

    const createNewComment =(newcomm, image, i)=> {        
            let newComment = newcomm;
            let commentImage = image;

            const date = new Date().toLocaleString('de-de') ;
            
            const commentRef = collection(db, 'comments');
            addDoc(commentRef, { comment: newComment, author: pseudo, image: commentImage, date: date });

            newComWatch[i] = false;
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

    const countComments = (i) => {
        let count = 0;
        comList.forEach(function(com) {
            if (com.image === imgList[i].imagename) {
                count++;
            }
        })
        return count;
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
     
</script>

<div class="mainContainer">
<center>
    {#if choosedLocation}
    <div>
        <center><h1>{choosedLocation}</h1></center>
        <br>
        {#await promise}
	    <center><i class="fa-solid fa-spinner loadingSpinner" /></center>
        {:then urlListByDate}
        {#if urlListByDate.length == imgList.length}
            {#each urlListByDate as url, i (i)}
                {#if (imgList[i].location == choosedLocation)} <!--Probleme mit der imgList wenn imgList.length != urlList.length-->
                <hr>
                <br>
                <div class="images headerContainer">
                <small>Bild-ID: {imgList[i].imagename}</small>
                <img src = "{url}" alt="Image from Firebase">
                <small>eingestellt von {imgList[i].uploader} am {imgList[i].uploadDate.toDate().toLocaleString()}</small>
                {#if (pseudo === imgList[i].uploader)}
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
                                deleteImage(imgList[i].id, url);
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
                                deleteImage(imgList[i].id, url);
                                }}>Dieses Bild wirklich löschen? Alle Kommentare gehen dabei verloren</button>
                            <button on:click|preventDefault={() => {
                                deleteImgRealy = false;
                           }}>Abbruch</button>
                            {/if}
                        </div>
                    {/if}

                    <!-- nicht zugeordnetes Bild einer Location zuordnen -->
                    {#if pseudo}
                        {#if choosedLocation === "z.Z. nicht zugeordnet"}
                            
                            <p>Dem Bild einen Ort zuordnen?</p>
                            
                            <!-- <ChooseLocation /> -->
                            <select bind:value={selected_Location} on:change ={() => setImageLoc(selected_Location, url)}>
                                {#each locListToCleanUp as location}
                                    <option value={location.loc_name}>{location.loc_name}</option>
                                {/each}
                            </select>
                        {/if}
                    {/if}

                    {#if !comWatch[i]}
                        <p>Zu diesem Bild gibt es {countComments(i)} Kommentare</p>       
                        <br>
                        <button on:click|preventDefault={() => comWatch[i] = !comWatch[i]}>Kommentare anzeigen bzw. neu erstellen</button>
                    {/if}
                    <br>
                    {#if comWatch[i]}
                    <br>
                    <button on:click|preventDefault={() => comWatch[i] = !comWatch[i]}>Kommentare verbergen</button>
                    
                    <br>
                    {#if pseudo}
                    <button on:click|preventDefault={() => newComClearAndSet(i)}>Neuer Kommentar zu diesem Bild?</button>
                    {/if}
                    <br>
                
                    {#if newComWatch[i]}
                        <form on:submit|preventDefault={() => createNewComment(comment, imgList[i].imagename, i)}>
                        <textarea bind:value="{comment}" rows="15" cols="40"></textarea>
                        <div class="actions">
                           <button type="submit">Kommentar absenden</button>
                           <button on:click|preventDefault={() => {newComWatch[i] = false; comment = 'Neuer Kommentar'}}>Abbruch</button>
                        </div>
                        </form>
                    {/if}
                    <h5>Kommentare zu diesem Bild:</h5>
                    {#each comList as com}
                        {#if com.image === imgList[i].imagename}
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
        </div>
        
            {/if}
        {/each}
        {:else}
        <p>Bildlistenproblem ... Administrator informieren!</p>
        {/if}
        <br>
        {:catch error}
	    <p style="color: red">{error.message}</p>
        {/await}
      </div>
    {/if}
</center>
</div>
<div class="mainPageButtonOnRight">
    {#if pseudo}
        <a class="a-btn-red fixed" href="/dashboard">Zurück zur Hauptseite</a>
        {:else}
        <a class="a-btn-red fixed" href="/">Zurück zur Hauptseite</a>
    {/if}
</div>
<style>
    .fixed {
  position: fixed;
  top: 92%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.mainPageButtonOnRight {
    position: fixed;
    top: 90%;
    right: 12%;
    transform: translate(-50%, -50%);
}
</style>