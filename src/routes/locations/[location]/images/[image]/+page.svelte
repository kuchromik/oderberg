<script>
	import { app } from "../../../../../firebase";
    import { db } from "../../../../../firebase";
    import { doc, addDoc, deleteDoc, collection, onSnapshot, updateDoc, getDocs } from "@firebase/firestore";
    import { authStore } from "../../../../../store/store";

    /** @type {import('./$types').PageData} */
	export let data;
	
     // get userinfo
     let pseudo = "";
    authStore.subscribe((curr) => {
        // @ts-ignore
        pseudo = curr.data.pseudo;
    });

     //// get the image from Firestore
    let url = "";

    async function getImages() {
        const imgRef = collection(db, "images");
        const querySnapshot_img = await getDocs(imgRef);
        
        querySnapshot_img.forEach((doc) => {
            
            if (doc.id === data.post.image) {
                url = doc.data().url;
            }
        })
        
    }
    getImages();
</script>
<center>
    <h1>Einzelbild</h1>
    <p>{data.post.location}</p>
    <p>{data.post.image}</p>
    <img src={url} alt="Bild" style="width: 50%; height: auto;">
</center>
