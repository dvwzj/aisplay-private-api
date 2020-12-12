"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _util = _interopRequireDefault(require("util"));

var _crypto = _interopRequireDefault(require("crypto"));

var _lodash = _interopRequireDefault(require("lodash"));

var _reqFastPromise = require("req-fast-promise");

var _fastXmlParser = _interopRequireDefault(require("fast-xml-parser"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

class AISPLay {
  constructor(defaults) {
    this.defaults = _lodash.default.merge({
      publicid: 'vimmiCB1D0336',
      privateid: undefined,
      udid: undefined,
      baseURL: undefined
    }, defaults);

    if (!this.defaults.baseURL) {
      this.defaults.baseURL = 'https://ss-app-tls.ais-vidnt.com';
    }

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
    Object.defineProperty(this, 'utils', {
      value: {
        isHex(value) {
          return Boolean(value.toString().match(/^[0-9A-Fa-f]+$/));
        }

      }
    });
  }

  api_key(time) {
    var {
      privateid,
      sid,
      udid,
      publicid
    } = this.defaults;
    return _crypto.default.createHash('md5').update(privateid + sid + udid + publicid + time).digest('hex');
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
          sid,
          privateid,
          udid
        } = _this.defaults;
        var time = Math.floor(new Date().getTime() / 1000).toString();

        var api_key = _this.api_key(time);

        var headers = {
          sid,
          time,
          api_key,
          privateid,
          udid
        };
        var res = yield _this.$http.get(url, {
          headers
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
          sid,
          privateid,
          udid
        } = _this6.defaults;
        var time = Math.floor(new Date().getTime() / 1000).toString();

        var api_key = _this6.api_key(time);

        var headers = {
          sid,
          time,
          api_key,
          privateid,
          udid
        };
        var res = yield _this6.$http.get('/playtemplate/', {
          headers
        });

        if (res.data.error) {
          console.debug("cannot get playtemplate [".concat(res.data.error, "]."));
        } else {
          return res.data;
        }
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

        var item;

        if (_this7.utils.isHex(MID)) {
          try {
            MID = yield _this7.get('item', MID);
          } catch (e) {
            throw new Error('invalid [MID].');
          }
        }

        if (_lodash.default.isObject(MID)) {
          item = MID;

          if (MID.mid) {
            MID = MID.mid;
          } else if (MID.head && MID.head.mid) {
            MID = MID.head.mid;
          } else {
            throw new Error('invalid [MID].');
          }
        }

        var playtemplate = yield _this7.playtemplate();

        if (playtemplate) {
          var info = playtemplate.info[type].replace(/{MID}/g, MID);
          var res = yield _this7.$http.get(info, {
            params: {
              cdn: 'aisvimmi-https'
            }
          });
          return _fastXmlParser.default.parse(res.data);
        } else if (item) {
          console.debug('try to get from media');
          var play = yield _this7.play(item);

          if (play) {
            if (_lodash.default.size(play.media)) {
              var media = _lodash.default.first(play.media);

              if (media.link) {
                var _res = yield _this7.$http.get(media.link, {
                  params: {
                    cdn: 'aisvimmi-https'
                  }
                });

                return _fastXmlParser.default.parse(_res.data);
              } else {
                console.debug('empty media link');
              }
            } else {
              console.debug('empty media');
            }
          } else {
            console.debug('cannot get media play');
          }
        }
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

        var item;

        if (_this8.utils.isHex(MID)) {
          try {
            MID = yield _this8.get('item', MID);
          } catch (e) {
            throw new Error('invalid [MID].');
          }
        }

        if (_lodash.default.isObject(MID)) {
          item = MID;

          if (MID.mid) {
            MID = MID.mid;
          } else if (MID.head && MID.head.mid) {
            MID = MID.head.mid;
          } else {
            throw new Error('invalid [MID].');
          }
        }

        var xml = yield _this8.get_xml(type, item || MID);

        if (xml) {
          var playbackUrl = _lodash.default.first(xml.Metadata.PlaybackUrls.PlaybackUrl);

          return decodeURIComponent(playbackUrl.url);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }

}

exports.default = AISPLay;