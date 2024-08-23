<script>
    import Header from "$lib/Header.svelte";
    import Footer from "$lib/Footer.svelte";

    import { onMount } from "svelte";
    import { auth, db } from "../firebase";
    import { getDoc, doc, setDoc } from "@firebase/firestore";
    import { authStore } from "../store/store";
    import { goto } from '$app/navigation';

    onMount(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            
            const currentPath = window.location.pathname;

            if (!user) {
                let storeDataClear = {
                        email: "",
                        pseudo: "",
                        todos: [],
                    };
                
                authStore.update((curr) => {
                    return {
                        ...curr,
                        user,
                        data: storeDataClear,
                        loading: false,
                        };
                    });
                goto(currentPath);
                return;
            } // close if (!user)

            if (user ) { 
                let dataToSetToStore;
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                
                if (!docSnap.exists()) {
                    const userRef = doc(db, "users", user.uid);
                    dataToSetToStore = {
                        email: user.email,
                        pseudo: "",
                        todos: [],
                    };
                    await setDoc(userRef, dataToSetToStore, { merge: true });
                    authStore.update((curr) => {
                        return {
                            ...curr,
                            user,
                            data: dataToSetToStore,
                            loading: false,
                        };
                    });
                    goto("/pseudonym");
                    return;
                } // close if (!docSnap.exists())
                // begin else if user exists in firestore
                else {
                    const userData = docSnap.data();
                    dataToSetToStore = userData;

                    authStore.update((curr) => {
                        return {
                        ...curr,
                            user,
                            data: dataToSetToStore,
                            loading: false,
                        };
                    });
                    
                    goto("/dashboard");
                return;
                }
            
              
            } // close if (user && currentPath === "/")

        }) // close onAuthStateChanged
        return unsubscribe;
    }) // close onMount

   
</script>
<div class="mainContainer">
<Header />
<slot></slot>
<Footer />
</div>
