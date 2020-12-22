#!/usr/bin/env node
import args from "args";
import shell from "shelljs";
import {
    createNewNote,
    initHandler,
    setConfiguration,
    showTemplates,
    uploadImage,
    linkMakrdownNotes,
    sendToFlomo,
} from "./commands";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import consola from "consola";
import { isNullOrEmpty } from "./utlis";

/**
 * Load configuration from .ndmrc file if it exists
 */
let _configurationPath: string = "";
if (fs.existsSync(path.join(process.cwd(), ".ndmrc"))) {
    _configurationPath = path.join(process.cwd(), ".ndmrc");
}
export const globalConfigPath = path.resolve(__dirname, "../.ndmrc");

dotenv.config({
    path: isNullOrEmpty(_configurationPath)
        ? globalConfigPath
        : _configurationPath,
});

export const localConfigPath = _configurationPath;
export const picgoURL = process.env["PICGO_URL"] || "";
export const flomoURL = process.env["FLOMO_URL"] || "";

if (isNullOrEmpty(picgoURL)) {
    consola.error("fail to load picgo url from .ndmrc");
    shell.exit(1);
}
/**
 * Definition
 */

args.options([
    {
        name: "language",
        description:
            "Choose the language of note template, en-us,zh-cn etc. -l or --language",
        defaultValue: "zh-cn",
    },
    {
        name: "type",
        description:
            "Choose the type of note template. leetcode, plain note or costum template from internet(https://...) etc. -t or --type <type name>",
        defaultValue: "leetcode",
    },
    {
        name: "ext",
        description: "Extension of note file, md,txt etc.",
        defaultValue: "md",
    },
    {
        name: "all",
        description: "Upload all images of a folder",
    },
    {
        name: "recursion",
        description: "Recursively call the input to file path",
    },
    {
        name: "global",
        description: "Set global .ndmrc file",
    },
]);
/**
 * Create new note template
 */
args.command(
    "create",
    "Create a note by template in current folder or the folder specified by config file (.ndmrc)",
    createNewNote
);
/**
 * Show all templates that have installed
 */
args.command(
    "templates",
    "Show all templates that have installed",
    showTemplates
);

args.command(
    "init",
    "Initialize the note folder, providing a simple configuration file with .ndmrc",
    initHandler
);

args.command(
    "config",
    "Config local .ndmrc file by command line interface",
    setConfiguration
);

args.command(
    "upload",
    "Upload local images which are found in note file",
    uploadImage
);

args.command("flomo", "Save message to flomo", sendToFlomo);

args.command(
    "lint",
    "Lint markdown note files using the remark cli",
    linkMakrdownNotes
);

args.examples([
    {
        usage: "ndm create ./note/test.md -l zh-cn -t leetcode -e md",
        description:
            "Create a markdown note in relative path ./note which name is test.md and apply template by zh-cn",
    },
    {
        usage: "ndm flomo 'Hello Flomo!' ",
        description: "Send message to flomo app!",
    },
    {
        usage: "ndm config flomourl=123123 <-g>",
        description:
            "Config your .ndmrc file which is found on the local scale or global.",
    },
]);

args.parse(process.argv);
