import svelte from 'rollup-plugin-svelte'
import replace from '@rollup/plugin-replace'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import livereload from 'rollup-plugin-livereload'
import { terser } from 'rollup-plugin-terser'
import json from 'rollup-plugin-json'
import visualizer from 'rollup-plugin-visualizer'

const production = !process.env.ROLLUP_WATCH
const baseConfiguration = {
    input: 'src/main.js',
    plugins: [
        visualizer(),
        svelte({
            // enable run-time checks when not in production
            dev: !production,
            // we'll extract any component CSS out into
            // a separate file — better for performance
            css: css => {
                css.write('public/build/bundle.css')
            }
        }),
        /*postcss({
          sourceMap: true,
          minimize: true,
          extract: 'public/build/global.css',
          inject:false,
        }),*/
        // To use a module from local or from external like commons
        // alias({
        //     entries: {
        //         'api-client': !production
        //                       ? 'src/api/mock/index.js'
        //                       : 'src/api/server/index.js'
        //     }
        // }),
        // If you have external dependencies installed from
        // npm, you'll most likely need these plugins. In
        // some cases you'll need additional configuration —
        // consult the documentation for details:
        // https://github.com/rollup/plugins/tree/master/packages/commonjs
        resolve({
            resolve: ['.js', '.json'],
            browser: true,
            dedupe: importee => importee === 'svelte' || importee.startsWith('svelte/')
        }),
        commonjs(),
        // In dev mode, call `npm run start` once
        // the bundle has been generated
        !production && serve(),

        // Watch the `public` directory and refresh the
        // browser on changes when not in production
        !production && livereload('public'),

        json(),

        // If we're building for production (npm run build
        // instead of npm run dev), minify
        production && terser(),
        replace({
            'https://www.nespresso.com/shared_res/agility/commons': JSON.stringify(production
                                                                                   ? 'https://www.nespresso.com/shared_res/agility/commons'
                                                                                   : 'public/commons'),
            'process.env.BASE_URL': JSON.stringify(production ? '/shared_res/agility/commons/' : '/'),
            'process.env.NODE_ENV === \'production\'': production,
            'process.env.ROLLUP_WATCH': process.env.ROLLUP_WATCH,
            'process.env.NODE_ENV === \'development\'': !production
        })
    ],
    watch: {
        clearScreen: false
    },
    experimentalCodeSplitting: true,
    experimentalDynamicImport: true,
    transpileDependencies: [
        'nespresso-library',
        'nespresso-components',
        'gvue',
        'gaspard'
    ]
}

export default [
    // ES module version, for modern browsers
    {
        output: {
            dir: 'public/module',
            format: 'es',
            sourcemap: !production,
            name: 'app'
        },
        ...baseConfiguration
    },

    // SystemJS version, for older browsers
    {
        output: {
            dir: 'public/nomodule',
            format: 'system',
            sourcemap: true
        },
        ...baseConfiguration
    }
]

function serve () {
    let started = false

    return {
        writeBundle () {
            if (!started) {
                started = true

                require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
                    stdio: ['ignore', 'inherit', 'inherit'],
                    shell: true
                })
            }
        }
    }
}
