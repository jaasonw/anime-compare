<script>
  import { Button } from "$lib/components/ui/button";
  import { Sun, Moon } from "lucide-svelte";
  import { toggleMode } from "mode-watcher";

  export let themeToggle = true;
</script>

<footer class="grid grid-cols-3 w-full mt-4 text-muted-foreground text-xs">
  {#if themeToggle}
    <Button on:click={toggleMode} variant="outline" size="icon">
      <Sun
        class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
      />
      <Moon
        class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
      />
      <span class="sr-only">Toggle theme</span>
    </Button>
  {/if}
  <span class="flex flex-col items-center justify-center" class:col-start-2={themeToggle == false}>
    <span>copyright 2023</span>
    <span class="text-center"
      >open source under <a
        class="underline"
        href="https://github.com/jaasonw/anime-compare/blob/main/LICENSE"
        >mit license</a
      ></span
    >
    <span class="text-center"
      >no affiliation with anilist</span
    >
  </span>
  <span class="flex flex-col items-end">
    <a
      href="https://github.com/jaasonw/anime-compare"
      class="text-right hover:underline">view source on github</a
    >
    <a href="https://jason-wong.me/donate" class="text-right hover:underline"
      >buy me a coffee</a
    >
  </span>
</footer>
