#!/usr/bin/env node
import args from "args";
import {
    createNewNote,
    initHandler,
    setConfiguration,
    showTemplates,
    uploadImage,
    linkMakrdownNotes,
} from "./commands";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

/**
 * Load configuration from .ndmrc file if it exists
 */
if (fs.existsSync(path.join(process.cwd(), ".ndmrc"))) {
    dotenv.config({ path: path.join(process.cwd(), ".ndmrc") });
} else {
    dotenv.config({ path: path.resolve(__dirname, "../.ndmrc") });
}
/**
 * Definition
 */

args.options([
    {
        name: "language",
        description:
            "choose the language of note template, en-us,zh-cn etc. -l or --language",
        defaultValue: "zh-cn",
    },
    {
        name: "type",
        description:
            "choose the type of note template. leetcode, plain note or costum template from internet(https://...) etc. -t or --type <type name>",
        defaultValue: "leetcode",
    },
    {
        name: "ext",
        description: "extension of note file, md,txt etc.",
        defaultValue: "md",
    },
]);
/**
 * Create new note template
 */
args.command(
    "create",
    "create a note by template in current folder or the folder specified by config file (.ndmrc)",
    createNewNote
);
/**
 * Show all templates that have installed
 */
args.command(
    "templates",
    "show all templates that have installed",
    showTemplates
);

args.command(
    "init",
    "initialize the note folder, providing a simple configuration file with .ndmrc",
    initHandler
);

args.command(
    "config",
    "config local .ndmrc file by command line interface",
    setConfiguration
);

args.command(
    "upload",
    "upload local images which are found in note files",
    uploadImage
);

args.command(
    "lint",
    "lint markdown note files using the remark cli",
    linkMakrdownNotes
);

args.examples([
    {
        usage: "ndm create ./note/test.md -l zh-cn -t leetcode -e md",
        description:
            "create a markdown note in relative path ./note which name is test.md and apply template by zh-cn",
    },
]);

args.parse(process.argv);
