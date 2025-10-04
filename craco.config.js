module.exports = {
    webpack: {
        configure: (webpackConfig) => {
            // Disable ESLint plugin to avoid React 19 compatibility issues
            webpackConfig.plugins = webpackConfig.plugins.filter(
                (plugin) => plugin.constructor.name !== 'ESLintWebpackPlugin'
            );

            // Disable React Refresh plugin in production
            if (process.env.NODE_ENV === 'production') {
                webpackConfig.plugins = webpackConfig.plugins.filter(
                    (plugin) => plugin.constructor.name !== 'ReactRefreshPlugin'
                );
            }

            // Fix for React 19 - resolve React to the installed version
            webpackConfig.resolve = {
                ...webpackConfig.resolve,
                alias: {
                    ...webpackConfig.resolve.alias,
                },
            };

            // Configure sass-loader to use modern Dart Sass API and silence deprecations
            const sassRule = webpackConfig.module.rules.find(
                (rule) => rule.oneOf
            );
            if (sassRule) {
                sassRule.oneOf.forEach((rule) => {
                    if (rule.test && rule.test.toString().includes('scss|sass')) {
                        rule.use.forEach((loader) => {
                            if (loader.loader && loader.loader.includes('sass-loader')) {
                                loader.options = {
                                    ...loader.options,
                                    api: 'modern',
                                    sassOptions: {
                                        silenceDeprecations: ['legacy-js-api', 'color-functions', 'import', 'global-builtin'],
                                    },
                                };
                            }
                        });
                    }
                });
            }

            return webpackConfig;
        },
    },
    babel: {
        loaderOptions: (babelLoaderOptions, { env }) => {
            // Completely disable react-refresh in production
            if (env === 'production' || process.env.NODE_ENV === 'production') {
                // Remove all react-refresh related plugins
                if (babelLoaderOptions.plugins) {
                    babelLoaderOptions.plugins = babelLoaderOptions.plugins.filter(
                        (plugin) => {
                            if (typeof plugin === 'string' && plugin.includes('react-refresh')) {
                                return false;
                            }
                            if (Array.isArray(plugin) && plugin[0] &&
                                (plugin[0].includes('react-refresh') || plugin[0].includes('react-dev-utils'))) {
                                return false;
                            }
                            return true;
                        }
                    );
                }
            }
            return babelLoaderOptions;
        },
    },
};
