const path = require('node:path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const mode = process.env.MODE || process.env.NODE_ENV || 'development';
const hot = process.argv.indexOf('--hot') > 2;

function createConfig() {
  // to control how to generate webpack's config
  const dev = mode === 'development' || mode === 'server';
  const devServer = mode === 'dev-server';
  const analyze = mode === 'analyze';
  const minimize = !dev;

  function getPlugins() {
    const devServerPlugins = [];
    const devPlugins = [];
    let analyzePlugins = [];

    if (devServer && hot) {
      devServerPlugins.plugins.concat([new webpack.HotModuleReplacementPlugin()]);
    }

    if (analyze) {
      analyzePlugins = [new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)()];
    }

    return [
      new HtmlWebpackPlugin({
        template: './src/pugjs/index.pug',
      }),
      new MiniCssExtractPlugin({
        filename: minimize ? '[name]-[hash].min.css' : '[name]-[hash].css',
      }),
      !devServer && new (require('clean-webpack-plugin').CleanWebpackPlugin)(),
      ...devPlugins,
      ...analyzePlugins,
    ].filter(Boolean);
  }

  function getRules() {
    const cssLoader = [
      {
        loader: MiniCssExtractPlugin.loader,
        options: {
          publicPath: '',
        },
      },
      'css-loader',
    ];
    return [
      {
        test: /\.css$/,
        use: cssLoader,
      },

      {
        test: /\.scss$/,
        use: [...cssLoader, 'sass-loader'],
      },

      {
        test: /\.(:?js|mjs|ejs|cjs)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },

      {
        test: /\.?worker\.(:?js|mjs|ejs|cjs)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'worker-loader',
            options: {
              filename: minimize ? '[name]-[hash].min.js' : '[name]-[hash].js',
            },
          }, // 'babel-loader'
        ],
      },

      {
        test: /\.pug$/,
        use: [
          'raw-loader',
          {
            loader: 'pug-html-loader',
            options: {
              pretty: dev,
            },
          },
        ],
      },

      {
        test: /\.(otf|eot|ttf|woff(2)?)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name(_path, query) {
                return dev ? 'fonts/[name].[ext]' : 'fonts/[contenthash].[ext]';
              },
            },
          },
        ],
      },

      {
        test: /\.(svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name(_path, query) {
                if (path.basename(_path) === 'Symbola.svg') return 'fonts/Symbola.svg';
                return dev ? 'assets/[name].[ext]' : 'assets/[contenthash].[ext]';
              },
            },
          },
        ],
      },
    ];
  }

  const config = {
    mode: dev ? 'development' : 'production',
    context: __dirname,
    entry: { app: './src/js/index.js' },
    output: {
      filename: minimize ? '[name]-[hash].min.js' : '[name]-[hash].js',
      libraryTarget: 'umd',
      library: 'rasm',
      globalObject: "(typeof self !== 'undefined' ? self : this)",
      path: path.resolve(__dirname, 'public'),
    },
    module: {
      rules: getRules(),
    },
    // externals: 'katex',
    plugins: getPlugins(),
    devtool: (devServer && 'eval-source-map') || (dev && 'source-map'),
    /** html-webpack-plugin options */
    optimization: {
      minimize,
      minimizer: [new (require('terser-webpack-plugin'))(), new (require('css-minimizer-webpack-plugin'))()],
    },
    performance: {
      hints: false,
    },
  };

  if (devServer) {
    config.devServer = {
      contentBase: path.resolve(__dirname, 'public'),
      hot,
    };
  }

  return config;
}

module.exports = createConfig();
