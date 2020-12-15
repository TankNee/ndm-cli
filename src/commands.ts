import path from "path";
import _ from "lodash";
import fs from "fs";
import { getFormatDate, isNullOrEmpty } from "./utlis";
import shell from "shelljs";

export function createNewNote(name: string, sub: string[], options: any) {
    let notePath = sub[0];
    const baseDir = process.env["FOLDER"] || "";
    notePath = path.isAbsolute(notePath)
        ? notePath
        : path.resolve(process.cwd(), baseDir, notePath);
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
}

export function uploadImage(name: string, sub: string[], options: any) {
    // TODO:
    const uploadImageCommand = process.env["PICTURE_CLI"] || "";
    const application = uploadImageCommand.split(" ")[0];
    if (!shell.which(application)) {
        console.error("%s : command not found", application);
        shell.exit(1);
    }
}

export function linkMakrdownNotes(name: string, sub: string[], options: any) {
    // TODO:
}
