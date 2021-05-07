# Conductor 2 - BETA

This is the new improved version of https://github.com/backslashbuild/conductor

New features:

- [x] YAML based configurations
- [x] Easier to specify scripts
- [ ] Event system - trigger the start and restart of scripts based on changes to the filesystem and exits of other scripts
  - [x] exit events
  - [ ] specific exit codes
  - [x] file changes using watchers
- [x] New UI - now entirely in the terminal using https://github.com/chjj/blessed
- [ ] Controllable via keys in the terminal
  - [x] Left and Right arrows to change selected task
  - [x] Up and Down arrows to scroll the logs view
  - [ ] K to kill selected task
  - [ ] R to restart or start selected process
  - [ ] T to toggle tailing or scrolling mode
  - [ ] Indicate tailing mode by changing the border colour
  - [ ] Displaying list of key bindings

Possible future extended features

- [ ] Interpretation and mapping of JSON logs
  - [ ] Extraction of Message
  - [ ] Ability to select a log to see details of JSON properties

Usage:

```bash
$ npm install -g https://github.com/backslashbuild/conductor2
# cd to directory containing conductor.yml
$ conductor2
# or specify a different filename:
$ conductor2 ./example.yml
```

Example configuration:

```
tasks:
  services/hi:
    script: node ./test_server.js
    cwd: ./src
    auto_start: false
    start_on:
      - exit: services/init
    restart_on:
      - changes: ./src/test_server.js

  services/init:
    script: echo 'init.'
```
