<script>
    import { authStore } from "../../store/store";
    export let name = 'Kai-Uwe Chromik';
    export let address = 'Wiesenauer Straße 6, 15295 Groß Lindow';
    export let email = 'kai.chromik@online.de';
    export let phone = '+49 151 52457061';

    let pseudo = "";

    let localName = import.meta.env.VITE_LOCAL_NAME;

     // Authentification
     authStore.subscribe((curr) => {
            // @ts-ignore
            pseudo = curr.data.pseudo;
        });

    const adminData = {
        name: import.meta.env.VITE_ADMIN_NAME,
        pseudo: import.meta.env.VITE_ADMIN_PSEUDO,
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
    <p>Dies ist eine private Website, die sich mit der Geschichte von {localName} beschäftigt.</p>
    <p>Sie ist nicht kommerziell und dient ausschließlich privaten Zwecken.</p>
    <p>Die alten Ortsansichten können ohne Registrierung betrachtet werden.</p>
    <br>
    <p><b>Bitte hilf mit, das alte {localName} zu bewahren!</b></p>
    <p>Registriere Dich oder logge Dich ein, um weitere Bilder einzustellen oder Kommentare zu schreiben.</p>
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
    <h4>Datenschutz</h4>
    <br>
    <p>Die von Ihnen zur Registrierung benutzte E-Mail-Adresse wird ausschließlich im Rahmen dieser Website genutzt und keinesfalls an Dritte weitergegeben. Falls die Löschung einer Registrierung gewünscht wird senden Sie bitte eine E-Mail von der registrierten Mail-Adresse aus mit dem Betreff "Löschung meiner Registrierung {localName}-Seite " an:</p>
    <p><strong>{adminData.mail}</strong></p>
    <br>
    {#if pseudo}
        <p>Hochgeladene Bilder und erstellte Kommentare bleiben unter Angabe des von Ihnen gewählten Pseudonyms &#187;{pseudo}&#171; auch nach Löschung der Registrierung erhalten.</p>
    {:else}
        <p>Hochgeladene Bilder und erstellte Kommentare bleiben unter Angabe des von Ihnen gewählten Pseudonyms auch nach Löschung der Registrierung erhalten.</p>
    {/if}
    <br>
    {#if pseudo}
    <a class="a-btn-red" href="/dashboard">Zur Hauptseite</a>
    {:else}
    <a class="a-btn-red" href="/">Zur Hauptseite</a>
    {/if}
    {#if pseudo === adminData.pseudo}
    <a class="a-btn-blue" href="/logbuch">Zum Logbuch</a>
    {/if}
    <br>
    <br>
    </center>
</main>
