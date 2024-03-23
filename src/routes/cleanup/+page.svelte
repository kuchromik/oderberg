<script>
    import { db } from "../../firebase";
    import { app } from "../../firebase";
    import { collection, getDocs, doc, deleteDoc, updateDoc, onSnapshot } from "@firebase/firestore";
    import { getStorage, ref, listAll, getDownloadURL, deleteObject } from "firebase/storage";

    // connection to Firebase Storage (images)
    const storage = getStorage(app);
    const listRef = ref(storage, 'images/');

     // get locations (locList) from Firestore
    
     let locListToCleanUp = [];

    async function getLocations() {
    const locRef = collection(db, "locations");
    const querySnapshot_loc = await getDocs(locRef);
        let locListInsideGetDocs = [];
        querySnapshot_loc.forEach((doc) => {
            let image = { ...doc.data(), id: doc.id};
            
            // check if location is empty
            
            locListInsideGetDocs = [image, ...locListInsideGetDocs]; 
            
        })
        locListToCleanUp = locListInsideGetDocs;
    }

    // get images (imgList) from Firestore
    
    let imgListToCleanUp = [];

    async function getImages() {
        const imgRef = collection(db, "images");
        const querySnapshot_img = await getDocs(imgRef);
            let imgListInsideGetDocs = [];
            querySnapshot_img.forEach((doc) => {
                let image = { ...doc.data(), id: doc.id};
                
                // check if location is empty
                if (image.location === "") {
                imgListInsideGetDocs = [image, ...imgListInsideGetDocs]; 
                }
            })
            imgListToCleanUp = imgListInsideGetDocs;
            
    }

    //// Load all images in storage
    let promise = imageload();
    let urlList = [];
    let urlListByDate = [];

    async function imageload() {
        const res = await listAll(listRef);
        for (let itemRef of res.items) {
        let url = await getDownloadURL(ref(itemRef));
        urlList.push(url)
        }
        if (res) {
            for (let i = 0; i < imgListToCleanUp.length; i++) {
                const substr = imgListToCleanUp[i].imagename;
                const subArr = urlList.filter(str => str.includes(substr));
                urlListByDate.push(subArr[0]);
            }
            return urlListByDate
        } else {
            throw new Error('Probleme')
        }
    }


    getImages();
    getLocations();

    function setImageLoc(location, url) {

        const searchTerm = 'images%2F';
        const indexOfFirst = url.indexOf(searchTerm);

        let imageName = `${url.slice(indexOfFirst + 9,indexOfFirst + 45)}`;

        for (let i = 0; i < imgListToCleanUp.length; i++) {
            if (imgListToCleanUp[i].imagename === imageName) {
                const docRef = doc(db, "images", imgListToCleanUp[i].id);
                updateDoc(docRef, {
                    location: location
                });
                console.log("Location updated successfully", location);
            }
        }

        

        // delete image from storage
        //const docRef = doc(db, "images", imageID);
        //deleteDoc(docRef);
        //console.log("Image deleted from Store successfully", imageID);
    
    }

    let selected_Location;
        
</script>



{#await promise}

<center><i class="fa-solid fa-spinner loadingSpinner" /></center>
{:then urlListByDate}
    <center>
        <h1>Hier wird aufgeräumt!</h1>
        <br>
        <h2>Bilder ohne Ortszuweisung:</h2>
        <br>
        <div class="imgContainer">
            {#each urlListByDate as url}
                <img src={url} alt="image" class="imgToCleanUp" />
                <br>
                <p>Ort aus bestehemder Liste zuweisen:</p>
                <br>
                <!-- <ChooseLocation /> -->
                <select bind:value={selected_Location} on:change ={() => setImageLoc(selected_Location, url)}>
                    {#each locListToCleanUp as location}
                        <option value={location.loc_name}>{location.loc_name}</option>
                    {/each}
                </select>
            {/each}
        </div>
    </center>
{:catch error}
    <center><p>{error.message}</p></center>
{/await}