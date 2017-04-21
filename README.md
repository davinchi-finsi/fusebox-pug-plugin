# Pug Plugin
PugPlugin is used to handle .pug files rendering html content and MUSN'T be chained with HtmlPlugin, see details here.

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
Pug allows to include and extend pug files, when a file is modified, pug doesn't track by default the rest of files that uses the updated file, HtmlPlugin by default uses caching to speed up bundling, with the cache if a file included is updated the file that includes it won't be updated.
To prevent this, is necessary compile all the pug files with each modification (yes, it's a pity).
Exists a tool called pug-inheritance but in order to use it is necessary knows the file that is included or extended, fusebox only notifies the file imported in .js/.ts so is not possible use pug-inheritance.
If you find another way please feel free to contribute :)