const blessed = require("blessed");
const chalk = require("chalk");

const screen = blessed.screen({
  smartCSR: true,
  autoPadding: true,
  dockBorders: true,
  dump: "./dump.txt",
});

const taskList = blessed.box({
  top: "start",
  left: "start",
  width: "160",
  height: "100%",
  label: "tasks",
  border: {
    type: "line",
  },
});

const currentLog = blessed.box({
  top: "start",
  left: "160",
  // width: "100% - 100",
  height: "100%",
  label: "item 1",
  scrollable: true,
  alwaysScroll: true,
  focused: true,
  tags: true,
  keys: true,
  border: {
    type: "line",
  },
  content: "Hello {bold}world{/bold}!",
  scrollbar: {
    ch: " ",
    track: {
      border: "red",
      bg: "lightgray",
    },
    style: {
      fg: "cyan",
      inverse: true,
    },
  },
});

// progamming interface to this module
module.exports = {
  start() {
    screen.append(taskList);
    screen.append(currentLog);
    screen.key(["escape", "q", "C-c"], function (ch, key) {
      return process.exit(0);
    });
    screen.render();

    currentLog.setScrollPerc(100);

    screen.key("enter", () => {
      currentLog.setScrollPerc(100);
      currentLog.autoPadding;
    });
  },

  setTasks(tasks, selectedIndex) {
    taskList.setContent("");
    tasks.forEach((x, i) => taskList.pushLine(i === selectedIndex ? chalk.yellow(x) : x));
  },

  onTaskSelected(f) {},

  keys: {
    left(f) {
      screen.key("left", f);
    },
    right(f) {
      screen.key("right", f);
    },
  },

  clear() {
    currentLog.setContent("");
  },

  appendLog(line) {
    const scrollPercentBefore = currentLog.getScrollPerc();

    currentLog.pushLine(line);

    if (currentLog.getScrollHeight() > 1000) {
      currentLog.shiftLine();
    }

    if (scrollPercentBefore === 100 || currentLog.getScrollHeight() < currentLog.height) {
      currentLog.setScrollPerc(100);
    }
  },

  render() {
    screen.render();
  },
};
