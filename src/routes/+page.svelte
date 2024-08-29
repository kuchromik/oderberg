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
    <NewestImages/>
    <br>
    <NewestComments/>
    <br>
    <ChooseLocation/>
    <br>
    <Textsearch />
 
</main>

<style>
  
</style>
