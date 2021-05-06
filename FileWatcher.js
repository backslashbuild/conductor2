const { EventEmitter } = require("events");
const chokidar = require("chokidar");

class FileWatcher extends EventEmitter {
  constructor(glob) {
    super();

    const watcher = chokidar.watch([glob], {
      persistent: true,
      ignoreInitial: true,
    });

    const handleChange = () => this.emit("change");

    watcher
      .on("add", handleChange)
      .on("change", handleChange)
      .on("unlink", handleChange);
  }
}

module.exports = FileWatcher;
