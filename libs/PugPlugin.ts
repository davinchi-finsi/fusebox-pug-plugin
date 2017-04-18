/**
 * @license
 * Copyright Davinchi. All Rights Reserved.
 */
import {File} from "fuse-box/dist/commonjs/core/File";
import {WorkFlowContext} from "fuse-box/dist/commonjs/core/WorkflowContext";
import {Plugin} from "fuse-box/dist/commonjs/core/WorkflowContext";
import {Config} from "fuse-box/dist/commonjs/Config";
import * as extend from "extend";
import * as path from "path";
let pug;
let pugLoad;
/**
 * @export
 * @class PugPluginClass
 * @implements {Plugin}
 * @description Plugin for compile and include pug
 * Allows to use ~/ to import from root and node: to import from node_modules
 */
export class PugPluginClass implements Plugin {
    protected static readonly DEFAULTS = {
        pretty: true,
        useDefault: true
    };
    protected _rootRegex = new RegExp(/^~\//);
    protected _rootReplaceRegex = new RegExp(/^~/);
    protected _nodeModulesRegex = new RegExp(/^node:/);
    protected _nodeModulesReplaceRegex = new RegExp(/^node:/);
    protected _extend = extend;
    protected _path = path;
    /**
     * @type {RegExp}
     * @memberOf PugPluginClass
     */
    public test: RegExp = /\.pug$/;
    public options: any;

    constructor(options: any) {
        this.options = this._extend(true, PugPluginClass.DEFAULTS, options || {});
    }

    public init(context: WorkFlowContext) {
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
    protected _pugResolver(filename, source, options) {
        let result = filename;
        //if ~, resolve path from root
        if (this._rootRegex.test(filename)) {
            result = this._path.join(this.options.basedir, filename.replace(this._rootReplaceRegex, ""));
        } else if (this._nodeModulesRegex.test(filename)) {//if node: , resolve path from node modules
            result = this._path.join(Config.NODE_MODULES_DIR, filename.replace(this._nodeModulesReplaceRegex, ""));
        } else {//otherwise, use default pug resolver
            result = pugLoad.resolve(filename, source, options);
        }
        return result;
    }

    /**
     * @param {File} file
     * @memberOf PugPluginClass
     */
    public transform(file: File) {
        const context: WorkFlowContext = file.context;
        const options = {...this.options};
        file.loadContents();
        if (!pug) {
            pug = require("pug");
        }
        if (!pugLoad) {
            pugLoad = require("pug-load");
        }
        options.filename = options.filename || file.info.fuseBoxPath;
        let content = pug.renderFile(file.absPath,
            {
                basedir: context.homeDir,
                pugPlugin: this,
                plugins: [//resolver function as plugin
                    {
                        "resolve": this._pugResolver.bind(this)
                    }
                ]
            }
        );
        if (this.options.useDefault) {
            file.contents = `module.exports.default =  ${JSON.stringify(content)};`;
        } else {
            file.contents = `module.exports =  ${JSON.stringify(content)};`;
        }
        return file.content;
    }
}

export const PugPlugin = (opts: any) => {
    return new PugPluginClass(opts);
};