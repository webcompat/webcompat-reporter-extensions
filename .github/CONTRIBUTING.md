# Contribution Guidelines

You are welcome to contribute to this project! Here are the guidelines we try to stick to in this project.

* [Questions or Problems](#questions-or-problems)
* [Commit Messages](#commit-messages)
* [Pull Requests](#pull-requests)
* [Coding Style](#coding-style)

## Questions or Problems

If you have a question about the site or about web compatibility in general, feel free to join us in the #webcompat channel on the Mozilla IRC network. [Here's how to join](https://wiki.mozilla.org/IRC#Connect_to_the_Mozilla_IRC_server).

Otherwise, you can try to ping Mike Taylor on the Freenode network with the following command `/msg miketaylr Hi, I have a question about contributing to the webcompat reporter addons`.

If IRC isn't your thing, send an email to Mike Taylor at miket@mozilla.com.

## Commit Messages

Each commit message should include a reference to the issue being worked on. [For example](https://github.com/webcompat/webcompat-reporter-extensions/commit/3e82a09b1a609338e5c0f5e227433b3a0851ce2c),

`Issue #83. Add TravisCI integration.`

This creates a nice hyperlink between commits and issues automatically n GitHub.

## Pull Requests

[Pull requests](https://help.github.com/articles/creating-a-pull-request/) are welcome. All PRs should correspond to an existing issue, so feel free to [file one](https://github.com/webcompat/webcompat-reporter-extensions/issues/new) if it doesn't exist already.

For large changes or new features, it's a good idea to discuss the idea in an issue before sending in a PR.

Pull Request titles should follow this format:

`Fixes #(Number of issue). Short description of PR.`

For example,

`Fixes #83. Add TravisCI integration.`

## Coding Style

For JS, this project uses [Prettier](https://prettier.io/) to format everything (via eslint integration). [Why?](https://prettier.io/docs/en/why-prettier.html)

Try to get your [text editor integration set up](https://prettier.io/docs/en/editors.html), it's pretty great. Otherwise, you can get a report by running the following command:

`npm run eslint`
