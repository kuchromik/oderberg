<script>
    import {app} from "../../firebase.js";
    import { getStorage, ref, uploadString } from "firebase/storage";
    import { v4 as uuidv4 } from 'uuid';
    import { db } from "../../firebase";
    import { addDoc, deleteDoc, collection, onSnapshot } from "@firebase/firestore";
    import { authStore } from "../../store/store";
    
    let locations = []; // array of locations
    let orts_location = "";
    let new_loc = "";
    let value = ''; //new_loc
    let pseudo = "";
    
    const colRef = collection(db, "locations"); // reference to locations collection at firestore
    
    const unsubscribe = onSnapshot(colRef, querysnapshot => {
                    let locListe = [];
                    querysnapshot.forEach((doc) => {
                    let location = { ...doc.data(), id: doc.id};
                    locListe = [location, ...locListe];
                    })
                    locations = locListe;
                    locations.sort((a, b) => a.loc_name.localeCompare(b.loc_name)); // sort locations by name
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
    let loacationSelected = false;
    let fileinput = "";
    let filename = "";
    let  avatar, image;
    let newWidth = 800; // resized new width of images before uploading
    let resizedImageURL = "";
    let canvas;
    
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
                        console.log(image);
                        let ctx = canvas.getContext('2d');
                        console.log(ctx);
                        ctx.drawImage(testIMG, 0, 0, canvas.width, canvas.height);
                        resizedImageURL = canvas.toDataURL('image/jpeg', 0.9);
                        console.log(resizedImageURL)
                    };
                };
                imageChoosen = true;
            }
    
    const onUploadOrder =()=> {
                // 'file' comes from the Blob or File API
                const randomFilname = uuidv4();
                const storageRef = ref(storage, `images/${randomFilname}`);
                uploadString(storageRef, resizedImageURL, 'data_url').then((snapshot) => {
                imageChoosen = false;
                avatar = false;
                const imagesRef = collection(db,'images');
                //const date = new Date().toLocaleString('de-de') ;
                const date = new Date();
                addDoc(imagesRef,
                    {imagename: randomFilname,
                    location: orts_location,
                    uploader: pseudo,
                    uploadDate: date}
                ).then (() => window.location.href = "/dashboard")
                    
                });
    }
    
    const onSetLocation =(loc_name)=> {
                
                orts_location = loc_name;
                loacationSelected = true;
            }
    
    let docRefOnBreak; // docRef of new location to use on break while uploading new image
    
    const createNewLocation =(value)=> {        
                new_loc = value;
                orts_location = new_loc;
                loacationSelected = true;
                const locationsRef = collection(db, 'locations');
                addDoc(locationsRef, { loc_name: new_loc }) .then((docref) => { docRefOnBreak = docref }) .catch(error => { console.log(error); });
                
            }
    
    // break upload process by user
    const onUploadBreak =()=> {
                imageChoosen = false;
                loacationSelected = false;
                avatar = false;
                if (value) {
                    deleteDoc(docRefOnBreak) .then(() => { docRefOnBreak = {} }) .catch((error) => { console.error("Error removing new location: ", error); });
                    }
                value = '';
                return
            }
    
    let setLoadMode = false;
    
    </script>
    <div class="headerContainer">
        <h2>Bild einstellen</h2>
        <h4>Rechtliche Aspekte:</h4>
        <p>Bei Bildern aus der Zeit vor dem 2. Weltkrieg, um die es hier in erster Linie geht, sind die Rechte in der Regel verjährt.</p>
        <p>Im Zweifel sollte fachlicher Rat eingeholt werden.</p>
        <br>
        <h4>Technische Aspekte:</h4>
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
        <h4>Bildauswahl</h4>
        <input style="display:none" type="file" accept=".jpg, .jpeg, .png" on:change={(e)=>onFileSelected(e)} bind:this={fileinput} >
        {:else if (imageChoosen && !loacationSelected)}
        <p>Ordne das Bild einer Örtlichkeit zu:</p>
        <div class="locationContainer">
            {#each locations as value}
                <button on:click={() => onSetLocation(value.loc_name)}>{value.loc_name}</button>
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
            <img class="chooseImage pulsierend" src="upload.png" alt="" on:click={onUploadOrder}/>
            <div>Bild zu <b>{orts_location || new_loc}</b> hochladen?</div>
            <button on:click={onUploadBreak}>Vorgang abbrechen</button>
        {/if}
        <br>
        {#if pseudo}
        <a class="a-btn-red" on:click={onUploadBreak} href="/dashboard">Zurück zur Hauptseite</a>
        {:else}
        <a class="a-btn-red" href="/">Zurück zur Hauptseite</a>
        {/if}
        
    </div>
    <style>
     
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
    