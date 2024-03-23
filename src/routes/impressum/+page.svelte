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

    const adminData = {
        name: import.meta.env.VITE_ADMIN_NAME,
        mail: import.meta.env.VITE_ADMIN_MAIL,
        phone: import.meta.env.VITE_ADMIN_PHONE,
        street: import.meta.env.VITE_ADMIN_STREET,
        zip: import.meta.env.VITE_ADMIN_ZIP,
        city: import.meta.env.VITE_ADMIN_CITY
};

</script>

<main>
    <center>
    <h1>Impressum</h1>
    <br>
    <small>Die folgenden Angaben entsprechen den Vorgaben von § 5 TMG:</small>
    <p>{adminData.name}</p>

    <p>{adminData.zip} {adminData.city}, {adminData.street}</p>

    <p>{adminData.mail}</p>

    <p>{adminData.phone}</p>
    <br>
    <h4>Haftung für Inhalte:</h4>
    <br>
    <p>Im Sinne von § 7 Absatz 1 TMG sind wir für die eigenen Inhalte auf dieser Webseite verantwortlich. Durch §§ 8 bis einschließlich 10 TMG sind wir aber nicht verpflichtet, gespeicherte oder übermittelte fremde Inhalte zu überwachen oder diese auf Rechtswidrigkeit zu prüfen. Das befreit uns jedoch nicht von der Pflicht, der Sperrung und Entfernung von Informationen nach geltenden Gesetzen nachzukommen.</p>
    <br>
    {#if pseudo === "Horst Kippowski"}
    <a class="a-btn-green" href="/cleanup">Aufräumen</a>
    {/if}
    <br>
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
