<script>
    import {app} from "../../firebase.js";
    import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
    import { v4 as uuidv4 } from 'uuid';
    import { db } from "../../firebase";
    import { addDoc, updateDoc, deleteDoc, collection, onSnapshot } from "@firebase/firestore";
    import { authStore } from "../../store/store";
    import { goto } from "$app/navigation";
    
    let locations = []; // array of locations
    let orts_location = "";
    let new_loc = "";
    let value = ''; //new_loc
    let pseudo = "";

      //// get the logbuch from Firestore
    

    async function makeLogEntry(imageName) {
        const imgRef = collection(db, "logbuch");
        const date = new Date();
        addDoc(imgRef, {action: "Upload Image", image: imageName, user: pseudo, date: date})
        .then(() => {
            console.log("Logbuch updated");
        })
        
    }
    
    
    const colRef = collection(db, "locations"); // reference to locations collection at firestore
    
    const unsubscribe = onSnapshot(colRef, querysnapshot => {
                    let locListe = [];
                    querysnapshot.forEach((doc) => {
                    let location = { ...doc.data(), id: doc.id};
                    locListe = [location, ...locListe];
                    })
                    locListe.sort((a, b) => a.loc_name.localeCompare(b.loc_name)); // sort locations by name
                    locations = locListe
                    }
                    )
        
    // Authentification
    authStore.subscribe((curr) => {
            // @ts-ignore
            pseudo = curr.data.pseudo;
        });
    // Storage
    const storage = getStorage(app);
    
    let imageChoosen = false;
    let locationSelected = false;
    let fileinput = "";
    let filename = "";
    let avatar, image;
    let newWidth = 800; // resized new width of images before uploading
    let resizedImageURL = "";
    let canvas;
    let imageTitel = "";
    
    // select image from local storage of user
    const onFileSelected =(e)=>{
                filename = e.target.files[0].name
                image = e.target.files[0];
                let reader = new FileReader();
                reader.readAsDataURL(image);
                reader.onload = e => {
                    avatar = e.target.result;
                    // resize image
                    let testIMG = document.createElement("img");
                    testIMG.src = avatar;
                    testIMG.onload = (e2) => {
                        canvas = document.createElement("canvas");
                        let ratio = e2.target ? newWidth / e2.target.width : 0;
                        canvas.width = newWidth;
                        canvas.height = e2.target.height * ratio;
                        let ctx = canvas.getContext('2d');
                        ctx.drawImage(testIMG, 0, 0, canvas.width, canvas.height);
                        resizedImageURL = canvas.toDataURL('image/jpeg', 0.9)
                    };
                };
                imageChoosen = true;
            }
    let thanksForImage = false;

    const onUploadOrder =()=> {
                // 'file' comes from the Blob or File API
                let downloadURL = "";
                const randomFilename = uuidv4();
                const storageRef = ref(storage, `images/${randomFilename}`);
                uploadString(storageRef, resizedImageURL, 'data_url').then((snapshot) => {

                    getDownloadURL(snapshot.ref).then((gotDownloadURL) => {
                        // Use the downloadURL here
                        downloadURL = gotDownloadURL;

                    }).catch((error) => {
                        // Handle any errors
                        console.error(error);
                    }).then(() => {
                        imageChoosen = false;
                        avatar = false;
                        const imagesRef = collection(db,'images');
                        //const date = new Date().toLocaleString('de-de') ;
                        const date = new Date();
                
                        addDoc(imagesRef,
                            {imagename: randomFilename,
                            imagetitel: imageTitel,
                            location: orts_location,
                            uploader: pseudo,
                            uploadDate: date,
                            url: downloadURL}
                        )
                        .then (() => {
                            thanksForImage = true;
                            makeLogEntry(randomFilename);
                        });
                    })
                });
            }
    
    const onSetLocation =(loc_name)=> {
                orts_location = loc_name;
                locationSelected = true;
            }
    
    let docRefOnBreak; // docRef of new location to use on break while uploading new image
    
    const createNewLocation =(value)=> {
                
                if (value) {
                    // check if location already exists
                    const locationExists = locations.some(location => location.loc_name === value);
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
                    addDoc(locationsRef, { loc_name: new_loc }) .then((docref) => { docRefOnBreak = docref }) .catch(error => { console.log(error); });
                    }
                } else {
                 
                orts_location = "z.Z. nicht zugeordnet";
                locationSelected = true;
                }
            }
    
    // break upload process by user
    const onUploadBreak =()=> {
                imageChoosen = false;
                locationSelected = false;
                avatar = false;
                imageTitel = "";
                if (value) {
                    deleteDoc(docRefOnBreak) .then(() => { docRefOnBreak = {} }) .catch((error) => { console.error("Error removing new location: ", error); });
                    }
                value = '';
                return
            }
    
    let setLoadMode = false;

    const setImageTitel = (value) => {
                imageTitel = value;
                if (!value) {
                    imageTitel = "Bild ohne Titel";
                }
            }
    
    let randomColor = () => {
        let characters='0123456789ABCDEF';
        let randomStringR='';
        let randomStringG='';
        let randomStringB='';
        for (let i=0; i<1; i++) {
            let randomIndex=Math.floor(Math.random()*characters.length);
            randomStringR+=characters.charAt(randomIndex);
            };
        for (let i=0; i<1; i++) {
            let randomIndex=Math.floor(Math.random()*characters.length);
            randomStringG+=characters.charAt(randomIndex);
            }
        for (let i=0; i<2; i++) {
            let randomIndex=Math.floor(Math.random()*characters.length);
            randomStringB+=characters.charAt(randomIndex);
            }
        return '#5'+randomStringR+'5'+randomStringG+randomStringB;
        }
    </script>
    <div class="headerContainer">
        {#if !thanksForImage}
        <h2>Bild einstellen</h2>
        <h3>Rechtliche Aspekte:</h3>
        <p>Bei Bildern aus der Zeit vor dem 2. Weltkrieg, um die es hier in erster Linie geht, sind die Rechte in der Regel verjährt.</p>
        <p>Bilder können nach dem Upload jederzeit vom Einsteller wieder gelöscht werden.</p>
        <br>
        <h3>Technische Aspekte:</h3>
        <p>Die Bilder sollten im Format .jpg oder .png vorliegen und eine Mindestbreite ca. 800 Pixeln haben.</p>
        <p>Größere Bilder werden vor dem Upload automatisch auf eine Breite von 800 Pixeln heruntergerechnet, so dass keine langen Ladezeiten entstehen.</p>
        <br>
        {#if avatar}
        <img class="avatar" src="{avatar}" alt="avatar" />
        {:else}
        <img class="avatar" src="https://fakeimg.pl/240x150/cccccc/909090?text=Vorschau" alt="" /> 
        {/if}
        {#if !imageChoosen}
        <img class="chooseImage pulsierend" src="select.png" alt="" on:click={()=>{fileinput.click();}} />
        <h3>Bildauswahl</h3>
        <input style="display:none" type="file" accept=".jpg, .jpeg, .png" on:change={(e)=>onFileSelected(e)} bind:this={fileinput} >
        {:else if (imageChoosen && !imageTitel && !locationSelected)}
        <h4>Erstelle einen Bildtitel:</h4>
        <p>Der Bildtitel wird später auf der Seite des Bildes angezeigt.</p>
        <p>Bitte versuche daher, einen dem Bildinhalt möglichst gut entsprechenden Titel zu finden.</p>
        <p>Ohne Eingabe wird automatisch &raquo;Ohne Titel&laquo; vergeben.</p>
        <p>Du kannst den Bildtitel auch noch nachträglich auf der Bildseite ändern.</p>
        <form on:submit|preventDefault={() => setImageTitel(value)}>
            <label>
                Bildtitel:
                <input bind:value />
            </label>
            <button>Anlegen</button>
            <button on:click={onUploadBreak}>Vorgang abbrechen</button>
        </form>
        {:else if (imageChoosen && imageTitel && !locationSelected)}
        <p>Ordne dem Bild &raquo;{imageTitel}&laquo; eine Örtlichkeit zu:</p>
        <div class="locationContainer">
            {#each locations as value}
                <button style="background: {randomColor()}" on:click={() => onSetLocation(value.loc_name)}>{value.loc_name}</button>
            {/each}
        </div>
        <br>
        <p>Eine passende Örtlichkeit ist nicht in der Liste?</p>
        <form on:submit|preventDefault={() => createNewLocation(value)}>
            <label>
                Neue Örtlichkeit:
                <input bind:value />
            </label>
            <button>Anlegen</button>
            <button on:click={onUploadBreak}>Vorgang abbrechen</button>
        </form>
            {:else}
            <img class="chooseImage pulsierend" src="upload.png" alt="" on:click={onUploadOrder} />
            <div>Bild zu <b>{orts_location || new_loc}</b> hochladen?</div>
            <button on:click={onUploadBreak}>Vorgang abbrechen</button>
        {/if}
        {/if}
        {#if thanksForImage}
            <h3>Vielen Dank für das Bild!</h3>
            <br>
            <div class="btnwrapper">
                <a class="a-btn-blue" on:click={() => {thanksForImage = false; goto(`/upload`)}} on:keydown={() => {}} role="button" href="/upload">Weiteres Bild einstellen?</a>
                
                <a class="a-btn-green" on:click|preventDefault={() => {
                    goto(`/locations/${orts_location}`);
                }}>Weiter zur Ortsseite</a>
            </div>
        {/if}
        <br>
        <br>
        <div class="btnwrapper">
            {#if pseudo}
                <a class="a-btn-red" href="/dashboard" >Zur Hauptseite</a>
            {:else}
                <a class="a-btn-red" href="/">Zur Hauptseite</a>
            {/if}
        </div>
    </div>
    <style>

        h2 {
            margin-bottom: .5rem;
        }
     
        .chooseImage{
            display:flex;
            height:50px;
            cursor:pointer;
        }
        
        .pulsierend {
            animation: pulse 2s infinite;
        }
    
            @keyframes pulse {
            0% {
                transform: scale(0.7);
                }
    
            70% {
                transform: scale(1);
                }
    
            100% {
                transform: scale(0.7);
                }
            }
        
        .avatar{
            display:flex;
            height:150px;
            width:240px;
        }
        
        button { display: inline; }
    </style>
    