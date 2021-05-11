const { EventEmitter } = require("events");
const chalk = require("chalk");
const RestartableProcess = require("./RestartableProcess");
const FileWatcher = require("./FileWatcher");

module.exports = function (config) {
  const mainChannel = new EventEmitter();
  const logs = [];

  const fileWatchers = {};
  const getFileWatcher = (glob) => {
    return (fileWatchers[glob] = fileWatchers[glob] || new FileWatcher(glob));
  };

  const onEvent = (
    { changes, exit, "exit.ok": exitOk, "exit.err": exitErr },
    callback
  ) => {
    if (changes) {
      getFileWatcher(changes).on("change", () => {
        callback("detected file change: " + changes);
      });
    } else if (exit) {
      mainChannel.on(`${exit}.exit`, () => {
        callback("detected exit: " + exit);
      });
    } else if (exitOk) {
      mainChannel.on(`${exit}.exit.ok`, () => {
        callback("detected exit.ok: " + exit);
      });
    } else if (exitErr) {
      mainChannel.on(`${exit}.exit.err`, () => {
        callback("detected exit.err: " + exit);
      });
    }
  };

  Object.keys(config.tasks).forEach((task) => {
    const { script, cwd, auto_start, restart_on, start_on } = config.tasks[
      task
    ];
    const process = new RestartableProcess(script, { cwd });
    const log = (logs[task] = []);

    const writeLine = (data) => {
      log.push(data);
      mainChannel.emit(`${task}.data`);
    };

    process.on("data", writeLine);
    process.on("exit", (code) => {
      writeLine(chalk.red("exit"));
      mainChannel.emit(`${task}.exit`);
      mainChannel.emit(`${task}.exit.${code == 0 ? "ok" : "err"}`);
    });

    if (start_on) {
      start_on.forEach((x) => {
        onEvent(x, (message) => {
          writeLine(chalk.yellow(message));
          writeLine(chalk.yellow("starting..."));
          process.start();
        });
      });
    }
    if (restart_on) {
      start_on.forEach((x) => {
        onEvent(x, (message) => {
          writeLine(chalk.yellow(message));
          writeLine(chalk.yellow("restarting..."));
          process.restart();
        });
      });
    }
    if (auto_start !== false) {
      process.start();
    }
  });

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

    logs[taskList[current]].forEach((x) => {
      display.appendLog(x);
    });

    mainChannel.on(`${taskList[current]}.data`, write);

    display.setTasks(taskList, current);
    display.render();
  }

  display.keys.left(function () {
    mainChannel.off(`${taskList[current]}.data`, write);
    current = Math.max(0, current - 1);
    update();
  });
  display.keys.right(function () {
    mainChannel.off(`${taskList[current]}.data`, write);
    current = Math.min(taskList.length - 1, current + 1);
    update();
  });

  update();
};
