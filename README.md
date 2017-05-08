# Pug Plugin
PugPlugin is used to handle .pug files rendering html content and MUSN'T be chained with HtmlPlugin, see details bellow.
Based on HTMLPlugin of fusebox, see [source](https://github.com/fuse-box/fuse-box/blob/master/src/plugins/HTMLplugin.ts) and (doc)[http://fuse-box.org/#html-plugin]
## Install
    npm i --save fusebox-pug-plugin
    
## Usage

### Typescript

```Typescript
import {PugPlugin} from "fusebox-pug-plugin";
let fuse = fsbx.FuseBox.init({
    homeDir: "./src",
    outFile: "./bundle.js",
    plugins: [
	    PugPlugin()
    ]
});
```
### Javascript (ES6)

```javascript
const PugPlugin = require("fusebox-pug-plugin").PugPlugin;
let fuse = fsbx.FuseBox.init({
    homeDir: "./src",
    outFile: "./bundle.js",
    plugins: [
	    PugPlugin()
    ]
});
```
### Options
The options availables are specified in IPugPluginOptions interface:

 Option     | Default | Description                                                                  
------------|---------|------------------------------------------------------------------------------
 hmr        | true    | Define if emitJavascriptHotReload should be invoked after render component   
 useDefault | true    | Define if the file should be exporting with default                          
 pug        |         | Any pug options. See [options](https://pugjs.org/api/reference.html#options )
 pug.pretty | true    | Pretty output                                                                

```Typescript
import {PugPlugin,IPugPluginOptions} from "fusebox-pug-plugin";
let pugPluginOptions:IPugPluginOptions = {
   hmr:true,// If true, emitJavascriptHotReload will be invoked after render component
   useDefault:true,//If true, the file could be imported using default export
   pug:{//Any pug option
       pretty:true
   }
}
let fuse = fsbx.FuseBox.init({
    homeDir: "./src",
    outFile: "./bundle.js",
    plugins: [
	    PugPlugin(pugPluginOptions)
    ]
});
```	
### Macros for include
You have 2 special macros availables:

#### Tilde
Use tilde ( ~ ) to import files from root (homeDir from fuse configuration)
Using:
```
root
 |- folder
 |    |-subfolder
 |		  |- file2.pug
 |-  file.pug 
```
root/folder/subfolder/file2.pug
```jade
include ~/file
//- Is the same as
include ../../file
```

#### node:
Use node: to import files from node_modules folder
Using:
```
root
 |- node_modules
 |		 |- module
 |			 |-moduleFile.pug
 |- folder
 |    |-subfolder
 |		  |- file.pug
```
root/folder/subfolder/file.pug
```jade
include node:module/moduleFile
//- Is the same as
include ../../../node_modules/module/moduleFile
```

### Authors
- [Davinchi](http://www.davinchi.es/) Need help / support? Create an issue or contact with us

### Notes
#### HtmlPlugin
Pug allows to include and extend from other pug files, when a file is modified, pug doesn't track by default the dependencies, HtmlPlugin by default uses caching to speed up bundling, with the cache if a file included is updated the file included won't be updated.
To prevent this, is necessary compile all the pug files with each modification (yes, it's a pity).
Exists a tool called pug-inheritance that get all the files that uses another file, fusebox only notifies the file imported in .js/.ts so is not possible use pug-inheritance.
For example:
```Typescript
import template from "./myFile.pug"
```
myFile.pug
```jade
include ./_otherFile.pug
```
_otherFile.pug
```jade
//Some content
```
pug-inheritane reciebes _otherFile.pug and is capable of get all the files that use _otherFile.pug, but the file tracked by fusebox is myFile.pug so is not possible to know when _otherFile.pug changes

If you find another way please feel free to contribute :)
