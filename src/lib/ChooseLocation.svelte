<script>
    import { db } from "../firebase";
    import { collection, onSnapshot } from "@firebase/firestore";
    import { authStore } from "../store/store";

    let pseudo = "";

    let colorField = ["#2c5d14", "#335422", "#374b2c", "#3a4135", "#3b383d", "#3a2e45", "#38244d"]

     // Authentification
     authStore.subscribe((curr) => {
            // @ts-ignore
            pseudo = curr.data.pseudo;
        });

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
            if (location.loc_name) {
            locListInsideSnapshot = [location, ...locListInsideSnapshot];
            }
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

    let randomColor = () => {
        let characters='0123456789ABCDEF';
        let randomStringR='';
        let randomStringG='';
        let randomStringB='';
        for (let i=0; i<1; i++) {
            let randomIndex=Math.floor(Math.random()*characters.length);
            randomStringR+=characters.charAt(randomIndex);
            };
        for (let i=0; i<1; i++) {
            let randomIndex=Math.floor(Math.random()*characters.length);
            randomStringG+=characters.charAt(randomIndex);
            }
        for (let i=0; i<2; i++) {
            let randomIndex=Math.floor(Math.random()*characters.length);
            randomStringB+=characters.charAt(randomIndex);
            }
        return '#5'+randomStringR+'5'+randomStringG+randomStringB;
        }
</script>

<div class="mainContainer">
    <center>
    <h3>Zu welchem Ort möchtest Du gehen?</h3>
    <br>
    <div class="imagedivision">
        
        {#each locList as loc, id(loc)}
            {#if (imagePerLocCounter[id].count)}
                <a class="a-btn-green-location" style="background: {randomColor()}" href="/locations/{loc.loc_name}">{loc.loc_name} ({imagePerLocCounter[id].count})</a>
            {/if}
        {/each}
    </div>   
    <br>
    <br>
    <p><b>Insgesamt {imgList.length} eingestellte Bilder</b></p>
    <br>
    {#if pseudo}
    <div>
        <a class="a-btn-blue" href="/upload">Neues Bild einstellen</a>
    </div>
    {:else}
    <center>
        <p>Bitte registriere Dich oder melde Dich an, um weitere Bilder einzustellen</p>
    </center>
    {/if}
</center>
</div>
<style>
    .imagedivision {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: center;
    }

</style>
