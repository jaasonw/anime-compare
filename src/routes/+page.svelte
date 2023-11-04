<script lang="ts">
  import Footer from "$lib/components/footer.svelte";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
</script>

<div class="flex flex-col items-center justify-center h-screen">
  <Card.Root class="w-6xl">
    <Card.Header>
      <Card.Title>compare anime lists</Card.Title>
      <Card.Description>created by jasonw</Card.Description>
    </Card.Header>
    <Card.Content>
      <form id="form" action="/match">
        <div class="grid w-full items-center gap-4">
          <div class="flex flex-col space-y-1.5">
            <Label for="name">your anilist username</Label>
            <Input name="u1" placeholder="" />
          </div>
          <div class="grid w-full items-center gap-4">
            <div class="flex flex-col space-y-1.5">
              <Label for="name">their anilist username</Label>
              <Input name="u2" placeholder="" />
            </div>
          </div>
        </div>
      </form>
    </Card.Content>
    <Card.Footer class="flex flex-col w-full">
      <div class=" w-full flex justify-center">
        <Button class="w-full" form="form" type="submit">compare</Button>
      </div>
      <Footer />
    </Card.Footer>
  </Card.Root>
</div>
