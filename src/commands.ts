import path from "path";
import _ from "lodash";
import fs from "fs";
import consola from "consola";
import { globalConfigPath, localConfigPath } from "./index";
import {
    generateFolderStructure,
    getAbsolutePath,
    getFormatDate,
    isDirectory,
    isNullOrEmpty,
    updateConfiguration,
    uploadSingleFile,
    validateFilePath,
} from "./utlis";

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
                    `It does not have a configuration key named ${key}`
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
            globalConfigPath,
            path.join(initPath, ".ndmrc")
        );
    } catch (error) {
        consola.error(error);
    }
}

export async function uploadImage(name: string, sub: string[], options: any) {
    try {
        const filePath = validateFilePath(sub[0], true);
        if (isDirectory(filePath)) {
            const folderStructure = generateFolderStructure(filePath, [".md"]);
            for (let index = 0; index < folderStructure.length; index++) {
                const fp = folderStructure[index];
                consola.info(
                    "No %d / %d. Uploading %s 's images\n",
                    index + 1,
                    folderStructure.length,
                    fp
                );
                await uploadSingleFile(fp);
                consola.success("%d Completed!\n", index + 1);
            }
        } else {
            await uploadSingleFile(filePath);
        }
    } catch (error) {
        consola.error(error);
        return;
    }
}

export function editImageSuffix(name: string, sub: string[], options: any) {
    try {
        const filePath = validateFilePath(sub[0], true);
        if (isDirectory(filePath)) {
            const folderStructure = generateFolderStructure(filePath, [".md"]);
            for (let index = 0; index < folderStructure.length; index++) {
                const fp = folderStructure[index];
                consola.info(
                    "No %d / %d. Editing %s 's images\n",
                    index + 1,
                    folderStructure.length,
                    fp
                );
                const suffix = sub[1] || "";
                const ext = path.extname(fp);
                const newFilePath = path.join(
                    path.dirname(fp),
                    `${path.basename(fp, ext)}-${suffix}${ext}`
                );
                fs.renameSync(fp, newFilePath);
                consola.success("%d Completed!\n", index + 1);
            }
        } else {
            const suffix = sub[1] || "";
            const ext = path.extname(filePath);
            const newFilePath = path.join(
                path.dirname(filePath),
                `${path.basename(filePath, ext)}-${suffix}${ext}`
            );
            fs.renameSync(filePath, newFilePath);
        }
    } catch (error) {
        consola.error(error);
        return;
    }
}

export function lintMakrdownNotes(name: string, sub: string[], options: any) {
    // TODO: Lint markdown notes
}
