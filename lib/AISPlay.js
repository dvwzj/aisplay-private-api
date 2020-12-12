"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _util = _interopRequireDefault(require("util"));

var _lodash = _interopRequireDefault(require("lodash"));

var _reqFastPromise = require("req-fast-promise");

var _fastXmlParser = _interopRequireDefault(require("fast-xml-parser"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

class AISPLay {
  constructor(defaults) {
    this.defaults = _lodash.default.defaults({
      privateid: undefined,
      udid: undefined,
      baseURL: 'https://ss-app-tls.ais-vidnt.com'
    }, defaults);

    if (!this.defaults.privateid) {
      throw new Error('[privateid] is required.');
    }

    if (!this.defaults.udid) {
      throw new Error('[udid] is required.');
    }

    Object.defineProperty(this.defaults, 'sid', {
      get() {
        return "".concat(this.privateid.replace(/(\+|=|\/)/g, ''), "_").concat(this.udid).toLowerCase();
      }

    });
    Object.defineProperty(this, '$http', {
      value: new _reqFastPromise.ReqFastPromise({
        baseURL: this.defaults.baseURL
      })
    });
    Object.defineProperty(this, 'console', {
      value: (() => {
        var $console = _lodash.default.clone(console);

        $console.inspect = object => {
          console.log(_util.default.inspect(object, false, null, true));
        };

        return $console;
      })()
    });
  }

  get(type, item) {
    var _this = this;

    return _asyncToGenerator(function* () {
      try {
        if (!type) {
          throw new Error('[type] is required.');
        }

        if (!item) {
          throw new Error('[item] is required.');
        }

        type = type.toLowerCase();

        if (_lodash.default.isObject(item)) {
          if (item.head) {
            item = item.head;
          }

          if (type === 'item') {
            type = 'link';
          }

          if (type === 'play') {
            type = 'media';
          }
        }

        var url;

        if (_lodash.default.isObject(item) && item[type]) {
          url = item[type];
        } else if (_lodash.default.includes(['section', 'item', 'seasons'], type) && _lodash.default.isString(item)) {
          url = "/get_".concat(type, "/").concat(item, "/");
        }

        var {
          sid
        } = _this.defaults;
        var time = Math.floor(new Date().getTime() / 1000).toString();
        var res = yield _this.$http.get(url, {
          headers: {
            sid,
            time
          }
        });
        return res.data;
      } catch (e) {
        console.error(e);
      }
    })();
  }

  get_section(sectionId) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      try {
        if (!sectionId) {
          throw new Error('[sectionId] is required.');
        }

        var section = yield _this2.get('section', sectionId);
        return section;
      } catch (e) {
        console.error(e);
      }
    })();
  }

  get_item(itemId) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      try {
        if (!itemId) {
          throw new Error('[itemId] is required.');
        }

        var item = yield _this3.get('item', itemId);
        return item;
      } catch (e) {
        console.error(e);
      }
    })();
  }

  get_seasons(seasonId) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      try {
        if (!seasonId) {
          throw new Error('[seasonId] is required.');
        }

        var seasons = yield _this4.get('seasons', seasonId);
        return seasons;
      } catch (e) {
        console.error(e);
      }
    })();
  }

  play(itemId) {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      try {
        if (!itemId) {
          throw new Error('[itemId] is required.');
        }

        var play = yield _this5.get('play', itemId);
        return play;
      } catch (e) {
        console.error(e);
      }
    })();
  }

  playtemplate() {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      try {
        var {
          sid
        } = _this6.defaults;
        var time = Math.floor(new Date().getTime() / 1000).toString();
        var headers = {
          sid,
          time
        };
        var res = yield _this6.$http.get('/playtemplate/', {
          headers
        });
        return res.data;
      } catch (e) {
        console.error(e);
      }
    })();
  }

  get_xml(type, MID) {
    var _this7 = this;

    return _asyncToGenerator(function* () {
      try {
        if (!type) {
          throw new Error('[type] is required.');
        }

        if (!_lodash.default.includes(['live', 'vod', 'ugc'], type.toLowerCase())) {
          throw new Error('invalid [type], only "live", "vod" or "ugc" is allowed.');
        }

        if (!MID) {
          throw new Error('[MID] is required.');
        }

        var playtemplate = yield _this7.playtemplate();
        var info = playtemplate.info[type].replace(/{MID}/g, MID);
        var res = yield _this7.$http.get(info);
        return _fastXmlParser.default.parse(res.data);
      } catch (e) {
        console.error(e);
      }
    })();
  }

  source(type, MID) {
    var _this8 = this;

    return _asyncToGenerator(function* () {
      try {
        if (!type) {
          throw new Error('[type] is required.');
        }

        if (!_lodash.default.includes(['live', 'vod', 'ugc'], type.toLowerCase())) {
          throw new Error('invalid [type], only "live", "vod" or "ugc" is allowed.');
        }

        if (!MID) {
          throw new Error('[MID] is required.');
        }

        if (_lodash.default.isObject(MID)) {
          if (MID.mid) {
            MID = MID.mid;
          } else if (MID.head && MID.head.mid) {
            MID = MID.head.mid;
          } else {
            throw new Error('invalid [MID].');
          }
        }

        var xml = yield _this8.get_xml(type, MID);

        var playbackUrl = _lodash.default.first(xml.Metadata.PlaybackUrls.PlaybackUrl);

        return decodeURIComponent(playbackUrl.url);
      } catch (e) {
        console.error(e);
      }
    })();
  }

}

exports.default = AISPLay;