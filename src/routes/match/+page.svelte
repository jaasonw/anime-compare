<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import Footer from "$lib/components/footer.svelte";
  import Sharedcard from "$lib/components/sharedcard.svelte";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import Usercard from "$lib/components/usercard.svelte";
  import { u1, u2 } from "$lib/stores";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  $u1 = $page.url.searchParams.get("u1") ?? "";
  $u2 = $page.url.searchParams.get("u2") ?? "";

  onMount(() => {
    if (!$u1 || !$u2) {
      goto("/");
    }
  });

  const getAnimeLists = async (u1: string, u2: string) => {
    const resp = await fetch("/api/list", {
      method: "POST",
      body: JSON.stringify({ u1, u2 }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (resp.status !== 200) {
      throw new Error(`Request failed with status code ${resp.status}`);
    }
    const data = await resp.json();
    console.log(data);
    return data;
  };

  let lists = getAnimeLists($u1, $u2);
  let distinct = true;
  const toggleDistinct = () => {
    distinct = !distinct;
  };
</script>

<div class="flex flex-col items-center justify-center h-full min-h-screen gap-1">
  {#await lists}
    <p>loading...</p>
  {:then data}
    <Card.Root class="flex flex-col p-10 w-full max-w-7xl gap-5">
      <div
        class="grid grid-cols-1 md:grid-cols-2 gap-3"
        class:md:grid-cols-2={distinct}
        transition:fade
      >
        {#if distinct}
          <Usercard username={$u1} data={data["u1"]} />
          <Usercard username={$u2} data={data["u2"]} />
        {:else}
          <Sharedcard {data} />
        {/if}
      </div>
      <Button variant="outline" on:click={toggleDistinct}>Mode: {distinct ? "Distinct" : "Shared"}</Button>
      <Button href="/">Home</Button>
      <Footer />
    </Card.Root>
  {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}
</div>
