<script>
import { db, app } from "../../firebase";
import { collection, getDocs, doc, deleteDoc, updateDoc, onSnapshot } from "@firebase/firestore";
import { getStorage, ref, listAll, getDownloadURL, deleteObject } from "firebase/storage";

 // get images (imgList) from Firestore

     // connection to Firebase Storage (images)
    const storage = getStorage(app);
    const listRef = ref(storage, 'images/');
    
    let imgListToCleanUp = [];
    let filteredUrlList = [];
    const imgRef = collection(db, "images");

    async function getImages() {
        
        const unsub = onSnapshot(imgRef, (snapshot) => {
        snapshot.forEach((doc) => {
            console.log("Current data: ", doc.data());
            });
        

        let imgListInsideGetDocs = [];
        snapshot.forEach((doc) => {
            let image = { ...doc.data(), id: doc.id};
            if (image.location === "") {
                imgListInsideGetDocs = [image, ...imgListInsideGetDocs]; 
            }
        })
        imgListToCleanUp = imgListInsideGetDocs;
        console.log("Imagelist", imgListToCleanUp);
        
        // Load Image-Date for the images which have no location

        for (let i = 0; i < imgListToCleanUp.length; i++) {
            const imagename = imgListToCleanUp[i].imagename;
            const url = getUrl(imagename);
            
        }
        console.log("URL Liste", filteredUrlList);
        return filteredUrlList;
        });
    }


    async function getUrl(imagename) {
        const url = await getDownloadURL(ref(storage, `images/${imagename}`));
        console.log("URL", url);
        filteredUrlList.push(url)
        return url;
    }

    getImages().then((filteredUrlList) => {
        console.log("filteredUrlList", filteredUrlList);
    });

</script>
<center>
<h1>Testseite</h1>

{#if filteredUrlList}
    {#each filteredUrlList as url}
        <img src={url} alt="image" style="width: 300px"/>
        <br>
    {/each}
    <br>
{/if}
</center>
