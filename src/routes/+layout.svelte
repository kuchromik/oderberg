<script>
    import Header from "$lib/Header.svelte";
    import Footer from "$lib/Footer.svelte";

    import { onMount, onDestroy } from "svelte";
    import { auth, db } from "../firebase";
    import { getDoc, doc, setDoc } from "@firebase/firestore";
    import { authStore } from "../store/store";
    import { goto } from '$app/navigation';
    import { onNavigate } from '$app/navigation';


    // only to show the page transition
    onNavigate((navigation) => {
	if (!document.startViewTransition) return;

	return new Promise((resolve) => {
		document.startViewTransition(async () => {
			resolve();
			await navigation.complete;
		});
	});
    });

    const nonAuthRoutes = ["/", "/impressum"];


    onMount(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            
            const currentPath = window.location.pathname;

            if (!user) {
                if (nonAuthRoutes.includes(currentPath)) {
                    goto(currentPath);
                    return;
                } else {
                    goto("/");
                    return;
                }
            } 
            


            if (user && currentPath === "/") {
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
                } else {
                    const userData = docSnap.data();
                    dataToSetToStore = userData;
            }
            
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

        })
        return unsubscribe;
    })
</script>
<div class="mainContainer">
<Header />
<slot></slot>
<Footer />
</div>
<!--styles belongs to onNavigate-->
<style>
    
    @keyframes fade-in {
	from {
		opacity: 0;
	}
}

@keyframes fade-out {
	to {
		opacity: 0;
	}
}

@keyframes slide-from-right {
	from {
		transform: translateX(30px);
	}
}

@keyframes slide-to-left {
	to {
		transform: translateX(-30px);
	}
}

:root::view-transition-old(root) {
	animation: 90ms cubic-bezier(0.4, 0, 1, 1) both fade-out, 300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-to-left;
}

:root::view-transition-new(root) {
	animation: 210ms cubic-bezier(0, 0, 0.2, 1) 90ms both fade-in, 300ms cubic-bezier(0.4, 0, 0.2, 1) both
			slide-from-right;
}
</style>