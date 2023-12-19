type Category = "x" | "m" | "a" | "s";
type Operation = "<" | ">";
type Game = {
  workflows: Record<string, Workflow[]>;
  items: Item[];
};
type Comparison = {
  category: Category;
  operation: Operation;
  comparator: number;
  destination: string;
};
type Default = {
  destination: string;
};
type Workflow = Comparison | Default;
type Item = Record<Category, number>;

function parseWorkflow(contents: string): Workflow[] {
  return contents.split(",").map((item) => {
    if (!item.includes(":")) {
      return { destination: item };
    }

    const category = item[0] as Category;
    const operation = item[1] as Operation;
    const [c, destination] = item.slice(2).split(":");
    const comparator = Number(c);
    return { category, operation, comparator, destination };
  });
}

function parseWorkflows(contents: string): Record<string, Workflow[]> {
  return contents.split("\n").reduce((acc, line) => {
    const [name, rest] = line.slice(0, -1).split("{"); // remove trailing }
    return { ...acc, [name]: parseWorkflow(rest) };
  }, {});
}

function parseItems(contents: string): Item[] {
  return contents.split("\n").map((line) => {
    const [x, m, a, s] = line
      .slice(1, -1)
      .split(",")
      .map((item) => Number(item.split("=")[1]));
    return { x, m, a, s }; // cute
  });
}

function parse(contents: string): Game {
  const [w, i] = contents.split("\n\n");
  const workflows = parseWorkflows(w);
  const items = parseItems(i);
  return { workflows, items };
}

function itemSum(item: Item) {
  return item.x + item.m + item.a + item.s;
}

function isMatch(item: Item, workflow: Workflow) {
  if (!("category" in workflow)) return true;

  const { category, operation, comparator } = workflow;
  return operation === "<"
    ? item[category] < comparator
    : item[category] > comparator;
}

function accepted(
  item: Item,
  workflows: Record<string, Workflow[]>,
  current = "in"
) {
  const possibleMatches = workflows[current];
  for (const workflow of possibleMatches) {
    if (isMatch(item, workflow)) {
      const { destination } = workflow;
      if (destination === "A") return true;
      if (destination === "R") return false;
      return accepted(item, workflows, destination);
    }
  }
}

function part1(game: Game): number {
  const { workflows, items } = game;
  return items.reduce(
    (acc, item) => (accepted(item, workflows) ? acc + itemSum(item) : acc),
    0
  );
}

async function main() {
  let filename = Bun.argv[2] ?? "data/test.txt";
  let contents = await Bun.file(filename).text();
  let parsed = parse(contents);
  console.log(part1(parsed));
}

main();
