<script lang="ts">
  import { Frown, Meh, Smile } from "lucide-svelte";
  export let score = 0;
</script>

<div>
  {#if score == 0}
    <span class="text-center">-</span>
  {:else if score == 1}
    <Frown class="text-red-500" />
  {:else if score == 2}
    <Meh class="text-yellow-500" />
  {:else if score == 3}
    <Smile class="text-green-500" />
  {/if}
</div>
