import path from "path";
import _ from "lodash";
import fs from "fs";
import { getFormatDate, isNullOrEmpty } from "./utlis";
export function createNewNote(name: string, sub: string[], options: any) {
    let notePath = sub[0];
    if (isNullOrEmpty(notePath)) {
        // dispose the situtation of null note path
    }
    notePath = path.isAbsolute(notePath)
        ? notePath
        : path.resolve(process.cwd(), notePath);
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
