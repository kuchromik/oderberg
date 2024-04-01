<script>
    import { db, app } from "../../firebase";
    import { collection, getDocs, doc, deleteDoc, updateDoc, onSnapshot } from "@firebase/firestore";
    import { getStorage, ref, listAll, getDownloadURL, deleteObject } from "firebase/storage";
    import { authStore } from "../../store/store";

    let pseudo = "";
     // Authentification
     authStore.subscribe((curr) => {
            // @ts-ignore
            pseudo = curr.data.pseudo;
        });

    let selected_Location;
   
    // get locations (locList) from Firestore
    
    let locListToCleanUp = [];

    async function getLocations() {
        const locRef = collection(db, "locations");
        const querySnapshot_loc = await getDocs(locRef);
        let locListInsideGetDocs = [];
        querySnapshot_loc.forEach((doci) => {
            let location = { ...doci.data(), id: doci.id};
            
            // check if location is empty comming soon
            if (location.loc_name !== "") {
                locListInsideGetDocs = [location, ...locListInsideGetDocs]; 
            }
            else {
                const locRef = doc(db, "locations", location.id);
                deleteDoc(locRef);
                console.log("Location without a name deleted successfully", location.id);
            }
        })
        locListToCleanUp = locListInsideGetDocs;
        locListToCleanUp.sort((a, b) => a.loc_name.localeCompare(b.loc_name));
        
    }

     getLocations();

    // get images (imgList) from Firestore

     // connection to Firebase Storage (images)
    const storage = getStorage(app);
    const listRef = ref(storage, 'images/');
    
    let imgListToCleanUp = [];
    let filteredUrlList = [];

    async function getImages() {
        const imgRef = collection(db, "images");
        const querySnapshot_img = await getDocs(imgRef);
        let imgListInsideGetDocs = [];
        querySnapshot_img.forEach((doc) => {
            let image = { ...doc.data(), id: doc.id};
            if (image.location === "") {
                imgListInsideGetDocs = [image, ...imgListInsideGetDocs]; 
            }
        })
        imgListToCleanUp = imgListInsideGetDocs;
        
        // Load Image-Date for the images which have no location

        for (let i = 0; i < imgListToCleanUp.length; i++) {
            const imagename = imgListToCleanUp[i].imagename;
            const url = await getDownloadURL(ref(storage, `images/${imagename}`));
            filteredUrlList.push(url)
        }
        return filteredUrlList;
    }

    async function setImageLoc(location, url) {

        console.log("STart Location setting: ", location);

        const searchTerm = 'images%2F';
        const indexOfFirst = url.indexOf(searchTerm);

        let imageName = `${url.slice(indexOfFirst + 9,indexOfFirst + 45)}`;

        for (let i = 0; i < imgListToCleanUp.length; i++) {
            if (imgListToCleanUp[i].imagename === imageName) {
                const docRef = doc(db, "images", imgListToCleanUp[i].id);
                await updateDoc(docRef, {
                    location: location
                });
                console.log("Location updated successfully", location);
                
            }
        }
        selected_Location = "";
        window.location.href = "/cleanup"
        
    }
  
</script>


    {#await getImages()}

    <center><i class="fa-solid fa-spinner loadingSpinnerGreen" /></center>
    
    {:then filteredUrlList}
    <center>
        <h1>Hier wird aufgeräumt!</h1>
        <br>
        <h2>Bilder ohne Ortszuweisung:</h2>
        <br>
        <div class="imgContainer">
            {#each filteredUrlList as url}
                <div class="newLocForImage">
                <img src={url} alt="image" class="imgToCleanUp" />
                <br>
                <p>Ort aus bestehender Liste zuweisen:</p>
                <br>
                <!-- <ChooseLocation /> -->
                <select bind:value={selected_Location} on:change ={() => setImageLoc(selected_Location, url)}>
                    {#each locListToCleanUp as location}
                        <option value={location.loc_name}>{location.loc_name}</option>
                    {/each}
                </select>
                </div>
            {/each}
        </div>
        <br>
        {#if pseudo}
        <a class="a-btn-red fixed" href="/dashboard">Zurück zur Hauptseite</a>
        {:else}
        <a class="a-btn-red fixed" href="/">Zurück zur Hauptseite</a>
        {/if}
    </center>
    
    {/await}
<style>
   

    .imgContainer {
        max-width: 80vw;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 1rem;
    }

    .newLocForImage {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 1rem;
    }

    .imgToCleanUp {
        margin: 10px;
        width: 200px;
    }

    .loadingSpinnerGreen {
        font-size: 30px;
        color: #2ecc71;
    }

  
</style>