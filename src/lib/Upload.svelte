<script>
import {app} from "../firebase.js";
import { getStorage, ref, uploadBytes } from "firebase/storage";



const storage = getStorage(app);

let imageChoosen = false;
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
            const storageRef = ref(storage, filename );
            uploadBytes(storageRef, image).then((snapshot) => {
            console.log('Uploaded a blob or file!');
            imageChoosen = false;
            avatar = false;
            window.location.href = "/dashboard";
            });
}



	
</script>
<div id="app">
	<h1>Upload Image</h1>
  
        {#if avatar}
        <img class="avatar" src="{avatar}" alt="avatar" />
        {:else}
        <img class="avatar" src="https://fakeimg.pl/240x150/cccccc/909090?text=Vorschau" alt="" /> 
        {/if}
        {#if imageChoosen}
        <button class="pulsierend" on:click={onUploadOrder}>ausgewähltes Bild hochladen</button>
        {:else}
		<img class="chooseImage pulsierend" src="upload.png" alt="" on:click={()=>{fileinput.click();}} />
        <div class="chan">Bildauswahl</div>
        <input style="display:none" type="file" accept=".jpg, .jpeg, .png" on:change={(e)=>onFileSelected(e)} bind:this={fileinput} >
        {/if}
</div>
<style>
	#app{
	    display:flex;
		align-items:center;
		justify-content:center;
		flex-flow:column;
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
    button {
        margin: 3ch;
    }
</style>
