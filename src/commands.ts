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
    validateFilePath,
} from "./utlis";
import shell from "shelljs";
import { uploadImages } from "./api";

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
}

export function showTemplates(name: string, sub: string[], options: any) {
    // TODO: Display all templates
}

export function initHandler(name: string, sub: string[], options: any) {
    // TODO: Initial guidance
    const initPath = getAbsolutePath(sub[0]);
    fs.copyFileSync(path.resolve(__dirname, `../.ndmrc`), initPath);
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
                throw Error("upload response is invalid");
            }

            consola.info("========Replacing Images====\n");

            replaceImages(filePath, imagePaths, res);
            consola.info("========Complete Task=======\n");
        } catch (error) {
            consola.error(error.message);
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
        consola.error(error.message);
        return;
    }
}

export function linkMakrdownNotes(name: string, sub: string[], options: any) {
    // TODO:
}
