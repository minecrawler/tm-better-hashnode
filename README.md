# tm-better-hashnode
Improvements for Hashnode Desktop

This TamperMonkey script aims to

- remove ads in a LinearBytes Inc. friendly way
- remove visual clutter
- improve existing features
- add missing features
- tweak UI and UX

This script is **unofficial**!

## How to install the script

1. Install TamperMonkey for your browser from its plugin store.
2. Open [this link](https://github.com/minecrawler/tm-better-hashnode/raw/master/dist/tm-better-hashnode.user.js)
3. Profit


## How to build the script

1. `npm i .`
2. `npm run build`
3. The output file is in the `/dist` directory


## How to contribute an entirely new feature

1. Create a file in `/src/modules`
2. Import the module from `/src/index.js`
3. Create a pull request


## How to contribute a fix or extend a feature

Just do it and create a pull request


## I don't want all of the features present

I am thinking about ways to split up the code into several projects, but for now, this is how I envision Hashnode.
Live with it or fork my code in order to build your own version.


## License

This code is licensed under the [Mozilla Public License 2.0](https://tldrlegal.com/license/mozilla-public-license-2.0-(mpl-2)).
In short: you are allowed to use my stuff, but you have to opensource any modifications of my files.
Ideally you should send patches upstream ;)

You can read the entire license in detail in the LICENSE file.
