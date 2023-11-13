import Anilist, { type ListEntry } from "anilist-node";
import type BetterSqlite3 from "better-sqlite3";
import Database from "better-sqlite3";

const anilist = new Anilist();

async function getAniList(
  username: string | number,
  conn: BetterSqlite3.Database,
) {
  const query = await anilist.lists.anime(username);
  const stmt = conn.prepare(
    "INSERT INTO anime VALUES ($username, $title, $score, $url, $status, $idMal)",
  );
  const insertMany = conn.transaction((entries) => {
    for (const e of entries) {
      stmt.run(e);
    }
  });
  const entries: ListEntry[] = [];
  query.forEach((e) => {
    entries.push(...e.entries);
  });
  const rows = entries.map((e) => {
    return {
      username: username ?? "",
      title:
        e.media.title.english ??
        e.media.title.romaji ??
        e.media.title.native ??
        "",
      score: e.score ?? 0,
      url: e.media.siteUrl ?? "",
      status: e.status ?? "",
      idMal: e.media.idMal?.toString() ?? "",
    };
  });
  insertMany(rows);
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
      SELECT DISTINCT *
      FROM anime AS e1
      WHERE e1.username = ?
      AND NOT EXISTS (
        SELECT 1
        FROM anime AS e2
        WHERE e2.username = ?
        AND e2.idMal = e1.idMal
      )
      ORDER BY CASE WHEN status = 'CURRENT' THEN 1
                    WHEN status = 'COMPLETED' THEN 2
                    WHEN status = 'PAUSED' THEN 3
                    WHEN status = 'DROPPED' THEN 4
                    WHEN status = 'PLANNING' THEN 5
                    ELSE 6
                    END ASC, score DESC, title;
    `);
    const result1 = stmt.all(u1, u2);
    const result2 = stmt.all(u2, u1);

    const user1 = await anilist.user.profile(u1);
    const user2 = await anilist.user.profile(u2);

    return new Response(
      JSON.stringify({
        u1: {
          results: result1,
          scoreFormat: user1.mediaListOptions.scoreFormat,
        },
        u2: {
          results: result2,
          scoreFormat: user2.mediaListOptions.scoreFormat,
        },
      }),
      options,
    );
  } catch (e: unknown) {
    if (e instanceof Error) {
      options.status = 500;
      console.error(e);
      return new Response(JSON.stringify({ error: e.message }), options);
    }
    throw e;
  }
}
