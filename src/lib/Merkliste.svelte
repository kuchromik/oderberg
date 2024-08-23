<script>
    import { db } from "../firebase";
    import { authStore } from "../store/store";
    // @ts-ignore
    import { doc, setDoc } from "@firebase/firestore";
    import TodoItem from "$lib/TodoItem.svelte";
    import { onDestroy } from "svelte";

    onDestroy( () => {
        saveTodos()
        });
    

    // @ts-ignore
    let todoList = [];
    let currTodo = "";
    let error = false;
    let hideSaveButton = true;

    authStore.subscribe((curr) => {
        // @ts-ignore
        todoList = curr.data.todos;
    });

    function addTodo() {
        error = false;
        if (!currTodo) {
            return
        }
        // @ts-ignore
        todoList = [...todoList, currTodo];
        currTodo = "";
        hideSaveButton = false;
    }

    // @ts-ignore
    function editTodo(index) {
        // @ts-ignore
        let newTodoList = [...todoList].filter((val, i) => {
            return i != index;
        });
        // @ts-ignore
        currTodo = todoList[index];
        todoList = newTodoList;
        hideSaveButton = false;
    }

    // @ts-ignore
    function removeTodo(index) {
        // @ts-ignore
        let newTodoList = [...todoList].filter((val, i) => {
            return i != index;
        });
        todoList = newTodoList;
        hideSaveButton = false;
    }

    async function saveTodos() {
        try {
            // @ts-ignore
            const userRef = doc(db, "users", $authStore.user.uid);
            await setDoc(
                userRef,
                {
                    // @ts-ignore
                    todos: todoList,
                },
                { merge: true }
            );
            authStore.update((curr) => {
                return {
                    ...curr,
                    data: {
                        ...curr.data,
                        todos: todoList,
                    },
                };
            });
            hideSaveButton = true;
        } catch (err) {
            hideSaveButton = true;
        }
    }
  
</script>
{#if !$authStore.loading}
    <div class="mainContainer">
        <div class="headerContainer">
            <h3>Deine Merkliste</h3>
            <small>Dinge, die Du Dir hier merken willst</small>
            <!--
            <div class="headerBtns">
                <button class="blob" class:hideSaveButton disabled='{hideSaveButton}' on:click={saveTodos}>
                    <i class="fa-regular fa-floppy-disk" />
                    <p>Liste speichern</p></button
                >
            </div>
            -->
        </div>
        <div class="list">
            {#if todoList.length === 0}
                <p>Es ist nichts vermerkt</p>
            {/if}
            {#each todoList as todo, index}
                <TodoItem {todo} {index} {removeTodo} {editTodo} />
            {/each}
        </div>
        <div class={"enterTodo " + (error ? "errorBorder" : "")}>
            <input bind:value={currTodo} type="text" placeholder="Neuen Vermerk eingeben" />
            <button on:click={addTodo}>Eintragen</button>
        </div>
    </div>
{/if}

<style>
    /* style vertical scrollbar */
    ::-webkit-scrollbar {
    width: 1rem;
    }

    ::-webkit-scrollbar-track {
    background: #ccc;
    }

    ::-webkit-scrollbar-thumb {
    background-color: #333;
    border-radius: 3px;
}
    .list {
        overflow: auto;
        max-height: 10rem;
        scrollbar-color: #333 #ccc ;
    }    


    .enterTodo {
        display: flex;
        align-items: stretch;
        border: 1px solid grey;
        border-radius: 5px;
        overflow: hidden;
    }

    .errorBorder {
        border-color: coral !important;
    }

    .enterTodo input {
        background: transparent;
        border: none;
        padding: 14px;
        color: black;
        flex: 1;
    }

    .enterTodo input:focus {
        outline: none;
    }

    .enterTodo button {
        padding: 0 28px;
        background: dimgrey;
        border: none;
        color: white;
        font-weight: 600;
        cursor: pointer;
    }

    .enterTodo button:hover {
        background: black;
    }

    .hideSaveButton {
        visibility: hidden;
    }

    .blob {

	box-shadow: 0 0 0 0 rgba(255, 255, 255, 1);
	transform: scale(1);
	animation: pulse 2s infinite;
}

    @keyframes pulse {
	0% {
		transform: scale(0.95);
		box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
	    }

	70% {
		transform: scale(1);
		box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
	    }

	100% {
		transform: scale(0.95);
		box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
	    }
    }
</style>