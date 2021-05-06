const RestartableProcess = require("./RestartableProcess");
const chalk = require("chalk");
const ObservableArray = require("./ObservableArray");
const FileWatcher = require("./FileWatcher");

const fileWatchers = {};
const getFileWatcher = (glob) => {
  return (fileWatchers[glob] = fileWatchers[glob] || new FileWatcher(glob));
};

module.exports = function (config) {
  const processes = {};
  const lines = {};

  for (let task of Object.keys(config.tasks)) {
    const { cwd } = config.tasks[task];
    const p = (processes[task] = new RestartableProcess(
      config.tasks[task].script,
      { cwd }
    ));
    const out = (lines[task] = new ObservableArray());
    p.on("data", (data) => out.push(data));
    p.on("exit", () => out.push(chalk.red("exit")));
  }

  // wire up starts
  for (let task of Object.keys(config.tasks)) {
    if (Array.isArray(config.tasks[task].start_on)) {
      for (let condition of config.tasks[task].start_on) {
        if (condition.exit) {
          processes[condition.exit].on("exit", () => {
            lines[task].push(
              chalk.yellow("detected exit: ") +
                condition.exit +
                chalk.yellow(" starting...")
            );
            processes[task].start();
          });
        } else if (condition.changes) {
          getFileWatcher(condition.changes).on("change", () => {
            lines[task].push(
              chalk.yellow("detected file change: ") +
                condition.changes +
                chalk.yellow(" starting...")
            );
            processes[task].start();
          });
        }
      }
    }
  }

  // wire up restarts
  for (let task of Object.keys(config.tasks)) {
    if (Array.isArray(config.tasks[task].restart_on)) {
      for (let condition of config.tasks[task].restart_on) {
        if (condition.exit) {
          processes[condition.exit].on("exit", () => {
            lines[task].push(
              chalk.yellow("detected exit: ") +
                condition.exit +
                chalk.yellow("restarting...")
            );
            processes[task].restart();
          });
        } else if (condition.changes) {
          getFileWatcher(condition.changes).on("change", () => {
            lines[task].push(
              chalk.yellow("detected file change: ") +
                condition.changes +
                chalk.yellow(" restarting...")
            );
            processes[task].restart();
          });
        }
      }
    }
  }

  // trigger the autos
  for (let task of Object.keys(config.tasks)) {
    if (config.tasks[task].auto_start !== false) {
      processes[task].start();
    }
  }

  const display = require("./display");

  const taskList = Object.keys(config.tasks);
  let current = 0;

  display.start();

  function write(line) {
    display.appendLog(line);
    display.render();
  }

  function update() {
    display.clear();

    lines[taskList[current]].forEach((x) => {
      display.appendLog(x);
    });

    lines[taskList[current]].on("data", write);

    display.setTasks(taskList, current);

    display.render();
  }

  display.keys.left(function () {
    lines[taskList[current]].off("data", write);
    current = Math.max(0, current - 1);
    update();
  });
  display.keys.right(function () {
    lines[taskList[current]].off("data", write);
    current = Math.min(taskList.length - 1, current + 1);
    update();
  });

  update();
};
