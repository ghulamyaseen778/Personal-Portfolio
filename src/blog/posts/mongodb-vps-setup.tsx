import type { BlogPost } from "../types";
import CodeBlock from "../components/CodeBlock";

const mongodbVpsSetup: BlogPost = {
  slug: "mongodb-vps-ubuntu-setup",
  title: "MongoDB on Ubuntu VPS: Installation, Users, Roles, Authentication & Security",
  description:
    "A complete self-managed MongoDB setup for Ubuntu 22.04, including MongoDB 8.0 installation, service management, application users, RBAC and a secure local connection string.",
  category: "Database",
  readTime: "14 min read",
  date: "September 2026",
  tags: ["MongoDB", "Ubuntu", "VPS", "Security", "RBAC", "mongosh"],
  featured: true,
  content: (
    <>
      <p>
        This guide focuses only on MongoDB. The goal is to install MongoDB Community Edition
        on an Ubuntu VPS, create a database administrator, create a least-privilege application
        user, enable authorization and keep the database private.
      </p>

      <blockquote>
        The safest default for a MERN app on one VPS is to keep MongoDB on
        <strong> 127.0.0.1:27017</strong>. Do not expose port 27017 to the public internet just
        because the application needs database access.
      </blockquote>

      <h2>1. Confirm your Ubuntu release</h2>
      <CodeBlock language="bash" code={`lsb_release -a
# or
cat /etc/os-release`} />
      <p>
        The commands below use the MongoDB 8.0 repository for Ubuntu 22.04 Jammy. If your VPS
        uses a different Ubuntu LTS release, use the matching MongoDB repository codename.
      </p>

      <h2>2. Install prerequisites and the MongoDB signing key</h2>
      <CodeBlock
        language="bash"
        code={`sudo apt-get update
sudo apt-get install -y gnupg curl

curl -fsSL https://pgp.mongodb.com/server-8.0.asc | \
  sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor`}
      />

      <h2>3. Add the MongoDB 8.0 repository</h2>
      <CodeBlock
        language="bash"
        code={`echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/8.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list

sudo apt-get update`}
      />

      <h2>4. Install MongoDB Community Edition</h2>
      <CodeBlock language="bash" code={`sudo apt-get install -y mongodb-org`} />

      <h2>5. Start MongoDB and enable it at boot</h2>
      <CodeBlock
        language="bash"
        code={`sudo systemctl enable --now mongod
sudo systemctl status mongod`}
      />
      <p>If startup fails, inspect the service logs:</p>
      <CodeBlock language="bash" code={`sudo journalctl -u mongod -n 100 --no-pager`} />

      <h2>6. Verify the local shell connection</h2>
      <CodeBlock language="bash" code={`mongosh`} />
      <p>Inside mongosh:</p>
      <CodeBlock
        language="javascript"
        code={`db.adminCommand({ ping: 1 })
// { ok: 1 }`}
      />

      <h2>7. Create the first administrator user</h2>
      <p>
        Before authorization is enabled, create an administrator that can manage users. Using
        <code>passwordPrompt()</code> prevents the password from appearing in shell history.
      </p>
      <CodeBlock
        language="javascript"
        code={`use admin

db.createUser({
  user: "mongoAdmin",
  pwd: passwordPrompt(),
  roles: [
    { role: "userAdminAnyDatabase", db: "admin" }
  ]
})`}
      />
      <p>
        This account is for user administration. Do not use the admin account inside your
        Node.js application.
      </p>

      <h2>8. Enable MongoDB authorization</h2>
      <p>Edit the MongoDB configuration:</p>
      <CodeBlock language="bash" code={`sudo nano /etc/mongod.conf`} />
      <p>Keep MongoDB local and enable role-based authorization:</p>
      <CodeBlock
        language="yaml"
        code={`net:
  port: 27017
  bindIp: 127.0.0.1

security:
  authorization: enabled`}
      />
      <p>Restart and confirm the service:</p>
      <CodeBlock
        language="bash"
        code={`sudo systemctl restart mongod
sudo systemctl status mongod`}
      />

      <h2>9. Authenticate as the administrator</h2>
      <CodeBlock
        language="bash"
        code={`mongosh --host 127.0.0.1 \
  --port 27017 \
  --authenticationDatabase admin \
  -u mongoAdmin -p`}
      />

      <h2>10. Create the application database user</h2>
      <p>
        Give the application only read/write access to its own database. In this example the
        database is <strong>portfolio</strong> and the application user is
        <strong>portfolioApp</strong>.
      </p>
      <CodeBlock
        language="javascript"
        code={`use portfolio

db.createUser({
  user: "portfolioApp",
  pwd: passwordPrompt(),
  roles: [
    { role: "readWrite", db: "portfolio" }
  ]
})`}
      />

      <h2>11. Test the application user</h2>
      <CodeBlock
        language="bash"
        code={`mongosh "mongodb://portfolioApp@127.0.0.1:27017/portfolio?authSource=portfolio" -p`}
      />
      <p>Then verify write access:</p>
      <CodeBlock
        language="javascript"
        code={`db.healthcheck.insertOne({ ok: true, checkedAt: new Date() })
db.healthcheck.findOne()
db.healthcheck.deleteMany({})`}
      />

      <h2>12. Build the production connection string</h2>
      <p>
        If the password contains characters such as <code>@</code>, <code>:</code>,
        <code>/</code> or <code>#</code>, URL-encode the password before placing it in a URI.
      </p>
      <CodeBlock
        language="env"
        code={`MONGODB_URI=mongodb://portfolioApp:URL_ENCODED_PASSWORD@127.0.0.1:27017/portfolio?authSource=portfolio`}
      />

      <h2>13. Use the URI from Node.js / Mongoose</h2>
      <CodeBlock
        language="javascript"
        code={`import mongoose from "mongoose";

await mongoose.connect(process.env.MONGODB_URI);

console.log("MongoDB connected");`}
      />

      <h2>14. Understand the most useful built-in roles</h2>
      <ul>
        <li><strong>read</strong> — read data from one database.</li>
        <li><strong>readWrite</strong> — normal application reads and writes on one database.</li>
        <li><strong>dbAdmin</strong> — database administration operations; not usually needed by an app.</li>
        <li><strong>userAdmin</strong> — manage users on one database.</li>
        <li><strong>userAdminAnyDatabase</strong> — manage users across databases; use for an admin account, not an app.</li>
      </ul>

      <h2>15. Inspect users and permissions</h2>
      <CodeBlock
        language="javascript"
        code={`use portfolio
db.getUsers()

db.getUser("portfolioApp")`}
      />

      <h2>16. Change a user password</h2>
      <CodeBlock
        language="javascript"
        code={`use portfolio
db.updateUser("portfolioApp", {
  pwd: passwordPrompt()
})`}
      />

      <h2>17. Grant or revoke a role</h2>
      <CodeBlock
        language="javascript"
        code={`use portfolio

db.grantRolesToUser("portfolioApp", [
  { role: "readWrite", db: "portfolio" }
])

db.revokeRolesFromUser("portfolioApp", [
  { role: "readWrite", db: "portfolio" }
])`}
      />

      <h2>18. Keep port 27017 private</h2>
      <p>
        With <code>bindIp: 127.0.0.1</code>, MongoDB does not listen on the public network.
        As an additional firewall rule you can explicitly deny the default port:
      </p>
      <CodeBlock language="bash" code={`sudo ufw deny 27017
sudo ufw status verbose`} />

      <h2>19. Remote administration without opening MongoDB publicly</h2>
      <p>
        Use an SSH tunnel from your computer when you need temporary remote access:
      </p>
      <CodeBlock
        language="bash"
        code={`ssh -L 27018:127.0.0.1:27017 ghulamyaseen@YOUR_VPS_IP`}
      />
      <p>
        Then connect your local MongoDB client to <code>127.0.0.1:27018</code>. The traffic
        travels through SSH while MongoDB itself remains private.
      </p>

      <h2>20. Basic backup and restore</h2>
      <CodeBlock
        language="bash"
        code={`# Backup
mongodump \
  --uri="mongodb://portfolioApp@127.0.0.1:27017/portfolio?authSource=portfolio" \
  --out=/home/ghulamyaseen/backups/mongo-$(date +%F)

# Restore
mongorestore \
  --uri="mongodb://portfolioApp@127.0.0.1:27017/portfolio?authSource=portfolio" \
  /path/to/backup/portfolio`}
      />

      <h2>21. Fast troubleshooting checklist</h2>
      <CodeBlock
        language="bash"
        code={`sudo systemctl status mongod
sudo journalctl -u mongod -n 100 --no-pager
sudo ss -lntp | grep 27017

mongosh --host 127.0.0.1 --port 27017 \
  --authenticationDatabase admin -u mongoAdmin -p`}
      />

      <h2>22. Production rules I follow</h2>
      <ul>
        <li>Keep MongoDB bound to localhost or a trusted private network.</li>
        <li>Enable authorization before production traffic reaches the application.</li>
        <li>Create a dedicated application user instead of using the admin account.</li>
        <li>Grant the smallest practical role, usually readWrite on one application database.</li>
        <li>Store database credentials in environment variables or a secrets manager.</li>
        <li>Back up the database and test restore procedures before you need them.</li>
      </ul>
    </>
  )
};

export default mongodbVpsSetup;
