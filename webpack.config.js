// @ts-check
const path = require("path")
// const CopyPlugin = require("copy-webpack-plugin")

const pathTo = dir => (...file) => path.join(__dirname, dir, ...file)
const src = pathTo("src")
const dist = (...file) => path.join(__dirname, "dist", ...file)

/**
 * @type {import("webpack").Configuration}
 */
module.exports = (
    {
        entry: src("index.ts"),
        output: {
            path: dist(),
            filename: "index.js",
        },
        devtool: "nosources-source-map",
        cache: {
            type: "filesystem",
            cacheDirectory: ".cache/webpack",
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: [
                        {
                            loader: "ts-loader",
                            options: {
                                reportFiles: [
                                    "src/**/*.{ts,tsx}",
                                    "!*.spec.{ts,tsx}",
                                    "!*.test.{ts,tsx}",
                                ]
                            }
                        }
                    ],
                    exclude: [
                        /node_modules/
                    ],
                } // !ts-loader
            ], // !rules
        }, // !module
        resolve: {
            extensions: [".tsx", ".ts", ".js", ".jsx"],
        },
        devServer: {
            contentBase: dist(),
            compress: true,
            hot: true,
            port: 9000,
            allowedHosts: [".umd.edu"],
        }

    });
