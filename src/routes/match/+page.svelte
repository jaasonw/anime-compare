<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import Footer from "$lib/components/footer.svelte";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import Usercard from "$lib/components/usercard.svelte";
  import { onMount } from "svelte";

  const u1 = $page.url.searchParams.get("u1") ?? "";
  const u2 = $page.url.searchParams.get("u2") ?? "";

  onMount(() => {
    if (!u1 || !u2) {
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

  let lists = getAnimeLists(u1, u2);
</script>

<div
  class="flex flex-col items-center justify-center h-full min-h-screen gap-1"
>
  {#await lists}
    <p>loading...</p>
  {:then data}
    <Card.Root class="flex flex-col p-10 max-w-7xl gap-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Usercard username={u1} data={data["u1"]} />
        <Usercard username={u2} data={data["u2"]} />
      </div>
      <Button href="/">Home</Button>
      <Footer />
    </Card.Root>
  {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}
</div>
