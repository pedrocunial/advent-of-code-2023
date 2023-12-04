package main

import (
	"os"
	"regexp"
	"strconv"
	"strings"
)

type (
	Context struct {
		CardRegex *regexp.Regexp
	}

	Match struct {
		Number   int
		Player   []int
		Expected map[int]struct{}
	}

	Stringable interface {
		String() string
	}
)

const (
	CARD_REGEX = "Card (\\d+): "
)

func NewContext() *Context {
	cardRegex, err := regexp.Compile(CARD_REGEX)
	idgaf(err)
	return &Context{
		CardRegex: cardRegex,
	}
}

func NewMatch(number int, player []int, expected map[int]struct{}) *Match {
	return &Match{
		Number:   number,
		Player:   player,
		Expected: expected,
	}
}

func (m *Match) String() string {
	return strconv.Itoa(m.Number) + ": " + ToPrintable(m.Player) + " | " + ToPrintable(m.Expected)
}

func idgaf(err error) {
	if err != nil {
		panic(err)
	}
}

func ToPrintable[T Stringable](slice []T) string {
	s := "["
	for _, v := range slice {
		s += v.String() + ", "
	}
	return s + "]"
}

func part1(ctx *Context, lines []string) {
	matches := parse1(ctx, lines)
	println(ToPrintable(matches))
}

func parseLine1(ctx *Context, line string) *Match {
	gameNumber, err := strconv.Atoi(ctx.CardRegex.FindStringSubmatch(line)[1])
	idgaf(err)
	plays := ctx.CardRegex.ReplaceAllLiteralString(line, "")

	tmp := strings.Split(plays, "| ")
	rawPlayer := strings.Split(tmp[0], " ")
	rawExpected := strings.Split(tmp[1], " ")

	player := []int{}
	for _, p := range rawPlayer {
		card, err := strconv.Atoi(strings.TrimSpace(p))
		if err == nil {
			player = append(player, card)
		}
	}

	expected := map[int]struct{}{}
	for _, e := range rawExpected {
		card, err := strconv.Atoi(strings.TrimSpace(e))
		if err == nil {
			expected[card] = struct{}{}
		}
	}

	return NewMatch(gameNumber, player, expected)
}

func parse1(ctx *Context, lines []string) []*Match {
	matches := []*Match{}
	for _, line := range lines {
		matches = append(matches, parseLine1(ctx, line))
	}
	return matches
}

func main() {
	ctx := NewContext()
	fileName := "data/test.txt"
	file, err := os.ReadFile(fileName)
	idgaf(err)
	contents := string(file)
	lines := strings.Split(contents, "\n")

	part1(ctx, lines)
}
