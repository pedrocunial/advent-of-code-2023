type Input = {
  time: readonly number[];
  distance: readonly number[];
};

type Race = {
  time: number;
  distance: number;
};

function parseLine(line: string): readonly number[] {
  return line
    .split(":")[1]
    .split(" ")
    .filter((x) => x) // remove empty strings
    .map(Number);
}

function parse(contents: string): Input {
  const [timeLine, distanceLine] = contents.split("\n");
  return {
    time: parseLine(timeLine),
    distance: parseLine(distanceLine),
  } as const;
}

function score({ time, distance }: Race): number {
  // prolly a binary search would o better here
  let result = 0;
  // prolly could be array method?
  let matched = false;
  for (let i = 0; i < time; i++) {
    const timeLeft = time - i;
    if (i * timeLeft > distance) {
      result++;
    }
  }
  return result;
}

function part1(input: Input): number {
  let races = input.distance.map(
    (distance, idx) => ({ distance, time: input.time[idx] } as Race)
  );

  return races
    .map(score)
    .filter((x) => x)
    .reduce((x, y) => x * y, 1);
}

function parse2(input: Input): Race {
  let raw = input.distance
    .map((distance, idx) => ({
      distance: distance + "",
      time: input.time[idx] + "",
    }))
    .reduce((acc, curr) => ({
      time: acc.time + curr.time,
      distance: acc.distance + curr.distance,
    }));
  return { distance: Number(raw.distance), time: Number(raw.time) };
}

function part2(input: Input): number {
  const race = parse2(input);
  return score(race);
}

async function main() {
  const filename = Bun.argv[2] ?? "data/test.txt";
  const contents = await Bun.file(filename).text();
  const parsed = parse(contents);
  console.log("part 1:", part1(parsed));
  console.log("part 2:", part2(parsed));
}

main();
