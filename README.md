# WhatTheFridge

A [PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps) (progressive web app) prototype to filter from a list of recipes based on available ingredients.

## Editing recipes

Add recipes to [recipes/](./recipes), one [markdown](https://www.markdownguide.org/) file per recipe. Annotate ingredients using the following custom syntax:

To mark `Pepper` as an ingredient:

```md
#[Pepper]
```

To mark `Black pepper` as an ingredient, but categorize the ingredient as `Pepper`:

```md
#[Black pepper|Pepper]
```

To mark the word `Apple` (categorizd as `Apples`) as an ingredient, and indicate `Banana` (categorized as `Bananas`) as an alternative ingredient:

```md
#[Apple|Apples,Banana|Bananas]
```

Becomes `Apple or Banana` in running text.

## Updating the app

The app updates automatically using [a GitHub action](./github/workflows/deploy.yml) whenever a new commit is made to the repository. As such, recipes can be edited via GitHub's web UI or pushed with a [Git client](https://git-scm.com/), with the workflow taking care of building.

To update manually, for example when running the app locally, open a command prompt and execute

```sh
npm run build
```

in the app's root folder. Doing so runs [scripts/build.js](./scripts/build.js), creating [assets/data.json](./assets/data.json) from the recipes.

## Local development

### Project structure

* [index.html](./index.html) - Main [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML) file defining basic page structure
* [index.css](./index.css) - Accompanying [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) file for further layout, colors, etc.
* [index.js](./index.js) - Accompanying [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) file implementing the core logic
* [manifest.json](./manifest.json) - PWA manifest to [make the site installable](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable) as a homescreen app
* [assets/](./assets) - Folder containing various assets like logos, fonts and the generated data file
* [media/](./media) - Folder containing raw assets, like the logo's Photoshop source file
* [scripts/](./scripts) - Folder containing custom scripts, for instance the script to build the app
* [.github/workflows/](./.github/workflows) - GitHub actions integration to automate the repository

### Instructions

First, make sure [Git](https://git-scm.com) and [Node.js](https://nodejs.org/) are installed.

To run the app locally, it needs to be set up once. To do so, open a command prompt, clone the remote repository to a local folder and, with `npm install`, install the [packages](./package.json) the app depends upon for local development:

```sh
git clone https://github.com/WhatTheLab/WhatTheFridge
cd WhatTheFridge
npm install
```

From here on, edit the app's files, for example using [VSCode](https://code.visualstudio.com/) as a convenient editor, and serve the app using a local webserver once it's ready for testing:

```sh
npm start
```

Finally, open the link displayed on the command line in a browser and test your changes.
