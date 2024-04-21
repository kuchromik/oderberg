<script>
	import { app } from "../../../../../firebase";
    import { db } from "../../../../../firebase";
    import { doc, addDoc, deleteDoc, collection, onSnapshot, updateDoc, getDocs } from "@firebase/firestore";
    import { authStore } from "../../../../../store/store";
    import { getStorage, ref, deleteObject } from "firebase/storage";
	import { goto } from "$app/navigation";

    /** @type {import('./$types').PageData} */
	export let data;
	
     // get userinfo
     let pseudo = "";
    authStore.subscribe((curr) => {
        // @ts-ignore
        pseudo = curr.data.pseudo;
    });

    // connection to Firebase Storage (images)
    const storage = getStorage(app);

     //// get the image from Firestore
    let img;
    let imgID;
    let imageReady = false;

    async function getImage() {
        const imgRef = collection(db, "images");
        const querySnapshot_img = await getDocs(imgRef);
        
        querySnapshot_img.forEach((doc) => {
            
            if (doc.id === data.post.image) {
                img = doc.data();
                imgID = doc.id;
                imageReady = true
            }
        })
        
    }

    getImage().then(() => {
        const unsubscribe3 = onSnapshot(comRef, querysnapshot => {
            let comListInsideSnapshot = [];
            querysnapshot.forEach((doci) => {
            let comment = { ...doci.data(), id: doci.id};
            comListInsideSnapshot = [comment, ...comListInsideSnapshot]; 
            })
           
            // only comments to the choosen image
            comList = comListInsideSnapshot.filter(com => com.image === img.imagename);
        
            // sort comments by date
            comList.sort((a, b) => b.date.localeCompare(a.date));
            commentCounter = comList.length;
            comListReady = true;
            })
    });
    
    //// get comments (comList) from Firestore

    let comList = [];
    const comRef = collection(db, "comments");
    let comListReady = false; // wait for comList to be ready

    // handle comments
    
    let comment = 'Neuer Kommentar';
    let newComWatch = false; // watch for new comment
    let commentEditMode = false; // watch for comment edit
    let commToEdit;
    let commToDelete;
    let commToEditContent;
    let commentCounter;
    
    
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

    let locList = [];
    let selected_Location = "";

    async function getLocations() {
        const locRef = collection(db, "locations");
        const querySnapshot_loc = await getDocs(locRef);
        let locListInsideGetDocs = [];
        querySnapshot_loc.forEach((doci) => {
            let location = { ...doci.data(), id: doci.id};
        
            //check if location is empty and delete empty location
            if (location.loc_name !== "") {
                locListInsideGetDocs = [location, ...locListInsideGetDocs]; 
            }
            else {
                const locRef = doc(db, "locations", location.id);
                deleteDoc(locRef);
                console.log("Location without a name deleted successfully", location.id);
            }
            
        })
    // generate an aphabetical sorted list of locations without the location "z.Z. nicht zugeordnet"
    locList = locListInsideGetDocs.filter(location => location.loc_name !== "z.Z. nicht zugeordnet");
    locList.sort((a, b) => a.loc_name.localeCompare(b.loc_name));
    }

    getLocations();

    async function setImageLoc(location) {

       
            const docRef = doc(db, "images", imgID);
            await updateDoc(docRef, {
            location: location
            });
            selected_Location = "";
            goto(`/locations/${location}`);  
    }

     //// delete image from storage and image from Firestore incl. comments
    let deleteImgRealy = false;
    let deleteCommentRealy = false;
    let afterDelete = false;

    function deleteImage() {

        // delete image from storage and image from Firestore incl. comments

        let imageName = `images/${img.imagename}`;
        const desertRef = ref(storage, imageName);
        const docRef = doc(db, "images", imgID);

        comList.forEach(function(com) {
            if (com.image === img.imagename) {
                const docRef = doc(db, "comments", com.id);
                deleteDoc(docRef) .then(() => { console.log("Comment deleted") }) .catch(error => { console.log(error); })
                }
            }
        )

        deleteObject(desertRef)
            .then(() => {
                }).catch((error) => {
                console.log("Error deleting image in Storage: ", error);
                })
                .then(() => {
                deleteDoc(docRef)
                }).catch((error) => {
                console.log("Error deleting image in Firestore: ", error);
                })
                .then(() => {
                    deleteImgRealy = false;
                    afterDelete = true;
                }).catch((error) => {
                console.log("Error deleting image anyway: ", error);
                })
        
        
        }
    
    let orts_location = "";
    let new_loc = "";
    let locationSelected = false;
    let docRefOnBreak; // docRef of new location to use on break while uploading new image
    let value = ''; //new_loc

    const createNewLocation =(value) => {
            
            if (value) {
                // check if location already exists
                const locationExists = locList.some(location => location.loc_name === value);
                if (locationExists) {
                // Location already exists
                orts_location = value;
                locationSelected = true;
                } else {
                // Location does not exist
                new_loc = value;
                orts_location = new_loc;
                locationSelected = true;
                const locationsRef = collection(db, 'locations');
                addDoc(locationsRef, { loc_name: new_loc })
                .then((docref) => { docRefOnBreak = docref })
                .catch(error => { console.log(error); })
                .then(() => setImageLoc(orts_location))
                .then (() => goto(`/locations/${new_loc}`))
                
                }
            } else {
                
            orts_location = "z.Z. nicht zugeordnet";
            locationSelected = true;
            }
        }
    
</script>
<center>
    {#if imageReady && !afterDelete}
        <a href="/locations/{data.post.location}"><h1>{data.post.location}</h1></a>
        <br>
        <small>Bild-ID: {img.imagename}</small>
        <img src={img.url} alt="Bild" style="width: 100%; height: auto;">
        <small>eingestellt von {img.uploader} am {img.uploadDate.toDate().toLocaleString()}</small>

        {#if (pseudo === img.uploader || pseudo === "Horst Kippowski")}
            <div class="actions">
                {#if !deleteImgRealy}
                    <i
                        on:click={() => deleteImgRealy = true}
                        on:keydown={() => {}}
                        class="fa-regular fa-trash-can"
                    />
                {/if}
                {#if deleteImgRealy}
                    <button class="a-btn-red" on:click|preventDefault={() => {
                        deleteImage();
                        }}>Dieses Bild wirklich löschen? Alle Kommentare gehen dabei verloren</button>
                    <button class="a-btn-grey" on:click|preventDefault={() => {
                        deleteImgRealy = false;
                        }}>Abbruch</button>
                {/if}
            <br>  
            </div>
        {/if}
        <br>   
        <!-- nicht zugeordnetes Bild einer Location zuordnen -->
        {#if pseudo}
            {#if img.location === "z.Z. nicht zugeordnet"}
                <p>Dem Bild einen Ort zuordnen?</p>
                
                <select bind:value={selected_Location} on:change ={() => setImageLoc(selected_Location)}>
                    {#each locList as location}
                        <option value={location.loc_name}>{location.loc_name}</option>
                    {/each}
                </select>
                <br>
                <br>
                <p>Eine passende Örtlichkeit ist nicht in der Liste?</p>
                <form on:submit|preventDefault={() => createNewLocation(value)}>
                    <label>
                        Neue Örtlichkeit:
                        <input bind:value />
                    </label>
                    <button class="a-btn-grey">Anlegen & zuordnen</button>
                </form>
            {/if}
        {/if}
        <br>
        {#if comListReady}
                <p>Zu diesem Bild gibt es <b>{commentCounter}</b> Kommentare</p>
        {/if}
        <br>
        {#if pseudo}
            <button class="a-btn-blue" on:click|preventDefault={() => newComWatch = true}>Neuer Kommentar zu diesem Bild?</button>
        {/if}
        <br>
            
        {#if newComWatch}
        <br>
            <form on:submit|preventDefault={() => createNewComment(comment, img.imagename)}>
                <textarea bind:value="{comment}" rows="15" cols="40"></textarea>
                <div class="actions">
                    <button class="a-btn-green" type="submit">Kommentar absenden</button>
                    <button class="a-btn-grey" on:click|preventDefault={() => {newComWatch = false; comment = 'Neuer Kommentar'; console.log("klick")}}>Abbruch</button>
                </div>
            </form>
        {/if}
        <br>
        <h3>Kommentare zu diesem Bild:</h3>
        {#each comList as com}
            <br>
            {#if com.image === img.imagename}
                <small>von {com.author} am {com.date}: </small>
                <div class="actions">
                    <p class="commentcolor" align="left">&#187;{com.comment}&#171;</p>
                    {#if (pseudo === com.author || pseudo === "Horst Kippowski")}
                    
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
                            <button class="a-btn-grey" on:click|preventDefault={() => {
                                deleteComment(com.id);
                                }}>Diesen Kommentar wirklich löschen?</button>
                            <button class="a-btn-grey" on:click|preventDefault={() => {
                                deleteCommentRealy = false;
                                }}>Abbruch</button>
                        {/if}
                        {#if commentEditMode && (commToEdit === com.id)}
                            <form on:submit|preventDefault={() => editComment(com.id, commToEditContent)}>
                                <textarea bind:value="{commToEditContent}" rows="15" cols="60"></textarea>
                                <button class="a-btn-grey" type="submit">Änderung speichern</button>
                            </form>
                        {/if}
                        <br>
                    
                {/if}
            </div>
            {/if}
        {/each}
    <br>
    <button class="a-btn-grey" on:click|preventDefault={() => {
        goto(`/locations/${data.post.location}`);
        }}>Zurück zu {data.post.location}</button>
    {/if}
    {#if afterDelete}
        <p>Das Bild wurde erfolgreich gelöscht.</p>
        <br>
        <button class="a-btn-green" on:click|preventDefault={() => {
            goto(`/locations/${data.post.location}`);
            }}>Zur Ortsseite</button>
        <button class="a-btn-red" on:click|preventDefault={() => {
            goto(`/dashboard`);
        }}>Zur Hauptseite</button>
    {/if}
</center>
<style>
    a {
        color: black;
        text-decoration: none;
        
        }
</style>
