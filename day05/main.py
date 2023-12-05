import sys
from collections.abc import Collection, Iterable
from dataclasses import dataclass


@dataclass
class Map:
    beg: int
    end: int
    dest: int

    def in_range(self, seed: int) -> bool:
        return self.beg <= seed < self.end

    def to_dest(self, seed: int) -> int:
        diff = seed - self.beg
        return self.dest + diff

    def range_to_dest(self, seed_beg, seed_end) -> (int, int):
        """
        self: (1, 10), dest: 44 -- input: (3, 5) -- output: (46, 48)
        """
        diff = seed_beg - self.beg
        starting_point = diff + self.dest
        size = seed_end - seed_beg
        return starting_point, starting_point + size

    def intersect(self, seed: (int, int)) -> (int, int):
        sb, se = seed
        b = max(sb, self.beg)
        e = min(se, self.end)
        if b < e:
            return b, e
        return None


@dataclass
class Almanac:
    source_name: str
    dest_name: str
    maps: list[Map]

    def map(self, seed: int) -> int:
        match = [m for m in self.maps if m.in_range(seed)]
        if match:
            return match[0].to_dest(seed)
        return seed

    def map_intersect(self, seeds: (int, int)):
        """this is sheet"""
        intersections = []
        for m in self.maps:
            intersection = m.intersect(seeds)
        return None


@dataclass
class Game:
    seeds: Collection[int]
    almanacs: Collection[Almanac]


@dataclass
class Game2:
    seeds: Collection[(int, int)]
    almanacs: Collection[Almanac]


def parse_map(line: list[str]) -> Map:
    dest_start, source_start, size = [int(s) for s in line]
    return Map(beg=source_start, end=size + source_start, dest=dest_start)


def parse_almanac(lines: list[str]) -> Almanac:
    title = lines[0].split()[0].split("-")
    maps = [parse_map(l.split()) for l in lines[1:]]
    return Almanac(source_name=title[0], dest_name=title[2], maps=maps)


def parse_almanacs(maps: list[str]) -> list[Almanac]:
    return [parse_almanac(m.splitlines()) for m in maps]


def parse_seeds_part2(nums: list[int]) -> list[int]:
    return {(nums[i], nums[i + 1] + nums[i]) for i in range(0, len(nums), 2)}


def parse(contents: str) -> Game:
    scenarios = contents.split("\n\n")
    seeds = [int(s) for s in scenarios[0].split(": ")[1].split()]
    almanacs = parse_almanacs(scenarios[1:])
    return Game(seeds, almanacs)


def parse2(contents: str) -> Game2:
    scenarios = contents.split("\n\n")
    seeds = parse_seeds_part2([int(s) for s in scenarios[0].split(": ")[1].split()])
    almanacs = parse_almanacs(scenarios[1:])
    return Game2(seeds, almanacs)


def part1(game: Game) -> int:
    min_s = sys.maxsize
    for seed in game.seeds:
        s = seed
        for almanac in game.almanacs:
            s = almanac.map(s)
        if s < min_s:
            min_s = s
    return min_s


def part2_ranges_test(game: Game2) -> int:
    results = []
    for seed_range in game.seeds:
        ranges = [seed_range]
        for almanac in game.almanacs:
            new_range = []
            for r in ranges:
                result = almanac.map_intersect(r)
                if result:
                    m, intersect = result
                    new_range.append(m.range_to_dest(*intersect))  # transformed range
                    if intersect[0] > r[0]:  # range before
                        new_range.append((r[0], intersect[0]))
                    if intersect[1] < r[1]:  # range after
                        new_range.append((intersect[1], r[1]))
                else:
                    new_range.append(r)
            ranges = new_range
        for r in ranges:
            results.append(r)

    return min(r[0] for r in results)


def part2_old(game: Game2) -> int:
    min_s = sys.maxsize
    visited = set()
    for seed_range in game.seeds:
        for seed in seed_range:
            if seed in visited:
                continue
            visited.add(seed)
            s = seed
            for almanac in game.almanacs:
                s = almanac.map(s)
            if s < min_s:
                min_s = s
    return min_s


def part2(game: Game2) -> int:
    current_seeds = [*game.seeds]  # copy
    for almanac in game.almanacs:
        next_level = []
        for s in current_seeds:
            matched = False
            for m in almanac.maps:
                intersect = m.intersect(s)
                if intersect:
                    matched = True
                    next_level.append(m.range_to_dest(*intersect))
                    if intersect[0] > s[0]:  # range before
                        current_seeds.append((s[0], intersect[0]))
                    if intersect[1] < s[1]:  # range after
                        current_seeds.append((intersect[1], s[1]))
                    # the maps don't overlap, if the reminder were to still match,
                    # they would match in another iteration
                    break
            if not matched:
                # TIL you could use else to catch a for loop that didn't break
                next_level.append(s)
        current_seeds = next_level
    return min(r[0] for r in current_seeds)


def main():
    fname = "data/input.txt"
    with open(fname, "r") as fin:
        contents = fin.read()

    parsed = parse(contents)
    result = part1(parsed)
    print(result)
    parsed2 = parse2(contents)
    result2 = part2(parsed2)
    print(result2)


if __name__ == "__main__":
    main()
