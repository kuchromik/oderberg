<script>
    import { db } from "../firebase";
    import { doc, getDocs, getDoc, query, collection, orderBy } from "@firebase/firestore";
    import { fade } from 'svelte/transition';
   
    
    //// get comments (comList) from Firestore
    let comList = [];
    let lastComments = [];
    let imageID = "";
    const comRef = collection(db, "comments");


    const getComments = async () => {
        const querySnapshot = await getDocs(
            query(comRef, orderBy("lastmodified", "desc"))
            // orderBy("timestamp", "desc") for ordering in descending order
            );
       
        querySnapshot.forEach((doc) => {
            
            comList = [...comList, { ...doc.data(), id: doc.id }];

            imageID = (doc.data().imageID);

        });
        lastComments = comList.slice(0, 10);
    
        for (let i = 0; i < lastComments.length; i++) {
            lastComments[i].location = await asignLocation(lastComments[i].imageID);
            lastComments[i].url = await asignUrl(lastComments[i].imageID);
        }
      
    }

    getComments();

    const asignLocation = async (imageID) => {
        const imgRef = doc(db, "images", imageID);
        const querySnapshot_img = await getDoc(imgRef);
        if (querySnapshot_img.exists()) {
            return querySnapshot_img.data().location;
        } else {
            return;
        }
    }

    const asignUrl = async (imageID) => {
        const imgRef = doc(db, "images", imageID);
        const querySnapshot_img = await getDoc(imgRef);
        if (querySnapshot_img.exists()) {
            return querySnapshot_img.data().url;
        } else {
            return;
        }
    }
   

</script>
<div>
<center>
    <h3>Die letzten Kommentare:</h3>
    <div class="newestCommentBox">
        {#each lastComments as comment, i (i)}
        <div class="newestComment" transition:fade={{ delay: 1000 + i * 400, duration: 300 }}>
            <p class="commentcolor">&#187;{comment.comment}&#171;</p>
            <a href="/locations/{comment.location}/images/{comment.imageID}"><img class="thumb" src={comment.url} alt="Bild von Firebase" /></a>
            <small>von {comment.author}</small>
        </div>
        {/each}
    </div>
</center>
</div>
<style>
    p {
        margin-top: .5rem;
    }
    .commentcolor {
            color: navy;
            font-style: italic;
            font-weight: 500;
        }

    .newestComment { 
        display: grid;
        grid-auto-flow: row;
        gap: .3rem;
        justify-content: space-evenly;
        justify-items: center;
        align-content: space-evenly;
        align-items: center;
        background-color: #ddd;
        border-radius: 4px;
        padding: .5rem;
        max-width: 1000px;
    }

    .newestCommentBox {
        display: grid;
        grid-auto-flow: row;
        max-width: 1000px;
        background-color: #ddd;
        border-radius: 4px;
       
        gap: .3rem;
        max-height: 12rem;
        overflow-y: auto;
        
    }

    .thumb {
        width: 100px;
        height: auto;
        border-radius: 4px;
    }
   
</style>