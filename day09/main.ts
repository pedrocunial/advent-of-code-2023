function parse(contents: string): number[][] {
  return contents
    .split("\n")
    .map((line) => line.split(" ").map((n) => Number(n.trim())));
}

function reverseExtrapolate(sequence: number[]): number {
  if (sequence.every((n) => n === 0)) return 0;

  const diffs = sequence.slice(1).map((n, i) => n - sequence[i]);
  return sequence[0] - reverseExtrapolate(diffs);
}

// in reality, we're just seeking for the function that this
// sequence represents, but let's follow the instructions
function extrapolate(sequence: number[]): number {
  if (sequence.every((n) => n === 0)) return 0;

  const diffs = sequence.slice(1).map((n, i) => n - sequence[i]);
  return sequence[sequence.length - 1] + extrapolate(diffs);
}

function part1(input: number[][]): number {
  return input.map(extrapolate).reduce((a, b) => a + b, 0);
}

function part2(input: number[][]): number {
  return input.map(reverseExtrapolate).reduce((a, b) => a + b, 0);
}

async function main() {
  let filename = Bun.argv[2] ?? "data/test.txt";
  let contents = await Bun.file(filename).text();
  let parsed = parse(contents);
  console.log("part 1: ", part1(parsed));
  console.log("part 2: ", part2(parsed));
}

main();
