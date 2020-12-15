<h2 align="center">Note Dispose Manager</h2>

> A simple cli for note create

### Help Infomation

```bash
Usage: index.js [options] [command]

  Commands:
    config     config local .ndmrc file by command line interface
    create     create a note by template in current folder or the folder specified by config file (.ndmrc)
    help       Display help
    init       initialize the note folder, providing a simple configuration file with .ndmrc
    lint       lint markdown note files using the remark cli
    templates  show all templates that have installed
    upload     upload local images which are found in note files
    version    Display version

  Options:
    -e, --ext [value]       extension of note file, md,txt etc. (defaults to "md")
    -h, --help              Output usage information
    -l, --language [value]  choose the language of note template, en-us,zh-cn etc. -l or --language (defaults to "zh-cn")
    -t, --type [value]      choose the type of note template. leetcode, plain note or costum template from internet(https://...) etc. -t or --type <type name> (defaults to "leetcode")
    -v, --version           Output the version number

  Examples:
    - create a markdown note in relative path ./note which name is test.md and apply template by zh-cn
    $ ndm create ./note/test.md -l zh-cn -t leetcode -e md
```

