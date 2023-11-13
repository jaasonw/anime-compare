import Anilist, { type ListEntry } from "anilist-node";
import type BetterSqlite3 from "better-sqlite3";
import Database from "better-sqlite3";

const anilist = new Anilist();

async function getAniList(
  username: string | number,
  conn: BetterSqlite3.Database,
) {
  const stmt = conn.prepare("INSERT INTO anime VALUES (?, ?, ?, ?, ?, ?)");
  const query = await anilist.lists.anime(username);
  const entries: ListEntry[] = [];
  query.forEach((e) => {
    entries.push(...e.entries);
  });
  entries.forEach((e) => {
    const title =
      e.media.title.english ??
      e.media.title.romaji ??
      e.media.title.native ??
      "";
    const score = e.score ?? 0;
    const url = e.media.siteUrl ?? "";
    const status = e.status ?? "";
    const idMal = e.media.idMal?.toString() ?? "";
    stmt.run(username, title, score, url, status, idMal);
  });
}

export async function POST({ request }) {
  const options: ResponseInit = {
    status: 200,
  };
  try {
    const { u1, u2 } = await request.json();
    if ([u1, u2].filter((element) => element === undefined).length > 0) {
      throw new Error("incorrect number of username(s)");
    }
    const db = new Database(":memory:");
    db.pragma("journal_mode = WAL");
    db.exec(`
      CREATE TABLE "anime"(
        "username" VARCHAR(255),
        "title" VARCHAR(255),
        "score" INTEGER,
        "url" VARCHAR(255),
        "status" VARCHAR(255),
        "idMal" VARCHAR(255)
      );
    `);

    await Promise.all([getAniList(u1, db), getAniList(u2, db)]);

    const stmt = db.prepare(`
      SELECT *
      FROM anime AS e1
      WHERE e1.username = ?
      AND NOT EXISTS (
        SELECT 1
        FROM anime AS e2
        WHERE e2.username = ?
        AND e2.idMal = e1.idMal
      ) order by title;
    `);
    const result1 = stmt.all(u1, u2);
    const result2 = stmt.all(u2, u1);

    return new Response(JSON.stringify({ u1: result1, u2: result2 }), options);
  } catch (e: unknown) {
    if (e instanceof Error) {
      options.status = 500;
      console.error(e);
      return new Response(JSON.stringify({ error: e.message }), options);
    }
    throw e;
  }
}
