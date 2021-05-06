# Conductor 2 - BETA

This is the new improved version of https://github.com/backslashbuild/conductor

New features:

- [x] YAML based configurations
- [x] Easier to specify scripts
- [ ] Event system - trigger the start and restart of scripts based on changes to the filesystem and exits of other scripts
  - [x] exit events
  - [ ] specific exit codes
  - [ ] file changes using watchers
- [x] New UI - now entirely in the terminal using https://github.com/chjj/blessed

Usage:

```bash
$ npm install -g https://github.com/backslashbuild/conductor2
# cd to directory containing conductor.yml
$ conductor2
# or specify a different filename:
$ conductor2 ./example.yml
```
