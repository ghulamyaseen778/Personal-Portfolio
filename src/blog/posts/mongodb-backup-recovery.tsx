import type { BlogPost } from "../types";
import CodeBlock from "../components/CodeBlock";

const mongodbBackupRecovery: BlogPost = {
  slug: "mongodb-automated-backup-recovery",
  title: "MongoDB Automated Backups: 15-Minute Dumps, 7-Day Retention & Safe Recovery",
  description:
    "A production-focused guide to running compressed MongoDB backups on a separate Ubuntu server every 15 minutes, automatically deleting backups older than seven days, verifying archives and safely recovering accidentally deleted data.",
  category: "Database",
  readTime: "18 min read",
  date: "October 2026",
  tags: ["MongoDB", "Backup", "Recovery", "Ubuntu", "mongodump", "mongorestore", "Cron"],
  featured: true,
  content: (
    <>
      <p>
        A database backup is useful only when it is automated, stored away from the database
        server and tested for recovery. This guide builds a practical MongoDB backup system
        where a separate Ubuntu backup server creates a compressed archive every 15 minutes
        and automatically removes archives older than seven days.
      </p>

      <blockquote>
        Never test a restore for the first time during an incident. Create the backup,
        verify it, restore it into a temporary database and confirm that the data can actually
        be read.
      </blockquote>

      <h2>1. Architecture</h2>
      <CodeBlock
        language="text"
        code={"Application Servers\n        |\n        v\nMongoDB Server\n  private network / IPsec\n        |\n        | TCP 27017\n        v\nBackup Server\n  /srv/mongodb-backups\n  ├── domicileprc_20261006_180000.archive.gz\n  ├── domicileprc_20261006_181500.archive.gz\n  ├── domicileprc_20261006_183000.archive.gz\n  └── ...\n\nCron runs every 15 minutes\nRetention: 7 days"}
      />
      <p>
        The backup server should reach MongoDB only through a trusted private network or VPN.
        Do not expose MongoDB port 27017 publicly just to make backups work.
      </p>

      <h2>2. Understand the storage cost first</h2>
      <p>
        A 15-minute schedule creates 96 backups per day and 672 backups in seven days. If a
        10 GB database produced a 10 GB archive every time, seven-day retention would require
        about 6.72 TB. Compression can reduce this significantly, but the result depends on
        the data.
      </p>
      <p>
        JSON-like documents and repeated strings usually compress well. JPEG, PNG, PDF, ZIP
        and encrypted binary data usually compress much less. Measure the real archive size
        after the first few backups before choosing disk capacity.
      </p>

      <h2>3. Install MongoDB Database Tools on the backup server</h2>
      <p>
        The backup server needs <code>mongodump</code> and <code>mongorestore</code>. If the
        MongoDB repository is already configured on Ubuntu:
      </p>
      <CodeBlock
        language="bash"
        code={"sudo apt-get update\nsudo apt-get install -y mongodb-database-tools\n\nmongodump --version\nmongorestore --version"}
      />

      <h2>4. Create a dedicated backup user</h2>
      <p>
        Do not use the application account or a cluster administrator inside the backup
        script. On the MongoDB server, authenticate with an administrator that can manage
        users and create a backup-only account:
      </p>
      <CodeBlock
        language="javascript"
        code={'use admin\n\ndb.createUser({\n  user: "mongoBackup",\n  pwd: passwordPrompt(),\n  roles: [\n    { role: "backup", db: "admin" }\n  ]\n})'}
      />
      <p>
        The built-in <code>backup</code> role provides the privileges required by
        <code>mongodump</code>. Keep this password only on the backup server.
      </p>

      <h2>5. Keep restore credentials separate</h2>
      <p>
        Restoring is a higher-risk operation, so use another account and do not store its
        password in the scheduled backup script:
      </p>
      <CodeBlock
        language="javascript"
        code={'use admin\n\ndb.createUser({\n  user: "mongoRestore",\n  pwd: passwordPrompt(),\n  roles: [\n    { role: "restore", db: "admin" }\n  ]\n})'}
      />
      <p>
        Use this account manually during recovery. Application servers should continue using
        their normal least-privilege database user.
      </p>

      <h2>6. Prepare the backup server</h2>
      <CodeBlock
        language="bash"
        code={"sudo mkdir -p /srv/mongodb-backups\nsudo chown root:root /srv/mongodb-backups\nsudo chmod 700 /srv/mongodb-backups\n\nsudo touch /var/log/mongodb-backup.log\nsudo chmod 600 /var/log/mongodb-backup.log"}
      />

      <h2>7. Store the connection separately from the script</h2>
      <p>
        Create a root-only environment file. Replace the host with the private MongoDB IP
        reachable from the backup server. URL-encode special characters in the password.
      </p>
      <CodeBlock language="bash" code={"sudo nano /etc/mongodb-backup.env"} />
      <CodeBlock
        language="env"
        code={"MONGO_BACKUP_URI='mongodb://mongoBackup:URL_ENCODED_PASSWORD@DB_PRIVATE_IP:27017/?authSource=admin'"}
      />
      <CodeBlock
        language="bash"
        code={"sudo chown root:root /etc/mongodb-backup.env\nsudo chmod 600 /etc/mongodb-backup.env"}
      />

      <h2>8. Test one compressed backup manually</h2>
      <CodeBlock
        language="bash"
        code={'sudo bash -c \'\nset -a\nsource /etc/mongodb-backup.env\nset +a\n\nmongodump \\\n  --uri="$MONGO_BACKUP_URI" \\\n  --db=domicileprc \\\n  --archive=/srv/mongodb-backups/manual-test.archive.gz \\\n  --gzip\n\''}
      />
      <CodeBlock
        language="bash"
        code={"ls -lh /srv/mongodb-backups/manual-test.archive.gz\ndu -h /srv/mongodb-backups/manual-test.archive.gz"}
      />
      <p>
        <code>--archive</code> creates one file instead of an extracted BSON directory, and
        <code>--gzip</code> compresses it.
      </p>

      <h2>9. Create the production backup script</h2>
      <CodeBlock language="bash" code={"sudo nano /usr/local/sbin/mongodb-backup.sh"} />
      <CodeBlock
        language="bash"
        code={'#!/usr/bin/env bash\nset -Eeuo pipefail\numask 077\n\nDB_NAME="domicileprc"\nBACKUP_DIR="/srv/mongodb-backups"\nENV_FILE="/etc/mongodb-backup.env"\nLOG_FILE="/var/log/mongodb-backup.log"\nLOCK_FILE="/var/lock/mongodb-backup.lock"\nRETENTION_MINUTES=10080\nMONGODUMP_BIN="/usr/bin/mongodump"\n\nmkdir -p "$BACKUP_DIR"\n\nexec 9>"$LOCK_FILE"\nif ! flock -n 9; then\n  echo "$(date -Is) backup skipped: previous job is still running" >> "$LOG_FILE"\n  exit 0\nfi\n\nif [[ ! -r "$ENV_FILE" ]]; then\n  echo "$(date -Is) ERROR: cannot read $ENV_FILE" >> "$LOG_FILE"\n  exit 1\nfi\n\nset -a\nsource "$ENV_FILE"\nset +a\n\nif [[ -z "$MONGO_BACKUP_URI" ]]; then\n  echo "$(date -Is) ERROR: MONGO_BACKUP_URI is empty" >> "$LOG_FILE"\n  exit 1\nfi\n\nSTAMP="$(date +%Y%m%d_%H%M%S)"\nFINAL="$BACKUP_DIR/$DB_NAME-$STAMP.archive.gz"\nTEMP="$FINAL.partial"\nCHECKSUM="$FINAL.sha256"\n\ncleanup() {\n  rm -f "$TEMP"\n}\ntrap cleanup EXIT\n\necho "$(date -Is) backup started: $FINAL" >> "$LOG_FILE"\n\nif "$MONGODUMP_BIN" \\\n  --uri="$MONGO_BACKUP_URI" \\\n  --db="$DB_NAME" \\\n  --archive="$TEMP" \\\n  --gzip >> "$LOG_FILE" 2>&1\nthen\n  mv "$TEMP" "$FINAL"\n  sha256sum "$FINAL" > "$CHECKSUM"\n\n  find "$BACKUP_DIR" -type f \\\n    \\( -name "*.archive.gz" -o -name "*.archive.gz.sha256" \\) \\\n    -mmin +$RETENTION_MINUTES \\\n    -delete\n\n  SIZE="$(du -h "$FINAL" | awk \'{print $1}\')"\n  echo "$(date -Is) backup completed: $FINAL ($SIZE)" >> "$LOG_FILE"\nelse\n  echo "$(date -Is) ERROR: mongodump failed" >> "$LOG_FILE"\n  exit 1\nfi\n\ntrap - EXIT'}
      />

      <h2>10. Why this script is safer</h2>
      <ul>
        <li><strong>flock</strong> prevents overlapping 15-minute jobs.</li>
        <li>A <strong>.partial</strong> file prevents an incomplete dump being treated as valid.</li>
        <li>Every successful archive gets a SHA-256 checksum.</li>
        <li>Backups older than 10,080 minutes, exactly seven days, are deleted.</li>
        <li>Credentials remain outside the script in a root-only file.</li>
      </ul>

      <h2>11. Enable and test the script</h2>
      <CodeBlock
        language="bash"
        code={"sudo chown root:root /usr/local/sbin/mongodb-backup.sh\nsudo chmod 700 /usr/local/sbin/mongodb-backup.sh\n\nsudo /usr/local/sbin/mongodb-backup.sh\n\nsudo tail -n 50 /var/log/mongodb-backup.log\nls -lh /srv/mongodb-backups"}
      />

      <h2>12. Schedule a backup every 15 minutes</h2>
      <CodeBlock language="bash" code={"sudo crontab -e"} />
      <p>Add:</p>
      <CodeBlock language="cron" code={"*/15 * * * * /usr/local/sbin/mongodb-backup.sh"} />
      <p>Verify:</p>
      <CodeBlock
        language="bash"
        code={"sudo crontab -l\nsudo systemctl status cron --no-pager\nls -lht /srv/mongodb-backups | head\nsudo tail -n 100 /var/log/mongodb-backup.log"}
      />

      <h2>13. Verify a backup before trusting it</h2>
      <CodeBlock
        language="bash"
        code={"cd /srv/mongodb-backups\nsha256sum -c domicileprc-20261006_181500.archive.gz.sha256"}
      />
      <p>
        A checksum verifies the file itself, but a real backup test also requires restoring
        an archive into a temporary database and reading the restored data.
      </p>

      <h2>14. Accidentally deleted data: what to do first</h2>
      <p>
        If someone runs an incorrect <code>deleteMany()</code>, update, migration or
        application action, do not immediately restore the entire production database.
      </p>
      <ol>
        <li>Stop or restrict the application path that is continuing to damage the data.</li>
        <li>Record the approximate deletion time.</li>
        <li>Do not delete the current production database.</li>
        <li>Create an emergency backup of the current state.</li>
        <li>Select the newest backup created before the accidental deletion.</li>
        <li>Restore that archive into a temporary recovery database.</li>
        <li>Inspect and copy only the missing data back whenever possible.</li>
      </ol>

      <h2>15. Preserve the current state before recovery</h2>
      <p>
        The current database may contain valid writes created after the older backup. Preserve
        those writes before doing anything destructive.
      </p>
      <CodeBlock
        language="bash"
        code={'mongodump \\\n  --uri="mongodb://mongoBackup@DB_PRIVATE_IP:27017/?authSource=admin" \\\n  --db=domicileprc \\\n  --archive=/srv/mongodb-backups/PRE_RECOVERY_$(date +%Y%m%d_%H%M%S).archive.gz \\\n  --gzip'}
      />

      <h2>16. Select the last good backup</h2>
      <CodeBlock
        language="bash"
        code={"ls -lht /srv/mongodb-backups/*.archive.gz | head -n 20"}
      />
      <p>
        If the deletion happened at 18:22, the 18:15 backup is normally the first candidate.
        Do not automatically choose 18:30 because it may already contain the deletion.
      </p>

      <h2>17. Restore safely into a temporary database</h2>
      <p>
        Do not overwrite production first. Restore <code>domicileprc</code> as
        <code>domicileprc_recovery</code>:
      </p>
      <CodeBlock
        language="bash"
        code={'BACKUP="/srv/mongodb-backups/domicileprc-20261006_181500.archive.gz"\n\nmongorestore \\\n  --host=DB_PRIVATE_IP \\\n  --port=27017 \\\n  --username=mongoRestore \\\n  --authenticationDatabase=admin \\\n  --archive="$BACKUP" \\\n  --gzip \\\n  --nsFrom="domicileprc.*" \\\n  --nsTo="domicileprc_recovery.*"'}
      />
      <p>
        With the password omitted, the restore command can prompt for it interactively instead
        of storing the restore password in a script.
      </p>

      <h2>18. Inspect the recovered data</h2>
      <p>Use an authorized account that can read the recovery database:</p>
      <CodeBlock
        language="javascript"
        code={'use domicileprc_recovery\n\nshow collections\n\ndb.applications.countDocuments()\ndb.applications.findOne({ _id: ObjectId("REPLACE_WITH_ID") })'}
      />

      <h2>19. Copy only the missing document when possible</h2>
      <p>
        If only a small number of documents were deleted, move them from the recovery database
        into the current production database instead of rolling everything backward.
      </p>
      <CodeBlock
        language="javascript"
        code={'const recovery = db.getSiblingDB("domicileprc_recovery");\nconst production = db.getSiblingDB("domicileprc");\n\nconst doc = recovery.applications.findOne({\n  _id: ObjectId("REPLACE_WITH_ID")\n});\n\nif (doc && !production.applications.findOne({ _id: doc._id })) {\n  production.applications.insertOne(doc);\n}'}
      />
      <p>
        Check related collections as well. An application may have linked payments,
        certificates, history, audit logs or other records that also need recovery.
      </p>

      <h2>20. Full database rollback is the destructive option</h2>
      <p>
        Use this only when you intentionally want production to match the selected backup.
        Stop application writes first and create the emergency pre-recovery dump.
      </p>
      <CodeBlock
        language="bash"
        code={'mongorestore \\\n  --host=DB_PRIVATE_IP \\\n  --port=27017 \\\n  --username=mongoRestore \\\n  --authenticationDatabase=admin \\\n  --archive="/srv/mongodb-backups/domicileprc-20261006_181500.archive.gz" \\\n  --gzip \\\n  --drop'}
      />
      <blockquote>
        <code>--drop</code> is destructive. It drops collections that are present in the
        backup before restoring them. Never run it casually against a live production
        database.
      </blockquote>

      <h2>21. Clean up the temporary recovery database</h2>
      <p>Only after production has been validated:</p>
      <CodeBlock
        language="javascript"
        code={"use domicileprc_recovery\ndb.dropDatabase()"}
      />

      <h2>22. Consistency note for a busy replica set</h2>
      <p>
        A database-specific <code>mongodump --db=domicileprc</code> can run while production
        is accepting writes, but a busy database can change while the dump is being created.
        For strict consistency on a replica set, MongoDB supports a full dump with
        <code>--oplog</code> and a matching restore with <code>--oplogReplay</code>.
      </p>
      <p>
        <code>--oplog</code> requires a full replica-set dump and cannot be combined with
        <code>--db</code>. For larger or write-heavy systems, evaluate replica-set-aware
        continuous backup, snapshots or a dedicated backup platform instead of relying forever
        on full 15-minute database dumps.
      </p>

      <h2>23. Monitor storage and backup health</h2>
      <CodeBlock
        language="bash"
        code={"df -h /srv/mongodb-backups\ndu -sh /srv/mongodb-backups\ndu -h /srv/mongodb-backups/*.archive.gz | sort -h | tail\n\nsudo tail -f /var/log/mongodb-backup.log"}
      />

      <h2>24. Production checklist</h2>
      <ul>
        <li>Keep the backup server separate from the MongoDB server.</li>
        <li>Use a private network, IPsec or another trusted path to MongoDB.</li>
        <li>Use a dedicated backup account instead of application or cluster-admin credentials.</li>
        <li>Keep restore credentials separate from automated backup credentials.</li>
        <li>Use compressed archive files rather than permanently storing extracted dumps.</li>
        <li>Prevent overlapping jobs with a lock.</li>
        <li>Keep incomplete dumps as temporary files until the command succeeds.</li>
        <li>Generate checksums and test restores.</li>
        <li>Delete old backups automatically and monitor free disk space.</li>
        <li>During an incident, preserve the current state before restoring old data.</li>
      </ul>

      <h2>25. Final recovery rule</h2>
      <p>
        If data is accidentally deleted, the safest default is:
        <strong> stop the damaging operation, preserve the current state, restore the last
        good archive into a temporary database, inspect it and copy only the missing data
        back.</strong> A complete <code>--drop</code> restore should be reserved for cases
        where a full rollback is actually required.
      </p>
    </>
  )
};

export default mongodbBackupRecovery;
