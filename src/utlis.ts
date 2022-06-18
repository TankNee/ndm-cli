import fs from "fs";
import path from "path";
import ora from "ora";
import _ from "lodash";
import consola from "consola";
import markdownIt from "markdown-it";
import { uploadImages } from "./api";

const md = new markdownIt({ html: true });

export function isNullOrEmpty(obj: any) {
    return _.isNull(obj) || _.isEmpty(obj);
}
/**
 * Get formatted date string
 * yyyy-MM-dd HH:mm:ss
 * @param {Date} originDate
 */
export function getFormatDate(originDate: Date | null = null) {
    var date = originDate ? originDate : new Date();
    var month: number | string = date.getMonth() + 1;
    var strDate: number | string = date.getDate();
    var hour: number | string = date.getHours();
    var minute: number | string = date.getMinutes();
    var second: number | string = date.getSeconds();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    if (hour >= 0 && hour <= 9) {
        hour = "0" + hour;
    }
    if (minute >= 0 && minute <= 9) {
        minute = "0" + minute;
    }
    if (second >= 0 && second <= 9) {
        second = "0" + second;
    }
    var currentDate =
        date.getFullYear() +
        "-" +
        month +
        "-" +
        strDate +
        " " +
        hour +
        ":" +
        minute +
        ":" +
        second;
    return currentDate;
}
/**
 * get local images from note base directory
 * @param absolutePath
 */
export function getLocalImages(absolutePath: fs.PathLike) {
    // TODO: Get local Images
}
/**
 * I don't think there's an existing function to do this, but one approach springs to mind: convert the Markdown to HTML,
 * and go through the <img> tags. The latter seems more robust, it a little more work. (You could use regular expressions,
 * if you know nobody will use HTML <img> links.)
 * @param filePath
 * @param onlyLocal
 */
export function getImagesFromNote(
    filePath: fs.PathLike,
    onlyLocal: boolean = false
) {
    // TODO:
    let file = fs.readFileSync(filePath, { encoding: "utf-8" });

    file = md.render(file);
    // file = file.replace(/\s+/g, "%20");
    const pattern = /<img[^<>]*?\ssrc=['\"]?(.*?)['\"]?\s.*?>/g;
    let matches = file.match(pattern) || [];
    let result: string[] = [];
    for (let match of matches) {
        // match = match.replace(/\s+/g, "%20");
        const linkMatch = match.match(/src=['\"]?(.*?)['\"]+\s.*?/) || [];
        result.push(linkMatch[1]);
    }
    return result
        .filter((v) => !isNullOrEmpty(v))
        .filter((v) => onlyLocal && !_.startsWith(v, "http"));
}

export function replaceImages(
    filePath: fs.PathLike,
    imagePaths: string[],
    uploadedUrls: string[]
) {
    let file = fs.readFileSync(filePath, { encoding: "utf-8" });
    imagePaths.map((imagePath, index) => {
        file = file.replace(imagePath, uploadedUrls[index]);
    });
    fs.writeFileSync(filePath, file);
}

export function getAbsolutePath(notePath: string, rootPath: string = "") {
    const baseDir = process.env["FOLDER"] || "";
    notePath = path.isAbsolute(notePath)
        ? notePath
        : path.resolve(rootPath ? rootPath : process.cwd(), baseDir, notePath);
    return notePath;
}
/**
 * Validate File Path
 * @param filePath
 * @throws
 */
export function validateFilePath(
    filePath: string,
    allowDirectory: boolean = false,
    rootPath: string = ""
) {
    if (isNullOrEmpty(filePath)) {
        throw new Error(
            "you should convey a file path if you don't add the -a flag"
        );
    }
    const absolutePath = getAbsolutePath(filePath, rootPath);
    if (!fs.existsSync(absolutePath)) {
        throw new Error("this path does not exist!");
    }
    const stat = fs.statSync(absolutePath);
    if (!allowDirectory && stat.isDirectory()) {
        throw new Error("this path is a directory! Instead of a file path!");
    }
    return absolutePath;
}
/**
 * Complete the note image path
 * @param imagePath
 * @param notePath
 * @returns {string}
 */
export function completeImagePath(imagePath: string, notePath: string): string {
    let absolutePath: string = "";
    try {
        if (isNullOrEmpty(imagePath)) {
            throw new Error("this image path is empty.");
        }
        absolutePath = validateFilePath(
            imagePath,
            false,
            path.dirname(notePath)
        );
    } catch (e) {
        consola.error(e);
        return "";
    }
    return absolutePath;
}

export function isDirectory(filePath: string) {
    const stat = fs.statSync(filePath);
    return stat.isDirectory();
}
/**
 *
 * @param folderPath absolute folder path
 * @param fileExt file extension eg: [".md", ".markdown"]
 */
export function generateFolderStructure(folderPath: string, fileExt: string[]) {
    var children: string[] = [];
    fs.readdirSync(folderPath).forEach(function (fileName) {
        var tempPath = path.join(folderPath, fileName);
        var stat = fs.statSync(tempPath);
        if (stat && stat.isDirectory()) {
            children = children.concat(generateFolderStructure(tempPath, fileExt));
        } else {
            // TODO: add a file extension filter
            const ext = path.extname(tempPath);
            if (fileExt.includes(ext)) {
                children.push(tempPath);
            }
        }
    });

    return children;
}

export function updateConfiguration(
    currentConfigPath: string,
    key: string,
    value: string
) {
    let file = fs.readFileSync(currentConfigPath, { encoding: "utf-8" });
    const pattern = new RegExp(`${key.toUpperCase()}[^\n]*`);
    file = file.replace(pattern, `${key.toUpperCase()}=${value}`);
    fs.writeFileSync(currentConfigPath, file, { encoding: "utf-8" });
    consola.success(
        "Update configuration successfully: %s => %s",
        key.toUpperCase(),
        value
    );
}

export async function uploadSingleFile(filePath: string) {
    try {
        const spinner = ora("Extracting Images").start();
        consola.info("Extracting Images\n");

        const imagePaths = getImagesFromNote(filePath, true);
        if (imagePaths.length === 0) {
            consola.info("no image is detected");
            return;
        }
        consola.info("%d images are detected\n", imagePaths.length);
        consola.info("Validating Image Paths\n");
        const validatedPaths = imagePaths.map((ip) =>
            completeImagePath(ip, filePath)
        );
        if (validatedPaths.filter((vp) => vp.length).length === 0) {
            consola.info(validatedPaths);
            consola.error("No validated images are detected.\n");
            return;
        }
        consola.info("Uploading Images\n");

        const res = await uploadImages(
            validatedPaths,
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

        consola.info("Replacing Images..\n");

        replaceImages(filePath, imagePaths, res);
        consola.info("Complete Task\n");
    } catch (error) {
        consola.error(error);
        return;
    }
}

export function updateSingleFileImageSuffix(filePath: string, src: string, dest: string) {
    try {
        consola.info("Extracting Images\n");
        const imagePaths = getImagesFromNote(filePath, true);
    } catch (error) {
        consola.error(error);
        return;
    }
}