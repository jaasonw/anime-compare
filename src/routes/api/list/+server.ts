import Anilist, { type ListEntry, type MediaStatus } from "anilist-node";
import type BetterSqlite3 from "better-sqlite3";
import Database from "better-sqlite3";

const anilist = new Anilist();

export async function POST({ request }) {
  try {
    const { u1, u2 }: { u1: string; u2: string } = await request.json();
    if ([u1, u2].filter((element) => element === undefined).length > 0) {
      throw new Error("incorrect number of username(s)");
    }
    const db = new Database(":memory:");
    initDatabase(db);

    await Promise.all([getAniList(u1, db), getAniList(u2, db)]);
    const { result1, result2 } = queryDistinctAnimes(u1, u2, db);
    const shared = querySharedAnime(u1, u2, db);
    const [user1, user2] = await Promise.all([anilist.user.profile(u1), anilist.user.profile(u2)]);

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
        shared,
      }),
      {
        status: 200,
      } as ResponseInit,
    );
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error(e);
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
      } as ResponseInit);
    }
    throw e;
  }
}

function initDatabase(conn: BetterSqlite3.Database) {
  conn.pragma("journal_mode = OFF");
  conn.pragma("synchronous = OFF");
  conn.exec(`
    CREATE TABLE "anime"(
      "username" VARCHAR(255),
      "title" VARCHAR(255),
      "score" INTEGER,
      "url" VARCHAR(255),
      "status" VARCHAR(255),
      "idMal" VARCHAR(255)
    );
  `);
  conn.exec(`CREATE INDEX idx_username_idMal ON anime (username, idMal);`);
}

async function getAniList(username: string | number, conn: BetterSqlite3.Database) {
  const query = await anilist.lists.anime(username);
  const entries: ListEntry[] = [];
  query.forEach((e) => {
    entries.push(...e.entries);
  });
  const rows = entries.map((e) => {
    return {
      username: username ?? "",
      title: e.media.title.english ?? e.media.title.romaji ?? e.media.title.native ?? "",
      score: e.score ?? 0,
      url: e.media.siteUrl ?? "",
      status: e.status ?? "",
      idMal: e.media.idMal?.toString() ?? "",
    };
  });
  insertAnimes(conn, rows);
}

function insertAnimes(
  conn: BetterSqlite3.Database,
  rows: {
    username: string | number;
    title: string;
    score: number;
    url: string;
    status: MediaStatus;
    idMal: string;
  }[],
) {
  const stmt = conn.prepare(
    "INSERT INTO anime VALUES ($username, $title, $score, $url, $status, $idMal)",
  );
  const insertMany = conn.transaction((entries) => {
    for (const e of entries) {
      stmt.run(e);
    }
  });
  insertMany(rows);
}

function queryDistinctAnimes(u1: string, u2: string, conn: BetterSqlite3.Database) {
  const stmt = conn.prepare(`
    SELECT DISTINCT 
      username,
      title,
      score,
      url,
      status,
      idMal
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
  return { result1, result2 };
}

function querySharedAnime(u1: string, u2: string, conn: BetterSqlite3.Database) {
  const stmt = conn.prepare(`
    SELECT DISTINCT 
      e1.url,
      e1.status AS u1_status,
      e1.username AS u1_username,
      e1.score AS u1_score,
      e1.title,
      e2.score AS u2_score,
      e2.username AS u2_username,
      e2.status AS u2_status
    FROM anime e1
    JOIN anime e2 ON e1.idMal = e2.idMal
    WHERE 
      e1.username = ? AND e2.username = ?
      AND (
        (e1.status = 'COMPLETED' AND e2.status = 'DROPPED')
        OR
        (e1.status = 'DROPPED' AND e2.status = 'COMPLETED')
        OR
        (e1.status = 'COMPLETED' AND e2.status = 'COMPLETED')
        OR
        (e1.status = 'DROPPED' AND e2.status = 'DROPPED')
      )
    ORDER BY e1.title, e1.score DESC;
  `);
  return stmt.all(u1, u2);
}
