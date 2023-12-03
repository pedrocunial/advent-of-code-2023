use std::{
    collections::{HashMap, HashSet},
    vec,
};

const BOXES: [(i32, i32); 8] = [
    (-1, -1),
    (-1, 0),
    (-1, 1),
    (0, -1),
    (0, 1),
    (1, -1),
    (1, 0),
    (1, 1),
];

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

fn check_point(
    map: &HashMap<usize, Vec<(usize, usize)>>,
    x: i32,
    y: i32,
    size: usize,
) -> Option<&(usize, usize)> {
    if x < 0 || y < 0 || x >= size as i32 || y >= size as i32 {
        return None;
    }

    map.get(&(x as usize))
        .map(|ranges| {
            dbg!(ranges
                .iter()
                .find(|(beg, end)| *beg as i32 <= x && *end as i32 >= x))
        })
        .flatten()
}

fn check_around(
    line_idx: usize,
    cidx: usize,
    map: &HashMap<usize, Vec<(usize, usize)>>,
    size: usize,
    game: &Box<Vec<&str>>,
) -> i64 {
    let mut visited: Box<HashSet<(usize, usize)>> = Box::new(HashSet::new());
    let matches = BOXES.iter().filter_map(|(x, y)| {
        let lid = line_idx as i32 + x;
        check_point(map, lid, cidx as i32 + y, size).map(|(beg, end)| (lid as usize, beg, end))
    });

    // for (lid, beg, end) in matches.clone() {
    //     if visited.contains(&(*beg, *end)) {
    //         continue;
    //     }
    // }
    if matches.clone().collect::<Vec<_>>().len() == 2 {
        matches
            .map(|(lid, beg, end)| dbg!(game[lid][*beg..*end].parse::<i64>().unwrap()))
            .product::<i64>()
    } else {
        0
    }
}

fn play2(lines: Vec<&str>) -> i64 {
    let game = Box::new(lines.clone());
    let size = lines[0].len();
    let map = build_map(lines);
    let mut result = 0;
    for (line_idx, row) in game.iter().enumerate() {
        for (cidx, c) in row.chars().enumerate() {
            if c == '*' {
                result += dbg!(check_around(line_idx, cidx, &map, size, &game));
            }
        }
    }

    result
}

fn main() {
    let contents = std::fs::read_to_string("data/test.txt").unwrap();
    // let result = play(contents.lines().collect());
    // dbg!(result);

    let result2 = play2(contents.lines().collect());
    dbg!(result2);
}
