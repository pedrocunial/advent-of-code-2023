import re
from collections import defaultdict
from dataclasses import dataclass

CARD_REGEX = r"Card\s*(\d+): "


@dataclass
class Match:
    number: int
    player: set[int]
    expected: set[int]


class Part2:
    def __init__(self, line: list[str]):
        self.cards = defaultdict(int)
        self.matches = [parse_line1(line) for line in lines]

    def play(self, idx: int) -> int:
        if idx >= len(self.matches):
            return 0
        self.cards[idx] += 1
        current_match = self.matches[idx]
        counter = sum(
            1 for card in current_match.player if card in current_match.expected
        )
        i = idx + 1
        while counter > 0:
            self.play(i)
            i += 1
            counter -= 1

    def run(self):
        for i in range(len(self.matches)):
            self.play(i)
        return sum(v for v in self.cards.values())


def parse_line1(line: str):
    game_number = int(re.match(CARD_REGEX, line).group(1))
    _, plays = line.split(": ")
    e, p = plays.split("| ")
    player = {int(x.strip()) for x in p.split(" ") if x.strip()}
    expected = {int(x.strip()) for x in e.split(" ") if x.strip()}
    return Match(game_number, player, expected)


def play1(match: Match) -> int:
    points = 0
    multiplier = 2
    for card in match.player:
        if card in match.expected:
            points = 1 if points == 0 else points * multiplier
    return points


def part1(lines: list[str]) -> int:
    matches = [parse_line1(line) for line in lines]
    return sum(play1(match) for match in matches)


filename = "data/input.txt"
with open(filename, "r") as fin:
    lines = fin.readlines()

print(part1(lines))
part2 = Part2(lines)
print(part2.run())
