export type QuestDifficulty = "Starter" | "Builder" | "Expert";
export type QuestOption = {
  id: string;
  code: string;
  meaning: string;
  fragment: Record<string, unknown>;
};
export type QuestSlot = {
  id: string;
  prompt: string;
  correctId: string;
  options: QuestOption[];
};
export type QuestLevel = {
  id: string;
  title: string;
  chapter: string;
  difficulty: QuestDifficulty;
  source: "users" | "orders";
  mode: "filter" | "pipeline";
  mission: string;
  objective: string;
  concept: string;
  hint: string;
  solution: string;
  slots: QuestSlot[];
};

const option = (id: string, code: string, meaning: string, fragment: Record<string, unknown>): QuestOption => ({ id, code, meaning, fragment });

export const mongoQuestLevels: QuestLevel[] = [
  {
    id: "city",
    title: "The Karachi Search",
    chapter: "01 · Learn to query",
    difficulty: "Starter",
    source: "users",
    mode: "filter",
    mission: "A school needs a list of users from Karachi. Your first task: locate the right documents.",
    objective: "Return every user whose city equals Karachi.",
    concept: "$eq compares a field with a value. Other cities should not match.",
    hint: "You want an exact match, not the opposite. Look for $eq.",
    solution: "The equality operator returns Ali, Ayan, and Hira. Notice that it does not check whether a person is active.",
    slots: [{ id: "city-filter", prompt: "Choose the filter", correctId: "eq", options: [
      option("eq", 'city: { $eq: "Karachi" }', "Exactly Karachi", { city: { $eq: "Karachi" } }),
      option("ne", 'city: { $ne: "Karachi" }', "Anywhere except Karachi", { city: { $ne: "Karachi" } }),
      option("wrong", 'city: { $eq: "Hyderabad" }', "Only Hyderabad", { city: { $eq: "Hyderabad" } })
    ] }]
  },
  {
    id: "adults",
    title: "The Age Gate",
    chapter: "01 · Learn to query",
    difficulty: "Starter",
    source: "users",
    mode: "filter",
    mission: "A registration page accepts adults aged 18 or over. One operator controls the boundary.",
    objective: "Return users aged 18 or older, including 18.",
    concept: "$gte includes the boundary, while $gt excludes it.",
    hint: "The letters gte stand for greater than or equal.",
    solution: "Using $gte includes everyone aged 18 or older. The boundary is inclusive.",
    slots: [{ id: "age-filter", prompt: "Choose the comparison", correctId: "gte", options: [
      option("gt", "age: { $gt: 18 }", "Older than 18, excludes age 18", { age: { $gt: 18 } }),
      option("gte", "age: { $gte: 18 }", "18 and older", { age: { $gte: 18 } }),
      option("lt", "age: { $lt: 18 }", "Below age 18", { age: { $lt: 18 } })
    ] }]
  },
  {
    id: "active-karachi",
    title: "Two Locks, One Door",
    chapter: "02 · Combine conditions",
    difficulty: "Starter",
    source: "users",
    mode: "filter",
    mission: "Your dashboard shows only active Karachi accounts. The request must pass both locks.",
    objective: "Require city Karachi AND active true.",
    concept: "Multiple criteria combine with logical AND. A document must satisfy both conditions.",
    hint: "Pick the Karachi filter, then choose true for active. Both must pass.",
    solution: "Ali and Hira pass both conditions; Ayan is in Karachi but inactive.",
    slots: [
      { id: "city-filter", prompt: "Where do users live?", correctId: "karachi", options: [
        option("karachi", 'city: { $eq: "Karachi" }', "Limit to Karachi", { city: { $eq: "Karachi" } }),
        option("hyd", 'city: { $eq: "Hyderabad" }', "Limit to Hyderabad", { city: { $eq: "Hyderabad" } }),
        option("not", 'city: { $ne: "Karachi" }', "Exclude Karachi", { city: { $ne: "Karachi" } })
      ] },
      { id: "active-filter", prompt: "Which activity state?", correctId: "yes", options: [
        option("no", "active: false", "Inactive accounts", { active: false }),
        option("yes", "active: true", "Active accounts", { active: true }),
        option("exists", "active: { $exists: true }", "Either true or false if field exists", { active: { $exists: true } })
      ] }
    ]
  },
  {
    id: "range",
    title: "The Range Puzzle",
    chapter: "02 · Combine conditions",
    difficulty: "Builder",
    source: "users",
    mode: "filter",
    mission: "An internship program wants participants at least 18, but younger than 30.",
    objective: "Require age >= 18 AND age < 30.",
    concept: "A range combines an inclusive lower boundary with an exclusive upper boundary.",
    hint: "$gte 18 includes 18; $lt 30 excludes 30.",
    solution: "Ali (24) and Hira (28) qualify. Sara (31) and Ayan (17) do not.",
    slots: [
      { id: "lower", prompt: "Choose the lower boundary", correctId: "gte", options: [
        option("gte", "age: { $gte: 18 }", "18 or older", { age: { $gte: 18 } }),
        option("gt", "age: { $gt: 18 }", "Strictly older than 18", { age: { $gt: 18 } }),
        option("lte", "age: { $lte: 18 }", "18 or younger", { age: { $lte: 18 } })
      ] },
      { id: "upper", prompt: "Choose the upper boundary", correctId: "lt", options: [
        option("lte", "age: { $lte: 30 }", "Includes age 30", { age: { $lte: 30 } }),
        option("lt", "age: { $lt: 30 }", "Younger than 30", { age: { $lt: 30 } }),
        option("gt", "age: { $gt: 30 }", "Older than 30", { age: { $gt: 30 } })
      ] }
    ]
  },
  {
    id: "cities",
    title: "The Two-City Permit",
    chapter: "02 · Combine conditions",
    difficulty: "Builder",
    source: "users",
    mode: "filter",
    mission: "Your service works in Karachi and Hyderabad, but only for active accounts.",
    objective: "Find active users from either Karachi OR Hyderabad.",
    concept: "$in matches any value in an allowed list; combining it with active: true is still an AND.",
    hint: "Use $in for the two cities, followed by active true.",
    solution: "Ali, Sara, and Hira match. Ayan is in Karachi, but inactive.",
    slots: [
      { id: "city-set", prompt: "Select permitted cities", correctId: "in", options: [
        option("in", 'city: { $in: ["Karachi", "Hyderabad"] }', "Any of these cities", { city: { $in: ["Karachi", "Hyderabad"] } }),
        option("nin", 'city: { $nin: ["Karachi", "Hyderabad"] }', "Not in the list", { city: { $nin: ["Karachi", "Hyderabad"] } }),
        option("eq", 'city: { $eq: "Karachi" }', "Karachi only", { city: { $eq: "Karachi" } })
      ] },
      { id: "activity", prompt: "Require active accounts", correctId: "true", options: [
        option("true", "active: true", "Only active", { active: true }),
        option("false", "active: false", "Only inactive", { active: false }),
        option("none", "active: { $exists: true }", "Any stored activity state", { active: { $exists: true } })
      ] }
    ]
  },
  {
    id: "alternatives",
    title: "The OR Challenge",
    chapter: "02 · Combine conditions",
    difficulty: "Builder",
    source: "users",
    mode: "filter",
    mission: "A recruiter wants people with excellent scores, or people over age 30.",
    objective: "Find users with score >= 85 OR age > 30.",
    concept: "$or matches when at least one branch is true; $and requires every branch.",
    hint: "One condition OR the other is enough. Pick $or with the correct boundaries.",
    solution: "Ali, Sara, and Hira pass one of the conditions. Ayan passes neither.",
    slots: [{ id: "boolean", prompt: "Choose the logical expression", correctId: "or", options: [
      option("and", '$and: [{ score: { $gte: 85 } }, { age: { $gt: 30 } }]', "Both tests must be true", { $and: [{ score: { $gte: 85 } }, { age: { $gt: 30 } }] }),
      option("or", '$or: [{ score: { $gte: 85 } }, { age: { $gt: 30 } }]', "Either test can pass", { $or: [{ score: { $gte: 85 } }, { age: { $gt: 30 } }] }),
      option("nor", '$nor: [{ score: { $gte: 85 } }, { age: { $gt: 30 } }]', "Neither test may pass", { $nor: [{ score: { $gte: 85 } }, { age: { $gt: 30 } }] })
    ] }]
  },
  {
    id: "arrays",
    title: "The Skills Scanner",
    chapter: "02 · Combine conditions",
    difficulty: "Builder",
    source: "users",
    mode: "filter",
    mission: "Your team needs a developer who knows both React and MongoDB.",
    objective: "Find users whose skills array contains React AND MongoDB.",
    concept: "$all checks that every requested item is present in an array.",
    hint: "Use $all to require both skills, not $in which allows either.",
    solution: "Only Ali has both skills. $in would also match other users who know only one of them.",
    slots: [{ id: "skills", prompt: "Which array operator?", correctId: "all", options: [
      option("all", 'skills: { $all: ["React", "MongoDB"] }', "Requires both elements", { skills: { $all: ["React", "MongoDB"] } }),
      option("in", 'skills: { $in: ["React", "MongoDB"] }', "Either element can match", { skills: { $in: ["React", "MongoDB"] } }),
      option("size", "skills: { $size: 2 }", "Just checks number of elements", { skills: { $size: 2 } })
    ] }]
  },
  {
    id: "paid-orders",
    title: "The Highest-Paid Order",
    chapter: "03 · Build a pipeline",
    difficulty: "Builder",
    source: "orders",
    mode: "pipeline",
    mission: "The finance screen needs the largest fully paid order, not just the largest order.",
    objective: "First filter PAID orders, then sort by total descending, then limit to one.",
    concept: "Aggregation stages run from top to bottom. $match removes unwanted rows, $sort orders them, and $limit keeps the first.",
    hint: "The correct sequence is $match → $sort → $limit.",
    solution: "Order #13 (1200) comes first among PAID orders. The pending order cannot enter the ranking.",
    slots: [
      { id: "first", prompt: "Step 1 · Filter", correctId: "match", options: [
        option("match", '$match: { status: "PAID" }', "Only paid documents", { $match: { status: "PAID" } }),
        option("pending", '$match: { status: "PENDING" }', "Pending orders only", { $match: { status: "PENDING" } }),
        option("limit", "$limit: 1", "Limits before filtering", { $limit: 1 })
      ] },
      { id: "second", prompt: "Step 2 · Arrange", correctId: "desc", options: [
        option("asc", "$sort: { total: 1 }", "Cheapest first", { $sort: { total: 1 } }),
        option("desc", "$sort: { total: -1 }", "Highest total first", { $sort: { total: -1 } }),
        option("skip", "$skip: 1", "Discard first record", { $skip: 1 })
      ] },
      { id: "third", prompt: "Step 3 · Reduce results", correctId: "one", options: [
        option("one", "$limit: 1", "Keep only the top order", { $limit: 1 }),
        option("two", "$limit: 2", "Keep two orders", { $limit: 2 }),
        option("skip", "$skip: 1", "Skip the highest result", { $skip: 1 })
      ] }
    ]
  },
  {
    id: "group-count",
    title: "Count by Department",
    chapter: "03 · Build a pipeline",
    difficulty: "Expert",
    source: "users",
    mode: "pipeline",
    mission: "An HR dashboard needs one row per department with a count of users.",
    objective: "Group users by department and count each with $sum: 1.",
    concept: "$group outputs one document per key. $sum: 1 counts rows rather than summing a field.",
    hint: "Group on '$department'; a numeric 1 added per row counts documents.",
    solution: "Engineering and Support each contain 2 users in our sample.",
    slots: [{ id: "group", prompt: "Pick the correct aggregation", correctId: "department", options: [
      option("department", '$group: { _id: "$department", count: { $sum: 1 } }', "Count rows per department", { $group: { _id: "$department", count: { $sum: 1 } } }),
      option("salary", '$group: { _id: "$department", count: { $sum: "$salary" } }', "Sum salary values, not rows", { $group: { _id: "$department", count: { $sum: "$salary" } } }),
      option("city", '$group: { _id: "$city", count: { $sum: 1 } }', "Count by city instead", { $group: { _id: "$city", count: { $sum: 1 } } })
    ] }]
  },
  {
    id: "salary-projection",
    title: "Calculate Annual Pay",
    chapter: "03 · Build a pipeline",
    difficulty: "Expert",
    source: "users",
    mode: "pipeline",
    mission: "Your reporting team stores monthly salary but wants an annual total displayed.",
    objective: "Project each name and annualSalary = salary × 12.",
    concept: "$project can calculate new values using expressions; $multiply multiplies numbers.",
    hint: "Use $project with annualSalary: { $multiply: ['$salary', 12] }.",
    solution: "Each row keeps its name and calculates annualSalary without modifying stored salary.",
    slots: [{ id: "project", prompt: "Choose the calculated field", correctId: "multiply", options: [
      option("multiply", '$project: { _id: 0, name: 1, annualSalary: { $multiply: ["$salary", 12] } }', "Multiply monthly salary by 12", { $project: { _id: 0, name: 1, annualSalary: { $multiply: ["$salary", 12] } } }),
      option("add", '$project: { _id: 0, name: 1, annualSalary: { $add: ["$salary", 12] } }', "Adds 12 instead", { $project: { _id: 0, name: 1, annualSalary: { $add: ["$salary", 12] } } }),
      option("divide", '$project: { _id: 0, name: 1, annualSalary: { $divide: ["$salary", 12] } }', "Divides monthly salary", { $project: { _id: 0, name: 1, annualSalary: { $divide: ["$salary", 12] } } })
    ] }]
  },
  {
    id: "unwind-cart",
    title: "The Cart Explosion",
    chapter: "04 · Advanced mastery",
    difficulty: "Expert",
    source: "orders",
    mode: "pipeline",
    mission: "An invoice has an array of products. Produce a total sold quantity for each SKU.",
    objective: "Unwind items, then group by items.sku and sum items.qty.",
    concept: "$unwind turns each array item into its own pipeline row. After that, $group collects quantities by SKU.",
    hint: "First $unwind '$items', then $group on '$items.sku' summing '$items.qty'.",
    solution: "SKU A1 totals 5 units and B2 totals 1. Without unwind, quantities are nested arrays rather than item rows.",
    slots: [
      { id: "unwind", prompt: "Step 1 · Expand the array", correctId: "items", options: [
        option("items", '$unwind: "$items"', "One row per item", { $unwind: "$items" }),
        option("users", '$match: { status: "PAID" }', "Filter paid orders instead", { $match: { status: "PAID" } }),
        option("limit", "$limit: 1", "Leave only one order", { $limit: 1 })
      ] },
      { id: "group", prompt: "Step 2 · Count by SKU", correctId: "sku", options: [
        option("sku", '$group: { _id: "$items.sku", units: { $sum: "$items.qty" } }', "Sum quantity by SKU", { $group: { _id: "$items.sku", units: { $sum: "$items.qty" } } }),
        option("orders", '$group: { _id: "$_id", units: { $sum: 1 } }', "Group by order ID instead", { $group: { _id: "$_id", units: { $sum: 1 } } }),
        option("total", '$group: { _id: "$items.sku", units: { $sum: "$total" } }', "Sum order totals instead", { $group: { _id: "$items.sku", units: { $sum: "$total" } } })
      ] }
    ]
  },
  {
    id: "revenue",
    title: "The Revenue Boss",
    chapter: "04 · Advanced mastery",
    difficulty: "Expert",
    source: "orders",
    mode: "pipeline",
    mission: "It's reporting time. Calculate revenue per customer from PAID orders and rank the highest spender.",
    objective: "Use $match → $group with $sum → $sort descending.",
    concept: "Filtering before grouping avoids counting pending payments as revenue. Grouping summarizes each user; sorting ranks the totals.",
    hint: "First exclude pending orders, then group by '$userId' summing '$total', then sort by revenue descending.",
    solution: "User #2 spent 1200, user #1 spent 500. The 800 pending order is excluded.",
    slots: [
      { id: "match", prompt: "Step 1 · Which orders?", correctId: "paid", options: [
        option("paid", '$match: { status: "PAID" }', "Only paid orders", { $match: { status: "PAID" } }),
        option("pending", '$match: { status: "PENDING" }', "Only pending orders", { $match: { status: "PENDING" } }),
        option("nothing", "$sort: { total: -1 }", "Sort without filtering", { $sort: { total: -1 } })
      ] },
      { id: "group", prompt: "Step 2 · Revenue formula", correctId: "sum", options: [
        option("sum", '$group: { _id: "$userId", revenue: { $sum: "$total" } }', "Sum paid totals per user", { $group: { _id: "$userId", revenue: { $sum: "$total" } } }),
        option("avg", '$group: { _id: "$userId", revenue: { $avg: "$total" } }', "Average each user's orders instead", { $group: { _id: "$userId", revenue: { $avg: "$total" } } }),
        option("count", '$group: { _id: "$userId", revenue: { $sum: 1 } }', "Count order rows, not revenue", { $group: { _id: "$userId", revenue: { $sum: 1 } } })
      ] },
      { id: "sort", prompt: "Step 3 · Rank customers", correctId: "high", options: [
        option("high", "$sort: { revenue: -1 }", "Highest revenue first", { $sort: { revenue: -1 } }),
        option("low", "$sort: { revenue: 1 }", "Lowest revenue first", { $sort: { revenue: 1 } }),
        option("limit", "$limit: 1", "Keep first without sorting", { $limit: 1 })
      ] }
    ]
  }
];

export function compileQuest(level: QuestLevel, picked: Record<string, string>) {
  const fragments = level.slots.map(slot => {
    const choice = slot.options.find(option => option.id === picked[slot.id]);
    if (!choice) throw new Error("Choose one option for every step before running.");
    return choice.fragment;
  });
  return level.mode === "filter"
    ? { collection: level.source, filter: fragments.length === 1 ? fragments[0] : { $and: fragments } }
    : { collection: level.source, filter: {}, pipeline: fragments };
}
