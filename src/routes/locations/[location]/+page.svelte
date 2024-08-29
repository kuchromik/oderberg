<script>
    import { app } from "../../../firebase";
    import { getStorage, ref, deleteObject } from "firebase/storage";
    import { db } from "../../../firebase";
    import { doc, deleteDoc, collection, onSnapshot, getDocs, where, query } from "@firebase/firestore";
    import { authStore } from "../../../store/store";

    
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';


	/** @type {import('./$types').PageData} */
	export let data;
	let choosedLocation = data.post.title;

    // get userinfo
    let pseudo = "";
    authStore.subscribe((curr) => {
        // @ts-ignore
        pseudo = curr.data.pseudo;
    });

    // connection to Firebase Storage (images)
    const storage = getStorage(app);

    //// get locations from Firestore

    let locList = [];

    async function getLocations() {
        const locRef = collection(db, "locations");
        const querySnapshot_loc = await getDocs(locRef);
        let locListInsideGetDocs = [];
        querySnapshot_loc.forEach((doci) => {
            let location = { ...doci.data(), id: doci.id};
        
            // check if location is empty and delete empty location
            if (location.loc_name !== "") {
                locListInsideGetDocs = [location, ...locListInsideGetDocs]; 
            }
            else {
                const locRef = doc(db, "locations", location.id);
                deleteDoc(locRef);
                //console.log("Location without a name deleted successfully", location.id);
            }
        })
    // generate an aphabetical sorted list of locations without the location "z.Z. nicht zugeordnet"
    locList = locListInsideGetDocs.filter(location => location.loc_name !== "z.Z. nicht zugeordnet");
    locList.sort((a, b) => a.loc_name.localeCompare(b.loc_name));
    }

 getLocations();

    //// get images (imgList) from Firestore
    let imgList = [];

    const imgRef = query(collection(db, "images"), where("location", "==", choosedLocation));

    const unsubscribe1 = onSnapshot(imgRef, querysnapshot => {
            let imgListInsideSnapshot = [];
            querysnapshot.forEach((doc) => {
            let image = { ...doc.data(), id: doc.id};
            imgListInsideSnapshot = [image, ...imgListInsideSnapshot];  
            })
            // sort Imagelist by date
            imgList = imgListInsideSnapshot.sort(
                (b, a) => Number(a.uploadDate) - Number(b.uploadDate)
                )
        }
    )

    //// get comments (comList) from Firestore

    let comList = [];
    const comRef = collection(db, "comments");
    let comListReady = false; // wait for comList to be ready

    const unsubscribe3 = onSnapshot(comRef, querysnapshot => {
            let comListInsideSnapshot = [];
            querysnapshot.forEach((doc) => {
            let comment = { ...doc.data(), id: doc.id};
            comListInsideSnapshot = [comment, ...comListInsideSnapshot];  
            })
            comList = comListInsideSnapshot;
            // Comment-Liste sortieren
            comList.sort((a, b) => b.date - (a.date));
            comListReady = true
            })
            
   function countComments(i) {
        let commentCounter = 0;
        comList.forEach(com => {
            if (com.image === imgList[i].imagename) {
                commentCounter++
                }
            })
        return commentCounter;
    }
</script>

<div class="mainContainer">
<center>
    {#if choosedLocation}
        <div>
        <center><h1>{choosedLocation}</h1></center>
        <br>
        <div class="imagedivision">
        {#each imgList as img, i (i)}
            <div class="">
                <div class="image">
                    <a href="/locations/{img.location}/images/{img.id}"><img src = "{img.url}" alt="Image from Firebase"></a>
                    <div class="greenForToday" transition:fly={{ delay: (i*100), duration: 300, x: 100, y: 500, opacity: 0.5, easing: quintOut }}>
                    {#if img.today}
                        <p>Heutige Ansicht verfügbar</p>
                    {/if}
                    </div>
                </div>
                <p>{img.imagetitel}</p>
                
                {#if comListReady}
                    {#if countComments(i) === 1}
                        <small><b>1</b> Kommentar</small>
                    {:else if countComments(i) === 0}
                        <small>Keine Kommentare</small>
                    {:else}
                        <small><b>{countComments(i)}</b> Kommentare</small>
                    {/if}
                {/if}
            </div>
        {/each}
        <br>
        </div>
    </div>
    {/if}
</center>
</div>
<div class="mainPageButtonOnRight">
    <div class="btnwrapper">
        {#if pseudo}
            <a class="a-btn-red fixed" href="/dashboard">Zur Hauptseite</a>
        {:else}
            <a class="a-btn-red fixed" href="/">Zur Hauptseite</a>
        {/if}
    </div>
</div>
<style>
.image {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.greenForToday {
    position: absolute;
    top: 0;
    left: 0;
    background-color: white;
    margin: 3px;
    padding: 3px;
    border-radius: 3px;
}

.greenForToday p {
    color: green;
    font-size: 0.8rem;
    font-weight: bold;
}

.fixed {
  position: fixed;
  top: 92%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.mainPageButtonOnRight {
    position: fixed;
    top: 90%;
    right: 12%;
    transform: translate(-50%, -50%);
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