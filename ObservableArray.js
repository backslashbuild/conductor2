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

  forEach = this.array.forEach;
}

module.exports = ObservableArray;
