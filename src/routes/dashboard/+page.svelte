<script>
    import { authStore } from "../../store/store";
    import Merkliste from "$lib/Merkliste.svelte";
    import ChooseLocation from "$lib/ChooseLocation.svelte";
    import Textsearch from "$lib/Textsearch.svelte";
    import { db } from "../../firebase";
    import { doc, getDoc } from "@firebase/firestore";
    import NewestImages from "$lib/NewestImages.svelte";
    import NewestComments from "$lib/NewestComments.svelte";

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
            return;
        }
        
        }
    
    $: if (lastViewedImage) {
        getImage();
    }
    
</script>

<div class="headerContainer">
        {#if pseudo}
        <h3>Hallo {pseudo}</h3>
        {/if}
</div>
{#if ortsLoc != ""}
    <center>
        <p class="small">Dein zuletzt angesehenes Bild in {ortsLoc}</p>
        <a href="/locations/{ortsLoc}/images/{lastViewedImage}">
            <img src={oldImageURL} alt="old image" style="width: 300px; height: auto;">
        </a>
    </center>
{/if}
<br>
<NewestImages/>
<br>
<NewestComments/>
<br>

<ChooseLocation />
<br>
<Textsearch />
<br>
{#if pseudo}
    <Merkliste />
{/if}
<style>
    br {
        margin-top: 1rem;
    }
 
</style>
