const { EventEmitter } = require("events");

class ObservableArray extends EventEmitter {
  constructor() {
    super();
    this.array = [];
  }

  push = (value) => {
    this.array.push(value);
    this.emit("data", value);
  };

  forEach = (fn) => this.array.forEach(fn);
}

module.exports = ObservableArray;
