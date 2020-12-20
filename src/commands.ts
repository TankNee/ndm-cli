import path from "path";
import _ from "lodash";
import fs from "fs";
import {
    getAbsolutePath,
    getFormatDate,
    getImagesFromNote,
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
    if (!options.all) {
        // validate path
        try {
            let filePath = validateFilePath(sub[0]);

            console.log("========Extracting Images===\n");

            const imagePaths = getImagesFromNote(filePath, true);
            if (imagePaths.length === 0) {
                throw Error("no image is detected");
            }
            console.log("%d images are detected\n", imagePaths.length);
            console.log("========Uploading Images====\n");

            const { body: res } = await uploadImages(imagePaths);
            if (!res.success) {
                throw Error(res.message);
            }
            if (
                !_.isArray(res.result) ||
                res.result.length !== imagePaths.length
            ) {
                throw Error("upload response is invalid");
            }

            console.log("========Replacing Images====\n");

            replaceImages(filePath, imagePaths, res.result);
            console.log("============================\n");
            console.log(
                "%d images have uploaded successfully! They are:\n",
                res.result.length
            );
            imagePaths.forEach((img, i) => {
                console.log(`${img} => ${res.result[i]}\n`);
            });
            console.log("============================\n");
        } catch (error) {
            console.error(error.message);
            return;
        }
    }
}

export function linkMakrdownNotes(name: string, sub: string[], options: any) {
    // TODO:
}
