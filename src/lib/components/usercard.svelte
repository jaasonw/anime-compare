<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import * as Table from "$lib/components/ui/table";

  export let data: any[] = [];
  export let username = "";
</script>

<Card.Root class="flex flex-col p-5">
  <div class="flex items-center">
    <div class="flex flex-col gap-0">
      <h1 class="text-md text-muted-foreground">Animes watched by</h1>
      <h1 class="text-xl">{username}</h1>
    </div>
  </div>
  <span class="w-full border-t" />
    <div class="max-h-[60vh] overflow-scroll">
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head class="w-[100px]">Score</Table.Head>
            <Table.Head>Title</Table.Head>
            <Table.Head>Status</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each data as entry}
            <Table.Row>
              <Table.Cell class="font-medium">{entry["score"]}</Table.Cell>
              <Table.Cell><a href={entry["url"]} class="href">{entry["title"]}</a></Table.Cell>
              <Table.Cell>{entry["status"]}</Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    </div>
</Card.Root>
