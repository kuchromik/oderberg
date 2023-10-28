<script>
    import { db } from "../firebase";
    import { authStore } from "../store/store";
    // @ts-ignore
    import { getDoc, doc, setDoc, updateDoc } from "@firebase/firestore";
    import TodoItem from "$lib/TodoItem.svelte";
    

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
            <div class="headerBtns">
                <button class="blob" class:hideSaveButton disabled='{hideSaveButton}' on:click={saveTodos}>
                    <i class="fa-regular fa-floppy-disk" />
                    <p>Liste speichern</p></button
                >
            </div>
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
            <input bind:value={currTodo} type="text" placeholder="weiteren Vermerk eingeben" />
            <button on:click={addTodo}>In Liste eintragen</button>
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

    .mainContainer {
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding: 24px;
        width: 100%;
        max-width: 1000px;
        margin: 0 auto;
    }

    .headerContainer {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .list {
        overflow: auto;
        max-height: 10rem;
        scrollbar-color: #333 #ccc ;
    }    

    .headerBtns {
        display: flex;
        align-items: center;
        gap: 14px;
    }

    .headerContainer button {
        background: #003c5b;
        color: white;
        padding: 10px 18px;
        border: none;
        border-radius: 4px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
    }

    .headerContainer button i {
        font-size: 1.1rem;
    }

    .headerContainer button:hover {
        opacity: 0.7;
    }


    .enterTodo {
        display: flex;
        align-items: stretch;
        border: 1px solid #0891b2;
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
        color: white;
        flex: 1;
    }

    .enterTodo input:focus {
        outline: none;
    }

    .enterTodo button {
        padding: 0 28px;
        background: #003c5b;
        border: none;
        color: cyan;
        font-weight: 600;
        cursor: pointer;
    }

    .enterTodo button:hover {
        background: transparent;
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