/**
 * @license
 * Copyright Davinchi. All Rights Reserved.
 */
/// <reference path="../node_modules/@types/pug/index.d.ts"/>
import {File} from "fuse-box/dist/commonjs/core/File";
import {WorkFlowContext} from "fuse-box/dist/commonjs/core/WorkflowContext";
import {Plugin} from "fuse-box/dist/commonjs/core/WorkflowContext";
import {Config} from "fuse-box/dist/commonjs/Config";
import * as extend from "extend";
import * as path from "path";
import * as pug from "pug";
export interface IPugPluginOptions{
    hmr?:boolean;//If true, emitJavascriptHotReload will be invoked after render component
    pug?:pug.Options;
}
/**
 * @export
 * @class PugPluginClass
 * @implements {Plugin}
 * @description Plugin for compile and include pug
 * Allows to use ~/ to import from root and node: to import from node_modules
 */
export class PugPluginClass implements Plugin {
    protected static readonly DEFAULTS = {
        hmr:true,
        useDefault: true,
        pug: {
            pretty: true
        }
    };
    protected _rootRegex = new RegExp(/^~\//);
    protected _rootReplaceRegex = new RegExp(/^~/);
    protected _nodeModulesRegex = new RegExp(/^node:/);
    protected _nodeModulesReplaceRegex = new RegExp(/^node:/);
    protected _extend = extend;
    protected _path = path;
    protected _pug = pug;
    protected _pugLoad;
    /**
     * @type {RegExp}
     * @memberOf PugPluginClass
     */
    public test: RegExp = /\.pug$/;
    public options: any;

    constructor(options:IPugPluginOptions) {
        this.options = this._extend(true, PugPluginClass.DEFAULTS, options || {});
        this.options.pug.pugPlugin= this;
        this.options.pug.plugins = [//resolver function as plugin
            {
                "resolve": this._pugResolver.bind(this)
            }
        ];
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
            result = this._pugLoad.resolve(filename, source, options);
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
        if (!this._pugLoad) {
            this._pugLoad = require("pug-load");
        }
        options.filename = options.filename || file.info.fuseBoxPath;
        this.options.pug.basedir= context.homeDir;
        let content = this._pug.renderFile(file.absPath,this.options.pug);
        if (this.options.useDefault) {
            file.contents = `module.exports.default =  ${JSON.stringify(content)};`;
        } else {
            file.contents = `module.exports =  ${JSON.stringify(content)};`;
        }
        if(this.options.hmr) {
            context.emitJavascriptHotReload(file);
        }
        return file.content;
    }
}

export const PugPlugin = (opts:IPugPluginOptions) => {
    return new PugPluginClass(opts);
};