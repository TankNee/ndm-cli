import path from "path";
import _ from "lodash";
import fs from "fs";
import consola from "consola";
import {
    generateFolderStructure,
    getAbsolutePath,
    getFormatDate,
    getImagesFromNote,
    isDirectory,
    isNullOrEmpty,
    replaceImages,
    updateConfiguration,
    validateFilePath,
} from "./utlis";
import { saveFlomo, uploadImages } from "./api";
import { flomoURL, globalConfigPath, localConfigPath } from "./index";

export function createNewNote(name: string, sub: string[], options: any) {
    let notePath = getAbsolutePath(sub[0]);
    let ext = path.extname(notePath);
    if (isNullOrEmpty(ext)) {
        notePath = path.join(
            notePath,
            `${options.type}-${getFormatDate()}.${options.ext}`
        );
    }
    if (_.startsWith(options.type, "http")) {
        // TODO: internet template
        return;
    }
    fs.copyFileSync(
        path.resolve(
            __dirname,
            `../template/${options.type}/${options.language}.${options.ext}`
        ),
        notePath
    );
}

export function setConfiguration(name: string, sub: string[], options: any) {
    // TODO: complete config function
    try {
        const tinyConfiguration = new Map();
        sub.forEach((s) => {
            const [key, value] = s.split("=");
            if (isNullOrEmpty(key) || isNullOrEmpty(value))
                throw new Error("configuration key or value is empty!");
            if (process.env[key.toUpperCase()] === undefined)
                throw new Error(
                    `It does not have a configuration key that named ${key}`
                );
            tinyConfiguration.set(key, value);
        });
        const currentConfigPath = options.global
            ? globalConfigPath
            : localConfigPath;
        if (isNullOrEmpty(currentConfigPath))
            throw new Error(
                "Couldn't detect .ndmrc file in current environment!"
            );
        tinyConfiguration.forEach((v, k) => {
            updateConfiguration(currentConfigPath, k, v);
        });
    } catch (error) {
        consola.error(error);
    }
}

export function showTemplates(name: string, sub: string[], options: any) {
    // TODO: Display all templates
}

export function initHandler(name: string, sub: string[], options: any) {
    // TODO: Initial guidance
    try {
        const initPath = getAbsolutePath(sub[0] || "");
        if (!isDirectory(initPath)) {
            throw new Error("the specified path is not a directory!");
        }
        fs.copyFileSync(
            path.resolve(__dirname, `../.ndmrc`),
            path.join(initPath, ".ndmrc")
        );
    } catch (error) {
        consola.error(error);
    }
}

export async function uploadImage(name: string, sub: string[], options: any) {
    const _uploadImage = async (filePath: string) => {
        try {
            consola.info("========Extracting Images===\n");

            const imagePaths = getImagesFromNote(filePath, true);
            if (imagePaths.length === 0) {
                consola.info("no image is detected");
            }
            consola.log("%d images are detected\n", imagePaths.length);
            consola.info("========Uploading Images====\n");

            const res = await uploadImages(
                imagePaths,
                (imagePath: string, index: number) => {
                    consola.log(
                        `(${index + 1}/${
                            imagePaths.length
                        }) Uploading ${imagePath} \n`
                    );
                }
            );

            if (!_.isArray(res) || res.length !== imagePaths.length) {
                throw new Error("upload response is invalid");
            }

            consola.info("========Replacing Images..==\n");

            replaceImages(filePath, imagePaths, res);
            consola.info("========Complete Task=======\n");
        } catch (error) {
            consola.error(error);
        }
    };
    try {
        let filePath = validateFilePath(sub[0], true);
        if (isDirectory(filePath)) {
            const folderStructure = generateFolderStructure(filePath);
            for (let index = 0; index < folderStructure.length; index++) {
                const fp = folderStructure[index];
                consola.info(
                    "No %d / %d. Uploading %s 's images\n",
                    index + 1,
                    folderStructure.length,
                    fp
                );
                await _uploadImage(fp);
                consola.success("%d Completed!\n", index + 1);
            }
        } else {
            await _uploadImage(filePath);
        }
    } catch (error) {
        consola.error(error);
        return;
    }
}

export async function sendToFlomo(name: string, sub: string[], options: any) {
    try {
        if (isNullOrEmpty(flomoURL)) {
            throw new Error(
                "Flomo Url is empty, you'd config your flomo url firstly! \n ndm config flomo_url=<your_flomo_api_url>"
            );
        }
        const message = sub[0];
        if (isNullOrEmpty(message)) {
            throw new Error("message cannot be null or empty");
        }
        const response = await saveFlomo(message);
        consola.info(response);
    } catch (error) {
        consola.error(error);
    }
}

export function linkMakrdownNotes(name: string, sub: string[], options: any) {
    // TODO:
}
