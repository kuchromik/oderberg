<script>
    import { authHandlers } from "../store/store";

    let email = "";
    let password = "";
    let confirmPass = "";
    let error = false;
    let register = false;
    let authenticating = false;
    let sesam = false

    async function handleAuthenticate() {
        if (authenticating) {
            return;
        }
        if (!email || !password || (register && !confirmPass)) {
            error = true;
            return;
        }
        authenticating = true;

        try {
            if (!register) {
                await authHandlers.login(email, password);
            } else {
                if (password === confirmPass) {
                await authHandlers.signup(email, password);
                } else {
                    error = true;
                    authenticating = false;
                    }

            }
        } catch (err) {
            console.log("There was an auth error", err);
            error = true;
            authenticating = false;
        }
    }

    function handleRegister() {
        register = !register;
    }
</script>

<div class="authContainer">
    {#if sesam}
    <form>
        <h3>{register ? "Registrieren" : "Login"}</h3>
        {#if error}
            <p class="error">Da stimmt etwas nicht</p>
        {/if}
        <label>
            <p class={email ? " above" : " center"}>E-Mail</p>
            <input bind:value={email} type="email" placeholder="E-Mail" />
        </label>
        <label>
            <p class={password ? " above" : " center"}>Passwort</p>
            <input
                bind:value={password}
                type="password"
                placeholder="Passwort"
            />
        </label>
        {#if register}
            <label>
                <p class={confirmPass ? " above" : " center"}>
                    Passwort bestätigen
                </p>
                <input
                    bind:value={confirmPass}
                    type="password"
                    placeholder="Passwort bestätigen"
                />
            </label>
        {/if}

        <button on:click={handleAuthenticate} type="button" class="submitBtn">
            {#if authenticating}
                <i class="fa-solid fa-spinner loadingSpinner" />
            {:else}
                Absenden
            {/if}
        </button>
    </form>
    <div class="options">
        <p>Oder</p>
        {#if register}
            <div>
                <p>Sie haben bereits Zugangsdaten?</p>
                <p on:click={handleRegister} on:keydown={() => {}}>Login</p>
            </div>
        {:else}
            <div>
                <p>Noch keine Zugangsdaten?</p>
                <p on:click={handleRegister} on:keydown={() => {}}>Registrieren</p>
            </div>
        {/if}
    </div>
{:else}
    <button class="a-btn-grey" on:click={() => sesam = true}>Ich bin dabei</button>
{/if}
</div>

<style>
    .authContainer {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex: 1;
    }

    form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .options {
        width: 400px;
        max-width: 100%;
        margin: 0 auto;
    }

    form input {
        width: 100%;
    }


    form label {
        position: relative;
        border: 1px solid black;
        border-radius: 5px;
    }

    form input {
        border: none;
        background: white;
        color: black;
        padding: 14px;
    }

    form input:focus {
        border: none;
        outline: none;
    }

    form label:focus-within {
        border-color: black;
    }

    form button {
        background: dimgrey;
        color: white;
        border: none;
        padding: 14px 0;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1rem;
        display: grid;
        place-items: center;
    }

    form button:hover {
        background: black;
    }

    .above,
    .center {
        position: absolute;
        transform: translateY(-50%);
        pointer-events: none;
        color: white;
        border-radius: 4px;
        padding: 0 6px;
        font-size: 0.8rem;
    }

    .above {
        top: 0;
        left: 24px;
        background: grey;
        border: 1px solid darkgrey;
        font-size: 0.7rem;
    }

    .center {
        top: 50%;
        left: 6px;
        border: 1px solid transparent;
        opacity: 0;
    }

    .error {
        color: coral;
        font-size: 0.9rem;
        text-align: center;
    }

    .options {
        padding: 14px 0;
        overflow: hidden;
        font-size: 0.9rem;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .options > p {
        position: relative;
        text-align: center;
        width: fit-content;
        margin: 0 auto;
        padding: 0 8px;
    }

    .options > p::after,
    .options > p::before {
        position: absolute;
        content: "";
        top: 50%;
        transform: translateY(-50%);
        width: 100vw;
        height: 1.5px;
        background: white;
    }

    .options > p::after {
        right: 100%;
    }

    .options > p::before {
        left: 100%;
    }

    .options div {
        display: flex;
        align-items: center;
        gap: 8px;
        justify-content: center;
    }

    .options div p:last-of-type {
        color:  dimgrey;
        cursor: pointer;
    }

    .loadingSpinner {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
</style>
