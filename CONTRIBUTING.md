# Contributing to `render-gateway`

🙇Thank you for your interest in contributing to the Render Gateway repository. The participation of others is a wonderful 🎁gift. However, **we are not accepting contributions** on this project as it is now deprecated.

📖 Be sure to read our [Code of Conduct](https://github.com/Khan/render-gateway/blob/main/CODE_OF_CONDUCT.md).

## 🛑 Bugs And Feature Requests

⚠️ **We are not accepting raised bugs and feature requests**

## 💻 Code Changes

⚠️ **We are not accepting code changes**

Read on for information on how we developed this code when it was active, in case you need to resurrect it somehow.

### 🎬 Getting Started

To work in the `render-gateway` repository, follow these steps:

1. Clone the repository
   `git clone git@github.com:Khan/render-gateway.git`
2. Install `yarn` (see [🔗yarnpkg.com](https://yarnpkg.com))
3. Run `yarn install` to install the dependencies

You can now work on `render-gateway`. We prefer [🔗Visual Studio Code](https://code.visualstudio.com/) as our development environment (it's cross-platform and awesome), but please use what you feel comfortable with (we'll even forgive you for using vim).

### 🧪 Code Quality

#### Manual

We love code reviews. If there are open pull requests, please feel free to review them and provide feedback. Feedback is a gift and code reviews are often a bottleneck in getting new things released. Jump in, even if you don't know anything; you probably know more than you think.

💭**REMEMBER** Be kind and considerate. Folks are volunteering their time and code reviews are a moment of vulnerability where a criticism of the code can easily become a criticism of the individual that wrote it.

1. Take your time
2. Consider how you might receive the feedback you are giving if it were attached to code you wrote
3. Favor asking questions over prescribing solutions.

#### Automated

To ensure code quality, we use prettier, flow, eslint, and jest. These are all executed automatically on commit, so don't worry if you forget to run them before you commit. They are also executed when you submit, edit, or push to a pull request to ensure the contribution meets our code quality standard.

To execute these operations outside of a pull request or commit operation, you can use `yarn`.

- `yarn flow`
- `yarn lint`
- `yarn test`

💭**REMEMBER** If you would like to contribute code changes to the project, first make sure there's a corresponding issue for the change you wish to make.

## 📦 Build And Publish

Anyone can create a local build of the distributed code by running `yarn build`. The built files are in the `/dist` directory.

### Publishing

Currently, this is not a public package published in the traditinal NPM sense. Instead, a GitHub Action will ensure any pull request branch or merged code is tested, built, and the corresponding `/dist` files committed to the appropriate branch. Those with appropriate repository permissions can perform this manually with the following steps:

1. `git checkout <branch> && git pull`
1. `yarn install`
1. `yarn test`
1. `yarn build`
1. If there are changes to the `/dist` folder:
    1. `git add dist`
    1. `git commit -m "Updating distribution" -m "<add you reasons for manual publish here>"`
    1. `git push`
1. If there are no changes to the `/dist` folder then there's no need to do a publish.
