<script>
    import {app} from "../../firebase.js";
    import { getStorage, ref, uploadBytes } from "firebase/storage";
    import { v4 as uuidv4 } from 'uuid';
    import { db } from "../../firebase";
    import { doc, getDocs, addDoc, deleteDoc, collection, onSnapshot, query, where, } from "@firebase/firestore";
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
    
    // select image from local storage of user
    const onFileSelected =(e)=>{
                filename = e.target.files[0].name
                image = e.target.files[0];
                let reader = new FileReader();
                reader.readAsDataURL(image);
                reader.onload = e => {
                avatar = e.target.result
                };
                imageChoosen = true;
            }
    
    const onUploadOrder =()=> {
                // 'file' comes from the Blob or File API
                const randomFilname = uuidv4();
                const storageRef = ref(storage, `images/${randomFilname}`);
                uploadBytes(storageRef, image).then((snapshot) => {
                imageChoosen = false;
                avatar = false;
                const imagesRef = collection(db,'images');
                const date = new Date().toLocaleString('de-de') ;
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
        {#if !setLoadMode}
        <button style="background-color:seagreen;" on:click={() => setLoadMode = true}><h4>page.svelte: Neues Bild einstellen</h4></button>
        {:else}
        <button style="background-color:brown;" on:click={() => setLoadMode = false}><h4>Abbruch Bild einstellen</h4></button>
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
    