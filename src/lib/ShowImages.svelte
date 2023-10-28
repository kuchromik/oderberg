<script>
    import {app} from "../firebase.js";
    import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
    const storage = getStorage(app);
    const listRef = ref(storage, '');

    
    let promise = imageload();


    async function imageload() {
        let urlList = [];
        const res = await listAll(listRef);
        for (let itemRef of res.items) {
        let url = await getDownloadURL(ref(itemRef));
        urlList.push(url)
        }
        if (res) {
            return urlList
        } else {
            throw new Error('Probleme')
        }
    }
</script>
<div>
    <div>
        <center><h1>Aktuelle Bilder</h1></center>
        <br>
        {#await promise}
	    <center><p>...waiting</p></center>
        {:then urlList}
        {#each urlList as url}
        <div class="images">
          <img src = "{url}" alt="Image from Firebase">
          <br>
        </div>
        {/each}
        {:catch error}
	    <p style="color: red">{error.message}</p>
        {/await}
      </div>
</div>
<style>
.images {
    margin: auto;
    display: flex;
    flex-direction: column;
	align-items: center;
	justify-content: center;
	
}
.images img {
    max-width: 80vw;
}
</style>