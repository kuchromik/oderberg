<script>
    import { authStore } from "../../store/store";
    import Merkliste from "$lib/Merkliste.svelte";
    import ChooseLocation from "$lib/ChooseLocation.svelte";
    import Textsearch from "$lib/Textsearch.svelte";
    import { db } from "../../firebase";
    import { doc, getDoc } from "@firebase/firestore";

    let todoList = [];
    let pseudo = "";
    let lastViewedImage = "";
    let oldImageURL = "";
    let ortsLoc = "";
   
    
    authStore.subscribe((curr) => {
        
        todoList = curr.data.todos;
        pseudo = curr.data.pseudo;
        lastViewedImage = curr.data.lastViewedImage;
    });

   
        async function getImage() {
        if (!lastViewedImage) {
            return;
        }
        const imgRef = doc(db, "images", lastViewedImage);
        const querySnapshot_img = await getDoc(imgRef);

        if (querySnapshot_img.exists()) {
            
            oldImageURL = querySnapshot_img.data().url;
            ortsLoc = querySnapshot_img.data().location;

        } else {
            console.log("No old image!");
        }
        
        }
    
    getImage();
    
console.log("In dashboard pseudo: ", pseudo);

const storedUserData = localStorage.getItem('user')

if (storedUserData) {
  const userData = JSON.parse(storedUserData)
  console.log('User data in local storage: ', userData)
} else {
  console.log('User data not found in local storage')
}

</script>

<div class="headerContainer">
        {#if pseudo}
        <h3>Hallo {pseudo}</h3>
        {/if}
</div>
{#if lastViewedImage}
    <center>
        <p>Dein zuletzt angesehenes Bild in {ortsLoc}</p>
        <a href="/locations/{ortsLoc}/images/{lastViewedImage}">
            <img src={oldImageURL} alt="old image" style="width: 300px; height: auto;">
        </a>
    </center>
{/if}

<ChooseLocation />
<br>
<Textsearch />
<br>
{#if pseudo}
    <Merkliste />
{/if}
<style>
</style>
