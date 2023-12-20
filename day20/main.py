import sys
from collections import defaultdict
from dataclasses import dataclass, field


@dataclass
class Broadcaster:
    name: str
    connections: list

    def recv(self, pulse: bool, _) -> bool:
        return pulse


@dataclass
class FlipFlop:
    name: str
    connections: list
    is_on: bool = False  # false = off, true = on

    def recv(self, pulse: bool, _) -> bool:
        if pulse:
            return

        self.is_on = not self.is_on
        return self.is_on


@dataclass
class Conjunction:
    name: str
    connections: list
    memory: dict[str, bool] = field(default_factory=lambda: defaultdict(bool))
    parents: list[str] = field(default_factory=list)

    def recv(self, pulse: bool, origin: str) -> bool:
        self.memory[origin] = pulse
        for p in self.parents:
            if not self.memory[p]:
                return True
        return False


def parse_module(line: str) -> str:
    module_name, connection_keys = line.split(" -> ")
    connections = connection_keys.split(", ")
    if module_name == "broadcaster":
        return Broadcaster(module_name, connections)
    if module_name.startswith("%"):
        return FlipFlop(module_name[1:], connections)
    if module_name.startswith("&"):
        return Conjunction(module_name[1:], connections)
    raise ValueError(f"Unknown module {module_name}")


def parse_input(contents: str) -> dict[str, any]:  # actualy module interface, w/e
    modules = {}
    for line in contents.splitlines():
        module = parse_module(line)
        modules[module.name] = module

    # process conjunction parents
    conjunctions = [
        module for module in modules.values() if isinstance(module, Conjunction)
    ]
    for conjunction in conjunctions:
        for module in modules.values():
            if conjunction.name in module.connections:
                conjunction.parents.append(module.name)

    return modules


def play(modules: dict[str, any], pushes: int):
    broadcaster = modules["broadcaster"]
    count_lo, count_hi = 0, 0
    for _ in range(pushes):
        count_lo += 1
        module = broadcaster
        pulse = module.recv(False, "button")
        q = [(c, pulse, module.name) for c in broadcaster.connections]
        while q:
            module_name, pulse, origin = q.pop(0)
            if pulse:
                count_hi += 1
            else:
                count_lo += 1
            if module_name not in modules:
                continue
            module = modules[module_name]
            new_pulse = module.recv(pulse, origin)
            if new_pulse is not None:
                q.extend([(c, new_pulse, module_name) for c in module.connections])
    return count_lo * count_hi


def main(fname: str):
    with open(fname, "r") as f:
        contents = f.read()
    modules = parse_input(contents)
    print(play(modules, 1000))


if __name__ == "__main__":
    main("data/test.txt" if len(sys.argv) != 2 else sys.argv[1])
