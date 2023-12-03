package main

import (
	"errors"
	"os"
	"regexp"
	"strconv"
	"strings"
)

type (
	Play struct {
		Red   int
		Green int
		Blue  int
	}
)

const (
	GAME_REGEX = "Game ([0-9]+): "
	PLAY_REGEX = "([0-9]+) (\\w+)"
)

func NewPlay() *Play {
	return &Play{}
}

func (p *Play) SetColor(color string, amount int) {
	switch color {
	case "red":
		p.Red = amount
	case "green":
		p.Green = amount
	case "blue":
		p.Blue = amount
	}
}

func (p *Play) GetColor(color string) (int, error) {
	switch color {
	case "red":
		return p.Red, nil
	case "green":
		return p.Green, nil
	case "blue":
		return p.Blue, nil
	}
	return 0, errors.New("invalid color " + color)
}

func (p *Play) String() string {
	return "Red: " + strconv.Itoa(p.Red) + ", Green: " + strconv.Itoa(p.Green) + ", Blue: " + strconv.Itoa(p.Blue)
}

func (p *Play) IsValid(game *Play) bool {
	return p.Red <= game.Red && p.Green <= game.Green && p.Blue <= game.Blue
}

func (p *Play) Pow() int {
	return p.Red * p.Green * p.Blue
}

func play(line string, state *Play) (int, bool) {
	gameRegex := regexp.MustCompile(GAME_REGEX)
	playRegex := regexp.MustCompile(PLAY_REGEX)
	rawGameNumber := gameRegex.FindStringSubmatch(line)[1]
	gameNumber, err := strconv.Atoi(rawGameNumber)
	if err != nil {
		panic(err)
	}
	rawPlays := gameRegex.ReplaceAllLiteralString(line, "")
	plays := strings.Split(rawPlays, "; ")
	for _, play := range plays {
		colors := strings.Split(play, ", ")
		p := NewPlay()
		for _, color := range colors {
			matches := playRegex.FindStringSubmatch(color)
			amount, err := strconv.Atoi(matches[1])
			if err != nil {
				panic(err)
			}
			color := matches[2]

			p.SetColor(color, amount)
		}
		if !p.IsValid(state) {
			return gameNumber, false
		}
	}

	return gameNumber, true
}

func play2(line string) int {
	gameRegex := regexp.MustCompile(GAME_REGEX)
	playRegex := regexp.MustCompile(PLAY_REGEX)
	rawPlays := gameRegex.ReplaceAllLiteralString(line, "")
	plays := strings.Split(rawPlays, "; ")
	p := NewPlay()
	for _, play := range plays {
		colors := strings.Split(play, ", ")
		for _, color := range colors {
			matches := playRegex.FindStringSubmatch(color)
			amount, err := strconv.Atoi(matches[1])
			if err != nil {
				panic(err)
			}
			color := matches[2]
			maxColor, err := p.GetColor(color)
			if err != nil {
				panic(err)
			}
			if amount > maxColor {
				p.SetColor(color, amount)
			}
		}
	}

	return p.Pow()
}

func main() {
	raw, err := os.ReadFile("data/input.txt")
	if err != nil {
		panic(err)
	}
	contents := string(raw)
	games := strings.Split(contents, "\n")
	state := &Play{Red: 12, Green: 13, Blue: 14}
	validGames := 0
	sumPow := 0
	for _, game := range games {
		num, valid := play(game, state)
		println("Game " + strconv.Itoa(num) + ": " + strconv.FormatBool(valid))
		if valid {
			validGames += num
		}
		sumPow += play2(game)

	}
	println(validGames)
	println(sumPow)
}
