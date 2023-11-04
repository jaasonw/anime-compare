import Anilist, { type ListEntry } from "anilist-node";

const anilist = new Anilist();

export async function POST({ request }) {
  const options: ResponseInit = {
    status: 200,
  };
  try {
    const { u1, u2 } = await request.json();
    const queries = await Promise.all([
      anilist.lists.anime(u1),
      anilist.lists.anime(u2),
    ]);
    const combined: ListEntry[][] = [[], []];
    queries.forEach((e, i) => {
      e.forEach((e) => {
        combined[i].push(...e.entries);
      });
    });

    // convert to a list of objects that only has the title, score, url, and status
    const converted = combined.map((userList: ListEntry[]) => {
      return userList.map((e: ListEntry) => {
        const entry: {
          title: string;
          score: number;
          url: string;
          status: string;
        } = {
          title: e.media.title.english,
          score: e.score,
          url: e.media.siteUrl,
          status: e.status,
        };
        return entry;
      });
    });

    const combinedSets = converted.map((userList) => {
      const keyedSet: {
        [key: string]: {
          title: string;
          score: number;
          url: string;
          status: string;
        };
      } = {};
      userList.forEach((e) => {
        keyedSet[e.title] = e;
      });
      return keyedSet;
    });

    const uniqueTo1 = Object.values(combinedSets[0]).filter(
      (e) => !(e.title in combinedSets[1]),
    );
    const uniqueTo2 = Object.values(combinedSets[1]).filter(
      (e) => !(e.title in combinedSets[0]),
    );

    // sort by title
    uniqueTo1.sort((a, b) => a.title.localeCompare(b.title));
    uniqueTo2.sort((a, b) => a.title.localeCompare(b.title));
    return new Response(
      JSON.stringify({ u1: uniqueTo1, u2: uniqueTo2 }),
      options,
    );
  } catch (e: unknown) {
    if (e instanceof Error) {
      options.status = 500;
      return new Response(JSON.stringify({ error: e.message }), options);
    }
    throw e;
  }
}
