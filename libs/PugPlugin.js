"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Config_1 = require("fuse-box/dist/commonjs/Config");
const extend = require("extend");
const path = require("path");
let pug;
let pugLoad;
/**
 * @export
 * @class PugPluginClass
 * @implements {Plugin}
 * @description Plugin for compile and include pug
 * Allows to use ~/ to import from root and node: to import from node_modules
 */
class PugPluginClass {
    constructor(options) {
        this._rootRegex = new RegExp(/^~\//);
        this._rootReplaceRegex = new RegExp(/^~/);
        this._nodeModulesRegex = new RegExp(/^node:/);
        this._nodeModulesReplaceRegex = new RegExp(/^node:/);
        this._extend = extend;
        this._path = path;
        /**
         * @type {RegExp}
         * @memberOf PugPluginClass
         */
        this.test = /\.pug$/;
        this.options = this._extend(true, PugPluginClass.DEFAULTS, options || {});
    }
    init(context) {
        this.options.basedir = this.options.basedir || context.homeDir;
        context.allowExtension(".pug");
    }
    /**
     * Resolve paths from root or node
     * @param filename
     * @param source
     * @param options
     * @returns {any}
     * @private
     */
    _pugResolver(filename, source, options) {
        let result = filename;
        //if ~, resolve path from root
        if (this._rootRegex.test(filename)) {
            result = this._path.join(this.options.basedir, filename.replace(this._rootReplaceRegex, ""));
        }
        else if (this._nodeModulesRegex.test(filename)) {
            result = this._path.join(Config_1.Config.NODE_MODULES_DIR, filename.replace(this._nodeModulesReplaceRegex, ""));
        }
        else {
            result = pugLoad.resolve(filename, source, options);
        }
        return result;
    }
    /**
     * @param {File} file
     * @memberOf PugPluginClass
     */
    transform(file) {
        const context = file.context;
        const options = Object.assign({}, this.options);
        file.loadContents();
        if (!pug) {
            pug = require("pug");
        }
        if (!pugLoad) {
            pugLoad = require("pug-load");
        }
        options.filename = options.filename || file.info.fuseBoxPath;
        let content = pug.renderFile(file.absPath, {
            basedir: context.homeDir,
            pugPlugin: this,
            plugins: [
                {
                    "resolve": this._pugResolver.bind(this)
                }
            ]
        });
        if (this.options.useDefault) {
            file.contents = `module.exports.default =  ${JSON.stringify(content)};`;
        }
        else {
            file.contents = `module.exports =  ${JSON.stringify(content)};`;
        }
        return file.content;
    }
}
PugPluginClass.DEFAULTS = {
    pretty: true,
    useDefault: true
};
exports.PugPluginClass = PugPluginClass;
exports.PugPlugin = (opts) => {
    return new PugPluginClass(opts);
};
//# sourceMappingURL=PugPlugin.js.map