use std::collections::HashMap;

trait Valid {
    fn is_valid(&self, game: &Box<Vec<&str>>) -> bool;
}

trait Symbol {
    fn is_symbol(&self) -> bool;
}

impl Symbol for char {
    fn is_symbol(&self) -> bool {
        !self.is_digit(10) && *self != '.'
    }
}

impl Valid for (usize, usize, usize) {
    fn is_valid(&self, game: &Box<Vec<&str>>) -> bool {
        let (line_idx, beg_idx, end_idx) = self;
        let line = *line_idx as i32;
        let beg = *beg_idx as i32 - 1;
        let end = *end_idx as i32 + 1;

        let top = check_line(line - 1, beg, end, game);
        let before = check_line(line, beg, beg + 1, game);
        let after = check_line(line, end - 1, end, game);
        let bottom = check_line(line + 1, beg, end, game);

        dbg!(self);
        dbg!(top || before || after || bottom)
    }
}

fn check_line(line_idx: i32, beg_idx: i32, end_idx: i32, game: &Box<Vec<&str>>) -> bool {
    dbg!(line_idx, beg_idx, end_idx);
    let usized_line_idx: usize = match line_idx.try_into() {
        Ok(value) => value,
        Err(_) => return false,
    };
    if usized_line_idx >= game.len() {
        return false;
    }
    let beg = beg_idx.max(0).try_into().unwrap();
    let end = end_idx
        .min(game[usized_line_idx].len() as i32)
        .try_into()
        .unwrap();

    game[usized_line_idx][dbg!(beg..end)]
        .chars()
        .any(|c| c.is_symbol())
}

fn extract_ranges(lines: Vec<&str>) -> Vec<(usize, usize, usize)> {
    // probably could be a reduce or smth, but aint got time for that
    let mut idx_begining = -1;
    let mut idx_ranges: Vec<(usize, usize, usize)> = Vec::new();
    for (line_idx, line) in lines.iter().enumerate() {
        for (cidx, c) in line.chars().enumerate() {
            if c.is_digit(10) {
                if idx_begining == -1 {
                    idx_begining = cidx as i32;
                }
            } else if idx_begining != -1 {
                idx_ranges.push((line_idx, idx_begining as usize, cidx));
                idx_begining = -1;
            }
        }
        if idx_begining != -1 {
            idx_ranges.push((line_idx, idx_begining as usize, line.len()));
            idx_begining = -1;
        }
    }
    idx_ranges
}

fn play(lines: Vec<&str>) -> i32 {
    let game = Box::new(lines.clone());
    extract_ranges(lines)
        .iter()
        .filter(|r| r.is_valid(&game))
        .map(|(lineidx, beg, end)| dbg!(game[*lineidx][*beg..*end].parse::<i32>().unwrap()))
        .sum()
}

fn build_map(lines: Vec<&str>) -> HashMap<usize, Vec<(usize, usize)>> {
    extract_ranges(lines).into_iter().fold(
        HashMap::new(),
        |mut map: HashMap<usize, Vec<(usize, usize)>>, (l, b, e)| {
            if map.contains_key(&l) {
                map.get_mut(&l).unwrap().push((b, e));
            } else {
                map.insert(l, vec![(b, e)]);
            }
            map
        },
    )
}

fn check_ranges(line_idx: usize, cidx: usize, map: &HashMap<usize, Vec<(usize, usize)>>) -> bool {
    map[&line_idx].iter().any(|(b, e)| *b <= cidx && *e >= cidx)
}

fn check_around(line_idx: usize, cidx: usize, map: &HashMap<usize, Vec<(usize, usize)>>) -> bool {
    let mut count = 0;
    let top = if line_idx == 0 {
        false
    } else {
        check_ranges(line_idx - 1, cidx, &map)
    };
    let bottom = if line_idx == map.len() - 1 {
        false
    } else {
        check_ranges(line_idx + 1, cidx, &map)
    };
    let before = if cidx == 0 {
        false
    } else {
        check_ranges(line_idx, cidx - 1, &map)
    };
    let after = if cidx == map[&line_idx].len() - 1 {
        false
    } else {
        check_ranges(line_idx, cidx + 1, &map)
    };

    top || bottom || before || after
}

fn play2(lines: Vec<&str>) -> i32 {
    let game = Box::new(lines.clone());
    let map = build_map(lines);
    for (line_idx, row) in game.iter().enumerate() {
        for (cidx, c) in row.chars().enumerate() {
            if c == '*' {
                check_around(line_idx, cidx, &map);
            }
        }
    }

    0
}

fn main() {
    let contents = std::fs::read_to_string("data/test.txt").unwrap();
    let result = play(contents.lines().collect());
    dbg!(result);
}
