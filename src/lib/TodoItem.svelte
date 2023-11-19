<script>
    export let index;
    export let todo;
    export let editTodo;
    export let removeTodo;
</script>

<div class="todo">
    <p>
        {index + 1}. {todo}
    </p>
    <div class="actions">
        <i
            on:click={() => {
                editTodo(index);
            }}
            on:keydown={() => {}}
            class="fa-regular fa-pen-to-square"
        />
        <i
            on:click={() => {
                removeTodo(index);
            }}
            on:keydown={() => {}}
            class="fa-regular fa-trash-can"
        />
    </div>
</div>

<style>
     .todo {
        border-left: 1px solid grey;
        padding: 8px 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
</style>
