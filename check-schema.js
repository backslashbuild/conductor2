const Ajv = require("ajv");

const ajv = new Ajv({ allErrors: true });
require("ajv-errors")(ajv);

const buildEventSchema = (kind) => ({
  type: "object",
  properties: {
    [kind]: { type: "string" },
  },
  additionalProperties: false,
  errorMessage: "Events can only have one key.",
});

const eventsListSchema = {
  type: "array",
  items: {
    anyOf: [
      buildEventSchema("changes"),
      buildEventSchema("exit"),
      buildEventSchema("exit.ok"),
      buildEventSchema("exit.err"),
    ],
  },
  errorMessage: "Events should be one of 'changes', 'exit', 'exit.ok' and 'exit.err'",
};

const schema = {
  type: "object",
  properties: {
    tasks: {
      type: "object",
      patternProperties: {
        "^.*$": {
          type: "object",
          properties: {
            script: { type: "string", errorMessage: "'tasks.script' must be a string" },
            cwd: { type: "string", errorMessage: "'tasks.cwd' must be a string" },
            auto_start: { type: "boolean", errorMessage: "'tasks.auto_start' must be a boolean" },
            start_on: eventsListSchema,
            restart_on: eventsListSchema,
            stop_on: eventsListSchema,
          },
          required: ["script"],
          additionalProperties: false,
          errorMessage:
            "Tasks must specify 'script' and may have additional properties 'auto_start', 'start_on', 'restart_on', 'stop_on'",
        },
      },
      additionalProperties: false,
      errorMessage: "'tasks' must be an object.",
    },
  },
  additionalProperties: false,
  errorMessage: "A top level 'tasks' must be specified.",
};

const validate = ajv.compile(schema);

module.exports = function (config) {
  const valid = validate(config);

  const message = valid
    ? null
    : validate.errors
        .map((e) => {
          return `Configuration error at ${e.instancePath}: ${e.message}`;
        })
        .reduce((result, x) => result + "\n" + x, "")
        .trim();

  return { valid, message };
};
