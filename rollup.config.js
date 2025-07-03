// rollup.config.js
import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve';
import css from 'rollup-plugin-import-css';
import html from 'rollup-plugin-html'
import serve from 'rollup-plugin-serve'
import terser from '@rollup/plugin-terser'

export default {
    input: 'src/index.ts',
    output: [
        {
            dir : 'dist',
            format: 'es',
            sourcemap: true,
        },
        {
            file : 'assets/js/tunepad-ui.min.js',
            format : 'iife',
            name : 'TunePadUI',
            sourcemap : true,
            plugins : [terser ()]
        }
    ],
    plugins: [
        html({include: ['**/*.module.html', '**/*.svg' ]}),
        css(),
        serve('.'),
        typescript({ sourceMap: true }),
        nodeResolve()
    ]
};
