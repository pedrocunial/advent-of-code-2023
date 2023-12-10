const MOVES = [
  { x: -1, y: -1 },
  { x: 0, y: -1 },
  { x: 1, y: -1 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: -1, y: 1 },
  { x: 0, y: 1 },
  { x: 1, y: 1 },
] as const;

type Coordinate = { x: number; y: number };
type Move = (typeof MOVES)[number];
type Direction = "left" | "right" | "top" | "bottom";
type PipedThrough = Move & { direction: Direction };
type Pipe = "|" | "-" | "L" | "J" | "7" | "F";
type BoardKeys = Pipe | "S" | ".";
type PipeOptions = Partial<Record<Direction, PipedThrough>>;
type Board = BoardKeys[][];
type DirectedMove = Coordinate & { direction: Direction };

// part 2
type Wall = 1;
type Ground = 0;
type LoopBoardTile = Wall | Ground;
type LoopBoard = LoopBoardTile[][];

const PIPES: Record<Pipe, PipeOptions> = {
  "|": {
    top: { x: 0, y: 1, direction: "top" },
    bottom: { x: 0, y: -1, direction: "bottom" },
  },
  "-": {
    right: { x: -1, y: 0, direction: "right" },
    left: { x: 1, y: 0, direction: "left" },
  },
  L: {
    top: { x: 1, y: 0, direction: "left" },
    right: { x: 0, y: -1, direction: "bottom" },
  },
  J: {
    top: { x: -1, y: 0, direction: "right" },
    left: { x: 0, y: -1, direction: "bottom" },
  },
  "7": {
    bottom: { x: -1, y: 0, direction: "right" },
    left: { x: 0, y: 1, direction: "top" },
  },
  F: {
    bottom: { x: 1, y: 0, direction: "left" },
    right: { x: 0, y: 1, direction: "top" },
  },
} as const;

function parse(contents: string): Board {
  return contents.split("\n").map((line) => line.split("") as BoardKeys[]);
}

function diffToDirection(x: number, y: number): Direction {
  if (x === 0 && y === -1) return "bottom";
  if (x === 0 && y === 1) return "top";
  if (x === -1 && y === 0) return "right";
  if (x === 1 && y === 0) return "left";
  throw new Error(`invalid diff: ${x}, ${y}`);
}

function findStart(board: Board): Coordinate {
  for (let y = 0; y < board.length; y++) {
    let row = board[y];
    for (let x = 0; x < row.length; x++) {
      if (row[x] === "S") return { x, y };
    }
  }
  throw new Error("no start found");
}

function firstMove(board: Board, start: Coordinate): DirectedMove {
  for (let y of [-1, 0, 1]) {
    for (let x of [-1, 0, 1]) {
      if (y === 0 && x === 0) continue;
      if (!(x === 0 || y === 0)) continue; // can only move in one direction
      const curr = { x: start.x + x, y: start.y + y };
      if (curr.x < 0 || curr.y < 0) continue;
      const pipe = board[curr.y][curr.x];
      const direction = diffToDirection(x, y);
      if (!PIPES[pipe][direction]) continue;

      if (pipe && pipe !== ".") return { ...curr, direction };
    }
  }

  throw new Error(`no moves found for ${JSON.stringify(start)}`);
}

function nextPipe(curr: DirectedMove, board: Board): DirectedMove {
  const pipe = board[curr.y][curr.x];
  if (pipe === ".")
    throw new Error(`invalid pipe on coordinates ${JSON.stringify(curr)}`);

  const options = PIPES[pipe as Pipe];
  if (!options) throw new Error(`no options found for ${pipe}`);

  const diff = options[curr.direction];

  if (!diff)
    throw new Error(
      `no next pipe found for ${JSON.stringify(curr)} in direction ${
        curr.direction
      } and tile ${pipe}`
    );

  return {
    x: curr.x + diff.x,
    y: curr.y + diff.y,
    direction: diff.direction,
  };
}

function compareCoordinates(a: Coordinate, b: Coordinate): boolean {
  return a.x === b.x && a.y === b.y;
}

function checkVertical(
  from: number,
  to: number,
  x: number,
  board: Board
): number {
  let count = 0;
  for (let y = from; y < to; y++) {
    if (board[y][x] === "-") count++;
  }
  return count;
}

function checkHorizontal(
  from: number,
  to: number,
  y: number,
  board: Board
): number {
  let count = 0;
  for (let x = from; x < to; x++) {
    if (board[y][x] === "|") count++;
  }
  return count;
}

function isEnclosed(x: number, y: number, board: Board): number {
  if (y <= 0 || y >= board.length - 1 || x <= 0 || x >= board[0].length)
    return 0;
  if (board[y][x] !== ".") return 0;
  // defined by having an odd number of | or - around each direction
  return [
    checkVertical(0, y - 1, x, board), // above
    checkVertical(y + 1, board.length, x, board), // below
    checkHorizontal(0, x - 1, y, board), // left
    checkHorizontal(x + 1, board[0].length, y, board), // right
  ].some((count) => count % 2 === 1)
    ? 1
    : 0;
}

function part1(board: Board): number {
  // find S
  const start = findStart(board);
  let curr = firstMove(board, start);
  let steps = 1;
  // cycle until back at S
  while (!compareCoordinates(start, curr)) {
    steps++;
    curr = nextPipe(curr, board);
  }
  // return steps / 2
  return steps / 2;
}

function baseLoopBoard(board: Board, filler: LoopBoardTile = 0): LoopBoard {
  const rowLength = board[0].length + 2;
  const result = [];
  for (let i = 0; i < board.length + 2; i++) {
    result[i] = [];
    for (let j = 0; j < rowLength; j++) {
      result[i][j] = filler;
    }
  }
  return result;
}

const toKey = (x: number, y: number) => `${x},${y}`;

function dfs(
  board: LoopBoard,
  y: number,
  x: number,
  visited: Set<string>
): number {
  if (
    visited.has(toKey(x, y)) ||
    x < 0 ||
    x >= board[0].length ||
    y < 0 ||
    y >= board.length
  )
    return 0;
  if (board[y][x] !== 0) return 0;

  visited.add(toKey(x, y));
  return (
    1 +
    dfs(board, y - 1, x, visited) +
    dfs(board, y + 1, x, visited) +
    dfs(board, y, x - 1, visited) +
    dfs(board, y, x + 1, visited)
  );
}

function findLoop(board: Board): Coordinate[] {
  const loop: Coordinate[] = [];
  const start = findStart(board);
  loop.push({ x: start.x, y: start.y });

  let curr = firstMove(board, start);
  let steps = 1;
  while (!compareCoordinates(start, curr)) {
    loop.push({ x: curr.x, y: curr.y });

    steps++;
    curr = nextPipe(curr, board);
  }
  return loop;
}

function buildLoopBoard(board: Board): LoopBoard {
  const loopCoords = findLoop(board);
  // add padding
  const loopBoard = baseLoopBoard(board);
  for (const { x, y } of loopCoords) {
    loopBoard[y + 1][x + 1] = 1;
  }

  // dbg
  board.forEach((line, i) =>
    line.forEach((tile, j) => {
      if (tile !== "." && loopBoard[i + 1][j + 1] === 0)
        console.log("mismatch");
      if (tile === "." && loopBoard[i + 1][j + 1] !== 0)
        console.log("positive mismatch");
    })
  );

  return loopBoard;
}

function part2(board: Board): number {
  // update board to only contain the loop
  const loopBoard = buildLoopBoard(board);
  // dfs from (0, 0) until non '.'
  const totalArea = loopBoard.length * loopBoard[0].length;
  const padding = (loopBoard[0].length + 2) * 2 + loopBoard.length * 2;
  const visited = new Set<string>();
  const outterArea = dfs(loopBoard, 0, 0, visited);
  const wallArea = board.reduce(
    (acc, line) => acc + line.filter((x) => x !== ".").length,
    0
  );

  // return area(withPadding) - dfs() - area(wall) - padding
  console.log(
    loopBoard.join("\n"),
    visited.size,
    loopBoard.length,
    loopBoard[0].length
  );
  return totalArea - outterArea - wallArea;
}

async function main() {
  let filename = Bun.argv[2] ?? "data/test.txt";
  let contents = await Bun.file(filename).text();
  let parsed = parse(contents);
  console.log("part 1: ", part1(parsed));
  console.log("part 2: ", part2(parsed));
}

main();
