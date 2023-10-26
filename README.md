# README

This extension is designed to add IDE capability to vscode. With this extension, 
data in json files, relative and absolute paths of files or directories in the
workspace can be used. For this, the following keywords are used in the 
settings files.

 - ${clicked_abs_path}
 - ${clicked_rel_path}
 - ${json_file_path}
 - ${json_file.data}

## Commands

 - `swotide.jsonFile` : Path of json file to read data.
 - `swotide.changeBsp` : Explorer view command. 
 - `swotide.cleanBuild` : Explorer view command. 
 - `swotide.downloadToTarget` : Explorer view command. 
 - `swotide.changeBspAndCleanBuild` : Explorer view command. 
 - `swotide.cleanBuildAndDownloadToTarget` : Explorer view command. 
 - `swotide.changeBspAndCleanBuildAndDownloadToTarget` : Explorer view command. 
 - `swotide.objDump` : Explorer view command. 
 - `swotide.selectElfForDebug` : Explorer view command. 
 - `swotide.openTftp` : Explorer view command. 
 - `swotide.runItInQemu` : Explorer view command. 

## Examples

### Example 1

TFTP can be started in the desired folder by adding the following command to the
settings (json) file.

```
"swotide.openTftp" : "tftp ${clicked_rel_path}"
```
If this code is run on the example folder, below code will be run in the terminal.

```
$ tftp example
```

### Example 2

Objdump of the desired elf file can be obtained by adding the following command to the settings (json) file.

```
"swotide.objDump" : "objdump ${clicked_abs_path}",
```

If this code is run on the `/home/desktop/a.elf` folder, below code will be run in the terminal.

```
$ objdump /home/desktop/a.elf
```

### Example 3

The information in the json file can be used by adding the following command to the settings (json) file.

```
"swotide.jsonFile" : "/home/desktop/file.json",
"swotide.downloadToTarget" : "qemu.exe --target=${json:target.target_name} -path=${clicked_abs_path}"
```

json file: `/home/desktop/file.json`
```
{
    "target": {
        "target_name": "qemu",
    }
}
```

If this code is run on the `/home/desktop/a.elf` folder, below code will be run in the terminal.

```
$ target_runner.py --target=qemu -path=/home/desktop/a.elf
```

### Example 4

Json file name can be use by adding the following command to the settings (json) file.

```
"swotide.objDump" : "echo ${json_file_path}",
```

If this code is run, below code will be run in the terminal.

```
$ echo /home/desktop/file.json
```

### Example 4

The information in the vscode configuration file can be used by adding the following command to the settings (json) file.

```
"swotide.cleanBuild": "echo ${config:swotcode.env.target} > ${clicked_abs_path}/ss.log",
"swotcode" : {
    "env" :{
        "target": "raspberry"
    }
},
```

If this code is run on the "log" folder, below code will be run in the terminal.

```
$ echo raspberry > log/ss.log
```