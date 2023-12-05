package main

import (
	"fmt"
	"math"
	"os"
	"strconv"
	"strings"
)

type (
	Map struct {
		Beg  int
		End  int
		Dest int
	}

	Almanac struct {
		From string
		To   string
		Maps []*Map
	}

	Range struct {
		Beg int
		End int
	}

	Game struct {
		Almanacs []*Almanac
		Seeds    []*Range
	}
)

func idgaf(err error) {
	if err != nil {
		panic(err)
	}
}

func NewMap(beg int, end int, dest int) *Map {
	return &Map{beg, end, dest}
}

func NewAlmanac(from string, to string, maps []*Map) *Almanac {
	return &Almanac{from, to, maps}
}

func NewRange(beg int, end int) *Range {
	return &Range{beg, end}
}

func NewGame(almanacs []*Almanac, seeds []*Range) *Game {
	return &Game{almanacs, seeds}
}

func (m *Map) String() string {
	return fmt.Sprintf("Map(%d, %d, %d)", m.Beg, m.End, m.Dest)
}

func (a *Almanac) String() string {
	return fmt.Sprintf("Almanac(%s, %s, %v)", a.From, a.To, a.Maps)
}

func (r *Range) String() string {
	return fmt.Sprintf("Range(%d, %d)", r.Beg, r.End)
}

func (g *Game) Println() {
	println("seeds:")
	for _, s := range g.Seeds {
		println(s.String())
	}
	println("almanacs:")
	for _, a := range g.Almanacs {
		println(a.String())
	}
}

func (m *Map) InRange(seed int) bool {
	return m.Beg <= seed && seed < m.End
}

func (m *Map) ToDest(seed int) int {
	diff := seed - m.Beg
	return m.Dest + diff
}

func (a *Almanac) Map(seed int) int {
	for _, m := range a.Maps {
		if m.InRange(seed) {
			return m.ToDest(seed)
		}
	}
	return seed
}

func parseSeeds(line string) []*Range {
	rawSeeds := strings.Fields(strings.Split(line, ": ")[1])
	seeds := []*Range{}
	for i := 0; i < len(rawSeeds); i += 2 {
		beg, err := strconv.Atoi(rawSeeds[i])
		idgaf(err)
		size, err := strconv.Atoi(rawSeeds[i+1])
		idgaf(err)
		seeds = append(seeds, NewRange(beg, beg+size))
	}

	return seeds
}

func parseMaps(lines []string) []*Map {
	maps := []*Map{}
	for _, line := range lines {
		fields := strings.Fields(line)
		dest, err := strconv.Atoi(fields[0])
		idgaf(err)
		beg, err := strconv.Atoi(fields[1])
		idgaf(err)
		size, err := strconv.Atoi(fields[2])
		idgaf(err)
		maps = append(maps, NewMap(beg, beg+size, dest))
	}

	return maps
}

func parseAlmanac(page []string) *Almanac {
	title := strings.Split(strings.Fields(page[0])[0], "-")
	return NewAlmanac(title[0], title[2], parseMaps(page[1:]))
}

func parseAlmanacs(pages []string) []*Almanac {
	almanacs := []*Almanac{}
	for _, page := range pages {
		lines := strings.Split(page, "\n")
		almanacs = append(almanacs, parseAlmanac(lines))
	}

	return almanacs
}

func Parse(contents string) *Game {
	scenarios := strings.Split(contents, "\n\n")
	seeds := parseSeeds(scenarios[0])
	almanacs := parseAlmanacs(scenarios[1:])
	return NewGame(almanacs, seeds)
}

func (g *Game) Play2() int {
	min := math.MaxInt32
	visited := map[int]struct{}{}
	for _, s := range g.Seeds {
		for i := s.Beg; i < s.End; i++ {
			if _, ok := visited[i]; ok {
				continue
			}
			visited[i] = struct{}{}
			s := i
			for _, a := range g.Almanacs {
				s = a.Map(s)
			}
			if s < min {
				min = s
			}
		}
		println("finisehd seed range", s.String())
	}
	return min
}

func main() {
	raw, err := os.ReadFile("data/input.txt")
	idgaf(err)
	contents := string(raw)
	game := Parse(contents)
	game.Println()
	println(game.Play2())
}
