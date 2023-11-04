<script>
import {app} from "../firebase.js";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import { db } from "../firebase";
import { addDoc, collection, onSnapshot } from "@firebase/firestore";
import { authStore } from "../store/store";

let locations = [];
let orts_location = "";
let new_loc = "";
let value = ''; //new_loc
let pseudo = "";

const colRef = collection(db, "locations");

const unsubscribe = onSnapshot(colRef, querysnapshot => {
                let locListe = [];
                querysnapshot.forEach((doc) => {
                let location = { ...doc.data(), id: doc.id};
                locListe = [location, ...locListe];
                })
                locations = locListe;
                locations.sort((a, b) => a.loc_name.localeCompare(b.loc_name));
                }
                )
    

authStore.subscribe((curr) => {
        // @ts-ignore
        pseudo = curr.data.pseudo;
    });

const storage = getStorage(app);

let imageChoosen = false;
let loacationSelected = false;
let fileinput = "";
let filename = "";
let  avatar, image;
	
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
            const storageRef = ref(storage, randomFilname);
            uploadBytes(storageRef, image).then((snapshot) => {
            imageChoosen = false;
            avatar = false;
            const imagesRef = collection(db,'images');
            addDoc(imagesRef,
                {imagename: randomFilname,
                location: orts_location,
                uploader: pseudo}
            ).then (() => window.location.href = "/dashboard")
                
            });
}

const onSetLocation =(loc_name)=> {
            
            orts_location = loc_name;
            loacationSelected = true;
        }

const createNewLocation =(value)=> {        
            new_loc = value;
            orts_location = new_loc;
            loacationSelected = true;
            const locationsRef = collection(db, 'locations');
            addDoc(locationsRef, { loc_name: new_loc });
        }


const onUploadBreak =()=> {
            imageChoosen = false;
            loacationSelected = false;
            avatar = false;
            return
        }	
</script>
<div class="headerContainer">
    <br>
	<h3>Neues Bild einstellen</h3>
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
    <br>
    <p>Ordne das Bild einer Örtlichkeit zu:</p>
    <br>
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
    </form>
        {:else}
        <img class="chooseImage pulsierend" src="upload.png" alt="" on:click={onUploadOrder}/>
        <div>Bild zu <b>{orts_location || new_loc}</b> hochladen?</div>
        <br>
        <button on:click={onUploadBreak}>Vorgang abbrechen</button>
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
