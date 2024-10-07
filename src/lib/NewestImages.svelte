<script>
    import { db } from "../firebase";
    import { getDocs, query, collection, orderBy } from "@firebase/firestore";
    import { fade } from 'svelte/transition';
    
    //// get images (imgList) from Firestore
    let imgList = [];
    let lastUploaded = [];
    const imgRef = collection(db, "images");

    const getImages = async () => {
        const querySnapshot = await getDocs(
            query(imgRef, orderBy("uploadDate", "desc"))
            // orderBy("timestamp", "desc") for ordering in descending order
            );
       
        querySnapshot.forEach((doc) => {
            
            imgList = [...imgList, { ...doc.data(), id: doc.id }];
        });
        lastUploaded = imgList.slice(0, 3);
      
    }

    getImages();

   

</script>
<center>
    <h3>Die drei neuesten Bilder:</h3>
    <div class="newestImages">
        {#each lastUploaded as img, i (i)}
        <div transition:fade={{ delay: i * 250, duration: 300 }}>
            <a href="/locations/{img.location}/images/{img.id}"><img src={img.url} alt="Bild von Firebase" /></a>
            <small>von {img.uploader}</small>
        </div>
        {/each}
    </div>
</center>
<style>
    .newestImages {
        display: grid;
        max-width: 1000px;
        grid-template-columns: repeat(1, 1fr);
        gap: 1rem;
        
        justify-content: space-evenly;
        justify-items: center;
        align-content: space-evenly;
        align-items: center;
    }

    .newestImages img {
        width: 100%;
        height: auto;
    }
</style>