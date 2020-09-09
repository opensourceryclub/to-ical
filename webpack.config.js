const path = require("path")
// const CopyPlugin = require("copy-webpack-plugin")

const pathTo = dir => (...file) => path.join(__dirname, dir, ...file)
const src = pathTo("src")
// const dist = (...file) => path.join(__dirname, "dist", ...file)

/**
 * @type {import("webpack").ConfigurationFactory}
 * @param {"development" | "test" | "production" | undefined} env
 * @param {import("webpack").CliConfigOptions & {
 *   debug?: boolean;
 *   port?: number;
 *   output?: string | ((...files: string[]) => string);
 * }} argv
 */
module.exports = (env,
    { // Command line args
        debug,
        mode,
        port = 9000,
        output = "dist"
    }
) => (
        // Do some basic logging and stuff
        debug && console.log("[BUILD] Debug flag set"),
        env == null && console.log("[BUILD] env not set, using default value.", env),

        // Set default values
        env    = env ?? (debug ? "development" : "production"),
        mode   = mode ?? (env === "test" ? "production" : env),
        output = pathTo(output),

        // More logging after defaults are set
        console.log("[BUILD] Building application in", mode, "mode and in environment", env),

        // Build the webpack config object
        {
            entry: "./src/index.ts",
            output: {
                path: output(),
                filename: "index.js",
            },
            mode,
            devtool: (env === "production" ? "eval" : "source-map"),

            module: {
                rules: [
                    {
                        test: /\.tsx?$/,
                        use: [
                            {
                                loader: "ts-loader",
                                options: {
                                    compilerOptions: {
                                        // sourceMap: env === "production",
                                        // inlineSourceMap: env !== "production"
                                    },
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
            // plugins: [
            //     new CopyPlugin({
            //         patterns: [{ from: "./*", to: "..", context: "public" }]
            //     })
            // ],
            devServer: {
                contentBase: output(),
                port,
                compress: true,
                hot: true,
                allowedHosts: [".umd.edu"],
            }

        });
