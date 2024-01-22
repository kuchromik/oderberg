<script>
    import { authStore } from "../../store/store";
    export let name = 'Kai-Uwe Chromik';
    export let address = 'Wiesenauer Straße 6, 15295 Groß Lindow';
    export let email = 'kai.chromik@online.de';
    export let phone = '+49 151 52457061';

    let pseudo = "";

     // Authentification
     authStore.subscribe((curr) => {
            // @ts-ignore
            pseudo = curr.data.pseudo;
        });

</script>

<main>
    <center>
    <h1>Impressum</h1>
    <br>
    <p>{name}</p>

    <p>{address}</p>

    <p>{email}</p>

    <p>{phone}</p>
    <br>
    {#if pseudo}
    <a class="a-btn-red" href="/dashboard">Zurück zur Hauptseite</a>
    {:else}
    <a class="a-btn-red" href="/">Zurück zur Hauptseite</a>
    {/if}
    <br>
    <br>
    </center>
</main>
