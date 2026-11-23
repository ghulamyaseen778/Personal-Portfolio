type Doc = Record<string, unknown>;
export const sampleUsers: Doc[] = [
  { _id: 1, name: "Ali", age: 24, city: "Karachi", active: true, score: 90, salary: 90000, skills: ["React", "MongoDB"], department: "Engineering" },
  { _id: 2, name: "Sara", age: 31, city: "Hyderabad", active: true, score: 78, salary: 120000, skills: ["Python", "MongoDB"], department: "Engineering" },
  { _id: 3, name: "Ayan", age: 17, city: "Karachi", active: false, score: 40, salary: 20000, skills: ["React"], department: "Support" },
  { _id: 4, name: "Hira", age: 28, city: "Karachi", active: true, score: 87, salary: 85000, skills: ["React", "Node.js"], department: "Support" }
];
export const sampleOrders: Doc[] = [
  { _id: 11, userId: 1, status: "PAID", total: 500, items: [{ sku: "A1", qty: 2, price: 250 }] },
  { _id: 12, userId: 1, status: "PENDING", total: 800, items: [{ sku: "B2", qty: 1, price: 800 }] },
  { _id: 13, userId: 2, status: "PAID", total: 1200, items: [{ sku: "A1", qty: 3, price: 400 }] }
];
export type PlaygroundQuery = {
  collection: "users" | "orders";
  filter: Record<string, unknown>;
  pipeline?: Record<string, unknown>[];
  sort?: Record<string, 1 | -1>;
  projection?: Record<string, 0 | 1>;
  limit?: number;
};
const isObject = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object" && !Array.isArray(v);
const get = (obj: unknown, path: string): unknown => path.split(".").reduce<unknown>((v, key) => (isObject(v) ? v[key] : undefined), obj);
function equal(a: unknown, b: unknown) { return JSON.stringify(a) === JSON.stringify(b); }
function compare(a: unknown, b: unknown) { if (typeof a === "number" && typeof b === "number") return a - b; return String(a ?? "").localeCompare(String(b ?? "")); }
function condition(value: unknown, test: unknown): boolean {
  if (!isObject(test) || !Object.keys(test).some(k => k.startsWith("$"))) {
    return Array.isArray(value) ? value.some(v => equal(v, test)) : equal(value, test);
  }
  return Object.entries(test).every(([operator, expected]) => {
    switch (operator) {
      case "$eq": return condition(value, expected);
      case "$ne": return !condition(value, expected);
      case "$gt": return value !== undefined && compare(value, expected) > 0;
      case "$gte": return value !== undefined && compare(value, expected) >= 0;
      case "$lt": return value !== undefined && compare(value, expected) < 0;
      case "$lte": return value !== undefined && compare(value, expected) <= 0;
      case "$in": return Array.isArray(expected) && expected.some(v => condition(value, v));
      case "$nin": return Array.isArray(expected) && !expected.some(v => condition(value, v));
      case "$exists": return (value !== undefined) === expected;
      case "$all": return Array.isArray(value) && Array.isArray(expected) && expected.every(v => value.some(item => equal(item, v)));
      case "$size": return Array.isArray(value) && value.length === expected;
      case "$regex": return typeof value === "string" && typeof expected === "string" && expected.length < 150 && new RegExp(expected, typeof test.$options === "string" ? test.$options : "").test(value);
      case "$options": return true;
      default: throw new Error("Unsupported playground filter operator: " + operator);
    }
  });
}
function matches(doc: Doc, filter: Record<string, unknown>): boolean {
  return Object.entries(filter).every(([key, expected]) => {
    if (key === "$and") return Array.isArray(expected) && expected.every(x => isObject(x) && matches(doc, x));
    if (key === "$or") return Array.isArray(expected) && expected.some(x => isObject(x) && matches(doc, x));
    if (key === "$nor") return Array.isArray(expected) && !expected.some(x => isObject(x) && matches(doc, x));
    if (key.startsWith("$")) throw new Error("Unsupported playground operator: " + key);
    return condition(get(doc, key), expected);
  });
}
function expression(doc: Doc, exp: unknown): unknown {
  if (typeof exp === "string" && exp.startsWith("$")) return get(doc, exp.slice(1));
  if (!isObject(exp)) return exp;
  const keys = Object.keys(exp);
  if (keys.length !== 1 || !keys[0].startsWith("$")) return Object.fromEntries(Object.entries(exp).map(([k, v]) => [k, expression(doc, v)]));
  const [op, args] = Object.entries(exp)[0];
  const values = Array.isArray(args) ? args.map(x => expression(doc, x)) : [];
  switch (op) {
    case "$literal": return args;
    case "$add": return values.reduce<number>((s, v) => s + Number(v || 0), 0);
    case "$subtract": return Number(values[0] || 0) - Number(values[1] || 0);
    case "$multiply": return values.reduce<number>((s, v) => s * Number(v || 0), 1);
    case "$divide": return Number(values[1]) === 0 ? null : Number(values[0]) / Number(values[1]);
    case "$ifNull": return values.find(x => x !== null && x !== undefined) ?? null;
    default: throw new Error("Unsupported playground expression: " + op);
  }
}
function project(doc: Doc, projection: Record<string, unknown>): Doc {
  const included = Object.entries(projection).filter(([k, v]) => k !== "_id" && v !== 0);
  if (included.length) {
    const result: Doc = {};
    if (projection._id !== 0 && doc._id !== undefined) result._id = doc._id;
    for (const [key, spec] of included) result[key] = spec === 1 ? get(doc, key) : expression(doc, spec);
    return result;
  }
  const result = { ...doc };
  for (const [key, spec] of Object.entries(projection)) if (spec === 0) delete result[key];
  return result;
}
function order(rows: Doc[], sort: Record<string, unknown>) {
  const specs = Object.entries(sort);
  if (specs.some(([, direction]) => direction !== -1 && direction !== 1)) throw new Error("Sort directions must be 1 or -1.");
  return [...rows].sort((a, b) => { for (const [field, direction] of specs) { const result = compare(get(a, field), get(b, field)); if (result) return result * Number(direction); } return 0; });
}
function group(rows: Doc[], spec: Record<string, unknown>): Doc[] {
  const groups = new Map<string, { key: unknown; members: Doc[] }>();
  for (const row of rows) {
    const key = expression(row, spec._id);
    const str = JSON.stringify(key);
    const item = groups.get(str);
    if (item) item.members.push(row); else groups.set(str, { key, members: [row] });
  }
  return [...groups.values()].map(({ key, members }) => {
    const result: Doc = { _id: key };
    for (const [field, op] of Object.entries(spec)) {
      if (field === "_id") continue;
      if (!isObject(op) || Object.keys(op).length !== 1) throw new Error("Invalid group accumulator");
      const [fn, input] = Object.entries(op)[0];
      const numbers = members.map(row => Number(expression(row, input))).filter(Number.isFinite);
      switch (fn) {
        case "$sum": result[field] = members.reduce((s, row) => s + Number(expression(row, input) ?? 0), 0); break;
        case "$avg": result[field] = numbers.length ? numbers.reduce((a, b) => a + b, 0) / numbers.length : null; break;
        case "$min": result[field] = numbers.length ? Math.min(...numbers) : null; break;
        case "$max": result[field] = numbers.length ? Math.max(...numbers) : null; break;
        case "$push": result[field] = members.map(row => expression(row, input)); break;
        case "$addToSet": result[field] = [...new Map(members.map(row => { const value = expression(row, input); return [JSON.stringify(value), value]; })).values()]; break;
        default: throw new Error("Unsupported group accumulator: " + fn);
      }
    }
    return result;
  });
}
function pipeline(rows: Doc[], stages: Record<string, unknown>[]): Doc[] {
  let result = rows;
  if (stages.length > 12) throw new Error("Maximum 12 pipeline stages in the learning sandbox.");
  for (const stage of stages) {
    const entries = Object.entries(stage);
    if (entries.length !== 1) throw new Error("Each pipeline stage needs exactly one key.");
    const [name, spec] = entries[0];
    switch (name) {
      case "$match": if (!isObject(spec)) throw new Error("$match must be an object"); result = result.filter(row => matches(row, spec)); break;
      case "$sort": if (!isObject(spec)) throw new Error("$sort must be an object"); result = order(result, spec); break;
      case "$limit": if (!Number.isInteger(spec) || Number(spec) < 0) throw new Error("Invalid $limit"); result = result.slice(0, Number(spec)); break;
      case "$skip": if (!Number.isInteger(spec) || Number(spec) < 0) throw new Error("Invalid $skip"); result = result.slice(Number(spec)); break;
      case "$project": if (!isObject(spec)) throw new Error("$project must be an object"); result = result.map(row => project(row, spec)); break;
      case "$set":
      case "$addFields": if (!isObject(spec)) throw new Error("$set must be an object"); result = result.map(row => ({ ...row, ...Object.fromEntries(Object.entries(spec).map(([k, v]) => [k, expression(row, v)])) })); break;
      case "$group": if (!isObject(spec)) throw new Error("$group must be an object"); result = group(result, spec); break;
      case "$count": if (typeof spec !== "string" || !spec || spec.startsWith("$")) throw new Error("Invalid $count field"); result = result.length ? [{ [spec]: result.length }] : []; break;
      case "$unwind": {
        const path = typeof spec === "string" ? spec : isObject(spec) ? spec.path : undefined;
        if (typeof path !== "string" || !path.startsWith("$") || path.slice(1).includes(".")) throw new Error("Sandbox $unwind supports top-level arrays only.");
        result = result.flatMap(row => { const value = row[path.slice(1)]; return Array.isArray(value) ? value.map(item => ({ ...row, [path.slice(1)]: item })) : []; });
        break;
      }
      default: throw new Error("Stage not supported in this browser-only simulator: " + name);
    }
    if (result.length > 500) throw new Error("Result cap reached.");
  }
  return result;
}
export function executeQuery(query: PlaygroundQuery): Doc[] {
  if (!query || !["users", "orders"].includes(query.collection)) throw new Error("Choose users or orders.");
  if (!isObject(query.filter)) throw new Error("Filter must be a JSON object.");
  if (query.pipeline && (!Array.isArray(query.pipeline) || query.pipeline.some(x => !isObject(x)))) throw new Error("Pipeline must be an array of stage objects.");
  const source = query.collection === "users" ? sampleUsers : sampleOrders;
  let rows = source.filter(row => matches(row, query.filter));
  if (query.pipeline) rows = pipeline(rows, query.pipeline);
  if (query.sort) rows = order(rows, query.sort);
  if (query.projection) rows = rows.map(row => project(row, query.projection!));
  if (query.limit !== undefined) {
    if (!Number.isInteger(query.limit) || query.limit < 0 || query.limit > 100) throw new Error("Limit must be 0–100.");
    rows = rows.slice(0, query.limit);
  }
  return rows;
}
export const demoQueries = [
  { name: "$gte + $in", query: { collection: "users", filter: { age: { $gte: 18 }, city: { $in: ["Karachi", "Hyderabad"] } }, sort: { score: -1 }, projection: { name: 1, age: 1, city: 1, _id: 0 } } },
  { name: "$and + $or", query: { collection: "users", filter: { $and: [{ active: true }, { $or: [{ age: { $gte: 30 } }, { score: { $gte: 85 } }] }] } } },
  { name: "$match + $group + $sum", query: { collection: "orders", filter: {}, pipeline: [{ $match: { status: "PAID" } }, { $group: { _id: "$userId", revenue: { $sum: "$total" }, orders: { $sum: 1 } } }, { $sort: { revenue: -1 } }] } },
  { name: "$unwind + $group", query: { collection: "orders", filter: {}, pipeline: [{ $unwind: "$items" }, { $group: { _id: "$items.sku", totalQty: { $sum: "$items.qty" } } }] } },
  { name: "Computed $project", query: { collection: "users", filter: { active: true }, pipeline: [{ $project: { _id: 0, name: 1, annualSalary: { $multiply: ["$salary", 12] } } }] } }
] as const;
