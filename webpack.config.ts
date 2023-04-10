import TerserPlugin from 'terser-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import path from 'path';
import webpack from 'webpack';
import nodeExternals from 'webpack-node-externals';

const config: webpack.Configuration = {
  target: 'node',
  entry: './src/notes-parser.ts',
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'package.json' },
        { from: 'README.md' },
        { from: 'out/src/notes-parser.d.ts' },
        { from: 'out/src/asset-crawler.d.ts' },
        { from: 'out/src/types/common.d.ts', to: 'types' },
        { from: 'out/src/types/listed-stocks.d.ts', to: 'types' },
        { from: 'out/src/types/corporative-events.d.ts', to: 'types' },
        { from: 'out/src/types/listed-real-estates.d.ts', to: 'types' },
      ]
    })
  ],
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [{
          loader: 'ts-loader'
        }],
        include: __dirname,
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.ts']
  },
  output: {
    libraryTarget: 'commonjs',
    filename: 'notes-parser.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devtool: 'source-map',
  externals: [nodeExternals()]
};

export default config;