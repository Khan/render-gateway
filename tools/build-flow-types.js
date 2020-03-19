// @flow
/* eslint-disable no-console, import/no-commonjs */
/**
 * Build flow type files for exports.
 *
 * Generates *.js.flow files in dist for each file that is an export for
 * a given package. It means we have to ship source code but we're doing that
 * anyway right now, so no worries.
 *
 * Besides index.js files, we also export some other specific files for
 * general consumption. In order to make this scalable, but reasonably fast
 * we assume that each index.js file has a header in it that identifies
 * additional export files. That way we only need to look for index.js files
 * and read those to work out the rest. This makes it at least a little
 * scalable but also self-documenting.
 */
const {promisify} = require("util");
const fs = require("fs");
const path = require("path");
const ancesdir = require("ancesdir");

/**
 * Let's use async/await to make life nicer.
 */
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

/**
 * Some regex's we use to support our additional-files syntax.
 */
/**
 * The first extracts the @additional-exports block, which looks like this:
 *
 * @additional-exports [
 *    "./filea.js",
 *    "./fileb.js",
 * ]
 *
 * Paths in that block are assumed to be relative to the directory of the file
 * declaring them.
 *
 * The second regex grabs the filenames themselves from this block.
 */
const regexAdditionalFiles = /^(?:\s*.*@additional-exports\s?\[)((?:\s*.*"(?:[./\-\w]+)",\s*)*)(?:\s*.*\])$/im;
const regexExtractFile = /^(?:\s*.*"([./\-\w]+)",\s*)$/gim;

/**
 * Get the list of files that a given package exports.
 */
const getExportsFrom = async (
    filePath /*: string*/,
) /*: Promise<Array<string>>*/ => {
    /**
     * We assume the file we're given is an export as that's how our
     * additional-exports syntax works.
     */
    const files = [path.basename(filePath)];
    try {
        const fileContent = await readFileAsync(filePath);

        /**
         * First regex gets the block of file names as indicated by
         * the @additional-exports marker, between it's [] brackets.
         * We don't need to loop the regex here as we only want the first
         * match. We don't care if there are more.
         *
         * The list should have one file per line within double quotes
         * and ending in a comma (went with the comma to make it feel like
         * our coding standard).
         */
        const additionalFilesMatch = regexAdditionalFiles.exec(fileContent);
        if (additionalFilesMatch != null && additionalFilesMatch[1] != null) {
            /**
             * We have a match, so let's now parse each file and add that to
             * our list.
             */
            let additionalFileMatch;
            do {
                additionalFileMatch = regexExtractFile.exec(
                    additionalFilesMatch[1],
                );
                if (
                    additionalFileMatch != null &&
                    additionalFileMatch[1] != null
                ) {
                    files.push(additionalFileMatch[1]);
                }
            } while (additionalFileMatch != null);
        }
        /**
         * We will worry about duplicates later.
         */
        return files;
    } catch (e) {
        throw new Error(`Unable to process file: ${filePath} ${e}`);
    }
};

/**
 * Write out a .js.flow file in our disk for the file specified.
 */
const writeFlowFile = (
    exportFromPath /*: string*/,
    outputPath /*: string*/,
) /*: Promise<void>*/ => {
    const contents = ["// @flow", `export * from "${exportFromPath}";`].join(
        "\n",
    );
    return writeFileAsync(outputPath, contents, "utf8");
};

/**
 * Output flow type files to our dist for our dist packages.
 */
const outputFlowTypesForDist = async () /*: Promise<void>*/ => {
    const rootDir = ancesdir(__dirname);
    const srcDir = path.normalize(path.join(rootDir, "src"));
    const distDir = path.normalize(path.join(rootDir, "dist"));

    /**
     * We only care about packages in our distribution.
     */
    const packages = fs.readdirSync(distDir);
    for (const pkg of packages) {
        console.log(`Building flow files list for ${pkg}`);

        const pkgSrcDir = path.join(srcDir, pkg);
        const pkgDistDir = path.join(distDir, pkg);

        const srcIndexJSPath = path.join(pkgSrcDir, "index.js");
        const filesThatNeedTypes = await getExportsFrom(srcIndexJSPath);

        console.info(`Generating flow files for ${pkg}`);
        for (const file of filesThatNeedTypes) {
            const fileInSrc = path.normalize(path.join(pkgSrcDir, file));
            const fileInDist = path.normalize(path.join(pkgDistDir, file));
            if (!fs.existsSync(fileInSrc)) {
                throw new Error(
                    `Invalid file path in @additional-files block for "${path.relative(
                        rootDir,
                        srcIndexJSPath,
                    )}": "${file}"`,
                );
            }

            const pathToImportFrom = path.relative(
                path.dirname(fileInDist),
                fileInSrc,
            );
            const flowFileDistPath = fileInDist + ".flow";
            console.info(`    -> ${path.relative(rootDir, flowFileDistPath)}`);

            await writeFlowFile(pathToImportFrom, flowFileDistPath);
        }
    }
};

outputFlowTypesForDist().catch((e) => console.error(`${e}`));
