const { EventEmitter } = require("events");
const spawn = require("cross-spawn");
const { parseArgsStringToArgv } = require("string-argv");
const kill = require("tree-kill");

class RestartableProcess extends EventEmitter {
  constructor(command, options) {
    super();

    const stdout = (data) => {
      const line = data.toString("utf8").trim("\n");
      this.emit("stdout", line);
      this.emit("data", line);
    };

    const stderr = (data) => {
      const line = data.toString("utf8").trim("\n");
      this.emit("stderr", line);
      this.emit("data", line);
    };

    const exit = (code) => {
      this.emit("exit");
      if (code === 0) this.emit("exit.ok");
      else this.emit("exit.err");
    };

    // clean, exec,
    this.clean = async () => {
      if (this.p) {
        this.p.stdout.off("data", stdout);
        this.p.stderr.off("data", stderr);
        this.p.off("exit", exit);
        await new Promise((res) => kill(this.p.pid, () => res())); // always resolves.
        delete this.p;
      }
    };

    this.exec = () => {
      const args = parseArgsStringToArgv(command);
      const cmd = args.shift();
      this.p = spawn(cmd, args, { ...options });
      this.p.stdout.on("data", stdout);
      this.p.stderr.on("data", stderr);
      this.p.on("exit", exit);
    };
  }

  start = async () => {
    if (!this.p) {
      this.exec();
    }
  };

  restart = async () => {
    await this.clean();
    this.exec();
  };

  stop = async () => {
    await this.clean();
  };
}

module.exports = RestartableProcess;
