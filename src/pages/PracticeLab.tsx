import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FiArrowLeft, FiArrowRight, FiCheckCircle, FiCode, FiRefreshCcw, FiTerminal, FiZap } from "react-icons/fi";
import { blogs } from "../blog";
import { getLab } from "../practice/labs";
import { demoQueries, executeQuery, sampleOrders, sampleUsers, type PlaygroundQuery } from "../practice/mongoSimulator";
import { absoluteUrl, SITE_NAME } from "../config/site";
import styles from "./Practice.module.css";

const backendSlugs = new Set([
  "mongodb-vps-ubuntu-setup",
  "mongodb-automated-backup-recovery",
  "production-ci-cd-github-actions-vps-docker",
  "vps-load-balancer-nginx-multiple-servers",
  "ipsec-vps-tunnel-single-multiple-servers",
  "vps-server-setup-from-zero"
]);
const scenarios: Record<string, { title: string; route: string; expected: string; explanation: string; response: object }[]> = {
  "mongodb-vps-ubuntu-setup": [
    { title: "Authenticated read", route: "GET /api/users", expected: "200", explanation: "An application account with read access can query its database.", response: { status: 200, data: [{ id: 1, name: "Ali" }] } },
    { title: "Unprivileged admin action", route: "POST /admin/users", expected: "403", explanation: "A readWrite application account must not manage MongoDB users.", response: { status: 403, error: "not authorized on admin" } }
  ],
  "mongodb-automated-backup-recovery": [
    { title: "Archive checksum verified", route: "POST /backups/verify", expected: "200", explanation: "Hash and archive integrity checks pass; restoration still needs a test.", response: { status: 200, sha256: "verified", archive: "valid", restoreTest: "not yet run" } },
    { title: "Isolated restore test", route: "POST /backups/restore-test", expected: "200", explanation: "The archive is restored to a disposable database rather than production.", response: { status: 200, database: "restore_test", productionModified: false } }
  ],
  "production-ci-cd-github-actions-vps-docker": [
    { title: "Healthy deployment", route: "GET /health", expected: "200", explanation: "A health check returns OK and the release can remain active.", response: { status: 200, healthy: true, release: "candidate" } },
    { title: "Rollback on failed health", route: "GET /health?version=broken", expected: "503", explanation: "The failed release should trigger rollback to the last healthy revision.", response: { status: 503, healthy: false, rollbackRecommended: true } }
  ],
  "vps-load-balancer-nginx-multiple-servers": [
    { title: "Healthy upstream", route: "GET /api/status", expected: "200", explanation: "The request reaches a healthy backend.", response: { status: 200, upstream: "app-1", healthy: true } },
    { title: "App 1 offline", route: "GET /api/status?app1=down", expected: "200", explanation: "Failover can route the request to another healthy backend.", response: { status: 200, upstream: "app-2", failover: true } }
  ],
  "ipsec-vps-tunnel-single-multiple-servers": [
    { title: "Private endpoint", route: "GET 10.0.0.2:8080", expected: "200", explanation: "The simulated internal tunnel route reaches the private application.", response: { status: 200, tunnel: "up", route: "private" } },
    { title: "Dead peer", route: "GET 10.0.0.2:8080?peer=down", expected: "504", explanation: "When a peer is unreachable, the application must handle timeouts.", response: { status: 504, error: "simulated tunnel timeout" } }
  ],
  "vps-server-setup-from-zero": [
    { title: "TLS request", route: "GET https://app.example.test", expected: "200", explanation: "The proxy serves a simulated HTTPS request.", response: { status: 200, scheme: "https", application: "healthy" } },
    { title: "Blocked DB port", route: "GET public-ip:27017", expected: "403", explanation: "A public firewall should refuse access to the private database port.", response: { status: 403, firewall: "blocked", port: 27017 } }
  ]
};

function MongoSandbox() {
  const [source, setSource] = useState(JSON.stringify(demoQueries[0].query, null, 2));
  const [output, setOutput] = useState<object | null>(null);
  const [error, setError] = useState("");
  const run = () => {
    try {
      if (source.length > 12000) throw new Error("Input is too large for the learning simulator.");
      const parsed: PlaygroundQuery = JSON.parse(source);
      const result = executeQuery(parsed);
      setOutput({ matched: result.length, documents: result });
      setError("");
    } catch (err) {
      setOutput(null);
      setError(err instanceof Error ? err.message : "Unable to execute query.");
    }
  };
  return <div className={styles.sandbox}>
    <div className={styles.sandboxIntro}>
      <FiTerminal />
      <div><h2>MongoDB Query Sandbox</h2><p>Runs a supported subset of MongoDB JSON query operators and aggregation stages on fixed, local sample data. No actual database or JavaScript evaluation.</p></div>
    </div>
    <div className={styles.presets}>
      {demoQueries.map(preset => <button key={preset.name} type="button" onClick={() => { setSource(JSON.stringify(preset.query, null, 2)); setOutput(null); setError(""); }}>{preset.name}</button>)}
    </div>
    <div className={styles.sandboxGrid}>
      <div>
        <label htmlFor="mongodb-query">Query JSON</label>
        <textarea id="mongodb-query" spellCheck={false} value={source} onChange={event => setSource(event.target.value)} rows={17} />
        <button type="button" className={styles.primary} onClick={run}><FiZap /> Run simulation</button>
      </div>
      <div>
        <label htmlFor="mongodb-result">Result</label>
        <pre id="mongodb-result" className={styles.output} aria-live="polite">{error ? "Error: " + error : output ? JSON.stringify(output, null, 2) : "Choose a preset or edit the query, then run it.\n\nAvailable sample collections:\nusers (" + sampleUsers.length + " records)\norders (" + sampleOrders.length + " records)"}</pre>
      </div>
    </div>
    <p className={styles.note}>Supported: $eq, $ne, $gt, $gte, $lt, $lte, $in, $nin, $and, $or, $nor, $exists, $all, $size, $regex, basic $match, $group, $sort, $project, $set, $unwind, $count, $skip and $limit. Unsupported operators fail visibly. This is not a complete mongosh interpreter.</p>
    <details><summary>View sample data</summary><pre className={styles.sample}>{JSON.stringify({ users: sampleUsers, orders: sampleOrders }, null, 2)}</pre></details>
  </div>;
}

function ScenarioSandbox({ slug }: { slug: string }) {
  const items = scenarios[slug] || [];
  const [selected, setSelected] = useState<number | null>(null);
  if (!items.length) return null;
  return <div className={styles.sandbox}>
    <div className={styles.sandboxIntro}><FiTerminal /><div><h2>Server-Side Sandbox</h2><p>Walk through simulated requests and see how a backend should behave. This does not send network requests or execute shell commands.</p></div></div>
    <div className={styles.presets}>{items.map((item, i) => <button type="button" key={item.title} onClick={() => setSelected(i)}>{item.title}</button>)}</div>
    {selected !== null && <div className={styles.scenarioResult}>
      <code>{items[selected].route}</code><span>Expected HTTP {items[selected].expected}</span>
      <pre className={styles.output}>{JSON.stringify(items[selected].response, null, 2)}</pre>
      <p>{items[selected].explanation}</p>
    </div>}
  </div>;
}

function Quiz({ slug }: { slug: string }) {
  const lab = getLab(slug);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [reveal, setReveal] = useState(false);
  const challenge = lab.challenges[index];
  const selected = answers[challenge.id];
  const correct = lab.challenges.filter(q => answers[q.id] === q.answer).length;
  const progress = Math.round(Object.keys(answers).length / lab.challenges.length * 100);
  const reset = () => { setIndex(0); setAnswers({}); setReveal(false); };
  return <section className={styles.quiz}>
    <div className={styles.quizTop}><span>{challenge.difficulty} · {challenge.topic}</span><span>{index + 1} / {lab.challenges.length}</span></div>
    <div className={styles.track}><div style={{ width: progress + "%" }} /></div>
    <h2>{challenge.title}</h2><p>{challenge.explanation}</p><h3>{challenge.question}</h3>
    <div className={styles.choices}>
      {challenge.options.map((option, i) => <button key={option} type="button" disabled={reveal} className={selected === i ? styles.chosen : ""} onClick={() => setAnswers(previous => ({ ...previous, [challenge.id]: i }))}>{String.fromCharCode(65 + i)}. {option}</button>)}
    </div>
    {reveal && <p className={selected === challenge.answer ? styles.right : styles.wrong}><FiCheckCircle /> {selected === challenge.answer ? "Correct!" : "Not quite."} {challenge.rationale}</p>}
    <div className={styles.controls}>
      <button type="button" onClick={reset}><FiRefreshCcw /> Reset</button>
      <strong>Score: {correct} / {lab.challenges.length}</strong>
      {!reveal ? <button className={styles.primary} disabled={selected === undefined} type="button" onClick={() => setReveal(true)}>Check answer</button> :
        index < lab.challenges.length - 1 ? <button className={styles.primary} type="button" onClick={() => { setIndex(i => i + 1); setReveal(false); }}>Next challenge <FiArrowRight /></button> :
        <button className={styles.primary} type="button" onClick={reset}>Try again</button>}
    </div>
    {reveal && index === lab.challenges.length - 1 && <p>Practice complete! You answered {correct} of {lab.challenges.length} questions correctly.</p>}
  </section>;
}

export default function PracticeLab() {
  const { slug } = useParams();
  const all = Object.entries(blogs.map(blog => [blog.slug, blog.title] as const).reduce<Record<string, string>>((acc, [id, title]) => ({ ...acc, [id]: title }), {}));
  const available = all.filter(([key]) => getLab(key));
  const active = slug && getLab(slug) ? slug : undefined;
  const lab = active ? getLab(active) : undefined;
  const blog = active ? blogs.find(article => article.slug === active) : undefined;
  const total = useMemo(() => available.reduce((sum, [key]) => sum + getLab(key).challenges.length, 0), [available.length]);
  return <main className={styles.page}>
    <Helmet><title>{lab ? lab.title + " | " : "Practice Lab | "}{SITE_NAME}</title><meta name="description" content="Interactive software engineering learning exercises linked to production-focused articles. Practice MongoDB, APIs, React, deployment and infrastructure safely." /><link rel="canonical" href={absoluteUrl(active ? "/practice/" + active : "/practice")} /></Helmet>
    <header className={styles.topbar}><Link to="/" className={styles.back}><FiArrowLeft /> Portfolio</Link><Link to="/blog" className={styles.back}>Articles <FiArrowRight /></Link></header>
    {!active ? <>
      <section className={styles.hero}><span className={styles.kicker}>LEARN BY DOING</span><h1>Practice Lab<span>.</span></h1><p>A hands-on challenge space for understanding the logic behind real software engineering topics. Try, reason, get immediate feedback and return to the article whenever you need context.</p><div className={styles.stats}><span><strong>{available.length}</strong> Learning modules</span><span><strong>{total}</strong> Interactive questions</span></div></section>
      <div className={styles.cards}>{available.map(([key, title]) => <Link key={key} to={"/practice/" + key} className={styles.card}><span>{getLab(key).challenges.length} challenges</span><h2>{getLab(key).title}</h2><p>{getLab(key).summary}</p><small>Based on: {title}</small><strong>Start practicing <FiArrowRight /></strong></Link>)}</div>
    </> : <>
      <section className={styles.hero}><span className={styles.kicker}>INTERACTIVE LEARNING MODULE</span><h1>{lab!.title}<span>.</span></h1><p>{lab!.summary}</p><div className={styles.subLinks}><Link to="/practice"><FiArrowLeft /> All modules</Link><Link to={"/blog/" + active}>Read source article <FiArrowRight /></Link></div></section>
      <Quiz key={active} slug={active} />
      {active === "mongodb-queries-operators-aggregation-guide" && <MongoSandbox />}
      {backendSlugs.has(active) && <ScenarioSandbox key={active} slug={active} />}
      {blog && <div className={styles.articleLink}><p>Need more context? The complete guide includes annotated examples and architecture decisions.</p><Link to={"/blog/" + blog.slug}><FiCode /> Read {blog.title} <FiArrowRight /></Link></div>}
    </>}
  </main>;
}
