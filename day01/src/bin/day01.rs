use std::{collections::HashMap, fs};

const KNOWN_NUMBERS: [&'static str; 9] = [
    "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
];

fn parse_line(line: &str) -> i32 {
    let nums = line
        .chars()
        .filter(|c| c.is_digit(10))
        .map(|c| c.to_digit(10).unwrap() as i32)
        .collect::<Vec<i32>>();
    dbg!(10 * nums.first().unwrap() + nums.last().unwrap())
}

fn replace_from_vec(line: &str, map: &HashMap<&str, usize>) -> String {
    // is ordered
    let mut result = "".to_string();
    for c in line.chars() {
        result.push(c);
        map.into_iter().for_each(|(k, v)| {
            if result.ends_with(k) {
                result = result.replace(k, &v.to_string());
                dbg!(&result);
            }
        });
    }

    result
}

fn parse_line2(line: &str) -> i32 {
    let map = KNOWN_NUMBERS
        .into_iter()
        .enumerate()
        .fold(HashMap::new(), |mut acc, (idx, name)| {
            acc.insert(name, idx + 1);
            acc
        });

    parse_line(replace_from_vec(line, &map).as_str())
}

fn parse2(line: &str) -> i32 {
    let map = KNOWN_NUMBERS
        .into_iter()
        .enumerate()
        .fold(vec![], |mut acc, (idx, name)| {
            acc.push((name, idx + 1));
            acc
        });

    let mut first = -1i32;
    let mut last = -1i32;
    let mut partial_str = "".to_string();
    for c in line.chars() {
        partial_str.push(c);
        if c.is_digit(10) {
            last = c.to_digit(10).unwrap() as i32;
        } else {
            map.clone().into_iter().for_each(|(k, v)| {
                if partial_str.ends_with(k) {
                    last = v as i32;
                }
            });
        }

        if last != -1 && first == -1 {
            first = last;
        }
    }

    first * 10 + last
}

fn main() {
    let contents = fs::read_to_string("data/d01-01-input.txt").unwrap();
    // let result = contents.split("\n").map(parse_line).sum::<i32>();
    // dbg!(result);

    // let contents2 = fs::read_to_string("data/d01-02-test.txt").unwrap();
    let result2 = contents.split("\n").map(parse2).sum::<i32>();
    dbg!(result2);
}
