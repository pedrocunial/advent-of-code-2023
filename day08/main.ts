type Move = {
  current: string;
  next: Move;
};

type Node = {
  name: string;
  left: Node;
  right: Node;
};

type Game = {
  node: Node;
  move: Move;
};

type SpookyGame = {
  nodes: Node[];
  move: Move;
};

const STR_TO_MOVE_NAME: Record<string, string> = {
  L: "left",
  R: "right",
};

function printMoves(move: Move) {
  const seen = new Set();
  let curr = move;
  let moves = "";
  while (!seen.has(curr)) {
    moves += curr.current + ",";
    seen.add(curr);
    curr = curr.next;
  }
  console.log(moves);
}

function parseMoves(rawMoves: string[]): Move {
  const moves = [];
  let prev = null;
  for (const rawMove of rawMoves) {
    const current = STR_TO_MOVE_NAME[rawMove];
    if (!current) throw new Error(`invalid move: ${rawMove}`);

    const move = { current };
    if (prev) {
      prev.next = move;
    }

    prev = move;
    moves.push(move);
  }
  // assign first after last
  prev.next = moves[0];
  return moves[0];
}

function parseNodeLine(line: string): [string, string, string] {
  const [rawName, rest] = line.split(" = ");
  const name = rawName.trim();
  const [left, right] = rest
    .split(",")
    .map((s) => s.replace(/\(|\)/, "").trim());

  return [name, left, right];
}

function buildNodeMap(nodes: string[]): Record<string, Node> {
  const parsedLines = nodes.map(parseNodeLine);
  const nodeMap = parsedLines.reduce(
    (acc, [name, ..._rest]) => ({ ...acc, [name]: { name } }),
    {}
  );
  for (const [name, left, right] of parsedLines) {
    const node = nodeMap[name];
    node.left = nodeMap[left];
    node.right = nodeMap[right];
  }

  return nodeMap;
}

function parseNodes(nodes: string[], startingPosition: string = "AAA"): Node {
  return buildNodeMap(nodes)[startingPosition];
}

function parseSpookyNodes(nodes: string[], endingChar: string = "A"): Node[] {
  const map = buildNodeMap(nodes);

  return Object.keys(map)
    .filter((name) => name.endsWith(endingChar))
    .map((name) => map[name]);
}

function parse(contents: string): Game {
  const [moves, _, ...nodes] = contents.split("\n");
  const initialMove = parseMoves(moves.split(""));
  const initialNode = parseNodes(nodes);

  return { move: initialMove, node: initialNode };
}

function parseSpookyGame(contents: string): SpookyGame {
  const [moves, _, ...nodes] = contents.split("\n");
  const initialMove = parseMoves(moves.split(""));
  const initialNodes = parseSpookyNodes(nodes);

  return { move: initialMove, nodes: initialNodes };
}

function gcd(a: number, b: number): number {
  return a === 0 ? b : gcd(b % a, a);
}

function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}
function part2IndividualCompletion(name: string): boolean {
  return name.endsWith("Z");
}

function part2(game: SpookyGame, goal: string = "Z"): number {
  // this can be solved by find the LCM of the number of moves for each node (MMC for by BR folks)
  let moveCounter = 0;
  let { nodes, move } = game;
  const multipliers = nodes.map((node) =>
    part1({ node, move }, part2IndividualCompletion)
  );
  let curr = Math.max(...multipliers);
  const max = multipliers.reduce((acc, curr) => acc * curr, 1);
  // a bit brute forcey
  while (!multipliers.every((m) => curr % m === 0)) {
    curr++;
    if (curr > max) throw new Error("no solution");
  }

  return curr;
}

function part2Fast(game: SpookyGame, goal: string = "Z"): number {
  // this can be solved by find the LCM of the number of moves for each node (MMC for by BR folks)
  let { nodes, move } = game;
  const multipliers = nodes.map((node) =>
    part1({ node, move }, part2IndividualCompletion)
  );
  return multipliers.reduce((acc, curr) => lcm(acc, curr), 1);
}

function part1Completed(name: string): boolean {
  return name === "ZZZ";
}

function part1(
  game: Game,
  isCompleted: (name: string) => boolean = part1Completed
): number {
  let moveCounter = 0;
  let { node, move } = game;
  while (!isCompleted(node.name)) {
    moveCounter++;
    node = node[move.current];
    move = move.next;
  }

  return moveCounter;
}

async function main() {
  let filename = Bun.argv[2] ?? "data/test.txt";
  let contents = await Bun.file(filename).text();
  let parsed = parse(contents);
  console.log("part 1: ", part1(parsed));

  filename = Bun.argv[3] ?? "data/test_part2.txt";
  contents = await Bun.file(filename).text();
  const spokyParsed = parseSpookyGame(contents);
  console.log("part 2: ", part2Fast(spokyParsed));
}

main();
