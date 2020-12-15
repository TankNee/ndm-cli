#! node#!/usr/bin/env node
import args from "args";
import { createNewNote } from "./commands";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

/**
 * Load configuration from .ndmrc file if it exists
 */
if (fs.existsSync(path.join(process.cwd(), ".ndmrc"))) {
    dotenv.config({ path: path.join(process.cwd(), ".ndmrc") });
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

args.command(
    "new",
    "create a note by template in current folder or the folder specified by config file (.ndmrc)",
    createNewNote
);

args.examples([
    {
        usage: "ndm new ./note/test.md -l zh-cn -t leetcode -e md",
        description:
            "create a markdown note in relative path ./note which name is test.md and apply template by zh-cn",
    },
]);

args.parse(process.argv);
