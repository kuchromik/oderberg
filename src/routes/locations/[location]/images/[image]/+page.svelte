<script>
	import { app } from "../../../../../firebase";
    import { db } from "../../../../../firebase";
    import { doc, addDoc, deleteDoc, collection, onSnapshot, updateDoc, getDocs, query, where, getDoc, setDoc } from "@firebase/firestore";
    import { authStore } from "../../../../../store/store";
    import { getStorage, ref, deleteObject } from "firebase/storage";
	import { goto } from "$app/navigation";
    import { onDestroy } from "svelte";
    
    import { fade } from 'svelte/transition';

    let fullNewImage = false;
    let fullOldImage = false;

    async function saveLastViewedIage() {
        try {
            // @ts-ignore
            const userRef = doc(db, "users", $authStore.user.uid);
            await setDoc(
                userRef,
                {
                    // @ts-ignore
                    lastViewedImage: lastViewedImage
                },
                { merge: true }
            );
           
        } catch (err) {
            console.log(err);
        }
    }

    
    onDestroy( () => {
        if (pseudo) {
        saveLastViewedIage()
        }
    });

    /** @type {import('./$types').PageData} */
	export let data;
	
     // get userinfo
     let pseudo = "";
     let lastViewedImage = "";

    authStore.subscribe((curr) => {
        // @ts-ignore
        pseudo = curr.data.pseudo;
        lastViewedImage = curr.data.lastViewedImage;
    });

    const adminData = {
        pseudo: import.meta.env.VITE_ADMIN_PSEUDO,
        };

    // connection to Firebase Storage (images)
    const storage = getStorage(app);

     //// get the image from Firestore
    let img;
    let imgID;
    let imageReady = false;

    let comList = [];
    let comListReady = false; // wait for comList to be ready

    let answersList = [];
    let answersListReady = false; // wait for answersList to be ready

     let today = false;
     let todaysImage = false;
     let todaysURL = "";
     let uploadTodaysImage = false;
     let uploadertoday = "";

    async function getImage() {
        const imgRef = doc(db, "images", data.post.image);
        const querySnapshot_img = await getDoc(imgRef);

        if (querySnapshot_img.exists()) {
            img = querySnapshot_img.data();
            imgID = querySnapshot_img.id;
            todaysImage = querySnapshot_img.data().today;
            if (todaysImage) {
                todaysURL = querySnapshot_img.data().urlToday;
                uploadertoday = querySnapshot_img.data().uploadertoday;   
            }
            imageReady = true;

            authStore.update((curr) => {
                return {
                    ...curr,
                    data: {
                        ...curr.data,
                        lastViewedImage: querySnapshot_img.id,
                    },
                };
            });

        } else {
            console.log("No such document!");
        }
        
    }

    getImage().then(() => {
        const comRef = query(collection(db, "comments"), where("image", "==", img.imagename));
        const unsubscribe3 = onSnapshot(comRef, querysnapshot => {
            let comListInsideSnapshot = [];
            querysnapshot.forEach((doci) => {
            let comment = { ...doci.data(), id: doci.id};
            comListInsideSnapshot = [comment, ...comListInsideSnapshot];
            });
           
            comList = comListInsideSnapshot;
        
            // sort comments by date
            comList.sort((a, b) => b.date - (a.date));
            commentCounter = comList.length;
            comListReady = true;
            })
    }).then(() => {
        const answersRef = collection(db, "answers");
        const unsubscribe3 = onSnapshot(answersRef, querysnapshot => {
            let answerListInsideSnapshot = [];
            querysnapshot.forEach((doci) => {
            let answer = { ...doci.data(), id: doci.id};
            answerListInsideSnapshot = [answer, ...answerListInsideSnapshot];
            });
           
            answersList = answerListInsideSnapshot;
        
            // sort comments by date
            answersList.sort((a, b) => b.date - (a.date));
            //commentCounter = comList.length;
            answersListReady = true
            })
    })
    

    // handle comments
    
    let comment = 'Gib hier Deinen Kommentar ein';
    let newComWatch = false; // watch for new comment
    let commentEditMode = false; // watch for comment edit
    let commToEdit;
    let commToDelete;
    let commToEditContent;
    let commentCounter;
    let answer = 'Gib hier Deine Antwort ein';
    let answerOnComment = false;
    let commToAnswer;
    let answerToEditContent;
    let answerEditMode = false; // watch for answer edit
    let answerToEdit;
    let answerToDelete;
    
    const createNewComment =(newcomm, image)=> {        
            let newComment = newcomm;
            let commentImage = image;

            //const date = new Date().toLocaleString('de-de') ;
            const date = new Date();
            
            const commentRef = collection(db, 'comments');
            addDoc(commentRef, { comment: newComment, author: pseudo, image: commentImage, imageID: data.post.image, location: img.location,  date: date, lastmodified: date});

            newComWatch = false;
            comment = 'Gib hier Deinen Kommentar ein';
            makeLogEntry(image, "New Comment");
        }
        

    

    const deleteComment =(delcom)=> {        
        const docRef = doc(db, "comments", delcom);

         // Delete associated answers
         const answersRef = collection(db, "answers");
            const answersQuery = query(answersRef, where("comment", "==", delcom));
            getDocs(answersQuery).then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    deleteDoc(doc.ref)
                        .then(() => {
                            makeLogEntry(img.imagename, "Deleted Answer");
                            console.log("Answer deleted");
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                });
            });
        
        deleteDoc(docRef) .then(() => { console.log("Comment deleted") }) .catch(error => { console.log(error); });
        deleteCommentRealy = false;
        makeLogEntry(img.imagename, "Deleted Comment");
        }

    const editComment =(editcom, updatedDoc)=> {   
        const date = new Date();     
        const docRef = doc(db, "comments", editcom);
        updateDoc(docRef, {"comment": updatedDoc, "lastmodified": date}) .then(() => { console.log("Comment updated") }) .catch(error => { console.log(error); });
        comList.sort((a, b) => b.date - (a.date));
        commentEditMode = false;
        comment = 'Gib hier Deinen Kommentar ein';
        makeLogEntry(img.imagename, "Updated Comment");
        }

    const createNewAnswer =(newans, comid)=> {
        let newAnswer = newans;
        let commentID = comid;
        const date = new Date();
        const answerRef = collection(db, 'answers');
        addDoc(answerRef, { answer: newAnswer, author: pseudo, image: img.imagename, comment: commentID, imageID: data.post.image, location: img.location, date: date, lastmodified: date});
        answerOnComment = false;
        answer = 'Gib hier Deine Antwort ein';
        makeLogEntry(img.imagename, "New Answer");
        }

    const deleteAnswer =(delanswer)=> {        
        const docRef = doc(db, "answers", delanswer);
        deleteDoc(docRef) .then(() => { console.log("Answer deleted") }) .catch(error => { console.log(error); });
        deleteAnswerRealy = false;
        makeLogEntry(img.imagename, "Deleted Answer");
        }

    const editAnswer =(editanswer, updatedAnswer)=> {   
        const date = new Date();     
        const docRef = doc(db, "answers", editanswer);
        updateDoc(docRef, {"answer": updatedAnswer, "lastmodified": date}) .then(() => { console.log("Answer updated") }) .catch(error => { console.log(error); });
        answersList.sort((a, b) => b.date - (a.date));
        answerEditMode = false;
        comment = 'Gib hier Deine Anwort ein';
        makeLogEntry(img.imagename, "Updated Answer");
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
            if (doci.data().loc_name !== "") {
                locListInsideGetDocs = [location, ...locListInsideGetDocs]; 
            }
            else {
                const locRef = doc(db, "locations", location.id);
                deleteDoc(locRef);
                //console.log("Location without a name deleted successfully", location.id);
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
    let deleteAnswerRealy = false;
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
                .then(() => {
                    makeLogEntry(img.imagename, "Deleted Image");
                })

        
        
        
        }
    
    let deleteTodaysImgRealy = false;
    let afterTodaysDelete = false;

    function deleteTodaysImage() {

        // delete image from storage and update oldimage from Firestore 

        let imageName = `today/${img.nametoday}`;
        const desertRef = ref(storage, imageName);
        const docRef = doc(db, "images", imgID);

        deleteObject(desertRef)
            .then(() => {
                }).catch((error) => {
                console.log("Error deleting image in Storage: ", error);
                })
                .then(() => {
                updateDoc(docRef, {
                            today: false,
                            urltoday: "",
                            nametoday: "",
                            uploadertoday: ""
                        })
                }).catch((error) => {
                console.log("Error updating image in Firestore: ", error);
                })
                .then(() => {
                    deleteTodaysImgRealy = false;
                    afterTodaysDelete = true;
                   
                }).catch((error) => {
                console.log("Error deleting image anyway: ", error);
                })
                .then(() => {
                    makeLogEntry(img.imagename, "Deleted TodaysImage");
                    getImage();
                })




        }
    
    let orts_location = "";
    let new_loc = "";
    let locationSelected = false;
    let docRefOnBreak; // docRef of new location to use on break while uploading new image
    let value = ''; //new_loc
    let locationAlreadyExists = false;

    const createNewLocation =(value) => {
            locationAlreadyExists = false;
            if (value) {
                // check if location already exists
                const locationExists = locList.some(location => location.loc_name === value);
                if (locationExists) {
                // Location already exists
                orts_location = value;
                locationSelected = true;
                locationAlreadyExists = true;
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

    let changeImagetitel = false;

    const  onBreak =() => {
        changeImagetitel = false;

        }
    

    const setImageTitel = (value) => {
        if (!value) {
            value = "Ohne Titel";
        }

        changeImagetitel = false;
        const docRef = doc(db, "images", imgID);
        updateDoc(docRef, {
            imagetitel: value
        }).then (() => getImage())
        //(() => goto(`/locations/${data.post.location}/images/${imgID}`))
    }

    async function makeLogEntry(imageName, action) {
        const imgRef = collection(db, "logbuch");
        const date = new Date();
        addDoc(imgRef, {action: action, image: imageName, user: pseudo, date: date})
        .then(() => {
            //console.log("Logbuch updated ", action, imageName);
        })
        
    }
    
</script>
<center>
    {#if imageReady && !afterDelete}
        <a href="/locations/{data.post.location}"><h1>{data.post.location}</h1></a>
        <br>
        <div class="changeImagetitel">
            <h2>{img.imagetitel}</h2>
            {#if pseudo === adminData.pseudo || pseudo === img.uploader}
                {#if !changeImagetitel}
                    <button class="a-btn-grey" on:click={() => changeImagetitel = true}>Titel ändern</button>
                {/if}
                {#if changeImagetitel}
                    <form on:submit|preventDefault={() => setImageTitel(value)}>
                        <label>
                            Neuer Titel:
                            <input bind:value />
                        </label>
                    <button class="a-btn-green">Ändern</button>
                    <button class="a-btn-grey" on:click={onBreak}>Vorgang abbrechen</button>
                    </form>
                {/if}
            {/if}
            <small>Bild-ID: {img.imagename}</small>
            <small>eingestellt von {img.uploader} am {img.uploadDate.toDate().toLocaleString()}</small>
        </div>
        <div class:today={today && todaysImage}>
            <div in:fade={{ delay: 50, duration: 300 }} class="imagecontainer" class:fullimage={fullOldImage}>
                <img on:click|preventDefault={() => fullOldImage = !fullOldImage} src={img.url} alt="altes Bild" style="width: 100%; height: auto; padding: 1rem">
            </div>


            {#if (today && todaysImage)}
                <div class="manageTodaysImage">
                    <div in:fade={{ delay: 50, duration: 300 }} class="imagecontainer" class:fullimage={fullNewImage}>
                        <img on:click|preventDefault={() => fullNewImage = !fullNewImage} src={img.urltoday} alt="heutiges Bild" style="width: 100%; height: auto; padding: 1rem">
                    </div>
                    
                    <small>Die heutige Ansicht wurde eingestellt von {uploadertoday}.</small>
                    {#if (pseudo === uploadertoday || pseudo === adminData.pseudo)}
                        {#if !deleteTodaysImgRealy}
                        <button class="a-btn-red" on:click|preventDefault={() => deleteTodaysImgRealy = true}>Heutige Ansicht löschen</button>
                        {/if}
                        {#if deleteTodaysImgRealy}
                            <button class="a-btn-red" on:click|preventDefault={() => deleteTodaysImage()}>Heutige Ansicht wirklich löschen?</button>
                            <button class="a-btn-grey" on:click|preventDefault={() => deleteTodaysImgRealy = false}>Abbruch</button>
                        {/if}
                    {/if}
                    
                </div>
            {:else if (today && !todaysImage && pseudo)}
                
                        <p>Von diesem Ort gibt es noch kein Bild aus heutiger Zeit.</p>
                        <br>
                        <a class="a-btn-blue" href="/uploadtoday">Jetzt ein aktuelles Bild einstellen?</a>
                    
                
            {/if}
         </div>


        {#if !today}
            <button class={todaysImage ? 'a-btn-green' : 'a-btn-red'} on:click={() => today = true}>Wie sieht es heute aus?</button>
        {:else if !pseudo && !todaysImage}
            <center>
                <p>Bitte registriere Dich oder melde Dich an, um eine heutige Ansicht einstellen zu können.</p>
                
            </center>
        {:else}
            <button class="a-btn-grey" on:click={() => today = false}>Bildvergleich beenden</button>
        {/if}
        
        {#if !today}
            {#if (pseudo === img.uploader || pseudo === adminData.pseudo)}
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
                    {#if locationAlreadyExists}
                        <p style="color: red;">Die Örtlichkeit {value} existiert bereits. Bitte wähle sie aus der Liste.</p>
                    {/if}
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
            <button class="a-btn-blue" on:click|preventDefault={() => newComWatch = true}>Dein Kommentar zu diesem Bild?</button>
        {/if}
        <br>
            
        {#if newComWatch}
        <br>
            <form on:submit|preventDefault={() => createNewComment(comment, img.imagename)}>
                <textarea bind:value="{comment}" rows="15" cols="40"></textarea>
                <div class="actions">
                    <button class="a-btn-green" type="submit">Kommentar absenden</button>
                    <button class="a-btn-grey" on:click|preventDefault={() => {newComWatch = false; comment = 'Gib hier Deinen Kommentar ein'}}>Abbruch</button>
                </div>
            </form>
        {/if}
        <br>
        <h3>Kommentare zu diesem Bild:</h3>
        <div class="comments">
        {#each comList as com}
            <br>
            <div class="singleComment">    
            {#if com.image === img.imagename}
                <small>erstellt von {com.author} am {com.date.toDate().toLocaleString()}, zuletzt geändert am {com.lastmodified.toDate().toLocaleString()}: </small>
                
                    <p class="commentcolor" align="left">&#187;{com.comment}&#171;</p>
                    {#if (pseudo === com.author || pseudo === adminData.pseudo)}
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
                        </div>
                        {#if deleteCommentRealy && (commToDelete === com.id)}
                            <button class="a-btn-grey" on:click|preventDefault={() => {
                                deleteComment(com.id);
                                }}>Diesen Kommentar wirklich löschen?</button>
                            <button class="a-btn-grey" on:click|preventDefault={() => {
                                deleteCommentRealy = false;
                                }}>Abbruch</button>
                        {/if}
                        <div class="editComment">
                        {#if commentEditMode && (commToEdit === com.id)}
                            <form on:submit|preventDefault={() => editComment(com.id, commToEditContent)}>
                                <div class="editComment">
                                <textarea bind:value="{commToEditContent}" rows="15" cols="60"></textarea>
                                <button class="a-btn-grey" type="submit">Änderung speichern</button>
                            </div>
                            </form>
                            <button class="a-btn-grey" on:click|preventDefault={() => {
                                commentEditMode = false;
                                }}>Abbruch</button>
                        {/if}
                        </div>
                        <br>
                    {/if}
                    {#if pseudo}
                        <div class="actions">
                            <div class="hover-text">
                                <i on:click={() => {answerOnComment = true; commToAnswer = com.id}}
                                    on:keydown={() => {}}
                                    class="fa-regular fa-comments"></i> 
                                <span class="tooltip-text">Auf den Kommentar antworten</span>
                            </div>
                        </div>
                    {/if}

                    {#if answerOnComment && (commToAnswer === com.id)}
                        <form on:submit|preventDefault={() => createNewAnswer(answer, com.id)}>
                            <textarea bind:value="{answer}" rows="15" cols="40"></textarea>
                            <div class="actions">
                                <button class="a-btn-green" type="submit">Anwort absenden</button>
                                <button class="a-btn-grey" on:click|preventDefault={() => {answerOnComment = false; comment = 'Gib hier Deine Anwort ein'}}>Abbruch</button>
                            </div>
                        </form>
                    {/if}
            
            {/if}
            </div>
            <div class="answers">
                <p>Antworten zum obigen Kommentar:</p>
                {#each answersList as answer}
                <div class="singleComment">    
                {#if answer.comment === com.id}
                    <small>erstellt von {answer.author} am {answer.date.toDate().toLocaleString()}, zuletzt geändert am {answer.lastmodified.toDate().toLocaleString()}: </small>
                    <p class="answercolor" align="left">&#187;{answer.answer}&#171;</p>
                    {#if (pseudo === answer.author || pseudo === adminData.pseudo)}
                    <div class="actions">
                        {#if (!answerEditMode && !deleteAnswerRealy)}
                            <i
                            on:click={() => {
                                answerEditMode = true;
                                answerToEdit = answer.id;
                                answerToEditContent = answer.answer
                                }
                            }
                            on:keydown={() => {}}
                            class="fa-regular fa-pen-to-square"
                            />
                            <i
                            on:click={() => {deleteAnswerRealy = true; answerToDelete = answer.id}}
                            on:keydown={() => {}}
                            class="fa-regular fa-trash-can"
                            />
                        {/if}
                        </div>
                        {#if deleteAnswerRealy && (answerToDelete === answer.id)}
                            <button class="a-btn-grey" on:click|preventDefault={() => {
                                deleteAnswer(answer.id);
                                }}>Diese Anwort wirklich löschen?</button>
                            <button class="a-btn-grey" on:click|preventDefault={() => {
                                deleteAnswerRealy = false;
                                }}>Abbruch</button>
                        {/if}
                        <div class="editAnwer">
                        {#if answerEditMode && (answerToEdit === answer.id)}
                            <form on:submit|preventDefault={() => editAnswer(answer.id, answerToEditContent)}>
                                <div class="editAnswer">
                                <textarea bind:value="{answerToEditContent}" rows="15" cols="60"></textarea>
                                <button class="a-btn-grey" type="submit">Änderung speichern</button>
                            </div>
                            </form>
                            <button class="a-btn-grey" on:click|preventDefault={() => {
                                answerEditMode = false;
                                }}>Abbruch</button>
                        {/if}
                        </div>
                        <br>
                    {/if}
                {/if}
            </div>
            {/each}
            </div>
        {/each}
        </div>
    <br>
    <button class="a-btn-green" on:click|preventDefault={() => {
        goto(`/locations/${data.post.location}`);
        }}>Zur Ortsseite</button>
    {#if pseudo}
        <button class="a-btn-red" on:click|preventDefault={() => {
            goto(`/dashboard`);
        }}>Zur Hauptseite</button>
    {:else}
    <button class="a-btn-red" on:click|preventDefault={() => {
        goto(`/`);
    }}>Zur Hauptseite</button>
    {/if}
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
  
    .changeImagetitel {

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        padding: 0;
        width: 100%;
        height: auto;
        }

    .comments {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        padding: 0;
        width: 100%;
        height: auto;
        background-color: #ddd;
        border-radius: 4px;
        }

    .singleComment {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-evenly;
        margin: 0 auto;
        margin-top: .5rem;
        padding: 0;
        width: 100%;
        height: auto;
        }

    .editComment {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        padding: 0;
        width: 100%;
        height: auto;
        }

    .commentcolor {
            color: navy;
            font-style: italic;
            font-weight: 500;
            padding: 1rem;
        }

    .actions {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 14px;
            font-size: 1.3rem;
            justify-content: center;
            margin-top: 1rem;
        }
        
        .actions i {
            cursor: pointer;
        }
        
        .actions i:hover {
            color: coral;
        }

        textarea {
        background-color: #ccc;
        color: #333;
        margin-top: 1rem;
        padding: 1em;
        border-radius: 10px;
        border: 2px solid transparent;
        outline: none;
        font-family: "Heebo", sans-serif;
        font-weight: 500;
        font-size: 16px;
        line-height: 1.4;
        width: 100%;
        max-width: 50rem;
        height: 100px;
        transition: all 0.2s;
        }

        textarea:hover {
        cursor: pointer;
        background-color: #ddd;
        }

        textarea:focus {
        cursor: text;
        color: #111;
        background-color: #ccc;
        border-color: #333;
        }

        

    .tooltip-text {
    visibility: hidden;
    position: absolute;
    z-index: 1;
    width: 180px;
    color: white;
    font-size: 12px;
    background-color: #004471;
    border-radius: 4px;
    padding: 6px;
    top: -8px;
    left: 120%;
    }

    .hover-text:hover .tooltip-text {
    visibility: visible;
    }

   

    .hover-text {
    position: relative;
    display: inline-block;
    margin: 0px;
    font-family: Arial;
    text-align: center;
    }

    .answers {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin: 1rem auto;
        padding: 1rem;
        width: 100%;
        height: auto;
        background-color: #bbb;
        border-bottom: double;
        border-radius: 4px;
        }

    .answercolor {
        color: #111;
        font-size: .9rem;
        margin-top: .5rem;
        }

    .imagecontainer {
       
        max-width: 800px;
    }

    .today {
        display: grid;
        
        margin: 0 auto;
        padding: 0;
        max-width: 100%;
        height: auto;
        }

    @media (min-width: 800px) {
	            .today {
                grid-template-columns: 1fr 1fr;
            }
        }

        

    .manageTodaysImage {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        padding: 0;
        max-width: 100%;
        height: auto;
        }

    .fullimage {
        display: flex;
        position: fixed;
        top: 0;
        left: 0;
        max-width: 100vw;
        max-height: 100vh;
        width: 100vw;
        height: 100vh;
      

        background-color: rgba(0, 0, 0, 0.8);
        z-index: 10;
        
        align-items: center;
        justify-content: center;

        overflow-y: scroll;
        
        }
    
</style>
