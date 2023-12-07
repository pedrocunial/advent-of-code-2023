const SUITS = [
  "A",
  "K",
  "Q",
  "J",
  "T",
  "9",
  "8",
  "7",
  "6",
  "5",
  "4",
  "3",
  "2",
] as const;
type Suit = (typeof SUITS)[number];
const SUITS2 = [...SUITS.filter((x) => x != "J"), "J"] as const;

const PLAY_RANKINGS = [
  "five of a kind",
  "four of a kind",
  "full house",
  "three of a kind",
  "two pair",
  "one pair",
  "high card",
] as const;
type PlayRanking = (typeof PLAY_RANKINGS)[number];
const NUM_TO_PLAY_RANKING: Record<number, PlayRanking[]> = {
  5: ["five of a kind"],
  4: ["four of a kind"],
  3: ["three of a kind", "full house"],
  2: ["one pair", "two pair"],
  1: ["high card"],
};

// there has to be a better way :cry:
const PLAY_RANKINGS_TO_NUM: Record<PlayRanking, number> =
  PLAY_RANKINGS.toReversed()
    .map((play, idx) => [play, idx] as const)
    .reduce(
      (acc, [play, idx]) => ({ ...acc, [play]: idx } as const),
      {} as Record<PlayRanking, number>
    );

type Play = {
  hand: Suit[]; // for dbg
  bid: number;
  ranking: number;
};

class Input {
  hand: Suit[];
  bid: number;

  constructor(hand: Suit[], bid: number) {
    this.hand = hand;
    this.bid = bid;
  }

  toPlay(): Play {
    return {
      hand: this.hand,
      bid: this.bid,
      ranking: this.ranking(),
    };
  }

  toPlay2(): Play {
    return {
      hand: this.hand,
      bid: this.bid,
      ranking: this.ranking(calcPlayRankingNonRepeating),
    };
  }

  ranking(calc: (r: Record<Suit, number>) => number = calcPlayRanking): number {
    const { hand } = this;
    const grouped = hand.reduce((acc, curr) => {
      if (acc[curr]) {
        acc[curr]++;
      } else {
        acc[curr] = 1;
      }
      return acc;
    }, {} as Record<Suit, number>);

    return calc(grouped);
  }
}

function calcPlayRankingNonRepeating(cards: Record<Suit, number>): number {
  const inc = cards["J"] ?? 0;
  const [suit, amount] = Object.keys(cards)
    .filter((k) => k != "J")
    .reduce(
      (prev, suit: Suit) => {
        const amount = cards[suit];
        const [_, prevAmount] = prev;

        if (prevAmount > amount) {
          return prev;
        }
        return [suit, cards[suit]] as const;
      },
      ["J" as Suit, 0] as const
    );

  const newMax = amount + inc;
  const updated = { ...cards, [suit]: newMax, J: 0 };

  const rank = cardsToRanking(updated, suit, newMax);
  return rank;
}

function calcPlayRanking2(cards: Record<Suit, number>): number {
  const inc = cards["J"] ?? 0;
  const updated = Object.keys(cards)
    .filter((k) => k != "J")
    .reduce(
      (acc, curr) => ({ ...acc, [curr]: cards[curr] + inc }),
      {} as Record<Suit, number>
    );
  const [suit, amount] = Object.keys(updated).reduce(
    (prev, suit: Suit) => {
      const amount = updated[suit];
      const [_, prevAmount] = prev;

      if (prevAmount > amount) {
        return prev;
      }
      return [suit, updated[suit]] as const;
    },
    ["J" as Suit, 0] as const
  );

  const play = inc >= 5 ? cards : updated; // handle 5 jokers
  const rank = cardsToRanking(play, suit, amount || inc);
  return rank;
}

function calcPlayRanking(cards: Record<Suit, number>): number {
  const [suit, amount] = Object.keys(cards).reduce(
    (prev, suit: Suit) => {
      const amount = cards[suit];
      const [_, prevAmount] = prev;

      if (prevAmount > amount) {
        return prev;
      }
      return [suit, cards[suit]] as const;
    },
    ["2" as Suit, 0] as const
  );

  return cardsToRanking(cards, suit, amount);
}

function cardsToRanking(
  cards: Record<Suit, number>,
  maxSuit: Suit,
  amount: number
): number {
  const possibleRankings = NUM_TO_PLAY_RANKING[amount];
  if (!possibleRankings) {
    throw new Error(
      "no possible ranking for " + amount + " " + JSON.stringify(cards)
    );
  }

  if (possibleRankings.length == 1) {
    return PLAY_RANKINGS_TO_NUM[possibleRankings[0]];
  }
  const hasDifferentPair = Object.keys(cards)
    .filter((k) => k != maxSuit)
    .find((k) => cards[k] == 2) as Suit | undefined;

  if (!hasDifferentPair) {
    return PLAY_RANKINGS_TO_NUM[possibleRankings[0]];
  }

  return PLAY_RANKINGS_TO_NUM[possibleRankings[1]];
}

function calcBetterPlay(
  x: Play,
  y: Play,
  suitsRanking: readonly Suit[] = SUITS
): number {
  if (x.ranking > y.ranking) {
    return 1;
  } else if (x.ranking < y.ranking) {
    return -1;
  }
  let idx = 0;
  // handle ties
  while (
    suitsRanking.indexOf(x.hand[idx]) == suitsRanking.indexOf(y.hand[idx])
  ) {
    idx++;
  }
  if (suitsRanking.indexOf(x.hand[idx]) < suitsRanking.indexOf(y.hand[idx])) {
    return 1;
  }

  return -1;
}

function parseLine(line: string): Input {
  const [h, bid] = line.split(" ").map((s) => s.trim());
  let hand = h.split("") as Suit[];
  let num = Number(bid);
  return new Input(hand, num);
}

function parse(contents: string): Input[] {
  return contents.split("\n").map(parseLine);
}

function part1(inputs: Input[]): number {
  return inputs
    .map((x) => x.toPlay())
    .toSorted((x, y) => calcBetterPlay(x, y))
    .map((x, idx) => [x.bid, idx + 1]) // idx -> multiplier
    .reduce((acc, [bid, multiplier]) => acc + bid * multiplier, 0);
}

function part2(inputs: Input[]): number {
  return inputs
    .map((x) => x.toPlay2())
    .toSorted((x, y) => calcBetterPlay(x, y, SUITS2))
    .map((x, idx) => {
      return [x.bid, idx + 1];
    }) // idx -> multiplier
    .reduce((acc, [bid, multiplier]) => acc + bid * multiplier, 0);
}

async function main() {
  const filename = Bun.argv[2] ?? "data/test.txt";
  const contents = await Bun.file(filename).text();
  const parsed = parse(contents);
  console.log("part 1: ", part1(parsed));
  console.log("part 2: ", part2(parsed));
}

main();
