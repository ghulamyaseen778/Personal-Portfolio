import type { BlogPost } from "../types";
import CodeBlock from "../components/CodeBlock";

const vpsLoadBalancer: BlogPost = {
  slug: "vps-load-balancer-nginx-multiple-servers",
  title: "Build a Load Balancer on a VPS with Nginx: Distribute Traffic Across Multiple Servers",
  description:
    "A production-focused guide to turning an Ubuntu VPS into an Nginx load balancer for multiple application servers, with HTTPS, firewall rules, health behavior, scaling and high-availability options.",
  category: "DevOps",
  readTime: "17 min read",
  date: "September 2026",
  tags: ["Load Balancer", "Nginx", "Ubuntu", "VPS", "Reverse Proxy", "SSL", "High Availability", "DevOps"],
  featured: true,
  content: (
    <>
      <p>
        When one application server is no longer enough, a dedicated VPS can sit in front of
        several backend servers and distribute incoming requests between them. Nginx is a
        practical choice for this because it can terminate HTTPS, reverse-proxy requests and
        balance traffic with very little overhead.
      </p>

      <blockquote>
        A single self-hosted load balancer is still a single point of failure. This guide first
        builds the simple one-load-balancer architecture, then explains how to remove that
        weakness with a second load balancer or a provider-managed failover address.
      </blockquote>

      <h2>1. Target architecture</h2>
      <CodeBlock
        language="text"
        code={"Users / Internet\n        |\n        | HTTPS :443\n        v\n+-----------------------+\n| Load Balancer VPS     |\n| Nginx                 |\n| lb.example.com        |\n+-----------+-----------+\n            |\n      +-----+-----+----------------+\n      |           |                |\n      v           v                v\n+-----------+ +-----------+ +-----------+\n| App VPS 1 | | App VPS 2 | | App VPS 3 |\n| :8000     | | :8000     | | :8000     |\n+-----------+ +-----------+ +-----------+\n      \\           |              /\n       \\----------+-------------/\n                  |\n                  v\n             Database VPS"}
      />

      <p>
        The public domain points only to the load balancer. Backend application ports do not
        need to be open to the whole internet; they should accept traffic only from the load
        balancer or through a private/IPsec network.
      </p>

      <h2>2. Example server plan</h2>
      <p>Use placeholders in documentation and replace them with your real addresses:</p>
      <CodeBlock
        language="text"
        code={"Load Balancer Public IP:  LB_PUBLIC_IP\n\nBackend 1: APP1_PRIVATE_IP:8000\nBackend 2: APP2_PRIVATE_IP:8000\nBackend 3: APP3_PRIVATE_IP:8000\n\nDomain: api.example.com"}
      />
      <p>
        If your VPS provider does not give all servers a private network, the same design can
        use IPsec tunnel addresses instead of public backend addresses.
      </p>

      <h2>3. Prepare every application server</h2>
      <p>
        Each backend should run the same version of the application and expose the same port.
        For a Node.js app, for example:
      </p>
      <CodeBlock
        language="bash"
        code={"PORT=8000 npm start\n\n# Confirm locally\ncurl http://127.0.0.1:8000/health"}
      />
      <p>
        Add a lightweight health endpoint that does not perform expensive work:
      </p>
      <CodeBlock
        language="javascript"
        code={"app.get(\"/health\", (req, res) => {\n  res.status(200).json({\n    ok: true,\n    server: process.env.SERVER_NAME\n  });\n});"}
      />
      <p>
        Giving each server a temporary <code>SERVER_NAME</code> value is useful while testing
        because you can see which backend handled a request.
      </p>

      <h2>4. Restrict the backend firewall</h2>
      <p>
        Do not leave port 8000 open to everyone. On each backend VPS, allow SSH first and then
        allow the application port only from the load balancer.
      </p>
      <CodeBlock
        language="bash"
        code={"sudo ufw allow 22/tcp\nsudo ufw allow from LB_PRIVATE_OR_TUNNEL_IP to any port 8000 proto tcp\nsudo ufw enable\nsudo ufw status numbered"}
      />
      <p>
        If you are using an IPsec tunnel, you can restrict the rule to the tunnel interface:
      </p>
      <CodeBlock
        language="bash"
        code={"sudo ufw allow in on ipsec0 from LB_TUNNEL_IP to any port 8000 proto tcp"}
      />

      <h2>5. Install Nginx on the load balancer VPS</h2>
      <CodeBlock
        language="bash"
        code={"sudo apt update\nsudo apt install -y nginx ufw\n\nsudo systemctl enable --now nginx\nsudo systemctl status nginx --no-pager"}
      />

      <h2>6. Configure the load balancer firewall</h2>
      <p>
        The load balancer is the public entry point, so it normally accepts SSH, HTTP and
        HTTPS:
      </p>
      <CodeBlock
        language="bash"
        code={"sudo ufw allow 22/tcp\nsudo ufw allow 80/tcp\nsudo ufw allow 443/tcp\nsudo ufw enable\nsudo ufw status verbose"}
      />

      <h2>7. Create the Nginx upstream pool</h2>
      <p>Create a site configuration:</p>
      <CodeBlock language="bash" code={"sudo nano /etc/nginx/sites-available/api.example.com"} />
      <p>
        Nginx uses round-robin balancing by default, so requests rotate through available
        servers:
      </p>
      <CodeBlock
        language="nginx"
        code={"upstream app_backend {\n    server APP1_PRIVATE_IP:8000 max_fails=3 fail_timeout=30s;\n    server APP2_PRIVATE_IP:8000 max_fails=3 fail_timeout=30s;\n    server APP3_PRIVATE_IP:8000 max_fails=3 fail_timeout=30s;\n\n    keepalive 32;\n}\n\nserver {\n    listen 80;\n    server_name api.example.com;\n\n    location / {\n        proxy_pass http://app_backend;\n        proxy_http_version 1.1;\n\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n        proxy_set_header X-Forwarded-Proto $scheme;\n\n        proxy_set_header Connection \"\";\n\n        proxy_connect_timeout 5s;\n        proxy_send_timeout 60s;\n        proxy_read_timeout 60s;\n    }\n}"}
      />

      <h2>8. Enable and validate the site</h2>
      <CodeBlock
        language="bash"
        code={"sudo ln -s /etc/nginx/sites-available/api.example.com /etc/nginx/sites-enabled/api.example.com\n\nsudo nginx -t\nsudo systemctl reload nginx"}
      />
      <p>
        If the default Nginx site is not needed, remove its enabled symlink:
      </p>
      <CodeBlock language="bash" code={"sudo rm -f /etc/nginx/sites-enabled/default\nsudo nginx -t && sudo systemctl reload nginx"} />

      <h2>9. Point DNS to the load balancer</h2>
      <p>Your public DNS should point to the load balancer, not directly to the app servers:</p>
      <CodeBlock
        language="text"
        code={"A    api    LB_PUBLIC_IP"}
      />
      <p>Verify DNS:</p>
      <CodeBlock language="bash" code={"dig +short api.example.com"} />

      <h2>10. Add HTTPS with Certbot</h2>
      <CodeBlock
        language="bash"
        code={"sudo apt install -y certbot python3-certbot-nginx\n\nsudo certbot --nginx -d api.example.com\n\nsudo certbot renew --dry-run"}
      />
      <p>
        HTTPS terminates on the load balancer. Traffic from the load balancer to backend
        servers can stay inside a trusted private network or encrypted IPsec tunnels.
      </p>

      <h2>11. Test traffic distribution</h2>
      <p>
        If each backend returns its server name from <code>/health</code>, send several
        requests:
      </p>
      <CodeBlock
        language="bash"
        code={"for i in {1..9}; do\n  curl -s https://api.example.com/health\n  echo\ndone"}
      />
      <p>
        With normal round-robin balancing, responses should move between the three backends.
      </p>

      <h2>12. Choose a balancing method</h2>
      <p>Nginx supports several useful strategies.</p>

      <h3>Round robin — default</h3>
      <CodeBlock
        language="nginx"
        code={"upstream app_backend {\n    server APP1_PRIVATE_IP:8000;\n    server APP2_PRIVATE_IP:8000;\n    server APP3_PRIVATE_IP:8000;\n}"}
      />
      <p>Best when the backend servers have roughly equal capacity and request cost.</p>

      <h3>Least connections</h3>
      <CodeBlock
        language="nginx"
        code={"upstream app_backend {\n    least_conn;\n\n    server APP1_PRIVATE_IP:8000;\n    server APP2_PRIVATE_IP:8000;\n    server APP3_PRIVATE_IP:8000;\n}"}
      />
      <p>
        This sends the next request to the server with the fewest active connections and can
        help when request durations vary.
      </p>

      <h3>Weighted servers</h3>
      <CodeBlock
        language="nginx"
        code={"upstream app_backend {\n    server APP1_PRIVATE_IP:8000 weight=3;\n    server APP2_PRIVATE_IP:8000 weight=2;\n    server APP3_PRIVATE_IP:8000 weight=1;\n}"}
      />
      <p>
        Use weights when one VPS has more CPU or memory than another.
      </p>

      <h3>IP hash / sticky behavior</h3>
      <CodeBlock
        language="nginx"
        code={"upstream app_backend {\n    ip_hash;\n\n    server APP1_PRIVATE_IP:8000;\n    server APP2_PRIVATE_IP:8000;\n    server APP3_PRIVATE_IP:8000;\n}"}
      />
      <p>
        This can keep a client on the same backend, but stateless applications are usually
        easier to scale than relying on sticky sessions.
      </p>

      <h2>13. Do not store login sessions only in server memory</h2>
      <p>
        Once requests can land on different app servers, in-memory sessions become fragile.
        Prefer one of these patterns:
      </p>
      <ul>
        <li>Stateless JWT or token-based authentication.</li>
        <li>A shared Redis session store.</li>
        <li>A shared database-backed session store.</li>
      </ul>
      <p>
        Uploaded files should also go to shared/object storage rather than one backend&apos;s
        local disk if another backend may need to serve them later.
      </p>

      <h2>14. Handle WebSockets correctly</h2>
      <p>If the application uses Socket.IO or WebSockets, add upgrade headers:</p>
      <CodeBlock
        language="nginx"
        code={"map $http_upgrade $connection_upgrade {\n    default upgrade;\n    ''      close;\n}\n\nupstream app_backend {\n    server APP1_PRIVATE_IP:8000;\n    server APP2_PRIVATE_IP:8000;\n    server APP3_PRIVATE_IP:8000;\n}\n\nserver {\n    listen 443 ssl;\n    server_name api.example.com;\n\n    location / {\n        proxy_pass http://app_backend;\n        proxy_http_version 1.1;\n        proxy_set_header Upgrade $http_upgrade;\n        proxy_set_header Connection $connection_upgrade;\n        proxy_set_header Host $host;\n        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n        proxy_set_header X-Forwarded-Proto $scheme;\n    }\n}"}
      />

      <h2>15. What happens if one backend server goes down?</h2>
      <p>
        Nginx can temporarily avoid a backend after repeated connection failures using
        <code> max_fails</code> and <code>fail_timeout</code>. For example:
      </p>
      <CodeBlock
        language="nginx"
        code={"server APP1_PRIVATE_IP:8000 max_fails=3 fail_timeout=30s;"}
      />
      <p>
        This is passive failure handling in open-source Nginx: a real request has to encounter
        the failure. Test application-level health separately with monitoring because a process
        can still accept TCP connections while being unhealthy internally.
      </p>

      <h2>16. Gracefully remove a backend for deployment</h2>
      <p>
        Mark a server as <code>down</code>, validate Nginx, reload, deploy that backend and
        then put it back into rotation:
      </p>
      <CodeBlock
        language="nginx"
        code={"upstream app_backend {\n    server APP1_PRIVATE_IP:8000 down;\n    server APP2_PRIVATE_IP:8000;\n    server APP3_PRIVATE_IP:8000;\n}"}
      />
      <CodeBlock
        language="bash"
        code={"sudo nginx -t && sudo systemctl reload nginx"}
      />
      <p>
        Nginx reloads configuration gracefully, so existing worker connections are not simply
        killed when the configuration is valid.
      </p>

      <h2>17. Add a backup backend</h2>
      <p>
        A server can be held in reserve and used only when the primary upstream servers are
        unavailable:
      </p>
      <CodeBlock
        language="nginx"
        code={"upstream app_backend {\n    server APP1_PRIVATE_IP:8000;\n    server APP2_PRIVATE_IP:8000;\n    server APP3_PRIVATE_IP:8000 backup;\n}"}
      />

      <h2>18. Monitor the load balancer</h2>
      <CodeBlock
        language="bash"
        code={"# Service\nsudo systemctl status nginx --no-pager\n\n# Validate config\nsudo nginx -t\n\n# Access log\nsudo tail -f /var/log/nginx/access.log\n\n# Errors and upstream failures\nsudo tail -f /var/log/nginx/error.log\n\n# Listening ports\nsudo ss -lntp | grep -E ':80|:443'\n\n# Resource usage\ntop\nfree -h\ndf -h"}
      />

      <h2>19. Is the load balancer itself doing application work?</h2>
      <p>
        Normally, no. The load balancer accepts the client connection, performs TLS and proxy
        work, then forwards the request to a backend. CPU-heavy business logic, database
        queries and most application memory usage happen on the backend server.
      </p>
      <p>
        The load balancer still consumes bandwidth, connections, TLS CPU and some memory, so
        it is not literally free, but it is usually much lighter than running the complete
        application workload.
      </p>

      <h2>20. The important weakness: one load balancer is a single point of failure</h2>
      <CodeBlock
        language="text"
        code={"                 Internet\n                    |\n                    v\n             Load Balancer 1\n                    |\n          +---------+---------+\n          |         |         |\n        App 1     App 2     App 3\n\nIf Load Balancer 1 fails, users cannot reach any backend."}
      />
      <p>
        Three healthy application servers do not help if the only public entry point is down.
        For higher availability, add a second load balancer.
      </p>

      <h2>21. High-availability load balancer design</h2>
      <CodeBlock
        language="text"
        code={"                    Internet\n                       |\n             Floating / Failover IP\n                       |\n             +---------+---------+\n             |                   |\n             v                   v\n      +-------------+      +-------------+\n      | Load Bal 1  |      | Load Bal 2  |\n      | Nginx       |      | Nginx       |\n      +------+------+      +------+------+\n             |                    |\n             +---------+----------+\n                       |\n           +-----------+-----------+\n           |           |           |\n         App 1       App 2       App 3"}
      />
      <p>
        The best method depends on the VPS provider. If the provider supports a floating or
        failover IP, move that address between the two load balancers. Some environments also
        support VRRP/Keepalived directly, but that requires networking support from the
        provider and should not be assumed on every public VPS platform.
      </p>

      <h2>22. Keepalived example when the provider/network supports VRRP</h2>
      <p>Install it on both load balancer servers:</p>
      <CodeBlock language="bash" code={"sudo apt install -y keepalived"} />
      <p>Primary load balancer example:</p>
      <CodeBlock
        language="text"
        code={"vrrp_instance VI_1 {\n    state MASTER\n    interface eth0\n    virtual_router_id 51\n    priority 150\n    advert_int 1\n\n    authentication {\n        auth_type PASS\n        auth_pass REPLACE_ME\n    }\n\n    virtual_ipaddress {\n        FLOATING_PRIVATE_IP/24\n    }\n}"}
      />
      <p>
        The secondary uses <code>state BACKUP</code> and a lower priority such as
        <code>100</code>. This only works when the provider allows the floating address and
        relevant VRRP networking; otherwise use the provider&apos;s supported failover-IP
        mechanism.
      </p>

      <h2>23. Keep both load balancers synchronized</h2>
      <p>
        Both Nginx nodes should use the same upstream list, proxy rules and TLS configuration.
        A safe workflow is to keep Nginx configuration in Git or configuration management
        instead of editing two servers independently.
      </p>
      <CodeBlock
        language="bash"
        code={"sudo nginx -t\nsudo systemctl reload nginx"}
      />

      <h2>24. Optional: encrypt load balancer-to-backend traffic with IPsec</h2>
      <p>
        If the backend servers communicate over public networks, build private IPsec links
        first and place the tunnel IPs in the Nginx upstream:
      </p>
      <CodeBlock
        language="nginx"
        code={"upstream app_backend {\n    least_conn;\n\n    server 10.250.31.2:8000;\n    server 10.250.32.2:8000;\n    server 10.250.33.2:8000;\n}"}
      />
      <p>
        This combines the load-balancing pattern with the separate IPsec VPS networking guide:
        public interfaces establish the tunnels, while application traffic travels over
        private encrypted addresses.
      </p>

      <h2>25. Database architecture with multiple app servers</h2>
      <p>
        All application servers can connect to the same database service, but database access
        should remain private:
      </p>
      <CodeBlock
        language="text"
        code={"Load Balancer\n      |\n  +---+---+\n  |   |   |\nApp1 App2 App3\n  \\   |   /\n   \\  |  /\n    Database\n  private/IPsec only"}
      />
      <p>
        The load balancer usually does not proxy MongoDB. The application servers connect
        directly to the database over their trusted private/IPsec network.
      </p>

      <h2>26. Production Nginx example</h2>
      <CodeBlock
        language="nginx"
        code={"upstream app_backend {\n    least_conn;\n\n    server APP1_PRIVATE_IP:8000 max_fails=3 fail_timeout=30s;\n    server APP2_PRIVATE_IP:8000 max_fails=3 fail_timeout=30s;\n    server APP3_PRIVATE_IP:8000 max_fails=3 fail_timeout=30s;\n\n    keepalive 64;\n}\n\nserver {\n    listen 80;\n    server_name api.example.com;\n    return 301 https://$host$request_uri;\n}\n\nserver {\n    listen 443 ssl http2;\n    server_name api.example.com;\n\n    ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;\n    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;\n\n    location / {\n        proxy_pass http://app_backend;\n        proxy_http_version 1.1;\n\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n        proxy_set_header X-Forwarded-Proto $scheme;\n        proxy_set_header Connection \"\";\n\n        proxy_connect_timeout 5s;\n        proxy_read_timeout 60s;\n        proxy_send_timeout 60s;\n    }\n}"}
      />

      <h2>27. Troubleshooting checklist</h2>
      <CodeBlock
        language="bash"
        code={"# Can the load balancer reach every backend?\ncurl http://APP1_PRIVATE_IP:8000/health\ncurl http://APP2_PRIVATE_IP:8000/health\ncurl http://APP3_PRIVATE_IP:8000/health\n\n# Nginx syntax\nsudo nginx -t\n\n# Nginx logs\nsudo tail -n 100 /var/log/nginx/error.log\n\n# Firewall\nsudo ufw status numbered\n\n# DNS\ndig +short api.example.com\n\n# Public HTTPS test\ncurl -I https://api.example.com"}
      />

      <h2>28. Common problems</h2>
      <ul>
        <li>
          <strong>502 Bad Gateway</strong> — the backend is down, the address/port is wrong,
          or a firewall blocks the load balancer.
        </li>
        <li>
          <strong>504 Gateway Timeout</strong> — Nginx reached a backend but did not receive a
          response before the timeout.
        </li>
        <li>
          <strong>Only one server receives traffic</strong> — check sticky behavior, weights,
          cached responses and whether the other backends are actually reachable.
        </li>
        <li>
          <strong>Login randomly disappears</strong> — session data is probably stored only
          in one backend process; move it to Redis/shared storage or use stateless auth.
        </li>
        <li>
          <strong>Client IP is always the load balancer</strong> — make sure
          <code> X-Forwarded-For</code> and <code>X-Real-IP</code> are set and your application
          trusts the proxy correctly.
        </li>
        <li>
          <strong>Everything goes down when the LB VPS fails</strong> — add a second load
          balancer with a provider-supported floating/failover IP or use a managed load
          balancer.
        </li>
      </ul>

      <h2>29. Production checklist</h2>
      <ul>
        <li>Point the public domain only at the load-balancer entry point.</li>
        <li>Allow backend application ports only from trusted load-balancer addresses.</li>
        <li>Use HTTPS on the public load balancer.</li>
        <li>Keep application servers stateless where practical.</li>
        <li>Use shared storage for sessions, uploads and other cross-node state.</li>
        <li>Use private networking or IPsec between servers when traffic crosses public networks.</li>
        <li>Monitor Nginx errors, backend health, CPU, RAM, disk and network utilization.</li>
        <li>Use two load balancers if the application cannot tolerate one LB VPS failing.</li>
      </ul>

      <p>
        A self-hosted Nginx load balancer is a straightforward way to scale several VPS
        application servers behind one domain. The critical design rule is to think beyond
        traffic distribution: secure the backend network, centralize shared state, monitor
        failures and remove the single-load-balancer failure point when the availability
        requirement demands it.
      </p>
    </>
  )
};

export default vpsLoadBalancer;
