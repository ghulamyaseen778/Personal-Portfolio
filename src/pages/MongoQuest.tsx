import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft, FiArrowRight, FiAward, FiBookOpen, FiCheck, FiCheckCircle,
  FiChevronRight, FiCode, FiHelpCircle, FiLock, FiPlay, FiRefreshCcw,
  FiRotateCcw, FiTerminal, FiTarget, FiZap
} from "react-icons/fi";
import { mongoQuestLevels, compileQuest } from "../practice/mongoQuestLevels";
import { executeQuery, sampleOrders, sampleUsers } from "../practice/mongoSimulator";
import styles from "./MongoQuest.module.css";

const STORAGE_KEY = "personal-portfolio-mongodb-quest-v1";
type SavedProgress = { completed: string[]; bestStars: Record<string, number> };

const initialProgress: SavedProgress = { completed: [], bestStars: {} };
const format = (value: unknown) => JSON.stringify(value, null, 2);
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

export default function MongoQuest() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState<SavedProgress>(initialProgress);
  const [loaded, setLoaded] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<{
    correct: boolean;
    output: Record<string, unknown>[];
    expected: Record<string, unknown>[];
    note: string;
    stars: number;
  } | null>(null);

  const level = mongoQuestLevels[current];
  const completedCount = progress.completed.length;
  const unlocked = Math.min(mongoQuestLevels.length, completedCount + 1);
  const totalStars = Object.values(progress.bestStars).reduce((total, value) => total + value, 0);
  const xp = totalStars * 35;
  const source = level.source === "users" ? sampleUsers : sampleOrders;

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as SavedProgress;
        if (Array.isArray(parsed.completed) && parsed.bestStars && typeof parsed.bestStars === "object") {
          const valid = new Set(mongoQuestLevels.map(mission => mission.id));
          setProgress({
            completed: parsed.completed.filter(id => valid.has(id)),
            bestStars: Object.fromEntries(Object.entries(parsed.bestStars).filter(([id, stars]) => valid.has(id) && typeof stars === "number" && stars >= 1 && stars <= 3))
          });
        }
      }
    } catch { /* Private browsing may restrict storage; session play still works. */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); }
    catch { /* Storage is optional. */ }
  }, [loaded, progress]);

  const available = level.slots.every(slot => selected[slot.id] !== undefined);
  const preview = useMemo(() => {
    if (!available) return null;
    try { return compileQuest(level, selected); }
    catch { return null; }
  }, [available, level, selected]);

  const transitionTo = (index: number) => {
    if (index > unlocked - 1) return;
    setCurrent(index);
    setSelected({});
    setHintOpen(false);
    setAttempts(0);
    setResult(null);
  };

  const choose = (slot: string, option: string) => {
    setSelected(previous => ({ ...previous, [slot]: option }));
    setResult(null);
  };

  const run = () => {
    if (!preview) return;
    try {
      const output = executeQuery(preview);
      const canonical = compileQuest(level, Object.fromEntries(level.slots.map(slot => [slot.id, slot.correctId])));
      const expected = executeQuery(canonical);
      const correctOptions = level.slots.every(slot => selected[slot.id] === slot.correctId);
      const correct = correctOptions && same(output, expected);
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      const stars = Math.max(1, 3 - Number(hintOpen) - Number(nextAttempts > 1));
      setResult({
        correct,
        output,
        expected,
        stars,
        note: correct
          ? level.solution
          : "This query ran, but did not satisfy the mission. Compare the actual output with the target and check each operator. " + (correctOptions ? "The computed results differ." : "One or more selected operators have different meaning.")
      });
      if (correct) setProgress(previous => ({
        completed: previous.completed.includes(level.id) ? previous.completed : [...previous.completed, level.id],
        bestStars: { ...previous.bestStars, [level.id]: Math.max(previous.bestStars[level.id] ?? 0, stars) }
      }));
    } catch (error) {
      setAttempts(value => value + 1);
      setResult({
        correct: false,
        output: [],
        expected: [],
        stars: 0,
        note: error instanceof Error ? error.message : "Query simulation failed."
      });
    }
  };

  const resetMission = () => {
    setSelected({});
    setResult(null);
    setAttempts(0);
    setHintOpen(false);
  };

  const restartProgress = () => {
    setProgress(initialProgress);
    setCurrent(0);
    resetMission();
  };

  const selectLevel = (index: number) => {
    if (index === 0 || mongoQuestLevels.slice(0, index).every(item => progress.completed.includes(item.id))) {
      transitionTo(index);
    }
  };

  const completedAll = mongoQuestLevels.every(item => progress.completed.includes(item.id));

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <Link to="/practice" className={styles.back}><FiArrowLeft /> Practice Lab</Link>
        <div className={styles.topRight}>
          <span className={styles.rank}><FiAward /> {xp} XP</span>
          <Link to="/blog/mongodb-queries-operators-aggregation-guide" className={styles.back}>MongoDB article <FiBookOpen /></Link>
        </div>
      </div>

      <div className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}><FiZap /> INTERACTIVE LEARNING CAMPAIGN</span>
          <h1>MongoDB <span>Query Quest.</span></h1>
          <p>Don't memorize operators. Build queries, test your logic on real-looking documents, and discover why each answer works.</p>
          <div className={styles.heroMetrics}>
            <span><strong>{completedCount}/{mongoQuestLevels.length}</strong> Missions cleared</span>
            <span><strong>{totalStars}<FiAward /></strong> Stars earned</span>
            <span><strong>{xp}</strong> Experience points</span>
          </div>
        </div>
        <div className={styles.heroTerminal} aria-hidden="true">
          <div><i /><i /><i /><span>query_quest.js</span></div>
          <code><em>db</em>.users.<em>find</em>({"{"}</code>
          <code> &nbsp; city: {"{"} <b>$eq</b>: <span>"Karachi"</span> {"}"},</code>
          <code> &nbsp; age: {"{"} <b>$gte</b>: <strong>18</strong> {"}"}</code>
          <code>{"}"})</code>
          <small><FiCheck /> Query completed successfully</small>
        </div>
      </div>

      <div className={styles.layout}>
        <aside className={styles.levelSidebar} aria-label="MongoDB game levels">
          <div className={styles.sidebarHeading}>
            <div><span>YOUR JOURNEY</span><h2>Mission map</h2></div>
            <span className={styles.levelCount}>{completedCount}/{mongoQuestLevels.length}</span>
          </div>
          <div className={styles.progressTrack}><div style={{ width: (completedCount / mongoQuestLevels.length * 100) + "%" }} /></div>
          <div className={styles.levelList}>
            {mongoQuestLevels.map((mission, index) => {
              const isUnlocked = index === 0 || mongoQuestLevels.slice(0, index).every(item => progress.completed.includes(item.id));
              const isDone = progress.completed.includes(mission.id);
              return (
                <div key={mission.id}>
                  {(index === 0 || mission.chapter !== mongoQuestLevels[index - 1].chapter) && <div className={styles.chapter}>{mission.chapter}</div>}
                  <button
                    className={[styles.levelButton, current === index ? styles.levelActive : "", isDone ? styles.levelDone : ""].join(" ")}
                    disabled={!isUnlocked}
                    type="button"
                    onClick={() => selectLevel(index)}
                    aria-current={current === index ? "step" : undefined}
                  >
                    <span className={styles.levelNumber}>{!isUnlocked ? <FiLock /> : isDone ? <FiCheck /> : String(index + 1).padStart(2, "0")}</span>
                    <span className={styles.levelLabel}><strong>{mission.title}</strong><small>{mission.difficulty}{isDone ? " · Cleared" : ""}</small></span>
                    {isDone && <span className={styles.levelStars}>{"★".repeat(progress.bestStars[mission.id] ?? 0)}</span>}
                    {current === index && !isDone && <FiChevronRight className={styles.levelArrow} />}
                  </button>
                </div>
              );
            })}
          </div>
          <p className={styles.sidebarFoot}>Levels unlock as you solve each mission. Progress is saved in this browser when local storage is available.</p>
        </aside>

        <div className={styles.workspace}>
          <section className={styles.missionCard} aria-label="Current mission">
            <div className={styles.missionKicker}><span><FiTarget /> MISSION {String(current + 1).padStart(2, "0")}</span><span className={styles.difficulty}>{level.difficulty}</span></div>
            <h2>{level.title}</h2>
            <p className={styles.missionStory}>{level.mission}</p>
            <div className={styles.objective}><FiTarget /><div><strong>Your objective</strong><p>{level.objective}</p></div></div>
            <div className={styles.concept}><FiBookOpen /><p>{level.concept}</p></div>
          </section>

          <section className={styles.builder}>
            <div className={styles.sectionHeading}>
              <div><span>WORKSPACE / QUERY BUILDER</span><h2>Make your move</h2><p>Select the operator for each step, then run your query against the sample database.</p></div>
              <button type="button" className={styles.reset} onClick={resetMission}><FiRotateCcw /> Reset</button>
            </div>
            <div className={styles.slots}>
              {level.slots.map((slot, index) => (
                <div className={styles.slot} key={slot.id}>
                  <div className={styles.slotHeader}><span className={styles.stepNumber}>{index + 1}</span><h3>{slot.prompt}</h3><span>{selected[slot.id] ? "Selected" : "Choose one"}</span></div>
                  <div className={styles.options}>
                    {slot.options.map(choice => (
                      <button type="button" key={choice.id} onClick={() => choose(slot.id, choice.id)} className={[styles.option, selected[slot.id] === choice.id ? styles.optionSelected : ""].join(" ")}>
                        <span className={styles.optionCheck}>{selected[slot.id] === choice.id ? <FiCheck /> : null}</span>
                        <span><code>{choice.code}</code><small>{choice.meaning}</small></span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.hintRow}>
              <button type="button" onClick={() => setHintOpen(value => !value)}><FiHelpCircle /> {hintOpen ? "Hide hint" : "Need a hint?"}</button>
              <span>Hints may reduce your mission stars.</span>
            </div>
            {hintOpen && <div className={styles.hint}>{level.hint}</div>}
          </section>

          <section className={styles.console} aria-label="MongoDB execution and results">
            <div className={styles.consoleHeading}><span><FiTerminal /> SIMULATED MONGODB SHELL</span><span className={styles.localPill}>Local sample data</span></div>
            <div className={styles.consoleBody}>
              <div className={styles.command}>
                <div><span>Generated query</span><small>Read-only learning simulation</small></div>
                <pre>{preview
                  ? "db." + level.source + (level.mode === "filter" ? ".find(" + format(preview.filter) + ")" : ".aggregate(" + format(preview.pipeline) + ")")
                  : "// Select each operator above to build your query"}</pre>
              </div>
              <div className={styles.runRow}>
                <span><FiCode /> {level.source} collection · {source.length} sample documents</span>
                <button type="button" disabled={!available} onClick={run}><FiPlay /> Run query</button>
              </div>
              {result ? (
                <div className={styles.feedback} aria-live="polite">
                  <div className={[styles.feedbackHeader, result.correct ? styles.success : styles.failure].join(" ")}>
                    {result.correct ? <FiCheckCircle /> : <FiHelpCircle />}
                    <div><strong>{result.correct ? "Mission complete!" : "Not quite — debug your query"}</strong>
                      <span>{result.correct ? "You've unlocked the next level." : "See which records matched and try again."}</span></div>
                    {result.correct && <b className={styles.earned}>{"★".repeat(result.stars)}</b>}
                  </div>
                  <div className={styles.feedbackDetails}>
                    <p>{result.note}</p>
                    <div className={styles.resultComparison}>
                      <div><span>Your query · {result.output.length} result(s)</span><pre>{format(result.output)}</pre></div>
                      {!result.correct && <div><span>Mission target · {result.expected.length} result(s)</span><pre>{format(result.expected)}</pre></div>}
                    </div>
                    {result.correct && <div className={styles.nextActions}>
                      <button type="button" className={styles.secondary} onClick={resetMission}><FiRefreshCcw /> Replay level</button>
                      {current < mongoQuestLevels.length - 1
                        ? <button className={styles.next} type="button" onClick={() => transitionTo(current + 1)}>Next mission <FiArrowRight /></button>
                        : <div className={styles.finished}><FiAward /> You've completed the MongoDB Query Quest!</div>}
                    </div>}
                  </div>
                </div>
              ) : <div className={styles.emptyResult}>Choose your operators and press <strong>Run query</strong> to see what happens to the documents.</div>}
            </div>
          </section>

          <section className={styles.records}>
            <div className={styles.sectionHeading}><div><span>LEARNING DATASET</span><h2>Inspect the documents</h2><p>These sample records stay isolated in your browser. They never modify a real MongoDB database.</p></div></div>
            <div className={styles.recordGrid}>
              {source.map((document, i) => {
                const isMatched = result?.output.some(row => same(row._id, document._id));
                const showHighlight = level.mode === "filter" && !!result;
                return <div className={[styles.record, showHighlight && isMatched ? styles.matched : "", showHighlight && !isMatched ? styles.dimmed : ""].join(" ")} key={String(document._id ?? i)}>
                  <div><span>DOC #{i + 1}</span>{showHighlight && <b>{isMatched ? "MATCH" : "EXCLUDED"}</b>}</div>
                  <pre>{format(document)}</pre>
                </div>;
              })}
            </div>
            {level.mode === "pipeline" && <p className={styles.pipelineNote}>For aggregation levels, inspect the result panel to see transformed or grouped output. The original documents remain unchanged.</p>}
          </section>
          {completedAll && <div className={styles.victory}><FiAward /><div><h2>MongoDB Quest mastered!</h2><p>All 12 missions cleared. Replay stages for more stars or experiment with free-form queries.</p></div><Link to="/practice/mongodb-queries-operators-aggregation-guide">Open free sandbox <FiArrowRight /></Link></div>}
          <div className={styles.footerActions}>
            <Link to="/practice/mongodb-queries-operators-aggregation-guide">Free Query Sandbox <FiTerminal /></Link>
            <button type="button" onClick={restartProgress}>Start the course again <FiRefreshCcw /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
