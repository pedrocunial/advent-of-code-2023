import sys
from collections.abc import Collection, Iterable
from dataclasses import dataclass
from pprint import pprint


@dataclass
class Map:
    source_range: Iterable[int]
    dest: int

    def to_dest(self, seed: int) -> int:
        beg = self.source_range[0]
        diff = seed - beg
        return self.dest + diff


@dataclass
class Almanac:
    source_name: str
    dest_name: str
    maps: list[Map]

    def map(self, seed: int) -> int:
        match = [m for m in self.maps if seed in m.source_range]
        if match:
            return match[0].to_dest(seed)
        return seed


@dataclass
class Game:
    seeds: Collection[int]
    almanacs: Collection[Almanac]


@dataclass
class Game2:
    seeds: Collection[Iterable[int]]
    almanacs: Collection[Almanac]


def parse_map(line: list[str]) -> Map:
    dest_start, source_start, size = [int(s) for s in line]
    return Map(source_range=range(source_start, source_start + size), dest=dest_start)


def parse_almanac(lines: list[str]) -> Almanac:
    title = lines[0].split()[0].split("-")
    maps = [parse_map(l.split()) for l in lines[1:]]
    return Almanac(source_name=title[0], dest_name=title[2], maps=maps)


def parse_almanacs(maps: list[str]) -> list[Almanac]:
    return [parse_almanac(m.splitlines()) for m in maps]


def seeds_to_list_range(a: int, b: int) -> Iterable[int]:
    return range(a, a + b)


def parse_seeds_part2(nums: list[int]) -> list[int]:
    return [seeds_to_list_range(nums[i], nums[i + 1]) for i in range(0, len(nums), 2)]


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


def part2(game: Game2) -> int:
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


fname = "data/input.txt"
with open(fname, "r") as fin:
    contents = fin.read()

parsed = parse(contents)
result = part1(parsed)
print(result)
parsed2 = parse2(contents)
result2 = part2(parsed2)
print(parsed2)
print(result2)
