<script>
    import {app} from "../../firebase.js";
    import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
    import { v4 as uuidv4 } from 'uuid';
    import { db } from "../../firebase";
    import { doc, addDoc, updateDoc, getDoc, deleteDoc, collection, onSnapshot } from "@firebase/firestore";
    import { authStore } from "../../store/store";
    import { goto } from "$app/navigation";
    
    let imgID;

    let oldImageURL = "";
    let ortsLoc = "";
    
    let pseudo = "";
    
      //// get the logbuch from Firestore
    
    async function makeLogEntry(imageName) {
        const imgRef = collection(db, "logbuch");
        const date = new Date();
        addDoc(imgRef, {action: "Upload TodaysImage", image: imageName, user: pseudo, date: date})
        .then(() => {
            //console.log("Logbuch updated");
        })
    }
    
    // Authentification
    authStore.subscribe((curr) => {
            // @ts-ignore
            pseudo = curr.data.pseudo;
            imgID = curr.data.lastViewedImage;
        });

    async function getImage() {
        const imgRef = doc(db, "images", imgID);
        const querySnapshot_img = await getDoc(imgRef);

        if (querySnapshot_img.exists()) {
            
            oldImageURL = querySnapshot_img.data().url;
            ortsLoc = querySnapshot_img.data().location;

        } else {
            console.log("No old image!");
        }
        
        }

    getImage();

    // Storage
    const storage = getStorage(app);
    
    let imageChoosen = false;
    
    let fileinput = "";
    let filename = "";
    let avatar, image;
    let newWidth = 800; // resized new width of images before uploading
    let resizedImageURL = "";
    let canvas;
    
    // select image from local storage of user
    const onFileSelected =(e)=>{
                filename = e.target.files[0].name
                image = e.target.files[0];
                let reader = new FileReader();
                reader.readAsDataURL(image);
                reader.onload = e => {
                    avatar = e.target.result;
                    // resize image
                    let testIMG = document.createElement("img");
                    testIMG.src = avatar;
                    testIMG.onload = (e2) => {
                        canvas = document.createElement("canvas");
                        let ratio = e2.target ? newWidth / e2.target.width : 0;
                        canvas.width = newWidth;
                        canvas.height = e2.target.height * ratio;
                        let ctx = canvas.getContext('2d');
                        ctx.drawImage(testIMG, 0, 0, canvas.width, canvas.height);
                        resizedImageURL = canvas.toDataURL('image/jpeg', 0.9)
                    };
                };
                imageChoosen = true;
            }
    let thanksForImage = false;
    
    const onUploadOrder =()=> {
                // 'file' comes from the Blob or File API
                let downloadURL = "";
                const randomFilename = uuidv4();
                const storageRef = ref(storage, `today/${randomFilename}`);
                uploadString(storageRef, resizedImageURL, 'data_url').then((snapshot) => {
    
                    getDownloadURL(snapshot.ref).then((gotDownloadURL) => {
                        // Use the downloadURL here
                        downloadURL = gotDownloadURL;
    
                    }).catch((error) => {
                        // Handle any errors
                        console.error(error);
                    }).then(() => {
                        imageChoosen = false;
                        avatar = false;
                        const docRef = doc(db,'images', imgID);
                    
                        updateDoc(docRef,
                            {
                            today: true,
                            urltoday: downloadURL,
                            nametoday: randomFilename,
                            uploadertoday: pseudo
                            }
                        )
                        .then (() => {
                            thanksForImage = true;
                            makeLogEntry(randomFilename);
                            
                        });
                    })
                });
            }
    
    
    // break upload process by user
    const onUploadBreak =()=> {
                imageChoosen = false;
                avatar = false;
                return
            }
    
    </script>
    <div class="headerContainer">
        {#if !thanksForImage}
            <h1>Wie schön!</h1>
            <p>Du hast ein aktuelles Bild dieser Ansicht?</p>
            <img src="{oldImageURL}" alt="Alte Ansicht" style="width: 300px;">
            <h2>Bild einstellen</h2>
            <h3>Rechtliche Aspekte:</h3>
            <p>Bitte auch bei diesen Bildern das Bildrecht beachten. Am besten eigene Fotos verwenden.</p>
            <p>Bilder können nach dem Upload jederzeit vom Einsteller wieder gelöscht werden.</p>
            <br>
            <h3>Technische Aspekte:</h3>
            <p>Die Bilder sollten im Format .jpg oder .png vorliegen und eine Mindestbreite ca. 800 Pixeln haben.</p>
            <p>Größere Bilder werden vor dem Upload automatisch auf eine Breite von 800 Pixeln heruntergerechnet, so dass keine langen Ladezeiten entstehen.</p>
            <br>
            {#if avatar}
                <img class="avatar" src="{avatar}" alt="avatar" />
            {:else}
                <img class="avatar" src="https://fakeimg.pl/240x150/cccccc/909090?text=Vorschau" alt="" /> 
            {/if}
            {#if !imageChoosen}
                <img class="chooseImage pulsierend" src="/select.png" alt="" on:click={()=>{fileinput.click();}} />
                <h3>Bildauswahl</h3>
                <input style="display:none" type="file" accept=".jpg, .jpeg, .png" on:change={(e)=>onFileSelected(e)} bind:this={fileinput} >
            {:else}
                <img class="chooseImage pulsierend" src="/upload.png" alt="" on:click={onUploadOrder} />
                <div>Aktuelles Bild zu <b></b> hochladen?</div>
                <button on:click={onUploadBreak}>Vorgang abbrechen</button>
            {/if}
        {/if}

        {#if thanksForImage}
        <h3>Vielen Dank!</h3>
        <p>Dein Bild wurde erfolgreich hochgeladen.</p>
        <br>
        <div class="btnwrapper">
            
            <a class="a-btn-green" on:click|preventDefault={() => {
                goto(`/locations/${ortsLoc}/images/${imgID}`);
            }}>Gleich einmal ansehen?</a>
        </div>
    {/if}
    <br>
    <br>
    <div class="btnwrapper">
        {#if pseudo}
            <a class="a-btn-red" href="/dashboard" >Zur Hauptseite</a>
        {:else}
            <a class="a-btn-red" href="/">Zur Hauptseite</a>
        {/if}
    </div>
        
    </div>
    <style>
    
        h2 {
            margin-bottom: .5rem;
        }
     
        .chooseImage{
            display:flex;
            height:50px;
            cursor:pointer;
        }
        
        .pulsierend {
            animation: pulse 2s infinite;
        }
    
            @keyframes pulse {
            0% {
                transform: scale(0.7);
                }
    
            70% {
                transform: scale(1);
                }
    
            100% {
                transform: scale(0.7);
                }
            }
        
        .avatar{
            display:flex;
            height:150px;
            width:240px;
            border: 1px solid black;
        }
        
        button { display: inline; }
    </style>