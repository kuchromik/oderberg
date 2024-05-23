<script>
    import { onMount } from 'svelte';
    import { goto } from "$app/navigation";
    import { doc, addDoc, deleteDoc, collection, onSnapshot, updateDoc, getDocs, query, where, getDoc } from "@firebase/firestore";
    import { db } from "../firebase";

    let searchString = '';
    let images = [];

    const search = async () => {
        const q = query(collection(db, "images"));
        const querySnapshot = await getDocs(q);
        images = [];
        querySnapshot.forEach((doc) => {
            if(doc.data().imagetitel.includes(searchString)) {
                //images.push(doc);
                images = [...images, { ...doc.data(), id: doc.id, url: doc.data().url }];
            }
        });
    }

  
</script>
<div class="searchinput">
<input type="text" bind:value={searchString} placeholder="im Bildnamen ist enthalten ..." />

<button on:click={search}>Suche starten</button>
</div>

<div class="imagedivision">
    {#each images as image}
        <div>
            <a href="/locations/{image.location}/images/{image.id}">
                <img src={image.url} alt={image.imagetitel} /></a>
            <center>
                <p>{image.imagetitel}</p>
            </center>
        </div>
    {/each}
</div>

<style>
    .searchinput {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
        
    }

    input {
        padding: 5px;
        border: 1px solid #ccc;
        border-radius: 5px;
        font-size: 1.2rem;
    }

    button {
        padding: 5px 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
        font-size: 1.2rem;
        background-color: #f0f0f0;
    }

    .resultlist {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
        grid-auto-rows: minmax(50px, auto);
        gap: 10px;
    }

    .imagedivision {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        align-items: center;
        justify-content: center;
        
    }

    .imagedivision img {
        width: 300px;
        height: auto;
    }
</style>