<script>
    import { db } from "../firebase";
    import { collection, onSnapshot } from "@firebase/firestore";


    //// get locations (locList) from Firestore
    let locList = [];
    let imagePerLocCounter = [{
        id: 0,
        loc_name: "",
        count: 0
    }];
    const locRef = collection(db, "locations");

    const unsubscribe2 = onSnapshot(locRef, querysnapshot => {
            let locListInsideSnapshot = [];
            querysnapshot.forEach((doc) => {
            let location = { ...doc.data(), id: doc.id};
            locListInsideSnapshot = [location, ...locListInsideSnapshot];  
            })
            locList = locListInsideSnapshot;
            // Location-Liste sortieren
            locList.sort((a, b) => a.loc_name.localeCompare(b.loc_name));
            
            
            for (let i = 0; i < locList.length; i++) {
                
                imagePerLocCounter[i] = {
                    id: i,
                    loc_name: locList[i].loc_name,
                    count: 0
                }
            }
        }
    )

    //// get images (imgList) from Firestore
    let imgList = [];
    const imgRef = collection(db, "images");

    const unsubscribe1 = onSnapshot(imgRef, querysnapshot => {
            let imgListInsideSnapshot = [];
            querysnapshot.forEach((doc) => {
            let image = { ...doc.data(), id: doc.id};
            imgListInsideSnapshot = [image, ...imgListInsideSnapshot];  
            })
            imgList = imgListInsideSnapshot;
            // Image-Liste sortieren
            imgList.sort((a, b) => a.imagename.localeCompare(b.imagename))
            
            for (let i = 0; i < imgList.length; i++) {
                let foundLoc = imagePerLocCounter.find((obj) => obj.loc_name === imgList[i].location); 
                
                if (foundLoc) {
                    imagePerLocCounter[foundLoc.id].count = imagePerLocCounter[foundLoc.id].count + 1;
                }
            }
        }
    )
</script>

<div class="mainContainer">
<center>
    <div class="locationContainer">
        <a href="/upload">Bild einstellen</a>
    </div>
    <br>
    <div class="locationContainer">
        <h3>Zu welchem Ort möchtest Du gehen?</h3>
        
        {#each locList as loc, id(loc)}
            <a href="/locations/{loc.loc_name}">{loc.loc_name} ({imagePerLocCounter[id].count})</a>
        {/each}
    </div>
</center>

</div>

