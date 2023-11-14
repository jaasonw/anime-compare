<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import * as Table from "$lib/components/ui/table";

  import { u1, u2 } from "$lib/stores";
  import Emojiscore from "./emojiscore.svelte";

  export let data: any = {};
  const shared = data["shared"];
  const u1ScoreFormat = data["u1"]["scoreFormat"];
  const u2ScoreFormat = data["u2"]["scoreFormat"];
</script>

<Card.Root class="flex flex-col p-5 w-full">
  <div class="flex items-center w-full">
    <div class="flex flex-col gap-0 w-full">
      <h1 class="text-md text-muted-foreground">Animes shared between</h1>
      <h2 class="flex justify-between items-center text-xl w-full">
        <span>{$u1}</span>
        <span class="text-sm">and</span>
        <span class="">{$u2}</span>
      </h2>
    </div>
  </div>
  <span class="w-full border-t" />
  <div class="max-h-[60vh] overflow-scroll">
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head class="w-[100px]">Score</Table.Head>
          <Table.Head class="hidden md:table-cell">Status</Table.Head>
          <Table.Head class="text-center">Title</Table.Head>
          <Table.Head class="hidden md:table-cell text-right">Status</Table.Head>
          <Table.Head>Score</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each shared as entry}
          <Table.Row>
            <Table.Cell>
              {#if u1ScoreFormat == "POINT_3"}
                <Emojiscore score={entry["u1_score"]} />
              {:else}
                {entry["u1_score"]}
              {/if}
            </Table.Cell>
            <Table.Cell class="hidden md:table-cell">
              {entry["u1_status"]}
            </Table.Cell>
            <Table.Cell class="text-center"
              ><a href={entry["url"]} class="hover:underline">{entry["title"]}</a></Table.Cell
            >
            <Table.Cell class="hidden md:table-cell text-right">
              {entry["u2_status"]}
            </Table.Cell>
            <Table.Cell>
              {#if u2ScoreFormat == "POINT_3"}
                <Emojiscore score={entry["u2_score"]} />
              {:else}
                {entry["u2_score"]}
              {/if}
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
</Card.Root>
