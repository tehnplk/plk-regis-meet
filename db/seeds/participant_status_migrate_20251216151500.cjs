'use strict';

const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.resolve(process.cwd(), 'db', 'events.db');

function main() {
  const db = new Database(dbPath);

  try {
    const updateConfirmed = db.prepare("UPDATE Participant SET status = 'approved' WHERE status = 'confirmed'").run();
    const updatePending = db.prepare("UPDATE Participant SET status = 'pending_review' WHERE status = 'pending'").run();
    const updateCancelled = db.prepare("UPDATE Participant SET status = 'rejected' WHERE status = 'cancelled'").run();

    const normalizeUnknown = db
      .prepare(
        "UPDATE Participant SET status = 'pending_review' WHERE status NOT IN ('pending_review','approved','rejected')",
      )
      .run();

    const counts = db
      .prepare(
        "SELECT status, COUNT(*) as count FROM Participant GROUP BY status ORDER BY status",
      )
      .all();

    console.log('Updated statuses:');
    console.log(`confirmed -> approved: ${updateConfirmed.changes}`);
    console.log(`pending -> pending_review: ${updatePending.changes}`);
    console.log(`cancelled -> rejected: ${updateCancelled.changes}`);
    console.log(`unknown -> pending_review: ${normalizeUnknown.changes}`);
    console.log('Current counts:');
    for (const row of counts) {
      console.log(`${row.status}: ${row.count}`);
    }
  } finally {
    db.close();
  }
}

main();
