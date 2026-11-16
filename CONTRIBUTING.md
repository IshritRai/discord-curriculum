# Contributing

Thank you for helping make this course better. The most useful contributions are **reports from real learners**: a step that didn't work, a sentence that was confusing, an operating-system difference we missed.

## Reporting a problem

[Open an issue](https://github.com/IshritRai/discord-curriculum/issues) and include:

- the lesson number and step,
- your operating system and browser, and (if it's a tool problem) the version of Node, Git or VS Code,
- what you did, what you expected, and what happened (an error message or screenshot helps).

Tool screens (GitHub, installers, VS Code, Chrome) change over time. If a screen doesn't match the lesson, that's worth reporting too.

## Changing a lesson

Lessons are Markdown files in `site/lessons/`. Before you edit one, read [`tools/authoring/GUIDE.md`](tools/authoring/GUIDE.md). The key rules:

1. **No untaught code.** Code the learner types may only use concepts from the current or an earlier lesson (`concepts.json` maps each concept to its lesson).
2. **The steps must rebuild the solution.** The lesson's steps applied to `solutions/lesson-(N-1)` must produce `solutions/lesson-N`.
3. **Say only what you verified** against official documentation, and link only pages that exist.
4. **Cross-platform:** shortcuts and commands must work on macOS, Windows and Linux (see the guide's "Cross-platform rules").

Run the checks and include the result in your pull request:

```sh
npm install
npm run check:concepts
npm run check:lessons
npm run verify          # only if you changed anything in solutions/
```

## Changing a solution

Solutions in `solutions/lesson-NN/` build on each other. A change to one usually has to be repeated in every later lesson, in the lesson text that explains it, and in the screenshots (`npm run verify` regenerates them). Please open an issue first so we can agree how to do it.
