import type { BlogPost } from "../types";
import CodeBlock from "../components/CodeBlock";

const vpsServerSetup: BlogPost = {
  slug: "vps-server-setup-from-zero",
  title: "VPS Server Setup From Zero: Deploy a MERN App with Nginx, PM2, MongoDB & SSL",
  description:
    "A practical end-to-end Ubuntu VPS deployment guide using a dedicated Linux user, Node.js via NVM, MongoDB, PM2, Nginx, DNS and HTTPS.",
  category: "DevOps",
  readTime: "18 min read",
  date: "September 2026",
  tags: ["VPS", "Ubuntu", "Node.js", "Nginx", "PM2", "MongoDB", "SSL"],
  featured: true,
  content: (
    <>
      <p>
        This is the deployment flow I use when I want a clean Linux VPS instead of a
        one-click platform. The example frontend domain is <strong>ghulamyaseen.site</strong>,
        the API is <strong>api.ghulamyaseen.site</strong>, and the Linux deployment user is
        <strong>ghulamyaseen</strong>.
      </p>

      <blockquote>
        Never paste real production passwords, JWT secrets or database credentials into a
        tutorial, Git repository or screenshot. Every secret below is a placeholder.
      </blockquote>

      <h2>1. The final architecture</h2>
      <p>
        Nginx listens publicly on ports 80 and 443. It serves the built React/Vite frontend
        directly and reverse-proxies API requests to a Node.js process running privately on
        localhost. PM2 keeps the Node process alive. MongoDB stays bound to localhost and is
        not exposed to the public internet.
      </p>
      <CodeBlock
        language="text"
        code={`Internet
  ├── https://ghulamyaseen.site      -> Nginx -> /client/dist
  └── https://api.ghulamyaseen.site  -> Nginx -> 127.0.0.1:8000
                                               └── Node.js / PM2
                                                    └── MongoDB 127.0.0.1:27017`}
      />

      <h2>2. Provision Ubuntu and connect over SSH</h2>
      <p>
        Choose an Ubuntu LTS image for the VPS. After the server is ready, connect with the
        provider user first. If you already created the deployment user, connect directly:
      </p>
      <CodeBlock language="bash" code={`ssh ghulamyaseen@YOUR_VPS_IP`} />
      <p>
        If the host key changed because the VPS was rebuilt, verify the new fingerprint in
        your provider dashboard before removing the old entry from your local known_hosts file.
      </p>

      <h2>3. Update the operating system</h2>
      <CodeBlock
        language="bash"
        code={`sudo apt update
sudo apt upgrade -y
sudo apt install -y curl git build-essential ufw`}
      />

      <h2>4. Create a dedicated deployment user</h2>
      <p>
        Avoid running the application as root. If the user does not already exist, create it
        and allow administrative commands through sudo:
      </p>
      <CodeBlock
        language="bash"
        code={`sudo adduser ghulamyaseen
sudo usermod -aG sudo ghulamyaseen

sudo mkdir -p /home/ghulamyaseen/apps
sudo chown -R ghulamyaseen:ghulamyaseen /home/ghulamyaseen/apps`}
      />

      <h2>5. Add an SSH key</h2>
      <p>On your local machine, generate a key if you do not have one:</p>
      <CodeBlock language="bash" code={`ssh-keygen -t ed25519 -C "deploy@ghulamyaseen.site"`} />
      <p>Copy the public key to the server:</p>
      <CodeBlock language="bash" code={`ssh-copy-id ghulamyaseen@YOUR_VPS_IP`} />

      <h2>6. Configure the firewall</h2>
      <p>
        Keep only SSH and web traffic public. Your Node.js and MongoDB ports should remain
        private when Nginx and the app live on the same VPS.
      </p>
      <CodeBlock
        language="bash"
        code={`sudo ufw allow OpenSSH
sudo ufw allow "Nginx Full"
sudo ufw enable
sudo ufw status verbose`}
      />

      <h2>7. Install Node.js with NVM</h2>
      <p>
        NVM makes it easy to install and switch Node.js versions without using the distro&apos;s
        older package. Install NVM, reload the shell and use the current LTS release:
      </p>
      <CodeBlock
        language="bash"
        code={`curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.7/install.sh | bash
source ~/.bashrc

nvm --version
nvm install --lts
nvm use --lts

node -v
npm -v`}
      />

      <h2>8. Clone the application</h2>
      <p>
        For a public repository, normal Git is enough. For a private repository, authenticate
        with an SSH deploy key or GitHub CLI before cloning.
      </p>
      <CodeBlock
        language="bash"
        code={`cd /home/ghulamyaseen/apps
git clone YOUR_REPOSITORY_URL portfolio
cd portfolio`}
      />

      <h2>9. Install MongoDB</h2>
      <p>
        If the application uses a local MongoDB server, install MongoDB Community Edition and
        keep it bound to localhost. I keep the full secure database setup in the separate
        MongoDB article, including users, roles and authentication.
      </p>
      <CodeBlock
        language="bash"
        code={`sudo apt-get install -y gnupg curl

curl -fsSL https://pgp.mongodb.com/server-8.0.asc | \
  sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor

echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/8.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list

sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl enable --now mongod
sudo systemctl status mongod`}
      />

      <h2>10. Configure the backend</h2>
      <p>Move into the API directory and install dependencies:</p>
      <CodeBlock
        language="bash"
        code={`cd /home/ghulamyaseen/apps/portfolio/server
npm ci`}
      />
      <p>Create the production environment file:</p>
      <CodeBlock
        language="bash"
        code={`nano .env

NODE_ENV=production
PORT=8000
MONGODB_URI=mongodb://portfolioApp:URL_ENCODED_PASSWORD@127.0.0.1:27017/portfolio?authSource=portfolio
JWT_SECRET=GENERATE_A_LONG_RANDOM_SECRET`}
      />
      <p>
        Do not use <code>cat .env</code> in recorded demos or shared terminals because it can
        expose credentials. Check only the variables you need.
      </p>

      <h2>11. Keep the backend alive with PM2</h2>
      <CodeBlock
        language="bash"
        code={`npm install -g pm2

pm2 start npm --name "ghulamyaseen-api" -- start
pm2 status
pm2 logs ghulamyaseen-api

pm2 startup systemd
# Run the command PM2 prints, then:
pm2 save`}
      />
      <p>Test the API locally before putting Nginx in front of it:</p>
      <CodeBlock language="bash" code={`curl http://127.0.0.1:8000/`} />

      <h2>12. Build the frontend</h2>
      <CodeBlock
        language="bash"
        code={`cd /home/ghulamyaseen/apps/portfolio/client
npm ci

nano .env
# VITE_API_URL=https://api.ghulamyaseen.site

npm run build
ls -la dist`}
      />
      <p>
        Vite preview is useful for testing, but it is not the production web server. Serve the
        generated <code>dist</code> directory through Nginx.
      </p>

      <h2>13. Install and configure Nginx for the frontend</h2>
      <CodeBlock language="bash" code={`sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/ghulamyaseen.site`} />
      <CodeBlock
        language="nginx"
        code={`server {
    listen 80;
    server_name ghulamyaseen.site www.ghulamyaseen.site;

    root /home/ghulamyaseen/apps/portfolio/client/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \\.(?:css|js|svg|png|jpg|jpeg|webp|ico|woff2?)$ {
        expires 7d;
        add_header Cache-Control "public";
        try_files $uri =404;
    }
}`}
      />

      <h2>14. Configure Nginx for the backend API</h2>
      <CodeBlock language="bash" code={`sudo nano /etc/nginx/sites-available/api.ghulamyaseen.site`} />
      <CodeBlock
        language="nginx"
        code={`server {
    listen 80;
    server_name api.ghulamyaseen.site;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}`}
      />

      <h2>15. Enable the sites and validate Nginx</h2>
      <CodeBlock
        language="bash"
        code={`sudo ln -s /etc/nginx/sites-available/ghulamyaseen.site /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/api.ghulamyaseen.site /etc/nginx/sites-enabled/

sudo nginx -t
sudo systemctl reload nginx`}
      />

      <h2>16. Point DNS to the VPS</h2>
      <p>Create DNS records at the provider that controls your domain:</p>
      <CodeBlock
        language="text"
        code={`A     @       YOUR_VPS_IP
A     www     YOUR_VPS_IP
A     api     YOUR_VPS_IP`}
      />
      <p>Wait for DNS propagation, then verify:</p>
      <CodeBlock
        language="bash"
        code={`dig +short ghulamyaseen.site
dig +short api.ghulamyaseen.site`}
      />

      <h2>17. Add HTTPS with Let&apos;s Encrypt</h2>
      <CodeBlock
        language="bash"
        code={`sudo apt install -y certbot python3-certbot-nginx

sudo certbot --nginx \
  -d ghulamyaseen.site \
  -d www.ghulamyaseen.site

sudo certbot --nginx \
  -d api.ghulamyaseen.site

sudo certbot renew --dry-run`}
      />

      <h2>18. Production update workflow</h2>
      <CodeBlock
        language="bash"
        code={`cd /home/ghulamyaseen/apps/portfolio
git pull

cd server
npm ci
pm2 restart ghulamyaseen-api

cd ../client
npm ci
npm run build

sudo nginx -t && sudo systemctl reload nginx`}
      />

      <h2>19. Useful troubleshooting commands</h2>
      <CodeBlock
        language="bash"
        code={`# Node process
pm2 status
pm2 logs ghulamyaseen-api --lines 100

# Nginx
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log

# MongoDB
sudo systemctl status mongod
sudo journalctl -u mongod -n 100 --no-pager

# Open ports
sudo ss -tulpn

# Firewall
sudo ufw status verbose`}
      />

      <h2>20. Final security checklist</h2>
      <ul>
        <li>Run the application as a normal deployment user, not root.</li>
        <li>Use SSH keys and protect the private key on your local machine.</li>
        <li>Keep ports 8000 and 27017 private when Nginx and MongoDB are local.</li>
        <li>Enable MongoDB authentication and give the application only the role it needs.</li>
        <li>Never commit .env files or production secrets.</li>
        <li>Use HTTPS for both the website and API.</li>
        <li>Keep Ubuntu, Node.js dependencies and MongoDB patched.</li>
      </ul>
    </>
  )
};

export default vpsServerSetup;
