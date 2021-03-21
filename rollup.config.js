import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import fs from 'fs';
import path from 'path';
import css from 'rollup-plugin-css-only';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

const production = !process.env.ROLLUP_WATCH || false;

export default fs
  .readdirSync(path.join(__dirname, 'webviews', 'pages'))
  .map((input) => {
    const name = input.split('.')[0];
    return {
      input: 'webviews/pages/' + input,
      output: [
        {
          file: 'out/compiled/' + name + '.js',
          name: 'app',
          sourcemap: 'inline',
          format: 'iife',
        },
      ],
      plugins: [
        peerDepsExternal(),
        resolve({
          browser: true,
          dedupe: ['react', 'react-dom'],
        }),
        replace({
          'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        commonjs(),
        typescript({
          tsconfig: 'webviews/tsconfig.json',
          sourceMap: !production,
          inlineSources: !production,
        }),
        css({ output: name + '.css' }),
      ],
    };
  });
