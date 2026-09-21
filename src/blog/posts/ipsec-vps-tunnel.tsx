import type { BlogPost } from "../types";
import CodeBlock from "../components/CodeBlock";

const ipsecVpsTunnel: BlogPost = {
  slug: "ipsec-vps-tunnel-single-multiple-servers",
  title: "IPsec Between VPS Servers: Secure a Database with Single & Multiple IKEv2 Tunnels",
  description:
    "Build a private encrypted network between Ubuntu VPS servers with strongSwan, IKEv2, XFRM interfaces, UFW and MongoDB — then scale the design to multiple service servers.",
  category: "Networking",
  readTime: "18 min read",
  date: "September 2026",
  tags: ["IPsec", "IKEv2", "strongSwan", "Ubuntu", "VPS", "XFRM", "MongoDB", "UFW"],
  featured: true,
  content: (
    <>
      <p>
        A common production architecture separates application services from the database.
        The service VPS must reach MongoDB, but port 27017 should not be exposed to the public
        internet. An IKEv2/IPsec tunnel gives the two servers a private encrypted path while
        their public addresses are used only to establish the VPN.
      </p>

      <blockquote>
        The public IPs, passwords and pre-shared keys in this guide are placeholders. Never
        publish a real production PSK, database password or private server credential.
      </blockquote>

      <h2>1. The target architecture</h2>
      <p>
        In the first design, one service server connects to one database server. MongoDB
        listens on localhost and the database server&apos;s IPsec address only.
      </p>
      <CodeBlock
        language="text"
        code={"Internet\n   |\n   | IKEv2: UDP 500 / 4500\n   |\nService VPS                         Database VPS\nPublic: SERVICE_PUBLIC_IP           Public: DB_PUBLIC_IP\nTunnel: 10.250.26.2                 Tunnel: 10.250.26.1\n   |                                      |\n   +========== encrypted IPsec ==========+\n                                          |\n                                  MongoDB 10.250.26.1:27017"}
      />

      <p>
        The application uses <code>10.250.26.1:27017</code>. MongoDB never needs to listen on
        the database server&apos;s public interface.
      </p>

      <h2>2. Plan the tunnel addresses correctly</h2>
      <p>
        Use a private subnet that does not overlap any existing provider network, Docker
        network, Kubernetes network or LAN. For a point-to-point link, a <code>/30</code> is
        simple and explicit.
      </p>
      <CodeBlock
        language="text"
        code={"Tunnel network: 10.250.26.0/30\n\n10.250.26.0  Network address\n10.250.26.1  Database VPS\n10.250.26.2  Service VPS\n10.250.26.3  Broadcast address"}
      />
      <p>
        Do not assign the network or broadcast address to a server. For example, in
        <code> 10.250.26.8/30</code>, the usable hosts are <code>.9</code> and <code>.10</code>;
        <code>.11</code> is the broadcast address.
      </p>

      <h2>3. Install strongSwan on both Ubuntu servers</h2>
      <CodeBlock
        language="bash"
        code={"sudo apt update\nsudo apt install -y strongswan-swanctl charon-systemd iproute2 ufw\n\nsudo systemctl enable --now strongswan\nsudo systemctl status strongswan --no-pager"}
      />
      <p>
        This guide uses <code>swanctl.conf</code> with <code>charon-systemd</code>, not the
        legacy <code>ipsec.conf</code> workflow.
      </p>

      <h2>4. Protect SSH before enabling a firewall</h2>
      <p>
        Always allow SSH first. Otherwise enabling UFW can lock you out of the VPS.
      </p>
      <CodeBlock
        language="bash"
        code={"sudo ufw allow 22/tcp\nsudo ufw default deny incoming\nsudo ufw default allow outgoing"}
      />
      <p>
        On the database server, allow IKE only from the service server&apos;s public IP:
      </p>
      <CodeBlock
        language="bash"
        code={"sudo ufw allow from SERVICE_PUBLIC_IP to any port 500 proto udp\nsudo ufw allow from SERVICE_PUBLIC_IP to any port 4500 proto udp"}
      />
      <p>On the service server, allow IKE from the database server&apos;s public IP:</p>
      <CodeBlock
        language="bash"
        code={"sudo ufw allow from DB_PUBLIC_IP to any port 500 proto udp\nsudo ufw allow from DB_PUBLIC_IP to any port 4500 proto udp\n\nsudo ufw enable\nsudo ufw status numbered"}
      />
      <p>
        If your VPS provider has a separate cloud firewall, mirror the UDP 500 and 4500 rules
        there. Keep TCP 27017 closed on the public firewall.
      </p>

      <h2>5. Generate a strong pre-shared key</h2>
      <p>Generate the PSK once and place the same value on both peers:</p>
      <CodeBlock language="bash" code={"openssl rand -base64 48"} />
      <p>
        Store it securely. The examples below use <code>YOUR_RANDOM_PSK</code> instead of a
        real secret.
      </p>

      <h2>6. Create the XFRM interface on the database server</h2>
      <p>
        XFRM interfaces make the IPsec tunnel behave like a route-based network interface. The
        first tunnel uses interface ID <code>42</code>.
      </p>
      <CodeBlock
        language="bash"
        code={"sudo ip link add ipsec0 type xfrm if_id 42\nsudo ip addr add 10.250.26.1/30 dev ipsec0\nsudo ip link set ipsec0 mtu 1400\nsudo ip link set ipsec0 up\n\nip addr show ipsec0\nip route"}
      />

      <h2>7. Create the XFRM interface on the service server</h2>
      <CodeBlock
        language="bash"
        code={"sudo ip link add ipsec0 type xfrm if_id 42\nsudo ip addr add 10.250.26.2/30 dev ipsec0\nsudo ip link set ipsec0 mtu 1400\nsudo ip link set ipsec0 up\n\nip addr show ipsec0\nip route"}
      />
      <p>Both servers should now have a connected route for <code>10.250.26.0/30</code>.</p>

      <h2>8. Configure the database server</h2>
      <p>Edit the strongSwan configuration:</p>
      <CodeBlock language="bash" code={"sudo nano /etc/swanctl/swanctl.conf"} />
      <CodeBlock
        language="text"
        code={"connections {\n    service1-db {\n        version = 2\n\n        local_addrs  = DB_PUBLIC_IP\n        remote_addrs = SERVICE_PUBLIC_IP\n\n        proposals = aes256-sha256-prfsha256-ecp256\n        encap = yes\n        mobike = no\n        dpd_delay = 30s\n\n        local {\n            auth = psk\n            id = db-vps\n        }\n\n        remote {\n            auth = psk\n            id = service-1\n        }\n\n        children {\n            mongo-link {\n                local_ts  = 10.250.26.1/32\n                remote_ts = 10.250.26.2/32\n\n                if_id_in  = 42\n                if_id_out = 42\n\n                mode = tunnel\n                dpd_action = clear\n                esp_proposals = aes256-sha256-ecp256\n            }\n        }\n    }\n}\n\nsecrets {\n    ike-service1 {\n        id-1 = db-vps\n        id-2 = service-1\n        secret = \"YOUR_RANDOM_PSK\"\n    }\n}"}
      />
      <p>
        <code>encap = yes</code> forces ESP inside UDP, which is useful when a hosting firewall
        or intermediary network handles UDP 4500 more reliably than raw ESP.
      </p>

      <h2>9. Configure the service server</h2>
      <CodeBlock language="bash" code={"sudo nano /etc/swanctl/swanctl.conf"} />
      <CodeBlock
        language="text"
        code={"connections {\n    service1-db {\n        version = 2\n\n        local_addrs  = SERVICE_PUBLIC_IP\n        remote_addrs = DB_PUBLIC_IP\n\n        proposals = aes256-sha256-prfsha256-ecp256\n        encap = yes\n        mobike = no\n        dpd_delay = 30s\n\n        local {\n            auth = psk\n            id = service-1\n        }\n\n        remote {\n            auth = psk\n            id = db-vps\n        }\n\n        children {\n            mongo-link {\n                local_ts  = 10.250.26.2/32\n                remote_ts = 10.250.26.1/32\n\n                if_id_in  = 42\n                if_id_out = 42\n\n                mode = tunnel\n                start_action = start\n                dpd_action = restart\n                esp_proposals = aes256-sha256-ecp256\n            }\n        }\n    }\n}\n\nsecrets {\n    ike-service1 {\n        id-1 = service-1\n        id-2 = db-vps\n        secret = \"YOUR_RANDOM_PSK\"\n    }\n}"}
      />

      <h2>10. Load and establish the tunnel</h2>
      <p>On both servers:</p>
      <CodeBlock
        language="bash"
        code={"sudo swanctl --load-all\nsudo swanctl --list-conns"}
      />
      <p>Initiate from the service server if it has not already started automatically:</p>
      <CodeBlock
        language="bash"
        code={"sudo swanctl --initiate --child mongo-link\nsudo swanctl --list-sas"}
      />
      <p>A healthy connection shows an IKE SA as <strong>ESTABLISHED</strong> and the child SA as <strong>INSTALLED</strong>.</p>

      <h2>11. Test the private link</h2>
      <p>From the service server:</p>
      <CodeBlock
        language="bash"
        code={"ping 10.250.26.1\n\nip route get 10.250.26.1\nsudo swanctl --list-sas"}
      />
      <p>From the database server:</p>
      <CodeBlock language="bash" code={"ping 10.250.26.2"} />

      <h2>12. Make the XFRM interface survive reboot</h2>
      <p>
        Manually created XFRM interfaces disappear after reboot. On the database server,
        create a small systemd unit:
      </p>
      <CodeBlock
        language="bash"
        code={"sudo nano /etc/systemd/system/ipsec0.service"}
      />
      <CodeBlock
        language="ini"
        code={"[Unit]\nDescription=IPsec XFRM interface ipsec0\nAfter=network-online.target\nWants=network-online.target\nBefore=strongswan.service mongod.service\n\n[Service]\nType=oneshot\nRemainAfterExit=yes\nExecStart=/bin/sh -c '/usr/sbin/ip link show ipsec0 >/dev/null 2>&1 || /usr/sbin/ip link add ipsec0 type xfrm if_id 42'\nExecStart=/usr/sbin/ip addr replace 10.250.26.1/30 dev ipsec0\nExecStart=/usr/sbin/ip link set ipsec0 mtu 1400 up\nExecStop=/bin/sh -c '/usr/sbin/ip link del ipsec0 2>/dev/null || true'\n\n[Install]\nWantedBy=multi-user.target"}
      />
      <CodeBlock
        language="bash"
        code={"sudo systemd-analyze verify /etc/systemd/system/ipsec0.service\nsudo systemctl daemon-reload\nsudo systemctl enable --now ipsec0\nsudo systemctl restart strongswan"}
      />
      <p>
        On the service server, use the same unit but replace the tunnel address with
        <code> 10.250.26.2/30</code>. The <code>Before=mongod.service</code> dependency matters
        on the database server because MongoDB cannot bind to a tunnel IP that does not exist
        yet.
      </p>

      <h2>13. Bind MongoDB to the private IPsec address</h2>
      <p>On the database server, edit <code>/etc/mongod.conf</code>:</p>
      <CodeBlock
        language="yaml"
        code={"net:\n  port: 27017\n  bindIp: 127.0.0.1,10.250.26.1\n\nsecurity:\n  authorization: enabled"}
      />
      <CodeBlock
        language="bash"
        code={"sudo systemctl restart mongod\nsudo systemctl status mongod --no-pager\nsudo ss -lntp | grep 27017"}
      />
      <p>
        MongoDB should listen on <code>127.0.0.1:27017</code> and
        <code> 10.250.26.1:27017</code>, not <code>0.0.0.0:27017</code>.
      </p>

      <h2>14. Allow MongoDB only from the service server</h2>
      <p>
        The tunnel protects transport encryption; the firewall controls which peer may reach
        MongoDB.
      </p>
      <CodeBlock
        language="bash"
        code={"sudo ufw allow in on ipsec0 from 10.250.26.2 to 10.250.26.1 port 27017 proto tcp\nsudo ufw status numbered"}
      />
      <p>
        Remove any broad rule such as <code>27017/tcp ALLOW Anywhere</code>. The public
        interface does not need a MongoDB rule.
      </p>

      <h2>15. Give the application its own MongoDB user</h2>
      <p>
        Network access and database authorization solve different problems. Use a
        least-privilege MongoDB account for the application.
      </p>
      <CodeBlock
        language="javascript"
        code={"use appdb\n\ndb.createUser({\n  user: \"serviceApp\",\n  pwd: passwordPrompt(),\n  roles: [\n    { role: \"readWrite\", db: \"appdb\" }\n  ]\n})"}
      />
      <p>Then the service server can use a private connection string:</p>
      <CodeBlock
        language="env"
        code={"MONGODB_URI=mongodb://serviceApp:URL_ENCODED_PASSWORD@10.250.26.1:27017/appdb?authSource=appdb"}
      />
      <p>Test the port before debugging application code:</p>
      <CodeBlock language="bash" code={"nc -vz 10.250.26.1 27017"} />

      <h2>16. Scale to multiple service servers</h2>
      <p>
        When more application servers need database access, use the database VPS as the hub
        and give every service server its own point-to-point subnet, XFRM interface ID and
        pre-shared key.
      </p>
      <CodeBlock
        language="text"
        code={"                    Database VPS\n                       MongoDB\n                          |\n          +---------------+---------------+\n          |               |               |\n       ipsec0           ipsec1          ipsec2\n       if_id 42         if_id 43        if_id 44\n          |               |               |\n      Service 1        Service 2       Service 3\n\nTunnel 1: 10.250.26.0/30  DB .1  Service 1 .2\nTunnel 2: 10.250.27.0/30  DB .1  Service 2 .2\nTunnel 3: 10.250.28.0/30  DB .1  Service 3 .2"}
      />
      <p>
        Separate subnets make routes, policies, troubleshooting and access control much easier
        than trying to place every peer in one shared point-to-point subnet.
      </p>

      <h2>17. Add the second tunnel on the database server</h2>
      <p>The second service server uses XFRM interface ID <code>43</code>:</p>
      <CodeBlock
        language="bash"
        code={"sudo ip link add ipsec1 type xfrm if_id 43\nsudo ip addr add 10.250.27.1/30 dev ipsec1\nsudo ip link set ipsec1 mtu 1400 up"}
      />
      <p>Service Server 2 creates the matching interface:</p>
      <CodeBlock
        language="bash"
        code={"sudo ip link add ipsec1 type xfrm if_id 43\nsudo ip addr add 10.250.27.2/30 dev ipsec1\nsudo ip link set ipsec1 mtu 1400 up"}
      />

      <h2>18. Add another strongSwan connection</h2>
      <p>
        On the database server, add a second connection alongside the first one. Use the
        second service server&apos;s public IP and a unique identity.
      </p>
      <CodeBlock
        language="text"
        code={"connections {\n    service2-db {\n        version = 2\n        local_addrs  = DB_PUBLIC_IP\n        remote_addrs = SERVICE2_PUBLIC_IP\n        proposals = aes256-sha256-prfsha256-ecp256\n        encap = yes\n        mobike = no\n\n        local {\n            auth = psk\n            id = db-vps\n        }\n\n        remote {\n            auth = psk\n            id = service-2\n        }\n\n        children {\n            mongo-link-2 {\n                local_ts  = 10.250.27.1/32\n                remote_ts = 10.250.27.2/32\n                if_id_in  = 43\n                if_id_out = 43\n                mode = tunnel\n                dpd_action = clear\n                esp_proposals = aes256-sha256-ecp256\n            }\n        }\n    }\n}\n\nsecrets {\n    ike-service2 {\n        id-1 = db-vps\n        id-2 = service-2\n        secret = \"A_DIFFERENT_RANDOM_PSK\"\n    }\n}"}
      />
      <p>
        Configure Service Server 2 with the reverse addresses, selectors and identities, then
        use <code>start_action = start</code> for its child SA.
      </p>

      <h2>19. Extend MongoDB and UFW for additional tunnels</h2>
      <p>
        MongoDB must bind to every database-side tunnel address that applications use:
      </p>
      <CodeBlock
        language="yaml"
        code={"net:\n  port: 27017\n  bindIp: 127.0.0.1,10.250.26.1,10.250.27.1,10.250.28.1"}
      />
      <p>Add one narrow UFW rule per tunnel:</p>
      <CodeBlock
        language="bash"
        code={"sudo ufw allow in on ipsec0 from 10.250.26.2 to 10.250.26.1 port 27017 proto tcp\nsudo ufw allow in on ipsec1 from 10.250.27.2 to 10.250.27.1 port 27017 proto tcp\nsudo ufw allow in on ipsec2 from 10.250.28.2 to 10.250.28.1 port 27017 proto tcp"}
      />
      <p>
        Each service can also have a separate MongoDB username so credentials can be rotated
        or revoked independently.
      </p>

      <h2>20. Use a unique PSK for every peer</h2>
      <p>
        Reusing one PSK across all servers creates unnecessary blast radius. Generate a
        different high-entropy secret for each service-to-database tunnel.
      </p>
      <CodeBlock
        language="text"
        code={"Service 1 <-> Database = PSK_1\nService 2 <-> Database = PSK_2\nService 3 <-> Database = PSK_3"}
      />
      <p>
        For a larger fleet, certificate-based IKE authentication can be easier to manage than
        many independent PSKs.
      </p>

      <h2>21. Troubleshooting commands</h2>
      <CodeBlock
        language="bash"
        code={"# strongSwan status\nsudo systemctl status strongswan --no-pager\nsudo journalctl -u strongswan -n 100 --no-pager\n\n# IKE and CHILD SAs\nsudo swanctl --list-conns\nsudo swanctl --list-sas\n\n# Linux XFRM state and policy\nip xfrm state\nip xfrm policy\n\n# Tunnel interfaces and routes\nip addr show ipsec0\nip route\n\n# IKE traffic\nsudo tcpdump -ni any 'udp port 500 or udp port 4500'\n\n# MongoDB listener\nsudo ss -lntp | grep 27017\n\n# Firewall\nsudo ufw status numbered"}
      />

      <h2>22. Common failures and what they mean</h2>
      <ul>
        <li>
          <strong>TS_UNACCEPTABLE</strong> — the traffic selectors do not match on both peers.
        </li>
        <li>
          <strong>IKE is ESTABLISHED but ping fails</strong> — inspect the XFRM interface,
          routes, selectors and UFW rules.
        </li>
        <li>
          <strong>&quot;Do you want to ping broadcast?&quot;</strong> — an address such as the
          broadcast IP of a <code>/30</code> was assigned to a peer.
        </li>
        <li>
          <strong>SSH stops after enabling UFW</strong> — port 22 was not allowed before the
          firewall was enabled. Use the provider console to restore the SSH rule.
        </li>
        <li>
          <strong>MongoDB fails after adding bindIp</strong> — confirm the tunnel IP exists
          before <code>mongod</code> starts and verify the YAML indentation.
        </li>
        <li>
          <strong>Port 27017 times out</strong> — test the tunnel first, then UFW, then the
          MongoDB listener, then authentication.
        </li>
      </ul>

      <h2>23. Production checklist</h2>
      <ul>
        <li>Allow SSH before enabling UFW and preferably restrict SSH to trusted admin IPs.</li>
        <li>Allow UDP 500/4500 only between the public IPs of the IPsec peers.</li>
        <li>Do not expose MongoDB port 27017 on the public interface.</li>
        <li>Use unique private subnets and XFRM interface IDs for multiple tunnels.</li>
        <li>Use a unique high-entropy PSK for each service server.</li>
        <li>Enable MongoDB authorization and create a least-privilege user per application.</li>
        <li>Persist the XFRM interfaces and ensure they exist before MongoDB starts.</li>
        <li>Monitor <code>swanctl --list-sas</code> and service logs after reboot or network changes.</li>
      </ul>

      <p>
        This pattern gives a clean separation of responsibilities: the public network carries
        only IKE/IPsec establishment traffic, the private tunnel carries database traffic, UFW
        limits which tunnel peer can reach MongoDB, and MongoDB authentication limits what the
        application can do after it connects.
      </p>
    </>
  )
};

export default ipsecVpsTunnel;
