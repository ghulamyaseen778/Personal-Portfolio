export type Challenge = {
  id: string;
  title: string;
  explanation: string;
  question: string;
  options: string[];
  answer: number;
  rationale: string;
  topic: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
};

export const labModules: Record<string, { title: string; summary: string; challenges: Challenge[] }> = {
  "mongodb-queries-operators-aggregation-guide": {
    title: "MongoDB Operator Arena",
    summary: "Learn how MongoDB filters, updates, groups and pipeline stages behave using predictable examples.",
    challenges: [
      { id: "gte", title: "The age gate", explanation: "Filter operators compare values in stored documents.", question: "Which query includes age 18 and older?", options: ['{ age: { $gt: 18 } }', '{ age: { $gte: 18 } }', '{ age: { $lt: 18 } }'], answer: 1, rationale: "$gte includes the boundary; $gt does not.", topic: "$gte", difficulty: "Beginner" },
      { id: "logic", title: "Combine conditions", explanation: "An implicit AND combines keys in a filter; $or groups alternatives.", question: "Find active users who live in either Karachi or Hyderabad.", options: ['{ active: true, city: { $in: ["Karachi", "Hyderabad"] } }', '{ active: true, city: "Karachi", city: "Hyderabad" }', '{ $or: [{ active: true }, { city: "Karachi" }] }'], answer: 0, rationale: "$in matches either city, while active: true remains required.", topic: "$in + AND", difficulty: "Intermediate" },
      { id: "elem", title: "Same array element", explanation: "With $elemMatch, all predicates must match the same member of an array.", question: "An order has items [{qty:3,price:20},{qty:1,price:900}]. Will $elemMatch:{qty:{$gte:2},price:{$gt:100}} match?", options: ["Yes", "No"], answer: 1, rationale: "The first item meets qty but not price; the second meets price but not qty.", topic: "$elemMatch", difficulty: "Advanced" },
      { id: "group", title: "Build a total", explanation: "$group collects documents by a key; $sum accumulates numbers.", question: "What totals the amount field per customer?", options: ['{ $group: { _id: "$customerId", total: { $sum: "$amount" } } }', '{ $sort: { amount: -1 } }', '{ $project: { amount: 1 } }'], answer: 0, rationale: "Group by customerId and sum amount within each group.", topic: "$group + $sum", difficulty: "Intermediate" },
      { id: "unwind", title: "Flatten a cart", explanation: "$unwind creates one pipeline document for each array entry.", question: "An order has three items. After $unwind: '$items', how many rows result?", options: ["1", "3", "0"], answer: 1, rationale: "One order becomes three item-level documents.", topic: "$unwind", difficulty: "Beginner" },
      { id: "lookup", title: "Join collections", explanation: "$lookup is the common aggregation stage for joining another collection.", question: "Which stage adds customer documents from users to orders?", options: ["$facet", "$lookup", "$bucket"], answer: 1, rationale: "Use $lookup with from, localField, foreignField and as.", topic: "$lookup", difficulty: "Intermediate" },
      { id: "facet", title: "One query, two results", explanation: "$facet runs multiple sub-pipelines over the same input.", question: "Which stage can return a paginated list and a total count together?", options: ["$facet", "$unwind", "$replaceRoot"], answer: 0, rationale: "Separate the rows and count pipelines under $facet.", topic: "$facet", difficulty: "Advanced" },
      { id: "update", title: "Change a counter", explanation: "$inc changes an existing numeric field atomically.", question: "Current stock is 10. What is stock after {$inc:{stock:-3}}?", options: ["13", "7", "-3"], answer: 1, rationale: "Increment by negative three: 10 - 3 = 7.", topic: "$inc", difficulty: "Beginner" },
      { id: "window", title: "Running totals", explanation: "$setWindowFields calculates values across an ordered window.", question: "For amounts [10, 30, 5], what is the running sum at the third row?", options: ["5", "35", "45"], answer: 2, rationale: "An unbounded-to-current sum includes all earlier rows: 10 + 30 + 5 = 45.", topic: "$setWindowFields", difficulty: "Advanced" },
      { id: "index", title: "Find an efficient query", explanation: "A compound index may support filters and sorting, but should be checked via explain.", question: "Which command helps inspect actual documents examined?", options: ['.explain("executionStats")', ".deleteMany({})", ".estimatedDocumentCount()"], answer: 0, rationale: "executionStats shows how a query executed; examine totalDocsExamined and winning plan.", topic: "explain", difficulty: "Advanced" }
    ]
  },
  "mongodb-vps-ubuntu-setup": {
    title: "MongoDB Security Drill", summary: "Choose safe deployment and permission decisions.", challenges: [
      { id: "bind", title: "Secure listening", explanation: "An application running on the same server usually needs only loopback.", question: "What bind IP is the safer default for a local MongoDB service?", options: ["0.0.0.0", "127.0.0.1", "Public VPS IP"], answer: 1, rationale: "127.0.0.1 keeps the database listener local.", topic: "bindIp", difficulty: "Beginner" },
      { id: "rbac", title: "Least privilege", explanation: "Application users should not use an all-powerful admin role.", question: "What standard role fits a typical application on its own database?", options: ["root", "userAdminAnyDatabase", "readWrite on its database"], answer: 2, rationale: "Scope readWrite to the app database; admin access is unnecessary.", topic: "RBAC", difficulty: "Intermediate" },
      { id: "tunnel", title: "Remote maintenance", explanation: "SSH forwarding can avoid exposing the database port.", question: "Which approach keeps MongoDB private during occasional remote administration?", options: ["Open 27017 to internet", "Use an SSH tunnel", "Disable authentication"], answer: 1, rationale: "A tunnel can forward through SSH to the localhost-only database.", topic: "SSH Tunnel", difficulty: "Intermediate" }
    ]
  },
  "mongodb-automated-backup-recovery": {
    title: "Recovery Simulation", summary: "Safely reason through backup and restore operations.", challenges: [
      { id: "verify", title: "Backup integrity", explanation: "A backup file existing does not prove it can be restored.", question: "Which practice best verifies recoverability?", options: ["Check filename only", "Test restore into a disposable database", "Delete the old database first"], answer: 1, rationale: "An isolated restore test validates the process without risking live data.", topic: "Restore Test", difficulty: "Intermediate" },
      { id: "retain", title: "Backup retention", explanation: "Retention controls recovery history.", question: "Which setup is most resilient to failure of the main server?", options: ["Only local backups", "Off-host backups with integrity checks", "No backups"], answer: 1, rationale: "Off-host copies can survive failure of the application host.", topic: "Retention", difficulty: "Beginner" }
    ]
  },
  "react-enterprise": {
    title: "React Architecture Workshop", summary: "Practice component boundaries and React state principles.", challenges: [
      { id: "keys", title: "Stable keys", explanation: "Keys help React track list items across reorders.", question: "Which key is preferable for a reorderable list?", options: ["Array index", "Stable record ID", "Math.random()"], answer: 1, rationale: "Stable identifiers preserve item identity across reordering.", topic: "React Keys", difficulty: "Beginner" },
      { id: "derived", title: "Derived values", explanation: "Avoid storing values that can be derived directly from other state.", question: "For items and selectedCategory state, where should filtered items be computed?", options: ["During render or useMemo when costly", "In a second duplicated state always", "By mutating items"], answer: 0, rationale: "Derived data reduces state synchronization bugs.", topic: "State", difficulty: "Intermediate" }
    ]
  },
  "production-ci-cd-github-actions-vps-docker": {
    title: "Deployment Pipeline Lab", summary: "Build a safe release sequence.", challenges: [
      { id: "health", title: "Deployment guard", explanation: "A running container is not necessarily a healthy application.", question: "Which event should trigger a rollback?", options: ["Health-check failure after release", "A successful test suite", "A valid tag"], answer: 0, rationale: "Production release should be guarded by functional health checks.", topic: "Rollback", difficulty: "Intermediate" },
      { id: "secret", title: "Protect credentials", explanation: "Deploy credentials should never appear in source control.", question: "Where should CI credentials reside?", options: ["Public README", "Hardcoded Dockerfile", "Protected secrets"], answer: 2, rationale: "Protected secrets reduce credential exposure.", topic: "Secrets", difficulty: "Beginner" }
    ]
  },
  "vps-load-balancer-nginx-multiple-servers": {
    title: "Load Balancer Decisions", summary: "Explore failure routing and proxy headers.", challenges: [
      { id: "failover", title: "Unhealthy upstream", explanation: "A proxy should avoid repeatedly routing to an unhealthy target.", question: "One upstream fails and another is healthy. What should the proxy attempt?", options: ["Prefer healthy upstream", "Route all traffic to failed upstream", "Disable TLS"], answer: 0, rationale: "Health-aware routing prioritizes available backends.", topic: "Failover", difficulty: "Beginner" },
      { id: "xff", title: "Client IP handling", explanation: "Only trust proxy headers from a verified proxy hop.", question: "Should arbitrary internet clients be trusted to set X-Forwarded-For?", options: ["Yes", "No"], answer: 1, rationale: "Untrusted proxy headers can be forged.", topic: "Proxy Trust", difficulty: "Advanced" }
    ]
  },
  "ipsec-vps-tunnel-single-multiple-servers": {
    title: "IPsec Tunnel Troubleshooting", summary: "Practice secure private routing.", challenges: [
      { id: "dpd", title: "Dead peer", explanation: "Dead Peer Detection can detect missing remote peers.", question: "What is DPD mainly used for?", options: ["Detect peer liveness", "Encrypt stored MongoDB backups", "Compress React bundles"], answer: 0, rationale: "DPD checks whether the IKE peer is still responsive.", topic: "DPD", difficulty: "Intermediate" },
      { id: "mtu", title: "Fragmentation", explanation: "Encapsulation introduces overhead.", question: "What can help when large packets fail over a tunnel?", options: ["Review path MTU/MSS", "Disable authentication", "Expose the DB publicly"], answer: 0, rationale: "Tunnel encapsulation changes effective packet size.", topic: "MTU", difficulty: "Advanced" }
    ]
  },
  "vps-server-setup-from-zero": {
    title: "VPS Operations Workshop", summary: "Practice safe server setup and rollout.", challenges: [
      { id: "tls", title: "HTTPS", explanation: "HTTPS encrypts traffic between the browser and site.", question: "Which should be enabled for a public site?", options: ["Valid TLS certificate", "Only HTTP", "Hardcoded root password"], answer: 0, rationale: "TLS provides encrypted transport and server authentication.", topic: "TLS", difficulty: "Beginner" },
      { id: "firewall", title: "Limit exposed ports", explanation: "Only necessary services should be internet-accessible.", question: "Should a production MongoDB port be opened publicly by default?", options: ["Yes", "No"], answer: 1, rationale: "Keep databases on trusted internal networks.", topic: "Firewall", difficulty: "Beginner" }
    ]
  }
};

export function getLab(slug: string) {
  return labModules[slug];
}
