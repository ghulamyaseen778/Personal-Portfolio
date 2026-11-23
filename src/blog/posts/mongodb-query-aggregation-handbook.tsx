import type { BlogPost } from "../types";
import CodeBlock from "../components/CodeBlock";

type Entry = [title: string, meaning: string, example: string];
type Section = { title: string; intro: string; entries: Entry[] };

const seed = [
  "use portfolio_lab",
  'db.users.insertMany([',
  '  { _id: 1, name: "Ali", email: "ali@example.com", age: 24, city: "Karachi", active: true, score: 90, salary: 90000, department: "Engineering", skills: ["React", "MongoDB"], address: { district: "East" } },',
  '  { _id: 2, name: "Sara", email: "sara@example.com", age: 31, city: "Hyderabad", active: true, score: 78, salary: 120000, department: "Engineering", skills: ["Python", "MongoDB"], address: { district: "Hyderabad" } },',
  '  { _id: 3, name: "Ayan", email: "ayan@example.com", age: 17, city: "Karachi", active: false, score: 40, salary: 20000, department: "Support", skills: ["React"], address: { district: "Central" } },',
  '  { _id: 4, name: "Hira", email: "hira@example.com", age: 28, city: "Karachi", active: true, score: 87, salary: 85000, department: "Support", skills: ["React", "Node.js"], address: { district: "West" } }',
  "])",
  "db.orders.insertMany([",
  '  { _id: 11, userId: 1, status: "PAID", total: 500, paidAmount: 500, createdAt: ISODate("2026-10-01"), items: [{ sku: "A1", qty: 2, price: 250 }] },',
  '  { _id: 12, userId: 1, status: "PENDING", total: 800, paidAmount: 300, createdAt: ISODate("2026-10-02"), items: [{ sku: "B2", qty: 1, price: 800 }] },',
  '  { _id: 13, userId: 2, status: "PAID", total: 1200, paidAmount: 1200, createdAt: ISODate("2026-11-03"), items: [{ sku: "A1", qty: 3, price: 400 }] }',
  "])"
].join("\n");

const sections: Section[] = [
  { title: "Read queries and cursor methods", intro: "find returns a cursor; findOne returns a document. Projection, sorting and pagination apply to queries.", entries: [
    ["find / findOne", "Find many or one; use an explicit filter.", 'db.users.find({ active: true })\ndb.users.findOne({ email: "ali@example.com" })'],
    ["projection", "_id is included unless excluded; avoid projecting sensitive fields.", 'db.users.find({ city: "Karachi" }, { name: 1, score: 1, _id: 0 })'],
    ["sort / limit / skip", "Add a deterministic tie-breaker for stable pagination.", 'db.users.find({ active: true }).sort({ salary: -1, _id: 1 }).skip(0).limit(10)'],
    ["countDocuments / estimatedDocumentCount", "Filter-accurate count versus fast estimated collection count.", 'db.users.countDocuments({ active: true })\ndb.users.estimatedDocumentCount()'],
    ["distinct / toArray / forEach", "Unique values and cursor iteration. toArray loads results into memory.", 'db.users.distinct("city", { active: true })\ndb.users.find().limit(5).toArray()\ndb.users.find().forEach(u => print(u.name))']
  ] },
  { title: "Create, update and delete methods", intro: "Use specific filters before changing any stored document. Operations on one document are atomic.", entries: [
    ["insertOne / insertMany", "Insert a single document or several.", 'db.users.insertOne({ name: "Nida", age: 24 })\ndb.users.insertMany([{ name: "Raza" }, { name: "Hina" }])'],
    ["updateOne / updateMany", "Use an operator update so other fields are preserved.", 'db.users.updateOne({ _id: 1 }, { $set: { active: true } })\ndb.users.updateMany({ city: "Karachi" }, { $inc: { visits: 1 } })'],
    ["replaceOne / upsert / $setOnInsert", "Replacing drops unspecified fields. Upsert inserts only when unmatched.", 'db.users.replaceOne({ _id: 4 }, { name: "Hira", city: "Karachi" })\ndb.users.updateOne({ email: "new@example.com" }, { $set: { active: true }, $setOnInsert: { createdAt: new Date() } }, { upsert: true })'],
    ["findOneAndUpdate / findOneAndDelete", "Return the post-update document or delete-and-return one matching document.", 'db.users.findOneAndUpdate({ _id: 1 }, { $inc: { score: 5 } }, { returnDocument: "after" })\ndb.users.findOneAndDelete({ email: "unused@example.com" })'],
    ["deleteOne / deleteMany", "Never pass an empty filter without explicitly intending a broad deletion.", 'db.users.deleteOne({ email: "unused@example.com" })\ndb.sessions.deleteMany({ expiresAt: { $lt: new Date() } })'],
    ["bulkWrite", "Batch independent mixed writes and inspect the result counts.", 'db.users.bulkWrite([{ insertOne: { document: { name: "Zara" } } }, { updateOne: { filter: { _id: 1 }, update: { $set: { active: true } } } }, { deleteOne: { filter: { _id: 99 } } }])']
  ] },
  { title: "Comparison, logical and element query operators", intro: "These operators appear inside filters; nested criteria combine implicitly with AND unless $or is used.", entries: [
    ["$eq / $ne / $in / $nin", "Equality and membership; $ne and $nin can match missing fields.", 'db.users.find({ city: { $in: ["Karachi", "Hyderabad"] }, active: { $ne: false } })'],
    ["$gt / $gte / $lt / $lte", "Inclusive and exclusive ranges can share one field.", 'db.users.find({ age: { $gte: 18, $lt: 30 }, salary: { $gt: 50000 } })'],
    ["$and / $or / $nor / $not", "Group logical choices and negations.", 'db.users.find({ $and: [{ active: true }, { $or: [{ score: { $gte: 85 } }, { age: { $gt: 30 } }] }] })\ndb.users.find({ $nor: [{ age: { $lt: 18 } }, { active: false }] })\ndb.users.find({ age: { $not: { $gte: 18 } } })'],
    ["$exists / $type", "Distinguish absent fields from fields with a specific BSON type.", 'db.users.find({ email: { $exists: true, $type: "string" } })'],
    ["$regex / $options", "Case-insensitive patterns; escape patterns from user input.", 'db.users.find({ name: { $regex: "^a", $options: "i" } })'],
    ["$expr / $mod", "Compare fields to other fields; filter by a numeric remainder.", 'db.orders.find({ $expr: { $gt: ["$total", "$paidAmount"] } })\ndb.users.find({ age: { $mod: [2, 0] } })'],
    ["$all / $size / $elemMatch", "Test arrays for multiple values, exact length or conditions on one element.", 'db.users.find({ skills: { $all: ["React", "MongoDB"] } })\ndb.users.find({ skills: { $size: 2 } })\ndb.orders.find({ items: { $elemMatch: { qty: { $gte: 2 }, price: { $gte: 200 } } } })'],
    ["dot notation / array index / $slice", "Query embedded fields and project a shortened array.", 'db.users.find({ "address.district": "East", "skills.0": "React" }, { name: 1, skills: { $slice: 1 } })'],
    ["$bitsAllSet / $bitsAnySet", "Query integer bit flags.", 'db.permissions.find({ flags: { $bitsAllSet: [0, 2] } })\ndb.permissions.find({ flags: { $bitsAnySet: [1, 3] } })']
  ] },
  { title: "Update field and array operators", intro: "Do not confuse update operators with similarly named aggregation stages and expressions.", entries: [
    ["$set / $unset / $rename", "Write, remove or rename fields.", 'db.users.updateOne({ _id: 1 }, { $set: { active: true }, $unset: { legacy: "" }, $rename: { oldName: "name" } })'],
    ["$inc / $mul / $min / $max", "Increment, multiply and update min/max only when appropriate.", 'db.products.updateOne({ sku: "A1" }, { $inc: { stock: -2 }, $mul: { factor: 1.1 }, $min: { low: 100 }, $max: { high: 200 } })'],
    ["$currentDate / $bit", "Stamp a field with a date and update bit flags.", 'db.permissions.updateOne({ userId: 1 }, { $bit: { flags: { or: 4 } }, $currentDate: { updatedAt: true } })'],
    ["$push / $each / $sort / $slice", "Insert values into an array, sort it and retain a capped length.", 'db.users.updateOne({ _id: 1 }, { $push: { scores: { $each: [70, 80], $sort: -1, $slice: 5 } } })'],
    ["$addToSet / $pull / $pullAll / $pop", "Avoid duplicates, remove matching values, or pop an endpoint.", 'db.users.updateOne({ _id: 1 }, { $addToSet: { skills: { $each: ["React", "Node.js"] } } })\ndb.users.updateOne({ _id: 1 }, { $pull: { skills: "Old" } })\ndb.users.updateOne({ _id: 1 }, { $pullAll: { skills: ["Legacy"] }, $pop: { notifications: -1 } })'],
    ["positional $ / $[] / $[item]", "Modify the first, all or filtered array elements.", 'db.orders.updateOne({ _id: 11, "items.sku": "A1" }, { $set: { "items.$.qty": 4 } })\ndb.orders.updateMany({}, { $inc: { "items.$[].qty": 1 } })\ndb.orders.updateMany({}, { $set: { "items.$[i].status": "discounted" } }, { arrayFilters: [{ "i.price": { $gt: 1000 } }] })'],
    ["pipeline update", "An array of update stages can compute new fields from existing ones.", 'db.users.updateMany({}, [{ $set: { grade: { $cond: [{ $gte: ["$score", 70] }, "pass", "review"] } } }])']
  ] },
  { title: "Aggregation pipeline stages", intro: "The stages execute from left to right; each stage receives the previous output.", entries: [
    ["$match / $sort / $skip / $limit", "Filter, sort and paginate results.", 'db.users.aggregate([{ $match: { active: true } }, { $sort: { score: -1, _id: 1 } }, { $skip: 0 }, { $limit: 3 }])'],
    ["$project / $unset / $addFields / $set", "Shape documents and compute new fields.", 'db.orders.aggregate([{ $set: { due: { $subtract: ["$total", "$paidAmount"] } } }, { $project: { userId: 1, due: 1 } }, { $unset: "_id" }])'],
    ["$group with $sum / $avg / $min / $max", "Create metrics for each department.", 'db.users.aggregate([{ $group: { _id: "$department", count: { $sum: 1 }, payroll: { $sum: "$salary" }, average: { $avg: "$salary" }, youngest: { $min: "$age" }, oldest: { $max: "$age" } } }])'],
    ["$first / $last / $push / $addToSet", "Order first if first and last have business meaning.", 'db.orders.aggregate([{ $sort: { createdAt: 1, _id: 1 } }, { $group: { _id: "$userId", first: { $first: "$_id" }, last: { $last: "$_id" }, orders: { $push: "$_id" }, statuses: { $addToSet: "$status" } } }])'],
    ["$unwind", "Expand array items into separate pipeline rows.", 'db.orders.aggregate([{ $unwind: { path: "$items", preserveNullAndEmptyArrays: true } }, { $project: { sku: "$items.sku", qty: "$items.qty" } }])'],
    ["$lookup", "Join collections where local and foreign key types agree.", 'db.orders.aggregate([{ $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "customer" } }, { $unwind: "$customer" }])'],
    ["$lookup with let + pipeline", "Use $expr to build correlated lookups.", 'db.users.aggregate([{ $lookup: { from: "orders", let: { uid: "$_id" }, pipeline: [{ $match: { $expr: { $eq: ["$userId", "$$uid"] } } }], as: "orders" } }])'],
    ["$facet / $count", "Produce several reports together.", 'db.orders.aggregate([{ $facet: { byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }], top: [{ $sort: { total: -1 } }, { $limit: 5 }], count: [{ $count: "value" }] } }])'],
    ["$bucket / $bucketAuto / $sortByCount", "Explicit and automatic ranges or frequency reports.", 'db.users.aggregate([{ $bucket: { groupBy: "$age", boundaries: [0, 18, 30, 60], default: "other", output: { count: { $sum: 1 } } } }])\ndb.users.aggregate([{ $bucketAuto: { groupBy: "$salary", buckets: 3 } }])\ndb.users.aggregate([{ $sortByCount: "$city" }])'],
    ["$sample / $replaceWith", "Sample randomly or promote an embedded object to root.", 'db.users.aggregate([{ $sample: { size: 2 } }])\ndb.users.aggregate([{ $replaceWith: "$address" }])'],
    ["$unionWith", "Combine another collection into a common output shape.", 'db.orders.aggregate([{ $project: { amount: "$total" } }, { $unionWith: { coll: "refunds", pipeline: [{ $project: { amount: 1 } }] } }])'],
    ["$setWindowFields", "Calculate cumulative totals within user partitions.", 'db.orders.aggregate([{ $setWindowFields: { partitionBy: "$userId", sortBy: { createdAt: 1, _id: 1 }, output: { running: { $sum: "$total", window: { documents: ["unbounded", "current"] } } } } }])'],
    ["$densify / $fill", "Fill gaps in time series; version and stage ordering matter.", 'db.metrics.aggregate([{ $densify: { field: "day", range: { step: 1, unit: "day", bounds: "full" } } }, { $fill: { sortBy: { day: 1 }, output: { visits: { value: 0 } } } }])'],
    ["$merge / $out", "Write results to a target collection: never run blindly on production.", 'db.orders.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }, { $merge: { into: "orderStatusSummary", on: "_id", whenMatched: "replace", whenNotMatched: "insert" } }])\n// $out replaces a destination collection; use only intentionally.']
  ] },
  { title: "Aggregation expression operators", intro: "Expressions work in stages such as $project, $set and $group and are separate from update operators.", entries: [
    ["$cond / $switch / $ifNull", "Conditional branches and safe fallbacks.", 'db.users.aggregate([{ $project: { tier: { $cond: [{ $gte: ["$score", 80] }, "gold", "standard"] }, phone: { $ifNull: ["$phone", "unknown"] } } }])'],
    ["$add / $subtract / $multiply / $divide / $round", "Arithmetic expression composition.", 'db.orders.aggregate([{ $project: { due: { $subtract: ["$total", "$paidAmount"] }, withTax: { $round: [{ $multiply: ["$total", 1.15] }, 2] }, half: { $divide: ["$total", 2] } } }])'],
    ["$abs / $ceil / $floor / $trunc / $mod / $pow / $sqrt", "Numerical transformations.", 'db.metrics.aggregate([{ $project: { absolute: { $abs: "$change" }, ceil: { $ceil: "$value" }, floor: { $floor: "$value" }, remainder: { $mod: ["$value", 2] }, squared: { $pow: ["$value", 2] } } }])'],
    ["$concat / $toLower / $toUpper / $trim / $split", "String normalization and formatting.", 'db.users.aggregate([{ $project: { label: { $concat: [{ $toUpper: "$city" }, ": ", { $trim: { input: "$name" } }] }, words: { $split: [{ $toLower: "$name" }, " "] } } }])'],
    ["$substrCP / $strLenCP / $replaceAll / $regexMatch", "Unicode-aware string operations.", 'db.users.aggregate([{ $project: { prefix: { $substrCP: ["$name", 0, 2] }, length: { $strLenCP: "$name" }, hasA: { $regexMatch: { input: "$name", regex: /a/i } } } }])'],
    ["$isArray / $size / $arrayElemAt / $slice", "Safely inspect and slice arrays.", 'db.users.aggregate([{ $project: { skillsCount: { $size: { $cond: [{ $isArray: "$skills" }, "$skills", []] } }, first: { $arrayElemAt: ["$skills", 0] }, top2: { $slice: ["$skills", 2] } } }])'],
    ["$map / $filter / $reduce", "Transform, select, or fold array elements.", 'db.orders.aggregate([{ $project: { expensive: { $filter: { input: "$items", as: "i", cond: { $gt: ["$$i.price", 300] } } }, totalUnits: { $reduce: { input: "$items", initialValue: 0, in: { $add: ["$$value", "$$this.qty"] } } }, skus: { $map: { input: "$items", as: "i", in: "$$i.sku" } } } }])'],
    ["$concatArrays / $setUnion / $setIntersection / $in", "Array composition and sets.", 'db.users.aggregate([{ $project: { allSkills: { $setUnion: ["$skills", ["MongoDB"]] }, shared: { $setIntersection: ["$skills", ["React"]] }, hasReact: { $in: ["React", "$skills"] } } }])'],
    ["$mergeObjects / $objectToArray / $arrayToObject / $getField", "Object restructuring and dynamic key access.", 'db.users.aggregate([{ $project: { profile: { $mergeObjects: [{ city: "Unknown" }, "$address"] }, pairs: { $objectToArray: "$address" }, district: { $getField: { field: "district", input: "$address" } } } }])'],
    ["$dateToString / $dateAdd / $dateDiff / $dateFromString", "Date formatting, parsing and arithmetic with explicit timezones.", 'db.orders.aggregate([{ $project: { month: { $dateToString: { format: "%Y-%m", date: "$createdAt", timezone: "Asia/Karachi" } }, due: { $dateAdd: { startDate: "$createdAt", unit: "day", amount: 7 } }, daysOld: { $dateDiff: { startDate: "$createdAt", endDate: "$$NOW", unit: "day" } } } }])'],
    ["$convert / $toString / $type / $literal", "Safe BSON type conversion and literal values.", 'db.users.aggregate([{ $project: { ageInt: { $convert: { input: "$age", to: "int", onError: null, onNull: null } }, idText: { $toString: "$_id" }, type: { $type: "$salary" }, raw: { $literal: "$salary" } } }])']
  ] },
  { title: "Indexes, inspection and transactions", intro: "Indexes help query plans, while transactions coordinate multiple writes on a replica set or sharded cluster.", entries: [
    ["createIndex / getIndexes / dropIndex / explain", "Build and verify an index; drop only when it is safe.", 'db.users.createIndex({ city: 1, active: 1, score: -1 }, { name: "city_active_score" })\ndb.users.getIndexes()\ndb.users.find({ city: "Karachi", active: true }).sort({ score: -1 }).explain("executionStats")\n// db.users.dropIndex("city_active_score")'],
    ["unique / partial / TTL", "Enforce uniqueness, index a subset and expire stale records.", 'db.users.createIndex({ email: 1 }, { unique: true })\ndb.users.createIndex({ score: -1 }, { partialFilterExpression: { active: true } })\ndb.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })'],
    ["$text / $near", "Full-text and 2dsphere queries require their respective indexes.", 'db.articles.createIndex({ title: "text", body: "text" })\ndb.articles.find({ $text: { $search: "mongodb aggregation" } })\ndb.places.createIndex({ location: "2dsphere" })\ndb.places.find({ location: { $near: { $geometry: { type: "Point", coordinates: [67, 24.9] }, $maxDistance: 1000 } } })'],
    ["session and transaction", "This requires a transaction-capable MongoDB deployment; handle transient transaction failures in real services.", 'const session = db.getMongo().startSession()\nconst bank = session.getDatabase(db.getName())\ntry {\n  session.startTransaction()\n  bank.accounts.updateOne({ _id: 1 }, { $inc: { balance: -100 } })\n  bank.accounts.updateOne({ _id: 2 }, { $inc: { balance: 100 } })\n  session.commitTransaction()\n} catch (error) { session.abortTransaction(); throw error }\nfinally { session.endSession() }']
  ] },
  { title: "Combined real-world pipelines", intro: "Compose stages to solve multi-step business questions.", entries: [
    ["Search + computed score + top N", "Filter active adults then rank and select public fields.", 'db.users.aggregate([{ $match: { active: true, age: { $gte: 18 }, $or: [{ city: "Karachi" }, { score: { $gte: 85 } }] } }, { $set: { rank: { $add: ["$score", { $divide: ["$salary", 10000] }] } } }, { $sort: { rank: -1, _id: 1 } }, { $project: { name: 1, rank: 1 } }, { $limit: 3 }])'],
    ["Paid revenue by month", "Match paid orders, group by timezone-adjusted month, then sort.", 'db.orders.aggregate([{ $match: { status: "PAID" } }, { $group: { _id: { $dateToString: { date: "$createdAt", format: "%Y-%m", timezone: "Asia/Karachi" } }, orders: { $sum: 1 }, revenue: { $sum: "$total" } } }, { $sort: { _id: 1 } }])'],
    ["Customer spending with $lookup", "Group paid orders, rank customers and join account details.", 'db.orders.aggregate([{ $match: { status: "PAID" } }, { $group: { _id: "$userId", spent: { $sum: "$total" } } }, { $sort: { spent: -1 } }, { $limit: 10 }, { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } }, { $unwind: "$user" }, { $project: { _id: 0, name: "$user.name", spent: 1 } }])'],
    ["Stock sales using $unwind + $sum", "Count sold units and revenue for each SKU.", 'db.orders.aggregate([{ $match: { status: "PAID" } }, { $unwind: "$items" }, { $group: { _id: "$items.sku", qty: { $sum: "$items.qty" }, sales: { $sum: { $multiply: ["$items.qty", "$items.price"] } } } }, { $sort: { qty: -1 } }])'],
    ["Dashboard pagination with $facet", "Return a page and total count from the same filtered snapshot.", 'db.orders.aggregate([{ $match: { status: "PAID" } }, { $facet: { rows: [{ $sort: { createdAt: -1, _id: -1 } }, { $skip: 0 }, { $limit: 10 }], total: [{ $count: "count" }] } }])'],
    ["Array analytics without $unwind", "Filter items and use $reduce to compute a subtotal.", 'db.orders.aggregate([{ $project: { userId: 1, eligibleTotal: { $reduce: { input: { $filter: { input: "$items", as: "i", cond: { $gte: ["$$i.qty", 2] } } }, initialValue: 0, in: { $add: ["$$value", { $multiply: ["$$this.qty", "$$this.price"] }] } } } } }])']
  ] }
];

const article: BlogPost = {
  slug: "mongodb-queries-operators-aggregation-guide",
  title: "MongoDB Queries, $ Operators & Aggregation: Practical Reference",
  description: "A comprehensive, example-driven MongoDB handbook: CRUD, logical queries, updates, arrays, aggregation stages and expressions, indexes and combined production patterns.",
  category: "Database",
  readTime: "45 min read",
  date: "November 2026",
  featured: true,
  tags: ["MongoDB", "mongosh", "Query Operators", "Aggregation", "CRUD", "Indexes", "Mongoose"],
  content: <>
    <p>Learn the difference between <strong>collection methods</strong> such as <code>find()</code>,
    <strong> query operators</strong> such as <code>$gte</code>,
    <strong> update operators</strong> such as <code>$set</code>, and
    <strong> aggregation stages</strong> such as <code>$group</code>.</p>
    <blockquote>Examples are mongosh commands for a disposable database, not commands to paste into production. MongoDB is versioned and exposes many administrative and specialized APIs; this is broad practical coverage, not a literal catalog of every internal method. Some examples refer to illustrative fields or collections not in the seed.</blockquote>
    <h2>Prepare a disposable sample database</h2>
    <CodeBlock language="javascript" code={seed} />
    <p>The sample uses numeric IDs to keep joins readable; production data commonly uses ObjectIds. Write examples mutate data; reset the collection if you want reproducible results.</p>
    {sections.map(section => <section key={section.title}>
      <h2>{section.title}</h2>
      <p>{section.intro}</p>
      {section.entries.map(([title, meaning, example]) => <div key={title}>
        <h3>{title}</h3>
        <p>{meaning}</p>
        <CodeBlock language="javascript" code={example} />
      </div>)}
    </section>)}
    <h2>Important distinctions</h2>
    <ul>
      <li><strong>find</strong> filters existing documents; <strong>aggregate</strong> can reshape, join, group and compute.</li>
      <li><strong>$set</strong> in updateOne is an update modifier, but in aggregate it is a pipeline stage.</li>
      <li><strong>$sum</strong> has accumulator and expression forms depending on its pipeline context.</li>
      <li><strong>$elemMatch</strong> ensures multiple constraints apply to the same array element.</li>
      <li>Validate user-provided filters and projection fields, enforce query limits, and check <code>explain("executionStats")</code> under realistic workloads.</li>
    </ul>
    <p>Use the linked Practice Lab for guided exercises and a safe client-side sample-data playground. The playground does not connect to live MongoDB or execute arbitrary JavaScript.</p>
  </>
};

export default article;
