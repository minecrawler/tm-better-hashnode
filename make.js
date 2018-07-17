const config = require('./package.json');

const CleanCSS = require('clean-css');
const clear = require('rollup-plugin-clear');
const closure = require('rollup-plugin-closure-compiler-js');
const html = require('rollup-plugin-html');
const license = require('rollup-plugin-license');
const progress = require('rollup-plugin-progress');
const rollup = require('rollup').rollup;
const scss = require('rollup-plugin-scss');

const outFile = 'dist/tm-better-hashnode.user.js';
const header = `// ==UserScript==
// @name         ${config.name}
// @namespace    https://hashnode.com
// @version      ${config.version}
// @description  ${config.description}
// @author       ${config.author}
// @match        https://hashnode.com/*
// @source       ${config.repository}
// @updateURL    ${config.repository}/raw/master/${outFile}
// @grant        GM_addStyle
// ==/UserScript==
`;

async function build() {
    // clean cache
    require('fs').writeFileSync('cache/css.js', '');

    // CSS pass
    const cssPass = await rollup({
        input: 'src/index.js',
        plugins: [
            clear({
                targets: ['./dist'],
                watch: false,
            }),
            html(),
            progress({
                clearLine: true,
            }),
            scss({
                output: styles => {
                    const cleanedCSS = new CleanCSS().minify(styles);

                    require('fs').writeFileSync('cache/css.js', `GM_addStyle(\`${cleanedCSS.styles}\`);`);
                },
            }),
        ],
    });

    await cssPass.generate({
        format: "system",
    });

    // optimization pass
    const bundle = await rollup({
        input: 'src/index.js',
        plugins: [
            closure(),
            html({
                htmlMinifierOptions: {
                    collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    conservativeCollapse: true,
                    includeAutoGeneratedTags: false,
                    removeComments: true,
                },
            }),
            license({
                banner: header,
            }),
            progress({
                clearLine: false,
            }),
            scss({
                output: false,
            }),
        ],
    });

    await bundle.write({
        file: outFile,
        format: 'iife',
    });

    // clean cache
    require('fs').writeFileSync('cache/css.js', '');
}

build();