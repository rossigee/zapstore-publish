import{createRequire as __cr}from'node:module';const require=__cr(import.meta.url);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x2) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x2, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x2)(function(x2) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x2 + '" is not supported');
});
var __commonJS = (cb, mod2) => function __require2() {
  try {
    return mod2 || (0, cb[__getOwnPropNames(cb)[0]])((mod2 = { exports: {} }).exports, mod2), mod2.exports;
  } catch (e) {
    throw mod2 = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod2, isNodeMode, target) => (target = mod2 != null ? __create(__getProtoOf(mod2)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod2 || !mod2.__esModule ? __defProp(target, "default", { value: mod2, enumerable: true }) : target,
  mod2
));

// node_modules/yaml/dist/nodes/identity.js
var require_identity = __commonJS({
  "node_modules/yaml/dist/nodes/identity.js"(exports) {
    "use strict";
    var ALIAS = /* @__PURE__ */ Symbol.for("yaml.alias");
    var DOC = /* @__PURE__ */ Symbol.for("yaml.document");
    var MAP = /* @__PURE__ */ Symbol.for("yaml.map");
    var PAIR = /* @__PURE__ */ Symbol.for("yaml.pair");
    var SCALAR = /* @__PURE__ */ Symbol.for("yaml.scalar");
    var SEQ = /* @__PURE__ */ Symbol.for("yaml.seq");
    var NODE_TYPE = /* @__PURE__ */ Symbol.for("yaml.node.type");
    var isAlias = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === ALIAS;
    var isDocument = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === DOC;
    var isMap = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === MAP;
    var isPair = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === PAIR;
    var isScalar = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SCALAR;
    var isSeq = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SEQ;
    function isCollection(node) {
      if (node && typeof node === "object")
        switch (node[NODE_TYPE]) {
          case MAP:
          case SEQ:
            return true;
        }
      return false;
    }
    function isNode(node) {
      if (node && typeof node === "object")
        switch (node[NODE_TYPE]) {
          case ALIAS:
          case MAP:
          case SCALAR:
          case SEQ:
            return true;
        }
      return false;
    }
    var hasAnchor = (node) => (isScalar(node) || isCollection(node)) && !!node.anchor;
    exports.ALIAS = ALIAS;
    exports.DOC = DOC;
    exports.MAP = MAP;
    exports.NODE_TYPE = NODE_TYPE;
    exports.PAIR = PAIR;
    exports.SCALAR = SCALAR;
    exports.SEQ = SEQ;
    exports.hasAnchor = hasAnchor;
    exports.isAlias = isAlias;
    exports.isCollection = isCollection;
    exports.isDocument = isDocument;
    exports.isMap = isMap;
    exports.isNode = isNode;
    exports.isPair = isPair;
    exports.isScalar = isScalar;
    exports.isSeq = isSeq;
  }
});

// node_modules/yaml/dist/visit.js
var require_visit = __commonJS({
  "node_modules/yaml/dist/visit.js"(exports) {
    "use strict";
    var identity = require_identity();
    var BREAK = /* @__PURE__ */ Symbol("break visit");
    var SKIP = /* @__PURE__ */ Symbol("skip children");
    var REMOVE = /* @__PURE__ */ Symbol("remove node");
    function visit(node, visitor) {
      const visitor_ = initVisitor(visitor);
      if (identity.isDocument(node)) {
        const cd = visit_(null, node.contents, visitor_, Object.freeze([node]));
        if (cd === REMOVE)
          node.contents = null;
      } else
        visit_(null, node, visitor_, Object.freeze([]));
    }
    visit.BREAK = BREAK;
    visit.SKIP = SKIP;
    visit.REMOVE = REMOVE;
    function visit_(key, node, visitor, path) {
      const ctrl = callVisitor(key, node, visitor, path);
      if (identity.isNode(ctrl) || identity.isPair(ctrl)) {
        replaceNode(key, path, ctrl);
        return visit_(key, ctrl, visitor, path);
      }
      if (typeof ctrl !== "symbol") {
        if (identity.isCollection(node)) {
          path = Object.freeze(path.concat(node));
          for (let i3 = 0; i3 < node.items.length; ++i3) {
            const ci = visit_(i3, node.items[i3], visitor, path);
            if (typeof ci === "number")
              i3 = ci - 1;
            else if (ci === BREAK)
              return BREAK;
            else if (ci === REMOVE) {
              node.items.splice(i3, 1);
              i3 -= 1;
            }
          }
        } else if (identity.isPair(node)) {
          path = Object.freeze(path.concat(node));
          const ck = visit_("key", node.key, visitor, path);
          if (ck === BREAK)
            return BREAK;
          else if (ck === REMOVE)
            node.key = null;
          const cv = visit_("value", node.value, visitor, path);
          if (cv === BREAK)
            return BREAK;
          else if (cv === REMOVE)
            node.value = null;
        }
      }
      return ctrl;
    }
    async function visitAsync(node, visitor) {
      const visitor_ = initVisitor(visitor);
      if (identity.isDocument(node)) {
        const cd = await visitAsync_(null, node.contents, visitor_, Object.freeze([node]));
        if (cd === REMOVE)
          node.contents = null;
      } else
        await visitAsync_(null, node, visitor_, Object.freeze([]));
    }
    visitAsync.BREAK = BREAK;
    visitAsync.SKIP = SKIP;
    visitAsync.REMOVE = REMOVE;
    async function visitAsync_(key, node, visitor, path) {
      const ctrl = await callVisitor(key, node, visitor, path);
      if (identity.isNode(ctrl) || identity.isPair(ctrl)) {
        replaceNode(key, path, ctrl);
        return visitAsync_(key, ctrl, visitor, path);
      }
      if (typeof ctrl !== "symbol") {
        if (identity.isCollection(node)) {
          path = Object.freeze(path.concat(node));
          for (let i3 = 0; i3 < node.items.length; ++i3) {
            const ci = await visitAsync_(i3, node.items[i3], visitor, path);
            if (typeof ci === "number")
              i3 = ci - 1;
            else if (ci === BREAK)
              return BREAK;
            else if (ci === REMOVE) {
              node.items.splice(i3, 1);
              i3 -= 1;
            }
          }
        } else if (identity.isPair(node)) {
          path = Object.freeze(path.concat(node));
          const ck = await visitAsync_("key", node.key, visitor, path);
          if (ck === BREAK)
            return BREAK;
          else if (ck === REMOVE)
            node.key = null;
          const cv = await visitAsync_("value", node.value, visitor, path);
          if (cv === BREAK)
            return BREAK;
          else if (cv === REMOVE)
            node.value = null;
        }
      }
      return ctrl;
    }
    function initVisitor(visitor) {
      if (typeof visitor === "object" && (visitor.Collection || visitor.Node || visitor.Value)) {
        return Object.assign({
          Alias: visitor.Node,
          Map: visitor.Node,
          Scalar: visitor.Node,
          Seq: visitor.Node
        }, visitor.Value && {
          Map: visitor.Value,
          Scalar: visitor.Value,
          Seq: visitor.Value
        }, visitor.Collection && {
          Map: visitor.Collection,
          Seq: visitor.Collection
        }, visitor);
      }
      return visitor;
    }
    function callVisitor(key, node, visitor, path) {
      if (typeof visitor === "function")
        return visitor(key, node, path);
      if (identity.isMap(node))
        return visitor.Map?.(key, node, path);
      if (identity.isSeq(node))
        return visitor.Seq?.(key, node, path);
      if (identity.isPair(node))
        return visitor.Pair?.(key, node, path);
      if (identity.isScalar(node))
        return visitor.Scalar?.(key, node, path);
      if (identity.isAlias(node))
        return visitor.Alias?.(key, node, path);
      return void 0;
    }
    function replaceNode(key, path, node) {
      const parent = path[path.length - 1];
      if (identity.isCollection(parent)) {
        parent.items[key] = node;
      } else if (identity.isPair(parent)) {
        if (key === "key")
          parent.key = node;
        else
          parent.value = node;
      } else if (identity.isDocument(parent)) {
        parent.contents = node;
      } else {
        const pt = identity.isAlias(parent) ? "alias" : "scalar";
        throw new Error(`Cannot replace node with ${pt} parent`);
      }
    }
    exports.visit = visit;
    exports.visitAsync = visitAsync;
  }
});

// node_modules/yaml/dist/doc/directives.js
var require_directives = __commonJS({
  "node_modules/yaml/dist/doc/directives.js"(exports) {
    "use strict";
    var identity = require_identity();
    var visit = require_visit();
    var escapeChars = {
      "!": "%21",
      ",": "%2C",
      "[": "%5B",
      "]": "%5D",
      "{": "%7B",
      "}": "%7D"
    };
    var escapeTagName = (tn) => tn.replace(/[!,[\]{}]/g, (ch) => escapeChars[ch]);
    var Directives = class _Directives {
      constructor(yaml, tags) {
        this.docStart = null;
        this.docEnd = false;
        this.yaml = Object.assign({}, _Directives.defaultYaml, yaml);
        this.tags = Object.assign({}, _Directives.defaultTags, tags);
      }
      clone() {
        const copy = new _Directives(this.yaml, this.tags);
        copy.docStart = this.docStart;
        return copy;
      }
      /**
       * During parsing, get a Directives instance for the current document and
       * update the stream state according to the current version's spec.
       */
      atDocument() {
        const res = new _Directives(this.yaml, this.tags);
        switch (this.yaml.version) {
          case "1.1":
            this.atNextDocument = true;
            break;
          case "1.2":
            this.atNextDocument = false;
            this.yaml = {
              explicit: _Directives.defaultYaml.explicit,
              version: "1.2"
            };
            this.tags = Object.assign({}, _Directives.defaultTags);
            break;
        }
        return res;
      }
      /**
       * @param onError - May be called even if the action was successful
       * @returns `true` on success
       */
      add(line, onError) {
        if (this.atNextDocument) {
          this.yaml = { explicit: _Directives.defaultYaml.explicit, version: "1.1" };
          this.tags = Object.assign({}, _Directives.defaultTags);
          this.atNextDocument = false;
        }
        const parts = line.trim().split(/[ \t]+/);
        const name = parts.shift();
        switch (name) {
          case "%TAG": {
            if (parts.length !== 2) {
              onError(0, "%TAG directive should contain exactly two parts");
              if (parts.length < 2)
                return false;
            }
            const [handle, prefix] = parts;
            this.tags[handle] = prefix;
            return true;
          }
          case "%YAML": {
            this.yaml.explicit = true;
            if (parts.length !== 1) {
              onError(0, "%YAML directive should contain exactly one part");
              return false;
            }
            const [version] = parts;
            if (version === "1.1" || version === "1.2") {
              this.yaml.version = version;
              return true;
            } else {
              const isValid2 = /^\d+\.\d+$/.test(version);
              onError(6, `Unsupported YAML version ${version}`, isValid2);
              return false;
            }
          }
          default:
            onError(0, `Unknown directive ${name}`, true);
            return false;
        }
      }
      /**
       * Resolves a tag, matching handles to those defined in %TAG directives.
       *
       * @returns Resolved tag, which may also be the non-specific tag `'!'` or a
       *   `'!local'` tag, or `null` if unresolvable.
       */
      tagName(source, onError) {
        if (source === "!")
          return "!";
        if (source[0] !== "!") {
          onError(`Not a valid tag: ${source}`);
          return null;
        }
        if (source[1] === "<") {
          const verbatim = source.slice(2, -1);
          if (verbatim === "!" || verbatim === "!!") {
            onError(`Verbatim tags aren't resolved, so ${source} is invalid.`);
            return null;
          }
          if (source[source.length - 1] !== ">")
            onError("Verbatim tags must end with a >");
          return verbatim;
        }
        const [, handle, suffix] = source.match(/^(.*!)([^!]*)$/s);
        if (!suffix)
          onError(`The ${source} tag has no suffix`);
        const prefix = this.tags[handle];
        if (prefix) {
          try {
            return prefix + decodeURIComponent(suffix);
          } catch (error) {
            onError(String(error));
            return null;
          }
        }
        if (handle === "!")
          return source;
        onError(`Could not resolve tag: ${source}`);
        return null;
      }
      /**
       * Given a fully resolved tag, returns its printable string form,
       * taking into account current tag prefixes and defaults.
       */
      tagString(tag) {
        for (const [handle, prefix] of Object.entries(this.tags)) {
          if (tag.startsWith(prefix))
            return handle + escapeTagName(tag.substring(prefix.length));
        }
        return tag[0] === "!" ? tag : `!<${tag}>`;
      }
      toString(doc) {
        const lines = this.yaml.explicit ? [`%YAML ${this.yaml.version || "1.2"}`] : [];
        const tagEntries = Object.entries(this.tags);
        let tagNames;
        if (doc && tagEntries.length > 0 && identity.isNode(doc.contents)) {
          const tags = {};
          visit.visit(doc.contents, (_key, node) => {
            if (identity.isNode(node) && node.tag)
              tags[node.tag] = true;
          });
          tagNames = Object.keys(tags);
        } else
          tagNames = [];
        for (const [handle, prefix] of tagEntries) {
          if (handle === "!!" && prefix === "tag:yaml.org,2002:")
            continue;
          if (!doc || tagNames.some((tn) => tn.startsWith(prefix)))
            lines.push(`%TAG ${handle} ${prefix}`);
        }
        return lines.join("\n");
      }
    };
    Directives.defaultYaml = { explicit: false, version: "1.2" };
    Directives.defaultTags = { "!!": "tag:yaml.org,2002:" };
    exports.Directives = Directives;
  }
});

// node_modules/yaml/dist/doc/anchors.js
var require_anchors = __commonJS({
  "node_modules/yaml/dist/doc/anchors.js"(exports) {
    "use strict";
    var identity = require_identity();
    var visit = require_visit();
    function anchorIsValid(anchor) {
      if (/[\x00-\x19\s,[\]{}]/.test(anchor)) {
        const sa = JSON.stringify(anchor);
        const msg = `Anchor must not contain whitespace or control characters: ${sa}`;
        throw new Error(msg);
      }
      return true;
    }
    function anchorNames(root) {
      const anchors = /* @__PURE__ */ new Set();
      visit.visit(root, {
        Value(_key, node) {
          if (node.anchor)
            anchors.add(node.anchor);
        }
      });
      return anchors;
    }
    function findNewAnchor(prefix, exclude) {
      for (let i3 = 1; true; ++i3) {
        const name = `${prefix}${i3}`;
        if (!exclude.has(name))
          return name;
      }
    }
    function createNodeAnchors(doc, prefix) {
      const aliasObjects = [];
      const sourceObjects = /* @__PURE__ */ new Map();
      let prevAnchors = null;
      return {
        onAnchor: (source) => {
          aliasObjects.push(source);
          prevAnchors ?? (prevAnchors = anchorNames(doc));
          const anchor = findNewAnchor(prefix, prevAnchors);
          prevAnchors.add(anchor);
          return anchor;
        },
        /**
         * With circular references, the source node is only resolved after all
         * of its child nodes are. This is why anchors are set only after all of
         * the nodes have been created.
         */
        setAnchors: () => {
          for (const source of aliasObjects) {
            const ref = sourceObjects.get(source);
            if (typeof ref === "object" && ref.anchor && (identity.isScalar(ref.node) || identity.isCollection(ref.node))) {
              ref.node.anchor = ref.anchor;
            } else {
              const error = new Error("Failed to resolve repeated object (this should not happen)");
              error.source = source;
              throw error;
            }
          }
        },
        sourceObjects
      };
    }
    exports.anchorIsValid = anchorIsValid;
    exports.anchorNames = anchorNames;
    exports.createNodeAnchors = createNodeAnchors;
    exports.findNewAnchor = findNewAnchor;
  }
});

// node_modules/yaml/dist/doc/applyReviver.js
var require_applyReviver = __commonJS({
  "node_modules/yaml/dist/doc/applyReviver.js"(exports) {
    "use strict";
    function applyReviver(reviver, obj, key, val) {
      if (val && typeof val === "object") {
        if (Array.isArray(val)) {
          for (let i3 = 0, len = val.length; i3 < len; ++i3) {
            const v0 = val[i3];
            const v1 = applyReviver(reviver, val, String(i3), v0);
            if (v1 === void 0)
              delete val[i3];
            else if (v1 !== v0)
              val[i3] = v1;
          }
        } else if (val instanceof Map) {
          for (const k of Array.from(val.keys())) {
            const v0 = val.get(k);
            const v1 = applyReviver(reviver, val, k, v0);
            if (v1 === void 0)
              val.delete(k);
            else if (v1 !== v0)
              val.set(k, v1);
          }
        } else if (val instanceof Set) {
          for (const v0 of Array.from(val)) {
            const v1 = applyReviver(reviver, val, v0, v0);
            if (v1 === void 0)
              val.delete(v0);
            else if (v1 !== v0) {
              val.delete(v0);
              val.add(v1);
            }
          }
        } else {
          for (const [k, v0] of Object.entries(val)) {
            const v1 = applyReviver(reviver, val, k, v0);
            if (v1 === void 0)
              delete val[k];
            else if (v1 !== v0)
              val[k] = v1;
          }
        }
      }
      return reviver.call(obj, key, val);
    }
    exports.applyReviver = applyReviver;
  }
});

// node_modules/yaml/dist/nodes/toJS.js
var require_toJS = __commonJS({
  "node_modules/yaml/dist/nodes/toJS.js"(exports) {
    "use strict";
    var identity = require_identity();
    function toJS(value, arg, ctx) {
      if (Array.isArray(value))
        return value.map((v, i3) => toJS(v, String(i3), ctx));
      if (value && typeof value.toJSON === "function") {
        if (!ctx || !identity.hasAnchor(value))
          return value.toJSON(arg, ctx);
        const data = { aliasCount: 0, count: 1, res: void 0 };
        ctx.anchors.set(value, data);
        ctx.onCreate = (res2) => {
          data.res = res2;
          delete ctx.onCreate;
        };
        const res = value.toJSON(arg, ctx);
        if (ctx.onCreate)
          ctx.onCreate(res);
        return res;
      }
      if (typeof value === "bigint" && !ctx?.keep)
        return Number(value);
      return value;
    }
    exports.toJS = toJS;
  }
});

// node_modules/yaml/dist/nodes/Node.js
var require_Node = __commonJS({
  "node_modules/yaml/dist/nodes/Node.js"(exports) {
    "use strict";
    var applyReviver = require_applyReviver();
    var identity = require_identity();
    var toJS = require_toJS();
    var NodeBase = class {
      constructor(type) {
        Object.defineProperty(this, identity.NODE_TYPE, { value: type });
      }
      /** Create a copy of this node.  */
      clone() {
        const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
        if (this.range)
          copy.range = this.range.slice();
        return copy;
      }
      /** A plain JavaScript representation of this node. */
      toJS(doc, { mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
        if (!identity.isDocument(doc))
          throw new TypeError("A document argument is required");
        const ctx = {
          anchors: /* @__PURE__ */ new Map(),
          doc,
          keep: true,
          mapAsMap: mapAsMap === true,
          mapKeyWarned: false,
          maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
        };
        const res = toJS.toJS(this, "", ctx);
        if (typeof onAnchor === "function")
          for (const { count, res: res2 } of ctx.anchors.values())
            onAnchor(res2, count);
        return typeof reviver === "function" ? applyReviver.applyReviver(reviver, { "": res }, "", res) : res;
      }
    };
    exports.NodeBase = NodeBase;
  }
});

// node_modules/yaml/dist/nodes/Alias.js
var require_Alias = __commonJS({
  "node_modules/yaml/dist/nodes/Alias.js"(exports) {
    "use strict";
    var anchors = require_anchors();
    var visit = require_visit();
    var identity = require_identity();
    var Node = require_Node();
    var toJS = require_toJS();
    var Alias = class extends Node.NodeBase {
      constructor(source) {
        super(identity.ALIAS);
        this.source = source;
        Object.defineProperty(this, "tag", {
          set() {
            throw new Error("Alias nodes cannot have tags");
          }
        });
      }
      /**
       * Resolve the value of this alias within `doc`, finding the last
       * instance of the `source` anchor before this node.
       */
      resolve(doc, ctx) {
        if (ctx?.maxAliasCount === 0)
          throw new ReferenceError("Alias resolution is disabled");
        let nodes;
        if (ctx?.aliasResolveCache) {
          nodes = ctx.aliasResolveCache;
        } else {
          nodes = [];
          visit.visit(doc, {
            Node: (_key, node) => {
              if (identity.isAlias(node) || identity.hasAnchor(node))
                nodes.push(node);
            }
          });
          if (ctx)
            ctx.aliasResolveCache = nodes;
        }
        let found = void 0;
        for (const node of nodes) {
          if (node === this)
            break;
          if (node.anchor === this.source)
            found = node;
        }
        if (found && ctx) {
          const { anchors: anchors2, doc: doc2, maxAliasCount } = ctx;
          let data = anchors2.get(found);
          if (!data) {
            toJS.toJS(found, null, ctx);
            data = anchors2.get(found);
          }
          if (data?.res === void 0) {
            const msg = "This should not happen: Alias anchor was not resolved?";
            throw new ReferenceError(msg);
          }
          if (maxAliasCount >= 0) {
            data.count += 1;
            if (data.aliasCount === 0)
              data.aliasCount = getAliasCount(doc2, found, anchors2);
            if (data.count * data.aliasCount > maxAliasCount) {
              const msg = "Excessive alias count indicates a resource exhaustion attack";
              throw new ReferenceError(msg);
            }
          }
        }
        return found;
      }
      toJSON(_arg, ctx) {
        if (!ctx)
          return { source: this.source };
        const source = this.resolve(ctx.doc, ctx);
        if (!source) {
          const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
          throw new ReferenceError(msg);
        }
        return ctx.anchors.get(source).res;
      }
      toString(ctx, _onComment, _onChompKeep) {
        const src = `*${this.source}`;
        if (ctx) {
          anchors.anchorIsValid(this.source);
          if (ctx.options.verifyAliasOrder && !ctx.anchors.has(this.source)) {
            const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
            throw new Error(msg);
          }
          if (ctx.implicitKey)
            return `${src} `;
        }
        return src;
      }
    };
    function getAliasCount(doc, node, anchors2) {
      if (identity.isAlias(node)) {
        const source = node.resolve(doc);
        const anchor = anchors2 && source && anchors2.get(source);
        return anchor ? anchor.count * anchor.aliasCount : 0;
      } else if (identity.isCollection(node)) {
        let count = 0;
        for (const item of node.items) {
          const c = getAliasCount(doc, item, anchors2);
          if (c > count)
            count = c;
        }
        return count;
      } else if (identity.isPair(node)) {
        const kc = getAliasCount(doc, node.key, anchors2);
        const vc = getAliasCount(doc, node.value, anchors2);
        return Math.max(kc, vc);
      }
      return 1;
    }
    exports.Alias = Alias;
  }
});

// node_modules/yaml/dist/nodes/Scalar.js
var require_Scalar = __commonJS({
  "node_modules/yaml/dist/nodes/Scalar.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Node = require_Node();
    var toJS = require_toJS();
    var isScalarValue = (value) => !value || typeof value !== "function" && typeof value !== "object";
    var Scalar = class extends Node.NodeBase {
      constructor(value) {
        super(identity.SCALAR);
        this.value = value;
      }
      toJSON(arg, ctx) {
        return ctx?.keep ? this.value : toJS.toJS(this.value, arg, ctx);
      }
      toString() {
        return String(this.value);
      }
    };
    Scalar.BLOCK_FOLDED = "BLOCK_FOLDED";
    Scalar.BLOCK_LITERAL = "BLOCK_LITERAL";
    Scalar.PLAIN = "PLAIN";
    Scalar.QUOTE_DOUBLE = "QUOTE_DOUBLE";
    Scalar.QUOTE_SINGLE = "QUOTE_SINGLE";
    exports.Scalar = Scalar;
    exports.isScalarValue = isScalarValue;
  }
});

// node_modules/yaml/dist/doc/createNode.js
var require_createNode = __commonJS({
  "node_modules/yaml/dist/doc/createNode.js"(exports) {
    "use strict";
    var Alias = require_Alias();
    var identity = require_identity();
    var Scalar = require_Scalar();
    var defaultTagPrefix = "tag:yaml.org,2002:";
    function findTagObject(value, tagName, tags) {
      if (tagName) {
        const match = tags.filter((t) => t.tag === tagName);
        const tagObj = match.find((t) => !t.format) ?? match[0];
        if (!tagObj)
          throw new Error(`Tag ${tagName} not found`);
        return tagObj;
      }
      return tags.find((t) => t.identify?.(value) && !t.format);
    }
    function createNode(value, tagName, ctx) {
      if (identity.isDocument(value))
        value = value.contents;
      if (identity.isNode(value))
        return value;
      if (identity.isPair(value)) {
        const map = ctx.schema[identity.MAP].createNode?.(ctx.schema, null, ctx);
        map.items.push(value);
        return map;
      }
      if (value instanceof String || value instanceof Number || value instanceof Boolean || typeof BigInt !== "undefined" && value instanceof BigInt) {
        value = value.valueOf();
      }
      const { aliasDuplicateObjects, onAnchor, onTagObj, schema, sourceObjects } = ctx;
      let ref = void 0;
      if (aliasDuplicateObjects && value && typeof value === "object") {
        ref = sourceObjects.get(value);
        if (ref) {
          ref.anchor ?? (ref.anchor = onAnchor(value));
          return new Alias.Alias(ref.anchor);
        } else {
          ref = { anchor: null, node: null };
          sourceObjects.set(value, ref);
        }
      }
      if (tagName?.startsWith("!!"))
        tagName = defaultTagPrefix + tagName.slice(2);
      let tagObj = findTagObject(value, tagName, schema.tags);
      if (!tagObj) {
        if (value && typeof value.toJSON === "function") {
          value = value.toJSON();
        }
        if (!value || typeof value !== "object") {
          const node2 = new Scalar.Scalar(value);
          if (ref)
            ref.node = node2;
          return node2;
        }
        tagObj = value instanceof Map ? schema[identity.MAP] : Symbol.iterator in Object(value) ? schema[identity.SEQ] : schema[identity.MAP];
      }
      if (onTagObj) {
        onTagObj(tagObj);
        delete ctx.onTagObj;
      }
      const node = tagObj?.createNode ? tagObj.createNode(ctx.schema, value, ctx) : typeof tagObj?.nodeClass?.from === "function" ? tagObj.nodeClass.from(ctx.schema, value, ctx) : new Scalar.Scalar(value);
      if (tagName)
        node.tag = tagName;
      else if (!tagObj.default)
        node.tag = tagObj.tag;
      if (ref)
        ref.node = node;
      return node;
    }
    exports.createNode = createNode;
  }
});

// node_modules/yaml/dist/nodes/Collection.js
var require_Collection = __commonJS({
  "node_modules/yaml/dist/nodes/Collection.js"(exports) {
    "use strict";
    var createNode = require_createNode();
    var identity = require_identity();
    var Node = require_Node();
    function collectionFromPath(schema, path, value) {
      let v = value;
      for (let i3 = path.length - 1; i3 >= 0; --i3) {
        const k = path[i3];
        if (typeof k === "number" && Number.isInteger(k) && k >= 0) {
          const a = [];
          a[k] = v;
          v = a;
        } else {
          v = /* @__PURE__ */ new Map([[k, v]]);
        }
      }
      return createNode.createNode(v, void 0, {
        aliasDuplicateObjects: false,
        keepUndefined: false,
        onAnchor: () => {
          throw new Error("This should not happen, please report a bug.");
        },
        schema,
        sourceObjects: /* @__PURE__ */ new Map()
      });
    }
    var isEmptyPath = (path) => path == null || typeof path === "object" && !!path[Symbol.iterator]().next().done;
    var Collection = class extends Node.NodeBase {
      constructor(type, schema) {
        super(type);
        Object.defineProperty(this, "schema", {
          value: schema,
          configurable: true,
          enumerable: false,
          writable: true
        });
      }
      /**
       * Create a copy of this collection.
       *
       * @param schema - If defined, overwrites the original's schema
       */
      clone(schema) {
        const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
        if (schema)
          copy.schema = schema;
        copy.items = copy.items.map((it) => identity.isNode(it) || identity.isPair(it) ? it.clone(schema) : it);
        if (this.range)
          copy.range = this.range.slice();
        return copy;
      }
      /**
       * Adds a value to the collection. For `!!map` and `!!omap` the value must
       * be a Pair instance or a `{ key, value }` object, which may not have a key
       * that already exists in the map.
       */
      addIn(path, value) {
        if (isEmptyPath(path))
          this.add(value);
        else {
          const [key, ...rest] = path;
          const node = this.get(key, true);
          if (identity.isCollection(node))
            node.addIn(rest, value);
          else if (node === void 0 && this.schema)
            this.set(key, collectionFromPath(this.schema, rest, value));
          else
            throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
        }
      }
      /**
       * Removes a value from the collection.
       * @returns `true` if the item was found and removed.
       */
      deleteIn(path) {
        const [key, ...rest] = path;
        if (rest.length === 0)
          return this.delete(key);
        const node = this.get(key, true);
        if (identity.isCollection(node))
          return node.deleteIn(rest);
        else
          throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
      }
      /**
       * Returns item at `key`, or `undefined` if not found. By default unwraps
       * scalar values from their surrounding node; to disable set `keepScalar` to
       * `true` (collections are always returned intact).
       */
      getIn(path, keepScalar) {
        const [key, ...rest] = path;
        const node = this.get(key, true);
        if (rest.length === 0)
          return !keepScalar && identity.isScalar(node) ? node.value : node;
        else
          return identity.isCollection(node) ? node.getIn(rest, keepScalar) : void 0;
      }
      hasAllNullValues(allowScalar) {
        return this.items.every((node) => {
          if (!identity.isPair(node))
            return false;
          const n = node.value;
          return n == null || allowScalar && identity.isScalar(n) && n.value == null && !n.commentBefore && !n.comment && !n.tag;
        });
      }
      /**
       * Checks if the collection includes a value with the key `key`.
       */
      hasIn(path) {
        const [key, ...rest] = path;
        if (rest.length === 0)
          return this.has(key);
        const node = this.get(key, true);
        return identity.isCollection(node) ? node.hasIn(rest) : false;
      }
      /**
       * Sets a value in this collection. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       */
      setIn(path, value) {
        const [key, ...rest] = path;
        if (rest.length === 0) {
          this.set(key, value);
        } else {
          const node = this.get(key, true);
          if (identity.isCollection(node))
            node.setIn(rest, value);
          else if (node === void 0 && this.schema)
            this.set(key, collectionFromPath(this.schema, rest, value));
          else
            throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
        }
      }
    };
    exports.Collection = Collection;
    exports.collectionFromPath = collectionFromPath;
    exports.isEmptyPath = isEmptyPath;
  }
});

// node_modules/yaml/dist/stringify/stringifyComment.js
var require_stringifyComment = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyComment.js"(exports) {
    "use strict";
    var stringifyComment = (str) => str.replace(/^(?!$)(?: $)?/gm, "#");
    function indentComment(comment, indent) {
      if (/^\n+$/.test(comment))
        return comment.substring(1);
      return indent ? comment.replace(/^(?! *$)/gm, indent) : comment;
    }
    var lineComment = (str, indent, comment) => str.endsWith("\n") ? indentComment(comment, indent) : comment.includes("\n") ? "\n" + indentComment(comment, indent) : (str.endsWith(" ") ? "" : " ") + comment;
    exports.indentComment = indentComment;
    exports.lineComment = lineComment;
    exports.stringifyComment = stringifyComment;
  }
});

// node_modules/yaml/dist/stringify/foldFlowLines.js
var require_foldFlowLines = __commonJS({
  "node_modules/yaml/dist/stringify/foldFlowLines.js"(exports) {
    "use strict";
    var FOLD_FLOW = "flow";
    var FOLD_BLOCK = "block";
    var FOLD_QUOTED = "quoted";
    function foldFlowLines(text, indent, mode = "flow", { indentAtStart, lineWidth = 80, minContentWidth = 20, onFold, onOverflow } = {}) {
      if (!lineWidth || lineWidth < 0)
        return text;
      if (lineWidth < minContentWidth)
        minContentWidth = 0;
      const endStep = Math.max(1 + minContentWidth, 1 + lineWidth - indent.length);
      if (text.length <= endStep)
        return text;
      const folds = [];
      const escapedFolds = {};
      let end = lineWidth - indent.length;
      if (typeof indentAtStart === "number") {
        if (indentAtStart > lineWidth - Math.max(2, minContentWidth))
          folds.push(0);
        else
          end = lineWidth - indentAtStart;
      }
      let split = void 0;
      let prev = void 0;
      let overflow = false;
      let i3 = -1;
      let escStart = -1;
      let escEnd = -1;
      if (mode === FOLD_BLOCK) {
        i3 = consumeMoreIndentedLines(text, i3, indent.length);
        if (i3 !== -1)
          end = i3 + endStep;
      }
      for (let ch; ch = text[i3 += 1]; ) {
        if (mode === FOLD_QUOTED && ch === "\\") {
          escStart = i3;
          switch (text[i3 + 1]) {
            case "x":
              i3 += 3;
              break;
            case "u":
              i3 += 5;
              break;
            case "U":
              i3 += 9;
              break;
            default:
              i3 += 1;
          }
          escEnd = i3;
        }
        if (ch === "\n") {
          if (mode === FOLD_BLOCK)
            i3 = consumeMoreIndentedLines(text, i3, indent.length);
          end = i3 + indent.length + endStep;
          split = void 0;
        } else {
          if (ch === " " && prev && prev !== " " && prev !== "\n" && prev !== "	") {
            const next = text[i3 + 1];
            if (next && next !== " " && next !== "\n" && next !== "	")
              split = i3;
          }
          if (i3 >= end) {
            if (split) {
              folds.push(split);
              end = split + endStep;
              split = void 0;
            } else if (mode === FOLD_QUOTED) {
              while (prev === " " || prev === "	") {
                prev = ch;
                ch = text[i3 += 1];
                overflow = true;
              }
              const j = i3 > escEnd + 1 ? i3 - 2 : escStart - 1;
              if (escapedFolds[j])
                return text;
              folds.push(j);
              escapedFolds[j] = true;
              end = j + endStep;
              split = void 0;
            } else {
              overflow = true;
            }
          }
        }
        prev = ch;
      }
      if (overflow && onOverflow)
        onOverflow();
      if (folds.length === 0)
        return text;
      if (onFold)
        onFold();
      let res = text.slice(0, folds[0]);
      for (let i4 = 0; i4 < folds.length; ++i4) {
        const fold = folds[i4];
        const end2 = folds[i4 + 1] || text.length;
        if (fold === 0)
          res = `
${indent}${text.slice(0, end2)}`;
        else {
          if (mode === FOLD_QUOTED && escapedFolds[fold])
            res += `${text[fold]}\\`;
          res += `
${indent}${text.slice(fold + 1, end2)}`;
        }
      }
      return res;
    }
    function consumeMoreIndentedLines(text, i3, indent) {
      let end = i3;
      let start = i3 + 1;
      let ch = text[start];
      while (ch === " " || ch === "	") {
        if (i3 < start + indent) {
          ch = text[++i3];
        } else {
          do {
            ch = text[++i3];
          } while (ch && ch !== "\n");
          end = i3;
          start = i3 + 1;
          ch = text[start];
        }
      }
      return end;
    }
    exports.FOLD_BLOCK = FOLD_BLOCK;
    exports.FOLD_FLOW = FOLD_FLOW;
    exports.FOLD_QUOTED = FOLD_QUOTED;
    exports.foldFlowLines = foldFlowLines;
  }
});

// node_modules/yaml/dist/stringify/stringifyString.js
var require_stringifyString = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyString.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var foldFlowLines = require_foldFlowLines();
    var getFoldOptions = (ctx, isBlock) => ({
      indentAtStart: isBlock ? ctx.indent.length : ctx.indentAtStart,
      lineWidth: ctx.options.lineWidth,
      minContentWidth: ctx.options.minContentWidth
    });
    var containsDocumentMarker = (str) => /^(%|---|\.\.\.)/m.test(str);
    function lineLengthOverLimit(str, lineWidth, indentLength) {
      if (!lineWidth || lineWidth < 0)
        return false;
      const limit = lineWidth - indentLength;
      const strLen = str.length;
      if (strLen <= limit)
        return false;
      for (let i3 = 0, start = 0; i3 < strLen; ++i3) {
        if (str[i3] === "\n") {
          if (i3 - start > limit)
            return true;
          start = i3 + 1;
          if (strLen - start <= limit)
            return false;
        }
      }
      return true;
    }
    function doubleQuotedString(value, ctx) {
      const json = JSON.stringify(value);
      if (ctx.options.doubleQuotedAsJSON)
        return json;
      const { implicitKey } = ctx;
      const minMultiLineLength = ctx.options.doubleQuotedMinMultiLineLength;
      const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
      let str = "";
      let start = 0;
      for (let i3 = 0, ch = json[i3]; ch; ch = json[++i3]) {
        if (ch === " " && json[i3 + 1] === "\\" && json[i3 + 2] === "n") {
          str += json.slice(start, i3) + "\\ ";
          i3 += 1;
          start = i3;
          ch = "\\";
        }
        if (ch === "\\")
          switch (json[i3 + 1]) {
            case "u":
              {
                str += json.slice(start, i3);
                const code = json.substr(i3 + 2, 4);
                switch (code) {
                  case "0000":
                    str += "\\0";
                    break;
                  case "0007":
                    str += "\\a";
                    break;
                  case "000b":
                    str += "\\v";
                    break;
                  case "001b":
                    str += "\\e";
                    break;
                  case "0085":
                    str += "\\N";
                    break;
                  case "00a0":
                    str += "\\_";
                    break;
                  case "2028":
                    str += "\\L";
                    break;
                  case "2029":
                    str += "\\P";
                    break;
                  default:
                    if (code.substr(0, 2) === "00")
                      str += "\\x" + code.substr(2);
                    else
                      str += json.substr(i3, 6);
                }
                i3 += 5;
                start = i3 + 1;
              }
              break;
            case "n":
              if (implicitKey || json[i3 + 2] === '"' || json.length < minMultiLineLength) {
                i3 += 1;
              } else {
                str += json.slice(start, i3) + "\n\n";
                while (json[i3 + 2] === "\\" && json[i3 + 3] === "n" && json[i3 + 4] !== '"') {
                  str += "\n";
                  i3 += 2;
                }
                str += indent;
                if (json[i3 + 2] === " ")
                  str += "\\";
                i3 += 1;
                start = i3 + 1;
              }
              break;
            default:
              i3 += 1;
          }
      }
      str = start ? str + json.slice(start) : json;
      return implicitKey ? str : foldFlowLines.foldFlowLines(str, indent, foldFlowLines.FOLD_QUOTED, getFoldOptions(ctx, false));
    }
    function singleQuotedString(value, ctx) {
      if (ctx.options.singleQuote === false || ctx.implicitKey && value.includes("\n") || /[ \t]\n|\n[ \t]/.test(value))
        return doubleQuotedString(value, ctx);
      const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
      const res = "'" + value.replace(/'/g, "''").replace(/\n+/g, `$&
${indent}`) + "'";
      return ctx.implicitKey ? res : foldFlowLines.foldFlowLines(res, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
    }
    function quotedString(value, ctx) {
      const { singleQuote } = ctx.options;
      let qs;
      if (singleQuote === false)
        qs = doubleQuotedString;
      else {
        const hasDouble = value.includes('"');
        const hasSingle = value.includes("'");
        if (hasDouble && !hasSingle)
          qs = singleQuotedString;
        else if (hasSingle && !hasDouble)
          qs = doubleQuotedString;
        else
          qs = singleQuote ? singleQuotedString : doubleQuotedString;
      }
      return qs(value, ctx);
    }
    var blockEndNewlines;
    try {
      blockEndNewlines = new RegExp("(^|(?<!\n))\n+(?!\n|$)", "g");
    } catch {
      blockEndNewlines = /\n+(?!\n|$)/g;
    }
    function blockString({ comment, type, value }, ctx, onComment, onChompKeep) {
      const { blockQuote, commentString, lineWidth } = ctx.options;
      if (!blockQuote || /\n[\t ]+$/.test(value)) {
        return quotedString(value, ctx);
      }
      const indent = ctx.indent || (ctx.forceBlockIndent || containsDocumentMarker(value) ? "  " : "");
      const literal = blockQuote === "literal" ? true : blockQuote === "folded" || type === Scalar.Scalar.BLOCK_FOLDED ? false : type === Scalar.Scalar.BLOCK_LITERAL ? true : !lineLengthOverLimit(value, lineWidth, indent.length);
      if (!value)
        return literal ? "|\n" : ">\n";
      let chomp;
      let endStart;
      for (endStart = value.length; endStart > 0; --endStart) {
        const ch = value[endStart - 1];
        if (ch !== "\n" && ch !== "	" && ch !== " ")
          break;
      }
      let end = value.substring(endStart);
      const endNlPos = end.indexOf("\n");
      if (endNlPos === -1) {
        chomp = "-";
      } else if (value === end || endNlPos !== end.length - 1) {
        chomp = "+";
        if (onChompKeep)
          onChompKeep();
      } else {
        chomp = "";
      }
      if (end) {
        value = value.slice(0, -end.length);
        if (end[end.length - 1] === "\n")
          end = end.slice(0, -1);
        end = end.replace(blockEndNewlines, `$&${indent}`);
      }
      let startWithSpace = false;
      let startEnd;
      let startNlPos = -1;
      for (startEnd = 0; startEnd < value.length; ++startEnd) {
        const ch = value[startEnd];
        if (ch === " ")
          startWithSpace = true;
        else if (ch === "\n")
          startNlPos = startEnd;
        else
          break;
      }
      let start = value.substring(0, startNlPos < startEnd ? startNlPos + 1 : startEnd);
      if (start) {
        value = value.substring(start.length);
        start = start.replace(/\n+/g, `$&${indent}`);
      }
      const indentSize = indent ? "2" : "1";
      let header = (startWithSpace ? indentSize : "") + chomp;
      if (comment) {
        header += " " + commentString(comment.replace(/ ?[\r\n]+/g, " "));
        if (onComment)
          onComment();
      }
      if (!literal) {
        const foldedValue = value.replace(/\n+/g, "\n$&").replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, "$1$2").replace(/\n+/g, `$&${indent}`);
        let literalFallback = false;
        const foldOptions = getFoldOptions(ctx, true);
        if (blockQuote !== "folded" && type !== Scalar.Scalar.BLOCK_FOLDED) {
          foldOptions.onOverflow = () => {
            literalFallback = true;
          };
        }
        const body = foldFlowLines.foldFlowLines(`${start}${foldedValue}${end}`, indent, foldFlowLines.FOLD_BLOCK, foldOptions);
        if (!literalFallback)
          return `>${header}
${indent}${body}`;
      }
      value = value.replace(/\n+/g, `$&${indent}`);
      return `|${header}
${indent}${start}${value}${end}`;
    }
    function plainString(item, ctx, onComment, onChompKeep) {
      const { type, value } = item;
      const { actualString, implicitKey, indent, indentStep, inFlow } = ctx;
      if (implicitKey && value.includes("\n") || inFlow && /[[\]{},]/.test(value)) {
        return quotedString(value, ctx);
      }
      if (/^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(value)) {
        return implicitKey || inFlow || !value.includes("\n") ? quotedString(value, ctx) : blockString(item, ctx, onComment, onChompKeep);
      }
      if (!implicitKey && !inFlow && type !== Scalar.Scalar.PLAIN && value.includes("\n")) {
        return blockString(item, ctx, onComment, onChompKeep);
      }
      if (containsDocumentMarker(value)) {
        if (indent === "") {
          ctx.forceBlockIndent = true;
          return blockString(item, ctx, onComment, onChompKeep);
        } else if (implicitKey && indent === indentStep) {
          return quotedString(value, ctx);
        }
      }
      const str = value.replace(/\n+/g, `$&
${indent}`);
      if (actualString) {
        const test2 = (tag) => tag.default && tag.tag !== "tag:yaml.org,2002:str" && tag.test?.test(str);
        const { compat, tags } = ctx.doc.schema;
        if (tags.some(test2) || compat?.some(test2))
          return quotedString(value, ctx);
      }
      return implicitKey ? str : foldFlowLines.foldFlowLines(str, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
    }
    function stringifyString(item, ctx, onComment, onChompKeep) {
      const { implicitKey, inFlow } = ctx;
      const ss = typeof item.value === "string" ? item : Object.assign({}, item, { value: String(item.value) });
      let { type } = item;
      if (type !== Scalar.Scalar.QUOTE_DOUBLE) {
        if (/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(ss.value))
          type = Scalar.Scalar.QUOTE_DOUBLE;
      }
      const _stringify = (_type) => {
        switch (_type) {
          case Scalar.Scalar.BLOCK_FOLDED:
          case Scalar.Scalar.BLOCK_LITERAL:
            return implicitKey || inFlow ? quotedString(ss.value, ctx) : blockString(ss, ctx, onComment, onChompKeep);
          case Scalar.Scalar.QUOTE_DOUBLE:
            return doubleQuotedString(ss.value, ctx);
          case Scalar.Scalar.QUOTE_SINGLE:
            return singleQuotedString(ss.value, ctx);
          case Scalar.Scalar.PLAIN:
            return plainString(ss, ctx, onComment, onChompKeep);
          default:
            return null;
        }
      };
      let res = _stringify(type);
      if (res === null) {
        const { defaultKeyType, defaultStringType } = ctx.options;
        const t = implicitKey && defaultKeyType || defaultStringType;
        res = _stringify(t);
        if (res === null)
          throw new Error(`Unsupported default string type ${t}`);
      }
      return res;
    }
    exports.stringifyString = stringifyString;
  }
});

// node_modules/yaml/dist/stringify/stringify.js
var require_stringify = __commonJS({
  "node_modules/yaml/dist/stringify/stringify.js"(exports) {
    "use strict";
    var anchors = require_anchors();
    var identity = require_identity();
    var stringifyComment = require_stringifyComment();
    var stringifyString = require_stringifyString();
    function createStringifyContext(doc, options) {
      const opt = Object.assign({
        blockQuote: true,
        commentString: stringifyComment.stringifyComment,
        defaultKeyType: null,
        defaultStringType: "PLAIN",
        directives: null,
        doubleQuotedAsJSON: false,
        doubleQuotedMinMultiLineLength: 40,
        falseStr: "false",
        flowCollectionPadding: true,
        indentSeq: true,
        lineWidth: 80,
        minContentWidth: 20,
        nullStr: "null",
        simpleKeys: false,
        singleQuote: null,
        trailingComma: false,
        trueStr: "true",
        verifyAliasOrder: true
      }, doc.schema.toStringOptions, options);
      let inFlow;
      switch (opt.collectionStyle) {
        case "block":
          inFlow = false;
          break;
        case "flow":
          inFlow = true;
          break;
        default:
          inFlow = null;
      }
      return {
        anchors: /* @__PURE__ */ new Set(),
        doc,
        flowCollectionPadding: opt.flowCollectionPadding ? " " : "",
        indent: "",
        indentStep: typeof opt.indent === "number" ? " ".repeat(opt.indent) : "  ",
        inFlow,
        options: opt
      };
    }
    function getTagObject(tags, item) {
      if (item.tag) {
        const match = tags.filter((t) => t.tag === item.tag);
        if (match.length > 0)
          return match.find((t) => t.format === item.format) ?? match[0];
      }
      let tagObj = void 0;
      let obj;
      if (identity.isScalar(item)) {
        obj = item.value;
        let match = tags.filter((t) => t.identify?.(obj));
        if (match.length > 1) {
          const testMatch = match.filter((t) => t.test);
          if (testMatch.length > 0)
            match = testMatch;
        }
        tagObj = match.find((t) => t.format === item.format) ?? match.find((t) => !t.format);
      } else {
        obj = item;
        tagObj = tags.find((t) => t.nodeClass && obj instanceof t.nodeClass);
      }
      if (!tagObj) {
        const name = obj?.constructor?.name ?? (obj === null ? "null" : typeof obj);
        throw new Error(`Tag not resolved for ${name} value`);
      }
      return tagObj;
    }
    function stringifyProps(node, tagObj, { anchors: anchors$1, doc }) {
      if (!doc.directives)
        return "";
      const props = [];
      const anchor = (identity.isScalar(node) || identity.isCollection(node)) && node.anchor;
      if (anchor && anchors.anchorIsValid(anchor)) {
        anchors$1.add(anchor);
        props.push(`&${anchor}`);
      }
      const tag = node.tag ?? (tagObj.default ? null : tagObj.tag);
      if (tag)
        props.push(doc.directives.tagString(tag));
      return props.join(" ");
    }
    function stringify(item, ctx, onComment, onChompKeep) {
      if (identity.isPair(item))
        return item.toString(ctx, onComment, onChompKeep);
      if (identity.isAlias(item)) {
        if (ctx.doc.directives)
          return item.toString(ctx);
        if (ctx.resolvedAliases?.has(item)) {
          throw new TypeError(`Cannot stringify circular structure without alias nodes`);
        } else {
          if (ctx.resolvedAliases)
            ctx.resolvedAliases.add(item);
          else
            ctx.resolvedAliases = /* @__PURE__ */ new Set([item]);
          item = item.resolve(ctx.doc);
        }
      }
      let tagObj = void 0;
      const node = identity.isNode(item) ? item : ctx.doc.createNode(item, { onTagObj: (o) => tagObj = o });
      tagObj ?? (tagObj = getTagObject(ctx.doc.schema.tags, node));
      const props = stringifyProps(node, tagObj, ctx);
      if (props.length > 0)
        ctx.indentAtStart = (ctx.indentAtStart ?? 0) + props.length + 1;
      const str = typeof tagObj.stringify === "function" ? tagObj.stringify(node, ctx, onComment, onChompKeep) : identity.isScalar(node) ? stringifyString.stringifyString(node, ctx, onComment, onChompKeep) : node.toString(ctx, onComment, onChompKeep);
      if (!props)
        return str;
      return identity.isScalar(node) || str[0] === "{" || str[0] === "[" ? `${props} ${str}` : `${props}
${ctx.indent}${str}`;
    }
    exports.createStringifyContext = createStringifyContext;
    exports.stringify = stringify;
  }
});

// node_modules/yaml/dist/stringify/stringifyPair.js
var require_stringifyPair = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyPair.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var stringify = require_stringify();
    var stringifyComment = require_stringifyComment();
    function stringifyPair({ key, value }, ctx, onComment, onChompKeep) {
      const { allNullValues, doc, indent, indentStep, options: { commentString, indentSeq, simpleKeys } } = ctx;
      let keyComment = identity.isNode(key) && key.comment || null;
      if (simpleKeys) {
        if (keyComment) {
          throw new Error("With simple keys, key nodes cannot have comments");
        }
        if (identity.isCollection(key) || !identity.isNode(key) && typeof key === "object") {
          const msg = "With simple keys, collection cannot be used as a key value";
          throw new Error(msg);
        }
      }
      let explicitKey = !simpleKeys && (!key || keyComment && value == null && !ctx.inFlow || identity.isCollection(key) || (identity.isScalar(key) ? key.type === Scalar.Scalar.BLOCK_FOLDED || key.type === Scalar.Scalar.BLOCK_LITERAL : typeof key === "object"));
      ctx = Object.assign({}, ctx, {
        allNullValues: false,
        implicitKey: !explicitKey && (simpleKeys || !allNullValues),
        indent: indent + indentStep
      });
      let keyCommentDone = false;
      let chompKeep = false;
      let str = stringify.stringify(key, ctx, () => keyCommentDone = true, () => chompKeep = true);
      if (!explicitKey && !ctx.inFlow && str.length > 1024) {
        if (simpleKeys)
          throw new Error("With simple keys, single line scalar must not span more than 1024 characters");
        explicitKey = true;
      }
      if (ctx.inFlow) {
        if (allNullValues || value == null) {
          if (keyCommentDone && onComment)
            onComment();
          return str === "" ? "?" : explicitKey ? `? ${str}` : str;
        }
      } else if (allNullValues && !simpleKeys || value == null && explicitKey) {
        str = `? ${str}`;
        if (keyComment && !keyCommentDone) {
          str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
        } else if (chompKeep && onChompKeep)
          onChompKeep();
        return str;
      }
      if (keyCommentDone)
        keyComment = null;
      if (explicitKey) {
        if (keyComment)
          str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
        str = `? ${str}
${indent}:`;
      } else {
        str = `${str}:`;
        if (keyComment)
          str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
      }
      let vsb, vcb, valueComment;
      if (identity.isNode(value)) {
        vsb = !!value.spaceBefore;
        vcb = value.commentBefore;
        valueComment = value.comment;
      } else {
        vsb = false;
        vcb = null;
        valueComment = null;
        if (value && typeof value === "object")
          value = doc.createNode(value);
      }
      ctx.implicitKey = false;
      if (!explicitKey && !keyComment && identity.isScalar(value))
        ctx.indentAtStart = str.length + 1;
      chompKeep = false;
      if (!indentSeq && indentStep.length >= 2 && !ctx.inFlow && !explicitKey && identity.isSeq(value) && !value.flow && !value.tag && !value.anchor) {
        ctx.indent = ctx.indent.substring(2);
      }
      let valueCommentDone = false;
      const valueStr = stringify.stringify(value, ctx, () => valueCommentDone = true, () => chompKeep = true);
      let ws = " ";
      if (keyComment || vsb || vcb) {
        ws = vsb ? "\n" : "";
        if (vcb) {
          const cs = commentString(vcb);
          ws += `
${stringifyComment.indentComment(cs, ctx.indent)}`;
        }
        if (valueStr === "" && !ctx.inFlow) {
          if (ws === "\n" && valueComment)
            ws = "\n\n";
        } else {
          ws += `
${ctx.indent}`;
        }
      } else if (!explicitKey && identity.isCollection(value)) {
        const vs0 = valueStr[0];
        const nl0 = valueStr.indexOf("\n");
        const hasNewline = nl0 !== -1;
        const flow = ctx.inFlow ?? value.flow ?? value.items.length === 0;
        if (hasNewline || !flow) {
          let hasPropsLine = false;
          if (hasNewline && (vs0 === "&" || vs0 === "!")) {
            let sp0 = valueStr.indexOf(" ");
            if (vs0 === "&" && sp0 !== -1 && sp0 < nl0 && valueStr[sp0 + 1] === "!") {
              sp0 = valueStr.indexOf(" ", sp0 + 1);
            }
            if (sp0 === -1 || nl0 < sp0)
              hasPropsLine = true;
          }
          if (!hasPropsLine)
            ws = `
${ctx.indent}`;
        }
      } else if (valueStr === "" || valueStr[0] === "\n") {
        ws = "";
      }
      str += ws + valueStr;
      if (ctx.inFlow) {
        if (valueCommentDone && onComment)
          onComment();
      } else if (valueComment && !valueCommentDone) {
        str += stringifyComment.lineComment(str, ctx.indent, commentString(valueComment));
      } else if (chompKeep && onChompKeep) {
        onChompKeep();
      }
      return str;
    }
    exports.stringifyPair = stringifyPair;
  }
});

// node_modules/yaml/dist/log.js
var require_log = __commonJS({
  "node_modules/yaml/dist/log.js"(exports) {
    "use strict";
    var node_process = __require("process");
    function debug(logLevel, ...messages) {
      if (logLevel === "debug")
        console.log(...messages);
    }
    function warn(logLevel, warning) {
      if (logLevel === "debug" || logLevel === "warn") {
        if (typeof node_process.emitWarning === "function")
          node_process.emitWarning(warning);
        else
          console.warn(warning);
      }
    }
    exports.debug = debug;
    exports.warn = warn;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/merge.js
var require_merge = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/merge.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var MERGE_KEY = "<<";
    var merge = {
      identify: (value) => value === MERGE_KEY || typeof value === "symbol" && value.description === MERGE_KEY,
      default: "key",
      tag: "tag:yaml.org,2002:merge",
      test: /^<<$/,
      resolve: () => Object.assign(new Scalar.Scalar(Symbol(MERGE_KEY)), {
        addToJSMap: addMergeToJSMap
      }),
      stringify: () => MERGE_KEY
    };
    var isMergeKey = (ctx, key) => (merge.identify(key) || identity.isScalar(key) && (!key.type || key.type === Scalar.Scalar.PLAIN) && merge.identify(key.value)) && ctx?.doc.schema.tags.some((tag) => tag.tag === merge.tag && tag.default);
    function addMergeToJSMap(ctx, map, value) {
      const source = resolveAliasValue(ctx, value);
      if (identity.isSeq(source))
        for (const it of source.items)
          mergeValue(ctx, map, it);
      else if (Array.isArray(source))
        for (const it of source)
          mergeValue(ctx, map, it);
      else
        mergeValue(ctx, map, source);
    }
    function mergeValue(ctx, map, value) {
      const source = resolveAliasValue(ctx, value);
      if (!identity.isMap(source))
        throw new Error("Merge sources must be maps or map aliases");
      const srcMap = source.toJSON(null, ctx, Map);
      for (const [key, value2] of srcMap) {
        if (map instanceof Map) {
          if (!map.has(key))
            map.set(key, value2);
        } else if (map instanceof Set) {
          map.add(key);
        } else if (!Object.prototype.hasOwnProperty.call(map, key)) {
          Object.defineProperty(map, key, {
            value: value2,
            writable: true,
            enumerable: true,
            configurable: true
          });
        }
      }
      return map;
    }
    function resolveAliasValue(ctx, value) {
      return ctx && identity.isAlias(value) ? value.resolve(ctx.doc, ctx) : value;
    }
    exports.addMergeToJSMap = addMergeToJSMap;
    exports.isMergeKey = isMergeKey;
    exports.merge = merge;
  }
});

// node_modules/yaml/dist/nodes/addPairToJSMap.js
var require_addPairToJSMap = __commonJS({
  "node_modules/yaml/dist/nodes/addPairToJSMap.js"(exports) {
    "use strict";
    var log2 = require_log();
    var merge = require_merge();
    var stringify = require_stringify();
    var identity = require_identity();
    var toJS = require_toJS();
    function addPairToJSMap(ctx, map, { key, value }) {
      if (identity.isNode(key) && key.addToJSMap)
        key.addToJSMap(ctx, map, value);
      else if (merge.isMergeKey(ctx, key))
        merge.addMergeToJSMap(ctx, map, value);
      else {
        const jsKey = toJS.toJS(key, "", ctx);
        if (map instanceof Map) {
          map.set(jsKey, toJS.toJS(value, jsKey, ctx));
        } else if (map instanceof Set) {
          map.add(jsKey);
        } else {
          const stringKey = stringifyKey(key, jsKey, ctx);
          const jsValue = toJS.toJS(value, stringKey, ctx);
          if (stringKey in map)
            Object.defineProperty(map, stringKey, {
              value: jsValue,
              writable: true,
              enumerable: true,
              configurable: true
            });
          else
            map[stringKey] = jsValue;
        }
      }
      return map;
    }
    function stringifyKey(key, jsKey, ctx) {
      if (jsKey === null)
        return "";
      if (typeof jsKey !== "object")
        return String(jsKey);
      if (identity.isNode(key) && ctx?.doc) {
        const strCtx = stringify.createStringifyContext(ctx.doc, {});
        strCtx.anchors = /* @__PURE__ */ new Set();
        for (const node of ctx.anchors.keys())
          strCtx.anchors.add(node.anchor);
        strCtx.inFlow = true;
        strCtx.inStringifyKey = true;
        const strKey = key.toString(strCtx);
        if (!ctx.mapKeyWarned) {
          let jsonStr = JSON.stringify(strKey);
          if (jsonStr.length > 40)
            jsonStr = jsonStr.substring(0, 36) + '..."';
          log2.warn(ctx.doc.options.logLevel, `Keys with collection values will be stringified due to JS Object restrictions: ${jsonStr}. Set mapAsMap: true to use object keys.`);
          ctx.mapKeyWarned = true;
        }
        return strKey;
      }
      return JSON.stringify(jsKey);
    }
    exports.addPairToJSMap = addPairToJSMap;
  }
});

// node_modules/yaml/dist/nodes/Pair.js
var require_Pair = __commonJS({
  "node_modules/yaml/dist/nodes/Pair.js"(exports) {
    "use strict";
    var createNode = require_createNode();
    var stringifyPair = require_stringifyPair();
    var addPairToJSMap = require_addPairToJSMap();
    var identity = require_identity();
    function createPair(key, value, ctx) {
      const k = createNode.createNode(key, void 0, ctx);
      const v = createNode.createNode(value, void 0, ctx);
      return new Pair(k, v);
    }
    var Pair = class _Pair {
      constructor(key, value = null) {
        Object.defineProperty(this, identity.NODE_TYPE, { value: identity.PAIR });
        this.key = key;
        this.value = value;
      }
      clone(schema) {
        let { key, value } = this;
        if (identity.isNode(key))
          key = key.clone(schema);
        if (identity.isNode(value))
          value = value.clone(schema);
        return new _Pair(key, value);
      }
      toJSON(_, ctx) {
        const pair = ctx?.mapAsMap ? /* @__PURE__ */ new Map() : {};
        return addPairToJSMap.addPairToJSMap(ctx, pair, this);
      }
      toString(ctx, onComment, onChompKeep) {
        return ctx?.doc ? stringifyPair.stringifyPair(this, ctx, onComment, onChompKeep) : JSON.stringify(this);
      }
    };
    exports.Pair = Pair;
    exports.createPair = createPair;
  }
});

// node_modules/yaml/dist/stringify/stringifyCollection.js
var require_stringifyCollection = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyCollection.js"(exports) {
    "use strict";
    var identity = require_identity();
    var stringify = require_stringify();
    var stringifyComment = require_stringifyComment();
    function stringifyCollection(collection, ctx, options) {
      const flow = ctx.inFlow ?? collection.flow;
      const stringify2 = flow ? stringifyFlowCollection : stringifyBlockCollection;
      return stringify2(collection, ctx, options);
    }
    function stringifyBlockCollection({ comment, items }, ctx, { blockItemPrefix, flowChars, itemIndent, onChompKeep, onComment }) {
      const { indent, options: { commentString } } = ctx;
      const itemCtx = Object.assign({}, ctx, { indent: itemIndent, type: null });
      let chompKeep = false;
      const lines = [];
      for (let i3 = 0; i3 < items.length; ++i3) {
        const item = items[i3];
        let comment2 = null;
        if (identity.isNode(item)) {
          if (!chompKeep && item.spaceBefore)
            lines.push("");
          addCommentBefore(ctx, lines, item.commentBefore, chompKeep);
          if (item.comment)
            comment2 = item.comment;
        } else if (identity.isPair(item)) {
          const ik = identity.isNode(item.key) ? item.key : null;
          if (ik) {
            if (!chompKeep && ik.spaceBefore)
              lines.push("");
            addCommentBefore(ctx, lines, ik.commentBefore, chompKeep);
          }
        }
        chompKeep = false;
        let str2 = stringify.stringify(item, itemCtx, () => comment2 = null, () => chompKeep = true);
        if (comment2)
          str2 += stringifyComment.lineComment(str2, itemIndent, commentString(comment2));
        if (chompKeep && comment2)
          chompKeep = false;
        lines.push(blockItemPrefix + str2);
      }
      let str;
      if (lines.length === 0) {
        str = flowChars.start + flowChars.end;
      } else {
        str = lines[0];
        for (let i3 = 1; i3 < lines.length; ++i3) {
          const line = lines[i3];
          str += line ? `
${indent}${line}` : "\n";
        }
      }
      if (comment) {
        str += "\n" + stringifyComment.indentComment(commentString(comment), indent);
        if (onComment)
          onComment();
      } else if (chompKeep && onChompKeep)
        onChompKeep();
      return str;
    }
    function stringifyFlowCollection({ items }, ctx, { flowChars, itemIndent }) {
      const { indent, indentStep, flowCollectionPadding: fcPadding, options: { commentString } } = ctx;
      itemIndent += indentStep;
      const itemCtx = Object.assign({}, ctx, {
        indent: itemIndent,
        inFlow: true,
        type: null
      });
      let reqNewline = false;
      let linesAtValue = 0;
      const lines = [];
      for (let i3 = 0; i3 < items.length; ++i3) {
        const item = items[i3];
        let comment = null;
        if (identity.isNode(item)) {
          if (item.spaceBefore)
            lines.push("");
          addCommentBefore(ctx, lines, item.commentBefore, false);
          if (item.comment)
            comment = item.comment;
        } else if (identity.isPair(item)) {
          const ik = identity.isNode(item.key) ? item.key : null;
          if (ik) {
            if (ik.spaceBefore)
              lines.push("");
            addCommentBefore(ctx, lines, ik.commentBefore, false);
            if (ik.comment)
              reqNewline = true;
          }
          const iv = identity.isNode(item.value) ? item.value : null;
          if (iv) {
            if (iv.comment)
              comment = iv.comment;
            if (iv.commentBefore)
              reqNewline = true;
          } else if (item.value == null && ik?.comment) {
            comment = ik.comment;
          }
        }
        if (comment)
          reqNewline = true;
        let str = stringify.stringify(item, itemCtx, () => comment = null);
        reqNewline || (reqNewline = lines.length > linesAtValue || str.includes("\n"));
        if (i3 < items.length - 1) {
          str += ",";
        } else if (ctx.options.trailingComma) {
          if (ctx.options.lineWidth > 0) {
            reqNewline || (reqNewline = lines.reduce((sum, line) => sum + line.length + 2, 2) + (str.length + 2) > ctx.options.lineWidth);
          }
          if (reqNewline) {
            str += ",";
          }
        }
        if (comment)
          str += stringifyComment.lineComment(str, itemIndent, commentString(comment));
        lines.push(str);
        linesAtValue = lines.length;
      }
      const { start, end } = flowChars;
      if (lines.length === 0) {
        return start + end;
      } else {
        if (!reqNewline) {
          const len = lines.reduce((sum, line) => sum + line.length + 2, 2);
          reqNewline = ctx.options.lineWidth > 0 && len > ctx.options.lineWidth;
        }
        if (reqNewline) {
          let str = start;
          for (const line of lines)
            str += line ? `
${indentStep}${indent}${line}` : "\n";
          return `${str}
${indent}${end}`;
        } else {
          return `${start}${fcPadding}${lines.join(" ")}${fcPadding}${end}`;
        }
      }
    }
    function addCommentBefore({ indent, options: { commentString } }, lines, comment, chompKeep) {
      if (comment && chompKeep)
        comment = comment.replace(/^\n+/, "");
      if (comment) {
        const ic = stringifyComment.indentComment(commentString(comment), indent);
        lines.push(ic.trimStart());
      }
    }
    exports.stringifyCollection = stringifyCollection;
  }
});

// node_modules/yaml/dist/nodes/YAMLMap.js
var require_YAMLMap = __commonJS({
  "node_modules/yaml/dist/nodes/YAMLMap.js"(exports) {
    "use strict";
    var stringifyCollection = require_stringifyCollection();
    var addPairToJSMap = require_addPairToJSMap();
    var Collection = require_Collection();
    var identity = require_identity();
    var Pair = require_Pair();
    var Scalar = require_Scalar();
    function findPair(items, key) {
      const k = identity.isScalar(key) ? key.value : key;
      for (const it of items) {
        if (identity.isPair(it)) {
          if (it.key === key || it.key === k)
            return it;
          if (identity.isScalar(it.key) && it.key.value === k)
            return it;
        }
      }
      return void 0;
    }
    var YAMLMap = class extends Collection.Collection {
      static get tagName() {
        return "tag:yaml.org,2002:map";
      }
      constructor(schema) {
        super(identity.MAP, schema);
        this.items = [];
      }
      /**
       * A generic collection parsing method that can be extended
       * to other node classes that inherit from YAMLMap
       */
      static from(schema, obj, ctx) {
        const { keepUndefined, replacer } = ctx;
        const map = new this(schema);
        const add = (key, value) => {
          if (typeof replacer === "function")
            value = replacer.call(obj, key, value);
          else if (Array.isArray(replacer) && !replacer.includes(key))
            return;
          if (value !== void 0 || keepUndefined)
            map.items.push(Pair.createPair(key, value, ctx));
        };
        if (obj instanceof Map) {
          for (const [key, value] of obj)
            add(key, value);
        } else if (obj && typeof obj === "object") {
          for (const key of Object.keys(obj))
            add(key, obj[key]);
        }
        if (typeof schema.sortMapEntries === "function") {
          map.items.sort(schema.sortMapEntries);
        }
        return map;
      }
      /**
       * Adds a value to the collection.
       *
       * @param overwrite - If not set `true`, using a key that is already in the
       *   collection will throw. Otherwise, overwrites the previous value.
       */
      add(pair, overwrite) {
        let _pair;
        if (identity.isPair(pair))
          _pair = pair;
        else if (!pair || typeof pair !== "object" || !("key" in pair)) {
          _pair = new Pair.Pair(pair, pair?.value);
        } else
          _pair = new Pair.Pair(pair.key, pair.value);
        const prev = findPair(this.items, _pair.key);
        const sortEntries = this.schema?.sortMapEntries;
        if (prev) {
          if (!overwrite)
            throw new Error(`Key ${_pair.key} already set`);
          if (identity.isScalar(prev.value) && Scalar.isScalarValue(_pair.value))
            prev.value.value = _pair.value;
          else
            prev.value = _pair.value;
        } else if (sortEntries) {
          const i3 = this.items.findIndex((item) => sortEntries(_pair, item) < 0);
          if (i3 === -1)
            this.items.push(_pair);
          else
            this.items.splice(i3, 0, _pair);
        } else {
          this.items.push(_pair);
        }
      }
      delete(key) {
        const it = findPair(this.items, key);
        if (!it)
          return false;
        const del = this.items.splice(this.items.indexOf(it), 1);
        return del.length > 0;
      }
      get(key, keepScalar) {
        const it = findPair(this.items, key);
        const node = it?.value;
        return (!keepScalar && identity.isScalar(node) ? node.value : node) ?? void 0;
      }
      has(key) {
        return !!findPair(this.items, key);
      }
      set(key, value) {
        this.add(new Pair.Pair(key, value), true);
      }
      /**
       * @param ctx - Conversion context, originally set in Document#toJS()
       * @param {Class} Type - If set, forces the returned collection type
       * @returns Instance of Type, Map, or Object
       */
      toJSON(_, ctx, Type) {
        const map = Type ? new Type() : ctx?.mapAsMap ? /* @__PURE__ */ new Map() : {};
        if (ctx?.onCreate)
          ctx.onCreate(map);
        for (const item of this.items)
          addPairToJSMap.addPairToJSMap(ctx, map, item);
        return map;
      }
      toString(ctx, onComment, onChompKeep) {
        if (!ctx)
          return JSON.stringify(this);
        for (const item of this.items) {
          if (!identity.isPair(item))
            throw new Error(`Map items must all be pairs; found ${JSON.stringify(item)} instead`);
        }
        if (!ctx.allNullValues && this.hasAllNullValues(false))
          ctx = Object.assign({}, ctx, { allNullValues: true });
        return stringifyCollection.stringifyCollection(this, ctx, {
          blockItemPrefix: "",
          flowChars: { start: "{", end: "}" },
          itemIndent: ctx.indent || "",
          onChompKeep,
          onComment
        });
      }
    };
    exports.YAMLMap = YAMLMap;
    exports.findPair = findPair;
  }
});

// node_modules/yaml/dist/schema/common/map.js
var require_map = __commonJS({
  "node_modules/yaml/dist/schema/common/map.js"(exports) {
    "use strict";
    var identity = require_identity();
    var YAMLMap = require_YAMLMap();
    var map = {
      collection: "map",
      default: true,
      nodeClass: YAMLMap.YAMLMap,
      tag: "tag:yaml.org,2002:map",
      resolve(map2, onError) {
        if (!identity.isMap(map2))
          onError("Expected a mapping for this tag");
        return map2;
      },
      createNode: (schema, obj, ctx) => YAMLMap.YAMLMap.from(schema, obj, ctx)
    };
    exports.map = map;
  }
});

// node_modules/yaml/dist/nodes/YAMLSeq.js
var require_YAMLSeq = __commonJS({
  "node_modules/yaml/dist/nodes/YAMLSeq.js"(exports) {
    "use strict";
    var createNode = require_createNode();
    var stringifyCollection = require_stringifyCollection();
    var Collection = require_Collection();
    var identity = require_identity();
    var Scalar = require_Scalar();
    var toJS = require_toJS();
    var YAMLSeq = class extends Collection.Collection {
      static get tagName() {
        return "tag:yaml.org,2002:seq";
      }
      constructor(schema) {
        super(identity.SEQ, schema);
        this.items = [];
      }
      add(value) {
        this.items.push(value);
      }
      /**
       * Removes a value from the collection.
       *
       * `key` must contain a representation of an integer for this to succeed.
       * It may be wrapped in a `Scalar`.
       *
       * @returns `true` if the item was found and removed.
       */
      delete(key) {
        const idx = asItemIndex(key);
        if (typeof idx !== "number")
          return false;
        const del = this.items.splice(idx, 1);
        return del.length > 0;
      }
      get(key, keepScalar) {
        const idx = asItemIndex(key);
        if (typeof idx !== "number")
          return void 0;
        const it = this.items[idx];
        return !keepScalar && identity.isScalar(it) ? it.value : it;
      }
      /**
       * Checks if the collection includes a value with the key `key`.
       *
       * `key` must contain a representation of an integer for this to succeed.
       * It may be wrapped in a `Scalar`.
       */
      has(key) {
        const idx = asItemIndex(key);
        return typeof idx === "number" && idx < this.items.length;
      }
      /**
       * Sets a value in this collection. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       *
       * If `key` does not contain a representation of an integer, this will throw.
       * It may be wrapped in a `Scalar`.
       */
      set(key, value) {
        const idx = asItemIndex(key);
        if (typeof idx !== "number")
          throw new Error(`Expected a valid index, not ${key}.`);
        const prev = this.items[idx];
        if (identity.isScalar(prev) && Scalar.isScalarValue(value))
          prev.value = value;
        else
          this.items[idx] = value;
      }
      toJSON(_, ctx) {
        const seq = [];
        if (ctx?.onCreate)
          ctx.onCreate(seq);
        let i3 = 0;
        for (const item of this.items)
          seq.push(toJS.toJS(item, String(i3++), ctx));
        return seq;
      }
      toString(ctx, onComment, onChompKeep) {
        if (!ctx)
          return JSON.stringify(this);
        return stringifyCollection.stringifyCollection(this, ctx, {
          blockItemPrefix: "- ",
          flowChars: { start: "[", end: "]" },
          itemIndent: (ctx.indent || "") + "  ",
          onChompKeep,
          onComment
        });
      }
      static from(schema, obj, ctx) {
        const { replacer } = ctx;
        const seq = new this(schema);
        if (obj && Symbol.iterator in Object(obj)) {
          let i3 = 0;
          for (let it of obj) {
            if (typeof replacer === "function") {
              const key = obj instanceof Set ? it : String(i3++);
              it = replacer.call(obj, key, it);
            }
            seq.items.push(createNode.createNode(it, void 0, ctx));
          }
        }
        return seq;
      }
    };
    function asItemIndex(key) {
      let idx = identity.isScalar(key) ? key.value : key;
      if (idx && typeof idx === "string")
        idx = Number(idx);
      return typeof idx === "number" && Number.isInteger(idx) && idx >= 0 ? idx : null;
    }
    exports.YAMLSeq = YAMLSeq;
  }
});

// node_modules/yaml/dist/schema/common/seq.js
var require_seq = __commonJS({
  "node_modules/yaml/dist/schema/common/seq.js"(exports) {
    "use strict";
    var identity = require_identity();
    var YAMLSeq = require_YAMLSeq();
    var seq = {
      collection: "seq",
      default: true,
      nodeClass: YAMLSeq.YAMLSeq,
      tag: "tag:yaml.org,2002:seq",
      resolve(seq2, onError) {
        if (!identity.isSeq(seq2))
          onError("Expected a sequence for this tag");
        return seq2;
      },
      createNode: (schema, obj, ctx) => YAMLSeq.YAMLSeq.from(schema, obj, ctx)
    };
    exports.seq = seq;
  }
});

// node_modules/yaml/dist/schema/common/string.js
var require_string = __commonJS({
  "node_modules/yaml/dist/schema/common/string.js"(exports) {
    "use strict";
    var stringifyString = require_stringifyString();
    var string = {
      identify: (value) => typeof value === "string",
      default: true,
      tag: "tag:yaml.org,2002:str",
      resolve: (str) => str,
      stringify(item, ctx, onComment, onChompKeep) {
        ctx = Object.assign({ actualString: true }, ctx);
        return stringifyString.stringifyString(item, ctx, onComment, onChompKeep);
      }
    };
    exports.string = string;
  }
});

// node_modules/yaml/dist/schema/common/null.js
var require_null = __commonJS({
  "node_modules/yaml/dist/schema/common/null.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var nullTag = {
      identify: (value) => value == null,
      createNode: () => new Scalar.Scalar(null),
      default: true,
      tag: "tag:yaml.org,2002:null",
      test: /^(?:~|[Nn]ull|NULL)?$/,
      resolve: () => new Scalar.Scalar(null),
      stringify: ({ source }, ctx) => typeof source === "string" && nullTag.test.test(source) ? source : ctx.options.nullStr
    };
    exports.nullTag = nullTag;
  }
});

// node_modules/yaml/dist/schema/core/bool.js
var require_bool = __commonJS({
  "node_modules/yaml/dist/schema/core/bool.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var boolTag = {
      identify: (value) => typeof value === "boolean",
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
      resolve: (str) => new Scalar.Scalar(str[0] === "t" || str[0] === "T"),
      stringify({ source, value }, ctx) {
        if (source && boolTag.test.test(source)) {
          const sv = source[0] === "t" || source[0] === "T";
          if (value === sv)
            return source;
        }
        return value ? ctx.options.trueStr : ctx.options.falseStr;
      }
    };
    exports.boolTag = boolTag;
  }
});

// node_modules/yaml/dist/stringify/stringifyNumber.js
var require_stringifyNumber = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyNumber.js"(exports) {
    "use strict";
    function stringifyNumber({ format, minFractionDigits, tag, value }) {
      if (typeof value === "bigint")
        return String(value);
      const num2 = typeof value === "number" ? value : Number(value);
      if (!isFinite(num2))
        return isNaN(num2) ? ".nan" : num2 < 0 ? "-.inf" : ".inf";
      let n = Object.is(value, -0) ? "-0" : JSON.stringify(value);
      if (!format && minFractionDigits && (!tag || tag === "tag:yaml.org,2002:float") && /^-?\d/.test(n) && !n.includes("e")) {
        let i3 = n.indexOf(".");
        if (i3 < 0) {
          i3 = n.length;
          n += ".";
        }
        let d = minFractionDigits - (n.length - i3 - 1);
        while (d-- > 0)
          n += "0";
      }
      return n;
    }
    exports.stringifyNumber = stringifyNumber;
  }
});

// node_modules/yaml/dist/schema/core/float.js
var require_float = __commonJS({
  "node_modules/yaml/dist/schema/core/float.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var stringifyNumber = require_stringifyNumber();
    var floatNaN = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
      resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
      stringify: stringifyNumber.stringifyNumber
    };
    var floatExp = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      format: "EXP",
      test: /^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,
      resolve: (str) => parseFloat(str),
      stringify(node) {
        const num2 = Number(node.value);
        return isFinite(num2) ? num2.toExponential() : stringifyNumber.stringifyNumber(node);
      }
    };
    var float = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,
      resolve(str) {
        const node = new Scalar.Scalar(parseFloat(str));
        const dot = str.indexOf(".");
        if (dot !== -1 && str[str.length - 1] === "0")
          node.minFractionDigits = str.length - dot - 1;
        return node;
      },
      stringify: stringifyNumber.stringifyNumber
    };
    exports.float = float;
    exports.floatExp = floatExp;
    exports.floatNaN = floatNaN;
  }
});

// node_modules/yaml/dist/schema/core/int.js
var require_int = __commonJS({
  "node_modules/yaml/dist/schema/core/int.js"(exports) {
    "use strict";
    var stringifyNumber = require_stringifyNumber();
    var intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
    var intResolve = (str, offset, radix, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str.substring(offset), radix);
    function intStringify(node, radix, prefix) {
      const { value } = node;
      if (intIdentify(value) && value >= 0)
        return prefix + value.toString(radix);
      return stringifyNumber.stringifyNumber(node);
    }
    var intOct = {
      identify: (value) => intIdentify(value) && value >= 0,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "OCT",
      test: /^0o[0-7]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 8, opt),
      stringify: (node) => intStringify(node, 8, "0o")
    };
    var int = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      test: /^[-+]?[0-9]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
      stringify: stringifyNumber.stringifyNumber
    };
    var intHex = {
      identify: (value) => intIdentify(value) && value >= 0,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "HEX",
      test: /^0x[0-9a-fA-F]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
      stringify: (node) => intStringify(node, 16, "0x")
    };
    exports.int = int;
    exports.intHex = intHex;
    exports.intOct = intOct;
  }
});

// node_modules/yaml/dist/schema/core/schema.js
var require_schema = __commonJS({
  "node_modules/yaml/dist/schema/core/schema.js"(exports) {
    "use strict";
    var map = require_map();
    var _null = require_null();
    var seq = require_seq();
    var string = require_string();
    var bool = require_bool();
    var float = require_float();
    var int = require_int();
    var schema = [
      map.map,
      seq.seq,
      string.string,
      _null.nullTag,
      bool.boolTag,
      int.intOct,
      int.int,
      int.intHex,
      float.floatNaN,
      float.floatExp,
      float.float
    ];
    exports.schema = schema;
  }
});

// node_modules/yaml/dist/schema/json/schema.js
var require_schema2 = __commonJS({
  "node_modules/yaml/dist/schema/json/schema.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var map = require_map();
    var seq = require_seq();
    function intIdentify(value) {
      return typeof value === "bigint" || Number.isInteger(value);
    }
    var stringifyJSON = ({ value }) => JSON.stringify(value);
    var jsonScalars = [
      {
        identify: (value) => typeof value === "string",
        default: true,
        tag: "tag:yaml.org,2002:str",
        resolve: (str) => str,
        stringify: stringifyJSON
      },
      {
        identify: (value) => value == null,
        createNode: () => new Scalar.Scalar(null),
        default: true,
        tag: "tag:yaml.org,2002:null",
        test: /^null$/,
        resolve: () => null,
        stringify: stringifyJSON
      },
      {
        identify: (value) => typeof value === "boolean",
        default: true,
        tag: "tag:yaml.org,2002:bool",
        test: /^true$|^false$/,
        resolve: (str) => str === "true",
        stringify: stringifyJSON
      },
      {
        identify: intIdentify,
        default: true,
        tag: "tag:yaml.org,2002:int",
        test: /^-?(?:0|[1-9][0-9]*)$/,
        resolve: (str, _onError, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str, 10),
        stringify: ({ value }) => intIdentify(value) ? value.toString() : JSON.stringify(value)
      },
      {
        identify: (value) => typeof value === "number",
        default: true,
        tag: "tag:yaml.org,2002:float",
        test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
        resolve: (str) => parseFloat(str),
        stringify: stringifyJSON
      }
    ];
    var jsonError = {
      default: true,
      tag: "",
      test: /^/,
      resolve(str, onError) {
        onError(`Unresolved plain scalar ${JSON.stringify(str)}`);
        return str;
      }
    };
    var schema = [map.map, seq.seq].concat(jsonScalars, jsonError);
    exports.schema = schema;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/binary.js
var require_binary = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/binary.js"(exports) {
    "use strict";
    var node_buffer = __require("buffer");
    var Scalar = require_Scalar();
    var stringifyString = require_stringifyString();
    var binary = {
      identify: (value) => value instanceof Uint8Array,
      // Buffer inherits from Uint8Array
      default: false,
      tag: "tag:yaml.org,2002:binary",
      /**
       * Returns a Buffer in node and an Uint8Array in browsers
       *
       * To use the resulting buffer as an image, you'll want to do something like:
       *
       *   const blob = new Blob([buffer], { type: 'image/jpeg' })
       *   document.querySelector('#photo').src = URL.createObjectURL(blob)
       */
      resolve(src, onError) {
        if (typeof node_buffer.Buffer === "function") {
          return node_buffer.Buffer.from(src, "base64");
        } else if (typeof atob === "function") {
          const str = atob(src.replace(/[\n\r]/g, ""));
          const buffer = new Uint8Array(str.length);
          for (let i3 = 0; i3 < str.length; ++i3)
            buffer[i3] = str.charCodeAt(i3);
          return buffer;
        } else {
          onError("This environment does not support reading binary tags; either Buffer or atob is required");
          return src;
        }
      },
      stringify({ comment, type, value }, ctx, onComment, onChompKeep) {
        if (!value)
          return "";
        const buf = value;
        let str;
        if (typeof node_buffer.Buffer === "function") {
          str = buf instanceof node_buffer.Buffer ? buf.toString("base64") : node_buffer.Buffer.from(buf.buffer).toString("base64");
        } else if (typeof btoa === "function") {
          let s = "";
          for (let i3 = 0; i3 < buf.length; ++i3)
            s += String.fromCharCode(buf[i3]);
          str = btoa(s);
        } else {
          throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");
        }
        type ?? (type = Scalar.Scalar.BLOCK_LITERAL);
        if (type !== Scalar.Scalar.QUOTE_DOUBLE) {
          const lineWidth = Math.max(ctx.options.lineWidth - ctx.indent.length, ctx.options.minContentWidth);
          const n = Math.ceil(str.length / lineWidth);
          const lines = new Array(n);
          for (let i3 = 0, o = 0; i3 < n; ++i3, o += lineWidth) {
            lines[i3] = str.substr(o, lineWidth);
          }
          str = lines.join(type === Scalar.Scalar.BLOCK_LITERAL ? "\n" : " ");
        }
        return stringifyString.stringifyString({ comment, type, value: str }, ctx, onComment, onChompKeep);
      }
    };
    exports.binary = binary;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/pairs.js
var require_pairs = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/pairs.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Pair = require_Pair();
    var Scalar = require_Scalar();
    var YAMLSeq = require_YAMLSeq();
    function resolvePairs(seq, onError) {
      if (identity.isSeq(seq)) {
        for (let i3 = 0; i3 < seq.items.length; ++i3) {
          let item = seq.items[i3];
          if (identity.isPair(item))
            continue;
          else if (identity.isMap(item)) {
            if (item.items.length > 1)
              onError("Each pair must have its own sequence indicator");
            const pair = item.items[0] || new Pair.Pair(new Scalar.Scalar(null));
            if (item.commentBefore)
              pair.key.commentBefore = pair.key.commentBefore ? `${item.commentBefore}
${pair.key.commentBefore}` : item.commentBefore;
            if (item.comment) {
              const cn = pair.value ?? pair.key;
              cn.comment = cn.comment ? `${item.comment}
${cn.comment}` : item.comment;
            }
            item = pair;
          }
          seq.items[i3] = identity.isPair(item) ? item : new Pair.Pair(item);
        }
      } else
        onError("Expected a sequence for this tag");
      return seq;
    }
    function createPairs(schema, iterable, ctx) {
      const { replacer } = ctx;
      const pairs3 = new YAMLSeq.YAMLSeq(schema);
      pairs3.tag = "tag:yaml.org,2002:pairs";
      let i3 = 0;
      if (iterable && Symbol.iterator in Object(iterable))
        for (let it of iterable) {
          if (typeof replacer === "function")
            it = replacer.call(iterable, String(i3++), it);
          let key, value;
          if (Array.isArray(it)) {
            if (it.length === 2) {
              key = it[0];
              value = it[1];
            } else
              throw new TypeError(`Expected [key, value] tuple: ${it}`);
          } else if (it && it instanceof Object) {
            const keys = Object.keys(it);
            if (keys.length === 1) {
              key = keys[0];
              value = it[key];
            } else {
              throw new TypeError(`Expected tuple with one key, not ${keys.length} keys`);
            }
          } else {
            key = it;
          }
          pairs3.items.push(Pair.createPair(key, value, ctx));
        }
      return pairs3;
    }
    var pairs2 = {
      collection: "seq",
      default: false,
      tag: "tag:yaml.org,2002:pairs",
      resolve: resolvePairs,
      createNode: createPairs
    };
    exports.createPairs = createPairs;
    exports.pairs = pairs2;
    exports.resolvePairs = resolvePairs;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/omap.js
var require_omap = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/omap.js"(exports) {
    "use strict";
    var identity = require_identity();
    var toJS = require_toJS();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var pairs2 = require_pairs();
    var YAMLOMap = class _YAMLOMap extends YAMLSeq.YAMLSeq {
      constructor() {
        super();
        this.add = YAMLMap.YAMLMap.prototype.add.bind(this);
        this.delete = YAMLMap.YAMLMap.prototype.delete.bind(this);
        this.get = YAMLMap.YAMLMap.prototype.get.bind(this);
        this.has = YAMLMap.YAMLMap.prototype.has.bind(this);
        this.set = YAMLMap.YAMLMap.prototype.set.bind(this);
        this.tag = _YAMLOMap.tag;
      }
      /**
       * If `ctx` is given, the return type is actually `Map<unknown, unknown>`,
       * but TypeScript won't allow widening the signature of a child method.
       */
      toJSON(_, ctx) {
        if (!ctx)
          return super.toJSON(_);
        const map = /* @__PURE__ */ new Map();
        if (ctx?.onCreate)
          ctx.onCreate(map);
        for (const pair of this.items) {
          let key, value;
          if (identity.isPair(pair)) {
            key = toJS.toJS(pair.key, "", ctx);
            value = toJS.toJS(pair.value, key, ctx);
          } else {
            key = toJS.toJS(pair, "", ctx);
          }
          if (map.has(key))
            throw new Error("Ordered maps must not include duplicate keys");
          map.set(key, value);
        }
        return map;
      }
      static from(schema, iterable, ctx) {
        const pairs$1 = pairs2.createPairs(schema, iterable, ctx);
        const omap2 = new this();
        omap2.items = pairs$1.items;
        return omap2;
      }
    };
    YAMLOMap.tag = "tag:yaml.org,2002:omap";
    var omap = {
      collection: "seq",
      identify: (value) => value instanceof Map,
      nodeClass: YAMLOMap,
      default: false,
      tag: "tag:yaml.org,2002:omap",
      resolve(seq, onError) {
        const pairs$1 = pairs2.resolvePairs(seq, onError);
        const seenKeys = [];
        for (const { key } of pairs$1.items) {
          if (identity.isScalar(key)) {
            if (seenKeys.includes(key.value)) {
              onError(`Ordered maps must not include duplicate keys: ${key.value}`);
            } else {
              seenKeys.push(key.value);
            }
          }
        }
        return Object.assign(new YAMLOMap(), pairs$1);
      },
      createNode: (schema, iterable, ctx) => YAMLOMap.from(schema, iterable, ctx)
    };
    exports.YAMLOMap = YAMLOMap;
    exports.omap = omap;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/bool.js
var require_bool2 = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/bool.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    function boolStringify({ value, source }, ctx) {
      const boolObj = value ? trueTag : falseTag;
      if (source && boolObj.test.test(source))
        return source;
      return value ? ctx.options.trueStr : ctx.options.falseStr;
    }
    var trueTag = {
      identify: (value) => value === true,
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
      resolve: () => new Scalar.Scalar(true),
      stringify: boolStringify
    };
    var falseTag = {
      identify: (value) => value === false,
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,
      resolve: () => new Scalar.Scalar(false),
      stringify: boolStringify
    };
    exports.falseTag = falseTag;
    exports.trueTag = trueTag;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/float.js
var require_float2 = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/float.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var stringifyNumber = require_stringifyNumber();
    var floatNaN = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
      resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
      stringify: stringifyNumber.stringifyNumber
    };
    var floatExp = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      format: "EXP",
      test: /^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,
      resolve: (str) => parseFloat(str.replace(/_/g, "")),
      stringify(node) {
        const num2 = Number(node.value);
        return isFinite(num2) ? num2.toExponential() : stringifyNumber.stringifyNumber(node);
      }
    };
    var float = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,
      resolve(str) {
        const node = new Scalar.Scalar(parseFloat(str.replace(/_/g, "")));
        const dot = str.indexOf(".");
        if (dot !== -1) {
          const f = str.substring(dot + 1).replace(/_/g, "");
          if (f[f.length - 1] === "0")
            node.minFractionDigits = f.length;
        }
        return node;
      },
      stringify: stringifyNumber.stringifyNumber
    };
    exports.float = float;
    exports.floatExp = floatExp;
    exports.floatNaN = floatNaN;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/int.js
var require_int2 = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/int.js"(exports) {
    "use strict";
    var stringifyNumber = require_stringifyNumber();
    var intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
    function intResolve(str, offset, radix, { intAsBigInt }) {
      const sign = str[0];
      if (sign === "-" || sign === "+")
        offset += 1;
      str = str.substring(offset).replace(/_/g, "");
      if (intAsBigInt) {
        switch (radix) {
          case 2:
            str = `0b${str}`;
            break;
          case 8:
            str = `0o${str}`;
            break;
          case 16:
            str = `0x${str}`;
            break;
        }
        const n2 = BigInt(str);
        return sign === "-" ? BigInt(-1) * n2 : n2;
      }
      const n = parseInt(str, radix);
      return sign === "-" ? -1 * n : n;
    }
    function intStringify(node, radix, prefix) {
      const { value } = node;
      if (intIdentify(value)) {
        const str = value.toString(radix);
        return value < 0 ? "-" + prefix + str.substr(1) : prefix + str;
      }
      return stringifyNumber.stringifyNumber(node);
    }
    var intBin = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "BIN",
      test: /^[-+]?0b[0-1_]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 2, opt),
      stringify: (node) => intStringify(node, 2, "0b")
    };
    var intOct = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "OCT",
      test: /^[-+]?0[0-7_]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 1, 8, opt),
      stringify: (node) => intStringify(node, 8, "0")
    };
    var int = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      test: /^[-+]?[0-9][0-9_]*$/,
      resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
      stringify: stringifyNumber.stringifyNumber
    };
    var intHex = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "HEX",
      test: /^[-+]?0x[0-9a-fA-F_]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
      stringify: (node) => intStringify(node, 16, "0x")
    };
    exports.int = int;
    exports.intBin = intBin;
    exports.intHex = intHex;
    exports.intOct = intOct;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/set.js
var require_set = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/set.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Pair = require_Pair();
    var YAMLMap = require_YAMLMap();
    var YAMLSet = class _YAMLSet extends YAMLMap.YAMLMap {
      constructor(schema) {
        super(schema);
        this.tag = _YAMLSet.tag;
      }
      add(key) {
        let pair;
        if (identity.isPair(key))
          pair = key;
        else if (key && typeof key === "object" && "key" in key && "value" in key && key.value === null)
          pair = new Pair.Pair(key.key, null);
        else
          pair = new Pair.Pair(key, null);
        const prev = YAMLMap.findPair(this.items, pair.key);
        if (!prev)
          this.items.push(pair);
      }
      /**
       * If `keepPair` is `true`, returns the Pair matching `key`.
       * Otherwise, returns the value of that Pair's key.
       */
      get(key, keepPair) {
        const pair = YAMLMap.findPair(this.items, key);
        return !keepPair && identity.isPair(pair) ? identity.isScalar(pair.key) ? pair.key.value : pair.key : pair;
      }
      set(key, value) {
        if (typeof value !== "boolean")
          throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof value}`);
        const prev = YAMLMap.findPair(this.items, key);
        if (prev && !value) {
          this.items.splice(this.items.indexOf(prev), 1);
        } else if (!prev && value) {
          this.items.push(new Pair.Pair(key));
        }
      }
      toJSON(_, ctx) {
        return super.toJSON(_, ctx, Set);
      }
      toString(ctx, onComment, onChompKeep) {
        if (!ctx)
          return JSON.stringify(this);
        if (this.hasAllNullValues(true))
          return super.toString(Object.assign({}, ctx, { allNullValues: true }), onComment, onChompKeep);
        else
          throw new Error("Set items must all have null values");
      }
      static from(schema, iterable, ctx) {
        const { replacer } = ctx;
        const set2 = new this(schema);
        if (iterable && Symbol.iterator in Object(iterable))
          for (let value of iterable) {
            if (typeof replacer === "function")
              value = replacer.call(iterable, value, value);
            set2.items.push(Pair.createPair(value, null, ctx));
          }
        return set2;
      }
    };
    YAMLSet.tag = "tag:yaml.org,2002:set";
    var set = {
      collection: "map",
      identify: (value) => value instanceof Set,
      nodeClass: YAMLSet,
      default: false,
      tag: "tag:yaml.org,2002:set",
      createNode: (schema, iterable, ctx) => YAMLSet.from(schema, iterable, ctx),
      resolve(map, onError) {
        if (identity.isMap(map)) {
          if (map.hasAllNullValues(true))
            return Object.assign(new YAMLSet(), map);
          else
            onError("Set items must all have null values");
        } else
          onError("Expected a mapping for this tag");
        return map;
      }
    };
    exports.YAMLSet = YAMLSet;
    exports.set = set;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/timestamp.js
var require_timestamp = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/timestamp.js"(exports) {
    "use strict";
    var stringifyNumber = require_stringifyNumber();
    function parseSexagesimal(str, asBigInt) {
      const sign = str[0];
      const parts = sign === "-" || sign === "+" ? str.substring(1) : str;
      const num2 = (n) => asBigInt ? BigInt(n) : Number(n);
      const res = parts.replace(/_/g, "").split(":").reduce((res2, p) => res2 * num2(60) + num2(p), num2(0));
      return sign === "-" ? num2(-1) * res : res;
    }
    function stringifySexagesimal(node) {
      let { value } = node;
      let num2 = (n) => n;
      if (typeof value === "bigint")
        num2 = (n) => BigInt(n);
      else if (isNaN(value) || !isFinite(value))
        return stringifyNumber.stringifyNumber(node);
      let sign = "";
      if (value < 0) {
        sign = "-";
        value *= num2(-1);
      }
      const _60 = num2(60);
      const parts = [value % _60];
      if (value < 60) {
        parts.unshift(0);
      } else {
        value = (value - parts[0]) / _60;
        parts.unshift(value % _60);
        if (value >= 60) {
          value = (value - parts[0]) / _60;
          parts.unshift(value);
        }
      }
      return sign + parts.map((n) => String(n).padStart(2, "0")).join(":").replace(/000000\d*$/, "");
    }
    var intTime = {
      identify: (value) => typeof value === "bigint" || Number.isInteger(value),
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "TIME",
      test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,
      resolve: (str, _onError, { intAsBigInt }) => parseSexagesimal(str, intAsBigInt),
      stringify: stringifySexagesimal
    };
    var floatTime = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      format: "TIME",
      test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,
      resolve: (str) => parseSexagesimal(str, false),
      stringify: stringifySexagesimal
    };
    var timestamp = {
      identify: (value) => value instanceof Date,
      default: true,
      tag: "tag:yaml.org,2002:timestamp",
      // If the time zone is omitted, the timestamp is assumed to be specified in UTC. The time part
      // may be omitted altogether, resulting in a date format. In such a case, the time part is
      // assumed to be 00:00:00Z (start of day, UTC).
      test: RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})(?:(?:t|T|[ \\t]+)([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?)?$"),
      resolve(str) {
        const match = str.match(timestamp.test);
        if (!match)
          throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");
        const [, year, month, day, hour, minute, second] = match.map(Number);
        const millisec = match[7] ? Number((match[7] + "00").substr(1, 3)) : 0;
        let date = Date.UTC(year, month - 1, day, hour || 0, minute || 0, second || 0, millisec);
        const tz = match[8];
        if (tz && tz !== "Z") {
          let d = parseSexagesimal(tz, false);
          if (Math.abs(d) < 30)
            d *= 60;
          date -= 6e4 * d;
        }
        return new Date(date);
      },
      stringify: ({ value }) => value?.toISOString().replace(/(T00:00:00)?\.000Z$/, "") ?? ""
    };
    exports.floatTime = floatTime;
    exports.intTime = intTime;
    exports.timestamp = timestamp;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/schema.js
var require_schema3 = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/schema.js"(exports) {
    "use strict";
    var map = require_map();
    var _null = require_null();
    var seq = require_seq();
    var string = require_string();
    var binary = require_binary();
    var bool = require_bool2();
    var float = require_float2();
    var int = require_int2();
    var merge = require_merge();
    var omap = require_omap();
    var pairs2 = require_pairs();
    var set = require_set();
    var timestamp = require_timestamp();
    var schema = [
      map.map,
      seq.seq,
      string.string,
      _null.nullTag,
      bool.trueTag,
      bool.falseTag,
      int.intBin,
      int.intOct,
      int.int,
      int.intHex,
      float.floatNaN,
      float.floatExp,
      float.float,
      binary.binary,
      merge.merge,
      omap.omap,
      pairs2.pairs,
      set.set,
      timestamp.intTime,
      timestamp.floatTime,
      timestamp.timestamp
    ];
    exports.schema = schema;
  }
});

// node_modules/yaml/dist/schema/tags.js
var require_tags = __commonJS({
  "node_modules/yaml/dist/schema/tags.js"(exports) {
    "use strict";
    var map = require_map();
    var _null = require_null();
    var seq = require_seq();
    var string = require_string();
    var bool = require_bool();
    var float = require_float();
    var int = require_int();
    var schema = require_schema();
    var schema$1 = require_schema2();
    var binary = require_binary();
    var merge = require_merge();
    var omap = require_omap();
    var pairs2 = require_pairs();
    var schema$2 = require_schema3();
    var set = require_set();
    var timestamp = require_timestamp();
    var schemas = /* @__PURE__ */ new Map([
      ["core", schema.schema],
      ["failsafe", [map.map, seq.seq, string.string]],
      ["json", schema$1.schema],
      ["yaml11", schema$2.schema],
      ["yaml-1.1", schema$2.schema]
    ]);
    var tagsByName = {
      binary: binary.binary,
      bool: bool.boolTag,
      float: float.float,
      floatExp: float.floatExp,
      floatNaN: float.floatNaN,
      floatTime: timestamp.floatTime,
      int: int.int,
      intHex: int.intHex,
      intOct: int.intOct,
      intTime: timestamp.intTime,
      map: map.map,
      merge: merge.merge,
      null: _null.nullTag,
      omap: omap.omap,
      pairs: pairs2.pairs,
      seq: seq.seq,
      set: set.set,
      timestamp: timestamp.timestamp
    };
    var coreKnownTags = {
      "tag:yaml.org,2002:binary": binary.binary,
      "tag:yaml.org,2002:merge": merge.merge,
      "tag:yaml.org,2002:omap": omap.omap,
      "tag:yaml.org,2002:pairs": pairs2.pairs,
      "tag:yaml.org,2002:set": set.set,
      "tag:yaml.org,2002:timestamp": timestamp.timestamp
    };
    function getTags(customTags, schemaName, addMergeTag) {
      const schemaTags = schemas.get(schemaName);
      if (schemaTags && !customTags) {
        return addMergeTag && !schemaTags.includes(merge.merge) ? schemaTags.concat(merge.merge) : schemaTags.slice();
      }
      let tags = schemaTags;
      if (!tags) {
        if (Array.isArray(customTags))
          tags = [];
        else {
          const keys = Array.from(schemas.keys()).filter((key) => key !== "yaml11").map((key) => JSON.stringify(key)).join(", ");
          throw new Error(`Unknown schema "${schemaName}"; use one of ${keys} or define customTags array`);
        }
      }
      if (Array.isArray(customTags)) {
        for (const tag of customTags)
          tags = tags.concat(tag);
      } else if (typeof customTags === "function") {
        tags = customTags(tags.slice());
      }
      if (addMergeTag)
        tags = tags.concat(merge.merge);
      return tags.reduce((tags2, tag) => {
        const tagObj = typeof tag === "string" ? tagsByName[tag] : tag;
        if (!tagObj) {
          const tagName = JSON.stringify(tag);
          const keys = Object.keys(tagsByName).map((key) => JSON.stringify(key)).join(", ");
          throw new Error(`Unknown custom tag ${tagName}; use one of ${keys}`);
        }
        if (!tags2.includes(tagObj))
          tags2.push(tagObj);
        return tags2;
      }, []);
    }
    exports.coreKnownTags = coreKnownTags;
    exports.getTags = getTags;
  }
});

// node_modules/yaml/dist/schema/Schema.js
var require_Schema = __commonJS({
  "node_modules/yaml/dist/schema/Schema.js"(exports) {
    "use strict";
    var identity = require_identity();
    var map = require_map();
    var seq = require_seq();
    var string = require_string();
    var tags = require_tags();
    var sortMapEntriesByKey = (a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
    var Schema = class _Schema {
      constructor({ compat, customTags, merge, resolveKnownTags, schema, sortMapEntries, toStringDefaults }) {
        this.compat = Array.isArray(compat) ? tags.getTags(compat, "compat") : compat ? tags.getTags(null, compat) : null;
        this.name = typeof schema === "string" && schema || "core";
        this.knownTags = resolveKnownTags ? tags.coreKnownTags : {};
        this.tags = tags.getTags(customTags, this.name, merge);
        this.toStringOptions = toStringDefaults ?? null;
        Object.defineProperty(this, identity.MAP, { value: map.map });
        Object.defineProperty(this, identity.SCALAR, { value: string.string });
        Object.defineProperty(this, identity.SEQ, { value: seq.seq });
        this.sortMapEntries = typeof sortMapEntries === "function" ? sortMapEntries : sortMapEntries === true ? sortMapEntriesByKey : null;
      }
      clone() {
        const copy = Object.create(_Schema.prototype, Object.getOwnPropertyDescriptors(this));
        copy.tags = this.tags.slice();
        return copy;
      }
    };
    exports.Schema = Schema;
  }
});

// node_modules/yaml/dist/stringify/stringifyDocument.js
var require_stringifyDocument = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyDocument.js"(exports) {
    "use strict";
    var identity = require_identity();
    var stringify = require_stringify();
    var stringifyComment = require_stringifyComment();
    function stringifyDocument(doc, options) {
      const lines = [];
      let hasDirectives = options.directives === true;
      if (options.directives !== false && doc.directives) {
        const dir = doc.directives.toString(doc);
        if (dir) {
          lines.push(dir);
          hasDirectives = true;
        } else if (doc.directives.docStart)
          hasDirectives = true;
      }
      if (hasDirectives)
        lines.push("---");
      const ctx = stringify.createStringifyContext(doc, options);
      const { commentString } = ctx.options;
      if (doc.commentBefore) {
        if (lines.length !== 1)
          lines.unshift("");
        const cs = commentString(doc.commentBefore);
        lines.unshift(stringifyComment.indentComment(cs, ""));
      }
      let chompKeep = false;
      let contentComment = null;
      if (doc.contents) {
        if (identity.isNode(doc.contents)) {
          if (doc.contents.spaceBefore && hasDirectives)
            lines.push("");
          if (doc.contents.commentBefore) {
            const cs = commentString(doc.contents.commentBefore);
            lines.push(stringifyComment.indentComment(cs, ""));
          }
          ctx.forceBlockIndent = !!doc.comment;
          contentComment = doc.contents.comment;
        }
        const onChompKeep = contentComment ? void 0 : () => chompKeep = true;
        let body = stringify.stringify(doc.contents, ctx, () => contentComment = null, onChompKeep);
        if (contentComment)
          body += stringifyComment.lineComment(body, "", commentString(contentComment));
        if ((body[0] === "|" || body[0] === ">") && lines[lines.length - 1] === "---") {
          lines[lines.length - 1] = `--- ${body}`;
        } else
          lines.push(body);
      } else {
        lines.push(stringify.stringify(doc.contents, ctx));
      }
      if (doc.directives?.docEnd) {
        if (doc.comment) {
          const cs = commentString(doc.comment);
          if (cs.includes("\n")) {
            lines.push("...");
            lines.push(stringifyComment.indentComment(cs, ""));
          } else {
            lines.push(`... ${cs}`);
          }
        } else {
          lines.push("...");
        }
      } else {
        let dc = doc.comment;
        if (dc && chompKeep)
          dc = dc.replace(/^\n+/, "");
        if (dc) {
          if ((!chompKeep || contentComment) && lines[lines.length - 1] !== "")
            lines.push("");
          lines.push(stringifyComment.indentComment(commentString(dc), ""));
        }
      }
      return lines.join("\n") + "\n";
    }
    exports.stringifyDocument = stringifyDocument;
  }
});

// node_modules/yaml/dist/doc/Document.js
var require_Document = __commonJS({
  "node_modules/yaml/dist/doc/Document.js"(exports) {
    "use strict";
    var Alias = require_Alias();
    var Collection = require_Collection();
    var identity = require_identity();
    var Pair = require_Pair();
    var toJS = require_toJS();
    var Schema = require_Schema();
    var stringifyDocument = require_stringifyDocument();
    var anchors = require_anchors();
    var applyReviver = require_applyReviver();
    var createNode = require_createNode();
    var directives = require_directives();
    var Document = class _Document {
      constructor(value, replacer, options) {
        this.commentBefore = null;
        this.comment = null;
        this.errors = [];
        this.warnings = [];
        Object.defineProperty(this, identity.NODE_TYPE, { value: identity.DOC });
        let _replacer = null;
        if (typeof replacer === "function" || Array.isArray(replacer)) {
          _replacer = replacer;
        } else if (options === void 0 && replacer) {
          options = replacer;
          replacer = void 0;
        }
        const opt = Object.assign({
          intAsBigInt: false,
          keepSourceTokens: false,
          logLevel: "warn",
          prettyErrors: true,
          strict: true,
          stringKeys: false,
          uniqueKeys: true,
          version: "1.2"
        }, options);
        this.options = opt;
        let { version } = opt;
        if (options?._directives) {
          this.directives = options._directives.atDocument();
          if (this.directives.yaml.explicit)
            version = this.directives.yaml.version;
        } else
          this.directives = new directives.Directives({ version });
        this.setSchema(version, options);
        this.contents = value === void 0 ? null : this.createNode(value, _replacer, options);
      }
      /**
       * Create a deep copy of this Document and its contents.
       *
       * Custom Node values that inherit from `Object` still refer to their original instances.
       */
      clone() {
        const copy = Object.create(_Document.prototype, {
          [identity.NODE_TYPE]: { value: identity.DOC }
        });
        copy.commentBefore = this.commentBefore;
        copy.comment = this.comment;
        copy.errors = this.errors.slice();
        copy.warnings = this.warnings.slice();
        copy.options = Object.assign({}, this.options);
        if (this.directives)
          copy.directives = this.directives.clone();
        copy.schema = this.schema.clone();
        copy.contents = identity.isNode(this.contents) ? this.contents.clone(copy.schema) : this.contents;
        if (this.range)
          copy.range = this.range.slice();
        return copy;
      }
      /** Adds a value to the document. */
      add(value) {
        if (assertCollection(this.contents))
          this.contents.add(value);
      }
      /** Adds a value to the document. */
      addIn(path, value) {
        if (assertCollection(this.contents))
          this.contents.addIn(path, value);
      }
      /**
       * Create a new `Alias` node, ensuring that the target `node` has the required anchor.
       *
       * If `node` already has an anchor, `name` is ignored.
       * Otherwise, the `node.anchor` value will be set to `name`,
       * or if an anchor with that name is already present in the document,
       * `name` will be used as a prefix for a new unique anchor.
       * If `name` is undefined, the generated anchor will use 'a' as a prefix.
       */
      createAlias(node, name) {
        if (!node.anchor) {
          const prev = anchors.anchorNames(this);
          node.anchor = // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          !name || prev.has(name) ? anchors.findNewAnchor(name || "a", prev) : name;
        }
        return new Alias.Alias(node.anchor);
      }
      createNode(value, replacer, options) {
        let _replacer = void 0;
        if (typeof replacer === "function") {
          value = replacer.call({ "": value }, "", value);
          _replacer = replacer;
        } else if (Array.isArray(replacer)) {
          const keyToStr = (v) => typeof v === "number" || v instanceof String || v instanceof Number;
          const asStr = replacer.filter(keyToStr).map(String);
          if (asStr.length > 0)
            replacer = replacer.concat(asStr);
          _replacer = replacer;
        } else if (options === void 0 && replacer) {
          options = replacer;
          replacer = void 0;
        }
        const { aliasDuplicateObjects, anchorPrefix, flow, keepUndefined, onTagObj, tag } = options ?? {};
        const { onAnchor, setAnchors, sourceObjects } = anchors.createNodeAnchors(
          this,
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          anchorPrefix || "a"
        );
        const ctx = {
          aliasDuplicateObjects: aliasDuplicateObjects ?? true,
          keepUndefined: keepUndefined ?? false,
          onAnchor,
          onTagObj,
          replacer: _replacer,
          schema: this.schema,
          sourceObjects
        };
        const node = createNode.createNode(value, tag, ctx);
        if (flow && identity.isCollection(node))
          node.flow = true;
        setAnchors();
        return node;
      }
      /**
       * Convert a key and a value into a `Pair` using the current schema,
       * recursively wrapping all values as `Scalar` or `Collection` nodes.
       */
      createPair(key, value, options = {}) {
        const k = this.createNode(key, null, options);
        const v = this.createNode(value, null, options);
        return new Pair.Pair(k, v);
      }
      /**
       * Removes a value from the document.
       * @returns `true` if the item was found and removed.
       */
      delete(key) {
        return assertCollection(this.contents) ? this.contents.delete(key) : false;
      }
      /**
       * Removes a value from the document.
       * @returns `true` if the item was found and removed.
       */
      deleteIn(path) {
        if (Collection.isEmptyPath(path)) {
          if (this.contents == null)
            return false;
          this.contents = null;
          return true;
        }
        return assertCollection(this.contents) ? this.contents.deleteIn(path) : false;
      }
      /**
       * Returns item at `key`, or `undefined` if not found. By default unwraps
       * scalar values from their surrounding node; to disable set `keepScalar` to
       * `true` (collections are always returned intact).
       */
      get(key, keepScalar) {
        return identity.isCollection(this.contents) ? this.contents.get(key, keepScalar) : void 0;
      }
      /**
       * Returns item at `path`, or `undefined` if not found. By default unwraps
       * scalar values from their surrounding node; to disable set `keepScalar` to
       * `true` (collections are always returned intact).
       */
      getIn(path, keepScalar) {
        if (Collection.isEmptyPath(path))
          return !keepScalar && identity.isScalar(this.contents) ? this.contents.value : this.contents;
        return identity.isCollection(this.contents) ? this.contents.getIn(path, keepScalar) : void 0;
      }
      /**
       * Checks if the document includes a value with the key `key`.
       */
      has(key) {
        return identity.isCollection(this.contents) ? this.contents.has(key) : false;
      }
      /**
       * Checks if the document includes a value at `path`.
       */
      hasIn(path) {
        if (Collection.isEmptyPath(path))
          return this.contents !== void 0;
        return identity.isCollection(this.contents) ? this.contents.hasIn(path) : false;
      }
      /**
       * Sets a value in this document. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       */
      set(key, value) {
        if (this.contents == null) {
          this.contents = Collection.collectionFromPath(this.schema, [key], value);
        } else if (assertCollection(this.contents)) {
          this.contents.set(key, value);
        }
      }
      /**
       * Sets a value in this document. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       */
      setIn(path, value) {
        if (Collection.isEmptyPath(path)) {
          this.contents = value;
        } else if (this.contents == null) {
          this.contents = Collection.collectionFromPath(this.schema, Array.from(path), value);
        } else if (assertCollection(this.contents)) {
          this.contents.setIn(path, value);
        }
      }
      /**
       * Change the YAML version and schema used by the document.
       * A `null` version disables support for directives, explicit tags, anchors, and aliases.
       * It also requires the `schema` option to be given as a `Schema` instance value.
       *
       * Overrides all previously set schema options.
       */
      setSchema(version, options = {}) {
        if (typeof version === "number")
          version = String(version);
        let opt;
        switch (version) {
          case "1.1":
            if (this.directives)
              this.directives.yaml.version = "1.1";
            else
              this.directives = new directives.Directives({ version: "1.1" });
            opt = { resolveKnownTags: false, schema: "yaml-1.1" };
            break;
          case "1.2":
          case "next":
            if (this.directives)
              this.directives.yaml.version = version;
            else
              this.directives = new directives.Directives({ version });
            opt = { resolveKnownTags: true, schema: "core" };
            break;
          case null:
            if (this.directives)
              delete this.directives;
            opt = null;
            break;
          default: {
            const sv = JSON.stringify(version);
            throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${sv}`);
          }
        }
        if (options.schema instanceof Object)
          this.schema = options.schema;
        else if (opt)
          this.schema = new Schema.Schema(Object.assign(opt, options));
        else
          throw new Error(`With a null YAML version, the { schema: Schema } option is required`);
      }
      // json & jsonArg are only used from toJSON()
      toJS({ json, jsonArg, mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
        const ctx = {
          anchors: /* @__PURE__ */ new Map(),
          doc: this,
          keep: !json,
          mapAsMap: mapAsMap === true,
          mapKeyWarned: false,
          maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
        };
        const res = toJS.toJS(this.contents, jsonArg ?? "", ctx);
        if (typeof onAnchor === "function")
          for (const { count, res: res2 } of ctx.anchors.values())
            onAnchor(res2, count);
        return typeof reviver === "function" ? applyReviver.applyReviver(reviver, { "": res }, "", res) : res;
      }
      /**
       * A JSON representation of the document `contents`.
       *
       * @param jsonArg Used by `JSON.stringify` to indicate the array index or
       *   property name.
       */
      toJSON(jsonArg, onAnchor) {
        return this.toJS({ json: true, jsonArg, mapAsMap: false, onAnchor });
      }
      /** A YAML representation of the document. */
      toString(options = {}) {
        if (this.errors.length > 0)
          throw new Error("Document with errors cannot be stringified");
        if ("indent" in options && (!Number.isInteger(options.indent) || Number(options.indent) <= 0)) {
          const s = JSON.stringify(options.indent);
          throw new Error(`"indent" option must be a positive integer, not ${s}`);
        }
        return stringifyDocument.stringifyDocument(this, options);
      }
    };
    function assertCollection(contents) {
      if (identity.isCollection(contents))
        return true;
      throw new Error("Expected a YAML collection as document contents");
    }
    exports.Document = Document;
  }
});

// node_modules/yaml/dist/errors.js
var require_errors = __commonJS({
  "node_modules/yaml/dist/errors.js"(exports) {
    "use strict";
    var YAMLError = class extends Error {
      constructor(name, pos, code, message) {
        super();
        this.name = name;
        this.code = code;
        this.message = message;
        this.pos = pos;
      }
    };
    var YAMLParseError = class extends YAMLError {
      constructor(pos, code, message) {
        super("YAMLParseError", pos, code, message);
      }
    };
    var YAMLWarning = class extends YAMLError {
      constructor(pos, code, message) {
        super("YAMLWarning", pos, code, message);
      }
    };
    var prettifyError = (src, lc) => (error) => {
      if (error.pos[0] === -1)
        return;
      error.linePos = error.pos.map((pos) => lc.linePos(pos));
      const { line, col } = error.linePos[0];
      error.message += ` at line ${line}, column ${col}`;
      let ci = col - 1;
      let lineStr = src.substring(lc.lineStarts[line - 1], lc.lineStarts[line]).replace(/[\n\r]+$/, "");
      if (ci >= 60 && lineStr.length > 80) {
        const trimStart = Math.min(ci - 39, lineStr.length - 79);
        lineStr = "\u2026" + lineStr.substring(trimStart);
        ci -= trimStart - 1;
      }
      if (lineStr.length > 80)
        lineStr = lineStr.substring(0, 79) + "\u2026";
      if (line > 1 && /^ *$/.test(lineStr.substring(0, ci))) {
        let prev = src.substring(lc.lineStarts[line - 2], lc.lineStarts[line - 1]);
        if (prev.length > 80)
          prev = prev.substring(0, 79) + "\u2026\n";
        lineStr = prev + lineStr;
      }
      if (/[^ ]/.test(lineStr)) {
        let count = 1;
        const end = error.linePos[1];
        if (end?.line === line && end.col > col) {
          count = Math.max(1, Math.min(end.col - col, 80 - ci));
        }
        const pointer = " ".repeat(ci) + "^".repeat(count);
        error.message += `:

${lineStr}
${pointer}
`;
      }
    };
    exports.YAMLError = YAMLError;
    exports.YAMLParseError = YAMLParseError;
    exports.YAMLWarning = YAMLWarning;
    exports.prettifyError = prettifyError;
  }
});

// node_modules/yaml/dist/compose/resolve-props.js
var require_resolve_props = __commonJS({
  "node_modules/yaml/dist/compose/resolve-props.js"(exports) {
    "use strict";
    function resolveProps(tokens, { flow, indicator, next, offset, onError, parentIndent, startOnNewline }) {
      let spaceBefore = false;
      let atNewline = startOnNewline;
      let hasSpace = startOnNewline;
      let comment = "";
      let commentSep = "";
      let hasNewline = false;
      let reqSpace = false;
      let tab = null;
      let anchor = null;
      let tag = null;
      let newlineAfterProp = null;
      let comma = null;
      let found = null;
      let start = null;
      for (const token of tokens) {
        if (reqSpace) {
          if (token.type !== "space" && token.type !== "newline" && token.type !== "comma")
            onError(token.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
          reqSpace = false;
        }
        if (tab) {
          if (atNewline && token.type !== "comment" && token.type !== "newline") {
            onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
          }
          tab = null;
        }
        switch (token.type) {
          case "space":
            if (!flow && (indicator !== "doc-start" || next?.type !== "flow-collection") && token.source.includes("	")) {
              tab = token;
            }
            hasSpace = true;
            break;
          case "comment": {
            if (!hasSpace)
              onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
            const cb = token.source.substring(1) || " ";
            if (!comment)
              comment = cb;
            else
              comment += commentSep + cb;
            commentSep = "";
            atNewline = false;
            break;
          }
          case "newline":
            if (atNewline) {
              if (comment)
                comment += token.source;
              else if (!found || indicator !== "seq-item-ind")
                spaceBefore = true;
            } else
              commentSep += token.source;
            atNewline = true;
            hasNewline = true;
            if (anchor || tag)
              newlineAfterProp = token;
            hasSpace = true;
            break;
          case "anchor":
            if (anchor)
              onError(token, "MULTIPLE_ANCHORS", "A node can have at most one anchor");
            if (token.source.endsWith(":"))
              onError(token.offset + token.source.length - 1, "BAD_ALIAS", "Anchor ending in : is ambiguous", true);
            anchor = token;
            start ?? (start = token.offset);
            atNewline = false;
            hasSpace = false;
            reqSpace = true;
            break;
          case "tag": {
            if (tag)
              onError(token, "MULTIPLE_TAGS", "A node can have at most one tag");
            tag = token;
            start ?? (start = token.offset);
            atNewline = false;
            hasSpace = false;
            reqSpace = true;
            break;
          }
          case indicator:
            if (anchor || tag)
              onError(token, "BAD_PROP_ORDER", `Anchors and tags must be after the ${token.source} indicator`);
            if (found)
              onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.source} in ${flow ?? "collection"}`);
            found = token;
            atNewline = indicator === "seq-item-ind" || indicator === "explicit-key-ind";
            hasSpace = false;
            break;
          case "comma":
            if (flow) {
              if (comma)
                onError(token, "UNEXPECTED_TOKEN", `Unexpected , in ${flow}`);
              comma = token;
              atNewline = false;
              hasSpace = false;
              break;
            }
          // else fallthrough
          default:
            onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.type} token`);
            atNewline = false;
            hasSpace = false;
        }
      }
      const last = tokens[tokens.length - 1];
      const end = last ? last.offset + last.source.length : offset;
      if (reqSpace && next && next.type !== "space" && next.type !== "newline" && next.type !== "comma" && (next.type !== "scalar" || next.source !== "")) {
        onError(next.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
      }
      if (tab && (atNewline && tab.indent <= parentIndent || next?.type === "block-map" || next?.type === "block-seq"))
        onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
      return {
        comma,
        found,
        spaceBefore,
        comment,
        hasNewline,
        anchor,
        tag,
        newlineAfterProp,
        end,
        start: start ?? end
      };
    }
    exports.resolveProps = resolveProps;
  }
});

// node_modules/yaml/dist/compose/util-contains-newline.js
var require_util_contains_newline = __commonJS({
  "node_modules/yaml/dist/compose/util-contains-newline.js"(exports) {
    "use strict";
    function containsNewline(key) {
      if (!key)
        return null;
      switch (key.type) {
        case "alias":
        case "scalar":
        case "double-quoted-scalar":
        case "single-quoted-scalar":
          if (key.source.includes("\n"))
            return true;
          if (key.end) {
            for (const st of key.end)
              if (st.type === "newline")
                return true;
          }
          return false;
        case "flow-collection":
          for (const it of key.items) {
            for (const st of it.start)
              if (st.type === "newline")
                return true;
            if (it.sep) {
              for (const st of it.sep)
                if (st.type === "newline")
                  return true;
            }
            if (containsNewline(it.key) || containsNewline(it.value))
              return true;
          }
          return false;
        default:
          return true;
      }
    }
    exports.containsNewline = containsNewline;
  }
});

// node_modules/yaml/dist/compose/util-flow-indent-check.js
var require_util_flow_indent_check = __commonJS({
  "node_modules/yaml/dist/compose/util-flow-indent-check.js"(exports) {
    "use strict";
    var utilContainsNewline = require_util_contains_newline();
    function flowIndentCheck(indent, fc, onError) {
      if (fc?.type === "flow-collection") {
        const end = fc.end[0];
        if (end.indent === indent && (end.source === "]" || end.source === "}") && utilContainsNewline.containsNewline(fc)) {
          const msg = "Flow end indicator should be more indented than parent";
          onError(end, "BAD_INDENT", msg, true);
        }
      }
    }
    exports.flowIndentCheck = flowIndentCheck;
  }
});

// node_modules/yaml/dist/compose/util-map-includes.js
var require_util_map_includes = __commonJS({
  "node_modules/yaml/dist/compose/util-map-includes.js"(exports) {
    "use strict";
    var identity = require_identity();
    function mapIncludes(ctx, items, search) {
      const { uniqueKeys } = ctx.options;
      if (uniqueKeys === false)
        return false;
      const isEqual = typeof uniqueKeys === "function" ? uniqueKeys : (a, b) => a === b || identity.isScalar(a) && identity.isScalar(b) && a.value === b.value;
      return items.some((pair) => isEqual(pair.key, search));
    }
    exports.mapIncludes = mapIncludes;
  }
});

// node_modules/yaml/dist/compose/resolve-block-map.js
var require_resolve_block_map = __commonJS({
  "node_modules/yaml/dist/compose/resolve-block-map.js"(exports) {
    "use strict";
    var Pair = require_Pair();
    var YAMLMap = require_YAMLMap();
    var resolveProps = require_resolve_props();
    var utilContainsNewline = require_util_contains_newline();
    var utilFlowIndentCheck = require_util_flow_indent_check();
    var utilMapIncludes = require_util_map_includes();
    var startColMsg = "All mapping items must start at the same column";
    function resolveBlockMap({ composeNode, composeEmptyNode }, ctx, bm, onError, tag) {
      const NodeClass = tag?.nodeClass ?? YAMLMap.YAMLMap;
      const map = new NodeClass(ctx.schema);
      if (ctx.atRoot)
        ctx.atRoot = false;
      let offset = bm.offset;
      let commentEnd = null;
      for (const collItem of bm.items) {
        const { start, key, sep, value } = collItem;
        const keyProps = resolveProps.resolveProps(start, {
          indicator: "explicit-key-ind",
          next: key ?? sep?.[0],
          offset,
          onError,
          parentIndent: bm.indent,
          startOnNewline: true
        });
        const implicitKey = !keyProps.found;
        if (implicitKey) {
          if (key) {
            if (key.type === "block-seq")
              onError(offset, "BLOCK_AS_IMPLICIT_KEY", "A block sequence may not be used as an implicit map key");
            else if ("indent" in key && key.indent !== bm.indent)
              onError(offset, "BAD_INDENT", startColMsg);
          }
          if (!keyProps.anchor && !keyProps.tag && !sep) {
            commentEnd = keyProps.end;
            if (keyProps.comment) {
              if (map.comment)
                map.comment += "\n" + keyProps.comment;
              else
                map.comment = keyProps.comment;
            }
            continue;
          }
          if (keyProps.newlineAfterProp || utilContainsNewline.containsNewline(key)) {
            onError(key ?? start[start.length - 1], "MULTILINE_IMPLICIT_KEY", "Implicit keys need to be on a single line");
          }
        } else if (keyProps.found?.indent !== bm.indent) {
          onError(offset, "BAD_INDENT", startColMsg);
        }
        ctx.atKey = true;
        const keyStart = keyProps.end;
        const keyNode = key ? composeNode(ctx, key, keyProps, onError) : composeEmptyNode(ctx, keyStart, start, null, keyProps, onError);
        if (ctx.schema.compat)
          utilFlowIndentCheck.flowIndentCheck(bm.indent, key, onError);
        ctx.atKey = false;
        if (utilMapIncludes.mapIncludes(ctx, map.items, keyNode))
          onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
        const valueProps = resolveProps.resolveProps(sep ?? [], {
          indicator: "map-value-ind",
          next: value,
          offset: keyNode.range[2],
          onError,
          parentIndent: bm.indent,
          startOnNewline: !key || key.type === "block-scalar"
        });
        offset = valueProps.end;
        if (valueProps.found) {
          if (implicitKey) {
            if (value?.type === "block-map" && !valueProps.hasNewline)
              onError(offset, "BLOCK_AS_IMPLICIT_KEY", "Nested mappings are not allowed in compact mappings");
            if (ctx.options.strict && keyProps.start < valueProps.found.offset - 1024)
              onError(keyNode.range, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit block mapping key");
          }
          const valueNode = value ? composeNode(ctx, value, valueProps, onError) : composeEmptyNode(ctx, offset, sep, null, valueProps, onError);
          if (ctx.schema.compat)
            utilFlowIndentCheck.flowIndentCheck(bm.indent, value, onError);
          offset = valueNode.range[2];
          const pair = new Pair.Pair(keyNode, valueNode);
          if (ctx.options.keepSourceTokens)
            pair.srcToken = collItem;
          map.items.push(pair);
        } else {
          if (implicitKey)
            onError(keyNode.range, "MISSING_CHAR", "Implicit map keys need to be followed by map values");
          if (valueProps.comment) {
            if (keyNode.comment)
              keyNode.comment += "\n" + valueProps.comment;
            else
              keyNode.comment = valueProps.comment;
          }
          const pair = new Pair.Pair(keyNode);
          if (ctx.options.keepSourceTokens)
            pair.srcToken = collItem;
          map.items.push(pair);
        }
      }
      if (commentEnd && commentEnd < offset)
        onError(commentEnd, "IMPOSSIBLE", "Map comment with trailing content");
      map.range = [bm.offset, offset, commentEnd ?? offset];
      return map;
    }
    exports.resolveBlockMap = resolveBlockMap;
  }
});

// node_modules/yaml/dist/compose/resolve-block-seq.js
var require_resolve_block_seq = __commonJS({
  "node_modules/yaml/dist/compose/resolve-block-seq.js"(exports) {
    "use strict";
    var YAMLSeq = require_YAMLSeq();
    var resolveProps = require_resolve_props();
    var utilFlowIndentCheck = require_util_flow_indent_check();
    function resolveBlockSeq({ composeNode, composeEmptyNode }, ctx, bs, onError, tag) {
      const NodeClass = tag?.nodeClass ?? YAMLSeq.YAMLSeq;
      const seq = new NodeClass(ctx.schema);
      if (ctx.atRoot)
        ctx.atRoot = false;
      if (ctx.atKey)
        ctx.atKey = false;
      let offset = bs.offset;
      let commentEnd = null;
      for (const { start, value } of bs.items) {
        const props = resolveProps.resolveProps(start, {
          indicator: "seq-item-ind",
          next: value,
          offset,
          onError,
          parentIndent: bs.indent,
          startOnNewline: true
        });
        if (!props.found) {
          if (props.anchor || props.tag || value) {
            if (value?.type === "block-seq")
              onError(props.end, "BAD_INDENT", "All sequence items must start at the same column");
            else
              onError(offset, "MISSING_CHAR", "Sequence item without - indicator");
          } else {
            commentEnd = props.end;
            if (props.comment)
              seq.comment = props.comment;
            continue;
          }
        }
        const node = value ? composeNode(ctx, value, props, onError) : composeEmptyNode(ctx, props.end, start, null, props, onError);
        if (ctx.schema.compat)
          utilFlowIndentCheck.flowIndentCheck(bs.indent, value, onError);
        offset = node.range[2];
        seq.items.push(node);
      }
      seq.range = [bs.offset, offset, commentEnd ?? offset];
      return seq;
    }
    exports.resolveBlockSeq = resolveBlockSeq;
  }
});

// node_modules/yaml/dist/compose/resolve-end.js
var require_resolve_end = __commonJS({
  "node_modules/yaml/dist/compose/resolve-end.js"(exports) {
    "use strict";
    function resolveEnd(end, offset, reqSpace, onError) {
      let comment = "";
      if (end) {
        let hasSpace = false;
        let sep = "";
        for (const token of end) {
          const { source, type } = token;
          switch (type) {
            case "space":
              hasSpace = true;
              break;
            case "comment": {
              if (reqSpace && !hasSpace)
                onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
              const cb = source.substring(1) || " ";
              if (!comment)
                comment = cb;
              else
                comment += sep + cb;
              sep = "";
              break;
            }
            case "newline":
              if (comment)
                sep += source;
              hasSpace = true;
              break;
            default:
              onError(token, "UNEXPECTED_TOKEN", `Unexpected ${type} at node end`);
          }
          offset += source.length;
        }
      }
      return { comment, offset };
    }
    exports.resolveEnd = resolveEnd;
  }
});

// node_modules/yaml/dist/compose/resolve-flow-collection.js
var require_resolve_flow_collection = __commonJS({
  "node_modules/yaml/dist/compose/resolve-flow-collection.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Pair = require_Pair();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var resolveEnd = require_resolve_end();
    var resolveProps = require_resolve_props();
    var utilContainsNewline = require_util_contains_newline();
    var utilMapIncludes = require_util_map_includes();
    var blockMsg = "Block collections are not allowed within flow collections";
    var isBlock = (token) => token && (token.type === "block-map" || token.type === "block-seq");
    function resolveFlowCollection({ composeNode, composeEmptyNode }, ctx, fc, onError, tag) {
      const isMap = fc.start.source === "{";
      const fcName = isMap ? "flow map" : "flow sequence";
      const NodeClass = tag?.nodeClass ?? (isMap ? YAMLMap.YAMLMap : YAMLSeq.YAMLSeq);
      const coll = new NodeClass(ctx.schema);
      coll.flow = true;
      const atRoot = ctx.atRoot;
      if (atRoot)
        ctx.atRoot = false;
      if (ctx.atKey)
        ctx.atKey = false;
      let offset = fc.offset + fc.start.source.length;
      for (let i3 = 0; i3 < fc.items.length; ++i3) {
        const collItem = fc.items[i3];
        const { start, key, sep, value } = collItem;
        const props = resolveProps.resolveProps(start, {
          flow: fcName,
          indicator: "explicit-key-ind",
          next: key ?? sep?.[0],
          offset,
          onError,
          parentIndent: fc.indent,
          startOnNewline: false
        });
        if (!props.found) {
          if (!props.anchor && !props.tag && !sep && !value) {
            if (i3 === 0 && props.comma)
              onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
            else if (i3 < fc.items.length - 1)
              onError(props.start, "UNEXPECTED_TOKEN", `Unexpected empty item in ${fcName}`);
            if (props.comment) {
              if (coll.comment)
                coll.comment += "\n" + props.comment;
              else
                coll.comment = props.comment;
            }
            offset = props.end;
            continue;
          }
          if (!isMap && ctx.options.strict && utilContainsNewline.containsNewline(key))
            onError(
              key,
              // checked by containsNewline()
              "MULTILINE_IMPLICIT_KEY",
              "Implicit keys of flow sequence pairs need to be on a single line"
            );
        }
        if (i3 === 0) {
          if (props.comma)
            onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
        } else {
          if (!props.comma)
            onError(props.start, "MISSING_CHAR", `Missing , between ${fcName} items`);
          if (props.comment) {
            let prevItemComment = "";
            loop: for (const st of start) {
              switch (st.type) {
                case "comma":
                case "space":
                  break;
                case "comment":
                  prevItemComment = st.source.substring(1);
                  break loop;
                default:
                  break loop;
              }
            }
            if (prevItemComment) {
              let prev = coll.items[coll.items.length - 1];
              if (identity.isPair(prev))
                prev = prev.value ?? prev.key;
              if (prev.comment)
                prev.comment += "\n" + prevItemComment;
              else
                prev.comment = prevItemComment;
              props.comment = props.comment.substring(prevItemComment.length + 1);
            }
          }
        }
        if (!isMap && !sep && !props.found) {
          const valueNode = value ? composeNode(ctx, value, props, onError) : composeEmptyNode(ctx, props.end, sep, null, props, onError);
          coll.items.push(valueNode);
          offset = valueNode.range[2];
          if (isBlock(value))
            onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
        } else {
          ctx.atKey = true;
          const keyStart = props.end;
          const keyNode = key ? composeNode(ctx, key, props, onError) : composeEmptyNode(ctx, keyStart, start, null, props, onError);
          if (isBlock(key))
            onError(keyNode.range, "BLOCK_IN_FLOW", blockMsg);
          ctx.atKey = false;
          const valueProps = resolveProps.resolveProps(sep ?? [], {
            flow: fcName,
            indicator: "map-value-ind",
            next: value,
            offset: keyNode.range[2],
            onError,
            parentIndent: fc.indent,
            startOnNewline: false
          });
          if (valueProps.found) {
            if (!isMap && !props.found && ctx.options.strict) {
              if (sep)
                for (const st of sep) {
                  if (st === valueProps.found)
                    break;
                  if (st.type === "newline") {
                    onError(st, "MULTILINE_IMPLICIT_KEY", "Implicit keys of flow sequence pairs need to be on a single line");
                    break;
                  }
                }
              if (props.start < valueProps.found.offset - 1024)
                onError(valueProps.found, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit flow sequence key");
            }
          } else if (value) {
            if ("source" in value && value.source?.[0] === ":")
              onError(value, "MISSING_CHAR", `Missing space after : in ${fcName}`);
            else
              onError(valueProps.start, "MISSING_CHAR", `Missing , or : between ${fcName} items`);
          }
          const valueNode = value ? composeNode(ctx, value, valueProps, onError) : valueProps.found ? composeEmptyNode(ctx, valueProps.end, sep, null, valueProps, onError) : null;
          if (valueNode) {
            if (isBlock(value))
              onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
          } else if (valueProps.comment) {
            if (keyNode.comment)
              keyNode.comment += "\n" + valueProps.comment;
            else
              keyNode.comment = valueProps.comment;
          }
          const pair = new Pair.Pair(keyNode, valueNode);
          if (ctx.options.keepSourceTokens)
            pair.srcToken = collItem;
          if (isMap) {
            const map = coll;
            if (utilMapIncludes.mapIncludes(ctx, map.items, keyNode))
              onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
            map.items.push(pair);
          } else {
            const map = new YAMLMap.YAMLMap(ctx.schema);
            map.flow = true;
            map.items.push(pair);
            const endRange = (valueNode ?? keyNode).range;
            map.range = [keyNode.range[0], endRange[1], endRange[2]];
            coll.items.push(map);
          }
          offset = valueNode ? valueNode.range[2] : valueProps.end;
        }
      }
      const expectedEnd = isMap ? "}" : "]";
      const [ce, ...ee] = fc.end;
      let cePos = offset;
      if (ce?.source === expectedEnd)
        cePos = ce.offset + ce.source.length;
      else {
        const name = fcName[0].toUpperCase() + fcName.substring(1);
        const msg = atRoot ? `${name} must end with a ${expectedEnd}` : `${name} in block collection must be sufficiently indented and end with a ${expectedEnd}`;
        onError(offset, atRoot ? "MISSING_CHAR" : "BAD_INDENT", msg);
        if (ce && ce.source.length !== 1)
          ee.unshift(ce);
      }
      if (ee.length > 0) {
        const end = resolveEnd.resolveEnd(ee, cePos, ctx.options.strict, onError);
        if (end.comment) {
          if (coll.comment)
            coll.comment += "\n" + end.comment;
          else
            coll.comment = end.comment;
        }
        coll.range = [fc.offset, cePos, end.offset];
      } else {
        coll.range = [fc.offset, cePos, cePos];
      }
      return coll;
    }
    exports.resolveFlowCollection = resolveFlowCollection;
  }
});

// node_modules/yaml/dist/compose/compose-collection.js
var require_compose_collection = __commonJS({
  "node_modules/yaml/dist/compose/compose-collection.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var resolveBlockMap = require_resolve_block_map();
    var resolveBlockSeq = require_resolve_block_seq();
    var resolveFlowCollection = require_resolve_flow_collection();
    function resolveCollection(CN, ctx, token, onError, tagName, tag) {
      const coll = token.type === "block-map" ? resolveBlockMap.resolveBlockMap(CN, ctx, token, onError, tag) : token.type === "block-seq" ? resolveBlockSeq.resolveBlockSeq(CN, ctx, token, onError, tag) : resolveFlowCollection.resolveFlowCollection(CN, ctx, token, onError, tag);
      const Coll = coll.constructor;
      if (tagName === "!" || tagName === Coll.tagName) {
        coll.tag = Coll.tagName;
        return coll;
      }
      if (tagName)
        coll.tag = tagName;
      return coll;
    }
    function composeCollection(CN, ctx, token, props, onError) {
      const tagToken = props.tag;
      const tagName = !tagToken ? null : ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg));
      if (token.type === "block-seq") {
        const { anchor, newlineAfterProp: nl } = props;
        const lastProp = anchor && tagToken ? anchor.offset > tagToken.offset ? anchor : tagToken : anchor ?? tagToken;
        if (lastProp && (!nl || nl.offset < lastProp.offset)) {
          const message = "Missing newline after block sequence props";
          onError(lastProp, "MISSING_CHAR", message);
        }
      }
      const expType = token.type === "block-map" ? "map" : token.type === "block-seq" ? "seq" : token.start.source === "{" ? "map" : "seq";
      if (!tagToken || !tagName || tagName === "!" || tagName === YAMLMap.YAMLMap.tagName && expType === "map" || tagName === YAMLSeq.YAMLSeq.tagName && expType === "seq") {
        return resolveCollection(CN, ctx, token, onError, tagName);
      }
      let tag = ctx.schema.tags.find((t) => t.tag === tagName && t.collection === expType);
      if (!tag) {
        const kt = ctx.schema.knownTags[tagName];
        if (kt?.collection === expType) {
          ctx.schema.tags.push(Object.assign({}, kt, { default: false }));
          tag = kt;
        } else {
          if (kt) {
            onError(tagToken, "BAD_COLLECTION_TYPE", `${kt.tag} used for ${expType} collection, but expects ${kt.collection ?? "scalar"}`, true);
          } else {
            onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, true);
          }
          return resolveCollection(CN, ctx, token, onError, tagName);
        }
      }
      const coll = resolveCollection(CN, ctx, token, onError, tagName, tag);
      const res = tag.resolve?.(coll, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg), ctx.options) ?? coll;
      const node = identity.isNode(res) ? res : new Scalar.Scalar(res);
      node.range = coll.range;
      node.tag = tagName;
      if (tag?.format)
        node.format = tag.format;
      return node;
    }
    exports.composeCollection = composeCollection;
  }
});

// node_modules/yaml/dist/compose/resolve-block-scalar.js
var require_resolve_block_scalar = __commonJS({
  "node_modules/yaml/dist/compose/resolve-block-scalar.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    function resolveBlockScalar(ctx, scalar, onError) {
      const start = scalar.offset;
      const header = parseBlockScalarHeader(scalar, ctx.options.strict, onError);
      if (!header)
        return { value: "", type: null, comment: "", range: [start, start, start] };
      const type = header.mode === ">" ? Scalar.Scalar.BLOCK_FOLDED : Scalar.Scalar.BLOCK_LITERAL;
      const lines = scalar.source ? splitLines(scalar.source) : [];
      let chompStart = lines.length;
      for (let i3 = lines.length - 1; i3 >= 0; --i3) {
        const content = lines[i3][1];
        if (content === "" || content === "\r")
          chompStart = i3;
        else
          break;
      }
      if (chompStart === 0) {
        const value2 = header.chomp === "+" && lines.length > 0 ? "\n".repeat(Math.max(1, lines.length - 1)) : "";
        let end2 = start + header.length;
        if (scalar.source)
          end2 += scalar.source.length;
        return { value: value2, type, comment: header.comment, range: [start, end2, end2] };
      }
      let trimIndent = scalar.indent + header.indent;
      let offset = scalar.offset + header.length;
      let contentStart = 0;
      for (let i3 = 0; i3 < chompStart; ++i3) {
        const [indent, content] = lines[i3];
        if (content === "" || content === "\r") {
          if (header.indent === 0 && indent.length > trimIndent)
            trimIndent = indent.length;
        } else {
          if (indent.length < trimIndent) {
            const message = "Block scalars with more-indented leading empty lines must use an explicit indentation indicator";
            onError(offset + indent.length, "MISSING_CHAR", message);
          }
          if (header.indent === 0)
            trimIndent = indent.length;
          contentStart = i3;
          if (trimIndent === 0 && !ctx.atRoot) {
            const message = "Block scalar values in collections must be indented";
            onError(offset, "BAD_INDENT", message);
          }
          break;
        }
        offset += indent.length + content.length + 1;
      }
      for (let i3 = lines.length - 1; i3 >= chompStart; --i3) {
        if (lines[i3][0].length > trimIndent)
          chompStart = i3 + 1;
      }
      let value = "";
      let sep = "";
      let prevMoreIndented = false;
      for (let i3 = 0; i3 < contentStart; ++i3)
        value += lines[i3][0].slice(trimIndent) + "\n";
      for (let i3 = contentStart; i3 < chompStart; ++i3) {
        let [indent, content] = lines[i3];
        offset += indent.length + content.length + 1;
        const crlf = content[content.length - 1] === "\r";
        if (crlf)
          content = content.slice(0, -1);
        if (content && indent.length < trimIndent) {
          const src = header.indent ? "explicit indentation indicator" : "first line";
          const message = `Block scalar lines must not be less indented than their ${src}`;
          onError(offset - content.length - (crlf ? 2 : 1), "BAD_INDENT", message);
          indent = "";
        }
        if (type === Scalar.Scalar.BLOCK_LITERAL) {
          value += sep + indent.slice(trimIndent) + content;
          sep = "\n";
        } else if (indent.length > trimIndent || content[0] === "	") {
          if (sep === " ")
            sep = "\n";
          else if (!prevMoreIndented && sep === "\n")
            sep = "\n\n";
          value += sep + indent.slice(trimIndent) + content;
          sep = "\n";
          prevMoreIndented = true;
        } else if (content === "") {
          if (sep === "\n")
            value += "\n";
          else
            sep = "\n";
        } else {
          value += sep + content;
          sep = " ";
          prevMoreIndented = false;
        }
      }
      switch (header.chomp) {
        case "-":
          break;
        case "+":
          for (let i3 = chompStart; i3 < lines.length; ++i3)
            value += "\n" + lines[i3][0].slice(trimIndent);
          if (value[value.length - 1] !== "\n")
            value += "\n";
          break;
        default:
          value += "\n";
      }
      const end = start + header.length + scalar.source.length;
      return { value, type, comment: header.comment, range: [start, end, end] };
    }
    function parseBlockScalarHeader({ offset, props }, strict, onError) {
      if (props[0].type !== "block-scalar-header") {
        onError(props[0], "IMPOSSIBLE", "Block scalar header not found");
        return null;
      }
      const { source } = props[0];
      const mode = source[0];
      let indent = 0;
      let chomp = "";
      let error = -1;
      for (let i3 = 1; i3 < source.length; ++i3) {
        const ch = source[i3];
        if (!chomp && (ch === "-" || ch === "+"))
          chomp = ch;
        else {
          const n = Number(ch);
          if (!indent && n)
            indent = n;
          else if (error === -1)
            error = offset + i3;
        }
      }
      if (error !== -1)
        onError(error, "UNEXPECTED_TOKEN", `Block scalar header includes extra characters: ${source}`);
      let hasSpace = false;
      let comment = "";
      let length = source.length;
      for (let i3 = 1; i3 < props.length; ++i3) {
        const token = props[i3];
        switch (token.type) {
          case "space":
            hasSpace = true;
          // fallthrough
          case "newline":
            length += token.source.length;
            break;
          case "comment":
            if (strict && !hasSpace) {
              const message = "Comments must be separated from other tokens by white space characters";
              onError(token, "MISSING_CHAR", message);
            }
            length += token.source.length;
            comment = token.source.substring(1);
            break;
          case "error":
            onError(token, "UNEXPECTED_TOKEN", token.message);
            length += token.source.length;
            break;
          /* istanbul ignore next should not happen */
          default: {
            const message = `Unexpected token in block scalar header: ${token.type}`;
            onError(token, "UNEXPECTED_TOKEN", message);
            const ts = token.source;
            if (ts && typeof ts === "string")
              length += ts.length;
          }
        }
      }
      return { mode, indent, chomp, comment, length };
    }
    function splitLines(source) {
      const split = source.split(/\n( *)/);
      const first = split[0];
      const m = first.match(/^( *)/);
      const line0 = m?.[1] ? [m[1], first.slice(m[1].length)] : ["", first];
      const lines = [line0];
      for (let i3 = 1; i3 < split.length; i3 += 2)
        lines.push([split[i3], split[i3 + 1]]);
      return lines;
    }
    exports.resolveBlockScalar = resolveBlockScalar;
  }
});

// node_modules/yaml/dist/compose/resolve-flow-scalar.js
var require_resolve_flow_scalar = __commonJS({
  "node_modules/yaml/dist/compose/resolve-flow-scalar.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var resolveEnd = require_resolve_end();
    function resolveFlowScalar(scalar, strict, onError) {
      const { offset, type, source, end } = scalar;
      let _type;
      let value;
      const _onError = (rel, code, msg) => onError(offset + rel, code, msg);
      switch (type) {
        case "scalar":
          _type = Scalar.Scalar.PLAIN;
          value = plainValue(source, _onError);
          break;
        case "single-quoted-scalar":
          _type = Scalar.Scalar.QUOTE_SINGLE;
          value = singleQuotedValue(source, _onError);
          break;
        case "double-quoted-scalar":
          _type = Scalar.Scalar.QUOTE_DOUBLE;
          value = doubleQuotedValue(source, _onError);
          break;
        /* istanbul ignore next should not happen */
        default:
          onError(scalar, "UNEXPECTED_TOKEN", `Expected a flow scalar value, but found: ${type}`);
          return {
            value: "",
            type: null,
            comment: "",
            range: [offset, offset + source.length, offset + source.length]
          };
      }
      const valueEnd = offset + source.length;
      const re = resolveEnd.resolveEnd(end, valueEnd, strict, onError);
      return {
        value,
        type: _type,
        comment: re.comment,
        range: [offset, valueEnd, re.offset]
      };
    }
    function plainValue(source, onError) {
      let badChar = "";
      switch (source[0]) {
        /* istanbul ignore next should not happen */
        case "	":
          badChar = "a tab character";
          break;
        case ",":
          badChar = "flow indicator character ,";
          break;
        case "%":
          badChar = "directive indicator character %";
          break;
        case "|":
        case ">": {
          badChar = `block scalar indicator ${source[0]}`;
          break;
        }
        case "@":
        case "`": {
          badChar = `reserved character ${source[0]}`;
          break;
        }
      }
      if (badChar)
        onError(0, "BAD_SCALAR_START", `Plain value cannot start with ${badChar}`);
      return unfoldLines(source);
    }
    function singleQuotedValue(source, onError) {
      if (source[source.length - 1] !== "'" || source.length === 1)
        onError(source.length, "MISSING_CHAR", "Missing closing 'quote");
      return unfoldLines(source.slice(1, -1)).replace(/''/g, "'");
    }
    function unfoldLines(source) {
      const line = /(.*?)\r?\n/sy;
      let match = line.exec(source);
      if (!match)
        return source;
      let trimEnd, trimBoth;
      try {
        trimEnd = new RegExp("(?<![ 	])[ 	]+$");
        trimBoth = new RegExp("^[ 	]+|(?<![ 	])[ 	]+$", "g");
      } catch {
        trimEnd = /[ \t]+$/;
        trimBoth = /^[ \t]+|[ \t]+$/g;
      }
      let res = match[1].replace(trimEnd, "");
      let sep = " ";
      let pos = line.lastIndex;
      while (match = line.exec(source)) {
        const lm = match[1].replace(trimBoth, "");
        if (lm === "") {
          if (sep === "\n")
            res += sep;
          else
            sep = "\n";
        } else {
          res += sep + lm;
          sep = " ";
        }
        pos = line.lastIndex;
      }
      const last = /[ \t]*(.*)/sy;
      last.lastIndex = pos;
      match = last.exec(source);
      return res + sep + (match?.[1] ?? "");
    }
    function doubleQuotedValue(source, onError) {
      let res = "";
      for (let i3 = 1; i3 < source.length - 1; ++i3) {
        const ch = source[i3];
        if (ch === "\r" && source[i3 + 1] === "\n")
          continue;
        if (ch === "\n") {
          const { fold, offset } = foldNewline(source, i3);
          res += fold;
          i3 = offset;
        } else if (ch === "\\") {
          let next = source[++i3];
          const cc = escapeCodes[next];
          if (cc)
            res += cc;
          else if (next === "\n") {
            next = source[i3 + 1];
            while (next === " " || next === "	")
              next = source[++i3 + 1];
          } else if (next === "\r" && source[i3 + 1] === "\n") {
            next = source[++i3 + 1];
            while (next === " " || next === "	")
              next = source[++i3 + 1];
          } else if (next === "x" || next === "u" || next === "U") {
            const length = next === "x" ? 2 : next === "u" ? 4 : 8;
            res += parseCharCode(source, i3 + 1, length, onError);
            i3 += length;
          } else {
            const raw = source.substr(i3 - 1, 2);
            onError(i3 - 1, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
            res += raw;
          }
        } else if (ch === " " || ch === "	") {
          const wsStart = i3;
          let next = source[i3 + 1];
          while (next === " " || next === "	")
            next = source[++i3 + 1];
          if (next !== "\n" && !(next === "\r" && source[i3 + 2] === "\n"))
            res += i3 > wsStart ? source.slice(wsStart, i3 + 1) : ch;
        } else {
          res += ch;
        }
      }
      if (source[source.length - 1] !== '"' || source.length === 1)
        onError(source.length, "MISSING_CHAR", 'Missing closing "quote');
      return res;
    }
    function foldNewline(source, offset) {
      let fold = "";
      let ch = source[offset + 1];
      while (ch === " " || ch === "	" || ch === "\n" || ch === "\r") {
        if (ch === "\r" && source[offset + 2] !== "\n")
          break;
        if (ch === "\n")
          fold += "\n";
        offset += 1;
        ch = source[offset + 1];
      }
      if (!fold)
        fold = " ";
      return { fold, offset };
    }
    var escapeCodes = {
      "0": "\0",
      // null character
      a: "\x07",
      // bell character
      b: "\b",
      // backspace
      e: "\x1B",
      // escape character
      f: "\f",
      // form feed
      n: "\n",
      // line feed
      r: "\r",
      // carriage return
      t: "	",
      // horizontal tab
      v: "\v",
      // vertical tab
      N: "\x85",
      // Unicode next line
      _: "\xA0",
      // Unicode non-breaking space
      L: "\u2028",
      // Unicode line separator
      P: "\u2029",
      // Unicode paragraph separator
      " ": " ",
      '"': '"',
      "/": "/",
      "\\": "\\",
      "	": "	"
    };
    function parseCharCode(source, offset, length, onError) {
      const cc = source.substr(offset, length);
      const ok = cc.length === length && /^[0-9a-fA-F]+$/.test(cc);
      const code = ok ? parseInt(cc, 16) : NaN;
      try {
        return String.fromCodePoint(code);
      } catch {
        const raw = source.substr(offset - 2, length + 2);
        onError(offset - 2, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
        return raw;
      }
    }
    exports.resolveFlowScalar = resolveFlowScalar;
  }
});

// node_modules/yaml/dist/compose/compose-scalar.js
var require_compose_scalar = __commonJS({
  "node_modules/yaml/dist/compose/compose-scalar.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var resolveBlockScalar = require_resolve_block_scalar();
    var resolveFlowScalar = require_resolve_flow_scalar();
    function composeScalar(ctx, token, tagToken, onError) {
      const { value, type, comment, range } = token.type === "block-scalar" ? resolveBlockScalar.resolveBlockScalar(ctx, token, onError) : resolveFlowScalar.resolveFlowScalar(token, ctx.options.strict, onError);
      const tagName = tagToken ? ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg)) : null;
      let tag;
      if (ctx.options.stringKeys && ctx.atKey) {
        tag = ctx.schema[identity.SCALAR];
      } else if (tagName)
        tag = findScalarTagByName(ctx.schema, value, tagName, tagToken, onError);
      else if (token.type === "scalar")
        tag = findScalarTagByTest(ctx, value, token, onError);
      else
        tag = ctx.schema[identity.SCALAR];
      let scalar;
      try {
        const res = tag.resolve(value, (msg) => onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg), ctx.options);
        scalar = identity.isScalar(res) ? res : new Scalar.Scalar(res);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg);
        scalar = new Scalar.Scalar(value);
      }
      scalar.range = range;
      scalar.source = value;
      if (type)
        scalar.type = type;
      if (tagName)
        scalar.tag = tagName;
      if (tag.format)
        scalar.format = tag.format;
      if (comment)
        scalar.comment = comment;
      return scalar;
    }
    function findScalarTagByName(schema, value, tagName, tagToken, onError) {
      if (tagName === "!")
        return schema[identity.SCALAR];
      const matchWithTest = [];
      for (const tag of schema.tags) {
        if (!tag.collection && tag.tag === tagName) {
          if (tag.default && tag.test)
            matchWithTest.push(tag);
          else
            return tag;
        }
      }
      for (const tag of matchWithTest)
        if (tag.test?.test(value))
          return tag;
      const kt = schema.knownTags[tagName];
      if (kt && !kt.collection) {
        schema.tags.push(Object.assign({}, kt, { default: false, test: void 0 }));
        return kt;
      }
      onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, tagName !== "tag:yaml.org,2002:str");
      return schema[identity.SCALAR];
    }
    function findScalarTagByTest({ atKey, directives, schema }, value, token, onError) {
      const tag = schema.tags.find((tag2) => (tag2.default === true || atKey && tag2.default === "key") && tag2.test?.test(value)) || schema[identity.SCALAR];
      if (schema.compat) {
        const compat = schema.compat.find((tag2) => tag2.default && tag2.test?.test(value)) ?? schema[identity.SCALAR];
        if (tag.tag !== compat.tag) {
          const ts = directives.tagString(tag.tag);
          const cs = directives.tagString(compat.tag);
          const msg = `Value may be parsed as either ${ts} or ${cs}`;
          onError(token, "TAG_RESOLVE_FAILED", msg, true);
        }
      }
      return tag;
    }
    exports.composeScalar = composeScalar;
  }
});

// node_modules/yaml/dist/compose/util-empty-scalar-position.js
var require_util_empty_scalar_position = __commonJS({
  "node_modules/yaml/dist/compose/util-empty-scalar-position.js"(exports) {
    "use strict";
    function emptyScalarPosition(offset, before, pos) {
      if (before) {
        pos ?? (pos = before.length);
        for (let i3 = pos - 1; i3 >= 0; --i3) {
          let st = before[i3];
          switch (st.type) {
            case "space":
            case "comment":
            case "newline":
              offset -= st.source.length;
              continue;
          }
          st = before[++i3];
          while (st?.type === "space") {
            offset += st.source.length;
            st = before[++i3];
          }
          break;
        }
      }
      return offset;
    }
    exports.emptyScalarPosition = emptyScalarPosition;
  }
});

// node_modules/yaml/dist/compose/compose-node.js
var require_compose_node = __commonJS({
  "node_modules/yaml/dist/compose/compose-node.js"(exports) {
    "use strict";
    var Alias = require_Alias();
    var identity = require_identity();
    var composeCollection = require_compose_collection();
    var composeScalar = require_compose_scalar();
    var resolveEnd = require_resolve_end();
    var utilEmptyScalarPosition = require_util_empty_scalar_position();
    var CN = { composeNode, composeEmptyNode };
    function composeNode(ctx, token, props, onError) {
      const atKey = ctx.atKey;
      const { spaceBefore, comment, anchor, tag } = props;
      let node;
      let isSrcToken = true;
      switch (token.type) {
        case "alias":
          node = composeAlias(ctx, token, onError);
          if (anchor || tag)
            onError(token, "ALIAS_PROPS", "An alias node must not specify any properties");
          break;
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
        case "block-scalar":
          node = composeScalar.composeScalar(ctx, token, tag, onError);
          if (anchor)
            node.anchor = anchor.source.substring(1);
          break;
        case "block-map":
        case "block-seq":
        case "flow-collection":
          try {
            node = composeCollection.composeCollection(CN, ctx, token, props, onError);
            if (anchor)
              node.anchor = anchor.source.substring(1);
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            onError(token, "RESOURCE_EXHAUSTION", message);
          }
          break;
        default: {
          const message = token.type === "error" ? token.message : `Unsupported token (type: ${token.type})`;
          onError(token, "UNEXPECTED_TOKEN", message);
          isSrcToken = false;
        }
      }
      node ?? (node = composeEmptyNode(ctx, token.offset, void 0, null, props, onError));
      if (anchor && node.anchor === "")
        onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
      if (atKey && ctx.options.stringKeys && (!identity.isScalar(node) || typeof node.value !== "string" || node.tag && node.tag !== "tag:yaml.org,2002:str")) {
        const msg = "With stringKeys, all keys must be strings";
        onError(tag ?? token, "NON_STRING_KEY", msg);
      }
      if (spaceBefore)
        node.spaceBefore = true;
      if (comment) {
        if (token.type === "scalar" && token.source === "")
          node.comment = comment;
        else
          node.commentBefore = comment;
      }
      if (ctx.options.keepSourceTokens && isSrcToken)
        node.srcToken = token;
      return node;
    }
    function composeEmptyNode(ctx, offset, before, pos, { spaceBefore, comment, anchor, tag, end }, onError) {
      const token = {
        type: "scalar",
        offset: utilEmptyScalarPosition.emptyScalarPosition(offset, before, pos),
        indent: -1,
        source: ""
      };
      const node = composeScalar.composeScalar(ctx, token, tag, onError);
      if (anchor) {
        node.anchor = anchor.source.substring(1);
        if (node.anchor === "")
          onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
      }
      if (spaceBefore)
        node.spaceBefore = true;
      if (comment) {
        node.comment = comment;
        node.range[2] = end;
      }
      return node;
    }
    function composeAlias({ options }, { offset, source, end }, onError) {
      const alias = new Alias.Alias(source.substring(1));
      if (alias.source === "")
        onError(offset, "BAD_ALIAS", "Alias cannot be an empty string");
      if (alias.source.endsWith(":"))
        onError(offset + source.length - 1, "BAD_ALIAS", "Alias ending in : is ambiguous", true);
      const valueEnd = offset + source.length;
      const re = resolveEnd.resolveEnd(end, valueEnd, options.strict, onError);
      alias.range = [offset, valueEnd, re.offset];
      if (re.comment)
        alias.comment = re.comment;
      return alias;
    }
    exports.composeEmptyNode = composeEmptyNode;
    exports.composeNode = composeNode;
  }
});

// node_modules/yaml/dist/compose/compose-doc.js
var require_compose_doc = __commonJS({
  "node_modules/yaml/dist/compose/compose-doc.js"(exports) {
    "use strict";
    var Document = require_Document();
    var composeNode = require_compose_node();
    var resolveEnd = require_resolve_end();
    var resolveProps = require_resolve_props();
    function composeDoc(options, directives, { offset, start, value, end }, onError) {
      const opts = Object.assign({ _directives: directives }, options);
      const doc = new Document.Document(void 0, opts);
      const ctx = {
        atKey: false,
        atRoot: true,
        directives: doc.directives,
        options: doc.options,
        schema: doc.schema
      };
      const props = resolveProps.resolveProps(start, {
        indicator: "doc-start",
        next: value ?? end?.[0],
        offset,
        onError,
        parentIndent: 0,
        startOnNewline: true
      });
      if (props.found) {
        doc.directives.docStart = true;
        if (value && (value.type === "block-map" || value.type === "block-seq") && !props.hasNewline)
          onError(props.end, "MISSING_CHAR", "Block collection cannot start on same line with directives-end marker");
      }
      doc.contents = value ? composeNode.composeNode(ctx, value, props, onError) : composeNode.composeEmptyNode(ctx, props.end, start, null, props, onError);
      const contentEnd = doc.contents.range[2];
      const re = resolveEnd.resolveEnd(end, contentEnd, false, onError);
      if (re.comment)
        doc.comment = re.comment;
      doc.range = [offset, contentEnd, re.offset];
      return doc;
    }
    exports.composeDoc = composeDoc;
  }
});

// node_modules/yaml/dist/compose/composer.js
var require_composer = __commonJS({
  "node_modules/yaml/dist/compose/composer.js"(exports) {
    "use strict";
    var node_process = __require("process");
    var directives = require_directives();
    var Document = require_Document();
    var errors = require_errors();
    var identity = require_identity();
    var composeDoc = require_compose_doc();
    var resolveEnd = require_resolve_end();
    function getErrorPos(src) {
      if (typeof src === "number")
        return [src, src + 1];
      if (Array.isArray(src))
        return src.length === 2 ? src : [src[0], src[1]];
      const { offset, source } = src;
      return [offset, offset + (typeof source === "string" ? source.length : 1)];
    }
    function parsePrelude(prelude) {
      let comment = "";
      let atComment = false;
      let afterEmptyLine = false;
      for (let i3 = 0; i3 < prelude.length; ++i3) {
        const source = prelude[i3];
        switch (source[0]) {
          case "#":
            comment += (comment === "" ? "" : afterEmptyLine ? "\n\n" : "\n") + (source.substring(1) || " ");
            atComment = true;
            afterEmptyLine = false;
            break;
          case "%":
            if (prelude[i3 + 1]?.[0] !== "#")
              i3 += 1;
            atComment = false;
            break;
          default:
            if (!atComment)
              afterEmptyLine = true;
            atComment = false;
        }
      }
      return { comment, afterEmptyLine };
    }
    var Composer = class {
      constructor(options = {}) {
        this.doc = null;
        this.atDirectives = false;
        this.prelude = [];
        this.errors = [];
        this.warnings = [];
        this.onError = (source, code, message, warning) => {
          const pos = getErrorPos(source);
          if (warning)
            this.warnings.push(new errors.YAMLWarning(pos, code, message));
          else
            this.errors.push(new errors.YAMLParseError(pos, code, message));
        };
        this.directives = new directives.Directives({ version: options.version || "1.2" });
        this.options = options;
      }
      decorate(doc, afterDoc) {
        const { comment, afterEmptyLine } = parsePrelude(this.prelude);
        if (comment) {
          const dc = doc.contents;
          if (afterDoc) {
            doc.comment = doc.comment ? `${doc.comment}
${comment}` : comment;
          } else if (afterEmptyLine || doc.directives.docStart || !dc) {
            doc.commentBefore = comment;
          } else if (identity.isCollection(dc) && !dc.flow && dc.items.length > 0) {
            let it = dc.items[0];
            if (identity.isPair(it))
              it = it.key;
            const cb = it.commentBefore;
            it.commentBefore = cb ? `${comment}
${cb}` : comment;
          } else {
            const cb = dc.commentBefore;
            dc.commentBefore = cb ? `${comment}
${cb}` : comment;
          }
        }
        if (afterDoc) {
          for (let i3 = 0; i3 < this.errors.length; ++i3)
            doc.errors.push(this.errors[i3]);
          for (let i3 = 0; i3 < this.warnings.length; ++i3)
            doc.warnings.push(this.warnings[i3]);
        } else {
          doc.errors = this.errors;
          doc.warnings = this.warnings;
        }
        this.prelude = [];
        this.errors = [];
        this.warnings = [];
      }
      /**
       * Current stream status information.
       *
       * Mostly useful at the end of input for an empty stream.
       */
      streamInfo() {
        return {
          comment: parsePrelude(this.prelude).comment,
          directives: this.directives,
          errors: this.errors,
          warnings: this.warnings
        };
      }
      /**
       * Compose tokens into documents.
       *
       * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
       * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
       */
      *compose(tokens, forceDoc = false, endOffset = -1) {
        for (const token of tokens)
          yield* this.next(token);
        yield* this.end(forceDoc, endOffset);
      }
      /** Advance the composer by one CST token. */
      *next(token) {
        if (node_process.env.LOG_STREAM)
          console.dir(token, { depth: null });
        switch (token.type) {
          case "directive":
            this.directives.add(token.source, (offset, message, warning) => {
              const pos = getErrorPos(token);
              pos[0] += offset;
              this.onError(pos, "BAD_DIRECTIVE", message, warning);
            });
            this.prelude.push(token.source);
            this.atDirectives = true;
            break;
          case "document": {
            const doc = composeDoc.composeDoc(this.options, this.directives, token, this.onError);
            if (this.atDirectives && !doc.directives.docStart)
              this.onError(token, "MISSING_CHAR", "Missing directives-end/doc-start indicator line");
            this.decorate(doc, false);
            if (this.doc)
              yield this.doc;
            this.doc = doc;
            this.atDirectives = false;
            break;
          }
          case "byte-order-mark":
          case "space":
            break;
          case "comment":
          case "newline":
            this.prelude.push(token.source);
            break;
          case "error": {
            const msg = token.source ? `${token.message}: ${JSON.stringify(token.source)}` : token.message;
            const error = new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg);
            if (this.atDirectives || !this.doc)
              this.errors.push(error);
            else
              this.doc.errors.push(error);
            break;
          }
          case "doc-end": {
            if (!this.doc) {
              const msg = "Unexpected doc-end without preceding document";
              this.errors.push(new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg));
              break;
            }
            this.doc.directives.docEnd = true;
            const end = resolveEnd.resolveEnd(token.end, token.offset + token.source.length, this.doc.options.strict, this.onError);
            this.decorate(this.doc, true);
            if (end.comment) {
              const dc = this.doc.comment;
              this.doc.comment = dc ? `${dc}
${end.comment}` : end.comment;
            }
            this.doc.range[2] = end.offset;
            break;
          }
          default:
            this.errors.push(new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", `Unsupported token ${token.type}`));
        }
      }
      /**
       * Call at end of input to yield any remaining document.
       *
       * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
       * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
       */
      *end(forceDoc = false, endOffset = -1) {
        if (this.doc) {
          this.decorate(this.doc, true);
          yield this.doc;
          this.doc = null;
        } else if (forceDoc) {
          const opts = Object.assign({ _directives: this.directives }, this.options);
          const doc = new Document.Document(void 0, opts);
          if (this.atDirectives)
            this.onError(endOffset, "MISSING_CHAR", "Missing directives-end indicator line");
          doc.range = [0, endOffset, endOffset];
          this.decorate(doc, false);
          yield doc;
        }
      }
    };
    exports.Composer = Composer;
  }
});

// node_modules/yaml/dist/parse/cst-scalar.js
var require_cst_scalar = __commonJS({
  "node_modules/yaml/dist/parse/cst-scalar.js"(exports) {
    "use strict";
    var resolveBlockScalar = require_resolve_block_scalar();
    var resolveFlowScalar = require_resolve_flow_scalar();
    var errors = require_errors();
    var stringifyString = require_stringifyString();
    function resolveAsScalar(token, strict = true, onError) {
      if (token) {
        const _onError = (pos, code, message) => {
          const offset = typeof pos === "number" ? pos : Array.isArray(pos) ? pos[0] : pos.offset;
          if (onError)
            onError(offset, code, message);
          else
            throw new errors.YAMLParseError([offset, offset + 1], code, message);
        };
        switch (token.type) {
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return resolveFlowScalar.resolveFlowScalar(token, strict, _onError);
          case "block-scalar":
            return resolveBlockScalar.resolveBlockScalar({ options: { strict } }, token, _onError);
        }
      }
      return null;
    }
    function createScalarToken(value, context) {
      const { implicitKey = false, indent, inFlow = false, offset = -1, type = "PLAIN" } = context;
      const source = stringifyString.stringifyString({ type, value }, {
        implicitKey,
        indent: indent > 0 ? " ".repeat(indent) : "",
        inFlow,
        options: { blockQuote: true, lineWidth: -1 }
      });
      const end = context.end ?? [
        { type: "newline", offset: -1, indent, source: "\n" }
      ];
      switch (source[0]) {
        case "|":
        case ">": {
          const he = source.indexOf("\n");
          const head = source.substring(0, he);
          const body = source.substring(he + 1) + "\n";
          const props = [
            { type: "block-scalar-header", offset, indent, source: head }
          ];
          if (!addEndtoBlockProps(props, end))
            props.push({ type: "newline", offset: -1, indent, source: "\n" });
          return { type: "block-scalar", offset, indent, props, source: body };
        }
        case '"':
          return { type: "double-quoted-scalar", offset, indent, source, end };
        case "'":
          return { type: "single-quoted-scalar", offset, indent, source, end };
        default:
          return { type: "scalar", offset, indent, source, end };
      }
    }
    function setScalarValue(token, value, context = {}) {
      let { afterKey = false, implicitKey = false, inFlow = false, type } = context;
      let indent = "indent" in token ? token.indent : null;
      if (afterKey && typeof indent === "number")
        indent += 2;
      if (!type)
        switch (token.type) {
          case "single-quoted-scalar":
            type = "QUOTE_SINGLE";
            break;
          case "double-quoted-scalar":
            type = "QUOTE_DOUBLE";
            break;
          case "block-scalar": {
            const header = token.props[0];
            if (header.type !== "block-scalar-header")
              throw new Error("Invalid block scalar header");
            type = header.source[0] === ">" ? "BLOCK_FOLDED" : "BLOCK_LITERAL";
            break;
          }
          default:
            type = "PLAIN";
        }
      const source = stringifyString.stringifyString({ type, value }, {
        implicitKey: implicitKey || indent === null,
        indent: indent !== null && indent > 0 ? " ".repeat(indent) : "",
        inFlow,
        options: { blockQuote: true, lineWidth: -1 }
      });
      switch (source[0]) {
        case "|":
        case ">":
          setBlockScalarValue(token, source);
          break;
        case '"':
          setFlowScalarValue(token, source, "double-quoted-scalar");
          break;
        case "'":
          setFlowScalarValue(token, source, "single-quoted-scalar");
          break;
        default:
          setFlowScalarValue(token, source, "scalar");
      }
    }
    function setBlockScalarValue(token, source) {
      const he = source.indexOf("\n");
      const head = source.substring(0, he);
      const body = source.substring(he + 1) + "\n";
      if (token.type === "block-scalar") {
        const header = token.props[0];
        if (header.type !== "block-scalar-header")
          throw new Error("Invalid block scalar header");
        header.source = head;
        token.source = body;
      } else {
        const { offset } = token;
        const indent = "indent" in token ? token.indent : -1;
        const props = [
          { type: "block-scalar-header", offset, indent, source: head }
        ];
        if (!addEndtoBlockProps(props, "end" in token ? token.end : void 0))
          props.push({ type: "newline", offset: -1, indent, source: "\n" });
        for (const key of Object.keys(token))
          if (key !== "type" && key !== "offset")
            delete token[key];
        Object.assign(token, { type: "block-scalar", indent, props, source: body });
      }
    }
    function addEndtoBlockProps(props, end) {
      if (end)
        for (const st of end)
          switch (st.type) {
            case "space":
            case "comment":
              props.push(st);
              break;
            case "newline":
              props.push(st);
              return true;
          }
      return false;
    }
    function setFlowScalarValue(token, source, type) {
      switch (token.type) {
        case "scalar":
        case "double-quoted-scalar":
        case "single-quoted-scalar":
          token.type = type;
          token.source = source;
          break;
        case "block-scalar": {
          const end = token.props.slice(1);
          let oa = source.length;
          if (token.props[0].type === "block-scalar-header")
            oa -= token.props[0].source.length;
          for (const tok of end)
            tok.offset += oa;
          delete token.props;
          Object.assign(token, { type, source, end });
          break;
        }
        case "block-map":
        case "block-seq": {
          const offset = token.offset + source.length;
          const nl = { type: "newline", offset, indent: token.indent, source: "\n" };
          delete token.items;
          Object.assign(token, { type, source, end: [nl] });
          break;
        }
        default: {
          const indent = "indent" in token ? token.indent : -1;
          const end = "end" in token && Array.isArray(token.end) ? token.end.filter((st) => st.type === "space" || st.type === "comment" || st.type === "newline") : [];
          for (const key of Object.keys(token))
            if (key !== "type" && key !== "offset")
              delete token[key];
          Object.assign(token, { type, indent, source, end });
        }
      }
    }
    exports.createScalarToken = createScalarToken;
    exports.resolveAsScalar = resolveAsScalar;
    exports.setScalarValue = setScalarValue;
  }
});

// node_modules/yaml/dist/parse/cst-stringify.js
var require_cst_stringify = __commonJS({
  "node_modules/yaml/dist/parse/cst-stringify.js"(exports) {
    "use strict";
    var stringify = (cst) => "type" in cst ? stringifyToken(cst) : stringifyItem(cst);
    function stringifyToken(token) {
      switch (token.type) {
        case "block-scalar": {
          let res = "";
          for (const tok of token.props)
            res += stringifyToken(tok);
          return res + token.source;
        }
        case "block-map":
        case "block-seq": {
          let res = "";
          for (const item of token.items)
            res += stringifyItem(item);
          return res;
        }
        case "flow-collection": {
          let res = token.start.source;
          for (const item of token.items)
            res += stringifyItem(item);
          for (const st of token.end)
            res += st.source;
          return res;
        }
        case "document": {
          let res = stringifyItem(token);
          if (token.end)
            for (const st of token.end)
              res += st.source;
          return res;
        }
        default: {
          let res = token.source;
          if ("end" in token && token.end)
            for (const st of token.end)
              res += st.source;
          return res;
        }
      }
    }
    function stringifyItem({ start, key, sep, value }) {
      let res = "";
      for (const st of start)
        res += st.source;
      if (key)
        res += stringifyToken(key);
      if (sep)
        for (const st of sep)
          res += st.source;
      if (value)
        res += stringifyToken(value);
      return res;
    }
    exports.stringify = stringify;
  }
});

// node_modules/yaml/dist/parse/cst-visit.js
var require_cst_visit = __commonJS({
  "node_modules/yaml/dist/parse/cst-visit.js"(exports) {
    "use strict";
    var BREAK = /* @__PURE__ */ Symbol("break visit");
    var SKIP = /* @__PURE__ */ Symbol("skip children");
    var REMOVE = /* @__PURE__ */ Symbol("remove item");
    function visit(cst, visitor) {
      if ("type" in cst && cst.type === "document")
        cst = { start: cst.start, value: cst.value };
      _visit(Object.freeze([]), cst, visitor);
    }
    visit.BREAK = BREAK;
    visit.SKIP = SKIP;
    visit.REMOVE = REMOVE;
    visit.itemAtPath = (cst, path) => {
      let item = cst;
      for (const [field, index] of path) {
        const tok = item?.[field];
        if (tok && "items" in tok) {
          item = tok.items[index];
        } else
          return void 0;
      }
      return item;
    };
    visit.parentCollection = (cst, path) => {
      const parent = visit.itemAtPath(cst, path.slice(0, -1));
      const field = path[path.length - 1][0];
      const coll = parent?.[field];
      if (coll && "items" in coll)
        return coll;
      throw new Error("Parent collection not found");
    };
    function _visit(path, item, visitor) {
      let ctrl = visitor(item, path);
      if (typeof ctrl === "symbol")
        return ctrl;
      for (const field of ["key", "value"]) {
        const token = item[field];
        if (token && "items" in token) {
          for (let i3 = 0; i3 < token.items.length; ++i3) {
            const ci = _visit(Object.freeze(path.concat([[field, i3]])), token.items[i3], visitor);
            if (typeof ci === "number")
              i3 = ci - 1;
            else if (ci === BREAK)
              return BREAK;
            else if (ci === REMOVE) {
              token.items.splice(i3, 1);
              i3 -= 1;
            }
          }
          if (typeof ctrl === "function" && field === "key")
            ctrl = ctrl(item, path);
        }
      }
      return typeof ctrl === "function" ? ctrl(item, path) : ctrl;
    }
    exports.visit = visit;
  }
});

// node_modules/yaml/dist/parse/cst.js
var require_cst = __commonJS({
  "node_modules/yaml/dist/parse/cst.js"(exports) {
    "use strict";
    var cstScalar = require_cst_scalar();
    var cstStringify = require_cst_stringify();
    var cstVisit = require_cst_visit();
    var BOM = "\uFEFF";
    var DOCUMENT = "";
    var FLOW_END = "";
    var SCALAR = "";
    var isCollection = (token) => !!token && "items" in token;
    var isScalar = (token) => !!token && (token.type === "scalar" || token.type === "single-quoted-scalar" || token.type === "double-quoted-scalar" || token.type === "block-scalar");
    function prettyToken(token) {
      switch (token) {
        case BOM:
          return "<BOM>";
        case DOCUMENT:
          return "<DOC>";
        case FLOW_END:
          return "<FLOW_END>";
        case SCALAR:
          return "<SCALAR>";
        default:
          return JSON.stringify(token);
      }
    }
    function tokenType(source) {
      switch (source) {
        case BOM:
          return "byte-order-mark";
        case DOCUMENT:
          return "doc-mode";
        case FLOW_END:
          return "flow-error-end";
        case SCALAR:
          return "scalar";
        case "---":
          return "doc-start";
        case "...":
          return "doc-end";
        case "":
        case "\n":
        case "\r\n":
          return "newline";
        case "-":
          return "seq-item-ind";
        case "?":
          return "explicit-key-ind";
        case ":":
          return "map-value-ind";
        case "{":
          return "flow-map-start";
        case "}":
          return "flow-map-end";
        case "[":
          return "flow-seq-start";
        case "]":
          return "flow-seq-end";
        case ",":
          return "comma";
      }
      switch (source[0]) {
        case " ":
        case "	":
          return "space";
        case "#":
          return "comment";
        case "%":
          return "directive-line";
        case "*":
          return "alias";
        case "&":
          return "anchor";
        case "!":
          return "tag";
        case "'":
          return "single-quoted-scalar";
        case '"':
          return "double-quoted-scalar";
        case "|":
        case ">":
          return "block-scalar-header";
      }
      return null;
    }
    exports.createScalarToken = cstScalar.createScalarToken;
    exports.resolveAsScalar = cstScalar.resolveAsScalar;
    exports.setScalarValue = cstScalar.setScalarValue;
    exports.stringify = cstStringify.stringify;
    exports.visit = cstVisit.visit;
    exports.BOM = BOM;
    exports.DOCUMENT = DOCUMENT;
    exports.FLOW_END = FLOW_END;
    exports.SCALAR = SCALAR;
    exports.isCollection = isCollection;
    exports.isScalar = isScalar;
    exports.prettyToken = prettyToken;
    exports.tokenType = tokenType;
  }
});

// node_modules/yaml/dist/parse/lexer.js
var require_lexer = __commonJS({
  "node_modules/yaml/dist/parse/lexer.js"(exports) {
    "use strict";
    var cst = require_cst();
    function isEmpty(ch) {
      switch (ch) {
        case void 0:
        case " ":
        case "\n":
        case "\r":
        case "	":
          return true;
        default:
          return false;
      }
    }
    var hexDigits = new Set("0123456789ABCDEFabcdef");
    var tagChars = new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()");
    var flowIndicatorChars = new Set(",[]{}");
    var invalidAnchorChars = new Set(" ,[]{}\n\r	");
    var isNotAnchorChar = (ch) => !ch || invalidAnchorChars.has(ch);
    var Lexer = class {
      constructor() {
        this.atEnd = false;
        this.blockScalarIndent = -1;
        this.blockScalarKeep = false;
        this.buffer = "";
        this.flowKey = false;
        this.flowLevel = 0;
        this.indentNext = 0;
        this.indentValue = 0;
        this.lineEndPos = null;
        this.next = null;
        this.pos = 0;
      }
      /**
       * Generate YAML tokens from the `source` string. If `incomplete`,
       * a part of the last line may be left as a buffer for the next call.
       *
       * @returns A generator of lexical tokens
       */
      *lex(source, incomplete = false) {
        if (source) {
          if (typeof source !== "string")
            throw TypeError("source is not a string");
          this.buffer = this.buffer ? this.buffer + source : source;
          this.lineEndPos = null;
        }
        this.atEnd = !incomplete;
        let next = this.next ?? "stream";
        while (next && (incomplete || this.hasChars(1)))
          next = yield* this.parseNext(next);
      }
      atLineEnd() {
        let i3 = this.pos;
        let ch = this.buffer[i3];
        while (ch === " " || ch === "	")
          ch = this.buffer[++i3];
        if (!ch || ch === "#" || ch === "\n")
          return true;
        if (ch === "\r")
          return this.buffer[i3 + 1] === "\n";
        return false;
      }
      charAt(n) {
        return this.buffer[this.pos + n];
      }
      continueScalar(offset) {
        let ch = this.buffer[offset];
        if (this.indentNext > 0) {
          let indent = 0;
          while (ch === " ")
            ch = this.buffer[++indent + offset];
          if (ch === "\r") {
            const next = this.buffer[indent + offset + 1];
            if (next === "\n" || !next && !this.atEnd)
              return offset + indent + 1;
          }
          return ch === "\n" || indent >= this.indentNext || !ch && !this.atEnd ? offset + indent : -1;
        }
        if (ch === "-" || ch === ".") {
          const dt = this.buffer.substr(offset, 3);
          if ((dt === "---" || dt === "...") && isEmpty(this.buffer[offset + 3]))
            return -1;
        }
        return offset;
      }
      getLine() {
        let end = this.lineEndPos;
        if (typeof end !== "number" || end !== -1 && end < this.pos) {
          end = this.buffer.indexOf("\n", this.pos);
          this.lineEndPos = end;
        }
        if (end === -1)
          return this.atEnd ? this.buffer.substring(this.pos) : null;
        if (this.buffer[end - 1] === "\r")
          end -= 1;
        return this.buffer.substring(this.pos, end);
      }
      hasChars(n) {
        return this.pos + n <= this.buffer.length;
      }
      setNext(state) {
        this.buffer = this.buffer.substring(this.pos);
        this.pos = 0;
        this.lineEndPos = null;
        this.next = state;
        return null;
      }
      peek(n) {
        return this.buffer.substr(this.pos, n);
      }
      *parseNext(next) {
        switch (next) {
          case "stream":
            return yield* this.parseStream();
          case "line-start":
            return yield* this.parseLineStart();
          case "block-start":
            return yield* this.parseBlockStart();
          case "doc":
            return yield* this.parseDocument();
          case "flow":
            return yield* this.parseFlowCollection();
          case "quoted-scalar":
            return yield* this.parseQuotedScalar();
          case "block-scalar":
            return yield* this.parseBlockScalar();
          case "plain-scalar":
            return yield* this.parsePlainScalar();
        }
      }
      *parseStream() {
        let line = this.getLine();
        if (line === null)
          return this.setNext("stream");
        if (line[0] === cst.BOM) {
          yield* this.pushCount(1);
          line = line.substring(1);
        }
        if (line[0] === "%") {
          let dirEnd = line.length;
          let cs = line.indexOf("#");
          while (cs !== -1) {
            const ch = line[cs - 1];
            if (ch === " " || ch === "	") {
              dirEnd = cs - 1;
              break;
            } else {
              cs = line.indexOf("#", cs + 1);
            }
          }
          while (true) {
            const ch = line[dirEnd - 1];
            if (ch === " " || ch === "	")
              dirEnd -= 1;
            else
              break;
          }
          const n = (yield* this.pushCount(dirEnd)) + (yield* this.pushSpaces(true));
          yield* this.pushCount(line.length - n);
          this.pushNewline();
          return "stream";
        }
        if (this.atLineEnd()) {
          const sp = yield* this.pushSpaces(true);
          yield* this.pushCount(line.length - sp);
          yield* this.pushNewline();
          return "stream";
        }
        yield cst.DOCUMENT;
        return yield* this.parseLineStart();
      }
      *parseLineStart() {
        const ch = this.charAt(0);
        if (!ch && !this.atEnd)
          return this.setNext("line-start");
        if (ch === "-" || ch === ".") {
          if (!this.atEnd && !this.hasChars(4))
            return this.setNext("line-start");
          const s = this.peek(3);
          if ((s === "---" || s === "...") && isEmpty(this.charAt(3))) {
            yield* this.pushCount(3);
            this.indentValue = 0;
            this.indentNext = 0;
            return s === "---" ? "doc" : "stream";
          }
        }
        this.indentValue = yield* this.pushSpaces(false);
        if (this.indentNext > this.indentValue && !isEmpty(this.charAt(1)))
          this.indentNext = this.indentValue;
        return yield* this.parseBlockStart();
      }
      *parseBlockStart() {
        const [ch0, ch1] = this.peek(2);
        if (!ch1 && !this.atEnd)
          return this.setNext("block-start");
        if ((ch0 === "-" || ch0 === "?" || ch0 === ":") && isEmpty(ch1)) {
          const n = (yield* this.pushCount(1)) + (yield* this.pushSpaces(true));
          this.indentNext = this.indentValue + 1;
          this.indentValue += n;
          return "block-start";
        }
        return "doc";
      }
      *parseDocument() {
        yield* this.pushSpaces(true);
        const line = this.getLine();
        if (line === null)
          return this.setNext("doc");
        let n = yield* this.pushIndicators();
        switch (line[n]) {
          case "#":
            yield* this.pushCount(line.length - n);
          // fallthrough
          case void 0:
            yield* this.pushNewline();
            return yield* this.parseLineStart();
          case "{":
          case "[":
            yield* this.pushCount(1);
            this.flowKey = false;
            this.flowLevel = 1;
            return "flow";
          case "}":
          case "]":
            yield* this.pushCount(1);
            return "doc";
          case "*":
            yield* this.pushUntil(isNotAnchorChar);
            return "doc";
          case '"':
          case "'":
            return yield* this.parseQuotedScalar();
          case "|":
          case ">":
            n += yield* this.parseBlockScalarHeader();
            n += yield* this.pushSpaces(true);
            yield* this.pushCount(line.length - n);
            yield* this.pushNewline();
            return yield* this.parseBlockScalar();
          default:
            return yield* this.parsePlainScalar();
        }
      }
      *parseFlowCollection() {
        let nl, sp;
        let indent = -1;
        do {
          nl = yield* this.pushNewline();
          if (nl > 0) {
            sp = yield* this.pushSpaces(false);
            this.indentValue = indent = sp;
          } else {
            sp = 0;
          }
          sp += yield* this.pushSpaces(true);
        } while (nl + sp > 0);
        const line = this.getLine();
        if (line === null)
          return this.setNext("flow");
        if (indent !== -1 && indent < this.indentNext && line[0] !== "#" || indent === 0 && (line.startsWith("---") || line.startsWith("...")) && isEmpty(line[3])) {
          const atFlowEndMarker = indent === this.indentNext - 1 && this.flowLevel === 1 && (line[0] === "]" || line[0] === "}");
          if (!atFlowEndMarker) {
            this.flowLevel = 0;
            yield cst.FLOW_END;
            return yield* this.parseLineStart();
          }
        }
        let n = 0;
        while (line[n] === ",") {
          n += yield* this.pushCount(1);
          n += yield* this.pushSpaces(true);
          this.flowKey = false;
        }
        n += yield* this.pushIndicators();
        switch (line[n]) {
          case void 0:
            return "flow";
          case "#":
            yield* this.pushCount(line.length - n);
            return "flow";
          case "{":
          case "[":
            yield* this.pushCount(1);
            this.flowKey = false;
            this.flowLevel += 1;
            return "flow";
          case "}":
          case "]":
            yield* this.pushCount(1);
            this.flowKey = true;
            this.flowLevel -= 1;
            return this.flowLevel ? "flow" : "doc";
          case "*":
            yield* this.pushUntil(isNotAnchorChar);
            return "flow";
          case '"':
          case "'":
            this.flowKey = true;
            return yield* this.parseQuotedScalar();
          case ":": {
            const next = this.charAt(1);
            if (this.flowKey || isEmpty(next) || next === ",") {
              this.flowKey = false;
              yield* this.pushCount(1);
              yield* this.pushSpaces(true);
              return "flow";
            }
          }
          // fallthrough
          default:
            this.flowKey = false;
            return yield* this.parsePlainScalar();
        }
      }
      *parseQuotedScalar() {
        const quote = this.charAt(0);
        let end = this.buffer.indexOf(quote, this.pos + 1);
        if (quote === "'") {
          while (end !== -1 && this.buffer[end + 1] === "'")
            end = this.buffer.indexOf("'", end + 2);
        } else {
          while (end !== -1) {
            let n = 0;
            while (this.buffer[end - 1 - n] === "\\")
              n += 1;
            if (n % 2 === 0)
              break;
            end = this.buffer.indexOf('"', end + 1);
          }
        }
        const qb = this.buffer.substring(0, end);
        let nl = qb.indexOf("\n", this.pos);
        if (nl !== -1) {
          while (nl !== -1) {
            const cs = this.continueScalar(nl + 1);
            if (cs === -1)
              break;
            nl = qb.indexOf("\n", cs);
          }
          if (nl !== -1) {
            end = nl - (qb[nl - 1] === "\r" ? 2 : 1);
          }
        }
        if (end === -1) {
          if (!this.atEnd)
            return this.setNext("quoted-scalar");
          end = this.buffer.length;
        }
        yield* this.pushToIndex(end + 1, false);
        return this.flowLevel ? "flow" : "doc";
      }
      *parseBlockScalarHeader() {
        this.blockScalarIndent = -1;
        this.blockScalarKeep = false;
        let i3 = this.pos;
        while (true) {
          const ch = this.buffer[++i3];
          if (ch === "+")
            this.blockScalarKeep = true;
          else if (ch > "0" && ch <= "9")
            this.blockScalarIndent = Number(ch) - 1;
          else if (ch !== "-")
            break;
        }
        return yield* this.pushUntil((ch) => isEmpty(ch) || ch === "#");
      }
      *parseBlockScalar() {
        let nl = this.pos - 1;
        let indent = 0;
        let ch;
        loop: for (let i4 = this.pos; ch = this.buffer[i4]; ++i4) {
          switch (ch) {
            case " ":
              indent += 1;
              break;
            case "\n":
              nl = i4;
              indent = 0;
              break;
            case "\r": {
              const next = this.buffer[i4 + 1];
              if (!next && !this.atEnd)
                return this.setNext("block-scalar");
              if (next === "\n")
                break;
            }
            // fallthrough
            default:
              break loop;
          }
        }
        if (!ch && !this.atEnd)
          return this.setNext("block-scalar");
        if (indent >= this.indentNext) {
          if (this.blockScalarIndent === -1)
            this.indentNext = indent;
          else {
            this.indentNext = this.blockScalarIndent + (this.indentNext === 0 ? 1 : this.indentNext);
          }
          do {
            const cs = this.continueScalar(nl + 1);
            if (cs === -1)
              break;
            nl = this.buffer.indexOf("\n", cs);
          } while (nl !== -1);
          if (nl === -1) {
            if (!this.atEnd)
              return this.setNext("block-scalar");
            nl = this.buffer.length;
          }
        }
        let i3 = nl + 1;
        ch = this.buffer[i3];
        while (ch === " ")
          ch = this.buffer[++i3];
        if (ch === "	") {
          while (ch === "	" || ch === " " || ch === "\r" || ch === "\n")
            ch = this.buffer[++i3];
          nl = i3 - 1;
        } else if (!this.blockScalarKeep) {
          do {
            let i4 = nl - 1;
            let ch2 = this.buffer[i4];
            if (ch2 === "\r")
              ch2 = this.buffer[--i4];
            const lastChar = i4;
            while (ch2 === " ")
              ch2 = this.buffer[--i4];
            if (ch2 === "\n" && i4 >= this.pos && i4 + 1 + indent > lastChar)
              nl = i4;
            else
              break;
          } while (true);
        }
        yield cst.SCALAR;
        yield* this.pushToIndex(nl + 1, true);
        return yield* this.parseLineStart();
      }
      *parsePlainScalar() {
        const inFlow = this.flowLevel > 0;
        let end = this.pos - 1;
        let i3 = this.pos - 1;
        let ch;
        while (ch = this.buffer[++i3]) {
          if (ch === ":") {
            const next = this.buffer[i3 + 1];
            if (isEmpty(next) || inFlow && flowIndicatorChars.has(next))
              break;
            end = i3;
          } else if (isEmpty(ch)) {
            let next = this.buffer[i3 + 1];
            if (ch === "\r") {
              if (next === "\n") {
                i3 += 1;
                ch = "\n";
                next = this.buffer[i3 + 1];
              } else
                end = i3;
            }
            if (next === "#" || inFlow && flowIndicatorChars.has(next))
              break;
            if (ch === "\n") {
              const cs = this.continueScalar(i3 + 1);
              if (cs === -1)
                break;
              i3 = Math.max(i3, cs - 2);
            }
          } else {
            if (inFlow && flowIndicatorChars.has(ch))
              break;
            end = i3;
          }
        }
        if (!ch && !this.atEnd)
          return this.setNext("plain-scalar");
        yield cst.SCALAR;
        yield* this.pushToIndex(end + 1, true);
        return inFlow ? "flow" : "doc";
      }
      *pushCount(n) {
        if (n > 0) {
          yield this.buffer.substr(this.pos, n);
          this.pos += n;
          return n;
        }
        return 0;
      }
      *pushToIndex(i3, allowEmpty) {
        const s = this.buffer.slice(this.pos, i3);
        if (s) {
          yield s;
          this.pos += s.length;
          return s.length;
        } else if (allowEmpty)
          yield "";
        return 0;
      }
      *pushIndicators() {
        let n = 0;
        loop: while (true) {
          switch (this.charAt(0)) {
            case "!":
              n += yield* this.pushTag();
              n += yield* this.pushSpaces(true);
              continue loop;
            case "&":
              n += yield* this.pushUntil(isNotAnchorChar);
              n += yield* this.pushSpaces(true);
              continue loop;
            case "-":
            // this is an error
            case "?":
            // this is an error outside flow collections
            case ":": {
              const inFlow = this.flowLevel > 0;
              const ch1 = this.charAt(1);
              if (isEmpty(ch1) || inFlow && flowIndicatorChars.has(ch1)) {
                if (!inFlow)
                  this.indentNext = this.indentValue + 1;
                else if (this.flowKey)
                  this.flowKey = false;
                n += yield* this.pushCount(1);
                n += yield* this.pushSpaces(true);
                continue loop;
              }
            }
          }
          break loop;
        }
        return n;
      }
      *pushTag() {
        if (this.charAt(1) === "<") {
          let i3 = this.pos + 2;
          let ch = this.buffer[i3];
          while (!isEmpty(ch) && ch !== ">")
            ch = this.buffer[++i3];
          return yield* this.pushToIndex(ch === ">" ? i3 + 1 : i3, false);
        } else {
          let i3 = this.pos + 1;
          let ch = this.buffer[i3];
          while (ch) {
            if (tagChars.has(ch))
              ch = this.buffer[++i3];
            else if (ch === "%" && hexDigits.has(this.buffer[i3 + 1]) && hexDigits.has(this.buffer[i3 + 2])) {
              ch = this.buffer[i3 += 3];
            } else
              break;
          }
          return yield* this.pushToIndex(i3, false);
        }
      }
      *pushNewline() {
        const ch = this.buffer[this.pos];
        if (ch === "\n")
          return yield* this.pushCount(1);
        else if (ch === "\r" && this.charAt(1) === "\n")
          return yield* this.pushCount(2);
        else
          return 0;
      }
      *pushSpaces(allowTabs) {
        let i3 = this.pos - 1;
        let ch;
        do {
          ch = this.buffer[++i3];
        } while (ch === " " || allowTabs && ch === "	");
        const n = i3 - this.pos;
        if (n > 0) {
          yield this.buffer.substr(this.pos, n);
          this.pos = i3;
        }
        return n;
      }
      *pushUntil(test2) {
        let i3 = this.pos;
        let ch = this.buffer[i3];
        while (!test2(ch))
          ch = this.buffer[++i3];
        return yield* this.pushToIndex(i3, false);
      }
    };
    exports.Lexer = Lexer;
  }
});

// node_modules/yaml/dist/parse/line-counter.js
var require_line_counter = __commonJS({
  "node_modules/yaml/dist/parse/line-counter.js"(exports) {
    "use strict";
    var LineCounter = class {
      constructor() {
        this.lineStarts = [];
        this.addNewLine = (offset) => this.lineStarts.push(offset);
        this.linePos = (offset) => {
          let low = 0;
          let high = this.lineStarts.length;
          while (low < high) {
            const mid = low + high >> 1;
            if (this.lineStarts[mid] < offset)
              low = mid + 1;
            else
              high = mid;
          }
          if (this.lineStarts[low] === offset)
            return { line: low + 1, col: 1 };
          if (low === 0)
            return { line: 0, col: offset };
          const start = this.lineStarts[low - 1];
          return { line: low, col: offset - start + 1 };
        };
      }
    };
    exports.LineCounter = LineCounter;
  }
});

// node_modules/yaml/dist/parse/parser.js
var require_parser = __commonJS({
  "node_modules/yaml/dist/parse/parser.js"(exports) {
    "use strict";
    var node_process = __require("process");
    var cst = require_cst();
    var lexer = require_lexer();
    function includesToken(list, type) {
      for (let i3 = 0; i3 < list.length; ++i3)
        if (list[i3].type === type)
          return true;
      return false;
    }
    function findNonEmptyIndex(list) {
      for (let i3 = 0; i3 < list.length; ++i3) {
        switch (list[i3].type) {
          case "space":
          case "comment":
          case "newline":
            break;
          default:
            return i3;
        }
      }
      return -1;
    }
    function isFlowToken(token) {
      switch (token?.type) {
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
        case "flow-collection":
          return true;
        default:
          return false;
      }
    }
    function getPrevProps(parent) {
      switch (parent.type) {
        case "document":
          return parent.start;
        case "block-map": {
          const it = parent.items[parent.items.length - 1];
          return it.sep ?? it.start;
        }
        case "block-seq":
          return parent.items[parent.items.length - 1].start;
        /* istanbul ignore next should not happen */
        default:
          return [];
      }
    }
    function getFirstKeyStartProps(prev) {
      if (prev.length === 0)
        return [];
      let i3 = prev.length;
      loop: while (--i3 >= 0) {
        switch (prev[i3].type) {
          case "doc-start":
          case "explicit-key-ind":
          case "map-value-ind":
          case "seq-item-ind":
          case "newline":
            break loop;
        }
      }
      while (prev[++i3]?.type === "space") {
      }
      return prev.splice(i3, prev.length);
    }
    function arrayPushArray(target, source) {
      if (source.length < 1e5)
        Array.prototype.push.apply(target, source);
      else
        for (let i3 = 0; i3 < source.length; ++i3)
          target.push(source[i3]);
    }
    function fixFlowSeqItems(fc) {
      if (fc.start.type === "flow-seq-start") {
        for (const it of fc.items) {
          if (it.sep && !it.value && !includesToken(it.start, "explicit-key-ind") && !includesToken(it.sep, "map-value-ind")) {
            if (it.key)
              it.value = it.key;
            delete it.key;
            if (isFlowToken(it.value)) {
              if (it.value.end)
                arrayPushArray(it.value.end, it.sep);
              else
                it.value.end = it.sep;
            } else
              arrayPushArray(it.start, it.sep);
            delete it.sep;
          }
        }
      }
    }
    var Parser = class {
      /**
       * @param onNewLine - If defined, called separately with the start position of
       *   each new line (in `parse()`, including the start of input).
       */
      constructor(onNewLine) {
        this.atNewLine = true;
        this.atScalar = false;
        this.indent = 0;
        this.offset = 0;
        this.onKeyLine = false;
        this.stack = [];
        this.source = "";
        this.type = "";
        this.lexer = new lexer.Lexer();
        this.onNewLine = onNewLine;
      }
      /**
       * Parse `source` as a YAML stream.
       * If `incomplete`, a part of the last line may be left as a buffer for the next call.
       *
       * Errors are not thrown, but yielded as `{ type: 'error', message }` tokens.
       *
       * @returns A generator of tokens representing each directive, document, and other structure.
       */
      *parse(source, incomplete = false) {
        if (this.onNewLine && this.offset === 0)
          this.onNewLine(0);
        for (const lexeme of this.lexer.lex(source, incomplete))
          yield* this.next(lexeme);
        if (!incomplete)
          yield* this.end();
      }
      /**
       * Advance the parser by the `source` of one lexical token.
       */
      *next(source) {
        this.source = source;
        if (node_process.env.LOG_TOKENS)
          console.log("|", cst.prettyToken(source));
        if (this.atScalar) {
          this.atScalar = false;
          yield* this.step();
          this.offset += source.length;
          return;
        }
        const type = cst.tokenType(source);
        if (!type) {
          const message = `Not a YAML token: ${source}`;
          yield* this.pop({ type: "error", offset: this.offset, message, source });
          this.offset += source.length;
        } else if (type === "scalar") {
          this.atNewLine = false;
          this.atScalar = true;
          this.type = "scalar";
        } else {
          this.type = type;
          yield* this.step();
          switch (type) {
            case "newline":
              this.atNewLine = true;
              this.indent = 0;
              if (this.onNewLine)
                this.onNewLine(this.offset + source.length);
              break;
            case "space":
              if (this.atNewLine && source[0] === " ")
                this.indent += source.length;
              break;
            case "explicit-key-ind":
            case "map-value-ind":
            case "seq-item-ind":
              if (this.atNewLine)
                this.indent += source.length;
              break;
            case "doc-mode":
            case "flow-error-end":
              return;
            default:
              this.atNewLine = false;
          }
          this.offset += source.length;
        }
      }
      /** Call at end of input to push out any remaining constructions */
      *end() {
        while (this.stack.length > 0)
          yield* this.pop();
      }
      get sourceToken() {
        const st = {
          type: this.type,
          offset: this.offset,
          indent: this.indent,
          source: this.source
        };
        return st;
      }
      *step() {
        const top = this.peek(1);
        if (this.type === "doc-end" && top?.type !== "doc-end") {
          while (this.stack.length > 0)
            yield* this.pop();
          this.stack.push({
            type: "doc-end",
            offset: this.offset,
            source: this.source
          });
          return;
        }
        if (!top)
          return yield* this.stream();
        switch (top.type) {
          case "document":
            return yield* this.document(top);
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return yield* this.scalar(top);
          case "block-scalar":
            return yield* this.blockScalar(top);
          case "block-map":
            return yield* this.blockMap(top);
          case "block-seq":
            return yield* this.blockSequence(top);
          case "flow-collection":
            return yield* this.flowCollection(top);
          case "doc-end":
            return yield* this.documentEnd(top);
        }
        yield* this.pop();
      }
      peek(n) {
        return this.stack[this.stack.length - n];
      }
      *pop(error) {
        const token = error ?? this.stack.pop();
        if (!token) {
          const message = "Tried to pop an empty stack";
          yield { type: "error", offset: this.offset, source: "", message };
        } else if (this.stack.length === 0) {
          yield token;
        } else {
          const top = this.peek(1);
          if (token.type === "block-scalar") {
            token.indent = "indent" in top ? top.indent : 0;
          } else if (token.type === "flow-collection" && top.type === "document") {
            token.indent = 0;
          }
          if (token.type === "flow-collection")
            fixFlowSeqItems(token);
          switch (top.type) {
            case "document":
              top.value = token;
              break;
            case "block-scalar":
              top.props.push(token);
              break;
            case "block-map": {
              const it = top.items[top.items.length - 1];
              if (it.value) {
                top.items.push({ start: [], key: token, sep: [] });
                this.onKeyLine = true;
                return;
              } else if (it.sep) {
                it.value = token;
              } else {
                Object.assign(it, { key: token, sep: [] });
                this.onKeyLine = !it.explicitKey;
                return;
              }
              break;
            }
            case "block-seq": {
              const it = top.items[top.items.length - 1];
              if (it.value)
                top.items.push({ start: [], value: token });
              else
                it.value = token;
              break;
            }
            case "flow-collection": {
              const it = top.items[top.items.length - 1];
              if (!it || it.value)
                top.items.push({ start: [], key: token, sep: [] });
              else if (it.sep)
                it.value = token;
              else
                Object.assign(it, { key: token, sep: [] });
              return;
            }
            /* istanbul ignore next should not happen */
            default:
              yield* this.pop();
              yield* this.pop(token);
          }
          if ((top.type === "document" || top.type === "block-map" || top.type === "block-seq") && (token.type === "block-map" || token.type === "block-seq")) {
            const last = token.items[token.items.length - 1];
            if (last && !last.sep && !last.value && last.start.length > 0 && findNonEmptyIndex(last.start) === -1 && (token.indent === 0 || last.start.every((st) => st.type !== "comment" || st.indent < token.indent))) {
              if (top.type === "document")
                top.end = last.start;
              else
                top.items.push({ start: last.start });
              token.items.splice(-1, 1);
            }
          }
        }
      }
      *stream() {
        switch (this.type) {
          case "directive-line":
            yield { type: "directive", offset: this.offset, source: this.source };
            return;
          case "byte-order-mark":
          case "space":
          case "comment":
          case "newline":
            yield this.sourceToken;
            return;
          case "doc-mode":
          case "doc-start": {
            const doc = {
              type: "document",
              offset: this.offset,
              start: []
            };
            if (this.type === "doc-start")
              doc.start.push(this.sourceToken);
            this.stack.push(doc);
            return;
          }
        }
        yield {
          type: "error",
          offset: this.offset,
          message: `Unexpected ${this.type} token in YAML stream`,
          source: this.source
        };
      }
      *document(doc) {
        if (doc.value)
          return yield* this.lineEnd(doc);
        switch (this.type) {
          case "doc-start": {
            if (findNonEmptyIndex(doc.start) !== -1) {
              yield* this.pop();
              yield* this.step();
            } else
              doc.start.push(this.sourceToken);
            return;
          }
          case "anchor":
          case "tag":
          case "space":
          case "comment":
          case "newline":
            doc.start.push(this.sourceToken);
            return;
        }
        const bv = this.startBlockValue(doc);
        if (bv)
          this.stack.push(bv);
        else {
          yield {
            type: "error",
            offset: this.offset,
            message: `Unexpected ${this.type} token in YAML document`,
            source: this.source
          };
        }
      }
      *scalar(scalar) {
        if (this.type === "map-value-ind") {
          const prev = getPrevProps(this.peek(2));
          const start = getFirstKeyStartProps(prev);
          let sep;
          if (scalar.end) {
            sep = scalar.end;
            sep.push(this.sourceToken);
            delete scalar.end;
          } else
            sep = [this.sourceToken];
          const map = {
            type: "block-map",
            offset: scalar.offset,
            indent: scalar.indent,
            items: [{ start, key: scalar, sep }]
          };
          this.onKeyLine = true;
          this.stack[this.stack.length - 1] = map;
        } else
          yield* this.lineEnd(scalar);
      }
      *blockScalar(scalar) {
        switch (this.type) {
          case "space":
          case "comment":
          case "newline":
            scalar.props.push(this.sourceToken);
            return;
          case "scalar":
            scalar.source = this.source;
            this.atNewLine = true;
            this.indent = 0;
            if (this.onNewLine) {
              let nl = this.source.indexOf("\n") + 1;
              while (nl !== 0) {
                this.onNewLine(this.offset + nl);
                nl = this.source.indexOf("\n", nl) + 1;
              }
            }
            yield* this.pop();
            break;
          /* istanbul ignore next should not happen */
          default:
            yield* this.pop();
            yield* this.step();
        }
      }
      *blockMap(map) {
        const it = map.items[map.items.length - 1];
        switch (this.type) {
          case "newline":
            this.onKeyLine = false;
            if (it.value) {
              const end = "end" in it.value ? it.value.end : void 0;
              const last = Array.isArray(end) ? end[end.length - 1] : void 0;
              if (last?.type === "comment")
                end?.push(this.sourceToken);
              else
                map.items.push({ start: [this.sourceToken] });
            } else if (it.sep) {
              it.sep.push(this.sourceToken);
            } else {
              it.start.push(this.sourceToken);
            }
            return;
          case "space":
          case "comment":
            if (it.value) {
              map.items.push({ start: [this.sourceToken] });
            } else if (it.sep) {
              it.sep.push(this.sourceToken);
            } else {
              if (this.atIndentedComment(it.start, map.indent)) {
                const prev = map.items[map.items.length - 2];
                const end = prev?.value?.end;
                if (Array.isArray(end)) {
                  arrayPushArray(end, it.start);
                  end.push(this.sourceToken);
                  map.items.pop();
                  return;
                }
              }
              it.start.push(this.sourceToken);
            }
            return;
        }
        if (this.indent >= map.indent) {
          const atMapIndent = !this.onKeyLine && this.indent === map.indent;
          const atNextItem = atMapIndent && (it.sep || it.explicitKey) && this.type !== "seq-item-ind";
          let start = [];
          if (atNextItem && it.sep && !it.value) {
            const nl = [];
            for (let i3 = 0; i3 < it.sep.length; ++i3) {
              const st = it.sep[i3];
              switch (st.type) {
                case "newline":
                  nl.push(i3);
                  break;
                case "space":
                  break;
                case "comment":
                  if (st.indent > map.indent)
                    nl.length = 0;
                  break;
                default:
                  nl.length = 0;
              }
            }
            if (nl.length >= 2)
              start = it.sep.splice(nl[1]);
          }
          switch (this.type) {
            case "anchor":
            case "tag":
              if (atNextItem || it.value) {
                start.push(this.sourceToken);
                map.items.push({ start });
                this.onKeyLine = true;
              } else if (it.sep) {
                it.sep.push(this.sourceToken);
              } else {
                it.start.push(this.sourceToken);
              }
              return;
            case "explicit-key-ind":
              if (!it.sep && !it.explicitKey) {
                it.start.push(this.sourceToken);
                it.explicitKey = true;
              } else if (atNextItem || it.value) {
                start.push(this.sourceToken);
                map.items.push({ start, explicitKey: true });
              } else {
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: [this.sourceToken], explicitKey: true }]
                });
              }
              this.onKeyLine = true;
              return;
            case "map-value-ind":
              if (it.explicitKey) {
                if (!it.sep) {
                  if (includesToken(it.start, "newline")) {
                    Object.assign(it, { key: null, sep: [this.sourceToken] });
                  } else {
                    const start2 = getFirstKeyStartProps(it.start);
                    this.stack.push({
                      type: "block-map",
                      offset: this.offset,
                      indent: this.indent,
                      items: [{ start: start2, key: null, sep: [this.sourceToken] }]
                    });
                  }
                } else if (it.value) {
                  map.items.push({ start: [], key: null, sep: [this.sourceToken] });
                } else if (includesToken(it.sep, "map-value-ind")) {
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start, key: null, sep: [this.sourceToken] }]
                  });
                } else if (isFlowToken(it.key) && !includesToken(it.sep, "newline")) {
                  const start2 = getFirstKeyStartProps(it.start);
                  const key = it.key;
                  const sep = it.sep;
                  sep.push(this.sourceToken);
                  delete it.key;
                  delete it.sep;
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: start2, key, sep }]
                  });
                } else if (start.length > 0) {
                  it.sep = it.sep.concat(start, this.sourceToken);
                } else {
                  it.sep.push(this.sourceToken);
                }
              } else {
                if (!it.sep) {
                  Object.assign(it, { key: null, sep: [this.sourceToken] });
                } else if (it.value || atNextItem) {
                  map.items.push({ start, key: null, sep: [this.sourceToken] });
                } else if (includesToken(it.sep, "map-value-ind")) {
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: [], key: null, sep: [this.sourceToken] }]
                  });
                } else {
                  it.sep.push(this.sourceToken);
                }
              }
              this.onKeyLine = true;
              return;
            case "alias":
            case "scalar":
            case "single-quoted-scalar":
            case "double-quoted-scalar": {
              const fs = this.flowScalar(this.type);
              if (atNextItem || it.value) {
                map.items.push({ start, key: fs, sep: [] });
                this.onKeyLine = true;
              } else if (it.sep) {
                this.stack.push(fs);
              } else {
                Object.assign(it, { key: fs, sep: [] });
                this.onKeyLine = true;
              }
              return;
            }
            default: {
              const bv = this.startBlockValue(map);
              if (bv) {
                if (bv.type === "block-seq") {
                  if (!it.explicitKey && it.sep && !includesToken(it.sep, "newline")) {
                    yield* this.pop({
                      type: "error",
                      offset: this.offset,
                      message: "Unexpected block-seq-ind on same line with key",
                      source: this.source
                    });
                    return;
                  }
                } else if (atMapIndent) {
                  map.items.push({ start });
                }
                this.stack.push(bv);
                return;
              }
            }
          }
        }
        yield* this.pop();
        yield* this.step();
      }
      *blockSequence(seq) {
        const it = seq.items[seq.items.length - 1];
        switch (this.type) {
          case "newline":
            if (it.value) {
              const end = "end" in it.value ? it.value.end : void 0;
              const last = Array.isArray(end) ? end[end.length - 1] : void 0;
              if (last?.type === "comment")
                end?.push(this.sourceToken);
              else
                seq.items.push({ start: [this.sourceToken] });
            } else
              it.start.push(this.sourceToken);
            return;
          case "space":
          case "comment":
            if (it.value)
              seq.items.push({ start: [this.sourceToken] });
            else {
              if (this.atIndentedComment(it.start, seq.indent)) {
                const prev = seq.items[seq.items.length - 2];
                const end = prev?.value?.end;
                if (Array.isArray(end)) {
                  arrayPushArray(end, it.start);
                  end.push(this.sourceToken);
                  seq.items.pop();
                  return;
                }
              }
              it.start.push(this.sourceToken);
            }
            return;
          case "anchor":
          case "tag":
            if (it.value || this.indent <= seq.indent)
              break;
            it.start.push(this.sourceToken);
            return;
          case "seq-item-ind":
            if (this.indent !== seq.indent)
              break;
            if (it.value || includesToken(it.start, "seq-item-ind"))
              seq.items.push({ start: [this.sourceToken] });
            else
              it.start.push(this.sourceToken);
            return;
        }
        if (this.indent > seq.indent) {
          const bv = this.startBlockValue(seq);
          if (bv) {
            this.stack.push(bv);
            return;
          }
        }
        yield* this.pop();
        yield* this.step();
      }
      *flowCollection(fc) {
        const it = fc.items[fc.items.length - 1];
        if (this.type === "flow-error-end") {
          let top;
          do {
            yield* this.pop();
            top = this.peek(1);
          } while (top?.type === "flow-collection");
        } else if (fc.end.length === 0) {
          switch (this.type) {
            case "comma":
            case "explicit-key-ind":
              if (!it || it.sep)
                fc.items.push({ start: [this.sourceToken] });
              else
                it.start.push(this.sourceToken);
              return;
            case "map-value-ind":
              if (!it || it.value)
                fc.items.push({ start: [], key: null, sep: [this.sourceToken] });
              else if (it.sep)
                it.sep.push(this.sourceToken);
              else
                Object.assign(it, { key: null, sep: [this.sourceToken] });
              return;
            case "space":
            case "comment":
            case "newline":
            case "anchor":
            case "tag":
              if (!it || it.value)
                fc.items.push({ start: [this.sourceToken] });
              else if (it.sep)
                it.sep.push(this.sourceToken);
              else
                it.start.push(this.sourceToken);
              return;
            case "alias":
            case "scalar":
            case "single-quoted-scalar":
            case "double-quoted-scalar": {
              const fs = this.flowScalar(this.type);
              if (!it || it.value)
                fc.items.push({ start: [], key: fs, sep: [] });
              else if (it.sep)
                this.stack.push(fs);
              else
                Object.assign(it, { key: fs, sep: [] });
              return;
            }
            case "flow-map-end":
            case "flow-seq-end":
              fc.end.push(this.sourceToken);
              return;
          }
          const bv = this.startBlockValue(fc);
          if (bv)
            this.stack.push(bv);
          else {
            yield* this.pop();
            yield* this.step();
          }
        } else {
          const parent = this.peek(2);
          if (parent.type === "block-map" && (this.type === "map-value-ind" && parent.indent === fc.indent || this.type === "newline" && !parent.items[parent.items.length - 1].sep)) {
            yield* this.pop();
            yield* this.step();
          } else if (this.type === "map-value-ind" && parent.type !== "flow-collection") {
            const prev = getPrevProps(parent);
            const start = getFirstKeyStartProps(prev);
            fixFlowSeqItems(fc);
            const sep = fc.end.splice(1, fc.end.length);
            sep.push(this.sourceToken);
            const map = {
              type: "block-map",
              offset: fc.offset,
              indent: fc.indent,
              items: [{ start, key: fc, sep }]
            };
            this.onKeyLine = true;
            this.stack[this.stack.length - 1] = map;
          } else {
            yield* this.lineEnd(fc);
          }
        }
      }
      flowScalar(type) {
        if (this.onNewLine) {
          let nl = this.source.indexOf("\n") + 1;
          while (nl !== 0) {
            this.onNewLine(this.offset + nl);
            nl = this.source.indexOf("\n", nl) + 1;
          }
        }
        return {
          type,
          offset: this.offset,
          indent: this.indent,
          source: this.source
        };
      }
      startBlockValue(parent) {
        switch (this.type) {
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return this.flowScalar(this.type);
          case "block-scalar-header":
            return {
              type: "block-scalar",
              offset: this.offset,
              indent: this.indent,
              props: [this.sourceToken],
              source: ""
            };
          case "flow-map-start":
          case "flow-seq-start":
            return {
              type: "flow-collection",
              offset: this.offset,
              indent: this.indent,
              start: this.sourceToken,
              items: [],
              end: []
            };
          case "seq-item-ind":
            return {
              type: "block-seq",
              offset: this.offset,
              indent: this.indent,
              items: [{ start: [this.sourceToken] }]
            };
          case "explicit-key-ind": {
            this.onKeyLine = true;
            const prev = getPrevProps(parent);
            const start = getFirstKeyStartProps(prev);
            start.push(this.sourceToken);
            return {
              type: "block-map",
              offset: this.offset,
              indent: this.indent,
              items: [{ start, explicitKey: true }]
            };
          }
          case "map-value-ind": {
            this.onKeyLine = true;
            const prev = getPrevProps(parent);
            const start = getFirstKeyStartProps(prev);
            return {
              type: "block-map",
              offset: this.offset,
              indent: this.indent,
              items: [{ start, key: null, sep: [this.sourceToken] }]
            };
          }
        }
        return null;
      }
      atIndentedComment(start, indent) {
        if (this.type !== "comment")
          return false;
        if (this.indent <= indent)
          return false;
        return start.every((st) => st.type === "newline" || st.type === "space");
      }
      *documentEnd(docEnd) {
        if (this.type !== "doc-mode") {
          if (docEnd.end)
            docEnd.end.push(this.sourceToken);
          else
            docEnd.end = [this.sourceToken];
          if (this.type === "newline")
            yield* this.pop();
        }
      }
      *lineEnd(token) {
        switch (this.type) {
          case "comma":
          case "doc-start":
          case "doc-end":
          case "flow-seq-end":
          case "flow-map-end":
          case "map-value-ind":
            yield* this.pop();
            yield* this.step();
            break;
          case "newline":
            this.onKeyLine = false;
          // fallthrough
          case "space":
          case "comment":
          default:
            if (token.end)
              token.end.push(this.sourceToken);
            else
              token.end = [this.sourceToken];
            if (this.type === "newline")
              yield* this.pop();
        }
      }
    };
    exports.Parser = Parser;
  }
});

// node_modules/yaml/dist/public-api.js
var require_public_api = __commonJS({
  "node_modules/yaml/dist/public-api.js"(exports) {
    "use strict";
    var composer = require_composer();
    var Document = require_Document();
    var errors = require_errors();
    var log2 = require_log();
    var identity = require_identity();
    var lineCounter = require_line_counter();
    var parser = require_parser();
    function parseOptions(options) {
      const prettyErrors = options.prettyErrors !== false;
      const lineCounter$1 = options.lineCounter || prettyErrors && new lineCounter.LineCounter() || null;
      return { lineCounter: lineCounter$1, prettyErrors };
    }
    function parseAllDocuments(source, options = {}) {
      const { lineCounter: lineCounter2, prettyErrors } = parseOptions(options);
      const parser$1 = new parser.Parser(lineCounter2?.addNewLine);
      const composer$1 = new composer.Composer(options);
      const docs = Array.from(composer$1.compose(parser$1.parse(source)));
      if (prettyErrors && lineCounter2)
        for (const doc of docs) {
          doc.errors.forEach(errors.prettifyError(source, lineCounter2));
          doc.warnings.forEach(errors.prettifyError(source, lineCounter2));
        }
      if (docs.length > 0)
        return docs;
      return Object.assign([], { empty: true }, composer$1.streamInfo());
    }
    function parseDocument(source, options = {}) {
      const { lineCounter: lineCounter2, prettyErrors } = parseOptions(options);
      const parser$1 = new parser.Parser(lineCounter2?.addNewLine);
      const composer$1 = new composer.Composer(options);
      let doc = null;
      for (const _doc of composer$1.compose(parser$1.parse(source), true, source.length)) {
        if (!doc)
          doc = _doc;
        else if (doc.options.logLevel !== "silent") {
          doc.errors.push(new errors.YAMLParseError(_doc.range.slice(0, 2), "MULTIPLE_DOCS", "Source contains multiple documents; please use YAML.parseAllDocuments()"));
          break;
        }
      }
      if (prettyErrors && lineCounter2) {
        doc.errors.forEach(errors.prettifyError(source, lineCounter2));
        doc.warnings.forEach(errors.prettifyError(source, lineCounter2));
      }
      return doc;
    }
    function parse6(src, reviver, options) {
      let _reviver = void 0;
      if (typeof reviver === "function") {
        _reviver = reviver;
      } else if (options === void 0 && reviver && typeof reviver === "object") {
        options = reviver;
      }
      const doc = parseDocument(src, options);
      if (!doc)
        return null;
      doc.warnings.forEach((warning) => log2.warn(doc.options.logLevel, warning));
      if (doc.errors.length > 0) {
        if (doc.options.logLevel !== "silent")
          throw doc.errors[0];
        else
          doc.errors = [];
      }
      return doc.toJS(Object.assign({ reviver: _reviver }, options));
    }
    function stringify(value, replacer, options) {
      let _replacer = null;
      if (typeof replacer === "function" || Array.isArray(replacer)) {
        _replacer = replacer;
      } else if (options === void 0 && replacer) {
        options = replacer;
      }
      if (typeof options === "string")
        options = options.length;
      if (typeof options === "number") {
        const indent = Math.round(options);
        options = indent < 1 ? void 0 : indent > 8 ? { indent: 8 } : { indent };
      }
      if (value === void 0) {
        const { keepUndefined } = options ?? replacer ?? {};
        if (!keepUndefined)
          return void 0;
      }
      if (identity.isDocument(value) && !_replacer)
        return value.toString(options);
      return new Document.Document(value, _replacer, options).toString(options);
    }
    exports.parse = parse6;
    exports.parseAllDocuments = parseAllDocuments;
    exports.parseDocument = parseDocument;
    exports.stringify = stringify;
  }
});

// node_modules/yaml/dist/index.js
var require_dist = __commonJS({
  "node_modules/yaml/dist/index.js"(exports) {
    "use strict";
    var composer = require_composer();
    var Document = require_Document();
    var Schema = require_Schema();
    var errors = require_errors();
    var Alias = require_Alias();
    var identity = require_identity();
    var Pair = require_Pair();
    var Scalar = require_Scalar();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var cst = require_cst();
    var lexer = require_lexer();
    var lineCounter = require_line_counter();
    var parser = require_parser();
    var publicApi = require_public_api();
    var visit = require_visit();
    exports.Composer = composer.Composer;
    exports.Document = Document.Document;
    exports.Schema = Schema.Schema;
    exports.YAMLError = errors.YAMLError;
    exports.YAMLParseError = errors.YAMLParseError;
    exports.YAMLWarning = errors.YAMLWarning;
    exports.Alias = Alias.Alias;
    exports.isAlias = identity.isAlias;
    exports.isCollection = identity.isCollection;
    exports.isDocument = identity.isDocument;
    exports.isMap = identity.isMap;
    exports.isNode = identity.isNode;
    exports.isPair = identity.isPair;
    exports.isScalar = identity.isScalar;
    exports.isSeq = identity.isSeq;
    exports.Pair = Pair.Pair;
    exports.Scalar = Scalar.Scalar;
    exports.YAMLMap = YAMLMap.YAMLMap;
    exports.YAMLSeq = YAMLSeq.YAMLSeq;
    exports.CST = cst;
    exports.Lexer = lexer.Lexer;
    exports.LineCounter = lineCounter.LineCounter;
    exports.Parser = parser.Parser;
    exports.parse = publicApi.parse;
    exports.parseAllDocuments = publicApi.parseAllDocuments;
    exports.parseDocument = publicApi.parseDocument;
    exports.stringify = publicApi.stringify;
    exports.visit = visit.visit;
    exports.visitAsync = visit.visitAsync;
  }
});

// src/main.ts
import { appendFileSync } from "node:fs";
import crypto from "node:crypto";

// src/secrets.ts
function setSecret(value) {
  if (!value) return;
  process.stdout.write(`::add-mask::${value}
`);
}

// src/config.ts
var import_yaml = __toESM(require_dist(), 1);
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

// node_modules/nostr-tools/node_modules/@noble/hashes/utils.js
function isBytes(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
function anumber(n, title = "") {
  if (!Number.isSafeInteger(n) || n < 0) {
    const prefix = title && `"${title}" `;
    throw new Error(`${prefix}expected integer >= 0, got ${n}`);
  }
}
function abytes(value, length, title = "") {
  const bytes = isBytes(value);
  const len = value?.length;
  const needsLen = length !== void 0;
  if (!bytes || needsLen && len !== length) {
    const prefix = title && `"${title}" `;
    const ofLen = needsLen ? ` of length ${length}` : "";
    const got = bytes ? `length=${len}` : `type=${typeof value}`;
    throw new Error(prefix + "expected Uint8Array" + ofLen + ", got " + got);
  }
  return value;
}
function ahash(h) {
  if (typeof h !== "function" || typeof h.create !== "function")
    throw new Error("Hash must wrapped by utils.createHasher");
  anumber(h.outputLen);
  anumber(h.blockLen);
}
function aexists(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called");
}
function aoutput(out, instance) {
  abytes(out, void 0, "digestInto() output");
  const min = instance.outputLen;
  if (out.length < min) {
    throw new Error('"digestInto() output" expected to be of length >=' + min);
  }
}
function clean(...arrays) {
  for (let i3 = 0; i3 < arrays.length; i3++) {
    arrays[i3].fill(0);
  }
}
function createView(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
function rotr(word, shift) {
  return word << 32 - shift | word >>> shift;
}
var hasHexBuiltin = /* @__PURE__ */ (() => (
  // @ts-ignore
  typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function"
))();
var hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i3) => i3.toString(16).padStart(2, "0"));
function bytesToHex(bytes) {
  abytes(bytes);
  if (hasHexBuiltin)
    return bytes.toHex();
  let hex = "";
  for (let i3 = 0; i3 < bytes.length; i3++) {
    hex += hexes[bytes[i3]];
  }
  return hex;
}
var asciis = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
function asciiToBase16(ch) {
  if (ch >= asciis._0 && ch <= asciis._9)
    return ch - asciis._0;
  if (ch >= asciis.A && ch <= asciis.F)
    return ch - (asciis.A - 10);
  if (ch >= asciis.a && ch <= asciis.f)
    return ch - (asciis.a - 10);
  return;
}
function hexToBytes(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex);
  if (hasHexBuiltin)
    return Uint8Array.fromHex(hex);
  const hl = hex.length;
  const al = hl / 2;
  if (hl % 2)
    throw new Error("hex string expected, got unpadded hex of length " + hl);
  const array = new Uint8Array(al);
  for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
    const n1 = asciiToBase16(hex.charCodeAt(hi));
    const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
    if (n1 === void 0 || n2 === void 0) {
      const char = hex[hi] + hex[hi + 1];
      throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
    }
    array[ai] = n1 * 16 + n2;
  }
  return array;
}
function concatBytes(...arrays) {
  let sum = 0;
  for (let i3 = 0; i3 < arrays.length; i3++) {
    const a = arrays[i3];
    abytes(a);
    sum += a.length;
  }
  const res = new Uint8Array(sum);
  for (let i3 = 0, pad2 = 0; i3 < arrays.length; i3++) {
    const a = arrays[i3];
    res.set(a, pad2);
    pad2 += a.length;
  }
  return res;
}
function createHasher(hashCons, info = {}) {
  const hashC = (msg, opts) => hashCons(opts).update(msg).digest();
  const tmp = hashCons(void 0);
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = (opts) => hashCons(opts);
  Object.assign(hashC, info);
  return Object.freeze(hashC);
}
function randomBytes(bytesLength = 32) {
  const cr = typeof globalThis === "object" ? globalThis.crypto : null;
  if (typeof cr?.getRandomValues !== "function")
    throw new Error("crypto.getRandomValues must be defined");
  return cr.getRandomValues(new Uint8Array(bytesLength));
}
var oidNist = (suffix) => ({
  oid: Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, suffix])
});

// node_modules/nostr-tools/node_modules/@noble/hashes/_md.js
function Chi(a, b, c) {
  return a & b ^ ~a & c;
}
function Maj(a, b, c) {
  return a & b ^ a & c ^ b & c;
}
var HashMD = class {
  blockLen;
  outputLen;
  padOffset;
  isLE;
  // For partial updates less than block size
  buffer;
  view;
  finished = false;
  length = 0;
  pos = 0;
  destroyed = false;
  constructor(blockLen, outputLen, padOffset, isLE2) {
    this.blockLen = blockLen;
    this.outputLen = outputLen;
    this.padOffset = padOffset;
    this.isLE = isLE2;
    this.buffer = new Uint8Array(blockLen);
    this.view = createView(this.buffer);
  }
  update(data) {
    aexists(this);
    abytes(data);
    const { view, buffer, blockLen } = this;
    const len = data.length;
    for (let pos = 0; pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      if (take === blockLen) {
        const dataView = createView(data);
        for (; blockLen <= len - pos; pos += blockLen)
          this.process(dataView, pos);
        continue;
      }
      buffer.set(data.subarray(pos, pos + take), this.pos);
      this.pos += take;
      pos += take;
      if (this.pos === blockLen) {
        this.process(view, 0);
        this.pos = 0;
      }
    }
    this.length += data.length;
    this.roundClean();
    return this;
  }
  digestInto(out) {
    aexists(this);
    aoutput(out, this);
    this.finished = true;
    const { buffer, view, blockLen, isLE: isLE2 } = this;
    let { pos } = this;
    buffer[pos++] = 128;
    clean(this.buffer.subarray(pos));
    if (this.padOffset > blockLen - pos) {
      this.process(view, 0);
      pos = 0;
    }
    for (let i3 = pos; i3 < blockLen; i3++)
      buffer[i3] = 0;
    view.setBigUint64(blockLen - 8, BigInt(this.length * 8), isLE2);
    this.process(view, 0);
    const oview = createView(out);
    const len = this.outputLen;
    if (len % 4)
      throw new Error("_sha2: outputLen must be aligned to 32bit");
    const outLen = len / 4;
    const state = this.get();
    if (outLen > state.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let i3 = 0; i3 < outLen; i3++)
      oview.setUint32(4 * i3, state[i3], isLE2);
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
  _cloneInto(to) {
    to ||= new this.constructor();
    to.set(...this.get());
    const { blockLen, buffer, length, finished, destroyed, pos } = this;
    to.destroyed = destroyed;
    to.finished = finished;
    to.length = length;
    to.pos = pos;
    if (length % blockLen)
      to.buffer.set(buffer);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
};
var SHA256_IV = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]);

// node_modules/nostr-tools/node_modules/@noble/hashes/sha2.js
var SHA256_K = /* @__PURE__ */ Uint32Array.from([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
var SHA256_W = /* @__PURE__ */ new Uint32Array(64);
var SHA2_32B = class extends HashMD {
  constructor(outputLen) {
    super(64, outputLen, 8, false);
  }
  get() {
    const { A, B, C, D, E, F, G, H } = this;
    return [A, B, C, D, E, F, G, H];
  }
  // prettier-ignore
  set(A, B, C, D, E, F, G, H) {
    this.A = A | 0;
    this.B = B | 0;
    this.C = C | 0;
    this.D = D | 0;
    this.E = E | 0;
    this.F = F | 0;
    this.G = G | 0;
    this.H = H | 0;
  }
  process(view, offset) {
    for (let i3 = 0; i3 < 16; i3++, offset += 4)
      SHA256_W[i3] = view.getUint32(offset, false);
    for (let i3 = 16; i3 < 64; i3++) {
      const W15 = SHA256_W[i3 - 15];
      const W2 = SHA256_W[i3 - 2];
      const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
      const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
      SHA256_W[i3] = s1 + SHA256_W[i3 - 7] + s0 + SHA256_W[i3 - 16] | 0;
    }
    let { A, B, C, D, E, F, G, H } = this;
    for (let i3 = 0; i3 < 64; i3++) {
      const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
      const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i3] + SHA256_W[i3] | 0;
      const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
      const T2 = sigma0 + Maj(A, B, C) | 0;
      H = G;
      G = F;
      F = E;
      E = D + T1 | 0;
      D = C;
      C = B;
      B = A;
      A = T1 + T2 | 0;
    }
    A = A + this.A | 0;
    B = B + this.B | 0;
    C = C + this.C | 0;
    D = D + this.D | 0;
    E = E + this.E | 0;
    F = F + this.F | 0;
    G = G + this.G | 0;
    H = H + this.H | 0;
    this.set(A, B, C, D, E, F, G, H);
  }
  roundClean() {
    clean(SHA256_W);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0);
    clean(this.buffer);
  }
};
var _SHA256 = class extends SHA2_32B {
  // We cannot use array here since array allows indexing by variable
  // which means optimizer/compiler cannot use registers.
  A = SHA256_IV[0] | 0;
  B = SHA256_IV[1] | 0;
  C = SHA256_IV[2] | 0;
  D = SHA256_IV[3] | 0;
  E = SHA256_IV[4] | 0;
  F = SHA256_IV[5] | 0;
  G = SHA256_IV[6] | 0;
  H = SHA256_IV[7] | 0;
  constructor() {
    super(32);
  }
};
var sha256 = /* @__PURE__ */ createHasher(
  () => new _SHA256(),
  /* @__PURE__ */ oidNist(1)
);

// node_modules/nostr-tools/node_modules/@noble/curves/utils.js
var _0n = /* @__PURE__ */ BigInt(0);
var _1n = /* @__PURE__ */ BigInt(1);
function abool(value, title = "") {
  if (typeof value !== "boolean") {
    const prefix = title && `"${title}" `;
    throw new Error(prefix + "expected boolean, got type=" + typeof value);
  }
  return value;
}
function abignumber(n) {
  if (typeof n === "bigint") {
    if (!isPosBig(n))
      throw new Error("positive bigint expected, got " + n);
  } else
    anumber(n);
  return n;
}
function numberToHexUnpadded(num2) {
  const hex = abignumber(num2).toString(16);
  return hex.length & 1 ? "0" + hex : hex;
}
function hexToNumber(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex);
  return hex === "" ? _0n : BigInt("0x" + hex);
}
function bytesToNumberBE(bytes) {
  return hexToNumber(bytesToHex(bytes));
}
function bytesToNumberLE(bytes) {
  return hexToNumber(bytesToHex(copyBytes(abytes(bytes)).reverse()));
}
function numberToBytesBE(n, len) {
  anumber(len);
  n = abignumber(n);
  const res = hexToBytes(n.toString(16).padStart(len * 2, "0"));
  if (res.length !== len)
    throw new Error("number too large");
  return res;
}
function numberToBytesLE(n, len) {
  return numberToBytesBE(n, len).reverse();
}
function copyBytes(bytes) {
  return Uint8Array.from(bytes);
}
function asciiToBytes(ascii) {
  return Uint8Array.from(ascii, (c, i3) => {
    const charCode = c.charCodeAt(0);
    if (c.length !== 1 || charCode > 127) {
      throw new Error(`string contains non-ASCII character "${ascii[i3]}" with code ${charCode} at position ${i3}`);
    }
    return charCode;
  });
}
var isPosBig = (n) => typeof n === "bigint" && _0n <= n;
function inRange(n, min, max2) {
  return isPosBig(n) && isPosBig(min) && isPosBig(max2) && min <= n && n < max2;
}
function aInRange(title, n, min, max2) {
  if (!inRange(n, min, max2))
    throw new Error("expected valid " + title + ": " + min + " <= n < " + max2 + ", got " + n);
}
function bitLen(n) {
  let len;
  for (len = 0; n > _0n; n >>= _1n, len += 1)
    ;
  return len;
}
var bitMask = (n) => (_1n << BigInt(n)) - _1n;
function createHmacDrbg(hashLen, qByteLen, hmacFn) {
  anumber(hashLen, "hashLen");
  anumber(qByteLen, "qByteLen");
  if (typeof hmacFn !== "function")
    throw new Error("hmacFn must be a function");
  const u8n = (len) => new Uint8Array(len);
  const NULL = Uint8Array.of();
  const byte0 = Uint8Array.of(0);
  const byte1 = Uint8Array.of(1);
  const _maxDrbgIters = 1e3;
  let v = u8n(hashLen);
  let k = u8n(hashLen);
  let i3 = 0;
  const reset = () => {
    v.fill(1);
    k.fill(0);
    i3 = 0;
  };
  const h = (...msgs) => hmacFn(k, concatBytes(v, ...msgs));
  const reseed = (seed = NULL) => {
    k = h(byte0, seed);
    v = h();
    if (seed.length === 0)
      return;
    k = h(byte1, seed);
    v = h();
  };
  const gen = () => {
    if (i3++ >= _maxDrbgIters)
      throw new Error("drbg: tried max amount of iterations");
    let len = 0;
    const out = [];
    while (len < qByteLen) {
      v = h();
      const sl = v.slice();
      out.push(sl);
      len += v.length;
    }
    return concatBytes(...out);
  };
  const genUntil = (seed, pred) => {
    reset();
    reseed(seed);
    let res = void 0;
    while (!(res = pred(gen())))
      reseed();
    reset();
    return res;
  };
  return genUntil;
}
function validateObject(object, fields = {}, optFields = {}) {
  if (!object || typeof object !== "object")
    throw new Error("expected valid options object");
  function checkField(fieldName, expectedType, isOpt) {
    const val = object[fieldName];
    if (isOpt && val === void 0)
      return;
    const current = typeof val;
    if (current !== expectedType || val === null)
      throw new Error(`param "${fieldName}" is invalid: expected ${expectedType}, got ${current}`);
  }
  const iter = (f, isOpt) => Object.entries(f).forEach(([k, v]) => checkField(k, v, isOpt));
  iter(fields, false);
  iter(optFields, true);
}
function memoized(fn) {
  const map = /* @__PURE__ */ new WeakMap();
  return (arg, ...args) => {
    const val = map.get(arg);
    if (val !== void 0)
      return val;
    const computed = fn(arg, ...args);
    map.set(arg, computed);
    return computed;
  };
}

// node_modules/nostr-tools/node_modules/@noble/curves/abstract/modular.js
var _0n2 = /* @__PURE__ */ BigInt(0);
var _1n2 = /* @__PURE__ */ BigInt(1);
var _2n = /* @__PURE__ */ BigInt(2);
var _3n = /* @__PURE__ */ BigInt(3);
var _4n = /* @__PURE__ */ BigInt(4);
var _5n = /* @__PURE__ */ BigInt(5);
var _7n = /* @__PURE__ */ BigInt(7);
var _8n = /* @__PURE__ */ BigInt(8);
var _9n = /* @__PURE__ */ BigInt(9);
var _16n = /* @__PURE__ */ BigInt(16);
function mod(a, b) {
  const result = a % b;
  return result >= _0n2 ? result : b + result;
}
function pow2(x2, power, modulo) {
  let res = x2;
  while (power-- > _0n2) {
    res *= res;
    res %= modulo;
  }
  return res;
}
function invert(number, modulo) {
  if (number === _0n2)
    throw new Error("invert: expected non-zero number");
  if (modulo <= _0n2)
    throw new Error("invert: expected positive modulus, got " + modulo);
  let a = mod(number, modulo);
  let b = modulo;
  let x2 = _0n2, y = _1n2, u = _1n2, v = _0n2;
  while (a !== _0n2) {
    const q = b / a;
    const r = b % a;
    const m = x2 - u * q;
    const n = y - v * q;
    b = a, a = r, x2 = u, y = v, u = m, v = n;
  }
  const gcd2 = b;
  if (gcd2 !== _1n2)
    throw new Error("invert: does not exist");
  return mod(x2, modulo);
}
function assertIsSquare(Fp, root, n) {
  if (!Fp.eql(Fp.sqr(root), n))
    throw new Error("Cannot find square root");
}
function sqrt3mod4(Fp, n) {
  const p1div4 = (Fp.ORDER + _1n2) / _4n;
  const root = Fp.pow(n, p1div4);
  assertIsSquare(Fp, root, n);
  return root;
}
function sqrt5mod8(Fp, n) {
  const p5div8 = (Fp.ORDER - _5n) / _8n;
  const n2 = Fp.mul(n, _2n);
  const v = Fp.pow(n2, p5div8);
  const nv = Fp.mul(n, v);
  const i3 = Fp.mul(Fp.mul(nv, _2n), v);
  const root = Fp.mul(nv, Fp.sub(i3, Fp.ONE));
  assertIsSquare(Fp, root, n);
  return root;
}
function sqrt9mod16(P) {
  const Fp_ = Field(P);
  const tn = tonelliShanks(P);
  const c1 = tn(Fp_, Fp_.neg(Fp_.ONE));
  const c2 = tn(Fp_, c1);
  const c3 = tn(Fp_, Fp_.neg(c1));
  const c4 = (P + _7n) / _16n;
  return (Fp, n) => {
    let tv1 = Fp.pow(n, c4);
    let tv2 = Fp.mul(tv1, c1);
    const tv3 = Fp.mul(tv1, c2);
    const tv4 = Fp.mul(tv1, c3);
    const e1 = Fp.eql(Fp.sqr(tv2), n);
    const e2 = Fp.eql(Fp.sqr(tv3), n);
    tv1 = Fp.cmov(tv1, tv2, e1);
    tv2 = Fp.cmov(tv4, tv3, e2);
    const e3 = Fp.eql(Fp.sqr(tv2), n);
    const root = Fp.cmov(tv1, tv2, e3);
    assertIsSquare(Fp, root, n);
    return root;
  };
}
function tonelliShanks(P) {
  if (P < _3n)
    throw new Error("sqrt is not defined for small field");
  let Q = P - _1n2;
  let S = 0;
  while (Q % _2n === _0n2) {
    Q /= _2n;
    S++;
  }
  let Z = _2n;
  const _Fp = Field(P);
  while (FpLegendre(_Fp, Z) === 1) {
    if (Z++ > 1e3)
      throw new Error("Cannot find square root: probably non-prime P");
  }
  if (S === 1)
    return sqrt3mod4;
  let cc = _Fp.pow(Z, Q);
  const Q1div2 = (Q + _1n2) / _2n;
  return function tonelliSlow(Fp, n) {
    if (Fp.is0(n))
      return n;
    if (FpLegendre(Fp, n) !== 1)
      throw new Error("Cannot find square root");
    let M2 = S;
    let c = Fp.mul(Fp.ONE, cc);
    let t = Fp.pow(n, Q);
    let R = Fp.pow(n, Q1div2);
    while (!Fp.eql(t, Fp.ONE)) {
      if (Fp.is0(t))
        return Fp.ZERO;
      let i3 = 1;
      let t_tmp = Fp.sqr(t);
      while (!Fp.eql(t_tmp, Fp.ONE)) {
        i3++;
        t_tmp = Fp.sqr(t_tmp);
        if (i3 === M2)
          throw new Error("Cannot find square root");
      }
      const exponent = _1n2 << BigInt(M2 - i3 - 1);
      const b = Fp.pow(c, exponent);
      M2 = i3;
      c = Fp.sqr(b);
      t = Fp.mul(t, c);
      R = Fp.mul(R, b);
    }
    return R;
  };
}
function FpSqrt(P) {
  if (P % _4n === _3n)
    return sqrt3mod4;
  if (P % _8n === _5n)
    return sqrt5mod8;
  if (P % _16n === _9n)
    return sqrt9mod16(P);
  return tonelliShanks(P);
}
var FIELD_FIELDS = [
  "create",
  "isValid",
  "is0",
  "neg",
  "inv",
  "sqrt",
  "sqr",
  "eql",
  "add",
  "sub",
  "mul",
  "pow",
  "div",
  "addN",
  "subN",
  "mulN",
  "sqrN"
];
function validateField(field) {
  const initial = {
    ORDER: "bigint",
    BYTES: "number",
    BITS: "number"
  };
  const opts = FIELD_FIELDS.reduce((map, val) => {
    map[val] = "function";
    return map;
  }, initial);
  validateObject(field, opts);
  return field;
}
function FpPow(Fp, num2, power) {
  if (power < _0n2)
    throw new Error("invalid exponent, negatives unsupported");
  if (power === _0n2)
    return Fp.ONE;
  if (power === _1n2)
    return num2;
  let p = Fp.ONE;
  let d = num2;
  while (power > _0n2) {
    if (power & _1n2)
      p = Fp.mul(p, d);
    d = Fp.sqr(d);
    power >>= _1n2;
  }
  return p;
}
function FpInvertBatch(Fp, nums, passZero = false) {
  const inverted = new Array(nums.length).fill(passZero ? Fp.ZERO : void 0);
  const multipliedAcc = nums.reduce((acc, num2, i3) => {
    if (Fp.is0(num2))
      return acc;
    inverted[i3] = acc;
    return Fp.mul(acc, num2);
  }, Fp.ONE);
  const invertedAcc = Fp.inv(multipliedAcc);
  nums.reduceRight((acc, num2, i3) => {
    if (Fp.is0(num2))
      return acc;
    inverted[i3] = Fp.mul(acc, inverted[i3]);
    return Fp.mul(acc, num2);
  }, invertedAcc);
  return inverted;
}
function FpLegendre(Fp, n) {
  const p1mod2 = (Fp.ORDER - _1n2) / _2n;
  const powered = Fp.pow(n, p1mod2);
  const yes = Fp.eql(powered, Fp.ONE);
  const zero = Fp.eql(powered, Fp.ZERO);
  const no = Fp.eql(powered, Fp.neg(Fp.ONE));
  if (!yes && !zero && !no)
    throw new Error("invalid Legendre symbol result");
  return yes ? 1 : zero ? 0 : -1;
}
function nLength(n, nBitLength) {
  if (nBitLength !== void 0)
    anumber(nBitLength);
  const _nBitLength = nBitLength !== void 0 ? nBitLength : n.toString(2).length;
  const nByteLength = Math.ceil(_nBitLength / 8);
  return { nBitLength: _nBitLength, nByteLength };
}
var _Field = class {
  ORDER;
  BITS;
  BYTES;
  isLE;
  ZERO = _0n2;
  ONE = _1n2;
  _lengths;
  _sqrt;
  // cached sqrt
  _mod;
  constructor(ORDER, opts = {}) {
    if (ORDER <= _0n2)
      throw new Error("invalid field: expected ORDER > 0, got " + ORDER);
    let _nbitLength = void 0;
    this.isLE = false;
    if (opts != null && typeof opts === "object") {
      if (typeof opts.BITS === "number")
        _nbitLength = opts.BITS;
      if (typeof opts.sqrt === "function")
        this.sqrt = opts.sqrt;
      if (typeof opts.isLE === "boolean")
        this.isLE = opts.isLE;
      if (opts.allowedLengths)
        this._lengths = opts.allowedLengths?.slice();
      if (typeof opts.modFromBytes === "boolean")
        this._mod = opts.modFromBytes;
    }
    const { nBitLength, nByteLength } = nLength(ORDER, _nbitLength);
    if (nByteLength > 2048)
      throw new Error("invalid field: expected ORDER of <= 2048 bytes");
    this.ORDER = ORDER;
    this.BITS = nBitLength;
    this.BYTES = nByteLength;
    this._sqrt = void 0;
    Object.preventExtensions(this);
  }
  create(num2) {
    return mod(num2, this.ORDER);
  }
  isValid(num2) {
    if (typeof num2 !== "bigint")
      throw new Error("invalid field element: expected bigint, got " + typeof num2);
    return _0n2 <= num2 && num2 < this.ORDER;
  }
  is0(num2) {
    return num2 === _0n2;
  }
  // is valid and invertible
  isValidNot0(num2) {
    return !this.is0(num2) && this.isValid(num2);
  }
  isOdd(num2) {
    return (num2 & _1n2) === _1n2;
  }
  neg(num2) {
    return mod(-num2, this.ORDER);
  }
  eql(lhs, rhs) {
    return lhs === rhs;
  }
  sqr(num2) {
    return mod(num2 * num2, this.ORDER);
  }
  add(lhs, rhs) {
    return mod(lhs + rhs, this.ORDER);
  }
  sub(lhs, rhs) {
    return mod(lhs - rhs, this.ORDER);
  }
  mul(lhs, rhs) {
    return mod(lhs * rhs, this.ORDER);
  }
  pow(num2, power) {
    return FpPow(this, num2, power);
  }
  div(lhs, rhs) {
    return mod(lhs * invert(rhs, this.ORDER), this.ORDER);
  }
  // Same as above, but doesn't normalize
  sqrN(num2) {
    return num2 * num2;
  }
  addN(lhs, rhs) {
    return lhs + rhs;
  }
  subN(lhs, rhs) {
    return lhs - rhs;
  }
  mulN(lhs, rhs) {
    return lhs * rhs;
  }
  inv(num2) {
    return invert(num2, this.ORDER);
  }
  sqrt(num2) {
    if (!this._sqrt)
      this._sqrt = FpSqrt(this.ORDER);
    return this._sqrt(this, num2);
  }
  toBytes(num2) {
    return this.isLE ? numberToBytesLE(num2, this.BYTES) : numberToBytesBE(num2, this.BYTES);
  }
  fromBytes(bytes, skipValidation = false) {
    abytes(bytes);
    const { _lengths: allowedLengths, BYTES, isLE: isLE2, ORDER, _mod: modFromBytes } = this;
    if (allowedLengths) {
      if (!allowedLengths.includes(bytes.length) || bytes.length > BYTES) {
        throw new Error("Field.fromBytes: expected " + allowedLengths + " bytes, got " + bytes.length);
      }
      const padded = new Uint8Array(BYTES);
      padded.set(bytes, isLE2 ? 0 : padded.length - bytes.length);
      bytes = padded;
    }
    if (bytes.length !== BYTES)
      throw new Error("Field.fromBytes: expected " + BYTES + " bytes, got " + bytes.length);
    let scalar = isLE2 ? bytesToNumberLE(bytes) : bytesToNumberBE(bytes);
    if (modFromBytes)
      scalar = mod(scalar, ORDER);
    if (!skipValidation) {
      if (!this.isValid(scalar))
        throw new Error("invalid field element: outside of range 0..ORDER");
    }
    return scalar;
  }
  // TODO: we don't need it here, move out to separate fn
  invertBatch(lst) {
    return FpInvertBatch(this, lst);
  }
  // We can't move this out because Fp6, Fp12 implement it
  // and it's unclear what to return in there.
  cmov(a, b, condition) {
    return condition ? b : a;
  }
};
function Field(ORDER, opts = {}) {
  return new _Field(ORDER, opts);
}
function getFieldBytesLength(fieldOrder) {
  if (typeof fieldOrder !== "bigint")
    throw new Error("field order must be bigint");
  const bitLength = fieldOrder.toString(2).length;
  return Math.ceil(bitLength / 8);
}
function getMinHashLength(fieldOrder) {
  const length = getFieldBytesLength(fieldOrder);
  return length + Math.ceil(length / 2);
}
function mapHashToField(key, fieldOrder, isLE2 = false) {
  abytes(key);
  const len = key.length;
  const fieldLen = getFieldBytesLength(fieldOrder);
  const minLen = getMinHashLength(fieldOrder);
  if (len < 16 || len < minLen || len > 1024)
    throw new Error("expected " + minLen + "-1024 bytes of input, got " + len);
  const num2 = isLE2 ? bytesToNumberLE(key) : bytesToNumberBE(key);
  const reduced = mod(num2, fieldOrder - _1n2) + _1n2;
  return isLE2 ? numberToBytesLE(reduced, fieldLen) : numberToBytesBE(reduced, fieldLen);
}

// node_modules/nostr-tools/node_modules/@noble/curves/abstract/curve.js
var _0n3 = /* @__PURE__ */ BigInt(0);
var _1n3 = /* @__PURE__ */ BigInt(1);
function negateCt(condition, item) {
  const neg = item.negate();
  return condition ? neg : item;
}
function normalizeZ(c, points) {
  const invertedZs = FpInvertBatch(c.Fp, points.map((p) => p.Z));
  return points.map((p, i3) => c.fromAffine(p.toAffine(invertedZs[i3])));
}
function validateW(W, bits2) {
  if (!Number.isSafeInteger(W) || W <= 0 || W > bits2)
    throw new Error("invalid window size, expected [1.." + bits2 + "], got W=" + W);
}
function calcWOpts(W, scalarBits) {
  validateW(W, scalarBits);
  const windows = Math.ceil(scalarBits / W) + 1;
  const windowSize = 2 ** (W - 1);
  const maxNumber = 2 ** W;
  const mask = bitMask(W);
  const shiftBy = BigInt(W);
  return { windows, windowSize, mask, maxNumber, shiftBy };
}
function calcOffsets(n, window, wOpts) {
  const { windowSize, mask, maxNumber, shiftBy } = wOpts;
  let wbits = Number(n & mask);
  let nextN = n >> shiftBy;
  if (wbits > windowSize) {
    wbits -= maxNumber;
    nextN += _1n3;
  }
  const offsetStart = window * windowSize;
  const offset = offsetStart + Math.abs(wbits) - 1;
  const isZero = wbits === 0;
  const isNeg = wbits < 0;
  const isNegF = window % 2 !== 0;
  const offsetF = offsetStart;
  return { nextN, offset, isZero, isNeg, isNegF, offsetF };
}
var pointPrecomputes = /* @__PURE__ */ new WeakMap();
var pointWindowSizes = /* @__PURE__ */ new WeakMap();
function getW(P) {
  return pointWindowSizes.get(P) || 1;
}
function assert0(n) {
  if (n !== _0n3)
    throw new Error("invalid wNAF");
}
var wNAF = class {
  BASE;
  ZERO;
  Fn;
  bits;
  // Parametrized with a given Point class (not individual point)
  constructor(Point, bits2) {
    this.BASE = Point.BASE;
    this.ZERO = Point.ZERO;
    this.Fn = Point.Fn;
    this.bits = bits2;
  }
  // non-const time multiplication ladder
  _unsafeLadder(elm, n, p = this.ZERO) {
    let d = elm;
    while (n > _0n3) {
      if (n & _1n3)
        p = p.add(d);
      d = d.double();
      n >>= _1n3;
    }
    return p;
  }
  /**
   * Creates a wNAF precomputation window. Used for caching.
   * Default window size is set by `utils.precompute()` and is equal to 8.
   * Number of precomputed points depends on the curve size:
   * 2^(𝑊−1) * (Math.ceil(𝑛 / 𝑊) + 1), where:
   * - 𝑊 is the window size
   * - 𝑛 is the bitlength of the curve order.
   * For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
   * @param point Point instance
   * @param W window size
   * @returns precomputed point tables flattened to a single array
   */
  precomputeWindow(point, W) {
    const { windows, windowSize } = calcWOpts(W, this.bits);
    const points = [];
    let p = point;
    let base = p;
    for (let window = 0; window < windows; window++) {
      base = p;
      points.push(base);
      for (let i3 = 1; i3 < windowSize; i3++) {
        base = base.add(p);
        points.push(base);
      }
      p = base.double();
    }
    return points;
  }
  /**
   * Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
   * More compact implementation:
   * https://github.com/paulmillr/noble-secp256k1/blob/47cb1669b6e506ad66b35fe7d76132ae97465da2/index.ts#L502-L541
   * @returns real and fake (for const-time) points
   */
  wNAF(W, precomputes, n) {
    if (!this.Fn.isValid(n))
      throw new Error("invalid scalar");
    let p = this.ZERO;
    let f = this.BASE;
    const wo = calcWOpts(W, this.bits);
    for (let window = 0; window < wo.windows; window++) {
      const { nextN, offset, isZero, isNeg, isNegF, offsetF } = calcOffsets(n, window, wo);
      n = nextN;
      if (isZero) {
        f = f.add(negateCt(isNegF, precomputes[offsetF]));
      } else {
        p = p.add(negateCt(isNeg, precomputes[offset]));
      }
    }
    assert0(n);
    return { p, f };
  }
  /**
   * Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
   * @param acc accumulator point to add result of multiplication
   * @returns point
   */
  wNAFUnsafe(W, precomputes, n, acc = this.ZERO) {
    const wo = calcWOpts(W, this.bits);
    for (let window = 0; window < wo.windows; window++) {
      if (n === _0n3)
        break;
      const { nextN, offset, isZero, isNeg } = calcOffsets(n, window, wo);
      n = nextN;
      if (isZero) {
        continue;
      } else {
        const item = precomputes[offset];
        acc = acc.add(isNeg ? item.negate() : item);
      }
    }
    assert0(n);
    return acc;
  }
  getPrecomputes(W, point, transform) {
    let comp = pointPrecomputes.get(point);
    if (!comp) {
      comp = this.precomputeWindow(point, W);
      if (W !== 1) {
        if (typeof transform === "function")
          comp = transform(comp);
        pointPrecomputes.set(point, comp);
      }
    }
    return comp;
  }
  cached(point, scalar, transform) {
    const W = getW(point);
    return this.wNAF(W, this.getPrecomputes(W, point, transform), scalar);
  }
  unsafe(point, scalar, transform, prev) {
    const W = getW(point);
    if (W === 1)
      return this._unsafeLadder(point, scalar, prev);
    return this.wNAFUnsafe(W, this.getPrecomputes(W, point, transform), scalar, prev);
  }
  // We calculate precomputes for elliptic curve point multiplication
  // using windowed method. This specifies window size and
  // stores precomputed values. Usually only base point would be precomputed.
  createCache(P, W) {
    validateW(W, this.bits);
    pointWindowSizes.set(P, W);
    pointPrecomputes.delete(P);
  }
  hasCache(elm) {
    return getW(elm) !== 1;
  }
};
function mulEndoUnsafe(Point, point, k1, k2) {
  let acc = point;
  let p1 = Point.ZERO;
  let p2 = Point.ZERO;
  while (k1 > _0n3 || k2 > _0n3) {
    if (k1 & _1n3)
      p1 = p1.add(acc);
    if (k2 & _1n3)
      p2 = p2.add(acc);
    acc = acc.double();
    k1 >>= _1n3;
    k2 >>= _1n3;
  }
  return { p1, p2 };
}
function createField(order, field, isLE2) {
  if (field) {
    if (field.ORDER !== order)
      throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
    validateField(field);
    return field;
  } else {
    return Field(order, { isLE: isLE2 });
  }
}
function createCurveFields(type, CURVE, curveOpts = {}, FpFnLE) {
  if (FpFnLE === void 0)
    FpFnLE = type === "edwards";
  if (!CURVE || typeof CURVE !== "object")
    throw new Error(`expected valid ${type} CURVE object`);
  for (const p of ["p", "n", "h"]) {
    const val = CURVE[p];
    if (!(typeof val === "bigint" && val > _0n3))
      throw new Error(`CURVE.${p} must be positive bigint`);
  }
  const Fp = createField(CURVE.p, curveOpts.Fp, FpFnLE);
  const Fn = createField(CURVE.n, curveOpts.Fn, FpFnLE);
  const _b2 = type === "weierstrass" ? "b" : "d";
  const params = ["Gx", "Gy", "a", _b2];
  for (const p of params) {
    if (!Fp.isValid(CURVE[p]))
      throw new Error(`CURVE.${p} must be valid field element of CURVE.Fp`);
  }
  CURVE = Object.freeze(Object.assign({}, CURVE));
  return { CURVE, Fp, Fn };
}
function createKeygen(randomSecretKey, getPublicKey2) {
  return function keygen(seed) {
    const secretKey = randomSecretKey(seed);
    return { secretKey, publicKey: getPublicKey2(secretKey) };
  };
}

// node_modules/nostr-tools/node_modules/@noble/hashes/hmac.js
var _HMAC = class {
  oHash;
  iHash;
  blockLen;
  outputLen;
  finished = false;
  destroyed = false;
  constructor(hash, key) {
    ahash(hash);
    abytes(key, void 0, "key");
    this.iHash = hash.create();
    if (typeof this.iHash.update !== "function")
      throw new Error("Expected instance of class which extends utils.Hash");
    this.blockLen = this.iHash.blockLen;
    this.outputLen = this.iHash.outputLen;
    const blockLen = this.blockLen;
    const pad2 = new Uint8Array(blockLen);
    pad2.set(key.length > blockLen ? hash.create().update(key).digest() : key);
    for (let i3 = 0; i3 < pad2.length; i3++)
      pad2[i3] ^= 54;
    this.iHash.update(pad2);
    this.oHash = hash.create();
    for (let i3 = 0; i3 < pad2.length; i3++)
      pad2[i3] ^= 54 ^ 92;
    this.oHash.update(pad2);
    clean(pad2);
  }
  update(buf) {
    aexists(this);
    this.iHash.update(buf);
    return this;
  }
  digestInto(out) {
    aexists(this);
    abytes(out, this.outputLen, "output");
    this.finished = true;
    this.iHash.digestInto(out);
    this.oHash.update(out);
    this.oHash.digestInto(out);
    this.destroy();
  }
  digest() {
    const out = new Uint8Array(this.oHash.outputLen);
    this.digestInto(out);
    return out;
  }
  _cloneInto(to) {
    to ||= Object.create(Object.getPrototypeOf(this), {});
    const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
    to = to;
    to.finished = finished;
    to.destroyed = destroyed;
    to.blockLen = blockLen;
    to.outputLen = outputLen;
    to.oHash = oHash._cloneInto(to.oHash);
    to.iHash = iHash._cloneInto(to.iHash);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
  destroy() {
    this.destroyed = true;
    this.oHash.destroy();
    this.iHash.destroy();
  }
};
var hmac = (hash, key, message) => new _HMAC(hash, key).update(message).digest();
hmac.create = (hash, key) => new _HMAC(hash, key);

// node_modules/nostr-tools/node_modules/@noble/curves/abstract/weierstrass.js
var divNearest = (num2, den) => (num2 + (num2 >= 0 ? den : -den) / _2n2) / den;
function _splitEndoScalar(k, basis, n) {
  const [[a1, b1], [a2, b22]] = basis;
  const c1 = divNearest(b22 * k, n);
  const c2 = divNearest(-b1 * k, n);
  let k1 = k - c1 * a1 - c2 * a2;
  let k2 = -c1 * b1 - c2 * b22;
  const k1neg = k1 < _0n4;
  const k2neg = k2 < _0n4;
  if (k1neg)
    k1 = -k1;
  if (k2neg)
    k2 = -k2;
  const MAX_NUM = bitMask(Math.ceil(bitLen(n) / 2)) + _1n4;
  if (k1 < _0n4 || k1 >= MAX_NUM || k2 < _0n4 || k2 >= MAX_NUM) {
    throw new Error("splitScalar (endomorphism): failed, k=" + k);
  }
  return { k1neg, k1, k2neg, k2 };
}
function validateSigFormat(format) {
  if (!["compact", "recovered", "der"].includes(format))
    throw new Error('Signature format must be "compact", "recovered", or "der"');
  return format;
}
function validateSigOpts(opts, def) {
  const optsn = {};
  for (let optName of Object.keys(def)) {
    optsn[optName] = opts[optName] === void 0 ? def[optName] : opts[optName];
  }
  abool(optsn.lowS, "lowS");
  abool(optsn.prehash, "prehash");
  if (optsn.format !== void 0)
    validateSigFormat(optsn.format);
  return optsn;
}
var DERErr = class extends Error {
  constructor(m = "") {
    super(m);
  }
};
var DER = {
  // asn.1 DER encoding utils
  Err: DERErr,
  // Basic building block is TLV (Tag-Length-Value)
  _tlv: {
    encode: (tag, data) => {
      const { Err: E } = DER;
      if (tag < 0 || tag > 256)
        throw new E("tlv.encode: wrong tag");
      if (data.length & 1)
        throw new E("tlv.encode: unpadded data");
      const dataLen = data.length / 2;
      const len = numberToHexUnpadded(dataLen);
      if (len.length / 2 & 128)
        throw new E("tlv.encode: long form length too big");
      const lenLen = dataLen > 127 ? numberToHexUnpadded(len.length / 2 | 128) : "";
      const t = numberToHexUnpadded(tag);
      return t + lenLen + len + data;
    },
    // v - value, l - left bytes (unparsed)
    decode(tag, data) {
      const { Err: E } = DER;
      let pos = 0;
      if (tag < 0 || tag > 256)
        throw new E("tlv.encode: wrong tag");
      if (data.length < 2 || data[pos++] !== tag)
        throw new E("tlv.decode: wrong tlv");
      const first = data[pos++];
      const isLong = !!(first & 128);
      let length = 0;
      if (!isLong)
        length = first;
      else {
        const lenLen = first & 127;
        if (!lenLen)
          throw new E("tlv.decode(long): indefinite length not supported");
        if (lenLen > 4)
          throw new E("tlv.decode(long): byte length is too big");
        const lengthBytes = data.subarray(pos, pos + lenLen);
        if (lengthBytes.length !== lenLen)
          throw new E("tlv.decode: length bytes not complete");
        if (lengthBytes[0] === 0)
          throw new E("tlv.decode(long): zero leftmost byte");
        for (const b of lengthBytes)
          length = length << 8 | b;
        pos += lenLen;
        if (length < 128)
          throw new E("tlv.decode(long): not minimal encoding");
      }
      const v = data.subarray(pos, pos + length);
      if (v.length !== length)
        throw new E("tlv.decode: wrong value length");
      return { v, l: data.subarray(pos + length) };
    }
  },
  // https://crypto.stackexchange.com/a/57734 Leftmost bit of first byte is 'negative' flag,
  // since we always use positive integers here. It must always be empty:
  // - add zero byte if exists
  // - if next byte doesn't have a flag, leading zero is not allowed (minimal encoding)
  _int: {
    encode(num2) {
      const { Err: E } = DER;
      if (num2 < _0n4)
        throw new E("integer: negative integers are not allowed");
      let hex = numberToHexUnpadded(num2);
      if (Number.parseInt(hex[0], 16) & 8)
        hex = "00" + hex;
      if (hex.length & 1)
        throw new E("unexpected DER parsing assertion: unpadded hex");
      return hex;
    },
    decode(data) {
      const { Err: E } = DER;
      if (data[0] & 128)
        throw new E("invalid signature integer: negative");
      if (data[0] === 0 && !(data[1] & 128))
        throw new E("invalid signature integer: unnecessary leading zero");
      return bytesToNumberBE(data);
    }
  },
  toSig(bytes) {
    const { Err: E, _int: int, _tlv: tlv } = DER;
    const data = abytes(bytes, void 0, "signature");
    const { v: seqBytes, l: seqLeftBytes } = tlv.decode(48, data);
    if (seqLeftBytes.length)
      throw new E("invalid signature: left bytes after parsing");
    const { v: rBytes, l: rLeftBytes } = tlv.decode(2, seqBytes);
    const { v: sBytes, l: sLeftBytes } = tlv.decode(2, rLeftBytes);
    if (sLeftBytes.length)
      throw new E("invalid signature: left bytes after parsing");
    return { r: int.decode(rBytes), s: int.decode(sBytes) };
  },
  hexFromSig(sig) {
    const { _tlv: tlv, _int: int } = DER;
    const rs = tlv.encode(2, int.encode(sig.r));
    const ss = tlv.encode(2, int.encode(sig.s));
    const seq = rs + ss;
    return tlv.encode(48, seq);
  }
};
var _0n4 = BigInt(0);
var _1n4 = BigInt(1);
var _2n2 = BigInt(2);
var _3n2 = BigInt(3);
var _4n2 = BigInt(4);
function weierstrass(params, extraOpts = {}) {
  const validated = createCurveFields("weierstrass", params, extraOpts);
  const { Fp, Fn } = validated;
  let CURVE = validated.CURVE;
  const { h: cofactor, n: CURVE_ORDER } = CURVE;
  validateObject(extraOpts, {}, {
    allowInfinityPoint: "boolean",
    clearCofactor: "function",
    isTorsionFree: "function",
    fromBytes: "function",
    toBytes: "function",
    endo: "object"
  });
  const { endo } = extraOpts;
  if (endo) {
    if (!Fp.is0(CURVE.a) || typeof endo.beta !== "bigint" || !Array.isArray(endo.basises)) {
      throw new Error('invalid endo: expected "beta": bigint and "basises": array');
    }
  }
  const lengths = getWLengths(Fp, Fn);
  function assertCompressionIsSupported() {
    if (!Fp.isOdd)
      throw new Error("compression is not supported: Field does not have .isOdd()");
  }
  function pointToBytes2(_c, point, isCompressed) {
    const { x: x2, y } = point.toAffine();
    const bx = Fp.toBytes(x2);
    abool(isCompressed, "isCompressed");
    if (isCompressed) {
      assertCompressionIsSupported();
      const hasEvenY = !Fp.isOdd(y);
      return concatBytes(pprefix(hasEvenY), bx);
    } else {
      return concatBytes(Uint8Array.of(4), bx, Fp.toBytes(y));
    }
  }
  function pointFromBytes(bytes) {
    abytes(bytes, void 0, "Point");
    const { publicKey: comp, publicKeyUncompressed: uncomp } = lengths;
    const length = bytes.length;
    const head = bytes[0];
    const tail = bytes.subarray(1);
    if (length === comp && (head === 2 || head === 3)) {
      const x2 = Fp.fromBytes(tail);
      if (!Fp.isValid(x2))
        throw new Error("bad point: is not on curve, wrong x");
      const y2 = weierstrassEquation(x2);
      let y;
      try {
        y = Fp.sqrt(y2);
      } catch (sqrtError) {
        const err2 = sqrtError instanceof Error ? ": " + sqrtError.message : "";
        throw new Error("bad point: is not on curve, sqrt error" + err2);
      }
      assertCompressionIsSupported();
      const evenY = Fp.isOdd(y);
      const evenH = (head & 1) === 1;
      if (evenH !== evenY)
        y = Fp.neg(y);
      return { x: x2, y };
    } else if (length === uncomp && head === 4) {
      const L = Fp.BYTES;
      const x2 = Fp.fromBytes(tail.subarray(0, L));
      const y = Fp.fromBytes(tail.subarray(L, L * 2));
      if (!isValidXY(x2, y))
        throw new Error("bad point: is not on curve");
      return { x: x2, y };
    } else {
      throw new Error(`bad point: got length ${length}, expected compressed=${comp} or uncompressed=${uncomp}`);
    }
  }
  const encodePoint = extraOpts.toBytes || pointToBytes2;
  const decodePoint = extraOpts.fromBytes || pointFromBytes;
  function weierstrassEquation(x2) {
    const x22 = Fp.sqr(x2);
    const x3 = Fp.mul(x22, x2);
    return Fp.add(Fp.add(x3, Fp.mul(x2, CURVE.a)), CURVE.b);
  }
  function isValidXY(x2, y) {
    const left = Fp.sqr(y);
    const right = weierstrassEquation(x2);
    return Fp.eql(left, right);
  }
  if (!isValidXY(CURVE.Gx, CURVE.Gy))
    throw new Error("bad curve params: generator point");
  const _4a3 = Fp.mul(Fp.pow(CURVE.a, _3n2), _4n2);
  const _27b2 = Fp.mul(Fp.sqr(CURVE.b), BigInt(27));
  if (Fp.is0(Fp.add(_4a3, _27b2)))
    throw new Error("bad curve params: a or b");
  function acoord(title, n, banZero = false) {
    if (!Fp.isValid(n) || banZero && Fp.is0(n))
      throw new Error(`bad point coordinate ${title}`);
    return n;
  }
  function aprjpoint(other) {
    if (!(other instanceof Point))
      throw new Error("Weierstrass Point expected");
  }
  function splitEndoScalarN(k) {
    if (!endo || !endo.basises)
      throw new Error("no endo");
    return _splitEndoScalar(k, endo.basises, Fn.ORDER);
  }
  const toAffineMemo = memoized((p, iz) => {
    const { X, Y, Z } = p;
    if (Fp.eql(Z, Fp.ONE))
      return { x: X, y: Y };
    const is0 = p.is0();
    if (iz == null)
      iz = is0 ? Fp.ONE : Fp.inv(Z);
    const x2 = Fp.mul(X, iz);
    const y = Fp.mul(Y, iz);
    const zz = Fp.mul(Z, iz);
    if (is0)
      return { x: Fp.ZERO, y: Fp.ZERO };
    if (!Fp.eql(zz, Fp.ONE))
      throw new Error("invZ was invalid");
    return { x: x2, y };
  });
  const assertValidMemo = memoized((p) => {
    if (p.is0()) {
      if (extraOpts.allowInfinityPoint && !Fp.is0(p.Y))
        return;
      throw new Error("bad point: ZERO");
    }
    const { x: x2, y } = p.toAffine();
    if (!Fp.isValid(x2) || !Fp.isValid(y))
      throw new Error("bad point: x or y not field elements");
    if (!isValidXY(x2, y))
      throw new Error("bad point: equation left != right");
    if (!p.isTorsionFree())
      throw new Error("bad point: not in prime-order subgroup");
    return true;
  });
  function finishEndo(endoBeta, k1p, k2p, k1neg, k2neg) {
    k2p = new Point(Fp.mul(k2p.X, endoBeta), k2p.Y, k2p.Z);
    k1p = negateCt(k1neg, k1p);
    k2p = negateCt(k2neg, k2p);
    return k1p.add(k2p);
  }
  class Point {
    // base / generator point
    static BASE = new Point(CURVE.Gx, CURVE.Gy, Fp.ONE);
    // zero / infinity / identity point
    static ZERO = new Point(Fp.ZERO, Fp.ONE, Fp.ZERO);
    // 0, 1, 0
    // math field
    static Fp = Fp;
    // scalar field
    static Fn = Fn;
    X;
    Y;
    Z;
    /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
    constructor(X, Y, Z) {
      this.X = acoord("x", X);
      this.Y = acoord("y", Y, true);
      this.Z = acoord("z", Z);
      Object.freeze(this);
    }
    static CURVE() {
      return CURVE;
    }
    /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
    static fromAffine(p) {
      const { x: x2, y } = p || {};
      if (!p || !Fp.isValid(x2) || !Fp.isValid(y))
        throw new Error("invalid affine point");
      if (p instanceof Point)
        throw new Error("projective point not allowed");
      if (Fp.is0(x2) && Fp.is0(y))
        return Point.ZERO;
      return new Point(x2, y, Fp.ONE);
    }
    static fromBytes(bytes) {
      const P = Point.fromAffine(decodePoint(abytes(bytes, void 0, "point")));
      P.assertValidity();
      return P;
    }
    static fromHex(hex) {
      return Point.fromBytes(hexToBytes(hex));
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    /**
     *
     * @param windowSize
     * @param isLazy true will defer table computation until the first multiplication
     * @returns
     */
    precompute(windowSize = 8, isLazy = true) {
      wnaf.createCache(this, windowSize);
      if (!isLazy)
        this.multiply(_3n2);
      return this;
    }
    // TODO: return `this`
    /** A point on curve is valid if it conforms to equation. */
    assertValidity() {
      assertValidMemo(this);
    }
    hasEvenY() {
      const { y } = this.toAffine();
      if (!Fp.isOdd)
        throw new Error("Field doesn't support isOdd");
      return !Fp.isOdd(y);
    }
    /** Compare one point to another. */
    equals(other) {
      aprjpoint(other);
      const { X: X1, Y: Y1, Z: Z1 } = this;
      const { X: X2, Y: Y2, Z: Z2 } = other;
      const U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1));
      const U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1));
      return U1 && U2;
    }
    /** Flips point to one corresponding to (x, -y) in Affine coordinates. */
    negate() {
      return new Point(this.X, Fp.neg(this.Y), this.Z);
    }
    // Renes-Costello-Batina exception-free doubling formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 3
    // Cost: 8M + 3S + 3*a + 2*b3 + 15add.
    double() {
      const { a, b } = CURVE;
      const b3 = Fp.mul(b, _3n2);
      const { X: X1, Y: Y1, Z: Z1 } = this;
      let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
      let t0 = Fp.mul(X1, X1);
      let t1 = Fp.mul(Y1, Y1);
      let t2 = Fp.mul(Z1, Z1);
      let t3 = Fp.mul(X1, Y1);
      t3 = Fp.add(t3, t3);
      Z3 = Fp.mul(X1, Z1);
      Z3 = Fp.add(Z3, Z3);
      X3 = Fp.mul(a, Z3);
      Y3 = Fp.mul(b3, t2);
      Y3 = Fp.add(X3, Y3);
      X3 = Fp.sub(t1, Y3);
      Y3 = Fp.add(t1, Y3);
      Y3 = Fp.mul(X3, Y3);
      X3 = Fp.mul(t3, X3);
      Z3 = Fp.mul(b3, Z3);
      t2 = Fp.mul(a, t2);
      t3 = Fp.sub(t0, t2);
      t3 = Fp.mul(a, t3);
      t3 = Fp.add(t3, Z3);
      Z3 = Fp.add(t0, t0);
      t0 = Fp.add(Z3, t0);
      t0 = Fp.add(t0, t2);
      t0 = Fp.mul(t0, t3);
      Y3 = Fp.add(Y3, t0);
      t2 = Fp.mul(Y1, Z1);
      t2 = Fp.add(t2, t2);
      t0 = Fp.mul(t2, t3);
      X3 = Fp.sub(X3, t0);
      Z3 = Fp.mul(t2, t1);
      Z3 = Fp.add(Z3, Z3);
      Z3 = Fp.add(Z3, Z3);
      return new Point(X3, Y3, Z3);
    }
    // Renes-Costello-Batina exception-free addition formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 1
    // Cost: 12M + 0S + 3*a + 3*b3 + 23add.
    add(other) {
      aprjpoint(other);
      const { X: X1, Y: Y1, Z: Z1 } = this;
      const { X: X2, Y: Y2, Z: Z2 } = other;
      let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
      const a = CURVE.a;
      const b3 = Fp.mul(CURVE.b, _3n2);
      let t0 = Fp.mul(X1, X2);
      let t1 = Fp.mul(Y1, Y2);
      let t2 = Fp.mul(Z1, Z2);
      let t3 = Fp.add(X1, Y1);
      let t4 = Fp.add(X2, Y2);
      t3 = Fp.mul(t3, t4);
      t4 = Fp.add(t0, t1);
      t3 = Fp.sub(t3, t4);
      t4 = Fp.add(X1, Z1);
      let t5 = Fp.add(X2, Z2);
      t4 = Fp.mul(t4, t5);
      t5 = Fp.add(t0, t2);
      t4 = Fp.sub(t4, t5);
      t5 = Fp.add(Y1, Z1);
      X3 = Fp.add(Y2, Z2);
      t5 = Fp.mul(t5, X3);
      X3 = Fp.add(t1, t2);
      t5 = Fp.sub(t5, X3);
      Z3 = Fp.mul(a, t4);
      X3 = Fp.mul(b3, t2);
      Z3 = Fp.add(X3, Z3);
      X3 = Fp.sub(t1, Z3);
      Z3 = Fp.add(t1, Z3);
      Y3 = Fp.mul(X3, Z3);
      t1 = Fp.add(t0, t0);
      t1 = Fp.add(t1, t0);
      t2 = Fp.mul(a, t2);
      t4 = Fp.mul(b3, t4);
      t1 = Fp.add(t1, t2);
      t2 = Fp.sub(t0, t2);
      t2 = Fp.mul(a, t2);
      t4 = Fp.add(t4, t2);
      t0 = Fp.mul(t1, t4);
      Y3 = Fp.add(Y3, t0);
      t0 = Fp.mul(t5, t4);
      X3 = Fp.mul(t3, X3);
      X3 = Fp.sub(X3, t0);
      t0 = Fp.mul(t3, t1);
      Z3 = Fp.mul(t5, Z3);
      Z3 = Fp.add(Z3, t0);
      return new Point(X3, Y3, Z3);
    }
    subtract(other) {
      return this.add(other.negate());
    }
    is0() {
      return this.equals(Point.ZERO);
    }
    /**
     * Constant time multiplication.
     * Uses wNAF method. Windowed method may be 10% faster,
     * but takes 2x longer to generate and consumes 2x memory.
     * Uses precomputes when available.
     * Uses endomorphism for Koblitz curves.
     * @param scalar by which the point would be multiplied
     * @returns New point
     */
    multiply(scalar) {
      const { endo: endo2 } = extraOpts;
      if (!Fn.isValidNot0(scalar))
        throw new Error("invalid scalar: out of range");
      let point, fake;
      const mul3 = (n) => wnaf.cached(this, n, (p) => normalizeZ(Point, p));
      if (endo2) {
        const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(scalar);
        const { p: k1p, f: k1f } = mul3(k1);
        const { p: k2p, f: k2f } = mul3(k2);
        fake = k1f.add(k2f);
        point = finishEndo(endo2.beta, k1p, k2p, k1neg, k2neg);
      } else {
        const { p, f } = mul3(scalar);
        point = p;
        fake = f;
      }
      return normalizeZ(Point, [point, fake])[0];
    }
    /**
     * Non-constant-time multiplication. Uses double-and-add algorithm.
     * It's faster, but should only be used when you don't care about
     * an exposed secret key e.g. sig verification, which works over *public* keys.
     */
    multiplyUnsafe(sc) {
      const { endo: endo2 } = extraOpts;
      const p = this;
      if (!Fn.isValid(sc))
        throw new Error("invalid scalar: out of range");
      if (sc === _0n4 || p.is0())
        return Point.ZERO;
      if (sc === _1n4)
        return p;
      if (wnaf.hasCache(this))
        return this.multiply(sc);
      if (endo2) {
        const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(sc);
        const { p1, p2 } = mulEndoUnsafe(Point, p, k1, k2);
        return finishEndo(endo2.beta, p1, p2, k1neg, k2neg);
      } else {
        return wnaf.unsafe(p, sc);
      }
    }
    /**
     * Converts Projective point to affine (x, y) coordinates.
     * @param invertedZ Z^-1 (inverted zero) - optional, precomputation is useful for invertBatch
     */
    toAffine(invertedZ) {
      return toAffineMemo(this, invertedZ);
    }
    /**
     * Checks whether Point is free of torsion elements (is in prime subgroup).
     * Always torsion-free for cofactor=1 curves.
     */
    isTorsionFree() {
      const { isTorsionFree } = extraOpts;
      if (cofactor === _1n4)
        return true;
      if (isTorsionFree)
        return isTorsionFree(Point, this);
      return wnaf.unsafe(this, CURVE_ORDER).is0();
    }
    clearCofactor() {
      const { clearCofactor } = extraOpts;
      if (cofactor === _1n4)
        return this;
      if (clearCofactor)
        return clearCofactor(Point, this);
      return this.multiplyUnsafe(cofactor);
    }
    isSmallOrder() {
      return this.multiplyUnsafe(cofactor).is0();
    }
    toBytes(isCompressed = true) {
      abool(isCompressed, "isCompressed");
      this.assertValidity();
      return encodePoint(Point, this, isCompressed);
    }
    toHex(isCompressed = true) {
      return bytesToHex(this.toBytes(isCompressed));
    }
    toString() {
      return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
    }
  }
  const bits2 = Fn.BITS;
  const wnaf = new wNAF(Point, extraOpts.endo ? Math.ceil(bits2 / 2) : bits2);
  Point.BASE.precompute(8);
  return Point;
}
function pprefix(hasEvenY) {
  return Uint8Array.of(hasEvenY ? 2 : 3);
}
function getWLengths(Fp, Fn) {
  return {
    secretKey: Fn.BYTES,
    publicKey: 1 + Fp.BYTES,
    publicKeyUncompressed: 1 + 2 * Fp.BYTES,
    publicKeyHasPrefix: true,
    signature: 2 * Fn.BYTES
  };
}
function ecdh(Point, ecdhOpts = {}) {
  const { Fn } = Point;
  const randomBytes_ = ecdhOpts.randomBytes || randomBytes;
  const lengths = Object.assign(getWLengths(Point.Fp, Fn), { seed: getMinHashLength(Fn.ORDER) });
  function isValidSecretKey(secretKey) {
    try {
      const num2 = Fn.fromBytes(secretKey);
      return Fn.isValidNot0(num2);
    } catch (error) {
      return false;
    }
  }
  function isValidPublicKey(publicKey, isCompressed) {
    const { publicKey: comp, publicKeyUncompressed } = lengths;
    try {
      const l = publicKey.length;
      if (isCompressed === true && l !== comp)
        return false;
      if (isCompressed === false && l !== publicKeyUncompressed)
        return false;
      return !!Point.fromBytes(publicKey);
    } catch (error) {
      return false;
    }
  }
  function randomSecretKey(seed = randomBytes_(lengths.seed)) {
    return mapHashToField(abytes(seed, lengths.seed, "seed"), Fn.ORDER);
  }
  function getPublicKey2(secretKey, isCompressed = true) {
    return Point.BASE.multiply(Fn.fromBytes(secretKey)).toBytes(isCompressed);
  }
  function isProbPub(item) {
    const { secretKey, publicKey, publicKeyUncompressed } = lengths;
    if (!isBytes(item))
      return void 0;
    if ("_lengths" in Fn && Fn._lengths || secretKey === publicKey)
      return void 0;
    const l = abytes(item, void 0, "key").length;
    return l === publicKey || l === publicKeyUncompressed;
  }
  function getSharedSecret(secretKeyA, publicKeyB, isCompressed = true) {
    if (isProbPub(secretKeyA) === true)
      throw new Error("first arg must be private key");
    if (isProbPub(publicKeyB) === false)
      throw new Error("second arg must be public key");
    const s = Fn.fromBytes(secretKeyA);
    const b = Point.fromBytes(publicKeyB);
    return b.multiply(s).toBytes(isCompressed);
  }
  const utils = {
    isValidSecretKey,
    isValidPublicKey,
    randomSecretKey
  };
  const keygen = createKeygen(randomSecretKey, getPublicKey2);
  return Object.freeze({ getPublicKey: getPublicKey2, getSharedSecret, keygen, Point, utils, lengths });
}
function ecdsa(Point, hash, ecdsaOpts = {}) {
  ahash(hash);
  validateObject(ecdsaOpts, {}, {
    hmac: "function",
    lowS: "boolean",
    randomBytes: "function",
    bits2int: "function",
    bits2int_modN: "function"
  });
  ecdsaOpts = Object.assign({}, ecdsaOpts);
  const randomBytes3 = ecdsaOpts.randomBytes || randomBytes;
  const hmac2 = ecdsaOpts.hmac || ((key, msg) => hmac(hash, key, msg));
  const { Fp, Fn } = Point;
  const { ORDER: CURVE_ORDER, BITS: fnBits } = Fn;
  const { keygen, getPublicKey: getPublicKey2, getSharedSecret, utils, lengths } = ecdh(Point, ecdsaOpts);
  const defaultSigOpts = {
    prehash: true,
    lowS: typeof ecdsaOpts.lowS === "boolean" ? ecdsaOpts.lowS : true,
    format: "compact",
    extraEntropy: false
  };
  const hasLargeCofactor = CURVE_ORDER * _2n2 < Fp.ORDER;
  function isBiggerThanHalfOrder(number) {
    const HALF = CURVE_ORDER >> _1n4;
    return number > HALF;
  }
  function validateRS(title, num2) {
    if (!Fn.isValidNot0(num2))
      throw new Error(`invalid signature ${title}: out of range 1..Point.Fn.ORDER`);
    return num2;
  }
  function assertSmallCofactor() {
    if (hasLargeCofactor)
      throw new Error('"recovered" sig type is not supported for cofactor >2 curves');
  }
  function validateSigLength(bytes, format) {
    validateSigFormat(format);
    const size = lengths.signature;
    const sizer = format === "compact" ? size : format === "recovered" ? size + 1 : void 0;
    return abytes(bytes, sizer);
  }
  class Signature {
    r;
    s;
    recovery;
    constructor(r, s, recovery) {
      this.r = validateRS("r", r);
      this.s = validateRS("s", s);
      if (recovery != null) {
        assertSmallCofactor();
        if (![0, 1, 2, 3].includes(recovery))
          throw new Error("invalid recovery id");
        this.recovery = recovery;
      }
      Object.freeze(this);
    }
    static fromBytes(bytes, format = defaultSigOpts.format) {
      validateSigLength(bytes, format);
      let recid;
      if (format === "der") {
        const { r: r2, s: s2 } = DER.toSig(abytes(bytes));
        return new Signature(r2, s2);
      }
      if (format === "recovered") {
        recid = bytes[0];
        format = "compact";
        bytes = bytes.subarray(1);
      }
      const L = lengths.signature / 2;
      const r = bytes.subarray(0, L);
      const s = bytes.subarray(L, L * 2);
      return new Signature(Fn.fromBytes(r), Fn.fromBytes(s), recid);
    }
    static fromHex(hex, format) {
      return this.fromBytes(hexToBytes(hex), format);
    }
    assertRecovery() {
      const { recovery } = this;
      if (recovery == null)
        throw new Error("invalid recovery id: must be present");
      return recovery;
    }
    addRecoveryBit(recovery) {
      return new Signature(this.r, this.s, recovery);
    }
    recoverPublicKey(messageHash) {
      const { r, s } = this;
      const recovery = this.assertRecovery();
      const radj = recovery === 2 || recovery === 3 ? r + CURVE_ORDER : r;
      if (!Fp.isValid(radj))
        throw new Error("invalid recovery id: sig.r+curve.n != R.x");
      const x2 = Fp.toBytes(radj);
      const R = Point.fromBytes(concatBytes(pprefix((recovery & 1) === 0), x2));
      const ir = Fn.inv(radj);
      const h = bits2int_modN(abytes(messageHash, void 0, "msgHash"));
      const u1 = Fn.create(-h * ir);
      const u2 = Fn.create(s * ir);
      const Q = Point.BASE.multiplyUnsafe(u1).add(R.multiplyUnsafe(u2));
      if (Q.is0())
        throw new Error("invalid recovery: point at infinify");
      Q.assertValidity();
      return Q;
    }
    // Signatures should be low-s, to prevent malleability.
    hasHighS() {
      return isBiggerThanHalfOrder(this.s);
    }
    toBytes(format = defaultSigOpts.format) {
      validateSigFormat(format);
      if (format === "der")
        return hexToBytes(DER.hexFromSig(this));
      const { r, s } = this;
      const rb = Fn.toBytes(r);
      const sb = Fn.toBytes(s);
      if (format === "recovered") {
        assertSmallCofactor();
        return concatBytes(Uint8Array.of(this.assertRecovery()), rb, sb);
      }
      return concatBytes(rb, sb);
    }
    toHex(format) {
      return bytesToHex(this.toBytes(format));
    }
  }
  const bits2int = ecdsaOpts.bits2int || function bits2int_def(bytes) {
    if (bytes.length > 8192)
      throw new Error("input is too large");
    const num2 = bytesToNumberBE(bytes);
    const delta = bytes.length * 8 - fnBits;
    return delta > 0 ? num2 >> BigInt(delta) : num2;
  };
  const bits2int_modN = ecdsaOpts.bits2int_modN || function bits2int_modN_def(bytes) {
    return Fn.create(bits2int(bytes));
  };
  const ORDER_MASK = bitMask(fnBits);
  function int2octets(num2) {
    aInRange("num < 2^" + fnBits, num2, _0n4, ORDER_MASK);
    return Fn.toBytes(num2);
  }
  function validateMsgAndHash(message, prehash) {
    abytes(message, void 0, "message");
    return prehash ? abytes(hash(message), void 0, "prehashed message") : message;
  }
  function prepSig(message, secretKey, opts) {
    const { lowS, prehash, extraEntropy } = validateSigOpts(opts, defaultSigOpts);
    message = validateMsgAndHash(message, prehash);
    const h1int = bits2int_modN(message);
    const d = Fn.fromBytes(secretKey);
    if (!Fn.isValidNot0(d))
      throw new Error("invalid private key");
    const seedArgs = [int2octets(d), int2octets(h1int)];
    if (extraEntropy != null && extraEntropy !== false) {
      const e = extraEntropy === true ? randomBytes3(lengths.secretKey) : extraEntropy;
      seedArgs.push(abytes(e, void 0, "extraEntropy"));
    }
    const seed = concatBytes(...seedArgs);
    const m = h1int;
    function k2sig(kBytes) {
      const k = bits2int(kBytes);
      if (!Fn.isValidNot0(k))
        return;
      const ik = Fn.inv(k);
      const q = Point.BASE.multiply(k).toAffine();
      const r = Fn.create(q.x);
      if (r === _0n4)
        return;
      const s = Fn.create(ik * Fn.create(m + r * d));
      if (s === _0n4)
        return;
      let recovery = (q.x === r ? 0 : 2) | Number(q.y & _1n4);
      let normS = s;
      if (lowS && isBiggerThanHalfOrder(s)) {
        normS = Fn.neg(s);
        recovery ^= 1;
      }
      return new Signature(r, normS, hasLargeCofactor ? void 0 : recovery);
    }
    return { seed, k2sig };
  }
  function sign(message, secretKey, opts = {}) {
    const { seed, k2sig } = prepSig(message, secretKey, opts);
    const drbg = createHmacDrbg(hash.outputLen, Fn.BYTES, hmac2);
    const sig = drbg(seed, k2sig);
    return sig.toBytes(opts.format);
  }
  function verify(signature, message, publicKey, opts = {}) {
    const { lowS, prehash, format } = validateSigOpts(opts, defaultSigOpts);
    publicKey = abytes(publicKey, void 0, "publicKey");
    message = validateMsgAndHash(message, prehash);
    if (!isBytes(signature)) {
      const end = signature instanceof Signature ? ", use sig.toBytes()" : "";
      throw new Error("verify expects Uint8Array signature" + end);
    }
    validateSigLength(signature, format);
    try {
      const sig = Signature.fromBytes(signature, format);
      const P = Point.fromBytes(publicKey);
      if (lowS && sig.hasHighS())
        return false;
      const { r, s } = sig;
      const h = bits2int_modN(message);
      const is = Fn.inv(s);
      const u1 = Fn.create(h * is);
      const u2 = Fn.create(r * is);
      const R = Point.BASE.multiplyUnsafe(u1).add(P.multiplyUnsafe(u2));
      if (R.is0())
        return false;
      const v = Fn.create(R.x);
      return v === r;
    } catch (e) {
      return false;
    }
  }
  function recoverPublicKey(signature, message, opts = {}) {
    const { prehash } = validateSigOpts(opts, defaultSigOpts);
    message = validateMsgAndHash(message, prehash);
    return Signature.fromBytes(signature, "recovered").recoverPublicKey(message).toBytes();
  }
  return Object.freeze({
    keygen,
    getPublicKey: getPublicKey2,
    getSharedSecret,
    utils,
    lengths,
    Point,
    sign,
    verify,
    recoverPublicKey,
    Signature,
    hash
  });
}

// node_modules/nostr-tools/node_modules/@noble/curves/secp256k1.js
var secp256k1_CURVE = {
  p: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f"),
  n: BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"),
  h: BigInt(1),
  a: BigInt(0),
  b: BigInt(7),
  Gx: BigInt("0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"),
  Gy: BigInt("0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8")
};
var secp256k1_ENDO = {
  beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
  basises: [
    [BigInt("0x3086d221a7d46bcde86c90e49284eb15"), -BigInt("0xe4437ed6010e88286f547fa90abfe4c3")],
    [BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8"), BigInt("0x3086d221a7d46bcde86c90e49284eb15")]
  ]
};
var _0n5 = /* @__PURE__ */ BigInt(0);
var _2n3 = /* @__PURE__ */ BigInt(2);
function sqrtMod(y) {
  const P = secp256k1_CURVE.p;
  const _3n3 = BigInt(3), _6n = BigInt(6), _11n = BigInt(11), _22n = BigInt(22);
  const _23n = BigInt(23), _44n = BigInt(44), _88n = BigInt(88);
  const b22 = y * y * y % P;
  const b3 = b22 * b22 * y % P;
  const b6 = pow2(b3, _3n3, P) * b3 % P;
  const b9 = pow2(b6, _3n3, P) * b3 % P;
  const b11 = pow2(b9, _2n3, P) * b22 % P;
  const b222 = pow2(b11, _11n, P) * b11 % P;
  const b44 = pow2(b222, _22n, P) * b222 % P;
  const b88 = pow2(b44, _44n, P) * b44 % P;
  const b176 = pow2(b88, _88n, P) * b88 % P;
  const b220 = pow2(b176, _44n, P) * b44 % P;
  const b223 = pow2(b220, _3n3, P) * b3 % P;
  const t1 = pow2(b223, _23n, P) * b222 % P;
  const t2 = pow2(t1, _6n, P) * b22 % P;
  const root = pow2(t2, _2n3, P);
  if (!Fpk1.eql(Fpk1.sqr(root), y))
    throw new Error("Cannot find square root");
  return root;
}
var Fpk1 = Field(secp256k1_CURVE.p, { sqrt: sqrtMod });
var Pointk1 = /* @__PURE__ */ weierstrass(secp256k1_CURVE, {
  Fp: Fpk1,
  endo: secp256k1_ENDO
});
var secp256k1 = /* @__PURE__ */ ecdsa(Pointk1, sha256);
var TAGGED_HASH_PREFIXES = {};
function taggedHash(tag, ...messages) {
  let tagP = TAGGED_HASH_PREFIXES[tag];
  if (tagP === void 0) {
    const tagH = sha256(asciiToBytes(tag));
    tagP = concatBytes(tagH, tagH);
    TAGGED_HASH_PREFIXES[tag] = tagP;
  }
  return sha256(concatBytes(tagP, ...messages));
}
var pointToBytes = (point) => point.toBytes(true).slice(1);
var hasEven = (y) => y % _2n3 === _0n5;
function schnorrGetExtPubKey(priv) {
  const { Fn, BASE } = Pointk1;
  const d_ = Fn.fromBytes(priv);
  const p = BASE.multiply(d_);
  const scalar = hasEven(p.y) ? d_ : Fn.neg(d_);
  return { scalar, bytes: pointToBytes(p) };
}
function lift_x(x2) {
  const Fp = Fpk1;
  if (!Fp.isValidNot0(x2))
    throw new Error("invalid x: Fail if x \u2265 p");
  const xx = Fp.create(x2 * x2);
  const c = Fp.create(xx * x2 + BigInt(7));
  let y = Fp.sqrt(c);
  if (!hasEven(y))
    y = Fp.neg(y);
  const p = Pointk1.fromAffine({ x: x2, y });
  p.assertValidity();
  return p;
}
var num = bytesToNumberBE;
function challenge(...args) {
  return Pointk1.Fn.create(num(taggedHash("BIP0340/challenge", ...args)));
}
function schnorrGetPublicKey(secretKey) {
  return schnorrGetExtPubKey(secretKey).bytes;
}
function schnorrSign(message, secretKey, auxRand = randomBytes(32)) {
  const { Fn } = Pointk1;
  const m = abytes(message, void 0, "message");
  const { bytes: px, scalar: d } = schnorrGetExtPubKey(secretKey);
  const a = abytes(auxRand, 32, "auxRand");
  const t = Fn.toBytes(d ^ num(taggedHash("BIP0340/aux", a)));
  const rand = taggedHash("BIP0340/nonce", t, px, m);
  const { bytes: rx, scalar: k } = schnorrGetExtPubKey(rand);
  const e = challenge(rx, px, m);
  const sig = new Uint8Array(64);
  sig.set(rx, 0);
  sig.set(Fn.toBytes(Fn.create(k + e * d)), 32);
  if (!schnorrVerify(sig, m, px))
    throw new Error("sign: Invalid signature produced");
  return sig;
}
function schnorrVerify(signature, message, publicKey) {
  const { Fp, Fn, BASE } = Pointk1;
  const sig = abytes(signature, 64, "signature");
  const m = abytes(message, void 0, "message");
  const pub = abytes(publicKey, 32, "publicKey");
  try {
    const P = lift_x(num(pub));
    const r = num(sig.subarray(0, 32));
    if (!Fp.isValidNot0(r))
      return false;
    const s = num(sig.subarray(32, 64));
    if (!Fn.isValidNot0(s))
      return false;
    const e = challenge(Fn.toBytes(r), pointToBytes(P), m);
    const R = BASE.multiplyUnsafe(s).add(P.multiplyUnsafe(Fn.neg(e)));
    const { x: x2, y } = R.toAffine();
    if (R.is0() || !hasEven(y) || x2 !== r)
      return false;
    return true;
  } catch (error) {
    return false;
  }
}
var schnorr = /* @__PURE__ */ (() => {
  const size = 32;
  const seedLength = 48;
  const randomSecretKey = (seed = randomBytes(seedLength)) => {
    return mapHashToField(seed, secp256k1_CURVE.n);
  };
  return {
    keygen: createKeygen(randomSecretKey, schnorrGetPublicKey),
    getPublicKey: schnorrGetPublicKey,
    sign: schnorrSign,
    verify: schnorrVerify,
    Point: Pointk1,
    utils: {
      randomSecretKey,
      taggedHash,
      lift_x,
      pointToBytes
    },
    lengths: {
      secretKey: size,
      publicKey: size,
      publicKeyHasPrefix: false,
      signature: size * 2,
      seed: seedLength
    }
  };
})();

// node_modules/@scure/base/index.js
function isBytes2(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
function abytes2(b) {
  if (!isBytes2(b))
    throw new Error("Uint8Array expected");
}
function isArrayOf(isString, arr) {
  if (!Array.isArray(arr))
    return false;
  if (arr.length === 0)
    return true;
  if (isString) {
    return arr.every((item) => typeof item === "string");
  } else {
    return arr.every((item) => Number.isSafeInteger(item));
  }
}
function afn(input2) {
  if (typeof input2 !== "function")
    throw new Error("function expected");
  return true;
}
function astr(label, input2) {
  if (typeof input2 !== "string")
    throw new Error(`${label}: string expected`);
  return true;
}
function anumber2(n) {
  if (!Number.isSafeInteger(n))
    throw new Error(`invalid integer: ${n}`);
}
function aArr(input2) {
  if (!Array.isArray(input2))
    throw new Error("array expected");
}
function astrArr(label, input2) {
  if (!isArrayOf(true, input2))
    throw new Error(`${label}: array of strings expected`);
}
function anumArr(label, input2) {
  if (!isArrayOf(false, input2))
    throw new Error(`${label}: array of numbers expected`);
}
// @__NO_SIDE_EFFECTS__
function chain(...args) {
  const id = (a) => a;
  const wrap = (a, b) => (c) => a(b(c));
  const encode = args.map((x2) => x2.encode).reduceRight(wrap, id);
  const decode2 = args.map((x2) => x2.decode).reduce(wrap, id);
  return { encode, decode: decode2 };
}
// @__NO_SIDE_EFFECTS__
function alphabet(letters) {
  const lettersA = typeof letters === "string" ? letters.split("") : letters;
  const len = lettersA.length;
  astrArr("alphabet", lettersA);
  const indexes = new Map(lettersA.map((l, i3) => [l, i3]));
  return {
    encode: (digits) => {
      aArr(digits);
      return digits.map((i3) => {
        if (!Number.isSafeInteger(i3) || i3 < 0 || i3 >= len)
          throw new Error(`alphabet.encode: digit index outside alphabet "${i3}". Allowed: ${letters}`);
        return lettersA[i3];
      });
    },
    decode: (input2) => {
      aArr(input2);
      return input2.map((letter) => {
        astr("alphabet.decode", letter);
        const i3 = indexes.get(letter);
        if (i3 === void 0)
          throw new Error(`Unknown letter: "${letter}". Allowed: ${letters}`);
        return i3;
      });
    }
  };
}
// @__NO_SIDE_EFFECTS__
function join(separator = "") {
  astr("join", separator);
  return {
    encode: (from) => {
      astrArr("join.decode", from);
      return from.join(separator);
    },
    decode: (to) => {
      astr("join.decode", to);
      return to.split(separator);
    }
  };
}
// @__NO_SIDE_EFFECTS__
function padding(bits2, chr = "=") {
  anumber2(bits2);
  astr("padding", chr);
  return {
    encode(data) {
      astrArr("padding.encode", data);
      while (data.length * bits2 % 8)
        data.push(chr);
      return data;
    },
    decode(input2) {
      astrArr("padding.decode", input2);
      let end = input2.length;
      if (end * bits2 % 8)
        throw new Error("padding: invalid, string should have whole number of bytes");
      for (; end > 0 && input2[end - 1] === chr; end--) {
        const last = end - 1;
        const byte = last * bits2;
        if (byte % 8 === 0)
          throw new Error("padding: invalid, string has too much padding");
      }
      return input2.slice(0, end);
    }
  };
}
var gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
var radix2carry = /* @__NO_SIDE_EFFECTS__ */ (from, to) => from + (to - gcd(from, to));
var powers = /* @__PURE__ */ (() => {
  let res = [];
  for (let i3 = 0; i3 < 40; i3++)
    res.push(2 ** i3);
  return res;
})();
function convertRadix2(data, from, to, padding2) {
  aArr(data);
  if (from <= 0 || from > 32)
    throw new Error(`convertRadix2: wrong from=${from}`);
  if (to <= 0 || to > 32)
    throw new Error(`convertRadix2: wrong to=${to}`);
  if (/* @__PURE__ */ radix2carry(from, to) > 32) {
    throw new Error(`convertRadix2: carry overflow from=${from} to=${to} carryBits=${/* @__PURE__ */ radix2carry(from, to)}`);
  }
  let carry = 0;
  let pos = 0;
  const max2 = powers[from];
  const mask = powers[to] - 1;
  const res = [];
  for (const n of data) {
    anumber2(n);
    if (n >= max2)
      throw new Error(`convertRadix2: invalid data word=${n} from=${from}`);
    carry = carry << from | n;
    if (pos + from > 32)
      throw new Error(`convertRadix2: carry overflow pos=${pos} from=${from}`);
    pos += from;
    for (; pos >= to; pos -= to)
      res.push((carry >> pos - to & mask) >>> 0);
    const pow = powers[pos];
    if (pow === void 0)
      throw new Error("invalid carry");
    carry &= pow - 1;
  }
  carry = carry << to - pos & mask;
  if (!padding2 && pos >= from)
    throw new Error("Excess padding");
  if (!padding2 && carry > 0)
    throw new Error(`Non-zero padding: ${carry}`);
  if (padding2 && pos > 0)
    res.push(carry >>> 0);
  return res;
}
// @__NO_SIDE_EFFECTS__
function radix2(bits2, revPadding = false) {
  anumber2(bits2);
  if (bits2 <= 0 || bits2 > 32)
    throw new Error("radix2: bits should be in (0..32]");
  if (/* @__PURE__ */ radix2carry(8, bits2) > 32 || /* @__PURE__ */ radix2carry(bits2, 8) > 32)
    throw new Error("radix2: carry overflow");
  return {
    encode: (bytes) => {
      if (!isBytes2(bytes))
        throw new Error("radix2.encode input should be Uint8Array");
      return convertRadix2(Array.from(bytes), 8, bits2, !revPadding);
    },
    decode: (digits) => {
      anumArr("radix2.decode", digits);
      return Uint8Array.from(convertRadix2(digits, bits2, 8, revPadding));
    }
  };
}
function unsafeWrapper(fn) {
  afn(fn);
  return function(...args) {
    try {
      return fn.apply(null, args);
    } catch (e) {
    }
  };
}
var hasBase64Builtin = /* @__PURE__ */ (() => typeof Uint8Array.from([]).toBase64 === "function" && typeof Uint8Array.fromBase64 === "function")();
var decodeBase64Builtin = (s, isUrl) => {
  astr("base64", s);
  const re = isUrl ? /^[A-Za-z0-9=_-]+$/ : /^[A-Za-z0-9=+/]+$/;
  const alphabet2 = isUrl ? "base64url" : "base64";
  if (s.length > 0 && !re.test(s))
    throw new Error("invalid base64");
  return Uint8Array.fromBase64(s, { alphabet: alphabet2, lastChunkHandling: "strict" });
};
var base64 = hasBase64Builtin ? {
  encode(b) {
    abytes2(b);
    return b.toBase64();
  },
  decode(s) {
    return decodeBase64Builtin(s, false);
  }
} : /* @__PURE__ */ chain(/* @__PURE__ */ radix2(6), /* @__PURE__ */ alphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"), /* @__PURE__ */ padding(6), /* @__PURE__ */ join(""));
var BECH_ALPHABET = /* @__PURE__ */ chain(/* @__PURE__ */ alphabet("qpzry9x8gf2tvdw0s3jn54khce6mua7l"), /* @__PURE__ */ join(""));
var POLYMOD_GENERATORS = [996825010, 642813549, 513874426, 1027748829, 705979059];
function bech32Polymod(pre) {
  const b = pre >> 25;
  let chk = (pre & 33554431) << 5;
  for (let i3 = 0; i3 < POLYMOD_GENERATORS.length; i3++) {
    if ((b >> i3 & 1) === 1)
      chk ^= POLYMOD_GENERATORS[i3];
  }
  return chk;
}
function bechChecksum(prefix, words, encodingConst = 1) {
  const len = prefix.length;
  let chk = 1;
  for (let i3 = 0; i3 < len; i3++) {
    const c = prefix.charCodeAt(i3);
    if (c < 33 || c > 126)
      throw new Error(`Invalid prefix (${prefix})`);
    chk = bech32Polymod(chk) ^ c >> 5;
  }
  chk = bech32Polymod(chk);
  for (let i3 = 0; i3 < len; i3++)
    chk = bech32Polymod(chk) ^ prefix.charCodeAt(i3) & 31;
  for (let v of words)
    chk = bech32Polymod(chk) ^ v;
  for (let i3 = 0; i3 < 6; i3++)
    chk = bech32Polymod(chk);
  chk ^= encodingConst;
  return BECH_ALPHABET.encode(convertRadix2([chk % powers[30]], 30, 5, false));
}
// @__NO_SIDE_EFFECTS__
function genBech32(encoding) {
  const ENCODING_CONST = encoding === "bech32" ? 1 : 734539939;
  const _words = /* @__PURE__ */ radix2(5);
  const fromWords = _words.decode;
  const toWords = _words.encode;
  const fromWordsUnsafe = unsafeWrapper(fromWords);
  function encode(prefix, words, limit = 90) {
    astr("bech32.encode prefix", prefix);
    if (isBytes2(words))
      words = Array.from(words);
    anumArr("bech32.encode", words);
    const plen = prefix.length;
    if (plen === 0)
      throw new TypeError(`Invalid prefix length ${plen}`);
    const actualLength = plen + 7 + words.length;
    if (limit !== false && actualLength > limit)
      throw new TypeError(`Length ${actualLength} exceeds limit ${limit}`);
    const lowered = prefix.toLowerCase();
    const sum = bechChecksum(lowered, words, ENCODING_CONST);
    return `${lowered}1${BECH_ALPHABET.encode(words)}${sum}`;
  }
  function decode2(str, limit = 90) {
    astr("bech32.decode input", str);
    const slen = str.length;
    if (slen < 8 || limit !== false && slen > limit)
      throw new TypeError(`invalid string length: ${slen} (${str}). Expected (8..${limit})`);
    const lowered = str.toLowerCase();
    if (str !== lowered && str !== str.toUpperCase())
      throw new Error(`String must be lowercase or uppercase`);
    const sepIndex = lowered.lastIndexOf("1");
    if (sepIndex === 0 || sepIndex === -1)
      throw new Error(`Letter "1" must be present between prefix and data only`);
    const prefix = lowered.slice(0, sepIndex);
    const data = lowered.slice(sepIndex + 1);
    if (data.length < 6)
      throw new Error("Data must be at least 6 characters long");
    const words = BECH_ALPHABET.decode(data).slice(0, -6);
    const sum = bechChecksum(prefix, words, ENCODING_CONST);
    if (!data.endsWith(sum))
      throw new Error(`Invalid checksum in ${str}: expected "${sum}"`);
    return { prefix, words };
  }
  const decodeUnsafe = unsafeWrapper(decode2);
  function decodeToBytes(str) {
    const { prefix, words } = decode2(str, false);
    return { prefix, words, bytes: fromWords(words) };
  }
  function encodeFromBytes(prefix, bytes) {
    return encode(prefix, toWords(bytes));
  }
  return {
    encode,
    decode: decode2,
    encodeFromBytes,
    decodeToBytes,
    decodeUnsafe,
    fromWords,
    fromWordsUnsafe,
    toWords
  };
}
var bech32 = /* @__PURE__ */ genBech32("bech32");

// node_modules/@noble/ciphers/utils.js
function isBytes3(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
function abool2(b) {
  if (typeof b !== "boolean")
    throw new Error(`boolean expected, not ${b}`);
}
function anumber3(n) {
  if (!Number.isSafeInteger(n) || n < 0)
    throw new Error("positive integer expected, got " + n);
}
function abytes3(value, length, title = "") {
  const bytes = isBytes3(value);
  const len = value?.length;
  const needsLen = length !== void 0;
  if (!bytes || needsLen && len !== length) {
    const prefix = title && `"${title}" `;
    const ofLen = needsLen ? ` of length ${length}` : "";
    const got = bytes ? `length=${len}` : `type=${typeof value}`;
    throw new Error(prefix + "expected Uint8Array" + ofLen + ", got " + got);
  }
  return value;
}
function aexists2(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called");
}
function aoutput2(out, instance) {
  abytes3(out, void 0, "output");
  const min = instance.outputLen;
  if (out.length < min) {
    throw new Error("digestInto() expects output buffer of length at least " + min);
  }
}
function u32(arr) {
  return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
}
function clean2(...arrays) {
  for (let i3 = 0; i3 < arrays.length; i3++) {
    arrays[i3].fill(0);
  }
}
function createView2(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
var isLE = /* @__PURE__ */ (() => new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68)();
function overlapBytes(a, b) {
  return a.buffer === b.buffer && // best we can do, may fail with an obscure Proxy
  a.byteOffset < b.byteOffset + b.byteLength && // a starts before b end
  b.byteOffset < a.byteOffset + a.byteLength;
}
function complexOverlapBytes(input2, output) {
  if (overlapBytes(input2, output) && input2.byteOffset < output.byteOffset)
    throw new Error("complex overlap of input and output is not supported");
}
function checkOpts(defaults, opts) {
  if (opts == null || typeof opts !== "object")
    throw new Error("options must be defined");
  const merged = Object.assign(defaults, opts);
  return merged;
}
function equalBytes(a, b) {
  if (a.length !== b.length)
    return false;
  let diff = 0;
  for (let i3 = 0; i3 < a.length; i3++)
    diff |= a[i3] ^ b[i3];
  return diff === 0;
}
var wrapCipher = /* @__NO_SIDE_EFFECTS__ */ (params, constructor) => {
  function wrappedCipher(key, ...args) {
    abytes3(key, void 0, "key");
    if (!isLE)
      throw new Error("Non little-endian hardware is not yet supported");
    if (params.nonceLength !== void 0) {
      const nonce = args[0];
      abytes3(nonce, params.varSizeNonce ? void 0 : params.nonceLength, "nonce");
    }
    const tagl = params.tagLength;
    if (tagl && args[1] !== void 0)
      abytes3(args[1], void 0, "AAD");
    const cipher = constructor(key, ...args);
    const checkOutput = (fnLength, output) => {
      if (output !== void 0) {
        if (fnLength !== 2)
          throw new Error("cipher output not supported");
        abytes3(output, void 0, "output");
      }
    };
    let called = false;
    const wrCipher = {
      encrypt(data, output) {
        if (called)
          throw new Error("cannot encrypt() twice with same key + nonce");
        called = true;
        abytes3(data);
        checkOutput(cipher.encrypt.length, output);
        return cipher.encrypt(data, output);
      },
      decrypt(data, output) {
        abytes3(data);
        if (tagl && data.length < tagl)
          throw new Error('"ciphertext" expected length bigger than tagLength=' + tagl);
        checkOutput(cipher.decrypt.length, output);
        return cipher.decrypt(data, output);
      }
    };
    return wrCipher;
  }
  Object.assign(wrappedCipher, params);
  return wrappedCipher;
};
function getOutput(expectedLength, out, onlyAligned = true) {
  if (out === void 0)
    return new Uint8Array(expectedLength);
  if (out.length !== expectedLength)
    throw new Error('"output" expected Uint8Array of length ' + expectedLength + ", got: " + out.length);
  if (onlyAligned && !isAligned32(out))
    throw new Error("invalid output, must be aligned");
  return out;
}
function u64Lengths(dataLength, aadLength, isLE2) {
  abool2(isLE2);
  const num2 = new Uint8Array(16);
  const view = createView2(num2);
  view.setBigUint64(0, BigInt(aadLength), isLE2);
  view.setBigUint64(8, BigInt(dataLength), isLE2);
  return num2;
}
function isAligned32(bytes) {
  return bytes.byteOffset % 4 === 0;
}
function copyBytes2(bytes) {
  return Uint8Array.from(bytes);
}

// node_modules/@noble/ciphers/aes.js
var BLOCK_SIZE = 16;
var POLY = 283;
function validateKeyLength(key) {
  if (![16, 24, 32].includes(key.length))
    throw new Error('"aes key" expected Uint8Array of length 16/24/32, got length=' + key.length);
}
function mul2(n) {
  return n << 1 ^ POLY & -(n >> 7);
}
function mul(a, b) {
  let res = 0;
  for (; b > 0; b >>= 1) {
    res ^= a & -(b & 1);
    a = mul2(a);
  }
  return res;
}
var sbox = /* @__PURE__ */ (() => {
  const t = new Uint8Array(256);
  for (let i3 = 0, x2 = 1; i3 < 256; i3++, x2 ^= mul2(x2))
    t[i3] = x2;
  const box = new Uint8Array(256);
  box[0] = 99;
  for (let i3 = 0; i3 < 255; i3++) {
    let x2 = t[255 - i3];
    x2 |= x2 << 8;
    box[t[i3]] = (x2 ^ x2 >> 4 ^ x2 >> 5 ^ x2 >> 6 ^ x2 >> 7 ^ 99) & 255;
  }
  clean2(t);
  return box;
})();
var invSbox = /* @__PURE__ */ sbox.map((_, j) => sbox.indexOf(j));
var rotr32_8 = (n) => n << 24 | n >>> 8;
var rotl32_8 = (n) => n << 8 | n >>> 24;
function genTtable(sbox2, fn) {
  if (sbox2.length !== 256)
    throw new Error("Wrong sbox length");
  const T0 = new Uint32Array(256).map((_, j) => fn(sbox2[j]));
  const T1 = T0.map(rotl32_8);
  const T2 = T1.map(rotl32_8);
  const T3 = T2.map(rotl32_8);
  const T01 = new Uint32Array(256 * 256);
  const T23 = new Uint32Array(256 * 256);
  const sbox22 = new Uint16Array(256 * 256);
  for (let i3 = 0; i3 < 256; i3++) {
    for (let j = 0; j < 256; j++) {
      const idx = i3 * 256 + j;
      T01[idx] = T0[i3] ^ T1[j];
      T23[idx] = T2[i3] ^ T3[j];
      sbox22[idx] = sbox2[i3] << 8 | sbox2[j];
    }
  }
  return { sbox: sbox2, sbox2: sbox22, T0, T1, T2, T3, T01, T23 };
}
var tableEncoding = /* @__PURE__ */ genTtable(sbox, (s) => mul(s, 3) << 24 | s << 16 | s << 8 | mul(s, 2));
var tableDecoding = /* @__PURE__ */ genTtable(invSbox, (s) => mul(s, 11) << 24 | mul(s, 13) << 16 | mul(s, 9) << 8 | mul(s, 14));
var xPowers = /* @__PURE__ */ (() => {
  const p = new Uint8Array(16);
  for (let i3 = 0, x2 = 1; i3 < 16; i3++, x2 = mul2(x2))
    p[i3] = x2;
  return p;
})();
function expandKeyLE(key) {
  abytes3(key);
  const len = key.length;
  validateKeyLength(key);
  const { sbox2 } = tableEncoding;
  const toClean = [];
  if (!isAligned32(key))
    toClean.push(key = copyBytes2(key));
  const k32 = u32(key);
  const Nk = k32.length;
  const subByte = (n) => applySbox(sbox2, n, n, n, n);
  const xk = new Uint32Array(len + 28);
  xk.set(k32);
  for (let i3 = Nk; i3 < xk.length; i3++) {
    let t = xk[i3 - 1];
    if (i3 % Nk === 0)
      t = subByte(rotr32_8(t)) ^ xPowers[i3 / Nk - 1];
    else if (Nk > 6 && i3 % Nk === 4)
      t = subByte(t);
    xk[i3] = xk[i3 - Nk] ^ t;
  }
  clean2(...toClean);
  return xk;
}
function expandKeyDecLE(key) {
  const encKey = expandKeyLE(key);
  const xk = encKey.slice();
  const Nk = encKey.length;
  const { sbox2 } = tableEncoding;
  const { T0, T1, T2, T3 } = tableDecoding;
  for (let i3 = 0; i3 < Nk; i3 += 4) {
    for (let j = 0; j < 4; j++)
      xk[i3 + j] = encKey[Nk - i3 - 4 + j];
  }
  clean2(encKey);
  for (let i3 = 4; i3 < Nk - 4; i3++) {
    const x2 = xk[i3];
    const w = applySbox(sbox2, x2, x2, x2, x2);
    xk[i3] = T0[w & 255] ^ T1[w >>> 8 & 255] ^ T2[w >>> 16 & 255] ^ T3[w >>> 24];
  }
  return xk;
}
function apply0123(T01, T23, s0, s1, s2, s3) {
  return T01[s0 << 8 & 65280 | s1 >>> 8 & 255] ^ T23[s2 >>> 8 & 65280 | s3 >>> 24 & 255];
}
function applySbox(sbox2, s0, s1, s2, s3) {
  return sbox2[s0 & 255 | s1 & 65280] | sbox2[s2 >>> 16 & 255 | s3 >>> 16 & 65280] << 16;
}
function encrypt(xk, s0, s1, s2, s3) {
  const { sbox2, T01, T23 } = tableEncoding;
  let k = 0;
  s0 ^= xk[k++], s1 ^= xk[k++], s2 ^= xk[k++], s3 ^= xk[k++];
  const rounds = xk.length / 4 - 2;
  for (let i3 = 0; i3 < rounds; i3++) {
    const t02 = xk[k++] ^ apply0123(T01, T23, s0, s1, s2, s3);
    const t12 = xk[k++] ^ apply0123(T01, T23, s1, s2, s3, s0);
    const t22 = xk[k++] ^ apply0123(T01, T23, s2, s3, s0, s1);
    const t32 = xk[k++] ^ apply0123(T01, T23, s3, s0, s1, s2);
    s0 = t02, s1 = t12, s2 = t22, s3 = t32;
  }
  const t0 = xk[k++] ^ applySbox(sbox2, s0, s1, s2, s3);
  const t1 = xk[k++] ^ applySbox(sbox2, s1, s2, s3, s0);
  const t2 = xk[k++] ^ applySbox(sbox2, s2, s3, s0, s1);
  const t3 = xk[k++] ^ applySbox(sbox2, s3, s0, s1, s2);
  return { s0: t0, s1: t1, s2: t2, s3: t3 };
}
function decrypt(xk, s0, s1, s2, s3) {
  const { sbox2, T01, T23 } = tableDecoding;
  let k = 0;
  s0 ^= xk[k++], s1 ^= xk[k++], s2 ^= xk[k++], s3 ^= xk[k++];
  const rounds = xk.length / 4 - 2;
  for (let i3 = 0; i3 < rounds; i3++) {
    const t02 = xk[k++] ^ apply0123(T01, T23, s0, s3, s2, s1);
    const t12 = xk[k++] ^ apply0123(T01, T23, s1, s0, s3, s2);
    const t22 = xk[k++] ^ apply0123(T01, T23, s2, s1, s0, s3);
    const t32 = xk[k++] ^ apply0123(T01, T23, s3, s2, s1, s0);
    s0 = t02, s1 = t12, s2 = t22, s3 = t32;
  }
  const t0 = xk[k++] ^ applySbox(sbox2, s0, s3, s2, s1);
  const t1 = xk[k++] ^ applySbox(sbox2, s1, s0, s3, s2);
  const t2 = xk[k++] ^ applySbox(sbox2, s2, s1, s0, s3);
  const t3 = xk[k++] ^ applySbox(sbox2, s3, s2, s1, s0);
  return { s0: t0, s1: t1, s2: t2, s3: t3 };
}
function validateBlockDecrypt(data) {
  abytes3(data);
  if (data.length % BLOCK_SIZE !== 0) {
    throw new Error("aes-(cbc/ecb).decrypt ciphertext should consist of blocks with size " + BLOCK_SIZE);
  }
}
function validateBlockEncrypt(plaintext, pcks5, dst) {
  abytes3(plaintext);
  let outLen = plaintext.length;
  const remaining = outLen % BLOCK_SIZE;
  if (!pcks5 && remaining !== 0)
    throw new Error("aec/(cbc-ecb): unpadded plaintext with disabled padding");
  if (!isAligned32(plaintext))
    plaintext = copyBytes2(plaintext);
  const b = u32(plaintext);
  if (pcks5) {
    let left = BLOCK_SIZE - remaining;
    if (!left)
      left = BLOCK_SIZE;
    outLen = outLen + left;
  }
  dst = getOutput(outLen, dst);
  complexOverlapBytes(plaintext, dst);
  const o = u32(dst);
  return { b, o, out: dst };
}
function validatePCKS(data, pcks5) {
  if (!pcks5)
    return data;
  const len = data.length;
  if (!len)
    throw new Error("aes/pcks5: empty ciphertext not allowed");
  const lastByte = data[len - 1];
  if (lastByte <= 0 || lastByte > 16)
    throw new Error("aes/pcks5: wrong padding");
  const out = data.subarray(0, -lastByte);
  for (let i3 = 0; i3 < lastByte; i3++)
    if (data[len - i3 - 1] !== lastByte)
      throw new Error("aes/pcks5: wrong padding");
  return out;
}
function padPCKS(left) {
  const tmp = new Uint8Array(16);
  const tmp32 = u32(tmp);
  tmp.set(left);
  const paddingByte = BLOCK_SIZE - left.length;
  for (let i3 = BLOCK_SIZE - paddingByte; i3 < BLOCK_SIZE; i3++)
    tmp[i3] = paddingByte;
  return tmp32;
}
var cbc = /* @__PURE__ */ wrapCipher({ blockSize: 16, nonceLength: 16 }, function aescbc(key, iv, opts = {}) {
  const pcks5 = !opts.disablePadding;
  return {
    encrypt(plaintext, dst) {
      const xk = expandKeyLE(key);
      const { b, o, out: _out } = validateBlockEncrypt(plaintext, pcks5, dst);
      let _iv = iv;
      const toClean = [xk];
      if (!isAligned32(_iv))
        toClean.push(_iv = copyBytes2(_iv));
      const n32 = u32(_iv);
      let s0 = n32[0], s1 = n32[1], s2 = n32[2], s3 = n32[3];
      let i3 = 0;
      for (; i3 + 4 <= b.length; ) {
        s0 ^= b[i3 + 0], s1 ^= b[i3 + 1], s2 ^= b[i3 + 2], s3 ^= b[i3 + 3];
        ({ s0, s1, s2, s3 } = encrypt(xk, s0, s1, s2, s3));
        o[i3++] = s0, o[i3++] = s1, o[i3++] = s2, o[i3++] = s3;
      }
      if (pcks5) {
        const tmp32 = padPCKS(plaintext.subarray(i3 * 4));
        s0 ^= tmp32[0], s1 ^= tmp32[1], s2 ^= tmp32[2], s3 ^= tmp32[3];
        ({ s0, s1, s2, s3 } = encrypt(xk, s0, s1, s2, s3));
        o[i3++] = s0, o[i3++] = s1, o[i3++] = s2, o[i3++] = s3;
      }
      clean2(...toClean);
      return _out;
    },
    decrypt(ciphertext, dst) {
      validateBlockDecrypt(ciphertext);
      const xk = expandKeyDecLE(key);
      let _iv = iv;
      const toClean = [xk];
      if (!isAligned32(_iv))
        toClean.push(_iv = copyBytes2(_iv));
      const n32 = u32(_iv);
      dst = getOutput(ciphertext.length, dst);
      if (!isAligned32(ciphertext))
        toClean.push(ciphertext = copyBytes2(ciphertext));
      complexOverlapBytes(ciphertext, dst);
      const b = u32(ciphertext);
      const o = u32(dst);
      let s0 = n32[0], s1 = n32[1], s2 = n32[2], s3 = n32[3];
      for (let i3 = 0; i3 + 4 <= b.length; ) {
        const ps0 = s0, ps1 = s1, ps2 = s2, ps3 = s3;
        s0 = b[i3 + 0], s1 = b[i3 + 1], s2 = b[i3 + 2], s3 = b[i3 + 3];
        const { s0: o0, s1: o1, s2: o2, s3: o3 } = decrypt(xk, s0, s1, s2, s3);
        o[i3++] = o0 ^ ps0, o[i3++] = o1 ^ ps1, o[i3++] = o2 ^ ps2, o[i3++] = o3 ^ ps3;
      }
      clean2(...toClean);
      return validatePCKS(dst, pcks5);
    }
  };
});
function isBytes32(a) {
  return a instanceof Uint32Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint32Array";
}
function encryptBlock(xk, block) {
  abytes3(block, 16, "block");
  if (!isBytes32(xk))
    throw new Error("_encryptBlock accepts result of expandKeyLE");
  const b32 = u32(block);
  let { s0, s1, s2, s3 } = encrypt(xk, b32[0], b32[1], b32[2], b32[3]);
  b32[0] = s0, b32[1] = s1, b32[2] = s2, b32[3] = s3;
  return block;
}
function dbl(block) {
  let carry = 0;
  for (let i3 = BLOCK_SIZE - 1; i3 >= 0; i3--) {
    const newCarry = (block[i3] & 128) >>> 7;
    block[i3] = block[i3] << 1 | carry;
    carry = newCarry;
  }
  if (carry) {
    block[BLOCK_SIZE - 1] ^= 135;
  }
  return block;
}
function xorBlock(a, b) {
  if (a.length !== b.length)
    throw new Error("xorBlock: blocks must have same length");
  for (let i3 = 0; i3 < a.length; i3++) {
    a[i3] = a[i3] ^ b[i3];
  }
  return a;
}
var _CMAC = class {
  buffer;
  destroyed;
  k1;
  k2;
  xk;
  constructor(key) {
    abytes3(key);
    validateKeyLength(key);
    this.xk = expandKeyLE(key);
    this.buffer = new Uint8Array(0);
    this.destroyed = false;
    const L = new Uint8Array(BLOCK_SIZE);
    encryptBlock(this.xk, L);
    this.k1 = dbl(L);
    this.k2 = dbl(new Uint8Array(this.k1));
  }
  update(data) {
    const { destroyed, buffer } = this;
    if (destroyed)
      throw new Error("CMAC instance was destroyed");
    abytes3(data);
    const newBuffer = new Uint8Array(buffer.length + data.length);
    newBuffer.set(buffer);
    newBuffer.set(data, buffer.length);
    this.buffer = newBuffer;
    return this;
  }
  // see https://www.rfc-editor.org/rfc/rfc4493.html#section-2.4
  digest() {
    if (this.destroyed)
      throw new Error("CMAC instance was destroyed");
    const { buffer } = this;
    const msgLen = buffer.length;
    let n = Math.ceil(msgLen / BLOCK_SIZE);
    let flag2;
    if (n === 0) {
      n = 1;
      flag2 = false;
    } else {
      flag2 = msgLen % BLOCK_SIZE === 0;
    }
    const lastBlockStart = (n - 1) * BLOCK_SIZE;
    const lastBlockData = buffer.subarray(lastBlockStart);
    let m_last;
    if (flag2) {
      m_last = xorBlock(new Uint8Array(lastBlockData), this.k1);
    } else {
      const padded = new Uint8Array(BLOCK_SIZE);
      padded.set(lastBlockData);
      padded[lastBlockData.length] = 128;
      m_last = xorBlock(padded, this.k2);
    }
    let x2 = new Uint8Array(BLOCK_SIZE);
    for (let i3 = 0; i3 < n - 1; i3++) {
      const m_i = buffer.subarray(i3 * BLOCK_SIZE, (i3 + 1) * BLOCK_SIZE);
      xorBlock(x2, m_i);
      encryptBlock(this.xk, x2);
    }
    xorBlock(x2, m_last);
    encryptBlock(this.xk, x2);
    clean2(m_last);
    return x2;
  }
  destroy() {
    const { buffer, destroyed, xk, k1, k2 } = this;
    if (destroyed)
      return;
    this.destroyed = true;
    clean2(buffer, xk, k1, k2);
  }
};
var cmac = (key, message) => new _CMAC(key).update(message).digest();
cmac.create = (key) => new _CMAC(key);

// node_modules/@noble/ciphers/_arx.js
var encodeStr = (str) => Uint8Array.from(str.split(""), (c) => c.charCodeAt(0));
var sigma16 = encodeStr("expand 16-byte k");
var sigma32 = encodeStr("expand 32-byte k");
var sigma16_32 = u32(sigma16);
var sigma32_32 = u32(sigma32);
function rotl(a, b) {
  return a << b | a >>> 32 - b;
}
function isAligned322(b) {
  return b.byteOffset % 4 === 0;
}
var BLOCK_LEN = 64;
var BLOCK_LEN32 = 16;
var MAX_COUNTER = 2 ** 32 - 1;
var U32_EMPTY = Uint32Array.of();
function runCipher(core, sigma, key, nonce, data, output, counter, rounds) {
  const len = data.length;
  const block = new Uint8Array(BLOCK_LEN);
  const b32 = u32(block);
  const isAligned = isAligned322(data) && isAligned322(output);
  const d32 = isAligned ? u32(data) : U32_EMPTY;
  const o32 = isAligned ? u32(output) : U32_EMPTY;
  for (let pos = 0; pos < len; counter++) {
    core(sigma, key, nonce, b32, counter, rounds);
    if (counter >= MAX_COUNTER)
      throw new Error("arx: counter overflow");
    const take = Math.min(BLOCK_LEN, len - pos);
    if (isAligned && take === BLOCK_LEN) {
      const pos32 = pos / 4;
      if (pos % 4 !== 0)
        throw new Error("arx: invalid block position");
      for (let j = 0, posj; j < BLOCK_LEN32; j++) {
        posj = pos32 + j;
        o32[posj] = d32[posj] ^ b32[j];
      }
      pos += BLOCK_LEN;
      continue;
    }
    for (let j = 0, posj; j < take; j++) {
      posj = pos + j;
      output[posj] = data[posj] ^ block[j];
    }
    pos += take;
  }
}
function createCipher(core, opts) {
  const { allowShortKeys, extendNonceFn, counterLength, counterRight, rounds } = checkOpts({ allowShortKeys: false, counterLength: 8, counterRight: false, rounds: 20 }, opts);
  if (typeof core !== "function")
    throw new Error("core must be a function");
  anumber3(counterLength);
  anumber3(rounds);
  abool2(counterRight);
  abool2(allowShortKeys);
  return (key, nonce, data, output, counter = 0) => {
    abytes3(key, void 0, "key");
    abytes3(nonce, void 0, "nonce");
    abytes3(data, void 0, "data");
    const len = data.length;
    if (output === void 0)
      output = new Uint8Array(len);
    abytes3(output, void 0, "output");
    anumber3(counter);
    if (counter < 0 || counter >= MAX_COUNTER)
      throw new Error("arx: counter overflow");
    if (output.length < len)
      throw new Error(`arx: output (${output.length}) is shorter than data (${len})`);
    const toClean = [];
    let l = key.length;
    let k;
    let sigma;
    if (l === 32) {
      toClean.push(k = copyBytes2(key));
      sigma = sigma32_32;
    } else if (l === 16 && allowShortKeys) {
      k = new Uint8Array(32);
      k.set(key);
      k.set(key, 16);
      sigma = sigma16_32;
      toClean.push(k);
    } else {
      abytes3(key, 32, "arx key");
      throw new Error("invalid key size");
    }
    if (!isAligned322(nonce))
      toClean.push(nonce = copyBytes2(nonce));
    const k32 = u32(k);
    if (extendNonceFn) {
      if (nonce.length !== 24)
        throw new Error(`arx: extended nonce must be 24 bytes`);
      extendNonceFn(sigma, k32, u32(nonce.subarray(0, 16)), k32);
      nonce = nonce.subarray(16);
    }
    const nonceNcLen = 16 - counterLength;
    if (nonceNcLen !== nonce.length)
      throw new Error(`arx: nonce must be ${nonceNcLen} or 16 bytes`);
    if (nonceNcLen !== 12) {
      const nc = new Uint8Array(12);
      nc.set(nonce, counterRight ? 0 : 12 - nonce.length);
      nonce = nc;
      toClean.push(nonce);
    }
    const n32 = u32(nonce);
    runCipher(core, sigma, k32, n32, data, output, counter, rounds);
    clean2(...toClean);
    return output;
  };
}

// node_modules/@noble/ciphers/_poly1305.js
function u8to16(a, i3) {
  return a[i3++] & 255 | (a[i3++] & 255) << 8;
}
var Poly1305 = class {
  blockLen = 16;
  outputLen = 16;
  buffer = new Uint8Array(16);
  r = new Uint16Array(10);
  // Allocating 1 array with .subarray() here is slower than 3
  h = new Uint16Array(10);
  pad = new Uint16Array(8);
  pos = 0;
  finished = false;
  // Can be speed-up using BigUint64Array, at the cost of complexity
  constructor(key) {
    key = copyBytes2(abytes3(key, 32, "key"));
    const t0 = u8to16(key, 0);
    const t1 = u8to16(key, 2);
    const t2 = u8to16(key, 4);
    const t3 = u8to16(key, 6);
    const t4 = u8to16(key, 8);
    const t5 = u8to16(key, 10);
    const t6 = u8to16(key, 12);
    const t7 = u8to16(key, 14);
    this.r[0] = t0 & 8191;
    this.r[1] = (t0 >>> 13 | t1 << 3) & 8191;
    this.r[2] = (t1 >>> 10 | t2 << 6) & 7939;
    this.r[3] = (t2 >>> 7 | t3 << 9) & 8191;
    this.r[4] = (t3 >>> 4 | t4 << 12) & 255;
    this.r[5] = t4 >>> 1 & 8190;
    this.r[6] = (t4 >>> 14 | t5 << 2) & 8191;
    this.r[7] = (t5 >>> 11 | t6 << 5) & 8065;
    this.r[8] = (t6 >>> 8 | t7 << 8) & 8191;
    this.r[9] = t7 >>> 5 & 127;
    for (let i3 = 0; i3 < 8; i3++)
      this.pad[i3] = u8to16(key, 16 + 2 * i3);
  }
  process(data, offset, isLast = false) {
    const hibit = isLast ? 0 : 1 << 11;
    const { h, r } = this;
    const r0 = r[0];
    const r1 = r[1];
    const r2 = r[2];
    const r3 = r[3];
    const r4 = r[4];
    const r5 = r[5];
    const r6 = r[6];
    const r7 = r[7];
    const r8 = r[8];
    const r9 = r[9];
    const t0 = u8to16(data, offset + 0);
    const t1 = u8to16(data, offset + 2);
    const t2 = u8to16(data, offset + 4);
    const t3 = u8to16(data, offset + 6);
    const t4 = u8to16(data, offset + 8);
    const t5 = u8to16(data, offset + 10);
    const t6 = u8to16(data, offset + 12);
    const t7 = u8to16(data, offset + 14);
    let h0 = h[0] + (t0 & 8191);
    let h1 = h[1] + ((t0 >>> 13 | t1 << 3) & 8191);
    let h2 = h[2] + ((t1 >>> 10 | t2 << 6) & 8191);
    let h3 = h[3] + ((t2 >>> 7 | t3 << 9) & 8191);
    let h4 = h[4] + ((t3 >>> 4 | t4 << 12) & 8191);
    let h5 = h[5] + (t4 >>> 1 & 8191);
    let h6 = h[6] + ((t4 >>> 14 | t5 << 2) & 8191);
    let h7 = h[7] + ((t5 >>> 11 | t6 << 5) & 8191);
    let h8 = h[8] + ((t6 >>> 8 | t7 << 8) & 8191);
    let h9 = h[9] + (t7 >>> 5 | hibit);
    let c = 0;
    let d0 = c + h0 * r0 + h1 * (5 * r9) + h2 * (5 * r8) + h3 * (5 * r7) + h4 * (5 * r6);
    c = d0 >>> 13;
    d0 &= 8191;
    d0 += h5 * (5 * r5) + h6 * (5 * r4) + h7 * (5 * r3) + h8 * (5 * r2) + h9 * (5 * r1);
    c += d0 >>> 13;
    d0 &= 8191;
    let d1 = c + h0 * r1 + h1 * r0 + h2 * (5 * r9) + h3 * (5 * r8) + h4 * (5 * r7);
    c = d1 >>> 13;
    d1 &= 8191;
    d1 += h5 * (5 * r6) + h6 * (5 * r5) + h7 * (5 * r4) + h8 * (5 * r3) + h9 * (5 * r2);
    c += d1 >>> 13;
    d1 &= 8191;
    let d2 = c + h0 * r2 + h1 * r1 + h2 * r0 + h3 * (5 * r9) + h4 * (5 * r8);
    c = d2 >>> 13;
    d2 &= 8191;
    d2 += h5 * (5 * r7) + h6 * (5 * r6) + h7 * (5 * r5) + h8 * (5 * r4) + h9 * (5 * r3);
    c += d2 >>> 13;
    d2 &= 8191;
    let d3 = c + h0 * r3 + h1 * r2 + h2 * r1 + h3 * r0 + h4 * (5 * r9);
    c = d3 >>> 13;
    d3 &= 8191;
    d3 += h5 * (5 * r8) + h6 * (5 * r7) + h7 * (5 * r6) + h8 * (5 * r5) + h9 * (5 * r4);
    c += d3 >>> 13;
    d3 &= 8191;
    let d4 = c + h0 * r4 + h1 * r3 + h2 * r2 + h3 * r1 + h4 * r0;
    c = d4 >>> 13;
    d4 &= 8191;
    d4 += h5 * (5 * r9) + h6 * (5 * r8) + h7 * (5 * r7) + h8 * (5 * r6) + h9 * (5 * r5);
    c += d4 >>> 13;
    d4 &= 8191;
    let d5 = c + h0 * r5 + h1 * r4 + h2 * r3 + h3 * r2 + h4 * r1;
    c = d5 >>> 13;
    d5 &= 8191;
    d5 += h5 * r0 + h6 * (5 * r9) + h7 * (5 * r8) + h8 * (5 * r7) + h9 * (5 * r6);
    c += d5 >>> 13;
    d5 &= 8191;
    let d6 = c + h0 * r6 + h1 * r5 + h2 * r4 + h3 * r3 + h4 * r2;
    c = d6 >>> 13;
    d6 &= 8191;
    d6 += h5 * r1 + h6 * r0 + h7 * (5 * r9) + h8 * (5 * r8) + h9 * (5 * r7);
    c += d6 >>> 13;
    d6 &= 8191;
    let d7 = c + h0 * r7 + h1 * r6 + h2 * r5 + h3 * r4 + h4 * r3;
    c = d7 >>> 13;
    d7 &= 8191;
    d7 += h5 * r2 + h6 * r1 + h7 * r0 + h8 * (5 * r9) + h9 * (5 * r8);
    c += d7 >>> 13;
    d7 &= 8191;
    let d8 = c + h0 * r8 + h1 * r7 + h2 * r6 + h3 * r5 + h4 * r4;
    c = d8 >>> 13;
    d8 &= 8191;
    d8 += h5 * r3 + h6 * r2 + h7 * r1 + h8 * r0 + h9 * (5 * r9);
    c += d8 >>> 13;
    d8 &= 8191;
    let d9 = c + h0 * r9 + h1 * r8 + h2 * r7 + h3 * r6 + h4 * r5;
    c = d9 >>> 13;
    d9 &= 8191;
    d9 += h5 * r4 + h6 * r3 + h7 * r2 + h8 * r1 + h9 * r0;
    c += d9 >>> 13;
    d9 &= 8191;
    c = (c << 2) + c | 0;
    c = c + d0 | 0;
    d0 = c & 8191;
    c = c >>> 13;
    d1 += c;
    h[0] = d0;
    h[1] = d1;
    h[2] = d2;
    h[3] = d3;
    h[4] = d4;
    h[5] = d5;
    h[6] = d6;
    h[7] = d7;
    h[8] = d8;
    h[9] = d9;
  }
  finalize() {
    const { h, pad: pad2 } = this;
    const g = new Uint16Array(10);
    let c = h[1] >>> 13;
    h[1] &= 8191;
    for (let i3 = 2; i3 < 10; i3++) {
      h[i3] += c;
      c = h[i3] >>> 13;
      h[i3] &= 8191;
    }
    h[0] += c * 5;
    c = h[0] >>> 13;
    h[0] &= 8191;
    h[1] += c;
    c = h[1] >>> 13;
    h[1] &= 8191;
    h[2] += c;
    g[0] = h[0] + 5;
    c = g[0] >>> 13;
    g[0] &= 8191;
    for (let i3 = 1; i3 < 10; i3++) {
      g[i3] = h[i3] + c;
      c = g[i3] >>> 13;
      g[i3] &= 8191;
    }
    g[9] -= 1 << 13;
    let mask = (c ^ 1) - 1;
    for (let i3 = 0; i3 < 10; i3++)
      g[i3] &= mask;
    mask = ~mask;
    for (let i3 = 0; i3 < 10; i3++)
      h[i3] = h[i3] & mask | g[i3];
    h[0] = (h[0] | h[1] << 13) & 65535;
    h[1] = (h[1] >>> 3 | h[2] << 10) & 65535;
    h[2] = (h[2] >>> 6 | h[3] << 7) & 65535;
    h[3] = (h[3] >>> 9 | h[4] << 4) & 65535;
    h[4] = (h[4] >>> 12 | h[5] << 1 | h[6] << 14) & 65535;
    h[5] = (h[6] >>> 2 | h[7] << 11) & 65535;
    h[6] = (h[7] >>> 5 | h[8] << 8) & 65535;
    h[7] = (h[8] >>> 8 | h[9] << 5) & 65535;
    let f = h[0] + pad2[0];
    h[0] = f & 65535;
    for (let i3 = 1; i3 < 8; i3++) {
      f = (h[i3] + pad2[i3] | 0) + (f >>> 16) | 0;
      h[i3] = f & 65535;
    }
    clean2(g);
  }
  update(data) {
    aexists2(this);
    abytes3(data);
    data = copyBytes2(data);
    const { buffer, blockLen } = this;
    const len = data.length;
    for (let pos = 0; pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      if (take === blockLen) {
        for (; blockLen <= len - pos; pos += blockLen)
          this.process(data, pos);
        continue;
      }
      buffer.set(data.subarray(pos, pos + take), this.pos);
      this.pos += take;
      pos += take;
      if (this.pos === blockLen) {
        this.process(buffer, 0, false);
        this.pos = 0;
      }
    }
    return this;
  }
  destroy() {
    clean2(this.h, this.r, this.buffer, this.pad);
  }
  digestInto(out) {
    aexists2(this);
    aoutput2(out, this);
    this.finished = true;
    const { buffer, h } = this;
    let { pos } = this;
    if (pos) {
      buffer[pos++] = 1;
      for (; pos < 16; pos++)
        buffer[pos] = 0;
      this.process(buffer, 0, true);
    }
    this.finalize();
    let opos = 0;
    for (let i3 = 0; i3 < 8; i3++) {
      out[opos++] = h[i3] >>> 0;
      out[opos++] = h[i3] >>> 8;
    }
    return out;
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
};
function wrapConstructorWithKey(hashCons) {
  const hashC = (msg, key) => hashCons(key).update(msg).digest();
  const tmp = hashCons(new Uint8Array(32));
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = (key) => hashCons(key);
  return hashC;
}
var poly1305 = /* @__PURE__ */ (() => wrapConstructorWithKey((key) => new Poly1305(key)))();

// node_modules/@noble/ciphers/chacha.js
function chachaCore(s, k, n, out, cnt, rounds = 20) {
  let y00 = s[0], y01 = s[1], y02 = s[2], y03 = s[3], y04 = k[0], y05 = k[1], y06 = k[2], y07 = k[3], y08 = k[4], y09 = k[5], y10 = k[6], y11 = k[7], y12 = cnt, y13 = n[0], y14 = n[1], y15 = n[2];
  let x00 = y00, x01 = y01, x02 = y02, x03 = y03, x04 = y04, x05 = y05, x06 = y06, x07 = y07, x08 = y08, x09 = y09, x10 = y10, x11 = y11, x12 = y12, x13 = y13, x14 = y14, x15 = y15;
  for (let r = 0; r < rounds; r += 2) {
    x00 = x00 + x04 | 0;
    x12 = rotl(x12 ^ x00, 16);
    x08 = x08 + x12 | 0;
    x04 = rotl(x04 ^ x08, 12);
    x00 = x00 + x04 | 0;
    x12 = rotl(x12 ^ x00, 8);
    x08 = x08 + x12 | 0;
    x04 = rotl(x04 ^ x08, 7);
    x01 = x01 + x05 | 0;
    x13 = rotl(x13 ^ x01, 16);
    x09 = x09 + x13 | 0;
    x05 = rotl(x05 ^ x09, 12);
    x01 = x01 + x05 | 0;
    x13 = rotl(x13 ^ x01, 8);
    x09 = x09 + x13 | 0;
    x05 = rotl(x05 ^ x09, 7);
    x02 = x02 + x06 | 0;
    x14 = rotl(x14 ^ x02, 16);
    x10 = x10 + x14 | 0;
    x06 = rotl(x06 ^ x10, 12);
    x02 = x02 + x06 | 0;
    x14 = rotl(x14 ^ x02, 8);
    x10 = x10 + x14 | 0;
    x06 = rotl(x06 ^ x10, 7);
    x03 = x03 + x07 | 0;
    x15 = rotl(x15 ^ x03, 16);
    x11 = x11 + x15 | 0;
    x07 = rotl(x07 ^ x11, 12);
    x03 = x03 + x07 | 0;
    x15 = rotl(x15 ^ x03, 8);
    x11 = x11 + x15 | 0;
    x07 = rotl(x07 ^ x11, 7);
    x00 = x00 + x05 | 0;
    x15 = rotl(x15 ^ x00, 16);
    x10 = x10 + x15 | 0;
    x05 = rotl(x05 ^ x10, 12);
    x00 = x00 + x05 | 0;
    x15 = rotl(x15 ^ x00, 8);
    x10 = x10 + x15 | 0;
    x05 = rotl(x05 ^ x10, 7);
    x01 = x01 + x06 | 0;
    x12 = rotl(x12 ^ x01, 16);
    x11 = x11 + x12 | 0;
    x06 = rotl(x06 ^ x11, 12);
    x01 = x01 + x06 | 0;
    x12 = rotl(x12 ^ x01, 8);
    x11 = x11 + x12 | 0;
    x06 = rotl(x06 ^ x11, 7);
    x02 = x02 + x07 | 0;
    x13 = rotl(x13 ^ x02, 16);
    x08 = x08 + x13 | 0;
    x07 = rotl(x07 ^ x08, 12);
    x02 = x02 + x07 | 0;
    x13 = rotl(x13 ^ x02, 8);
    x08 = x08 + x13 | 0;
    x07 = rotl(x07 ^ x08, 7);
    x03 = x03 + x04 | 0;
    x14 = rotl(x14 ^ x03, 16);
    x09 = x09 + x14 | 0;
    x04 = rotl(x04 ^ x09, 12);
    x03 = x03 + x04 | 0;
    x14 = rotl(x14 ^ x03, 8);
    x09 = x09 + x14 | 0;
    x04 = rotl(x04 ^ x09, 7);
  }
  let oi = 0;
  out[oi++] = y00 + x00 | 0;
  out[oi++] = y01 + x01 | 0;
  out[oi++] = y02 + x02 | 0;
  out[oi++] = y03 + x03 | 0;
  out[oi++] = y04 + x04 | 0;
  out[oi++] = y05 + x05 | 0;
  out[oi++] = y06 + x06 | 0;
  out[oi++] = y07 + x07 | 0;
  out[oi++] = y08 + x08 | 0;
  out[oi++] = y09 + x09 | 0;
  out[oi++] = y10 + x10 | 0;
  out[oi++] = y11 + x11 | 0;
  out[oi++] = y12 + x12 | 0;
  out[oi++] = y13 + x13 | 0;
  out[oi++] = y14 + x14 | 0;
  out[oi++] = y15 + x15 | 0;
}
function hchacha(s, k, i3, out) {
  let x00 = s[0], x01 = s[1], x02 = s[2], x03 = s[3], x04 = k[0], x05 = k[1], x06 = k[2], x07 = k[3], x08 = k[4], x09 = k[5], x10 = k[6], x11 = k[7], x12 = i3[0], x13 = i3[1], x14 = i3[2], x15 = i3[3];
  for (let r = 0; r < 20; r += 2) {
    x00 = x00 + x04 | 0;
    x12 = rotl(x12 ^ x00, 16);
    x08 = x08 + x12 | 0;
    x04 = rotl(x04 ^ x08, 12);
    x00 = x00 + x04 | 0;
    x12 = rotl(x12 ^ x00, 8);
    x08 = x08 + x12 | 0;
    x04 = rotl(x04 ^ x08, 7);
    x01 = x01 + x05 | 0;
    x13 = rotl(x13 ^ x01, 16);
    x09 = x09 + x13 | 0;
    x05 = rotl(x05 ^ x09, 12);
    x01 = x01 + x05 | 0;
    x13 = rotl(x13 ^ x01, 8);
    x09 = x09 + x13 | 0;
    x05 = rotl(x05 ^ x09, 7);
    x02 = x02 + x06 | 0;
    x14 = rotl(x14 ^ x02, 16);
    x10 = x10 + x14 | 0;
    x06 = rotl(x06 ^ x10, 12);
    x02 = x02 + x06 | 0;
    x14 = rotl(x14 ^ x02, 8);
    x10 = x10 + x14 | 0;
    x06 = rotl(x06 ^ x10, 7);
    x03 = x03 + x07 | 0;
    x15 = rotl(x15 ^ x03, 16);
    x11 = x11 + x15 | 0;
    x07 = rotl(x07 ^ x11, 12);
    x03 = x03 + x07 | 0;
    x15 = rotl(x15 ^ x03, 8);
    x11 = x11 + x15 | 0;
    x07 = rotl(x07 ^ x11, 7);
    x00 = x00 + x05 | 0;
    x15 = rotl(x15 ^ x00, 16);
    x10 = x10 + x15 | 0;
    x05 = rotl(x05 ^ x10, 12);
    x00 = x00 + x05 | 0;
    x15 = rotl(x15 ^ x00, 8);
    x10 = x10 + x15 | 0;
    x05 = rotl(x05 ^ x10, 7);
    x01 = x01 + x06 | 0;
    x12 = rotl(x12 ^ x01, 16);
    x11 = x11 + x12 | 0;
    x06 = rotl(x06 ^ x11, 12);
    x01 = x01 + x06 | 0;
    x12 = rotl(x12 ^ x01, 8);
    x11 = x11 + x12 | 0;
    x06 = rotl(x06 ^ x11, 7);
    x02 = x02 + x07 | 0;
    x13 = rotl(x13 ^ x02, 16);
    x08 = x08 + x13 | 0;
    x07 = rotl(x07 ^ x08, 12);
    x02 = x02 + x07 | 0;
    x13 = rotl(x13 ^ x02, 8);
    x08 = x08 + x13 | 0;
    x07 = rotl(x07 ^ x08, 7);
    x03 = x03 + x04 | 0;
    x14 = rotl(x14 ^ x03, 16);
    x09 = x09 + x14 | 0;
    x04 = rotl(x04 ^ x09, 12);
    x03 = x03 + x04 | 0;
    x14 = rotl(x14 ^ x03, 8);
    x09 = x09 + x14 | 0;
    x04 = rotl(x04 ^ x09, 7);
  }
  let oi = 0;
  out[oi++] = x00;
  out[oi++] = x01;
  out[oi++] = x02;
  out[oi++] = x03;
  out[oi++] = x12;
  out[oi++] = x13;
  out[oi++] = x14;
  out[oi++] = x15;
}
var chacha20 = /* @__PURE__ */ createCipher(chachaCore, {
  counterRight: false,
  counterLength: 4,
  allowShortKeys: false
});
var xchacha20 = /* @__PURE__ */ createCipher(chachaCore, {
  counterRight: false,
  counterLength: 8,
  extendNonceFn: hchacha,
  allowShortKeys: false
});
var ZEROS16 = /* @__PURE__ */ new Uint8Array(16);
var updatePadded = (h, msg) => {
  h.update(msg);
  const leftover = msg.length % 16;
  if (leftover)
    h.update(ZEROS16.subarray(leftover));
};
var ZEROS32 = /* @__PURE__ */ new Uint8Array(32);
function computeTag(fn, key, nonce, ciphertext, AAD) {
  if (AAD !== void 0)
    abytes3(AAD, void 0, "AAD");
  const authKey = fn(key, nonce, ZEROS32);
  const lengths = u64Lengths(ciphertext.length, AAD ? AAD.length : 0, true);
  const h = poly1305.create(authKey);
  if (AAD)
    updatePadded(h, AAD);
  updatePadded(h, ciphertext);
  h.update(lengths);
  const res = h.digest();
  clean2(authKey, lengths);
  return res;
}
var _poly1305_aead = (xorStream) => (key, nonce, AAD) => {
  const tagLength = 16;
  return {
    encrypt(plaintext, output) {
      const plength = plaintext.length;
      output = getOutput(plength + tagLength, output, false);
      output.set(plaintext);
      const oPlain = output.subarray(0, -tagLength);
      xorStream(key, nonce, oPlain, oPlain, 1);
      const tag = computeTag(xorStream, key, nonce, oPlain, AAD);
      output.set(tag, plength);
      clean2(tag);
      return output;
    },
    decrypt(ciphertext, output) {
      output = getOutput(ciphertext.length - tagLength, output, false);
      const data = ciphertext.subarray(0, -tagLength);
      const passedTag = ciphertext.subarray(-tagLength);
      const tag = computeTag(xorStream, key, nonce, data, AAD);
      if (!equalBytes(passedTag, tag))
        throw new Error("invalid tag");
      output.set(ciphertext.subarray(0, -tagLength));
      xorStream(key, nonce, output, output, 1);
      clean2(tag);
      return output;
    }
  };
};
var chacha20poly1305 = /* @__PURE__ */ wrapCipher({ blockSize: 64, nonceLength: 12, tagLength: 16 }, _poly1305_aead(chacha20));
var xchacha20poly1305 = /* @__PURE__ */ wrapCipher({ blockSize: 64, nonceLength: 24, tagLength: 16 }, _poly1305_aead(xchacha20));

// node_modules/nostr-tools/node_modules/@noble/hashes/hkdf.js
function extract(hash, ikm, salt) {
  ahash(hash);
  if (salt === void 0)
    salt = new Uint8Array(hash.outputLen);
  return hmac(hash, salt, ikm);
}
var HKDF_COUNTER = /* @__PURE__ */ Uint8Array.of(0);
var EMPTY_BUFFER = /* @__PURE__ */ Uint8Array.of();
function expand(hash, prk, info, length = 32) {
  ahash(hash);
  anumber(length, "length");
  const olen = hash.outputLen;
  if (length > 255 * olen)
    throw new Error("Length must be <= 255*HashLen");
  const blocks = Math.ceil(length / olen);
  if (info === void 0)
    info = EMPTY_BUFFER;
  else
    abytes(info, void 0, "info");
  const okm = new Uint8Array(blocks * olen);
  const HMAC = hmac.create(hash, prk);
  const HMACTmp = HMAC._cloneInto();
  const T = new Uint8Array(HMAC.outputLen);
  for (let counter = 0; counter < blocks; counter++) {
    HKDF_COUNTER[0] = counter + 1;
    HMACTmp.update(counter === 0 ? EMPTY_BUFFER : T).update(info).update(HKDF_COUNTER).digestInto(T);
    okm.set(T, olen * counter);
    HMAC._cloneInto(HMACTmp);
  }
  HMAC.destroy();
  HMACTmp.destroy();
  clean(T, HKDF_COUNTER);
  return okm.slice(0, length);
}

// node_modules/nostr-tools/lib/esm/index.js
var __defProp2 = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp2(target, name, { get: all[name], enumerable: true });
};
var utils_exports = {};
__export(utils_exports, {
  binarySearch: () => binarySearch,
  bytesToHex: () => bytesToHex,
  hexToBytes: () => hexToBytes,
  insertEventIntoAscendingList: () => insertEventIntoAscendingList,
  insertEventIntoDescendingList: () => insertEventIntoDescendingList,
  isHex32: () => isHex32,
  mergeReverseSortedLists: () => mergeReverseSortedLists,
  normalizeURL: () => normalizeURL,
  utf8Decoder: () => utf8Decoder,
  utf8Encoder: () => utf8Encoder
});
var utf8Decoder = new TextDecoder("utf-8");
var utf8Encoder = new TextEncoder();
function normalizeURL(url) {
  try {
    if (url.indexOf("://") === -1)
      url = "wss://" + url;
    let p = new URL(url);
    if (p.protocol === "http:")
      p.protocol = "ws:";
    else if (p.protocol === "https:")
      p.protocol = "wss:";
    p.pathname = p.pathname.replace(/\/+/g, "/");
    if (p.pathname.endsWith("/"))
      p.pathname = p.pathname.slice(0, -1);
    if (p.port === "80" && p.protocol === "ws:" || p.port === "443" && p.protocol === "wss:")
      p.port = "";
    p.searchParams.sort();
    p.hash = "";
    return p.toString();
  } catch (e) {
    throw new Error(`Invalid URL: ${url}`);
  }
}
function insertEventIntoDescendingList(sortedArray, event) {
  const [idx, found] = binarySearch(sortedArray, (b) => {
    if (event.id === b.id)
      return 0;
    if (event.created_at === b.created_at)
      return -1;
    return b.created_at - event.created_at;
  });
  if (!found) {
    sortedArray.splice(idx, 0, event);
  }
  return sortedArray;
}
function insertEventIntoAscendingList(sortedArray, event) {
  const [idx, found] = binarySearch(sortedArray, (b) => {
    if (event.id === b.id)
      return 0;
    if (event.created_at === b.created_at)
      return -1;
    return event.created_at - b.created_at;
  });
  if (!found) {
    sortedArray.splice(idx, 0, event);
  }
  return sortedArray;
}
function binarySearch(arr, compare) {
  let start = 0;
  let end = arr.length - 1;
  while (start <= end) {
    const mid = Math.floor((start + end) / 2);
    const cmp = compare(arr[mid]);
    if (cmp === 0) {
      return [mid, true];
    }
    if (cmp < 0) {
      end = mid - 1;
    } else {
      start = mid + 1;
    }
  }
  return [start, false];
}
function mergeReverseSortedLists(list1, list2) {
  const result = new Array(list1.length + list2.length);
  result.length = 0;
  let i1 = 0;
  let i22 = 0;
  let sameTimestampIds = [];
  while (i1 < list1.length && i22 < list2.length) {
    let next;
    if (list1[i1]?.created_at > list2[i22]?.created_at) {
      next = list1[i1];
      i1++;
    } else {
      next = list2[i22];
      i22++;
    }
    if (result.length > 0 && result[result.length - 1].created_at === next.created_at) {
      if (sameTimestampIds.includes(next.id))
        continue;
    } else {
      sameTimestampIds.length = 0;
    }
    result.push(next);
    sameTimestampIds.push(next.id);
  }
  while (i1 < list1.length) {
    const next = list1[i1];
    i1++;
    if (result.length > 0 && result[result.length - 1].created_at === next.created_at) {
      if (sameTimestampIds.includes(next.id))
        continue;
    } else {
      sameTimestampIds.length = 0;
    }
    result.push(next);
    sameTimestampIds.push(next.id);
  }
  while (i22 < list2.length) {
    const next = list2[i22];
    i22++;
    if (result.length > 0 && result[result.length - 1].created_at === next.created_at) {
      if (sameTimestampIds.includes(next.id))
        continue;
    } else {
      sameTimestampIds.length = 0;
    }
    result.push(next);
    sameTimestampIds.push(next.id);
  }
  return result;
}
function isHex32(input2) {
  if (input2.length !== 64)
    return false;
  for (let i22 = 0; i22 < 64; i22++) {
    let cc = input2.charCodeAt(i22);
    if (isNaN(cc) || cc < 48 || cc > 102 || cc > 57 && cc < 97) {
      return false;
    }
  }
  return true;
}
var verifiedSymbol = /* @__PURE__ */ Symbol("verified");
var isRecord = (obj) => obj instanceof Object;
function validateEvent(event) {
  if (!isRecord(event))
    return false;
  if (typeof event.kind !== "number")
    return false;
  if (typeof event.content !== "string")
    return false;
  if (typeof event.created_at !== "number")
    return false;
  if (typeof event.pubkey !== "string")
    return false;
  if (!isHex32(event.pubkey))
    return false;
  if (!Array.isArray(event.tags))
    return false;
  for (let i22 = 0; i22 < event.tags.length; i22++) {
    let tag = event.tags[i22];
    if (!Array.isArray(tag))
      return false;
    for (let j = 0; j < tag.length; j++) {
      if (typeof tag[j] !== "string")
        return false;
    }
  }
  return true;
}
var JS = class {
  generateSecretKey() {
    return schnorr.utils.randomSecretKey();
  }
  getPublicKey(secretKey) {
    return bytesToHex(schnorr.getPublicKey(secretKey));
  }
  finalizeEvent(t, secretKey) {
    const event = t;
    event.pubkey = bytesToHex(schnorr.getPublicKey(secretKey));
    event.id = getEventHash(event);
    event.sig = bytesToHex(schnorr.sign(hexToBytes(getEventHash(event)), secretKey));
    event[verifiedSymbol] = true;
    return event;
  }
  verifyEvent(event) {
    if (typeof event[verifiedSymbol] === "boolean")
      return event[verifiedSymbol];
    try {
      const hash = getEventHash(event);
      if (hash !== event.id) {
        event[verifiedSymbol] = false;
        return false;
      }
      const valid = schnorr.verify(hexToBytes(event.sig), hexToBytes(hash), hexToBytes(event.pubkey));
      event[verifiedSymbol] = valid;
      return valid;
    } catch (err2) {
      event[verifiedSymbol] = false;
      return false;
    }
  }
};
function serializeEvent(evt) {
  if (!validateEvent(evt))
    throw new Error("can't serialize event with wrong or missing properties");
  return JSON.stringify([0, evt.pubkey, evt.created_at, evt.kind, evt.tags, evt.content]);
}
function getEventHash(event) {
  let eventHash = sha256(utf8Encoder.encode(serializeEvent(event)));
  return bytesToHex(eventHash);
}
var i = new JS();
var generateSecretKey = i.generateSecretKey;
var getPublicKey = i.getPublicKey;
var finalizeEvent = i.finalizeEvent;
var verifyEvent = i.verifyEvent;
var kinds_exports = {};
__export(kinds_exports, {
  AIEmbeddings: () => AIEmbeddings,
  AppCurationSet: () => AppCurationSet,
  Application: () => Application,
  AuthoredPodcasts: () => AuthoredPodcasts,
  BadgeAward: () => BadgeAward,
  BadgeDefinition: () => BadgeDefinition,
  Bid: () => Bid,
  BidConfirmation: () => BidConfirmation,
  BlobsAuth: () => BlobsAuth,
  BlockedRelaysList: () => BlockedRelaysList,
  BlossomServerList: () => BlossomServerList,
  BookmarkList: () => BookmarkList,
  Bookmarksets: () => Bookmarksets,
  Calendar: () => Calendar,
  CalendarEventRSVP: () => CalendarEventRSVP,
  CashuMintAnnouncement: () => CashuMintAnnouncement,
  CashuWalletEvent: () => CashuWalletEvent,
  CashuWalletHistory: () => CashuWalletHistory,
  CashuWalletTokens: () => CashuWalletTokens,
  ChannelCreation: () => ChannelCreation,
  ChannelHideMessage: () => ChannelHideMessage,
  ChannelMessage: () => ChannelMessage,
  ChannelMetadata: () => ChannelMetadata,
  ChannelMuteUser: () => ChannelMuteUser,
  ChatMessage: () => ChatMessage,
  Chess: () => Chess,
  ClassifiedListing: () => ClassifiedListing,
  ClientAuth: () => ClientAuth,
  CodeSnippet: () => CodeSnippet,
  CoinjoinPool: () => CoinjoinPool,
  Comment: () => Comment,
  CommunitiesList: () => CommunitiesList,
  CommunityDefinition: () => CommunityDefinition,
  CommunityPostApproval: () => CommunityPostApproval,
  ConferenceEvent: () => ConferenceEvent,
  Contacts: () => Contacts,
  CreateOrUpdateProduct: () => CreateOrUpdateProduct,
  CreateOrUpdateStall: () => CreateOrUpdateStall,
  CuratedVideoSets: () => CuratedVideoSets,
  Curationsets: () => Curationsets,
  Date: () => Date2,
  DecoupledEncryptionKeyDistribution: () => DecoupledEncryptionKeyDistribution,
  DecoupledKeyAnnouncement: () => DecoupledKeyAnnouncement,
  DecoupledKeyClientAnnouncement: () => DecoupledKeyClientAnnouncement,
  DirectMessageRelaysList: () => DirectMessageRelaysList,
  DraftClassifiedListing: () => DraftClassifiedListing,
  DraftEvent: () => DraftEvent,
  DraftLong: () => DraftLong,
  Emojisets: () => Emojisets,
  EncryptedDirectMessage: () => EncryptedDirectMessage,
  EventDeletion: () => EventDeletion,
  FavoriteFollowSets: () => FavoriteFollowSets,
  FavoritePodcasts: () => FavoritePodcasts,
  FavoriteRelays: () => FavoriteRelays,
  FedimintAnnouncement: () => FedimintAnnouncement,
  Feed: () => Feed,
  FileMessage: () => FileMessage,
  FileMetadata: () => FileMetadata,
  FileServerPreference: () => FileServerPreference,
  Followsets: () => Followsets,
  ForumThread: () => ForumThread,
  GenericRepost: () => GenericRepost,
  Genericlists: () => Genericlists,
  GeocacheListing: () => GeocacheListing,
  GeocacheLog: () => GeocacheLog,
  GeocacheLogEntry: () => GeocacheLogEntry,
  GeocacheProofOfFind: () => GeocacheProofOfFind,
  GiftWrap: () => GiftWrap,
  GitPullRequest: () => GitPullRequest,
  GitPullRequestUpdate: () => GitPullRequestUpdate,
  GoodWikiAuthorList: () => GoodWikiAuthorList,
  GoodWikiRelayList: () => GoodWikiRelayList,
  GroupMetadata: () => GroupMetadata,
  HTTPAuth: () => HTTPAuth,
  Handlerinformation: () => Handlerinformation,
  Handlerrecommendation: () => Handlerrecommendation,
  Highlights: () => Highlights,
  InteractiveRoom: () => InteractiveRoom,
  InterestsList: () => InterestsList,
  Interestsets: () => Interestsets,
  Issue: () => Issue,
  JobFeedback: () => JobFeedback,
  JobRequest: () => JobRequest,
  JobResult: () => JobResult,
  Label: () => Label,
  LegacyNsiteFile: () => LegacyNsiteFile,
  LightningPubRPC: () => LightningPubRPC,
  LinkSet: () => LinkSet,
  LiveChatMessage: () => LiveChatMessage,
  LiveEvent: () => LiveEvent,
  LongFormArticle: () => LongFormArticle,
  MarketplaceUI: () => MarketplaceUI,
  MediaFollows: () => MediaFollows,
  MediaStarterPacks: () => MediaStarterPacks,
  MergeRequests: () => MergeRequests,
  Metadata: () => Metadata,
  ModularArticleContent: () => ModularArticleContent,
  ModularArticleHeader: () => ModularArticleHeader,
  MuteSets: () => MuteSets,
  Mutelist: () => Mutelist,
  NWCWalletInfo: () => NWCWalletInfo,
  NWCWalletRequest: () => NWCWalletRequest,
  NWCWalletResponse: () => NWCWalletResponse,
  NormalVideo: () => NormalVideo,
  NostrConnect: () => NostrConnect,
  NsiteNamed: () => NsiteNamed,
  NsiteRoot: () => NsiteRoot,
  NutZap: () => NutZap,
  NutZapInfo: () => NutZapInfo,
  OpenTimestamps: () => OpenTimestamps,
  Patch: () => Patch,
  PeerToPeerOrderEvents: () => PeerToPeerOrderEvents,
  Photo: () => Photo,
  Pinlist: () => Pinlist,
  PodcastEpisode: () => PodcastEpisode,
  PodcastMetadata: () => PodcastMetadata,
  Poll: () => Poll,
  PollResponse: () => PollResponse,
  PrivateDirectMessage: () => PrivateDirectMessage,
  PrivateEventRelayList: () => PrivateEventRelayList,
  ProblemTracker: () => ProblemTracker,
  ProductSoldAsAuction: () => ProductSoldAsAuction,
  ProfileBadges: () => ProfileBadges,
  ProxyAnnouncement: () => ProxyAnnouncement,
  PublicChatsList: () => PublicChatsList,
  PublicMessage: () => PublicMessage,
  Reaction: () => Reaction,
  ReactionToWebsite: () => ReactionToWebsite,
  RecommendRelay: () => RecommendRelay,
  Redirects: () => Redirects,
  RelayDiscovery: () => RelayDiscovery,
  RelayList: () => RelayList,
  RelayMonitorAnnouncement: () => RelayMonitorAnnouncement,
  RelayReview: () => RelayReview,
  RelayReviews: () => RelayReviews,
  Relaysets: () => Relaysets,
  ReleaseArtifactSets: () => ReleaseArtifactSets,
  Reply: () => Reply,
  Report: () => Report,
  Reporting: () => Reporting,
  RepositoryAnnouncement: () => RepositoryAnnouncement,
  RepositoryState: () => RepositoryState,
  Repost: () => Repost,
  ReservedCashuWalletTokens: () => ReservedCashuWalletTokens,
  RoomPresence: () => RoomPresence,
  Scroll: () => Scroll,
  Seal: () => Seal,
  SearchRelaysList: () => SearchRelaysList,
  ShortTextNote: () => ShortTextNote,
  ShortVideo: () => ShortVideo,
  SimpleGroupAdmins: () => SimpleGroupAdmins,
  SimpleGroupCreateGroup: () => SimpleGroupCreateGroup,
  SimpleGroupCreateInvite: () => SimpleGroupCreateInvite,
  SimpleGroupDeleteEvent: () => SimpleGroupDeleteEvent,
  SimpleGroupDeleteGroup: () => SimpleGroupDeleteGroup,
  SimpleGroupEditMetadata: () => SimpleGroupEditMetadata,
  SimpleGroupJoinRequest: () => SimpleGroupJoinRequest,
  SimpleGroupLeaveRequest: () => SimpleGroupLeaveRequest,
  SimpleGroupList: () => SimpleGroupList,
  SimpleGroupLiveKitParticipants: () => SimpleGroupLiveKitParticipants,
  SimpleGroupMembers: () => SimpleGroupMembers,
  SimpleGroupPutUser: () => SimpleGroupPutUser,
  SimpleGroupRemoveUser: () => SimpleGroupRemoveUser,
  SimpleGroupReply: () => SimpleGroupReply,
  SimpleGroupRoles: () => SimpleGroupRoles,
  SimpleGroupThreadedReply: () => SimpleGroupThreadedReply,
  SlideSet: () => SlideSet,
  SoftwareApplication: () => SoftwareApplication,
  StarterPacks: () => StarterPacks,
  StatusApplied: () => StatusApplied,
  StatusClosed: () => StatusClosed,
  StatusDraft: () => StatusDraft,
  StatusOpen: () => StatusOpen,
  TidalLogin: () => TidalLogin,
  Time: () => Time,
  Torrent: () => Torrent,
  TorrentComment: () => TorrentComment,
  TransportMethodAnnouncement: () => TransportMethodAnnouncement,
  UserEmojiList: () => UserEmojiList,
  UserGraspList: () => UserGraspList,
  UserStatuses: () => UserStatuses,
  VideoViewEvent: () => VideoViewEvent,
  Voice: () => Voice,
  VoiceComment: () => VoiceComment,
  WebBookmarks: () => WebBookmarks,
  WikiArticle: () => WikiArticle,
  Zap: () => Zap,
  ZapGoal: () => ZapGoal,
  ZapRequest: () => ZapRequest,
  classifyKind: () => classifyKind,
  isAddressableKind: () => isAddressableKind,
  isEphemeralKind: () => isEphemeralKind,
  isKind: () => isKind,
  isRegularKind: () => isRegularKind,
  isReplaceableKind: () => isReplaceableKind
});
function isRegularKind(kind) {
  return kind < 1e4 && kind !== 0 && kind !== 3;
}
function isReplaceableKind(kind) {
  return kind === 0 || kind === 3 || 1e4 <= kind && kind < 2e4;
}
function isEphemeralKind(kind) {
  return 2e4 <= kind && kind < 3e4;
}
function isAddressableKind(kind) {
  return 3e4 <= kind && kind < 4e4;
}
function classifyKind(kind) {
  if (isRegularKind(kind))
    return "regular";
  if (isReplaceableKind(kind))
    return "replaceable";
  if (isEphemeralKind(kind))
    return "ephemeral";
  if (isAddressableKind(kind))
    return "parameterized";
  return "unknown";
}
function isKind(event, kind) {
  const kindAsArray = kind instanceof Array ? kind : [kind];
  return validateEvent(event) && kindAsArray.includes(event.kind) || false;
}
var Metadata = 0;
var ShortTextNote = 1;
var RecommendRelay = 2;
var Contacts = 3;
var EncryptedDirectMessage = 4;
var EventDeletion = 5;
var Repost = 6;
var Reaction = 7;
var BadgeAward = 8;
var ChatMessage = 9;
var SimpleGroupThreadedReply = 10;
var ForumThread = 11;
var SimpleGroupReply = 12;
var Seal = 13;
var PrivateDirectMessage = 14;
var FileMessage = 15;
var GenericRepost = 16;
var ReactionToWebsite = 17;
var Photo = 20;
var NormalVideo = 21;
var ShortVideo = 22;
var PublicMessage = 24;
var ChannelCreation = 40;
var ChannelMetadata = 41;
var ChannelMessage = 42;
var ChannelHideMessage = 43;
var ChannelMuteUser = 44;
var PodcastEpisode = 54;
var Chess = 64;
var MergeRequests = 818;
var PollResponse = 1018;
var Bid = 1021;
var BidConfirmation = 1022;
var OpenTimestamps = 1040;
var GiftWrap = 1059;
var FileMetadata = 1063;
var Poll = 1068;
var Comment = 1111;
var Voice = 1222;
var Scroll = 1227;
var VoiceComment = 1244;
var LiveChatMessage = 1311;
var CodeSnippet = 1337;
var Patch = 1617;
var GitPullRequest = 1618;
var GitPullRequestUpdate = 1619;
var Issue = 1621;
var Reply = 1622;
var StatusOpen = 1630;
var StatusApplied = 1631;
var StatusClosed = 1632;
var StatusDraft = 1633;
var ProblemTracker = 1971;
var Report = 1984;
var Reporting = 1984;
var Label = 1985;
var RelayReviews = 1986;
var AIEmbeddings = 1987;
var Torrent = 2003;
var TorrentComment = 2004;
var CoinjoinPool = 2022;
var DecoupledKeyClientAnnouncement = 4454;
var DecoupledEncryptionKeyDistribution = 4455;
var CommunityPostApproval = 4550;
var JobRequest = 5999;
var JobResult = 6999;
var JobFeedback = 7e3;
var ReservedCashuWalletTokens = 7374;
var CashuWalletTokens = 7375;
var CashuWalletHistory = 7376;
var GeocacheLog = 7516;
var GeocacheProofOfFind = 7517;
var SimpleGroupPutUser = 9e3;
var SimpleGroupRemoveUser = 9001;
var SimpleGroupEditMetadata = 9002;
var SimpleGroupDeleteEvent = 9005;
var SimpleGroupCreateGroup = 9007;
var SimpleGroupDeleteGroup = 9008;
var SimpleGroupCreateInvite = 9009;
var SimpleGroupJoinRequest = 9021;
var SimpleGroupLeaveRequest = 9022;
var ZapGoal = 9041;
var NutZap = 9321;
var TidalLogin = 9467;
var ZapRequest = 9734;
var Zap = 9735;
var Highlights = 9802;
var Mutelist = 1e4;
var Pinlist = 10001;
var RelayList = 10002;
var BookmarkList = 10003;
var CommunitiesList = 10004;
var PublicChatsList = 10005;
var BlockedRelaysList = 10006;
var SearchRelaysList = 10007;
var SimpleGroupList = 10009;
var FavoriteRelays = 10012;
var PrivateEventRelayList = 10013;
var InterestsList = 10015;
var NutZapInfo = 10019;
var MediaFollows = 10020;
var FavoriteFollowSets = 10021;
var UserEmojiList = 10030;
var DecoupledKeyAnnouncement = 10044;
var DirectMessageRelaysList = 10050;
var FavoritePodcasts = 10054;
var BlossomServerList = 10063;
var FileServerPreference = 10096;
var GoodWikiAuthorList = 10101;
var GoodWikiRelayList = 10102;
var PodcastMetadata = 10154;
var AuthoredPodcasts = 10164;
var RelayMonitorAnnouncement = 10166;
var RoomPresence = 10312;
var UserGraspList = 10317;
var ProxyAnnouncement = 10377;
var TransportMethodAnnouncement = 11111;
var NWCWalletInfo = 13194;
var NsiteRoot = 15128;
var CashuWalletEvent = 17375;
var LightningPubRPC = 21e3;
var ClientAuth = 22242;
var NWCWalletRequest = 23194;
var NWCWalletResponse = 23195;
var NostrConnect = 24133;
var BlobsAuth = 24242;
var HTTPAuth = 27235;
var Followsets = 3e4;
var Genericlists = 30001;
var Relaysets = 30002;
var Bookmarksets = 30003;
var Curationsets = 30004;
var CuratedVideoSets = 30005;
var MuteSets = 30007;
var ProfileBadges = 30008;
var BadgeDefinition = 30009;
var Interestsets = 30015;
var CreateOrUpdateStall = 30017;
var CreateOrUpdateProduct = 30018;
var MarketplaceUI = 30019;
var ProductSoldAsAuction = 30020;
var LongFormArticle = 30023;
var DraftLong = 30024;
var Emojisets = 30030;
var ModularArticleHeader = 30040;
var ModularArticleContent = 30041;
var ReleaseArtifactSets = 30063;
var Application = 30078;
var RelayDiscovery = 30166;
var AppCurationSet = 30267;
var LiveEvent = 30311;
var InteractiveRoom = 30312;
var ConferenceEvent = 30313;
var UserStatuses = 30315;
var SlideSet = 30388;
var ClassifiedListing = 30402;
var DraftClassifiedListing = 30403;
var RepositoryAnnouncement = 30617;
var RepositoryState = 30618;
var WikiArticle = 30818;
var Redirects = 30819;
var DraftEvent = 31234;
var LinkSet = 31388;
var Feed = 31890;
var Date2 = 31922;
var Time = 31923;
var Calendar = 31924;
var CalendarEventRSVP = 31925;
var RelayReview = 31987;
var Handlerrecommendation = 31989;
var Handlerinformation = 31990;
var SoftwareApplication = 32267;
var LegacyNsiteFile = 34128;
var VideoViewEvent = 34237;
var CommunityDefinition = 34550;
var NsiteNamed = 35128;
var GeocacheListing = 37515;
var GeocacheLogEntry = 37516;
var CashuMintAnnouncement = 38172;
var FedimintAnnouncement = 38173;
var PeerToPeerOrderEvents = 38383;
var GroupMetadata = 39e3;
var SimpleGroupAdmins = 39001;
var SimpleGroupMembers = 39002;
var SimpleGroupRoles = 39003;
var SimpleGroupLiveKitParticipants = 39004;
var StarterPacks = 39089;
var MediaStarterPacks = 39092;
var WebBookmarks = 39701;
function matchFilter(filter, event) {
  if (filter.ids && filter.ids.indexOf(event.id) === -1) {
    return false;
  }
  if (filter.kinds && filter.kinds.indexOf(event.kind) === -1) {
    return false;
  }
  if (filter.authors && filter.authors.indexOf(event.pubkey) === -1) {
    return false;
  }
  for (let f in filter) {
    if (f[0] === "#") {
      let tagName = f.slice(1);
      let values = filter[`#${tagName}`];
      if (values && !event.tags.find(([t, v]) => t === f.slice(1) && values.indexOf(v) !== -1))
        return false;
    }
  }
  if (filter.since && event.created_at < filter.since)
    return false;
  if (filter.until && event.created_at > filter.until)
    return false;
  return true;
}
function matchFilters(filters, event) {
  for (let i22 = 0; i22 < filters.length; i22++) {
    if (matchFilter(filters[i22], event)) {
      return true;
    }
  }
  return false;
}
var fakejson_exports = {};
__export(fakejson_exports, {
  getHex64: () => getHex64,
  getInt: () => getInt,
  getSubscriptionId: () => getSubscriptionId,
  matchEventId: () => matchEventId,
  matchEventKind: () => matchEventKind,
  matchEventPubkey: () => matchEventPubkey
});
function getHex64(json, field) {
  let len = field.length + 3;
  let idx = json.indexOf(`"${field}":`) + len;
  let s = json.slice(idx).indexOf(`"`) + idx + 1;
  return json.slice(s, s + 64);
}
function getInt(json, field) {
  let len = field.length;
  let idx = json.indexOf(`"${field}":`) + len + 3;
  let sliced = json.slice(idx);
  let end = Math.min(sliced.indexOf(","), sliced.indexOf("}"));
  return parseInt(sliced.slice(0, end), 10);
}
function getSubscriptionId(json) {
  let idx = json.slice(0, 22).indexOf(`"EVENT"`);
  if (idx === -1)
    return null;
  let pstart = json.slice(idx + 7 + 1).indexOf(`"`);
  if (pstart === -1)
    return null;
  let start = idx + 7 + 1 + pstart;
  let pend = json.slice(start + 1, 80).indexOf(`"`);
  if (pend === -1)
    return null;
  let end = start + 1 + pend;
  return json.slice(start + 1, end);
}
function matchEventId(json, id) {
  return id === getHex64(json, "id");
}
function matchEventPubkey(json, pubkey) {
  return pubkey === getHex64(json, "pubkey");
}
function matchEventKind(json, kind) {
  return kind === getInt(json, "kind");
}
var nip42_exports = {};
__export(nip42_exports, {
  makeAuthEvent: () => makeAuthEvent
});
function makeAuthEvent(relayURL, challenge2) {
  return {
    kind: ClientAuth,
    created_at: Math.floor(Date.now() / 1e3),
    tags: [
      ["relay", relayURL],
      ["challenge", challenge2]
    ],
    content: ""
  };
}
var SendingOnClosedConnection = class extends Error {
  constructor(message, relay) {
    super(`Tried to send message '${message} on a closed connection to ${relay}.`);
    this.name = "SendingOnClosedConnection";
  }
};
var AbstractRelay = class {
  url;
  _connected = false;
  onclose = null;
  onnotice = (msg) => console.debug(`NOTICE from ${this.url}: ${msg}`);
  onauth;
  baseEoseTimeout = 4400;
  publishTimeout = 4400;
  pingFrequency = 29e3;
  pingTimeout = 2e4;
  resubscribeBackoff = [1e4, 1e4, 1e4, 2e4, 2e4, 3e4, 6e4];
  openSubs = /* @__PURE__ */ new Map();
  enablePing;
  enableReconnect;
  idleTimeout = 0;
  idleSince = Date.now();
  ongoingOperations = 0;
  reconnectTimeoutHandle;
  pingIntervalHandle;
  reconnectAttempts = 0;
  skipReconnection = false;
  idleTimeoutHandle;
  connectionPromise;
  openCountRequests = /* @__PURE__ */ new Map();
  openEventPublishes = /* @__PURE__ */ new Map();
  ws;
  challenge;
  authPromise;
  serial = 0;
  verifyEvent;
  _WebSocket;
  constructor(url, opts) {
    this.url = normalizeURL(url);
    this.verifyEvent = opts.verifyEvent;
    this._WebSocket = opts.websocketImplementation || WebSocket;
    this.enablePing = opts.enablePing;
    this.enableReconnect = opts.enableReconnect || false;
    if (opts.idleTimeout)
      this.idleTimeout = opts.idleTimeout;
  }
  static async connect(url, opts) {
    const relay = new AbstractRelay(url, opts);
    await relay.connect(opts);
    return relay;
  }
  closeAllSubscriptions(reason) {
    for (let [_, sub] of this.openSubs) {
      sub.close(reason);
    }
    this.openSubs.clear();
    for (let [_, ep] of this.openEventPublishes) {
      ep.reject(new Error(reason));
    }
    this.openEventPublishes.clear();
    for (let [_, cr] of this.openCountRequests) {
      cr.reject(new Error(reason));
    }
    this.openCountRequests.clear();
  }
  get connected() {
    return this._connected;
  }
  clearIdleTimeout() {
    if (this.idleTimeoutHandle) {
      clearTimeout(this.idleTimeoutHandle);
      this.idleTimeoutHandle = void 0;
    }
  }
  scheduleIdleClose() {
    this.clearIdleTimeout();
    if (this.idleTimeout > 0) {
      this.idleTimeoutHandle = setTimeout(() => {
        if (this.ongoingOperations === 0 && this.idleSince) {
          this.close();
        }
      }, this.idleTimeout);
    }
  }
  async reconnect() {
    const backoff = this.resubscribeBackoff[Math.min(this.reconnectAttempts, this.resubscribeBackoff.length - 1)];
    this.reconnectAttempts++;
    this.reconnectTimeoutHandle = setTimeout(async () => {
      try {
        await this.connect();
      } catch (err2) {
      }
    }, backoff);
  }
  handleHardClose(reason) {
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
    }
    if (this.pingIntervalHandle) {
      clearInterval(this.pingIntervalHandle);
      this.pingIntervalHandle = void 0;
    }
    this._connected = false;
    this.connectionPromise = void 0;
    this.idleSince = void 0;
    this.clearIdleTimeout();
    if (this.enableReconnect && !this.skipReconnection) {
      this.reconnect();
    } else {
      this.onclose?.();
      this.closeAllSubscriptions(reason);
    }
  }
  async connect(opts) {
    let connectionTimeoutHandle;
    if (this.connectionPromise)
      return this.connectionPromise;
    this.challenge = void 0;
    this.authPromise = void 0;
    this.skipReconnection = false;
    this.connectionPromise = new Promise((resolve, reject) => {
      if (opts?.timeout) {
        connectionTimeoutHandle = setTimeout(() => {
          reject("connection timed out");
          this.connectionPromise = void 0;
          if (this.reconnectAttempts === 0) {
            this.skipReconnection = true;
          }
          this.ws?.close?.();
          this.handleHardClose("relay connection timed out");
        }, opts.timeout);
      }
      if (opts?.abort) {
        opts.abort.onabort = reject;
      }
      try {
        this.ws = new this._WebSocket(this.url);
      } catch (err2) {
        clearTimeout(connectionTimeoutHandle);
        reject(err2);
        return;
      }
      this.ws.onopen = () => {
        if (this.reconnectTimeoutHandle) {
          clearTimeout(this.reconnectTimeoutHandle);
          this.reconnectTimeoutHandle = void 0;
        }
        clearTimeout(connectionTimeoutHandle);
        this._connected = true;
        const isReconnection = this.reconnectAttempts > 0;
        this.reconnectAttempts = 0;
        for (const sub of this.openSubs.values()) {
          sub.eosed = false;
          if (isReconnection) {
            for (let f = 0; f < sub.filters.length; f++) {
              if (sub.lastEmitted) {
                sub.filters[f].since = sub.lastEmitted + 1;
              }
            }
          }
          sub.fire();
        }
        if (this.enablePing) {
          this.pingIntervalHandle = setInterval(() => this.pingpong(), this.pingFrequency);
        }
        resolve();
      };
      this.ws.onerror = () => {
        clearTimeout(connectionTimeoutHandle);
        reject("connection failed");
        this.connectionPromise = void 0;
        if (this.reconnectAttempts === 0) {
          this.skipReconnection = true;
        }
        this.ws?.close?.();
        this.handleHardClose("relay connection failed");
      };
      this.ws.onclose = (ev) => {
        clearTimeout(connectionTimeoutHandle);
        reject(ev.message || "websocket closed");
        this.handleHardClose("relay connection closed");
      };
      this.ws.onmessage = this._onmessage.bind(this);
    });
    return this.connectionPromise;
  }
  waitForPingPong() {
    return new Promise((resolve) => {
      ;
      this.ws.once("pong", () => resolve(true));
      this.ws.ping();
    });
  }
  waitForDummyReq() {
    return new Promise((resolve, reject) => {
      if (!this.connectionPromise)
        return reject(new Error(`no connection to ${this.url}, can't ping`));
      try {
        const sub = this.subscribe(
          [{ ids: ["aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"], limit: 1 }],
          {
            label: "<forced-ping>",
            oneose: () => {
              resolve(true);
              sub.close();
            },
            onclose() {
              resolve(true);
            },
            eoseTimeout: this.pingTimeout + 1e3
          }
        );
      } catch (err2) {
        reject(err2);
      }
    });
  }
  async pingpong() {
    if (this.ws?.readyState === 1) {
      const result = await Promise.any([
        this.ws && this.ws.ping && this.ws.once ? this.waitForPingPong() : this.waitForDummyReq(),
        new Promise((res) => setTimeout(() => res(false), this.pingTimeout))
      ]);
      if (!result) {
        if (this.ws?.readyState === this._WebSocket.OPEN) {
          this.ws?.close();
        }
      }
    }
  }
  async send(message) {
    if (!this.connectionPromise)
      throw new SendingOnClosedConnection(message, this.url);
    this.connectionPromise.then(() => {
      this.ws?.send(message);
    });
  }
  async auth(signAuthEvent) {
    const challenge2 = this.challenge;
    if (!challenge2)
      throw new Error("can't perform auth, no challenge was received");
    if (this.authPromise)
      return this.authPromise;
    this.authPromise = new Promise(async (resolve, reject) => {
      try {
        let evt = await signAuthEvent(makeAuthEvent(this.url, challenge2));
        let timeout = setTimeout(() => {
          let ep = this.openEventPublishes.get(evt.id);
          if (ep) {
            ep.reject(new Error("auth timed out"));
            this.openEventPublishes.delete(evt.id);
          }
        }, this.publishTimeout);
        this.openEventPublishes.set(evt.id, { resolve, reject, timeout });
        this.send('["AUTH",' + JSON.stringify(evt) + "]");
      } catch (err2) {
        console.warn("subscribe auth function failed:", err2);
      }
    });
    return this.authPromise;
  }
  async publish(event) {
    this.idleSince = void 0;
    this.clearIdleTimeout();
    this.ongoingOperations++;
    const ret = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        const ep = this.openEventPublishes.get(event.id);
        if (ep) {
          ep.reject(new Error("publish timed out"));
          this.openEventPublishes.delete(event.id);
        }
      }, this.publishTimeout);
      this.openEventPublishes.set(event.id, { resolve, reject, timeout });
    });
    try {
      await this.send('["EVENT",' + JSON.stringify(event) + "]");
    } catch (err2) {
      const ep = this.openEventPublishes.get(event.id);
      if (ep) {
        ep.reject(err2);
        this.openEventPublishes.delete(event.id);
      }
    }
    this.ongoingOperations--;
    if (this.ongoingOperations === 0) {
      this.idleSince = Date.now();
      this.scheduleIdleClose();
    }
    return ret;
  }
  async count(filters, params) {
    return (await this.countWithHLL(filters, params)).count;
  }
  async countWithHLL(filters, params) {
    this.serial++;
    const id = params?.id || "count:" + this.serial;
    const ret = new Promise((resolve, reject) => {
      this.openCountRequests.set(id, { resolve, reject });
    });
    try {
      await this.send('["COUNT","' + id + '",' + JSON.stringify(filters).substring(1));
    } catch (err2) {
      const cr = this.openCountRequests.get(id);
      if (cr) {
        cr.reject(err2);
        this.openCountRequests.delete(id);
      }
    }
    return ret;
  }
  subscribe(filters, params) {
    if (params.label !== "<forced-ping>") {
      this.idleSince = void 0;
      this.clearIdleTimeout();
      this.ongoingOperations++;
    }
    const sub = this.prepareSubscription(filters, params);
    sub.fire();
    if (params.abort) {
      params.abort.onabort = () => sub.close(String(params.abort.reason || "<aborted>"));
    }
    return sub;
  }
  prepareSubscription(filters, params) {
    this.serial++;
    const id = params.id || (params.label ? params.label + ":" : "sub:") + this.serial;
    const sub = new Subscription(this, id, filters, params);
    this.openSubs.set(id, sub);
    return sub;
  }
  close() {
    this.skipReconnection = true;
    if (this.reconnectTimeoutHandle) {
      clearTimeout(this.reconnectTimeoutHandle);
      this.reconnectTimeoutHandle = void 0;
    }
    if (this.pingIntervalHandle) {
      clearInterval(this.pingIntervalHandle);
      this.pingIntervalHandle = void 0;
    }
    this.closeAllSubscriptions("relay connection closed by us");
    this._connected = false;
    this.connectionPromise = void 0;
    this.idleSince = void 0;
    this.clearIdleTimeout();
    this.onclose?.();
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
      if (this.ws.readyState !== this._WebSocket.CLOSING && this.ws.readyState !== this._WebSocket.CLOSED) {
        this.ws.close();
      }
    }
  }
  _onmessage(ev) {
    const json = ev.data;
    if (!json) {
      return;
    }
    const subid = getSubscriptionId(json);
    if (subid) {
      const so = this.openSubs.get(subid);
      if (!so) {
        return;
      }
      const id = getHex64(json, "id");
      const alreadyHave = so.alreadyHaveEvent?.(id);
      so.receivedEvent?.(this, id);
      if (alreadyHave) {
        return;
      }
    }
    try {
      let data = JSON.parse(json);
      switch (data[0]) {
        case "EVENT": {
          const so = this.openSubs.get(data[1]);
          const event = data[2];
          if (matchFilters(so.filters, event) && this.verifyEvent(event, this.url)) {
            so.onevent(event);
          } else {
            so.oninvalidevent?.(event);
          }
          if (!so.lastEmitted || so.lastEmitted < event.created_at)
            so.lastEmitted = event.created_at;
          return;
        }
        case "COUNT": {
          const id = data[1];
          const payload = data[2];
          const cr = this.openCountRequests.get(id);
          if (cr) {
            cr.resolve(payload);
            this.openCountRequests.delete(id);
          }
          return;
        }
        case "EOSE": {
          const so = this.openSubs.get(data[1]);
          if (!so)
            return;
          so.receivedEose();
          return;
        }
        case "OK": {
          const id = data[1];
          const ok = data[2];
          const reason = data[3];
          const ep = this.openEventPublishes.get(id);
          if (ep) {
            clearTimeout(ep.timeout);
            if (ok)
              ep.resolve(reason);
            else
              ep.reject(new Error(reason));
            this.openEventPublishes.delete(id);
          }
          return;
        }
        case "CLOSED": {
          const id = data[1];
          const so = this.openSubs.get(id);
          if (!so) {
            const cr = this.openCountRequests.get(id);
            if (cr) {
              cr.reject(new Error(data[2]));
              this.openCountRequests.delete(id);
            }
            return;
          }
          so.closed = true;
          so.close(data[2]);
          return;
        }
        case "NOTICE": {
          this.onnotice(data[1]);
          return;
        }
        case "AUTH": {
          this.challenge = data[1];
          if (this.onauth) {
            this.auth(this.onauth).catch((err2) => {
              if (!(err2 instanceof SendingOnClosedConnection)) {
                throw err2;
              }
            });
          }
          return;
        }
        default: {
          const so = this.openSubs.get(data[1]);
          so?.oncustom?.(data);
          return;
        }
      }
    } catch (err2) {
      try {
        const [_, __, event] = JSON.parse(json);
        console.warn(`[nostr] relay ${this.url} error processing message:`, err2, event);
      } catch (_) {
        console.warn(`[nostr] relay ${this.url} error processing message:`, err2);
      }
      return;
    }
  }
};
var Subscription = class {
  relay;
  id;
  lastEmitted;
  closed = false;
  eosed = false;
  filters;
  alreadyHaveEvent;
  receivedEvent;
  onevent;
  oninvalidevent;
  oneose;
  onclose;
  oncustom;
  eoseTimeout;
  eoseTimeoutHandle;
  constructor(relay, id, filters, params) {
    if (filters.length === 0)
      throw new Error("subscription can't be created with zero filters");
    this.relay = relay;
    this.filters = filters;
    this.id = id;
    this.alreadyHaveEvent = params.alreadyHaveEvent;
    this.receivedEvent = params.receivedEvent;
    this.eoseTimeout = params.eoseTimeout || relay.baseEoseTimeout;
    this.oneose = params.oneose;
    this.onclose = params.onclose;
    this.oninvalidevent = params.oninvalidevent;
    this.onevent = params.onevent || ((event) => {
      console.warn(
        `onevent() callback not defined for subscription '${this.id}' in relay ${this.relay.url}. event received:`,
        event
      );
    });
  }
  fire() {
    this.relay.send('["REQ","' + this.id + '",' + JSON.stringify(this.filters).substring(1));
    this.eoseTimeoutHandle = setTimeout(this.receivedEose.bind(this), this.eoseTimeout);
  }
  receivedEose() {
    if (this.eosed)
      return;
    clearTimeout(this.eoseTimeoutHandle);
    this.eosed = true;
    this.oneose?.();
  }
  close(reason = "closed by caller") {
    if (!this.closed && this.relay.connected) {
      try {
        this.relay.send('["CLOSE",' + JSON.stringify(this.id) + "]");
      } catch (err2) {
        if (err2 instanceof SendingOnClosedConnection) {
        } else {
          throw err2;
        }
      }
      this.closed = true;
    }
    this.relay.openSubs.delete(this.id);
    if (!this.id.startsWith("<forced-ping>")) {
      this.relay.ongoingOperations--;
      if (this.relay.ongoingOperations === 0) {
        this.relay.idleSince = Date.now();
        this.relay.scheduleIdleClose();
      }
    }
    this.onclose?.(reason);
  }
};
var _WebSocket;
try {
  _WebSocket = WebSocket;
} catch {
}
var M = 256;
var HLL_HEX_LENGTH = M * 2;
var utf8Encoder2 = new TextEncoder();
function getCountManyFilter(target, directive) {
  switch (directive) {
    case "reactions":
      return { "#e": [target], kinds: [7] };
    case "reposts":
      return { "#e": [target], kinds: [6] };
    case "quotes":
      return { "#q": [target], kinds: [1, 1111] };
    case "replies":
      return { "#e": [target], kinds: [1] };
    case "comments":
      return { "#E": [target], kinds: [1111] };
    case "followers":
      return { "#p": [target], kinds: [3] };
  }
}
function newHll() {
  return new Uint8Array(M);
}
function hllDecode(hex) {
  if (hex.length !== HLL_HEX_LENGTH || !/^[0-9a-f]+$/.test(hex))
    return void 0;
  const registers = new Uint8Array(M);
  for (let i22 = 0; i22 < M; i22++) {
    registers[i22] = parseInt(hex.slice(i22 * 2, i22 * 2 + 2), 16);
  }
  return registers;
}
function hllEncode(registers) {
  if (registers.length !== M)
    throw new Error(`invalid number of registers ${registers.length}`);
  let hex = "";
  for (let i22 = 0; i22 < M; i22++) {
    hex += registers[i22].toString(16).padStart(2, "0");
  }
  return hex;
}
function mergeHll(target, source) {
  if (target.length === 0)
    target = newHll();
  if (target.length !== M)
    throw new Error(`invalid number of registers ${target.length}`);
  if (source.length !== M)
    throw new Error(`invalid number of registers ${source.length}`);
  for (let i22 = 0; i22 < M; i22++) {
    if (source[i22] > target[i22])
      target[i22] = source[i22];
  }
  return target;
}
var AbstractSimplePool = class {
  relays = /* @__PURE__ */ new Map();
  seenOn = /* @__PURE__ */ new Map();
  trackRelays = false;
  verifyEvent;
  enablePing;
  enableReconnect;
  idleTimeout = 2e4;
  automaticallyAuth;
  onRelayConnectionFailure;
  onRelayConnectionSuccess;
  allowConnectingToRelay;
  maxWaitForConnection;
  _WebSocket;
  constructor(opts) {
    this.verifyEvent = opts.verifyEvent;
    this._WebSocket = opts.websocketImplementation;
    this.enablePing = opts.enablePing;
    this.enableReconnect = opts.enableReconnect || false;
    if (opts.idleTimeout)
      this.idleTimeout = opts.idleTimeout;
    this.automaticallyAuth = opts.automaticallyAuth;
    this.onRelayConnectionFailure = opts.onRelayConnectionFailure;
    this.onRelayConnectionSuccess = opts.onRelayConnectionSuccess;
    this.allowConnectingToRelay = opts.allowConnectingToRelay;
    this.maxWaitForConnection = opts.maxWaitForConnection || 3e3;
  }
  async ensureRelay(url, params) {
    url = normalizeURL(url);
    let relay = this.relays.get(url);
    if (!relay) {
      relay = new AbstractRelay(url, {
        verifyEvent: this.verifyEvent,
        websocketImplementation: this._WebSocket,
        enablePing: this.enablePing,
        enableReconnect: this.enableReconnect,
        idleTimeout: this.idleTimeout
      });
      relay.onclose = () => {
        this.relays.delete(url);
      };
      this.relays.set(url, relay);
    }
    if (this.automaticallyAuth) {
      const authSignerFn = this.automaticallyAuth(url);
      if (authSignerFn) {
        relay.onauth = authSignerFn;
      }
    }
    try {
      await relay.connect({
        timeout: params?.connectionTimeout,
        abort: params?.abort
      });
    } catch (err2) {
      this.relays.delete(url);
      throw err2;
    }
    return relay;
  }
  close(relays) {
    relays.map(normalizeURL).forEach((url) => {
      this.relays.get(url)?.close();
      this.relays.delete(url);
    });
  }
  subscribe(relays, filter, params) {
    const request = [];
    const uniqUrls = [];
    for (let i22 = 0; i22 < relays.length; i22++) {
      const url = normalizeURL(relays[i22]);
      if (!request.find((r) => r.url === url)) {
        if (uniqUrls.indexOf(url) === -1) {
          uniqUrls.push(url);
          request.push({ url, filter });
        }
      }
    }
    return this.subscribeMap(request, params);
  }
  subscribeMany(relays, filter, params) {
    return this.subscribe(relays, filter, params);
  }
  subscribeMap(requests, params) {
    const grouped = /* @__PURE__ */ new Map();
    for (const req of requests) {
      const { url, filter } = req;
      if (!grouped.has(url))
        grouped.set(url, []);
      grouped.get(url).push(filter);
    }
    const groupedRequests = Array.from(grouped.entries()).map(([url, filters]) => ({ url, filters }));
    if (this.trackRelays) {
      params.receivedEvent = (relay, id) => {
        let set = this.seenOn.get(id);
        if (!set) {
          set = /* @__PURE__ */ new Set();
          this.seenOn.set(id, set);
        }
        set.add(relay);
      };
    }
    const _knownIds = /* @__PURE__ */ new Set();
    const subs = [];
    const eosesReceived = [];
    let handleEose = (i22) => {
      if (eosesReceived[i22])
        return;
      eosesReceived[i22] = true;
      if (eosesReceived.filter((a) => a).length === groupedRequests.length) {
        params.oneose?.();
        handleEose = () => {
        };
      }
    };
    const closesReceived = [];
    let handleClose = (i22, url, reason) => {
      if (closesReceived[i22])
        return;
      handleEose(i22);
      closesReceived[i22] = { url, reason };
      if (closesReceived.filter((a) => a).length === groupedRequests.length) {
        params.onclose?.(closesReceived);
        handleClose = () => {
        };
      }
    };
    const localAlreadyHaveEventHandler = (id) => {
      if (params.alreadyHaveEvent?.(id)) {
        return true;
      }
      const have = _knownIds.has(id);
      _knownIds.add(id);
      return have;
    };
    const allOpened = Promise.all(
      groupedRequests.map(async ({ url, filters }, i22) => {
        if (this.allowConnectingToRelay?.(url, ["read", filters]) === false) {
          handleClose(i22, url, "connection skipped by allowConnectingToRelay");
          return;
        }
        let relay;
        try {
          relay = await this.ensureRelay(url, {
            connectionTimeout: this.maxWaitForConnection < (params.maxWait || 0) ? Math.max(params.maxWait * 0.8, params.maxWait - 1e3) : this.maxWaitForConnection,
            abort: params.abort
          });
        } catch (err2) {
          this.onRelayConnectionFailure?.(url);
          handleClose(i22, url, err2?.message || String(err2));
          return;
        }
        this.onRelayConnectionSuccess?.(url);
        let subscription = relay.subscribe(filters, {
          ...params,
          oneose: () => handleEose(i22),
          onclose: (reason) => {
            if (reason.startsWith("auth-required: ") && params.onauth) {
              relay.auth(params.onauth).then(() => {
                relay.subscribe(filters, {
                  ...params,
                  oneose: () => handleEose(i22),
                  onclose: (reason2) => {
                    handleClose(i22, url, reason2);
                  },
                  alreadyHaveEvent: localAlreadyHaveEventHandler,
                  eoseTimeout: params.maxWait,
                  abort: params.abort
                });
              }).catch((err2) => {
                handleClose(i22, url, `auth was required and attempted, but failed with: ${err2}`);
              });
            } else {
              handleClose(i22, url, reason);
            }
          },
          alreadyHaveEvent: localAlreadyHaveEventHandler,
          eoseTimeout: params.maxWait,
          abort: params.abort
        });
        subs.push(subscription);
      })
    );
    return {
      async close(reason) {
        await allOpened;
        subs.forEach((sub) => {
          sub.close(reason);
        });
      }
    };
  }
  subscribeEose(relays, filter, params) {
    let subcloser;
    subcloser = this.subscribe(relays, filter, {
      ...params,
      oneose() {
        const reason = "closed automatically on eose";
        if (subcloser)
          subcloser.close(reason);
        else
          params.onclose?.(relays.map((url) => ({ url, reason })));
      }
    });
    return subcloser;
  }
  subscribeManyEose(relays, filter, params) {
    return this.subscribeEose(relays, filter, params);
  }
  async querySync(relays, filter, params) {
    return new Promise(async (resolve) => {
      const events = [];
      this.subscribeEose(relays, filter, {
        ...params,
        onevent(event) {
          events.push(event);
        },
        onclose(_) {
          resolve(events);
        }
      });
    });
  }
  async get(relays, filter, params) {
    filter.limit = 1;
    const events = await this.querySync(relays, filter, params);
    events.sort((a, b) => b.created_at - a.created_at);
    return events[0] || null;
  }
  async countMany(relays, target, directive, params) {
    const filter = getCountManyFilter(target, directive);
    const urls = [];
    for (let i22 = 0; i22 < relays.length; i22++) {
      const url = normalizeURL(relays[i22]);
      if (urls.indexOf(url) === -1)
        urls.push(url);
    }
    const responses = await Promise.all(
      urls.map(async (url) => {
        if (this.allowConnectingToRelay?.(url, ["read", [filter]]) === false)
          return null;
        let relay;
        try {
          relay = await this.ensureRelay(url, {
            connectionTimeout: this.maxWaitForConnection < (params?.maxWait || 0) ? Math.max(params.maxWait * 0.8, params.maxWait - 1e3) : this.maxWaitForConnection,
            abort: params?.abort
          });
        } catch (err2) {
          this.onRelayConnectionFailure?.(url);
          return null;
        }
        this.onRelayConnectionSuccess?.(url);
        return relay.countWithHLL([filter], { id: params?.id }).catch(() => null);
      })
    );
    let count = 0;
    let hll;
    for (const response of responses) {
      if (!response)
        continue;
      if (response.count > count)
        count = response.count;
      if (!response.hll || response.hll.length !== 512)
        continue;
      const registers = hllDecode(response.hll);
      if (!registers)
        continue;
      hll = mergeHll(hll || new Uint8Array(0), registers);
    }
    return hll ? { count, hll: hllEncode(hll) } : { count };
  }
  publish(relays, event, params) {
    return relays.map(normalizeURL).map(async (url, i22, arr) => {
      if (arr.indexOf(url) !== i22) {
        return Promise.reject("duplicate url");
      }
      if (this.allowConnectingToRelay?.(url, ["write", event]) === false) {
        return Promise.reject("connection skipped by allowConnectingToRelay");
      }
      let r;
      try {
        r = await this.ensureRelay(url, {
          connectionTimeout: this.maxWaitForConnection < (params?.maxWait || 0) ? Math.max(params.maxWait * 0.8, params.maxWait - 1e3) : this.maxWaitForConnection,
          abort: params?.abort
        });
      } catch (err2) {
        this.onRelayConnectionFailure?.(url);
        return Promise.reject("connection failure: " + String(err2));
      }
      return r.publish(event).catch(async (err2) => {
        if (err2 instanceof Error && err2.message.startsWith("auth-required: ") && params?.onauth) {
          await r.auth(params.onauth);
          return r.publish(event);
        }
        throw err2;
      }).then((reason) => {
        if (this.trackRelays) {
          let set = this.seenOn.get(event.id);
          if (!set) {
            set = /* @__PURE__ */ new Set();
            this.seenOn.set(event.id, set);
          }
          set.add(r);
        }
        return reason;
      });
    });
  }
  listConnectionStatus() {
    const map = /* @__PURE__ */ new Map();
    this.relays.forEach((relay, url) => map.set(url, relay.connected));
    return map;
  }
  destroy() {
    this.relays.forEach((conn) => conn.close());
    this.relays = /* @__PURE__ */ new Map();
  }
  pruneIdleRelays(idleThresholdMs = 1e4) {
    const prunedUrls = [];
    for (const [url, relay] of this.relays) {
      if (relay.idleSince && Date.now() - relay.idleSince >= idleThresholdMs) {
        this.relays.delete(url);
        prunedUrls.push(url);
        relay.close();
      }
    }
    return prunedUrls;
  }
};
var _WebSocket2;
try {
  _WebSocket2 = WebSocket;
} catch {
}
var SimplePool = class extends AbstractSimplePool {
  constructor(options) {
    super({ verifyEvent, websocketImplementation: _WebSocket2, maxWaitForConnection: 3e3, ...options });
  }
};
var nip19_exports = {};
__export(nip19_exports, {
  BECH32_REGEX: () => BECH32_REGEX,
  Bech32MaxSize: () => Bech32MaxSize,
  NostrTypeGuard: () => NostrTypeGuard,
  decode: () => decode,
  decodeNostrURI: () => decodeNostrURI,
  encodeBytes: () => encodeBytes,
  naddrEncode: () => naddrEncode,
  neventEncode: () => neventEncode,
  noteEncode: () => noteEncode,
  nprofileEncode: () => nprofileEncode,
  npubEncode: () => npubEncode,
  nsecEncode: () => nsecEncode
});
var NostrTypeGuard = {
  isNProfile: (value) => /^nprofile1[a-z\d]+$/.test(value || ""),
  isNEvent: (value) => /^nevent1[a-z\d]+$/.test(value || ""),
  isNAddr: (value) => /^naddr1[a-z\d]+$/.test(value || ""),
  isNSec: (value) => /^nsec1[a-z\d]{58}$/.test(value || ""),
  isNPub: (value) => /^npub1[a-z\d]{58}$/.test(value || ""),
  isNote: (value) => /^note1[a-z\d]+$/.test(value || ""),
  isNcryptsec: (value) => /^ncryptsec1[a-z\d]+$/.test(value || "")
};
var Bech32MaxSize = 5e3;
var BECH32_REGEX = /[\x21-\x7E]{1,83}1[023456789acdefghjklmnpqrstuvwxyz]{6,}/;
function integerToUint8Array(number) {
  const uint8Array = new Uint8Array(4);
  uint8Array[0] = number >> 24 & 255;
  uint8Array[1] = number >> 16 & 255;
  uint8Array[2] = number >> 8 & 255;
  uint8Array[3] = number & 255;
  return uint8Array;
}
function decodeNostrURI(nip19code) {
  try {
    if (nip19code.startsWith("nostr:"))
      nip19code = nip19code.substring(6);
    return decode(nip19code);
  } catch (_err) {
    return { type: "invalid", data: null };
  }
}
function decode(code) {
  let { prefix, words } = bech32.decode(code, Bech32MaxSize);
  let data = new Uint8Array(bech32.fromWords(words));
  switch (prefix) {
    case "nprofile": {
      let tlv = parseTLV(data);
      if (!tlv[0]?.[0])
        throw new Error("missing TLV 0 for nprofile");
      if (tlv[0][0].length !== 32)
        throw new Error("TLV 0 should be 32 bytes");
      return {
        type: "nprofile",
        data: {
          pubkey: bytesToHex(tlv[0][0]),
          relays: tlv[1] ? tlv[1].map((d) => utf8Decoder.decode(d)) : []
        }
      };
    }
    case "nevent": {
      let tlv = parseTLV(data);
      if (!tlv[0]?.[0])
        throw new Error("missing TLV 0 for nevent");
      if (tlv[0][0].length !== 32)
        throw new Error("TLV 0 should be 32 bytes");
      if (tlv[2] && tlv[2][0].length !== 32)
        throw new Error("TLV 2 should be 32 bytes");
      if (tlv[3] && tlv[3][0].length !== 4)
        throw new Error("TLV 3 should be 4 bytes");
      return {
        type: "nevent",
        data: {
          id: bytesToHex(tlv[0][0]),
          relays: tlv[1] ? tlv[1].map((d) => utf8Decoder.decode(d)) : [],
          author: tlv[2]?.[0] ? bytesToHex(tlv[2][0]) : void 0,
          kind: tlv[3]?.[0] ? parseInt(bytesToHex(tlv[3][0]), 16) : void 0
        }
      };
    }
    case "naddr": {
      let tlv = parseTLV(data);
      if (!tlv[0]?.[0])
        throw new Error("missing TLV 0 for naddr");
      if (!tlv[2]?.[0])
        throw new Error("missing TLV 2 for naddr");
      if (tlv[2][0].length !== 32)
        throw new Error("TLV 2 should be 32 bytes");
      if (!tlv[3]?.[0])
        throw new Error("missing TLV 3 for naddr");
      if (tlv[3][0].length !== 4)
        throw new Error("TLV 3 should be 4 bytes");
      return {
        type: "naddr",
        data: {
          identifier: utf8Decoder.decode(tlv[0][0]),
          pubkey: bytesToHex(tlv[2][0]),
          kind: parseInt(bytesToHex(tlv[3][0]), 16),
          relays: tlv[1] ? tlv[1].map((d) => utf8Decoder.decode(d)) : []
        }
      };
    }
    case "nsec":
      return { type: prefix, data };
    case "npub":
    case "note":
      return { type: prefix, data: bytesToHex(data) };
    default:
      throw new Error(`unknown prefix ${prefix}`);
  }
}
function parseTLV(data) {
  let result = {};
  let rest = data;
  while (rest.length > 0) {
    if (rest.length < 2)
      throw new Error("not enough data to read TLV");
    let t = rest[0];
    let l = rest[1];
    let v = rest.slice(2, 2 + l);
    rest = rest.slice(2 + l);
    if (v.length < l)
      throw new Error(`not enough data to read on TLV ${t}`);
    result[t] = result[t] || [];
    result[t].push(v);
  }
  return result;
}
function nsecEncode(key) {
  return encodeBytes("nsec", key);
}
function npubEncode(hex) {
  return encodeBytes("npub", hexToBytes(hex));
}
function noteEncode(hex) {
  return encodeBytes("note", hexToBytes(hex));
}
function encodeBech32(prefix, data) {
  let words = bech32.toWords(data);
  return bech32.encode(prefix, words, Bech32MaxSize);
}
function encodeBytes(prefix, bytes) {
  return encodeBech32(prefix, bytes);
}
function nprofileEncode(profile) {
  let data = encodeTLV({
    0: [hexToBytes(profile.pubkey)],
    1: (profile.relays || []).map((url) => utf8Encoder.encode(url))
  });
  return encodeBech32("nprofile", data);
}
function neventEncode(event) {
  let kindArray;
  if (event.kind !== void 0) {
    kindArray = integerToUint8Array(event.kind);
  }
  let data = encodeTLV({
    0: [hexToBytes(event.id)],
    1: (event.relays || []).map((url) => utf8Encoder.encode(url)),
    2: event.author ? [hexToBytes(event.author)] : [],
    3: kindArray ? [new Uint8Array(kindArray)] : []
  });
  return encodeBech32("nevent", data);
}
function naddrEncode(addr) {
  let kind = new ArrayBuffer(4);
  new DataView(kind).setUint32(0, addr.kind, false);
  let data = encodeTLV({
    0: [utf8Encoder.encode(addr.identifier)],
    1: (addr.relays || []).map((url) => utf8Encoder.encode(url)),
    2: [hexToBytes(addr.pubkey)],
    3: [new Uint8Array(kind)]
  });
  return encodeBech32("naddr", data);
}
function encodeTLV(tlv) {
  let entries = [];
  Object.entries(tlv).reverse().forEach(([t, vs]) => {
    vs.forEach((v) => {
      let entry = new Uint8Array(v.length + 2);
      entry.set([parseInt(t)], 0);
      entry.set([v.length], 1);
      entry.set(v, 2);
      entries.push(entry);
    });
  });
  return concatBytes(...entries);
}
var nip04_exports = {};
__export(nip04_exports, {
  decrypt: () => decrypt2,
  encrypt: () => encrypt2
});
function encrypt2(secretKey, pubkey, text) {
  const privkey = secretKey instanceof Uint8Array ? secretKey : hexToBytes(secretKey);
  const key = secp256k1.getSharedSecret(privkey, hexToBytes("02" + pubkey));
  const normalizedKey = getNormalizedX(key);
  let iv = Uint8Array.from(randomBytes(16));
  let plaintext = utf8Encoder.encode(text);
  let ciphertext = cbc(normalizedKey, iv).encrypt(plaintext);
  let ctb64 = base64.encode(new Uint8Array(ciphertext));
  let ivb64 = base64.encode(new Uint8Array(iv.buffer));
  return `${ctb64}?iv=${ivb64}`;
}
function decrypt2(secretKey, pubkey, data) {
  const privkey = secretKey instanceof Uint8Array ? secretKey : hexToBytes(secretKey);
  let [ctb64, ivb64] = data.split("?iv=");
  let key = secp256k1.getSharedSecret(privkey, hexToBytes("02" + pubkey));
  let normalizedKey = getNormalizedX(key);
  let iv = base64.decode(ivb64);
  let ciphertext = base64.decode(ctb64);
  let plaintext = cbc(normalizedKey, iv).decrypt(ciphertext);
  return utf8Decoder.decode(plaintext);
}
function getNormalizedX(key) {
  return key.slice(1, 33);
}
var nip05_exports = {};
__export(nip05_exports, {
  NIP05_REGEX: () => NIP05_REGEX,
  isNip05: () => isNip05,
  isValid: () => isValid,
  queryProfile: () => queryProfile,
  searchDomain: () => searchDomain,
  useFetchImplementation: () => useFetchImplementation
});
var NIP05_REGEX = /^(?:([\w.+-]+)@)?([\w_-]+(\.[\w_-]+)+)$/;
var isNip05 = (value) => NIP05_REGEX.test(value || "");
var _fetch;
try {
  _fetch = fetch;
} catch (_) {
  null;
}
function useFetchImplementation(fetchImplementation) {
  _fetch = fetchImplementation;
}
async function searchDomain(domain, query = "") {
  try {
    const url = `https://${domain}/.well-known/nostr.json?name=${query}`;
    const res = await _fetch(url, { redirect: "manual" });
    if (res.status !== 200) {
      throw Error("Wrong response code");
    }
    const json = await res.json();
    return json.names;
  } catch (_) {
    return {};
  }
}
async function queryProfile(fullname) {
  const match = fullname.match(NIP05_REGEX);
  if (!match)
    return null;
  const [, name = "_", domain] = match;
  try {
    const url = `https://${domain}/.well-known/nostr.json?name=${name}`;
    const res = await _fetch(url, { redirect: "manual" });
    if (res.status !== 200) {
      throw Error("Wrong response code");
    }
    const json = await res.json();
    const pubkey = json.names[name];
    return pubkey ? { pubkey, relays: json.relays?.[pubkey] } : null;
  } catch (_e) {
    return null;
  }
}
async function isValid(pubkey, nip05) {
  const res = await queryProfile(nip05);
  return res ? res.pubkey === pubkey : false;
}
var nip10_exports = {};
__export(nip10_exports, {
  parse: () => parse
});
function parse(event) {
  const result = {
    reply: void 0,
    root: void 0,
    mentions: [],
    profiles: [],
    quotes: []
  };
  let maybeParent;
  let maybeRoot;
  for (let i22 = event.tags.length - 1; i22 >= 0; i22--) {
    const tag = event.tags[i22];
    if (tag[0] === "e" && tag[1] && isHex32(tag[1])) {
      const [_, eTagEventId, eTagRelayUrl, eTagMarker, eTagAuthor] = tag;
      const eventPointer = {
        id: eTagEventId,
        relays: eTagRelayUrl ? [eTagRelayUrl] : [],
        author: eTagAuthor && isHex32(eTagAuthor) ? eTagAuthor : void 0
      };
      if (eTagMarker === "root") {
        result.root = eventPointer;
        continue;
      }
      if (eTagMarker === "reply") {
        result.reply = eventPointer;
        continue;
      }
      if (eTagMarker === "mention") {
        result.mentions.push(eventPointer);
        continue;
      }
      if (!maybeParent) {
        maybeParent = eventPointer;
      } else {
        maybeRoot = eventPointer;
      }
      result.mentions.push(eventPointer);
      continue;
    }
    if (tag[0] === "q" && tag[1] && isHex32(tag[1])) {
      const [_, eTagEventId, eTagRelayUrl] = tag;
      result.quotes.push({
        id: eTagEventId,
        relays: eTagRelayUrl ? [eTagRelayUrl] : []
      });
    }
    if (tag[0] === "p" && tag[1] && isHex32(tag[1])) {
      result.profiles.push({
        pubkey: tag[1],
        relays: tag[2] ? [tag[2]] : []
      });
      continue;
    }
  }
  if (!result.root) {
    result.root = maybeRoot || maybeParent || result.reply;
  }
  if (!result.reply) {
    result.reply = maybeParent || result.root;
  }
  ;
  [result.reply, result.root].forEach((ref) => {
    if (!ref)
      return;
    let idx = result.mentions.indexOf(ref);
    if (idx !== -1) {
      result.mentions.splice(idx, 1);
    }
    if (ref.author) {
      let author = result.profiles.find((p) => p.pubkey === ref.author);
      if (author && author.relays) {
        if (!ref.relays) {
          ref.relays = [];
        }
        author.relays.forEach((url) => {
          if (ref.relays?.indexOf(url) === -1)
            ref.relays.push(url);
        });
        author.relays = ref.relays;
      }
    }
  });
  result.mentions.forEach((ref) => {
    if (ref.author) {
      let author = result.profiles.find((p) => p.pubkey === ref.author);
      if (author && author.relays) {
        if (!ref.relays) {
          ref.relays = [];
        }
        author.relays.forEach((url) => {
          if (ref.relays.indexOf(url) === -1)
            ref.relays.push(url);
        });
        author.relays = ref.relays;
      }
    }
  });
  return result;
}
var nip11_exports = {};
__export(nip11_exports, {
  fetchRelayInformation: () => fetchRelayInformation,
  useFetchImplementation: () => useFetchImplementation2
});
var _fetch2;
try {
  _fetch2 = fetch;
} catch {
}
function useFetchImplementation2(fetchImplementation) {
  _fetch2 = fetchImplementation;
}
async function fetchRelayInformation(url) {
  return await (await fetch(url.replace("ws://", "http://").replace("wss://", "https://"), {
    headers: { Accept: "application/nostr+json" }
  })).json();
}
var nip13_exports = {};
__export(nip13_exports, {
  getPow: () => getPow,
  minePow: () => minePow
});
function getPow(hex) {
  let count = 0;
  for (let i22 = 0; i22 < 64; i22 += 8) {
    const nibble = parseInt(hex.substring(i22, i22 + 8), 16);
    if (nibble === 0) {
      count += 32;
    } else {
      count += Math.clz32(nibble);
      break;
    }
  }
  return count;
}
function getPowFromBytes(hash) {
  let count = 0;
  for (let i22 = 0; i22 < hash.length; i22++) {
    const byte = hash[i22];
    if (byte === 0) {
      count += 8;
    } else {
      count += Math.clz32(byte) - 24;
      break;
    }
  }
  return count;
}
function minePow(unsigned, difficulty) {
  let count = 0;
  const event = unsigned;
  const tag = ["nonce", count.toString(), difficulty.toString()];
  event.tags.push(tag);
  while (true) {
    const now2 = Math.floor((/* @__PURE__ */ new Date()).getTime() / 1e3);
    if (now2 !== event.created_at) {
      count = 0;
      event.created_at = now2;
    }
    tag[1] = (++count).toString();
    const hash = sha256(
      utf8Encoder.encode(JSON.stringify([0, event.pubkey, event.created_at, event.kind, event.tags, event.content]))
    );
    if (getPowFromBytes(hash) >= difficulty) {
      event.id = bytesToHex(hash);
      break;
    }
  }
  return event;
}
var nip17_exports = {};
__export(nip17_exports, {
  unwrapEvent: () => unwrapEvent2,
  unwrapManyEvents: () => unwrapManyEvents2,
  wrapEvent: () => wrapEvent2,
  wrapManyEvents: () => wrapManyEvents2
});
var nip59_exports = {};
__export(nip59_exports, {
  createRumor: () => createRumor,
  createSeal: () => createSeal,
  createWrap: () => createWrap,
  unwrapEvent: () => unwrapEvent,
  unwrapManyEvents: () => unwrapManyEvents,
  wrapEvent: () => wrapEvent,
  wrapManyEvents: () => wrapManyEvents
});
var nip44_exports = {};
__export(nip44_exports, {
  decrypt: () => decrypt22,
  encrypt: () => encrypt22,
  getConversationKey: () => getConversationKey,
  v2: () => v2
});
var minPlaintextSize = 1;
var maxPlaintextSize = 4294967295;
var extendedPrefixThreshold = 65536;
function getConversationKey(privkeyA, pubkeyB) {
  const sharedX = secp256k1.getSharedSecret(privkeyA, hexToBytes("02" + pubkeyB)).subarray(1, 33);
  return extract(sha256, sharedX, utf8Encoder.encode("nip44-v2"));
}
function getMessageKeys(conversationKey, nonce) {
  const keys = expand(sha256, conversationKey, nonce, 76);
  return {
    chacha_key: keys.subarray(0, 32),
    chacha_nonce: keys.subarray(32, 44),
    hmac_key: keys.subarray(44, 76)
  };
}
function calcPaddedLen(len) {
  if (!Number.isSafeInteger(len) || len < 1)
    throw new Error("expected positive integer");
  if (len <= 32)
    return 32;
  const nextPower = 2 ** (Math.floor(Math.log2(len - 1)) + 1);
  const chunk = nextPower <= 256 ? 32 : nextPower / 8;
  return chunk * (Math.floor((len - 1) / chunk) + 1);
}
function writeU16BE(num2) {
  if (!Number.isSafeInteger(num2) || num2 < minPlaintextSize || num2 > 65535)
    throw new Error("invalid plaintext size: must be between 1 and 65535 bytes");
  const arr = new Uint8Array(2);
  new DataView(arr.buffer).setUint16(0, num2, false);
  return arr;
}
function writeU32BE(num2) {
  if (!Number.isSafeInteger(num2) || num2 < extendedPrefixThreshold || num2 > maxPlaintextSize)
    throw new Error("invalid plaintext size: must be between 65536 and 4294967295 bytes");
  const arr = new Uint8Array(4);
  new DataView(arr.buffer).setUint32(0, num2, false);
  return arr;
}
function pad(plaintext) {
  const unpadded = utf8Encoder.encode(plaintext);
  const unpaddedLen = unpadded.length;
  if (unpaddedLen < minPlaintextSize || unpaddedLen > maxPlaintextSize)
    throw new Error("invalid plaintext size: must be between 1 and 4294967295 bytes");
  const prefix = unpaddedLen >= extendedPrefixThreshold ? concatBytes(new Uint8Array([0, 0]), writeU32BE(unpaddedLen)) : writeU16BE(unpaddedLen);
  const suffix = new Uint8Array(calcPaddedLen(unpaddedLen) - unpaddedLen);
  return concatBytes(prefix, unpadded, suffix);
}
function unpad(padded) {
  const dv = new DataView(padded.buffer, padded.byteOffset, padded.byteLength);
  const firstTwo = dv.getUint16(0);
  let unpaddedLen;
  let prefixLen;
  if (firstTwo === 0) {
    unpaddedLen = dv.getUint32(2);
    if (unpaddedLen < extendedPrefixThreshold)
      throw new Error("invalid padding");
    prefixLen = 6;
  } else {
    unpaddedLen = firstTwo;
    prefixLen = 2;
  }
  const unpadded = padded.subarray(prefixLen, prefixLen + unpaddedLen);
  if (unpaddedLen < minPlaintextSize || unpaddedLen > maxPlaintextSize || unpadded.length !== unpaddedLen || padded.length !== prefixLen + calcPaddedLen(unpaddedLen))
    throw new Error("invalid padding");
  return utf8Decoder.decode(unpadded);
}
function hmacAad(key, message, aad) {
  if (aad.length !== 32)
    throw new Error("AAD associated data must be 32 bytes");
  const combined = concatBytes(aad, message);
  return hmac(sha256, key, combined);
}
function decodePayload(payload) {
  if (typeof payload !== "string")
    throw new Error("payload must be a valid string");
  const plen = payload.length;
  if (plen < 132)
    throw new Error("invalid payload length: " + plen);
  if (payload[0] === "#")
    throw new Error("unknown encryption version");
  let data;
  try {
    data = base64.decode(payload);
  } catch (error) {
    throw new Error("invalid base64: " + error.message);
  }
  const dlen = data.length;
  if (dlen < 99)
    throw new Error("invalid data length: " + dlen);
  const vers = data[0];
  if (vers !== 2)
    throw new Error("unknown encryption version " + vers);
  return {
    nonce: data.subarray(1, 33),
    ciphertext: data.subarray(33, -32),
    mac: data.subarray(-32)
  };
}
function encrypt22(plaintext, conversationKey, nonce = randomBytes(32)) {
  const { chacha_key, chacha_nonce, hmac_key } = getMessageKeys(conversationKey, nonce);
  const padded = pad(plaintext);
  const ciphertext = chacha20(chacha_key, chacha_nonce, padded);
  const mac = hmacAad(hmac_key, ciphertext, nonce);
  return base64.encode(concatBytes(new Uint8Array([2]), nonce, ciphertext, mac));
}
function decrypt22(payload, conversationKey) {
  const { nonce, ciphertext, mac } = decodePayload(payload);
  const { chacha_key, chacha_nonce, hmac_key } = getMessageKeys(conversationKey, nonce);
  const calculatedMac = hmacAad(hmac_key, ciphertext, nonce);
  if (!equalBytes(calculatedMac, mac))
    throw new Error("invalid MAC");
  const padded = chacha20(chacha_key, chacha_nonce, ciphertext);
  return unpad(padded);
}
var v2 = {
  utils: {
    getConversationKey,
    calcPaddedLen,
    pad,
    unpad
  },
  encrypt: encrypt22,
  decrypt: decrypt22
};
var TWO_DAYS = 2 * 24 * 60 * 60;
var now = () => Math.round(Date.now() / 1e3);
var randomNow = () => Math.round(now() - Math.random() * TWO_DAYS);
var nip44ConversationKey = (privateKey, publicKey) => getConversationKey(privateKey, publicKey);
var nip44Encrypt = (data, privateKey, publicKey) => encrypt22(JSON.stringify(data), nip44ConversationKey(privateKey, publicKey));
var nip44Decrypt = (data, privateKey) => JSON.parse(decrypt22(data.content, nip44ConversationKey(privateKey, data.pubkey)));
function createRumor(event, privateKey) {
  const rumor = {
    created_at: now(),
    content: "",
    tags: [],
    ...event,
    pubkey: getPublicKey(privateKey)
  };
  rumor.id = getEventHash(rumor);
  return rumor;
}
function createSeal(rumor, privateKey, recipientPublicKey) {
  return finalizeEvent(
    {
      kind: Seal,
      content: nip44Encrypt(rumor, privateKey, recipientPublicKey),
      created_at: randomNow(),
      tags: []
    },
    privateKey
  );
}
function createWrap(seal, recipientPublicKey) {
  const randomKey = generateSecretKey();
  return finalizeEvent(
    {
      kind: GiftWrap,
      content: nip44Encrypt(seal, randomKey, recipientPublicKey),
      created_at: randomNow(),
      tags: [["p", recipientPublicKey]]
    },
    randomKey
  );
}
function wrapEvent(event, senderPrivateKey, recipientPublicKey) {
  const rumor = createRumor(event, senderPrivateKey);
  const seal = createSeal(rumor, senderPrivateKey, recipientPublicKey);
  return createWrap(seal, recipientPublicKey);
}
function wrapManyEvents(event, senderPrivateKey, recipientsPublicKeys) {
  if (!recipientsPublicKeys || recipientsPublicKeys.length === 0) {
    throw new Error("At least one recipient is required.");
  }
  const senderPublicKey = getPublicKey(senderPrivateKey);
  const wrappeds = [wrapEvent(event, senderPrivateKey, senderPublicKey)];
  recipientsPublicKeys.forEach((recipientPublicKey) => {
    wrappeds.push(wrapEvent(event, senderPrivateKey, recipientPublicKey));
  });
  return wrappeds;
}
function unwrapEvent(wrap, recipientPrivateKey) {
  if (wrap.kind !== GiftWrap) {
    throw new Error(`unexpected wrap kind ${wrap.kind}, expected ${GiftWrap}`);
  }
  const seal = nip44Decrypt(wrap, recipientPrivateKey);
  if (seal.kind !== Seal) {
    throw new Error(`unexpected seal kind ${seal.kind}, expected ${Seal}`);
  }
  if (!verifyEvent(seal)) {
    throw new Error("seal signature is invalid");
  }
  const rumor = nip44Decrypt(seal, recipientPrivateKey);
  if (rumor.pubkey !== seal.pubkey) {
    throw new Error(`rumor pubkey ${rumor.pubkey} does not match seal pubkey ${seal.pubkey}`);
  }
  return rumor;
}
function unwrapManyEvents(wrappedEvents, recipientPrivateKey) {
  let unwrappedEvents = [];
  wrappedEvents.forEach((e) => {
    try {
      unwrappedEvents.push(unwrapEvent(e, recipientPrivateKey));
    } catch (_err) {
    }
  });
  unwrappedEvents.sort((a, b) => a.created_at - b.created_at);
  return unwrappedEvents;
}
function createEvent(recipients, message, conversationTitle, replyTo) {
  const baseEvent = {
    created_at: Math.ceil(Date.now() / 1e3),
    kind: PrivateDirectMessage,
    tags: [],
    content: message
  };
  const recipientsArray = Array.isArray(recipients) ? recipients : [recipients];
  recipientsArray.forEach(({ publicKey, relayUrl }) => {
    baseEvent.tags.push(relayUrl ? ["p", publicKey, relayUrl] : ["p", publicKey]);
  });
  if (replyTo) {
    baseEvent.tags.push(["e", replyTo.eventId, replyTo.relayUrl || "", "reply"]);
  }
  if (conversationTitle) {
    baseEvent.tags.push(["subject", conversationTitle]);
  }
  return baseEvent;
}
function wrapEvent2(senderPrivateKey, recipient, message, conversationTitle, replyTo) {
  const event = createEvent(recipient, message, conversationTitle, replyTo);
  return wrapEvent(event, senderPrivateKey, recipient.publicKey);
}
function wrapManyEvents2(senderPrivateKey, recipients, message, conversationTitle, replyTo) {
  if (!recipients || recipients.length === 0) {
    throw new Error("At least one recipient is required.");
  }
  const senderPublicKey = getPublicKey(senderPrivateKey);
  return [{ publicKey: senderPublicKey }, ...recipients].map(
    (recipient) => wrapEvent2(senderPrivateKey, recipient, message, conversationTitle, replyTo)
  );
}
var unwrapEvent2 = unwrapEvent;
var unwrapManyEvents2 = unwrapManyEvents;
var nip18_exports = {};
__export(nip18_exports, {
  finishRepostEvent: () => finishRepostEvent,
  getRepostedEvent: () => getRepostedEvent,
  getRepostedEventPointer: () => getRepostedEventPointer
});
function finishRepostEvent(t, reposted, relayUrl, privateKey) {
  let kind;
  const tags = [...t.tags ?? [], ["e", reposted.id, relayUrl], ["p", reposted.pubkey]];
  if (reposted.kind === ShortTextNote) {
    kind = Repost;
  } else {
    kind = GenericRepost;
    tags.push(["k", String(reposted.kind)]);
  }
  return finalizeEvent(
    {
      kind,
      tags,
      content: t.content === "" || reposted.tags?.find((tag) => tag[0] === "-") ? "" : JSON.stringify(reposted),
      created_at: t.created_at
    },
    privateKey
  );
}
function getRepostedEventPointer(event) {
  if (![Repost, GenericRepost].includes(event.kind)) {
    return void 0;
  }
  let lastETag;
  let lastPTag;
  for (let i22 = event.tags.length - 1; i22 >= 0 && (lastETag === void 0 || lastPTag === void 0); i22--) {
    const tag = event.tags[i22];
    if (tag.length >= 2) {
      if (tag[0] === "e" && lastETag === void 0) {
        lastETag = tag;
      } else if (tag[0] === "p" && lastPTag === void 0) {
        lastPTag = tag;
      }
    }
  }
  if (lastETag === void 0) {
    return void 0;
  }
  return {
    id: lastETag[1],
    relays: [lastETag[2], lastPTag?.[2]].filter((x2) => typeof x2 === "string"),
    author: lastPTag?.[1]
  };
}
function getRepostedEvent(event, { skipVerification } = {}) {
  const pointer = getRepostedEventPointer(event);
  if (pointer === void 0 || event.content === "") {
    return void 0;
  }
  let repostedEvent;
  try {
    repostedEvent = JSON.parse(event.content);
  } catch (error) {
    return void 0;
  }
  if (repostedEvent.id !== pointer.id) {
    return void 0;
  }
  if (!skipVerification && !verifyEvent(repostedEvent)) {
    return void 0;
  }
  return repostedEvent;
}
var nip21_exports = {};
__export(nip21_exports, {
  NOSTR_URI_REGEX: () => NOSTR_URI_REGEX,
  parse: () => parse2,
  test: () => test
});
var NOSTR_URI_REGEX = new RegExp(`nostr:(${BECH32_REGEX.source})`);
function test(value) {
  return typeof value === "string" && new RegExp(`^${NOSTR_URI_REGEX.source}$`).test(value);
}
function parse2(uri) {
  const match = uri.match(new RegExp(`^${NOSTR_URI_REGEX.source}$`));
  if (!match)
    throw new Error(`Invalid Nostr URI: ${uri}`);
  return {
    uri: match[0],
    value: match[1],
    decoded: decode(match[1])
  };
}
var nip22_exports = {};
__export(nip22_exports, {
  parse: () => parse3
});
function parseKind(kind) {
  if (!kind)
    return void 0;
  return /^\d+$/.test(kind) ? parseInt(kind, 10) : kind;
}
function parseAddressPointer(value, relayUrl) {
  const idx = value.indexOf(":");
  const idx2 = value.indexOf(":", idx + 1);
  if (idx === -1 || idx2 === -1)
    return void 0;
  const kind = parseInt(value.slice(0, idx), 10);
  if (Number.isNaN(kind))
    return void 0;
  const pubkey = value.slice(idx + 1, idx2);
  if (!isHex32(pubkey))
    return void 0;
  return {
    kind,
    pubkey,
    identifier: value.slice(idx2 + 1),
    relays: relayUrl ? [relayUrl] : []
  };
}
function parsePointer(tag) {
  switch (tag[0]) {
    case "E":
    case "e":
      if (!tag[1] || !isHex32(tag[1]))
        return void 0;
      return {
        id: tag[1],
        relays: tag[2] ? [tag[2]] : [],
        author: tag[3] && isHex32(tag[3]) ? tag[3] : void 0
      };
    case "A":
    case "a":
      if (!tag[1])
        return void 0;
      return parseAddressPointer(tag[1], tag[2]);
    case "I":
    case "i":
      if (!tag[1])
        return void 0;
      return {
        value: tag[1],
        hint: tag[2]
      };
  }
}
function parseQuote(tag) {
  if (!tag[1])
    return void 0;
  if (tag[1].includes(":")) {
    return parseAddressPointer(tag[1], tag[2]);
  }
  if (!isHex32(tag[1]))
    return void 0;
  return {
    id: tag[1],
    relays: tag[2] ? [tag[2]] : [],
    author: tag[3] && isHex32(tag[3]) ? tag[3] : void 0
  };
}
function choosePointer(candidates) {
  return candidates.findLast((candidate) => candidate.tagName === "A" || candidate.tagName === "a")?.pointer || candidates.findLast((candidate) => candidate.tagName === "I" || candidate.tagName === "i")?.pointer || candidates.findLast((candidate) => candidate.tagName === "E" || candidate.tagName === "e")?.pointer;
}
function inheritRelayHints(pointer, profiles) {
  if (!pointer || !("id" in pointer) || !pointer.author)
    return;
  const author = profiles.find((profile) => profile.pubkey === pointer.author);
  if (!author || !author.relays)
    return;
  if (!pointer.relays) {
    pointer.relays = [];
  }
  author.relays.forEach((url) => {
    if (pointer.relays.indexOf(url) === -1)
      pointer.relays.push(url);
  });
  author.relays = pointer.relays;
}
function parse3(event) {
  const result = {
    root: void 0,
    rootKind: void 0,
    reply: void 0,
    replyKind: void 0,
    mentions: [],
    quotes: [],
    profiles: []
  };
  const rootCandidates = [];
  const replyCandidates = [];
  for (const tag of event.tags) {
    if ((tag[0] === "E" || tag[0] === "A" || tag[0] === "I") && tag[1]) {
      const pointer = parsePointer(tag);
      if (pointer)
        rootCandidates.push({ tagName: tag[0], pointer });
      continue;
    }
    if ((tag[0] === "e" || tag[0] === "a" || tag[0] === "i") && tag[1]) {
      const pointer = parsePointer(tag);
      if (pointer)
        replyCandidates.push({ tagName: tag[0], pointer });
      continue;
    }
    if (tag[0] === "K") {
      result.rootKind = parseKind(tag[1]);
      continue;
    }
    if (tag[0] === "k") {
      result.replyKind = parseKind(tag[1]);
      continue;
    }
    if (tag[0] === "q") {
      const pointer = parseQuote(tag);
      if (pointer)
        result.quotes.push(pointer);
      continue;
    }
    if ((tag[0] === "P" || tag[0] === "p") && tag[1] && isHex32(tag[1])) {
      result.profiles.push({
        pubkey: tag[1],
        relays: tag[2] ? [tag[2]] : []
      });
    }
  }
  result.root = choosePointer(rootCandidates);
  result.reply = choosePointer(replyCandidates);
  inheritRelayHints(result.root, result.profiles);
  inheritRelayHints(result.reply, result.profiles);
  result.quotes.forEach((pointer) => inheritRelayHints(pointer, result.profiles));
  return result;
}
var nip25_exports = {};
__export(nip25_exports, {
  finishReactionEvent: () => finishReactionEvent,
  getReactedEventPointer: () => getReactedEventPointer
});
function finishReactionEvent(t, reacted, privateKey) {
  const inheritedTags = reacted.tags.filter((tag) => tag.length >= 2 && (tag[0] === "e" || tag[0] === "p"));
  return finalizeEvent(
    {
      ...t,
      kind: Reaction,
      tags: [...t.tags ?? [], ...inheritedTags, ["e", reacted.id], ["p", reacted.pubkey]],
      content: t.content ?? "+"
    },
    privateKey
  );
}
function getReactedEventPointer(event) {
  if (event.kind !== Reaction) {
    return void 0;
  }
  let lastETag;
  let lastPTag;
  for (let i22 = event.tags.length - 1; i22 >= 0 && (lastETag === void 0 || lastPTag === void 0); i22--) {
    const tag = event.tags[i22];
    if (tag.length >= 2) {
      if (tag[0] === "e" && lastETag === void 0) {
        lastETag = tag;
      } else if (tag[0] === "p" && lastPTag === void 0) {
        lastPTag = tag;
      }
    }
  }
  if (lastETag === void 0 || lastPTag === void 0) {
    return void 0;
  }
  return {
    id: lastETag[1],
    relays: [lastETag[2], lastPTag[2]].filter((x2) => x2 !== void 0),
    author: lastPTag[1]
  };
}
var nip27_exports = {};
__export(nip27_exports, {
  parse: () => parse4
});
var noCharacter = /\W/m;
var noURLCharacter = /[^\w\/] |[^\w\/]$|$|,| /m;
var MAX_HASHTAG_LENGTH = 42;
function* parse4(content) {
  let emojis = [];
  if (typeof content !== "string") {
    for (let i22 = 0; i22 < content.tags.length; i22++) {
      const tag = content.tags[i22];
      if (tag[0] === "emoji" && tag.length >= 3) {
        emojis.push({ type: "emoji", shortcode: tag[1], url: tag[2] });
      }
    }
    content = content.content;
  }
  const max2 = content.length;
  let prevIndex = 0;
  let index = 0;
  mainloop:
    while (index < max2) {
      const u = content.indexOf(":", index);
      const h = content.indexOf("#", index);
      if (u === -1 && h === -1) {
        break mainloop;
      }
      if (u === -1 || h >= 0 && h < u) {
        if (h === 0 || content[h - 1].match(noCharacter)) {
          const m = content.slice(h + 1, h + MAX_HASHTAG_LENGTH).match(noCharacter);
          const end = m ? h + 1 + m.index : max2;
          yield { type: "text", text: content.slice(prevIndex, h), start: prevIndex, end: h };
          yield { type: "hashtag", value: content.slice(h + 1, end), start: h, end };
          index = end;
          prevIndex = index;
          continue mainloop;
        }
        index = h + 1;
        continue mainloop;
      }
      if (content.slice(u - 5, u) === "nostr") {
        const m = content.slice(u + 60).match(noCharacter);
        const end = m ? u + 60 + m.index : max2;
        try {
          let pointer;
          let { data, type } = decode(content.slice(u + 1, end));
          switch (type) {
            case "npub":
              pointer = { pubkey: data };
              break;
            case "note":
              pointer = { id: data };
              break;
            case "nsec":
              index = end + 1;
              continue;
            default:
              pointer = data;
          }
          if (prevIndex !== u - 5) {
            yield { type: "text", text: content.slice(prevIndex, u - 5), start: prevIndex, end: u - 5 };
          }
          yield { type: "reference", pointer, start: u - 5, end };
          index = end;
          prevIndex = index;
          continue mainloop;
        } catch (_err) {
          index = u + 1;
          continue mainloop;
        }
      } else if (content.slice(u - 5, u) === "https" || content.slice(u - 4, u) === "http") {
        const m = content.slice(u + 4).match(noURLCharacter);
        const end = m ? u + 4 + m.index : max2;
        const prefixLen = content[u - 1] === "s" ? 5 : 4;
        try {
          let url = new URL(content.slice(u - prefixLen, end));
          if (url.hostname.indexOf(".") === -1) {
            throw new Error("invalid url");
          }
          if (prevIndex !== u - prefixLen) {
            yield {
              type: "text",
              text: content.slice(prevIndex, u - prefixLen),
              start: prevIndex,
              end: u - prefixLen
            };
          }
          if (/\.(png|jpe?g|gif|webp|heic|svg)$/i.test(url.pathname)) {
            yield { type: "image", url: url.toString(), start: u - prefixLen, end };
            index = end;
            prevIndex = index;
            continue mainloop;
          }
          if (/\.(mp4|avi|webm|mkv|mov)$/i.test(url.pathname)) {
            yield { type: "video", url: url.toString(), start: u - prefixLen, end };
            index = end;
            prevIndex = index;
            continue mainloop;
          }
          if (/\.(mp3|aac|ogg|opus|wav|flac)$/i.test(url.pathname)) {
            yield { type: "audio", url: url.toString(), start: u - prefixLen, end };
            index = end;
            prevIndex = index;
            continue mainloop;
          }
          yield { type: "url", url: url.toString(), start: u - prefixLen, end };
          index = end;
          prevIndex = index;
          continue mainloop;
        } catch (_err) {
          index = end + 1;
          continue mainloop;
        }
      } else if (content.slice(u - 3, u) === "wss" || content.slice(u - 2, u) === "ws") {
        const m = content.slice(u + 4).match(noURLCharacter);
        const end = m ? u + 4 + m.index : max2;
        const prefixLen = content[u - 1] === "s" ? 3 : 2;
        try {
          let url = new URL(content.slice(u - prefixLen, end));
          if (url.hostname.indexOf(".") === -1) {
            throw new Error("invalid ws url");
          }
          if (prevIndex !== u - prefixLen) {
            yield {
              type: "text",
              text: content.slice(prevIndex, u - prefixLen),
              start: prevIndex,
              end: u - prefixLen
            };
          }
          yield { type: "relay", url: url.toString(), start: u - prefixLen, end };
          index = end;
          prevIndex = index;
          continue mainloop;
        } catch (_err) {
          index = end + 1;
          continue mainloop;
        }
      } else {
        for (let e = 0; e < emojis.length; e++) {
          const emoji = emojis[e];
          if (content[u + emoji.shortcode.length + 1] === ":" && content.slice(u + 1, u + emoji.shortcode.length + 1) === emoji.shortcode) {
            if (prevIndex !== u) {
              yield { type: "text", text: content.slice(prevIndex, u), start: prevIndex, end: u };
            }
            yield { ...emoji, start: u, end: u + emoji.shortcode.length + 2 };
            index = u + emoji.shortcode.length + 2;
            prevIndex = index;
            continue mainloop;
          }
        }
        index = u + 1;
        continue mainloop;
      }
    }
  if (prevIndex !== max2) {
    yield { type: "text", text: content.slice(prevIndex), start: prevIndex, end: max2 };
  }
}
var nip28_exports = {};
__export(nip28_exports, {
  channelCreateEvent: () => channelCreateEvent,
  channelHideMessageEvent: () => channelHideMessageEvent,
  channelMessageEvent: () => channelMessageEvent,
  channelMetadataEvent: () => channelMetadataEvent,
  channelMuteUserEvent: () => channelMuteUserEvent
});
var channelCreateEvent = (t, privateKey) => {
  let content;
  if (typeof t.content === "object") {
    content = JSON.stringify(t.content);
  } else if (typeof t.content === "string") {
    content = t.content;
  } else {
    return void 0;
  }
  return finalizeEvent(
    {
      kind: ChannelCreation,
      tags: [...t.tags ?? []],
      content,
      created_at: t.created_at
    },
    privateKey
  );
};
var channelMetadataEvent = (t, privateKey) => {
  let content;
  if (typeof t.content === "object") {
    content = JSON.stringify(t.content);
  } else if (typeof t.content === "string") {
    content = t.content;
  } else {
    return void 0;
  }
  return finalizeEvent(
    {
      kind: ChannelMetadata,
      tags: [["e", t.channel_create_event_id], ...t.tags ?? []],
      content,
      created_at: t.created_at
    },
    privateKey
  );
};
var channelMessageEvent = (t, privateKey) => {
  const tags = [["e", t.channel_create_event_id, t.relay_url, "root"]];
  if (t.reply_to_channel_message_event_id) {
    tags.push(["e", t.reply_to_channel_message_event_id, t.relay_url, "reply"]);
  }
  return finalizeEvent(
    {
      kind: ChannelMessage,
      tags: [...tags, ...t.tags ?? []],
      content: t.content,
      created_at: t.created_at
    },
    privateKey
  );
};
var channelHideMessageEvent = (t, privateKey) => {
  let content;
  if (typeof t.content === "object") {
    content = JSON.stringify(t.content);
  } else if (typeof t.content === "string") {
    content = t.content;
  } else {
    return void 0;
  }
  return finalizeEvent(
    {
      kind: ChannelHideMessage,
      tags: [["e", t.channel_message_event_id], ...t.tags ?? []],
      content,
      created_at: t.created_at
    },
    privateKey
  );
};
var channelMuteUserEvent = (t, privateKey) => {
  let content;
  if (typeof t.content === "object") {
    content = JSON.stringify(t.content);
  } else if (typeof t.content === "string") {
    content = t.content;
  } else {
    return void 0;
  }
  return finalizeEvent(
    {
      kind: ChannelMuteUser,
      tags: [["p", t.pubkey_to_mute], ...t.tags ?? []],
      content,
      created_at: t.created_at
    },
    privateKey
  );
};
var nip30_exports = {};
__export(nip30_exports, {
  EMOJI_SHORTCODE_REGEX: () => EMOJI_SHORTCODE_REGEX,
  matchAll: () => matchAll,
  regex: () => regex,
  replaceAll: () => replaceAll
});
var EMOJI_SHORTCODE_REGEX = /:(\w+):/;
var regex = () => new RegExp(`\\B${EMOJI_SHORTCODE_REGEX.source}\\B`, "g");
function* matchAll(content) {
  const matches = content.matchAll(regex());
  for (const match of matches) {
    try {
      const [shortcode, name] = match;
      yield {
        shortcode,
        name,
        start: match.index,
        end: match.index + shortcode.length
      };
    } catch (_e) {
    }
  }
}
function replaceAll(content, replacer) {
  return content.replaceAll(regex(), (shortcode, name) => {
    return replacer({
      shortcode,
      name
    });
  });
}
var nip39_exports = {};
__export(nip39_exports, {
  useFetchImplementation: () => useFetchImplementation3,
  validateGithub: () => validateGithub
});
var _fetch3;
try {
  _fetch3 = fetch;
} catch {
}
function useFetchImplementation3(fetchImplementation) {
  _fetch3 = fetchImplementation;
}
async function validateGithub(pubkey, username, proof) {
  try {
    let res = await (await _fetch3(`https://gist.github.com/${username}/${proof}/raw`)).text();
    return res === `Verifying that I control the following Nostr public key: ${pubkey}`;
  } catch (_) {
    return false;
  }
}
var nip47_exports = {};
__export(nip47_exports, {
  makeNwcRequestEvent: () => makeNwcRequestEvent,
  parseConnectionString: () => parseConnectionString
});
function parseConnectionString(connectionString) {
  const { host, pathname, searchParams } = new URL(connectionString);
  const pubkey = pathname || host;
  const relays = searchParams.getAll("relay");
  const secret = searchParams.get("secret");
  if (!pubkey || relays.length === 0 || !secret) {
    throw new Error("invalid connection string");
  }
  return { pubkey, relay: relays[0], relays, secret };
}
async function makeNwcRequestEvent(pubkey, secretKey, invoice) {
  const content = {
    method: "pay_invoice",
    params: {
      invoice
    }
  };
  const encryptedContent = encrypt2(secretKey, pubkey, JSON.stringify(content));
  const eventTemplate = {
    kind: NWCWalletRequest,
    created_at: Math.round(Date.now() / 1e3),
    content: encryptedContent,
    tags: [["p", pubkey]]
  };
  return finalizeEvent(eventTemplate, secretKey);
}
var nip54_exports = {};
__export(nip54_exports, {
  normalizeIdentifier: () => normalizeIdentifier
});
function normalizeIdentifier(name) {
  name = name.trim().toLowerCase();
  name = name.normalize("NFKC");
  return Array.from(name).map((char) => {
    if (new RegExp("\\p{Letter}", "u").test(char) || new RegExp("\\p{Number}", "u").test(char)) {
      return char;
    }
    return "-";
  }).join("");
}
var nip57_exports = {};
__export(nip57_exports, {
  getSatoshisAmountFromBolt11: () => getSatoshisAmountFromBolt11,
  getZapEndpoint: () => getZapEndpoint,
  makeZapReceipt: () => makeZapReceipt,
  makeZapRequest: () => makeZapRequest,
  useFetchImplementation: () => useFetchImplementation4,
  validateZapRequest: () => validateZapRequest
});
var _fetch4;
try {
  _fetch4 = fetch;
} catch {
}
function useFetchImplementation4(fetchImplementation) {
  _fetch4 = fetchImplementation;
}
async function getZapEndpoint(metadata) {
  try {
    let lnurl = "";
    let { lud06, lud16 } = JSON.parse(metadata.content);
    if (lud16) {
      let [name, domain] = lud16.split("@");
      lnurl = new URL(`/.well-known/lnurlp/${name}`, `https://${domain}`).toString();
    } else if (lud06) {
      let { words } = bech32.decode(lud06, 1e3);
      let data = bech32.fromWords(words);
      lnurl = utf8Decoder.decode(data);
    } else {
      return null;
    }
    let res = await _fetch4(lnurl);
    let body = await res.json();
    if (body.allowsNostr && body.nostrPubkey) {
      return body.callback;
    }
  } catch (err2) {
  }
  return null;
}
function makeZapRequest(params) {
  let zr = {
    kind: 9734,
    created_at: Math.round(Date.now() / 1e3),
    content: params.comment || "",
    tags: [
      ["p", "pubkey" in params ? params.pubkey : params.event.pubkey],
      ["amount", params.amount.toString()],
      ["relays", ...params.relays]
    ]
  };
  if ("event" in params) {
    zr.tags.push(["e", params.event.id]);
    if (isReplaceableKind(params.event.kind)) {
      const a = ["a", `${params.event.kind}:${params.event.pubkey}:`];
      zr.tags.push(a);
    } else if (isAddressableKind(params.event.kind)) {
      let d = params.event.tags.find(([t, v]) => t === "d" && v);
      if (!d)
        throw new Error("d tag not found or is empty");
      const a = ["a", `${params.event.kind}:${params.event.pubkey}:${d[1]}`];
      zr.tags.push(a);
    }
    zr.tags.push(["k", params.event.kind.toString()]);
  }
  return zr;
}
function validateZapRequest(zapRequestString) {
  let zapRequest;
  try {
    zapRequest = JSON.parse(zapRequestString);
  } catch (err2) {
    return "Invalid zap request JSON.";
  }
  if (!validateEvent(zapRequest))
    return "Zap request is not a valid Nostr event.";
  if (!verifyEvent(zapRequest))
    return "Invalid signature on zap request.";
  let p = zapRequest.tags.find(([t, v]) => t === "p" && v);
  if (!p)
    return "Zap request doesn't have a 'p' tag.";
  if (!isHex32(p[1]))
    return "Zap request 'p' tag is not valid hex.";
  let e = zapRequest.tags.find(([t, v]) => t === "e" && v);
  if (e && !isHex32(e[1]))
    return "Zap request 'e' tag is not valid hex.";
  let relays = zapRequest.tags.find(([t, v]) => t === "relays" && v);
  if (!relays)
    return "Zap request doesn't have a 'relays' tag.";
  return null;
}
function makeZapReceipt({
  zapRequest,
  preimage,
  bolt11,
  paidAt
}) {
  let zr = JSON.parse(zapRequest);
  let tagsFromZapRequest = zr.tags.filter(([t]) => t === "e" || t === "p" || t === "a");
  let zap = {
    kind: 9735,
    created_at: Math.round(paidAt.getTime() / 1e3),
    content: "",
    tags: [...tagsFromZapRequest, ["P", zr.pubkey], ["bolt11", bolt11], ["description", zapRequest]]
  };
  if (preimage) {
    zap.tags.push(["preimage", preimage]);
  }
  return zap;
}
function getSatoshisAmountFromBolt11(bolt11) {
  if (bolt11.length < 50) {
    return 0;
  }
  bolt11 = bolt11.substring(0, 50);
  const idx = bolt11.lastIndexOf("1");
  if (idx === -1) {
    return 0;
  }
  const hrp = bolt11.substring(0, idx);
  if (!hrp.startsWith("lnbc")) {
    return 0;
  }
  const amount = hrp.substring(4);
  if (amount.length < 1) {
    return 0;
  }
  const char = amount[amount.length - 1];
  const digit = char.charCodeAt(0) - "0".charCodeAt(0);
  const isDigit = digit >= 0 && digit <= 9;
  let cutPoint = amount.length - 1;
  if (isDigit) {
    cutPoint++;
  }
  if (cutPoint < 1) {
    return 0;
  }
  const num2 = parseInt(amount.substring(0, cutPoint));
  switch (char) {
    case "m":
      return num2 * 1e5;
    case "u":
      return num2 * 100;
    case "n":
      return num2 / 10;
    case "p":
      return num2 / 1e4;
    default:
      return num2 * 1e8;
  }
}
var nip77_exports = {};
__export(nip77_exports, {
  Negentropy: () => Negentropy,
  NegentropyStorageVector: () => NegentropyStorageVector,
  NegentropySync: () => NegentropySync
});
var PROTOCOL_VERSION = 97;
var ID_SIZE = 32;
var FINGERPRINT_SIZE = 16;
var Mode = {
  Skip: 0,
  Fingerprint: 1,
  IdList: 2
};
var WrappedBuffer = class {
  _raw;
  length;
  constructor(buffer) {
    if (typeof buffer === "number") {
      this._raw = new Uint8Array(buffer);
      this.length = 0;
    } else if (buffer instanceof Uint8Array) {
      this._raw = new Uint8Array(buffer);
      this.length = buffer.length;
    } else {
      this._raw = new Uint8Array(512);
      this.length = 0;
    }
  }
  unwrap() {
    return this._raw.subarray(0, this.length);
  }
  get capacity() {
    return this._raw.byteLength;
  }
  extend(buf) {
    if (buf instanceof WrappedBuffer)
      buf = buf.unwrap();
    if (typeof buf.length !== "number")
      throw Error("bad length");
    const targetSize = buf.length + this.length;
    if (this.capacity < targetSize) {
      const oldRaw = this._raw;
      const newCapacity = Math.max(this.capacity * 2, targetSize);
      this._raw = new Uint8Array(newCapacity);
      this._raw.set(oldRaw);
    }
    this._raw.set(buf, this.length);
    this.length += buf.length;
  }
  shift() {
    const first = this._raw[0];
    this._raw = this._raw.subarray(1);
    this.length--;
    return first;
  }
  shiftN(n = 1) {
    const firstSubarray = this._raw.subarray(0, n);
    this._raw = this._raw.subarray(n);
    this.length -= n;
    return firstSubarray;
  }
};
function decodeVarInt(buf) {
  let res = 0;
  while (1) {
    if (buf.length === 0)
      throw Error("parse ends prematurely");
    let byte = buf.shift();
    res = res << 7 | byte & 127;
    if ((byte & 128) === 0)
      break;
  }
  return res;
}
function encodeVarInt(n) {
  if (n === 0)
    return new WrappedBuffer(new Uint8Array([0]));
  let o = [];
  while (n !== 0) {
    o.push(n & 127);
    n >>>= 7;
  }
  o.reverse();
  for (let i22 = 0; i22 < o.length - 1; i22++)
    o[i22] |= 128;
  return new WrappedBuffer(new Uint8Array(o));
}
function getByte(buf) {
  return getBytes(buf, 1)[0];
}
function getBytes(buf, n) {
  if (buf.length < n)
    throw Error("parse ends prematurely");
  return buf.shiftN(n);
}
var Accumulator = class {
  buf;
  constructor() {
    this.setToZero();
  }
  setToZero() {
    this.buf = new Uint8Array(ID_SIZE);
  }
  add(otherBuf) {
    let currCarry = 0, nextCarry = 0;
    let p = new DataView(this.buf.buffer);
    let po = new DataView(otherBuf.buffer);
    for (let i22 = 0; i22 < 8; i22++) {
      let offset = i22 * 4;
      let orig = p.getUint32(offset, true);
      let otherV = po.getUint32(offset, true);
      let next = orig;
      next += currCarry;
      next += otherV;
      if (next > 4294967295)
        nextCarry = 1;
      p.setUint32(offset, next & 4294967295, true);
      currCarry = nextCarry;
      nextCarry = 0;
    }
  }
  negate() {
    let p = new DataView(this.buf.buffer);
    for (let i22 = 0; i22 < 8; i22++) {
      let offset = i22 * 4;
      p.setUint32(offset, ~p.getUint32(offset, true));
    }
    let one = new Uint8Array(ID_SIZE);
    one[0] = 1;
    this.add(one);
  }
  getFingerprint(n) {
    let input2 = new WrappedBuffer();
    input2.extend(this.buf);
    input2.extend(encodeVarInt(n));
    let hash = sha256(input2.unwrap());
    return hash.subarray(0, FINGERPRINT_SIZE);
  }
};
var NegentropyStorageVector = class {
  items;
  sealed;
  constructor() {
    this.items = [];
    this.sealed = false;
  }
  insert(timestamp, id) {
    if (this.sealed)
      throw Error("already sealed");
    const idb = hexToBytes(id);
    if (idb.byteLength !== ID_SIZE)
      throw Error("bad id size for added item");
    this.items.push({ timestamp, id: idb });
  }
  seal() {
    if (this.sealed)
      throw Error("already sealed");
    this.sealed = true;
    this.items.sort(itemCompare);
    for (let i22 = 1; i22 < this.items.length; i22++) {
      if (itemCompare(this.items[i22 - 1], this.items[i22]) === 0)
        throw Error("duplicate item inserted");
    }
  }
  unseal() {
    this.sealed = false;
  }
  size() {
    this._checkSealed();
    return this.items.length;
  }
  getItem(i22) {
    this._checkSealed();
    if (i22 >= this.items.length)
      throw Error("out of range");
    return this.items[i22];
  }
  iterate(begin, end, cb) {
    this._checkSealed();
    this._checkBounds(begin, end);
    for (let i22 = begin; i22 < end; ++i22) {
      if (!cb(this.items[i22], i22))
        break;
    }
  }
  findLowerBound(begin, end, bound) {
    this._checkSealed();
    this._checkBounds(begin, end);
    return this._binarySearch(this.items, begin, end, (a) => itemCompare(a, bound) < 0);
  }
  fingerprint(begin, end) {
    let out = new Accumulator();
    out.setToZero();
    this.iterate(begin, end, (item) => {
      out.add(item.id);
      return true;
    });
    return out.getFingerprint(end - begin);
  }
  _checkSealed() {
    if (!this.sealed)
      throw Error("not sealed");
  }
  _checkBounds(begin, end) {
    if (begin > end || end > this.items.length)
      throw Error("bad range");
  }
  _binarySearch(arr, first, last, cmp) {
    let count = last - first;
    while (count > 0) {
      let it = first;
      let step = Math.floor(count / 2);
      it += step;
      if (cmp(arr[it])) {
        first = ++it;
        count -= step + 1;
      } else {
        count = step;
      }
    }
    return first;
  }
};
var Negentropy = class {
  storage;
  frameSizeLimit;
  lastTimestampIn;
  lastTimestampOut;
  constructor(storage, frameSizeLimit = 6e4) {
    if (frameSizeLimit < 4096)
      throw Error("frameSizeLimit too small");
    this.storage = storage;
    this.frameSizeLimit = frameSizeLimit;
    this.lastTimestampIn = 0;
    this.lastTimestampOut = 0;
  }
  _bound(timestamp, id) {
    return { timestamp, id: id || new Uint8Array(0) };
  }
  initiate() {
    let output = new WrappedBuffer();
    output.extend(new Uint8Array([PROTOCOL_VERSION]));
    this.splitRange(0, this.storage.size(), this._bound(Number.MAX_VALUE), output);
    return bytesToHex(output.unwrap());
  }
  reconcile(queryMsg, onhave, onneed) {
    const query = new WrappedBuffer(hexToBytes(queryMsg));
    this.lastTimestampIn = this.lastTimestampOut = 0;
    let fullOutput = new WrappedBuffer();
    fullOutput.extend(new Uint8Array([PROTOCOL_VERSION]));
    let protocolVersion = getByte(query);
    if (protocolVersion < 96 || protocolVersion > 111)
      throw Error("invalid negentropy protocol version byte");
    if (protocolVersion !== PROTOCOL_VERSION) {
      throw Error("unsupported negentropy protocol version requested: " + (protocolVersion - 96));
    }
    let storageSize = this.storage.size();
    let prevBound = this._bound(0);
    let prevIndex = 0;
    let skip = false;
    while (query.length !== 0) {
      let o = new WrappedBuffer();
      let doSkip = () => {
        if (skip) {
          skip = false;
          o.extend(this.encodeBound(prevBound));
          o.extend(encodeVarInt(Mode.Skip));
        }
      };
      let currBound = this.decodeBound(query);
      let mode = decodeVarInt(query);
      let lower = prevIndex;
      let upper = this.storage.findLowerBound(prevIndex, storageSize, currBound);
      if (mode === Mode.Skip) {
        skip = true;
      } else if (mode === Mode.Fingerprint) {
        let theirFingerprint = getBytes(query, FINGERPRINT_SIZE);
        let ourFingerprint = this.storage.fingerprint(lower, upper);
        if (compareUint8Array(theirFingerprint, ourFingerprint) !== 0) {
          doSkip();
          this.splitRange(lower, upper, currBound, o);
        } else {
          skip = true;
        }
      } else if (mode === Mode.IdList) {
        let numIds = decodeVarInt(query);
        let theirElems = {};
        for (let i22 = 0; i22 < numIds; i22++) {
          let e = getBytes(query, ID_SIZE);
          theirElems[bytesToHex(e)] = e;
        }
        skip = true;
        this.storage.iterate(lower, upper, (item) => {
          let k = item.id;
          const id = bytesToHex(k);
          if (!theirElems[id]) {
            onhave?.(id);
          } else {
            delete theirElems[bytesToHex(k)];
          }
          return true;
        });
        if (onneed) {
          for (let v of Object.values(theirElems)) {
            onneed(bytesToHex(v));
          }
        }
      } else {
        throw Error("unexpected mode");
      }
      if (this.exceededFrameSizeLimit(fullOutput.length + o.length)) {
        let remainingFingerprint = this.storage.fingerprint(upper, storageSize);
        fullOutput.extend(this.encodeBound(this._bound(Number.MAX_VALUE)));
        fullOutput.extend(encodeVarInt(Mode.Fingerprint));
        fullOutput.extend(remainingFingerprint);
        break;
      } else {
        fullOutput.extend(o);
      }
      prevIndex = upper;
      prevBound = currBound;
    }
    return fullOutput.length === 1 ? null : bytesToHex(fullOutput.unwrap());
  }
  splitRange(lower, upper, upperBound, o) {
    let numElems = upper - lower;
    let buckets = 16;
    if (numElems < buckets * 2) {
      o.extend(this.encodeBound(upperBound));
      o.extend(encodeVarInt(Mode.IdList));
      o.extend(encodeVarInt(numElems));
      this.storage.iterate(lower, upper, (item) => {
        o.extend(item.id);
        return true;
      });
    } else {
      let itemsPerBucket = Math.floor(numElems / buckets);
      let bucketsWithExtra = numElems % buckets;
      let curr = lower;
      for (let i22 = 0; i22 < buckets; i22++) {
        let bucketSize = itemsPerBucket + (i22 < bucketsWithExtra ? 1 : 0);
        let ourFingerprint = this.storage.fingerprint(curr, curr + bucketSize);
        curr += bucketSize;
        let nextBound;
        if (curr === upper) {
          nextBound = upperBound;
        } else {
          let prevItem;
          let currItem;
          this.storage.iterate(curr - 1, curr + 1, (item, index) => {
            if (index === curr - 1)
              prevItem = item;
            else
              currItem = item;
            return true;
          });
          nextBound = this.getMinimalBound(prevItem, currItem);
        }
        o.extend(this.encodeBound(nextBound));
        o.extend(encodeVarInt(Mode.Fingerprint));
        o.extend(ourFingerprint);
      }
    }
  }
  exceededFrameSizeLimit(n) {
    return n > this.frameSizeLimit - 200;
  }
  decodeTimestampIn(encoded) {
    let timestamp = decodeVarInt(encoded);
    timestamp = timestamp === 0 ? Number.MAX_VALUE : timestamp - 1;
    if (this.lastTimestampIn === Number.MAX_VALUE || timestamp === Number.MAX_VALUE) {
      this.lastTimestampIn = Number.MAX_VALUE;
      return Number.MAX_VALUE;
    }
    timestamp += this.lastTimestampIn;
    this.lastTimestampIn = timestamp;
    return timestamp;
  }
  decodeBound(encoded) {
    let timestamp = this.decodeTimestampIn(encoded);
    let len = decodeVarInt(encoded);
    if (len > ID_SIZE)
      throw Error("bound key too long");
    let id = getBytes(encoded, len);
    return { timestamp, id };
  }
  encodeTimestampOut(timestamp) {
    if (timestamp === Number.MAX_VALUE) {
      this.lastTimestampOut = Number.MAX_VALUE;
      return encodeVarInt(0);
    }
    let temp = timestamp;
    timestamp -= this.lastTimestampOut;
    this.lastTimestampOut = temp;
    return encodeVarInt(timestamp + 1);
  }
  encodeBound(key) {
    let output = new WrappedBuffer();
    output.extend(this.encodeTimestampOut(key.timestamp));
    output.extend(encodeVarInt(key.id.length));
    output.extend(key.id);
    return output;
  }
  getMinimalBound(prev, curr) {
    if (curr.timestamp !== prev.timestamp) {
      return this._bound(curr.timestamp);
    } else {
      let sharedPrefixBytes = 0;
      let currKey = curr.id;
      let prevKey = prev.id;
      for (let i22 = 0; i22 < ID_SIZE; i22++) {
        if (currKey[i22] !== prevKey[i22])
          break;
        sharedPrefixBytes++;
      }
      return this._bound(curr.timestamp, curr.id.subarray(0, sharedPrefixBytes + 1));
    }
  }
};
function compareUint8Array(a, b) {
  for (let i22 = 0; i22 < a.byteLength; i22++) {
    if (a[i22] < b[i22])
      return -1;
    if (a[i22] > b[i22])
      return 1;
  }
  if (a.byteLength > b.byteLength)
    return 1;
  if (a.byteLength < b.byteLength)
    return -1;
  return 0;
}
function itemCompare(a, b) {
  if (a.timestamp === b.timestamp) {
    return compareUint8Array(a.id, b.id);
  }
  return a.timestamp - b.timestamp;
}
var NegentropySync = class {
  relay;
  storage;
  neg;
  filter;
  subscription;
  onhave;
  onneed;
  constructor(relay, storage, filter, params = {}) {
    this.relay = relay;
    this.storage = storage;
    this.neg = new Negentropy(storage);
    this.onhave = params.onhave;
    this.onneed = params.onneed;
    this.filter = filter;
    this.subscription = this.relay.prepareSubscription([{}], { label: params.label || "negentropy" });
    this.subscription.oncustom = (data) => {
      switch (data[0]) {
        case "NEG-MSG": {
          if (data.length < 3) {
            console.warn(`got invalid NEG-MSG from ${this.relay.url}: ${data}`);
          }
          try {
            const response = this.neg.reconcile(data[2], this.onhave, this.onneed);
            if (response) {
              this.relay.send(`["NEG-MSG", "${this.subscription.id}", "${response}"]`);
            } else {
              this.close();
              params.onclose?.();
            }
          } catch (error) {
            console.error("negentropy reconcile error:", error);
            params?.onclose?.(`reconcile error: ${error}`);
          }
          break;
        }
        case "NEG-CLOSE": {
          const reason = data[2];
          console.warn("negentropy error:", reason);
          params.onclose?.(reason);
          break;
        }
        case "NEG-ERR": {
          params.onclose?.();
        }
      }
    };
  }
  async start() {
    const initMsg = this.neg.initiate();
    this.relay.send(`["NEG-OPEN","${this.subscription.id}",${JSON.stringify(this.filter)},"${initMsg}"]`);
  }
  close() {
    this.relay.send(`["NEG-CLOSE","${this.subscription.id}"]`);
    this.subscription.close();
  }
};
var nip98_exports = {};
__export(nip98_exports, {
  getToken: () => getToken,
  hashPayload: () => hashPayload,
  unpackEventFromToken: () => unpackEventFromToken,
  validateEvent: () => validateEvent2,
  validateEventKind: () => validateEventKind,
  validateEventMethodTag: () => validateEventMethodTag,
  validateEventPayloadTag: () => validateEventPayloadTag,
  validateEventTimestamp: () => validateEventTimestamp,
  validateEventUrlTag: () => validateEventUrlTag,
  validateToken: () => validateToken
});
var _authorizationScheme = "Nostr ";
async function getToken(loginUrl, httpMethod, sign, includeAuthorizationScheme = false, payload) {
  const event = {
    kind: HTTPAuth,
    tags: [
      ["u", loginUrl],
      ["method", httpMethod]
    ],
    created_at: Math.round((/* @__PURE__ */ new Date()).getTime() / 1e3),
    content: ""
  };
  if (payload) {
    event.tags.push(["payload", hashPayload(payload)]);
  }
  const signedEvent = await sign(event);
  const authorizationScheme = includeAuthorizationScheme ? _authorizationScheme : "";
  return authorizationScheme + base64.encode(utf8Encoder.encode(JSON.stringify(signedEvent)));
}
async function validateToken(token, url, method) {
  const event = await unpackEventFromToken(token).catch((error) => {
    throw error;
  });
  const valid = await validateEvent2(event, url, method).catch((error) => {
    throw error;
  });
  return valid;
}
async function unpackEventFromToken(token) {
  if (!token) {
    throw new Error("Missing token");
  }
  token = token.replace(_authorizationScheme, "");
  const eventB64 = utf8Decoder.decode(base64.decode(token));
  if (!eventB64 || eventB64.length === 0 || !eventB64.startsWith("{")) {
    throw new Error("Invalid token");
  }
  const event = JSON.parse(eventB64);
  return event;
}
function validateEventTimestamp(event) {
  if (!event.created_at) {
    return false;
  }
  return Math.abs(Math.round((/* @__PURE__ */ new Date()).getTime() / 1e3) - event.created_at) < 60;
}
function validateEventKind(event) {
  return event.kind === HTTPAuth;
}
function validateEventUrlTag(event, url) {
  const urlTag = event.tags.find((t) => t[0] === "u");
  if (!urlTag) {
    return false;
  }
  return urlTag.length > 0 && urlTag[1] === url;
}
function validateEventMethodTag(event, method) {
  const methodTag = event.tags.find((t) => t[0] === "method");
  if (!methodTag) {
    return false;
  }
  return methodTag.length > 0 && methodTag[1].toLowerCase() === method.toLowerCase();
}
function hashPayload(payload) {
  const hash = sha256(utf8Encoder.encode(JSON.stringify(payload)));
  return bytesToHex(hash);
}
function validateEventPayloadTag(event, payload) {
  const payloadTag = event.tags.find((t) => t[0] === "payload");
  if (!payloadTag) {
    return false;
  }
  const payloadHash = hashPayload(payload);
  return payloadTag.length > 0 && payloadTag[1] === payloadHash;
}
async function validateEvent2(event, url, method, body) {
  if (!verifyEvent(event)) {
    throw new Error("Invalid nostr event, signature invalid");
  }
  if (!validateEventKind(event)) {
    throw new Error("Invalid nostr event, kind invalid");
  }
  if (!validateEventTimestamp(event)) {
    throw new Error("Invalid nostr event, created_at timestamp invalid");
  }
  if (!validateEventUrlTag(event, url)) {
    throw new Error("Invalid nostr event, url tag invalid");
  }
  if (!validateEventMethodTag(event, method)) {
    throw new Error("Invalid nostr event, method tag invalid");
  }
  if (Boolean(body) && typeof body === "object" && Object.keys(body).length > 0) {
    if (!validateEventPayloadTag(event, body)) {
      throw new Error("Invalid nostr event, payload tag does not match request body hash");
    }
  }
  return true;
}

// src/nostr/signer.ts
var UnsupportedIdentityError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "UnsupportedIdentityError";
  }
};
var HEX_SECRET = /^[0-9a-f]{64}$/i;
function decodeSecretKey(value) {
  const trimmed = value.trim();
  if (HEX_SECRET.test(trimmed)) {
    return Uint8Array.from(Buffer.from(trimmed, "hex"));
  }
  if (/^nsec1/i.test(trimmed)) {
    const decoded = nip19_exports.decode(trimmed);
    if (decoded.type !== "nsec" || !(decoded.data instanceof Uint8Array)) {
      throw new UnsupportedIdentityError(`expected an nsec key, decoded as ${decoded.type}`);
    }
    return decoded.data;
  }
  throw new UnsupportedIdentityError(
    "SIGN_WITH must be an nsec1... key, 64 hex characters, or a bunker:// or nostrconnect:// URL"
  );
}
function isBunkerUrl(value) {
  const trimmed = value.trim();
  return trimmed.startsWith("bunker://") || trimmed.startsWith("nostrconnect://");
}
function parseBunkerUrl(uri) {
  const trimmed = uri.trim();
  if (trimmed.startsWith("nostrconnect://")) {
    throw new UnsupportedIdentityError(
      "nostrconnect:// tokens require this process to listen for the signer's response; use a bunker:// URL in CI"
    );
  }
  if (!trimmed.startsWith("bunker://")) {
    throw new UnsupportedIdentityError("expected a bunker:// URL");
  }
  const rest = trimmed.slice("bunker://".length);
  const queryAt = rest.indexOf("?");
  const pubkeyPart = queryAt === -1 ? rest : rest.slice(0, queryAt);
  const params = new URLSearchParams(queryAt === -1 ? "" : rest.slice(queryAt + 1));
  let remoteSignerPubkey;
  if (/^[0-9a-f]{64}$/i.test(pubkeyPart)) {
    remoteSignerPubkey = pubkeyPart.toLowerCase();
  } else if (/^npub1/i.test(pubkeyPart)) {
    const decoded = nip19_exports.decode(pubkeyPart);
    if (decoded.type !== "npub" || typeof decoded.data !== "string") {
      throw new UnsupportedIdentityError(`expected an npub in the bunker URL, decoded as ${decoded.type}`);
    }
    remoteSignerPubkey = decoded.data;
  } else {
    throw new UnsupportedIdentityError("bunker URL has neither a hex nor npub signer key");
  }
  const relays = params.getAll("relay").filter(Boolean);
  if (relays.length === 0) {
    throw new UnsupportedIdentityError("bunker URL has no relay parameter");
  }
  const secret = params.get("secret") ?? void 0;
  return secret ? { remoteSignerPubkey, relays, secret } : { remoteSignerPubkey, relays };
}
function createLocalSigner(secret) {
  const publicKey = getPublicKey(secret);
  return {
    publicKey,
    kind: "local",
    async signEvent(template) {
      return finalizeEvent(template, secret);
    },
    async close() {
    }
  };
}

// src/config.ts
var ConfigError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "ConfigError";
  }
};
var KNOWN_FIELDS = /* @__PURE__ */ new Set([
  "repository",
  "match",
  "release_source",
  "name",
  "summary",
  "description",
  "tags",
  "license",
  "website",
  "icon",
  "images",
  "release_notes",
  "pubkey",
  "communities"
]);
var PLACEHOLDER = /^REPLACE_WITH_|^<.*>$/;
function npubFor(signWith) {
  const trimmed = signWith.trim();
  if (!trimmed || isBunkerUrl(trimmed)) return void 0;
  if (/^[0-9a-f]{64}$/i.test(trimmed)) {
    return nip19_exports.npubEncode(getPublicKey(Uint8Array.from(Buffer.from(trimmed.toLowerCase(), "hex"))));
  }
  if (/^nsec1/i.test(trimmed)) {
    const decoded = nip19_exports.decode(trimmed);
    if (decoded.type !== "nsec" || !(decoded.data instanceof Uint8Array)) return void 0;
    return nip19_exports.npubEncode(getPublicKey(decoded.data));
  }
  return void 0;
}
function injectPubkey(yamlText, pubkey) {
  const line = /^pubkey:.*$/m;
  if (line.test(yamlText)) return yamlText.replace(line, `pubkey: ${pubkey}`);
  return `${yamlText.replace(/\s*$/, "")}

# Injected at publish time from the signing key.
pubkey: ${pubkey}
`;
}
function asStringArray(value, field) {
  if (value === void 0 || value === null) return void 0;
  if (!Array.isArray(value)) throw new ConfigError(`${field} must be a list`);
  return value.map((entry) => {
    if (typeof entry !== "string") throw new ConfigError(`${field} entries must be strings`);
    return entry;
  });
}
function parseConfig(source, origin = "zapstore.yaml") {
  let document;
  try {
    document = (0, import_yaml.parse)(source);
  } catch (cause) {
    throw new ConfigError(`${origin} is not valid YAML: ${cause instanceof Error ? cause.message : String(cause)}`);
  }
  if (document === null || typeof document !== "object" || Array.isArray(document)) {
    throw new ConfigError(`${origin} must be a mapping of fields`);
  }
  const raw = document;
  const unknownKeys = Object.keys(raw).filter((key) => !KNOWN_FIELDS.has(key));
  if (unknownKeys.length > 0) {
    raw.__unknown = unknownKeys;
  }
  if (typeof raw.repository !== "string" || raw.repository.trim() === "") {
    throw new ConfigError(`${origin} must set a repository URL`);
  }
  const optionalString = (field) => {
    const value = raw[field];
    if (value === void 0 || value === null) return void 0;
    if (typeof value !== "string") throw new ConfigError(`${field} must be a string`);
    return value;
  };
  const config = { repository: raw.repository.trim() };
  const match = optionalString("match");
  if (match !== void 0) config.match = match;
  const releaseSource = optionalString("release_source");
  if (releaseSource !== void 0) config.releaseSource = releaseSource;
  for (const field of ["name", "summary", "description", "license", "website", "icon"]) {
    const value = optionalString(field);
    if (value !== void 0) config[field] = value;
  }
  const releaseNotes = optionalString("release_notes");
  if (releaseNotes !== void 0) config.releaseNotes = releaseNotes;
  const tags = asStringArray(raw.tags, "tags");
  if (tags) config.tags = tags;
  const images = asStringArray(raw.images, "images");
  if (images) config.images = images;
  const communities = asStringArray(raw.communities, "communities");
  if (communities) config.communities = communities;
  const pubkey = optionalString("pubkey");
  if (pubkey !== void 0) {
    if (PLACEHOLDER.test(pubkey.trim())) {
      throw new ConfigError(
        `${origin} still has an unfilled pubkey placeholder. Generate one with \`nak key generate\`, put the npub in pubkey, and commit the file: the relay reads it to whitelist the publisher.`
      );
    }
    if (!/^(npub1[023456789acdefghjklmnpqrstuvwxyz]+|[0-9a-f]{64})$/i.test(pubkey.trim())) {
      throw new ConfigError(`${origin} pubkey must be an npub or a 64 character hex key`);
    }
    config.pubkey = pubkey.trim();
  }
  return config;
}
async function syncConfigPubkey(path, pubkey) {
  if (!pubkey) return false;
  const original = await readFile(path, "utf8");
  let current;
  try {
    current = parseConfig(original, path).pubkey;
  } catch (error) {
    if (!(error instanceof ConfigError) || !/pubkey/.test(error.message)) throw error;
    current = void 0;
  }
  if (current === pubkey) return false;
  await writeFile(path, injectPubkey(original, pubkey));
  return true;
}
async function loadConfig(path) {
  if (!existsSync(path)) {
    throw new ConfigError(
      `${path} not found. It must be committed to the repository: the relay fetches it to verify the publisher.`
    );
  }
  return parseConfig(await readFile(path, "utf8"), path);
}
function extractReleaseNotes(text, version) {
  const escaped = version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const heading = new RegExp(`^##\\s*\\[?${escaped}\\]?[^\\n]*$`, "m");
  const match = heading.exec(text);
  if (!match) return text.trim();
  const rest = text.slice(match.index + match[0].length);
  const next = /^##\s/m.exec(rest);
  const section = next ? rest.slice(0, next.index) : rest;
  return section.trim() || text.trim();
}

// src/nostr/bunker.ts
var RPC_KIND = 24133;
var DEFAULT_PERMS = ["sign_event", "get_public_key"];
var relayTransport = async (pointer, identity) => {
  const pool = new SimplePool();
  let handler;
  const inbox = pool.subscribe(
    pointer.relays,
    { kinds: [RPC_KIND], "#p": [identity.pubkey] },
    {
      onevent: (event) => {
        handler?.({ content: event.content, pubkey: event.pubkey });
      }
    }
  );
  return {
    async publish(request) {
      await Promise.all(pool.publish(pointer.relays, finalizeEvent(request, identity.secret)));
    },
    onResponse(next) {
      handler = next;
    },
    async close() {
      inbox.close();
      pool.close(pointer.relays);
    }
  };
};
async function createBunkerSigner(pointer, options = {}) {
  const timeoutMs = options.timeoutMs ?? 6e4;
  const perms = options.perms ?? DEFAULT_PERMS;
  const secret = options.clientSecret ?? generateSecretKey();
  const pubkey = getPublicKey(secret);
  const conversationKey = nip44_exports.getConversationKey(secret, pointer.remoteSignerPubkey);
  const transport = await (options.transport ?? relayTransport)(pointer, { secret, pubkey });
  const pending = /* @__PURE__ */ new Map();
  transport.onResponse(({ content }) => {
    let response;
    try {
      response = JSON.parse(nip44_exports.v2.decrypt(content, conversationKey));
    } catch {
      return;
    }
    if (typeof response.id !== "string") return;
    const waiter = pending.get(response.id);
    if (!waiter) return;
    pending.delete(response.id);
    clearTimeout(waiter.timer);
    if (typeof response.error === "string") waiter.reject(new Error(response.error));
    else if (typeof response.result === "string") waiter.resolve(response.result);
    else waiter.reject(new Error(`remote signer returned no result for ${response.id}`));
  });
  let nextId = 0;
  const request = async (method, params) => {
    const id = String(++nextId);
    const envelope = JSON.stringify({ id, method, params });
    const answer = new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (pending.delete(id)) {
          reject(new Error(`remote signer did not answer ${method} within ${timeoutMs}ms`));
        }
      }, timeoutMs);
      pending.set(id, { resolve, reject, timer });
    });
    await transport.publish({
      kind: RPC_KIND,
      content: nip44_exports.v2.encrypt(envelope, conversationKey),
      tags: [["p", pointer.remoteSignerPubkey]],
      created_at: Math.floor(Date.now() / 1e3)
    });
    return answer;
  };
  const connectParams = [pointer.remoteSignerPubkey];
  if (pointer.secret) connectParams.push(pointer.secret);
  connectParams.push(perms.join(","));
  if (options.clientName) {
    connectParams.push(JSON.stringify({ name: options.clientName, url: options.clientUrl }));
  }
  try {
    await request("connect", connectParams);
  } catch (cause) {
    await transport.close();
    throw new Error(
      `could not connect to the remote signer: ${cause instanceof Error ? cause.message : String(cause)}`
    );
  }
  const publicKey = await request("get_public_key", []);
  if (!/^[0-9a-f]{64}$/i.test(publicKey)) {
    await transport.close();
    throw new Error(`remote signer returned an implausible public key: ${publicKey.slice(0, 16)}`);
  }
  return {
    publicKey,
    kind: "bunker",
    async signEvent(template) {
      const serialized = await request("sign_event", [JSON.stringify(template)]);
      const signed = JSON.parse(serialized);
      if (!signed.sig || !signed.id) {
        throw new Error("remote signer returned an event without a signature");
      }
      return signed;
    },
    async close() {
      await transport.close();
      for (const waiter of pending.values()) {
        clearTimeout(waiter.timer);
        waiter.reject(new Error("signer closed before the request completed"));
      }
      pending.clear();
    }
  };
}

// src/publish.ts
import { readFile as readFile3 } from "node:fs/promises";
import { existsSync as existsSync2 } from "node:fs";

// node_modules/fflate/esm/index.mjs
import { createRequire } from "module";
var require2 = createRequire("/");
var _a;
var Worker;
var isMarkedAsUntransferable;
try {
  _a = require2("worker_threads"), Worker = _a.Worker, isMarkedAsUntransferable = _a.isMarkedAsUntransferable;
} catch (e) {
}
var u82 = Uint8Array;
var u16 = Uint16Array;
var i32 = Int32Array;
var fleb = new u82([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  0,
  /* unused */
  0,
  0,
  /* impossible */
  0
]);
var fdeb = new u82([
  0,
  0,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  13,
  13,
  /* unused */
  0,
  0
]);
var clim = new u82([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
var freb = function(eb, start) {
  var b = new u16(31);
  for (var i3 = 0; i3 < 31; ++i3) {
    b[i3] = start += 1 << eb[i3 - 1];
  }
  var r = new i32(b[30]);
  for (var i3 = 1; i3 < 30; ++i3) {
    for (var j = b[i3]; j < b[i3 + 1]; ++j) {
      r[j] = j - b[i3] << 5 | i3;
    }
  }
  return { b, r };
};
var _a = freb(fleb, 2);
var fl = _a.b;
var revfl = _a.r;
fl[28] = 258, revfl[258] = 28;
var _b = freb(fdeb, 0);
var fd = _b.b;
var revfd = _b.r;
var rev = new u16(32768);
for (i2 = 0; i2 < 32768; ++i2) {
  x = (i2 & 43690) >> 1 | (i2 & 21845) << 1;
  x = (x & 52428) >> 2 | (x & 13107) << 2;
  x = (x & 61680) >> 4 | (x & 3855) << 4;
  rev[i2] = ((x & 65280) >> 8 | (x & 255) << 8) >> 1;
}
var x;
var i2;
var hMap = (function(cd, mb, r) {
  var s = cd.length;
  var i3 = 0;
  var l = new u16(mb);
  for (; i3 < s; ++i3) {
    if (cd[i3])
      ++l[cd[i3] - 1];
  }
  var le = new u16(mb);
  for (i3 = 1; i3 < mb; ++i3) {
    le[i3] = le[i3 - 1] + l[i3 - 1] << 1;
  }
  var co;
  if (r) {
    co = new u16(1 << mb);
    var rvb = 15 - mb;
    for (i3 = 0; i3 < s; ++i3) {
      if (cd[i3]) {
        var sv = i3 << 4 | cd[i3];
        var r_1 = mb - cd[i3];
        var v = le[cd[i3] - 1]++ << r_1;
        for (var m = v | (1 << r_1) - 1; v <= m; ++v) {
          co[rev[v] >> rvb] = sv;
        }
      }
    }
  } else {
    co = new u16(s);
    for (i3 = 0; i3 < s; ++i3) {
      if (cd[i3]) {
        co[i3] = rev[le[cd[i3] - 1]++] >> 15 - cd[i3];
      }
    }
  }
  return co;
});
var flt = new u82(288);
for (i2 = 0; i2 < 144; ++i2)
  flt[i2] = 8;
var i2;
for (i2 = 144; i2 < 256; ++i2)
  flt[i2] = 9;
var i2;
for (i2 = 256; i2 < 280; ++i2)
  flt[i2] = 7;
var i2;
for (i2 = 280; i2 < 288; ++i2)
  flt[i2] = 8;
var i2;
var fdt = new u82(32);
for (i2 = 0; i2 < 32; ++i2)
  fdt[i2] = 5;
var i2;
var flrm = /* @__PURE__ */ hMap(flt, 9, 1);
var fdrm = /* @__PURE__ */ hMap(fdt, 5, 1);
var max = function(a) {
  var m = a[0];
  for (var i3 = 1; i3 < a.length; ++i3) {
    if (a[i3] > m)
      m = a[i3];
  }
  return m;
};
var bits = function(d, p, m) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8) >> (p & 7) & m;
};
var bits16 = function(d, p) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8 | d[o + 2] << 16) >> (p & 7);
};
var shft = function(p) {
  return (p + 7) / 8 | 0;
};
var slc = function(v, s, e) {
  if (s == null || s < 0)
    s = 0;
  if (e == null || e > v.length)
    e = v.length;
  return new u82(v.subarray(s, e));
};
var ec = [
  "unexpected EOF",
  "invalid block type",
  "invalid length/literal",
  "invalid distance",
  "stream finished",
  "no stream handler",
  ,
  // determined by compression function
  "no callback",
  "invalid UTF-8 data",
  "extra field too long",
  "date not in range 1980-2099",
  "filename too long",
  "stream finishing",
  "invalid zip data"
  // determined by unknown compression method
];
var err = function(ind, msg, nt) {
  var e = new Error(msg || ec[ind]);
  e.code = ind;
  if (Error.captureStackTrace)
    Error.captureStackTrace(e, err);
  if (!nt)
    throw e;
  return e;
};
var inflt = function(dat, st, buf, dict) {
  var sl = dat.length, dl = dict ? dict.length : 0;
  if (!sl || st.f && !st.l)
    return buf || new u82(0);
  var noBuf = !buf;
  var resize = noBuf || st.i != 2;
  var noSt = st.i;
  if (noBuf)
    buf = new u82(sl * 3);
  var cbuf = function(l2) {
    var bl = buf.length;
    if (l2 > bl) {
      var nbuf = new u82(Math.max(bl * 2, l2));
      nbuf.set(buf);
      buf = nbuf;
    }
  };
  var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
  var tbts = sl * 8;
  do {
    if (!lm) {
      final = bits(dat, pos, 1);
      var type = bits(dat, pos + 1, 3);
      pos += 3;
      if (!type) {
        var s = shft(pos) + 4, l = dat[s - 4] | dat[s - 3] << 8, t = s + l;
        if (t > sl) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt + l);
        buf.set(dat.subarray(s, t), bt);
        st.b = bt += l, st.p = pos = t * 8, st.f = final;
        continue;
      } else if (type == 1)
        lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
      else if (type == 2) {
        var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
        var tl = hLit + bits(dat, pos + 5, 31) + 1;
        pos += 14;
        var ldt = new u82(tl);
        var clt = new u82(19);
        for (var i3 = 0; i3 < hcLen; ++i3) {
          clt[clim[i3]] = bits(dat, pos + i3 * 3, 7);
        }
        pos += hcLen * 3;
        var clb = max(clt), clbmsk = (1 << clb) - 1;
        var clm = hMap(clt, clb, 1);
        for (var i3 = 0; i3 < tl; ) {
          var r = clm[bits(dat, pos, clbmsk)];
          pos += r & 15;
          var s = r >> 4;
          if (s < 16) {
            ldt[i3++] = s;
          } else {
            var c = 0, n = 0;
            if (s == 16)
              n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i3 - 1];
            else if (s == 17)
              n = 3 + bits(dat, pos, 7), pos += 3;
            else if (s == 18)
              n = 11 + bits(dat, pos, 127), pos += 7;
            while (n--)
              ldt[i3++] = c;
          }
        }
        var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
        lbt = max(lt);
        dbt = max(dt);
        lm = hMap(lt, lbt, 1);
        dm = hMap(dt, dbt, 1);
      } else
        err(1);
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
    }
    if (resize)
      cbuf(bt + 131072);
    var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
    var lpos = pos;
    for (; ; lpos = pos) {
      var c = lm[bits16(dat, pos) & lms], sym = c >> 4;
      pos += c & 15;
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
      if (!c)
        err(2);
      if (sym < 256)
        buf[bt++] = sym;
      else if (sym == 256) {
        lpos = pos, lm = null;
        break;
      } else {
        var add = sym - 254;
        if (sym > 264) {
          var i3 = sym - 257, b = fleb[i3];
          add = bits(dat, pos, (1 << b) - 1) + fl[i3];
          pos += b;
        }
        var d = dm[bits16(dat, pos) & dms], dsym = d >> 4;
        if (!d)
          err(3);
        pos += d & 15;
        var dt = fd[dsym];
        if (dsym > 3) {
          var b = fdeb[dsym];
          dt += bits16(dat, pos) & (1 << b) - 1, pos += b;
        }
        if (pos > tbts) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt + 131072);
        var end = bt + add;
        if (bt < dt) {
          var shift = dl - dt, dend = Math.min(dt, end);
          if (shift + bt < 0)
            err(3);
          for (; bt < dend; ++bt)
            buf[bt] = dict[shift + bt];
        }
        for (; bt < end; ++bt)
          buf[bt] = buf[bt - dt];
      }
    }
    st.l = lm, st.p = lpos, st.b = bt, st.f = final;
    if (lm)
      final = 1, st.m = lbt, st.d = dm, st.n = dbt;
  } while (!final);
  return bt != buf.length && noBuf ? slc(buf, 0, bt) : buf.subarray(0, bt);
};
var et = /* @__PURE__ */ new u82(0);
var b2 = function(d, b) {
  return d[b] | d[b + 1] << 8;
};
var b4 = function(d, b) {
  return (d[b] | d[b + 1] << 8 | d[b + 2] << 16 | d[b + 3] << 24) >>> 0;
};
var b8 = function(d, b) {
  return b4(d, b) + b4(d, b + 4) * 4294967296;
};
function inflateSync(data, opts) {
  return inflt(data, { i: 2 }, opts && opts.out, opts && opts.dictionary);
}
var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
var tds = 0;
try {
  td.decode(et, { stream: true });
  tds = 1;
} catch (e) {
}
var dutf8 = function(d) {
  for (var r = "", i3 = 0; ; ) {
    var c = d[i3++];
    var eb = (c > 127) + (c > 223) + (c > 239);
    if (i3 + eb > d.length)
      return { s: r, r: slc(d, i3 - 1) };
    if (!eb)
      r += String.fromCharCode(c);
    else if (eb == 3) {
      c = ((c & 15) << 18 | (d[i3++] & 63) << 12 | (d[i3++] & 63) << 6 | d[i3++] & 63) - 65536, r += String.fromCharCode(55296 | c >> 10, 56320 | c & 1023);
    } else if (eb & 1)
      r += String.fromCharCode((c & 31) << 6 | d[i3++] & 63);
    else
      r += String.fromCharCode((c & 15) << 12 | (d[i3++] & 63) << 6 | d[i3++] & 63);
  }
};
function strFromU8(dat, latin1) {
  if (latin1) {
    var r = "";
    for (var i3 = 0; i3 < dat.length; i3 += 16384)
      r += String.fromCharCode.apply(null, dat.subarray(i3, i3 + 16384));
    return r;
  } else if (td) {
    return td.decode(dat);
  } else {
    var _a2 = dutf8(dat), s = _a2.s, r = _a2.r;
    if (r.length)
      err(8);
    return s;
  }
}
var slzh = function(d, b) {
  return b + 30 + b2(d, b + 26) + b2(d, b + 28);
};
var zh = function(d, b, z) {
  var fnl = b2(d, b + 28), efl = b2(d, b + 30), fn = strFromU8(d.subarray(b + 46, b + 46 + fnl), !(b2(d, b + 8) & 2048)), es = b + 46 + fnl;
  var _a2 = z64hs(d, es, efl, z, b4(d, b + 20), b4(d, b + 24), b4(d, b + 42)), sc = _a2[0], su = _a2[1], off = _a2[2];
  return [b2(d, b + 10), sc, su, fn, es + efl + b2(d, b + 32), off];
};
var z64hs = function(d, b, l, z, sc, su, off) {
  var nsc = sc == 4294967295, nsu = su == 4294967295, noff = off == 4294967295, e = b + l;
  var nf = nsc + nsu + noff;
  if (z && nf) {
    for (; b + 4 < e; b += 4 + b2(d, b + 2)) {
      if (b2(d, b) == 1) {
        return [
          nsc ? b8(d, b + 4 + 8 * nsu) : sc,
          nsu ? b8(d, b + 4) : su,
          noff ? b8(d, b + 4 + 8 * (nsu + nsc)) : off,
          1
        ];
      }
    }
    if (z < 2)
      err(13);
  }
  return [sc, su, off, 0];
};
function unzipSync(data, opts) {
  var files = {};
  var e = data.length - 22;
  for (; b4(data, e) != 101010256; --e) {
    if (!e || data.length - e > 65558)
      err(13);
  }
  ;
  var c = b2(data, e + 8);
  if (!c)
    return {};
  var o = b4(data, e + 16);
  var z = b4(data, e - 20) == 117853008;
  if (z) {
    var ze = b4(data, e - 12);
    z = b4(data, ze) == 101075792;
    if (z) {
      c = b4(data, ze + 32);
      o = b4(data, ze + 48);
    }
  }
  var fltr = opts && opts.filter;
  for (var i3 = 0; i3 < c; ++i3) {
    var _a2 = zh(data, o, z), c_2 = _a2[0], sc = _a2[1], su = _a2[2], fn = _a2[3], no = _a2[4], off = _a2[5], b = slzh(data, off);
    o = no;
    if (!fltr || fltr({
      name: fn,
      size: sc,
      originalSize: su,
      compression: c_2
    })) {
      if (!c_2)
        files[fn] = slc(data, b, b + sc);
      else if (c_2 == 8)
        files[fn] = inflateSync(data.subarray(b, b + sc), { out: new u82(su) });
      else
        err(14, "unknown compression type " + c_2);
    }
  }
  return files;
}

// node_modules/android-axml-parser/dist/index.js
var RES_XML_TYPE = 3;
var RES_STRING_POOL_TYPE = 1;
var RES_XML_START_ELEMENT_TYPE = 258;
var RES_XML_END_ELEMENT_TYPE = 259;
var UTF8_FLAG = 256;
var NO_INDEX = 4294967295;
var TYPE_NULL = 0;
var TYPE_REFERENCE = 1;
var TYPE_ATTRIBUTE = 2;
var TYPE_STRING = 3;
var TYPE_FLOAT = 4;
var TYPE_INT_DEC = 16;
var TYPE_INT_HEX = 17;
var TYPE_INT_BOOLEAN = 18;
function parseAxml(buffer) {
  assertRange(buffer, 0, 8, "XML header");
  const xmlType = buffer.readUInt16LE(0);
  const xmlHeaderSize = buffer.readUInt16LE(2);
  const xmlSize = buffer.readUInt32LE(4);
  if (xmlType !== RES_XML_TYPE) {
    throw new Error(`Unexpected Android binary XML type 0x${xmlType.toString(16)}`);
  }
  if (xmlSize > buffer.length || xmlHeaderSize < 8) {
    throw new Error("Invalid Android binary XML header");
  }
  let strings = [];
  let root = null;
  const elementStack = [];
  let cursor = xmlHeaderSize;
  while (cursor + 8 <= xmlSize) {
    const type = buffer.readUInt16LE(cursor);
    const headerSize = buffer.readUInt16LE(cursor + 2);
    const size = buffer.readUInt32LE(cursor + 4);
    if (headerSize < 8 || size < headerSize || cursor + size > xmlSize) {
      throw new Error(`Invalid Android XML chunk at offset ${cursor}`);
    }
    if (type === RES_STRING_POOL_TYPE) {
      strings = parseStringPool(buffer, cursor, headerSize, size);
    } else if (type === RES_XML_START_ELEMENT_TYPE) {
      const { name, attributes } = parseStartElement(buffer, cursor, size, strings);
      const element = { name, attributes, children: [] };
      if (elementStack.length > 0) {
        elementStack[elementStack.length - 1].children.push(element);
      } else {
        root = element;
      }
      elementStack.push(element);
    } else if (type === RES_XML_END_ELEMENT_TYPE) {
      elementStack.pop();
    }
    cursor += size;
  }
  return { strings, root };
}
function parseStringPool(buffer, chunkOffset, headerSize, chunkSize) {
  assertRange(buffer, chunkOffset, headerSize, "string pool header");
  const stringCount = buffer.readUInt32LE(chunkOffset + 8);
  const styleCount = buffer.readUInt32LE(chunkOffset + 12);
  const flags = buffer.readUInt32LE(chunkOffset + 16);
  const stringsStart = buffer.readUInt32LE(chunkOffset + 20);
  const stylesStart = buffer.readUInt32LE(chunkOffset + 24);
  const offsetsStart = chunkOffset + headerSize;
  const offsetsLength = (stringCount + styleCount) * 4;
  assertRange(buffer, offsetsStart, offsetsLength, "string pool offsets");
  const stringsBase = chunkOffset + stringsStart;
  const stringsEnd = stylesStart === 0 ? chunkOffset + chunkSize : chunkOffset + stylesStart;
  if (stringsBase > stringsEnd || stringsEnd > chunkOffset + chunkSize) {
    throw new Error("Invalid Android string pool boundaries");
  }
  const utf8 = (flags & UTF8_FLAG) !== 0;
  const strings = [];
  for (let index = 0; index < stringCount; index += 1) {
    const relativeOffset = buffer.readUInt32LE(offsetsStart + index * 4);
    const absoluteOffset = stringsBase + relativeOffset;
    if (absoluteOffset >= stringsEnd) {
      throw new Error(`String ${index} points outside the Android string pool`);
    }
    strings.push(utf8 ? readUtf8String(buffer, absoluteOffset, stringsEnd) : readUtf16String(buffer, absoluteOffset, stringsEnd));
  }
  return strings;
}
function readUtf8String(buffer, offset, end) {
  const utf16Length = readLength8(buffer, offset, end);
  const byteLength = readLength8(buffer, utf16Length.nextOffset, end);
  const start = byteLength.nextOffset;
  const finish = start + byteLength.value;
  if (finish > end) {
    throw new Error("UTF-8 string exceeds Android string pool bounds");
  }
  return buffer.toString("utf8", start, finish);
}
function readUtf16String(buffer, offset, end) {
  const length = readLength16(buffer, offset, end);
  const start = length.nextOffset;
  const finish = start + length.value * 2;
  if (finish > end) {
    throw new Error("UTF-16 string exceeds Android string pool bounds");
  }
  return buffer.toString("utf16le", start, finish);
}
function readLength8(buffer, offset, end) {
  if (offset >= end) {
    throw new Error("Truncated Android UTF-8 string length");
  }
  const first = buffer[offset];
  if ((first & 128) === 0) {
    return { value: first, nextOffset: offset + 1 };
  }
  if (offset + 1 >= end) {
    throw new Error("Truncated Android UTF-8 string length");
  }
  return {
    value: (first & 127) << 8 | buffer[offset + 1],
    nextOffset: offset + 2
  };
}
function readLength16(buffer, offset, end) {
  if (offset + 2 > end) {
    throw new Error("Truncated Android UTF-16 string length");
  }
  const first = buffer.readUInt16LE(offset);
  if ((first & 32768) === 0) {
    return { value: first, nextOffset: offset + 2 };
  }
  if (offset + 4 > end) {
    throw new Error("Truncated Android UTF-16 string length");
  }
  return {
    value: (first & 32767) << 16 | buffer.readUInt16LE(offset + 2),
    nextOffset: offset + 4
  };
}
function parseStartElement(buffer, chunkOffset, chunkSize, strings) {
  assertRange(buffer, chunkOffset, Math.min(chunkSize, 36), "start element");
  const nameIndex = buffer.readUInt32LE(chunkOffset + 20);
  const attributeStart = buffer.readUInt16LE(chunkOffset + 24);
  const attributeSize = buffer.readUInt16LE(chunkOffset + 26);
  const attributeCount = buffer.readUInt16LE(chunkOffset + 28);
  const attributesOffset = chunkOffset + 16 + attributeStart;
  if (attributeSize < 20) {
    throw new Error(`Unsupported Android XML attribute size ${attributeSize}`);
  }
  if (attributesOffset + attributeCount * attributeSize > chunkOffset + chunkSize) {
    throw new Error("Android XML attributes exceed element chunk bounds");
  }
  const attributes = [];
  for (let index = 0; index < attributeCount; index += 1) {
    const offset = attributesOffset + index * attributeSize;
    const attributeNameIndex = buffer.readUInt32LE(offset + 4);
    const rawValueIndex = buffer.readUInt32LE(offset + 8);
    const dataType = buffer[offset + 15];
    const data = buffer.readUInt32LE(offset + 16);
    const name = getString(strings, attributeNameIndex) ?? `attribute_${attributeNameIndex}`;
    const rawValue = getString(strings, rawValueIndex);
    const value = rawValue ?? decodeTypedValue(strings, dataType, data);
    attributes.push({ name, value });
  }
  return {
    name: getString(strings, nameIndex) ?? `element_${nameIndex}`,
    attributes
  };
}
function decodeTypedValue(strings, dataType, data) {
  switch (dataType) {
    case TYPE_NULL:
      return void 0;
    case TYPE_STRING:
      return getString(strings, data);
    case TYPE_INT_DEC:
      return String(data);
    case TYPE_INT_HEX:
      return `0x${data.toString(16)}`;
    case TYPE_INT_BOOLEAN:
      return data !== 0 ? "true" : "false";
    case TYPE_FLOAT: {
      const value = Buffer.allocUnsafe(4);
      value.writeUInt32LE(data, 0);
      return String(value.readFloatLE(0));
    }
    case TYPE_REFERENCE:
      return `@0x${data.toString(16)}`;
    case TYPE_ATTRIBUTE:
      return `?0x${data.toString(16)}`;
    default:
      return String(data);
  }
}
function getString(strings, index) {
  if (index === NO_INDEX) {
    return void 0;
  }
  return strings[index];
}
function assertRange(buffer, offset, length, label) {
  if (offset < 0 || length < 0 || offset + length > buffer.length) {
    throw new Error(`Truncated ${label}`);
  }
}

// src/apk/manifest.ts
var MANIFEST_ENTRY = "AndroidManifest.xml";
function isResourceReference(value) {
  return value !== void 0 && /^@0x[0-9a-f]+$/i.test(value.trim());
}
function toInt(value) {
  if (value === void 0) return void 0;
  const trimmed = value.trim();
  const parsed = /^0x/i.test(trimmed) ? Number.parseInt(trimmed, 16) : Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) ? parsed : void 0;
}
var ManifestReadError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "ManifestReadError";
  }
};
function readManifest(apk) {
  let raw;
  try {
    const entries = unzipSync(apk, { filter: (entry) => entry.name === MANIFEST_ENTRY });
    const manifest = entries[MANIFEST_ENTRY];
    if (!manifest) throw new Error(`${MANIFEST_ENTRY} is not present in the APK`);
    raw = Buffer.from(manifest);
  } catch (cause) {
    throw new ManifestReadError(
      `could not read ${MANIFEST_ENTRY}: ${cause instanceof Error ? cause.message : String(cause)}`
    );
  }
  let doc;
  try {
    doc = parseAxml(raw);
  } catch (cause) {
    throw new ManifestReadError(
      `could not decode the binary manifest: ${cause instanceof Error ? cause.message : String(cause)}`
    );
  }
  const root = doc.root;
  if (!root || root.name !== "manifest") {
    throw new ManifestReadError(`expected a <manifest> root element, found ${root ? `<${root.name}>` : "nothing"}`);
  }
  const attr = (element, name) => element?.attributes?.find((a) => a.name === name)?.value;
  const packageName = attr(root, "package");
  const versionCode = toInt(attr(root, "versionCode"));
  const versionName = attr(root, "versionName");
  if (!packageName) throw new ManifestReadError("manifest has no package attribute");
  if (versionCode === void 0) throw new ManifestReadError("manifest has no readable versionCode");
  if (!versionName) throw new ManifestReadError("manifest has no readable versionName");
  const children = root.children ?? [];
  const usesSdk = children.find((c) => c.name === "uses-sdk");
  const permissions = [];
  for (const child of children) {
    if (child.name !== "uses-permission") continue;
    const name = attr(child, "name");
    if (name) permissions.push(name);
  }
  const features = [];
  for (const child of children) {
    if (child.name !== "uses-feature") continue;
    const name = attr(child, "name");
    if (!name) continue;
    features.push({ name, required: attr(child, "required") !== "false" });
  }
  const application = children.find((c) => c.name === "application");
  const rawLabel = attr(application, "label");
  const label = rawLabel && !isResourceReference(rawLabel) ? rawLabel : void 0;
  const labelResourceId = rawLabel && isResourceReference(rawLabel) ? rawLabel : void 0;
  const debuggableRaw = attr(application, "debuggable");
  const result = {
    package: packageName,
    versionCode,
    versionName,
    permissions,
    features
  };
  const minSdk = toInt(attr(usesSdk, "minSdkVersion"));
  if (minSdk !== void 0) result.minSdkVersion = minSdk;
  const targetSdk = toInt(attr(usesSdk, "targetSdkVersion"));
  if (targetSdk !== void 0) result.targetSdkVersion = targetSdk;
  const compileSdk = toInt(attr(root, "compileSdkVersion"));
  if (compileSdk !== void 0) result.compileSdkVersion = compileSdk;
  if (label !== void 0) result.label = label;
  if (labelResourceId !== void 0) result.labelResourceId = labelResourceId;
  if (debuggableRaw !== void 0) result.debuggable = debuggableRaw === "true";
  return result;
}

// src/apk/signing-block.ts
import { createHash } from "node:crypto";
var MAGIC = "APK Sig Block 42";
var MAGIC_LEN = 16;
var SCHEME_V2 = 1896449818;
var SCHEME_V3 = 4031998144;
var EOCD_SIGNATURE = 101010256;
var ZIP64_EOCD_LOCATOR_SIGNATURE = 117853008;
var BLOCK_FRAMING = 8 + 8 + MAGIC_LEN;
var Cursor = class {
  buf;
  pos;
  constructor(buf, pos = 0) {
    this.buf = buf;
    this.pos = pos;
  }
  get remaining() {
    return this.buf.length - this.pos;
  }
  u32() {
    if (this.remaining < 4) {
      throw new RangeError(
        `APK structure truncated: wanted 4 bytes at offset ${this.pos}, ${this.remaining} available`
      );
    }
    const value = this.buf.readUInt32LE(this.pos);
    this.pos += 4;
    return value;
  }
  /** Reads a uint32 byte count and returns a view of the bytes that follow it. */
  slice() {
    const length = this.u32();
    const start = this.pos;
    if (length > this.remaining) {
      throw new RangeError(
        `APK declares a ${length} byte region at offset ${start} but only ${this.remaining} bytes remain`
      );
    }
    this.pos += length;
    return this.buf.subarray(start, start + length);
  }
};
function findCentralDirectoryOffset(apk) {
  const earliest = Math.max(0, apk.length - (22 + 65535));
  for (let i3 = apk.length - 22; i3 >= earliest; i3--) {
    if (apk.readUInt32LE(i3) !== EOCD_SIGNATURE) continue;
    const locatorAt = i3 - 20;
    if (locatorAt >= 0 && apk.readUInt32LE(locatorAt) === ZIP64_EOCD_LOCATOR_SIGNATURE) {
      throw new Error(
        "APK uses a ZIP64 end-of-central-directory record; only ZIP32 archives are supported"
      );
    }
    const cdSize = apk.readUInt32LE(i3 + 12);
    const cdOffset = apk.readUInt32LE(i3 + 16);
    if (cdOffset === 4294967295 || cdSize === 4294967295) {
      throw new Error("APK ZIP64 fields are saturated, indicating a ZIP64 archive; only ZIP32 is supported");
    }
    if (cdOffset + cdSize > apk.length) {
      throw new Error(
        `Central directory at ${cdOffset} (${cdSize} bytes) extends past the ${apk.length} byte APK`
      );
    }
    return cdOffset;
  }
  throw new Error("No ZIP end-of-central-directory record found; the APK is not a valid ZIP archive");
}
function findSigningBlock(apk) {
  const cdOffset = findCentralDirectoryOffset(apk);
  const magicAt = cdOffset - MAGIC_LEN;
  if (magicAt < BLOCK_FRAMING) return void 0;
  if (apk.toString("latin1", magicAt, magicAt + MAGIC_LEN) !== MAGIC) return void 0;
  const size = Number(apk.readBigUInt64LE(magicAt - 8));
  if (!Number.isSafeInteger(size) || size <= 0) return void 0;
  const start = cdOffset - 8 - size;
  const pairsStart = start + 8;
  const pairsEnd = magicAt - 8;
  if (start < 0 || pairsStart < 0 || pairsEnd <= pairsStart) return void 0;
  return { start, pairsStart, pairsEnd };
}
function* pairs(apk, block) {
  let pos = block.pairsStart;
  while (pos + 12 <= block.pairsEnd) {
    const length = Number(apk.readBigUInt64LE(pos));
    if (!Number.isSafeInteger(length) || length < 4) {
      throw new Error(`APK signing block pair at ${pos} declares an implausible length ${length}`);
    }
    const valueLength = length - 4;
    const next = pos + 8 + length;
    if (valueLength > block.pairsEnd - (pos + 12)) {
      throw new Error(
        `APK signing block pair at ${pos} declares ${length} bytes, overrunning the block`
      );
    }
    const id = apk.readUInt32LE(pos + 8);
    yield { id, value: apk.subarray(pos + 12, pos + 12 + valueLength), pairStart: pos };
    pos = next;
  }
  if (pos !== block.pairsEnd) {
    throw new Error(`APK signing block pairs end at ${pos} but the block ends at ${block.pairsEnd}`);
  }
}
function certificateFromSchemeBlock(value) {
  const outer = new Cursor(value);
  const signersLength = outer.u32();
  if (signersLength < 4 || signersLength > value.length) {
    throw new RangeError(`scheme block declares a ${signersLength} byte signers region`);
  }
  const signer = outer.slice();
  const inSigner = new Cursor(signer);
  const signedDataLength = inSigner.u32();
  const signedData = signer.subarray(inSigner.pos, inSigner.pos + signedDataLength);
  if (signedDataLength > signer.length - inSigner.pos) {
    throw new RangeError(`signer declares a ${signedDataLength} byte signed-data region`);
  }
  inSigner.pos += signedDataLength;
  inSigner.slice();
  inSigner.slice();
  const inSignedData = new Cursor(signedData);
  inSignedData.slice();
  const certificates = inSignedData.slice();
  const inCertificates = new Cursor(certificates);
  const derLength = inCertificates.u32();
  if (derLength === 0) return void 0;
  if (derLength > inCertificates.remaining) {
    throw new RangeError(`certificate declares ${derLength} bytes but only ${inCertificates.remaining} remain`);
  }
  const der = certificates.subarray(inCertificates.pos, inCertificates.pos + derLength);
  if (der.length < 4 || der[0] !== 48 || der[1] !== 130 || der.readUInt16BE(2) !== der.length - 4) {
    throw new Error(
      `certificate at the expected offset is not a well-formed DER SEQUENCE (${der.length} bytes)`
    );
  }
  return der;
}
var CertificateNotFoundError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "CertificateNotFoundError";
  }
};
function signingCertificateSha256(apk) {
  const block = findSigningBlock(apk);
  if (!block) {
    throw new CertificateNotFoundError(
      "APK has no APK Signing Block, so it carries only a v1 (JAR) signature. v1 certificate extraction is not implemented; publish an APK signed with v2 or v3."
    );
  }
  let sawV2 = false;
  let sawV3 = false;
  let v3Candidate;
  for (const { id, value } of pairs(apk, block)) {
    if (id === SCHEME_V2) sawV2 = true;
    if (id === SCHEME_V3) sawV3 = true;
    if (id !== SCHEME_V2 && id !== SCHEME_V3) continue;
    const der = certificateFromSchemeBlock(value);
    if (!der || der.length === 0) continue;
    const info = {
      sha256: createHash("sha256").update(der).digest("hex"),
      scheme: id === SCHEME_V3 ? "v3" : "v2",
      derLength: der.length
    };
    if (info.scheme === "v3") return info;
    v3Candidate ??= info;
  }
  if (v3Candidate) return v3Candidate;
  const present = [sawV2 && "v2", sawV3 && "v3"].filter(Boolean).join(" and ");
  throw new CertificateNotFoundError(
    present ? `APK signing block contains a ${present} block but no certificate could be read from it` : "APK signing block contains no v2 or v3 signature block"
  );
}

// src/blossom.ts
import { createHash as createHash2 } from "node:crypto";
var BlossomError = class extends Error {
  /** HTTP status, when the failure came from a server response. */
  status;
  constructor(message, status) {
    super(message);
    this.name = "BlossomError";
    this.status = status;
  }
};
function sha256Hex(data) {
  return createHash2("sha256").update(data).digest("hex");
}
function blobUrl(baseUrl, sha2562) {
  return `${baseUrl.replace(/\/+$/, "")}/${sha2562}`;
}
var UPLOAD_AUTH_TTL_SECONDS = 3600;
async function uploadAuthHeader(sha2562, signer, now2 = () => Math.floor(Date.now() / 1e3)) {
  const createdAt = now2();
  const event = await signer.signEvent({
    kind: 24242,
    created_at: createdAt,
    content: `Upload ${sha2562}`,
    tags: [
      // `t` is the action, not a media type: the server matches it against
      // get/upload/list/delete and answers "invalid 't' tag" otherwise. `x`
      // names this blob so the server can check the authorisation covers the
      // body being sent, and `expiration` must be in the future or it is
      // rejected as expired.
      ["t", "upload"],
      ["x", sha2562],
      ["expiration", String(createdAt + UPLOAD_AUTH_TTL_SECONDS)]
    ]
  });
  const encoded = Buffer.from(JSON.stringify(event), "utf8").toString("base64");
  return `Nostr ${encoded}`;
}
async function uploadBlob(data, contentType, options) {
  const sha2562 = sha256Hex(data);
  const endpoint = `${options.baseUrl.replace(/\/+$/, "")}/upload`;
  const doFetch = options.fetchImpl ?? fetch;
  const headers = {
    "Content-Type": contentType,
    "Content-Length": String(data.byteLength),
    // Both spellings of the blob hash are sent, in plain hex rather than the
    // RFC 9530 base64 form. Blossom servers disagree on the header name: the
    // version of `blossy` that cdn.zapstore.dev runs reads `Content-Digest` and
    // rejects a request without it with
    // "'Content-Digest' header is missing or empty", while later ones read
    // `X-SHA-256`. The value is identical and both are cheap, so sending both
    // works against either. The hash lets the server reject a body that does not
    // match what we claim, and short-circuit when the blob is already stored.
    "Content-Digest": sha2562,
    "X-SHA-256": sha2562
  };
  if (options.signer) {
    headers.Authorization = await uploadAuthHeader(sha2562, options.signer, options.now);
  } else if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }
  const response = await doFetch(endpoint, { method: "PUT", headers, body: data });
  if (!response.ok) {
    const reason = response.headers.get("X-Reason");
    throw new BlossomError(
      `upload to ${endpoint} failed with ${response.status}${reason ? `: ${reason}` : ""}`,
      response.status
    );
  }
  const fallback = blobUrl(options.baseUrl, sha2562);
  let parsed = {};
  try {
    parsed = await response.json();
  } catch {
  }
  if (parsed.sha256 && parsed.sha256 !== sha2562) {
    throw new BlossomError(
      `server reported sha256 ${parsed.sha256} for a blob that hashes to ${sha2562}`
    );
  }
  return {
    url: typeof parsed.url === "string" && parsed.url ? parsed.url : fallback,
    sha256: sha2562,
    size: data.byteLength,
    type: typeof parsed.type === "string" && parsed.type ? parsed.type : contentType,
    uploaded: typeof parsed.uploaded === "number" ? parsed.uploaded : 0
  };
}
function contentTypeForPath(path) {
  const extension = path.toLowerCase().split(".").pop() ?? "";
  const types = {
    apk: "application/vnd.android.package-archive",
    png: "image/png",
    webp: "image/webp",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    svg: "image/svg+xml"
  };
  return types[extension] ?? "application/octet-stream";
}

// src/unhandled.ts
var BENIGN_MESSAGES = ["relay connection closed by us"];
var TEARDOWN_MESSAGES = ["SendingOnClosedConnection", "closed connection"];
function messageOf(reason) {
  return reason instanceof Error ? reason.message : String(reason);
}
function debugEnabled() {
  return process.env.RUNNER_DEBUG === "1" || process.env.ACTIONS_STEP_DEBUG === "1";
}
function summariseNoise(message) {
  const [name] = message.split(":", 1);
  return `${name === message ? message : name}; enable debug logging for the full message`;
}
function isBenignRelayClose(reason) {
  return reason instanceof Error && BENIGN_MESSAGES.some((m) => reason.message.includes(m));
}
function isTeardownNoise(reason) {
  return reason instanceof Error && TEARDOWN_MESSAGES.some((m) => reason.message.includes(m));
}
var tearingDown = false;
function beginTeardown() {
  tearingDown = true;
}
function createUnhandledRejectionHandler(log2, write, fail) {
  return (reason) => {
    const message = messageOf(reason);
    if (isBenignRelayClose(reason) || tearingDown && isTeardownNoise(reason)) {
      const detail = debugEnabled() ? message : summariseNoise(message);
      log2(`ignored relay teardown noise: ${detail}`);
      return;
    }
    write(`::error::unhandled rejection: ${reason instanceof Error ? reason.stack : message}
`);
    fail();
  };
}
function installUnhandledRejectionGuard(log2, write) {
  const listener = createUnhandledRejectionHandler(log2, write, () => {
    process.exitCode = 1;
  });
  process.on("unhandledRejection", listener);
  return () => process.off("unhandledRejection", listener);
}

// src/nostr/events.ts
var KIND_SOFTWARE_ASSET = 3063;
var KIND_SOFTWARE_RELEASE = 30063;
var KIND_SOFTWARE_APP = 32267;
var DEFAULT_COMMUNITY = "acfeaea6e51420e8068fac446ca9d17d7a9ef6a5d20d93894e50fee3d4902a84";
var APK_MIME_TYPE = "application/vnd.android.package-archive";
var ALL_ANDROID_PLATFORMS = [
  "android-arm64-v8a",
  "android-armeabi-v7a",
  "android-x86",
  "android-x86_64"
];
var KNOWN_ABIS = {
  "arm64-v8a": "android-arm64-v8a",
  "armeabi-v7a": "android-armeabi-v7a",
  x86: "android-x86",
  x86_64: "android-x86_64"
};
function platformsForArchitectures(abis) {
  if (abis.length === 0) return [...ALL_ANDROID_PLATFORMS];
  const mapped = abis.map((abi) => KNOWN_ABIS[abi] ?? `android-${abi}`);
  return [...new Set(mapped)];
}
function versionOrCode(version, versionCode) {
  if (version) return version;
  if (versionCode !== void 0) return String(versionCode);
  throw new Error("an asset needs either a version name or a version code");
}
function buildSoftwareAppEvent(input2) {
  if (input2.platforms.length === 0) {
    throw new Error("a software application event needs at least one f platform tag");
  }
  const tags = [
    ["d", input2.packageId],
    ["name", input2.name]
  ];
  if (input2.summary) tags.push(["summary", input2.summary]);
  if (input2.icon) tags.push(["icon", input2.icon]);
  for (const image of input2.images ?? []) tags.push(["image", image]);
  for (const tag of input2.tags ?? []) tags.push(["t", tag]);
  if (input2.website) tags.push(["url", input2.website]);
  if (input2.repository) tags.push(["repository", input2.repository]);
  if (input2.nip34) {
    tags.push(input2.nip34.relay ? ["a", input2.nip34.pointer, input2.nip34.relay] : ["a", input2.nip34.pointer]);
  }
  for (const platform of input2.platforms) tags.push(["f", platform]);
  if (input2.license) tags.push(["license", input2.license]);
  const communities = input2.communities?.length ? input2.communities : [DEFAULT_COMMUNITY];
  for (const community of communities) tags.push(["h", community]);
  return { kind: KIND_SOFTWARE_APP, content: input2.description, tags, created_at: input2.createdAt };
}
function buildSoftwareAssetEvent(input2) {
  if (input2.urls.length === 0) {
    throw new Error("a software asset event needs at least one url tag");
  }
  if (input2.platforms.length === 0) {
    throw new Error("a software asset event needs at least one f platform tag");
  }
  const tags = [
    ["i", input2.packageId],
    ["x", input2.sha256],
    ["version", versionOrCode(input2.version, input2.versionCode)]
  ];
  for (const url of input2.urls) tags.push(["url", url]);
  tags.push(["m", APK_MIME_TYPE]);
  if (input2.size > 0) tags.push(["size", String(input2.size)]);
  for (const platform of input2.platforms) tags.push(["f", platform]);
  if (input2.minSdkVersion !== void 0) tags.push(["min_platform_version", String(input2.minSdkVersion)]);
  if (input2.targetSdkVersion !== void 0) tags.push(["target_platform_version", String(input2.targetSdkVersion)]);
  if (input2.certificateSha256) tags.push(["apk_certificate_hash", input2.certificateSha256]);
  return {
    kind: KIND_SOFTWARE_ASSET,
    content: input2.changelog ?? "",
    tags,
    created_at: input2.createdAt
  };
}
function buildSoftwareReleaseEvent(input2) {
  if (!input2.assetEventId) throw new Error("a software release must reference an asset event id");
  if (input2.platforms.length === 0) {
    throw new Error("a software release event needs at least one f platform tag");
  }
  const tags = [
    ["i", input2.packageId],
    ["version", input2.version],
    ["d", `${input2.packageId}@${input2.version}`],
    ["c", input2.channel]
  ];
  for (const platform of input2.platforms) tags.push(["f", platform]);
  tags.push(
    input2.assetRelayHint ? ["e", input2.assetEventId, input2.assetRelayHint] : ["e", input2.assetEventId]
  );
  return {
    kind: KIND_SOFTWARE_RELEASE,
    content: input2.releaseNotes ?? "",
    tags,
    created_at: input2.createdAt
  };
}

// src/source.ts
import { readFile as readFile2 } from "node:fs/promises";
var SourceError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "SourceError";
  }
};
function rankApkAssets(assets) {
  const score = (asset) => {
    const name = asset.name.toLowerCase();
    let value = 0;
    if (name.includes("release-signed") || name.includes("release.apk")) value += 100;
    else if (name.includes("release")) value += 50;
    if (name.includes("debug")) value -= 40;
    if (name.includes("universal")) value += 20;
    if (name.includes("arm64") || name.includes("aarch64")) value += 10;
    if (name.includes("x86_64")) value -= 5;
    if (name.includes("armeabi") || name.includes("armeabi-v7a")) value -= 1;
    return value;
  };
  return [...assets].sort((a, b) => score(b) - score(a) || b.size - a.size || a.name.localeCompare(b.name));
}
function selectApkAsset(release, match) {
  const apks = release.assets.filter((asset) => asset.name.toLowerCase().endsWith(".apk"));
  if (apks.length === 0) {
    throw new SourceError(`release ${release.tagName} has no .apk assets`);
  }
  if (match) {
    let pattern;
    try {
      pattern = new RegExp(match, "i");
    } catch (cause) {
      throw new SourceError(`match is not a valid regular expression: ${cause instanceof Error ? cause.message : cause}`);
    }
    const filtered = apks.filter((asset) => pattern.test(asset.name));
    if (filtered.length === 0) {
      throw new SourceError(
        `no asset in ${release.tagName} matched ${match} (available: ${apks.map((a) => a.name).join(", ")})`
      );
    }
    const ranked2 = rankApkAssets(filtered);
    const best2 = ranked2[0];
    if (!best2) throw new SourceError(`no asset in ${release.tagName} matched ${match}`);
    return best2;
  }
  const ranked = rankApkAssets(apks);
  const best = ranked[0];
  if (!best) throw new SourceError(`no usable APK asset in ${release.tagName}`);
  return best;
}
function selectRelease(releases) {
  const usable = releases.filter((release) => !release.draft);
  const stable = usable.filter((release) => !release.prerelease);
  const pool = stable.length > 0 ? stable : usable;
  const best = pool[0];
  if (!best) throw new SourceError("repository has no published releases");
  return best;
}
function parseGitHubRepository(repository) {
  const match = /^https?:\/\/github\.com\/([^/]+)\/([^/#?]+)/i.exec(repository.trim());
  if (!match?.[1] || !match[2]) {
    throw new SourceError(`expected a github.com repository URL, got ${repository}`);
  }
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}
async function listReleases(options) {
  const { owner, repo } = parseGitHubRepository(options.repository);
  const doFetch = options.fetchImpl ?? fetch;
  const url = `https://api.github.com/repos/${owner}/${repo}/releases?per_page=30`;
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
  };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  const response = await doFetch(url, { headers });
  if (!response.ok) {
    throw new SourceError(
      `listing releases for ${owner}/${repo} failed with ${response.status}${response.status === 403 ? " (rate limited or token missing)" : ""}`
    );
  }
  const payload = await response.json();
  return payload.map((release) => ({
    tagName: release.tag_name ?? "",
    draft: release.draft ?? false,
    prerelease: release.prerelease ?? false,
    publishedAt: release.published_at,
    assets: (release.assets ?? []).filter(
      (asset) => typeof asset.name === "string"
    ).map((asset) => ({
      name: asset.name,
      size: asset.size ?? 0,
      browserDownloadUrl: asset.browser_download_url,
      id: asset.id
    }))
  })).filter((release) => release.tagName !== "");
}
async function downloadAsset(asset, options) {
  const doFetch = options.fetchImpl ?? fetch;
  const headers = { Accept: "application/octet-stream" };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  const url = asset.browserDownloadUrl ?? (asset.id !== void 0 ? `${assetUrl(options.repository, asset.id)}` : void 0);
  if (!url) throw new SourceError(`asset ${asset.name} has no download URL`);
  const response = await doFetch(url, { headers });
  if (!response.ok) {
    throw new SourceError(`downloading ${asset.name} failed with ${response.status}`);
  }
  return Buffer.from(await response.arrayBuffer());
}
function assetUrl(repository, id) {
  const { owner, repo } = parseGitHubRepository(repository);
  return `https://api.github.com/repos/${owner}/${repo}/releases/assets/${id}`;
}
async function loadExplicit(apk) {
  if (/^https?:\/\//i.test(apk)) {
    const response = await fetch(apk);
    if (!response.ok) throw new SourceError(`fetching ${apk} failed with ${response.status}`);
    return { data: Buffer.from(await response.arrayBuffer()), url: apk, origin: apk };
  }
  try {
    return { data: await readFile2(apk), origin: apk };
  } catch (cause) {
    throw new SourceError(`reading ${apk} failed: ${cause instanceof Error ? cause.message : String(cause)}`);
  }
}
async function resolveApk(options) {
  if (options.apk) return loadExplicit(options.apk);
  const releases = await listReleases(options);
  const release = selectRelease(releases);
  const asset = selectApkAsset(release, options.match);
  const data = await downloadAsset(asset, options);
  const origin = `${options.repository} ${release.tagName}/${asset.name}`;
  const result = { data, origin, tag: release.tagName };
  if (asset.browserDownloadUrl) result.url = asset.browserDownloadUrl;
  return result;
}

// src/publish.ts
var PublishError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "PublishError";
  }
};
function nativeArchitectures(apk) {
  const abis = /* @__PURE__ */ new Set();
  for (const name of Object.keys(unzipSync(apk, { filter: (entry) => entry.name.includes(".so") }))) {
    const match = /(?:^|\/)lib\/([^/]+)\//.exec(name);
    if (match?.[1]) abis.add(match[1]);
  }
  return [...abis];
}
function inspectApk(apk) {
  const manifest = readManifest(apk);
  const certificate = signingCertificateSha256(apk);
  return {
    manifest,
    certificateSha256: certificate.sha256,
    certificateScheme: certificate.scheme,
    platforms: platformsForArchitectures(nativeArchitectures(apk))
  };
}
function pubkeyToHex(value) {
  if (/^[0-9a-f]{64}$/i.test(value)) return value.toLowerCase();
  const decoded = nip19_exports.decode(value);
  if (decoded.type !== "npub" || typeof decoded.data !== "string") {
    throw new PublishError(`pubkey must be an npub or hex key, got ${decoded.type}`);
  }
  return decoded.data;
}
async function publishRelease(options) {
  const log2 = options.log ?? (() => {
  });
  const { config } = options;
  const channel = options.channel ?? "main";
  const createdAt = Math.floor(Date.now() / 1e3);
  const blossomUrl = options.blossomUrl ?? "";
  const apk = await resolveApk({
    repository: config.repository,
    token: options.githubToken,
    match: config.match,
    apk: options.apk ?? config.releaseSource
  });
  log2(`APK resolved from ${apk.origin} (${apk.data.byteLength} bytes)`);
  const { manifest, certificateSha256, certificateScheme, platforms } = inspectApk(apk.data);
  const apkSha256 = sha256Hex(apk.data);
  log2(
    `${manifest.package} ${manifest.versionName} (code ${manifest.versionCode}), certificate ${certificateSha256.slice(0, 16)}\u2026 via ${certificateScheme}`
  );
  log2(`platforms: ${platforms.join(", ")}`);
  if (options.check) {
    if (config.pubkey) log2(`config pubkey ${pubkeyToHex(config.pubkey).slice(0, 16)}\u2026 (not cross-checked in check mode)`);
    else log2("config has no pubkey; the relay will not whitelist this publisher until one is set");
  } else if (!options.signer) {
    throw new PublishError(options.signOnly ? "a signer is required to sign" : "a signer is required to publish");
  } else if (config.pubkey && pubkeyToHex(config.pubkey) !== options.signer.publicKey) {
    throw new PublishError(
      `zapstore.yaml pubkey does not match the signing key (config ${pubkeyToHex(config.pubkey).slice(0, 16)}\u2026, signer ${options.signer.publicKey.slice(0, 16)}\u2026). The relay verifies these match, so publishing would be rejected.`
    );
  }
  const localReferences = [apk.url ? "" : apk.origin, config.icon ?? "", ...config.images ?? []].filter(Boolean);
  for (const reference of localReferences) {
    if (!/^https?:\/\//i.test(reference) && !existsSync2(reference)) {
      throw new PublishError(`${reference} does not exist`);
    }
  }
  const upload = async (reference) => {
    if (/^https?:\/\//i.test(reference)) return reference;
    if (!blossomUrl) throw new PublishError(`cannot upload ${reference} without a Blossom URL`);
    const data = await readFile3(reference);
    const descriptor = await uploadBlob(data, contentTypeForPath(reference), {
      baseUrl: blossomUrl,
      // The CDN authorises uploads against the publishing identity. Without
      // this the request goes out unauthenticated and is refused with 401.
      signer: options.signer
    });
    log2(`uploaded ${reference} (${data.byteLength} bytes)`);
    return descriptor.url;
  };
  let releaseNotes = "";
  if (config.releaseNotes && existsSync2(config.releaseNotes)) {
    releaseNotes = extractReleaseNotes(await readFile3(config.releaseNotes, "utf8"), manifest.versionName);
  }
  const base = {
    packageId: manifest.package,
    version: manifest.versionName,
    versionCode: manifest.versionCode,
    certificateSha256,
    apkSha256,
    apkSize: apk.data.byteLength,
    apkUrl: apk.url ?? `(would upload ${apk.origin} to Blossom)`,
    platforms,
    permissions: manifest.permissions,
    published: false
  };
  if (options.check) {
    log2("check mode: validated without uploading or publishing");
    return base;
  }
  const signOnly = options.signOnly === true;
  if (!signOnly && !apk.url && !blossomUrl) {
    throw new PublishError("a locally built APK needs a Blossom URL to be uploaded to");
  }
  const uploadOrPassThrough = async (reference) => signOnly ? reference : upload(reference);
  const pool = options.pool ?? new SimplePool();
  try {
    const signer = options.signer;
    if (!signer) throw new PublishError("a signer is required to publish");
    const sign = async (template) => {
      const signed = await signer.signEvent(template);
      if (signOnly) {
        log2(`signed kind ${template.kind} ${signed.id.slice(0, 16)}\u2026 (not published)`);
      } else {
        await Promise.all(pool.publish(options.relays, signed));
        log2(`published kind ${template.kind} ${signed.id.slice(0, 16)}\u2026`);
      }
      return signed;
    };
    const appEventTemplate = (icon, images) => buildSoftwareAppEvent({
      packageId: manifest.package,
      name: config.name ?? manifest.label ?? manifest.package,
      description: config.description ?? "",
      summary: config.summary,
      icon,
      images,
      tags: config.tags,
      website: config.website,
      repository: config.repository,
      platforms,
      license: config.license,
      communities: config.communities,
      createdAt
    });
    await sign(appEventTemplate(void 0, []));
    const apkUrl = signOnly ? apk.url ?? apkSha256 : apk.url ?? await upload(apk.origin);
    const iconUrl = config.icon ? await uploadOrPassThrough(config.icon) : void 0;
    const imageUrls = [];
    for (const image of config.images ?? []) {
      imageUrls.push(await uploadOrPassThrough(image));
    }
    const assetEvent = await sign(
      buildSoftwareAssetEvent({
        packageId: manifest.package,
        sha256: apkSha256,
        version: manifest.versionName,
        versionCode: manifest.versionCode,
        urls: [apkUrl],
        size: apk.data.byteLength,
        platforms,
        minSdkVersion: manifest.minSdkVersion,
        targetSdkVersion: manifest.targetSdkVersion,
        certificateSha256,
        changelog: releaseNotes,
        createdAt
      })
    );
    const releaseEvent = await sign(
      buildSoftwareReleaseEvent({
        packageId: manifest.package,
        version: manifest.versionName,
        channel,
        assetEventId: assetEvent.id,
        assetRelayHint: options.relays[0],
        platforms,
        releaseNotes,
        createdAt
      })
    );
    const appEvent = await sign(appEventTemplate(iconUrl, imageUrls));
    return { ...base, appEvent, assetEvent, releaseEvent, published: !signOnly };
  } finally {
    if (!signOnly) {
      beginTeardown();
      pool.close(options.relays);
    }
  }
}

// src/main.ts
function input(name) {
  return process.env[`INPUT_${name.toUpperCase().replace(/ /g, "_")}`]?.trim() ?? "";
}
function flag(name, fallback = false) {
  const raw = input(name).toLowerCase();
  if (raw === "") return fallback;
  return raw === "true" || raw === "1" || raw === "yes";
}
function setOutput(name, value) {
  const file = process.env.GITHUB_OUTPUT;
  const delimiter = `ghadelimiter_${name}_${crypto.randomUUID()}`;
  if (file) {
    appendFileSync(file, `${name}<<${delimiter}
${value}
${delimiter}
`);
    return;
  }
  process.stdout.write(`[output] ${name} = ${value}
`);
}
function summarise(lines) {
  const file = process.env.GITHUB_STEP_SUMMARY;
  if (!file) return;
  appendFileSync(file, `${lines.join("\n")}
`);
}
function log(message) {
  process.stdout.write(`${message}
`);
}
async function main() {
  log(`running on Node ${process.version}`);
  const configPath = input("config") || "zapstore.yaml";
  const mode = input("mode") || "publish";
  const skipIfUnconfigured = flag("skip-if-unconfigured");
  const signWith = input("sign-with") || process.env.SIGN_WITH?.trim() || "";
  const needsSigner = mode !== "check";
  if (needsSigner && !signWith) {
    const notice = "Zapstore publish skipped: no Nostr identity configured. Set the ZAPSTORE_SIGN_WITH secret to an nsec1... key or a bunker:// URL.";
    if (skipIfUnconfigured) {
      log(`::notice::${notice}`);
      return;
    }
    throw new PublishError(`${notice} Pass skip-if-unconfigured: true to allow this.`);
  }
  if (signWith && !isBunkerUrl(signWith)) setSecret(signWith);
  const relays = (input("relays") || "wss://relay.zapstore.dev").split(",").map((relay) => relay.trim()).filter(Boolean);
  if (relays.length === 0) throw new PublishError("no relays configured");
  if (needsSigner) {
    const injected = await syncConfigPubkey(configPath, npubFor(signWith));
    if (injected) log(`injected the signer's npub into ${configPath}`);
  }
  const config = await loadConfig(configPath);
  log(`loaded ${configPath} for ${config.repository}`);
  const signer = !signWith ? void 0 : isBunkerUrl(signWith) ? await createBunkerSigner(parseBunkerUrl(signWith), {
    clientName: "zapstore-publish",
    clientUrl: "https://github.com/rossigee/zapstore-publish"
  }) : createLocalSigner(decodeSecretKey(signWith));
  if (signer) {
    log(`signing as ${signer.publicKey.slice(0, 16)}\u2026 via a ${signer.kind} key`);
    if (mode === "sign") log("sign mode: events will be signed but not published");
  } else {
    log("check mode: no Nostr identity needed, nothing will be signed");
  }
  try {
    const result = await publishRelease({
      config,
      signer,
      apk: input("apk") || void 0,
      relays,
      blossomUrl: input("blossom") || void 0,
      check: mode === "check",
      signOnly: mode === "sign",
      githubToken: process.env.GITHUB_TOKEN,
      log
    });
    setOutput("apk-sha256", result.apkSha256);
    setOutput("certificate-sha256", result.certificateSha256);
    if (result.appEvent) setOutput("app-event-id", result.appEvent.id);
    if (result.releaseEvent) setOutput("release-event-id", result.releaseEvent.id);
    if (result.assetEvent) setOutput("asset-event-id", result.assetEvent.id);
    const heading = result.published ? "Published to Zapstore" : "Zapstore check passed";
    summarise([
      `### ${heading}`,
      "",
      `- Package: \`${result.packageId}\``,
      `- Version: \`${result.version}\` (code ${result.versionCode})`,
      `- APK SHA-256: \`${result.apkSha256}\``,
      `- Certificate: \`${result.certificateSha256}\``,
      `- Platforms: ${result.platforms.join(", ")}`,
      `- APK URL: ${result.apkUrl}`,
      "",
      "Permissions declared by the APK:",
      ...result.permissions.map((permission) => `  - \`${permission}\``)
    ]);
  } finally {
    await signer?.close();
  }
}
installUnhandledRejectionGuard(log, (message) => process.stderr.write(message));
main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`::error::${message}
`);
  if (error instanceof Error && error.stack && process.env.RUNNER_DEBUG === "1") {
    process.stderr.write(`${error.stack}
`);
  }
  process.exitCode = 1;
});
/*! Bundled license information:

@noble/hashes/utils.js:
  (*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/utils.js:
@noble/curves/abstract/modular.js:
@noble/curves/abstract/curve.js:
@noble/curves/abstract/weierstrass.js:
@noble/curves/secp256k1.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@scure/base/index.js:
  (*! scure-base - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/ciphers/utils.js:
  (*! noble-ciphers - MIT License (c) 2023 Paul Miller (paulmillr.com) *)
*/
