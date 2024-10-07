<script>
  import Authenticate from "$lib/Authenticate.svelte";
	import ChooseLocation from "$lib/ChooseLocation.svelte";
  import Textsearch from "$lib/Textsearch.svelte";
  import NewestImages from "$lib/NewestImages.svelte";
	import NewestComments from "$lib/NewestComments.svelte";
  
</script>

<main>
  <Authenticate/>
  <br>
  <div class="grid-container">
    <div class="left-column">
      
      <ChooseLocation/>
      <br>
      <Textsearch />
    </div>
    <div class="right-column">
      <NewestImages/>
      <br>
      <NewestComments/>
    </div>
  </div>

</main>

<style>
    @media (min-width: 768px) {
      .grid-container {
      display: grid;
      grid-template-columns: 5fr 1fr;
      gap: 1rem;
      }
      .left-column {
      grid-column: 1;
      }
      .right-column {
      grid-column: 2;
      }
    }
</style>
