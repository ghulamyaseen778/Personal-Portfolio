import type { BlogPost } from "../types";
import CodeBlock from "../components/CodeBlock";

const githubActionsVpsCicd: BlogPost = {
  slug: "production-ci-cd-github-actions-vps-docker",
  title: "Production CI/CD with GitHub Actions & VPS: Secure Docker Deployment, GHCR & Rollback",
  description:
    "Build a production-grade CI/CD pipeline where GitHub Actions tests and publishes an immutable Docker image, then a hardened VPS deploys it with health checks and automatic rollback.",
  category: "DevOps",
  readTime: "22 min read",
  date: "September 2026",
  tags: ["CI/CD", "GitHub Actions", "Docker", "GHCR", "VPS", "SSH", "Nginx", "Security"],
  featured: true,
  content: (
    <>
      <p>
        A production deployment should be repeatable, auditable and easy to roll back.
        Instead of logging into a VPS, running <code>git pull</code>, installing packages
        and building directly on the server, this pipeline builds the application once in
        GitHub Actions and deploys the exact tested Docker image to production.
      </p>

      <blockquote>
        Production rule: build once, deploy the same immutable artifact everywhere. Keep
        application runtime secrets on the server and give CI only the permissions it needs.
      </blockquote>

      <h2>1. Final production architecture</h2>
      <CodeBlock
        language="text"
        code={`Developer
   |
   v
Feature branch
   |
   v
Pull request
   |
   +-- lint / tests
   +-- Docker build validation
   +-- security checks
   |
   v
Protected main branch
   |
   v
GitHub Actions
   |
   +-- Build Docker image
   +-- Tag with commit SHA
   +-- Push to GHCR
   +-- Resolve immutable sha256 digest
   |
   v
GitHub production Environment
   |
   +-- Required approval
   |
   v
Restricted SSH deployment
   |
   v
Production VPS
   |
   +-- Pull exact image digest
   +-- Start container
   +-- Health check
   |
   +-- healthy   -> deployment complete
   |
   +-- unhealthy -> automatic rollback`}
      />

      <p>
        This separates CI from production runtime. GitHub Actions is responsible for testing
        and producing an image. The VPS is responsible only for running a specific approved
        image.
      </p>

      <h2>2. Why not build directly on the VPS?</h2>
      <p>A common deployment script looks like this:</p>
      <CodeBlock
        language="bash"
        code={`ssh production
git pull
npm install
npm run build
pm2 restart app`}
      />
      <p>
        It works for small projects, but it creates production drift. A dependency download,
        package registry problem, compiler difference or interrupted build can leave the
        server in an unknown state. It also requires the production machine to contain source
        code, Git credentials and the full build toolchain.
      </p>
      <p>
        With an image-based pipeline, GitHub builds the release in CI and the VPS only pulls
        the exact artifact that passed the checks.
      </p>

      <h2>3. Protect the production branch</h2>
      <p>
        Production deployment should happen only after code reaches the protected
        <code> main</code> branch. A practical workflow is:
      </p>
      <CodeBlock
        language="text"
        code={`feature/my-change
      |
      v
Pull Request
      |
      +-- required CI checks
      +-- code review
      |
      v
merge to main
      |
      v
build + publish image
      |
      v
production approval
      |
      v
deploy`}
      />
      <p>
        Enable pull-request requirements, required status checks and protection against force
        pushes or branch deletion. The deployment job should also use a GitHub Environment
        named <code>production</code> so approval and environment-scoped secrets are separate
        from normal CI.
      </p>

      <h2>4. Prepare a dedicated deployment user</h2>
      <p>Do not use root for normal deployments.</p>
      <CodeBlock
        language="bash"
        code={`sudo adduser deploy
sudo usermod -aG docker deploy

sudo mkdir -p /opt/myapp
sudo chown -R deploy:deploy /opt/myapp

sudo mkdir -p /etc/myapp
sudo chown root:root /etc/myapp
sudo chmod 755 /etc/myapp`}
      />
      <p>
        Standard Docker group membership is highly privileged because a user that controls
        the Docker daemon can effectively gain root-level control. For stricter environments,
        use rootless Docker or a tightly controlled deployment service instead.
      </p>

      <h2>5. Harden SSH</h2>
      <p>Create a small SSH hardening file:</p>
      <CodeBlock
        language="bash"
        code={`sudo nano /etc/ssh/sshd_config.d/production.conf`}
      />
      <CodeBlock
        language="text"
        code={`PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
PermitEmptyPasswords no
X11Forwarding no`}
      />
      <p>Validate the configuration before reloading SSH:</p>
      <CodeBlock
        language="bash"
        code={`sudo sshd -t
sudo systemctl reload ssh`}
      />
      <p>
        Keep the current SSH session open while testing a second connection so a configuration
        mistake does not lock you out.
      </p>

      <h2>6. Generate a dedicated CI deployment key</h2>
      <p>Generate a key on a trusted administrator machine:</p>
      <CodeBlock
        language="bash"
        code={`ssh-keygen -t ed25519 -a 100 \
  -C "github-production-deploy" \
  -f github-production-deploy`}
      />
      <p>
        Store the private key only in the GitHub <code>production</code> Environment secret.
        Put the public key in <code>/home/deploy/.ssh/authorized_keys</code>.
      </p>
      <CodeBlock
        language="bash"
        code={`sudo install -d -m 700 -o deploy -g deploy /home/deploy/.ssh
sudo touch /home/deploy/.ssh/authorized_keys
sudo chmod 600 /home/deploy/.ssh/authorized_keys
sudo chown deploy:deploy /home/deploy/.ssh/authorized_keys`}
      />

      <h2>7. Restrict the GitHub deployment key</h2>
      <p>
        A normal SSH key gives GitHub Actions an interactive shell if the key is compromised.
        A stronger setup forces that key through a small deployment wrapper.
      </p>
      <p>Create the wrapper:</p>
      <CodeBlock
        language="bash"
        code={`sudo nano /usr/local/bin/github-production-deploy`}
      />
      <CodeBlock
        language="bash"
        code={`#!/usr/bin/env bash
set -Eeuo pipefail

COMMAND="\${SSH_ORIGINAL_COMMAND:-}"

if [[ ! "\${COMMAND}" =~ ^deploy[[:space:]]+(.+)$ ]]; then
    echo "Deployment command rejected."
    exit 1
fi

IMAGE="\${BASH_REMATCH[1]}"

if [[ ! "\${IMAGE}" =~ ^ghcr\.io/[a-z0-9._/-]+@sha256:[a-f0-9]{64}$ ]]; then
    echo "Invalid image reference."
    exit 1
fi

IFS= read -r GHCR_USER
IFS= read -r GHCR_TOKEN

cleanup() {
    docker logout ghcr.io >/dev/null 2>&1 || true
    unset GHCR_TOKEN
}

trap cleanup EXIT

printf '%s' "\${GHCR_TOKEN}" \
  | docker login ghcr.io \
      --username "\${GHCR_USER}" \
      --password-stdin >/dev/null

/opt/myapp/deploy.sh "\${IMAGE}"`}
      />
      <CodeBlock
        language="bash"
        code={`sudo chmod 755 /usr/local/bin/github-production-deploy
sudo chown root:root /usr/local/bin/github-production-deploy`}
      />
      <p>
        Prefix the GitHub Actions public key in <code>authorized_keys</code> with a forced
        command:
      </p>
      <CodeBlock
        language="text"
        code={`restrict,command="/usr/local/bin/github-production-deploy" ssh-ed25519 AAAA... github-production-deploy`}
      />
      <p>
        The CI key can now trigger only the deployment wrapper. It cannot open an unrestricted
        interactive shell.
      </p>

      <h2>8. Configure the firewall</h2>
      <p>
        If Nginx is your public entry point, only SSH and HTTP/HTTPS need to be reachable from
        the internet.
      </p>
      <CodeBlock
        language="bash"
        code={`sudo ufw default deny incoming
sudo ufw default allow outgoing

sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

sudo ufw enable
sudo ufw status verbose`}
      />
      <p>
        Do not expose the application container port publicly. Bind it to localhost and let
        Nginx proxy to it.
      </p>

      <h2>9. Production directory layout</h2>
      <CodeBlock
        language="text"
        code={`/opt/myapp/
├── compose.yaml
├── deploy.sh
├── .image.env
└── deployment-state/

/etc/myapp/
└── app.env`}
      />
      <p>
        Files under <code>/opt/myapp</code> describe deployment state. Application secrets stay
        outside the repository in <code>/etc/myapp/app.env</code>.
      </p>

      <h2>10. Keep runtime secrets on the VPS</h2>
      <CodeBlock
        language="bash"
        code={`sudo touch /etc/myapp/app.env
sudo chmod 600 /etc/myapp/app.env
sudo chown root:root /etc/myapp/app.env

sudo nano /etc/myapp/app.env`}
      />
      <CodeBlock
        language="text"
        code={`NODE_ENV=production
PORT=3000

MONGODB_URI=YOUR_PRIVATE_DATABASE_URI
JWT_SECRET=YOUR_LONG_RANDOM_SECRET
SMTP_PASSWORD=YOUR_SMTP_PASSWORD
THIRD_PARTY_API_KEY=YOUR_API_KEY`}
      />
      <p>
        Runtime secrets such as database credentials, JWT keys and payment/provider secrets do
        not need to pass through GitHub Actions. This reduces the damage a compromised CI job
        could cause.
      </p>

      <h2>11. Production Dockerfile</h2>
      <p>
        The exact Dockerfile depends on the project. This Node.js example uses separate build
        and runtime stages and runs the final process as a non-root user.
      </p>
      <CodeBlock
        language="dockerfile"
        code={`FROM node:22-alpine AS dependencies

WORKDIR /app

COPY package*.json ./
RUN npm ci


FROM dependencies AS builder

WORKDIR /app
COPY . .
RUN npm run build


FROM node:22-alpine AS production

ENV NODE_ENV=production
WORKDIR /app

RUN addgroup -S appgroup \
    && adduser -S appuser -G appgroup

COPY package*.json ./
RUN npm ci --omit=dev \
    && npm cache clean --force

COPY --from=builder /app/dist ./dist

USER appuser

EXPOSE 3000

CMD ["node", "dist/server.js"]`}
      />
      <p>
        Pin the base image more strictly in high-assurance environments and keep the runtime
        image minimal.
      </p>

      <h2>12. Add a .dockerignore</h2>
      <CodeBlock
        language="text"
        code={`.git
.github
node_modules
.env
.env.*
*.log
coverage
README.md`}
      />
      <p>
        In particular, do not let local <code>.env</code> files become part of the Docker
        build context.
      </p>

      <h2>13. Add an application health endpoint</h2>
      <p>Your backend needs a lightweight endpoint that does not require authentication:</p>
      <CodeBlock
        language="javascript"
        code={`app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy"
  });
});`}
      />
      <p>
        For deeper readiness checks you can verify critical dependencies, but avoid making the
        health endpoint so expensive that it creates load by itself.
      </p>

      <h2>14. Production Docker Compose</h2>
      <p>Create <code>/opt/myapp/compose.yaml</code>:</p>
      <CodeBlock
        language="yaml"
        code={`services:
  app:
    image: \${APP_IMAGE}
    container_name: myapp
    restart: unless-stopped

    env_file:
      - /etc/myapp/app.env

    ports:
      - "127.0.0.1:3000:3000"

    security_opt:
      - no-new-privileges:true

    cap_drop:
      - ALL

    read_only: true

    tmpfs:
      - /tmp

    healthcheck:
      test:
        [
          "CMD",
          "node",
          "-e",
          "fetch('http://127.0.0.1:3000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
        ]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 20s

    logging:
      driver: json-file
      options:
        max-size: "20m"
        max-file: "5"`}
      />
      <p>
        If your application needs writable directories, mount only those paths instead of
        removing <code>read_only</code> for the whole container.
      </p>

      <h2>15. Deployment script with rollback</h2>
      <p>Create <code>/opt/myapp/deploy.sh</code>:</p>
      <CodeBlock
        language="bash"
        code={`#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="/opt/myapp"
IMAGE_ENV="\${APP_DIR}/.image.env"
STATE_DIR="\${APP_DIR}/deployment-state"
LOCK_FILE="\${STATE_DIR}/deploy.lock"

NEW_IMAGE="\${1:-}"

if [[ -z "\${NEW_IMAGE}" ]]; then
    echo "Usage: deploy.sh <immutable-image>"
    exit 1
fi

mkdir -p "\${STATE_DIR}"

exec 9>"\${LOCK_FILE}"
if ! flock -n 9; then
    echo "Another deployment is already running."
    exit 1
fi

cd "\${APP_DIR}"

PREVIOUS_IMAGE=""
if [[ -f "\${IMAGE_ENV}" ]]; then
    PREVIOUS_IMAGE="$(sed -n 's/^APP_IMAGE=//p' "\${IMAGE_ENV}" || true)"
fi

write_image_env() {
    local image="$1"
    local temp
    temp="$(mktemp "\${APP_DIR}/.image.env.XXXXXX")"
    printf 'APP_IMAGE=%s\n' "\${image}" > "\${temp}"
    mv "\${temp}" "\${IMAGE_ENV}"
}

echo "Deploying: \${NEW_IMAGE}"
echo "Previous: \${PREVIOUS_IMAGE:-none}"

write_image_env "\${NEW_IMAGE}"

docker compose --env-file "\${IMAGE_ENV}" pull app
docker compose --env-file "\${IMAGE_ENV}" up -d --no-deps app

SUCCESS=false

for attempt in {1..12}; do
    STATUS="$(
        docker inspect \
          --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' \
          myapp 2>/dev/null || true
    )"

    echo "Health status: \${STATUS}"

    if [[ "\${STATUS}" == "healthy" ]]; then
        SUCCESS=true
        break
    fi

    sleep 5
done

if [[ "\${SUCCESS}" == "true" ]]; then
    echo "Deployment successful."
    docker image prune -f >/dev/null 2>&1 || true
    exit 0
fi

echo "Deployment failed."

if [[ -z "\${PREVIOUS_IMAGE}" ]]; then
    echo "No previous image is available for rollback."
    exit 1
fi

echo "Rolling back to: \${PREVIOUS_IMAGE}"

write_image_env "\${PREVIOUS_IMAGE}"

docker compose --env-file "\${IMAGE_ENV}" pull app
docker compose --env-file "\${IMAGE_ENV}" up -d --no-deps app

sleep 10

ROLLBACK_STATUS="$(
    docker inspect \
      --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' \
      myapp 2>/dev/null || true
)"

if [[ "\${ROLLBACK_STATUS}" != "healthy" ]]; then
    echo "CRITICAL: rollback container is not healthy."
    exit 2
fi

echo "Rollback successful."
exit 1`}
      />
      <CodeBlock
        language="bash"
        code={`chmod 750 /opt/myapp/deploy.sh
chown deploy:deploy /opt/myapp/deploy.sh`}
      />
      <p>
        The lock prevents two production deployments from running at the same time. The image
        file is updated atomically and the previous immutable image remains available for
        rollback.
      </p>

      <h2>16. Create the GitHub production Environment</h2>
      <p>
        In the repository, create an Environment named <code>production</code>. Configure
        branch restrictions and require approval where your GitHub plan and repository
        settings support it.
      </p>
      <p>Store only deployment secrets there:</p>
      <CodeBlock
        language="text"
        code={`PROD_HOST
PROD_PORT
PROD_USER
PROD_SSH_KEY
PROD_KNOWN_HOSTS`}
      />
      <p>
        <code>PROD_KNOWN_HOSTS</code> should contain the verified host key for the production
        VPS. Verify the fingerprint through your VPS provider console or another trusted
        channel before trusting it. Do not disable <code>StrictHostKeyChecking</code>.
      </p>

      <h2>17. GitHub Actions production workflow</h2>
      <p>Create <code>.github/workflows/production.yml</code>:</p>
      <CodeBlock
        language="yaml"
        code={`name: Production CI/CD

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions: {}

concurrency:
  group: production
  cancel-in-progress: false

env:
  REGISTRY: ghcr.io

jobs:
  test:
    runs-on: ubuntu-latest

    permissions:
      contents: read

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          persist-credentials: false

      - name: Build validation image
        run: |
          docker build \
            --target builder \
            --tag app-test:\${GITHUB_SHA} \
            .

      - name: Inspect image
        run: docker image inspect app-test:\${GITHUB_SHA}

  publish:
    runs-on: ubuntu-latest
    needs: test

    permissions:
      contents: read
      packages: write

    outputs:
      image_ref: \${{ steps.digest.outputs.image_ref }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          persist-credentials: false

      - name: Calculate image name
        id: image
        shell: bash
        run: |
          IMAGE="$(echo "\${REGISTRY}/\${GITHUB_REPOSITORY}" | tr '[:upper:]' '[:lower:]')"
          echo "name=\${IMAGE}" >> "\${GITHUB_OUTPUT}"

      - name: Login to GHCR
        shell: bash
        run: |
          printf '%s' "\${{ secrets.GITHUB_TOKEN }}" \
            | docker login "\${REGISTRY}" \
                --username "\${GITHUB_ACTOR}" \
                --password-stdin

      - name: Build production image
        shell: bash
        run: |
          docker build \
            --pull \
            --tag "\${{ steps.image.outputs.name }}:\${GITHUB_SHA}" \
            .

      - name: Push production image
        shell: bash
        run: |
          docker push "\${{ steps.image.outputs.name }}:\${GITHUB_SHA}"

      - name: Resolve immutable digest
        id: digest
        shell: bash
        run: |
          docker pull "\${{ steps.image.outputs.name }}:\${GITHUB_SHA}"

          IMAGE_REF="$(
            docker inspect \
              --format='{{index .RepoDigests 0}}' \
              "\${{ steps.image.outputs.name }}:\${GITHUB_SHA}"
          )"

          echo "image_ref=\${IMAGE_REF}" >> "\${GITHUB_OUTPUT}"

      - name: Logout
        if: always()
        run: docker logout "\${REGISTRY}" || true

  deploy:
    runs-on: ubuntu-latest
    needs: publish

    environment:
      name: production

    permissions:
      contents: read
      packages: read

    steps:
      - name: Configure SSH
        shell: bash
        env:
          SSH_PRIVATE_KEY: \${{ secrets.PROD_SSH_KEY }}
          SSH_KNOWN_HOSTS: \${{ secrets.PROD_KNOWN_HOSTS }}
        run: |
          install -m 700 -d ~/.ssh

          printf '%s\n' "\${SSH_PRIVATE_KEY}" > ~/.ssh/id_ed25519
          chmod 600 ~/.ssh/id_ed25519

          printf '%s\n' "\${SSH_KNOWN_HOSTS}" > ~/.ssh/known_hosts
          chmod 600 ~/.ssh/known_hosts

      - name: Deploy immutable image
        shell: bash
        env:
          PROD_HOST: \${{ secrets.PROD_HOST }}
          PROD_PORT: \${{ secrets.PROD_PORT }}
          PROD_USER: \${{ secrets.PROD_USER }}
          IMAGE_REF: \${{ needs.publish.outputs.image_ref }}
          GHCR_USER: \${{ github.actor }}
          GHCR_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          printf '%s\n%s\n' "\${GHCR_USER}" "\${GHCR_TOKEN}" \
            | ssh \
                -i ~/.ssh/id_ed25519 \
                -p "\${PROD_PORT}" \
                -o BatchMode=yes \
                -o IdentitiesOnly=yes \
                -o StrictHostKeyChecking=yes \
                "\${PROD_USER}@\${PROD_HOST}" \
                "deploy \${IMAGE_REF}"

      - name: Remove SSH key
        if: always()
        run: rm -f ~/.ssh/id_ed25519`}
      />
      <p>
        The example uses readable action version tags. In a stricter production repository,
        pin third-party and GitHub actions to reviewed full commit SHAs so the referenced
        action code cannot move underneath the workflow.
      </p>

      <h2>18. Why deploy by image digest?</h2>
      <p>A normal tag can move:</p>
      <CodeBlock
        language="text"
        code={`ghcr.io/company/backend:latest
ghcr.io/company/backend:production
ghcr.io/company/backend:main`}
      />
      <p>An immutable digest identifies the exact image that CI built and tested:</p>
      <CodeBlock
        language="text"
        code={`ghcr.io/company/backend@sha256:0123456789abcdef...`}
      />
      <p>
        This makes deployment and rollback deterministic. A tag can still be useful for humans,
        but production should preferably record and deploy the digest.
      </p>

      <h2>19. Put Nginx in front of the container</h2>
      <p>
        Docker exposes the application only on <code>127.0.0.1:3000</code>. Nginx owns the
        public HTTPS connection.
      </p>
      <CodeBlock
        language="nginx"
        code={`server {
    listen 443 ssl http2;
    server_name api.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}`}
      />
      <p>
        Configure your real TLS certificate separately, validate with
        <code> sudo nginx -t</code>, and only then reload Nginx.
      </p>

      <h2>20. First deployment checklist</h2>
      <CodeBlock
        language="bash"
        code={`# Confirm Docker access
docker version
docker compose version

# Confirm deployment files
ls -la /opt/myapp
sudo ls -la /etc/myapp

# Validate Compose syntax
cd /opt/myapp
docker compose config

# Confirm Nginx
sudo nginx -t

# Confirm firewall
sudo ufw status verbose

# Confirm application is not publicly bound
sudo ss -tulpn`}
      />
      <p>
        Before connecting GitHub Actions, run one manual deployment using a known test image so
        the Compose file, health check and rollback path are already proven.
      </p>

      <h2>21. What happens on every release?</h2>
      <CodeBlock
        language="text"
        code={`Current production:
  sha256:AAA

New commit merged:
  GitHub Actions builds sha256:BBB

Deployment:
  VPS pulls BBB
  VPS starts BBB
  health check runs

If healthy:
  BBB stays in production

If unhealthy:
  deployment script restores AAA`}
      />
      <p>
        There is no <code>git pull</code>, no production <code>npm install</code> and no source
        compilation on the VPS.
      </p>

      <h2>22. Production hardening checklist</h2>
      <ul>
        <li>Protect main and require CI before merge.</li>
        <li>Use a GitHub Environment for production approval and secrets.</li>
        <li>Set workflow permissions to deny by default and grant per job.</li>
        <li>Use a dedicated deployment SSH key, not a personal administrator key.</li>
        <li>Restrict the deployment key to a forced deployment command.</li>
        <li>Keep strict SSH host-key verification enabled.</li>
        <li>Deploy immutable image digests rather than only mutable tags.</li>
        <li>Keep runtime secrets outside the repository and Docker image.</li>
        <li>Bind application ports to localhost behind Nginx.</li>
        <li>Run containers as non-root when possible.</li>
        <li>Drop unnecessary Linux capabilities and enable no-new-privileges.</li>
        <li>Add container health checks and test the rollback path.</li>
        <li>Prevent concurrent production deployments.</li>
        <li>Rotate SSH keys and secrets on a documented schedule.</li>
        <li>Keep Ubuntu, Docker, base images and application dependencies patched.</li>
        <li>Back up persistent data independently from the application container.</li>
      </ul>

      <h2>23. Zero-downtime upgrade path</h2>
      <p>
        The single-container design is reliable and easy to operate, but replacing a container
        can cause a short interruption. When the application needs near-zero deployment
        downtime, move to blue/green deployment:
      </p>
      <CodeBlock
        language="text"
        code={`Production traffic -> Nginx -> BLUE

Deploy GREEN
   |
   +-- start new version
   +-- wait for health
   +-- run smoke test
   |
   v
Switch Nginx upstream

Production traffic -> Nginx -> GREEN

Keep BLUE briefly for instant rollback`}
      />
      <p>
        The same GitHub Actions build and GHCR image strategy can stay in place. Only the VPS
        deployment script changes from in-place replacement to blue/green traffic switching.
      </p>

      <h2>24. Final result</h2>
      <p>
        This pipeline gives a single production VPS many of the deployment properties normally
        associated with larger platforms: controlled releases, immutable artifacts, minimal CI
        permissions, separation of runtime secrets, health-gated deployment and automatic
        rollback.
      </p>
      <p>
        For higher availability, the next architectural step is multiple application VPS
        servers behind a load balancer, with the same image digest deployed to every healthy
        node one at a time.
      </p>
    </>
  )
};

export default githubActionsVpsCicd;
