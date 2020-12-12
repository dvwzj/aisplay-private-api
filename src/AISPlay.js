import util from 'util'
import _ from 'lodash'
import { ReqFastPromise } from 'req-fast-promise'
import xmlParser from 'fast-xml-parser'

export default class AISPLay {
    constructor(defaults) {
        this.defaults = _.defaults({
            privateid: undefined,
            udid: undefined,
            baseURL: 'https://ss-app-tls.ais-vidnt.com',
        }, defaults)
        if (!this.defaults.privateid) {
            throw new Error('[privateid] is required.')
        }
        if (!this.defaults.udid) {
            throw new Error('[udid] is required.')
        }
        Object.defineProperty(this.defaults, 'sid', {
            get() {
                return `${this.privateid.replace(/(\+|=|\/)/g, '')}_${this.udid}`.toLowerCase()
            }
        })
        Object.defineProperty(this, '$http', {
            value: new ReqFastPromise({
                baseURL: this.defaults.baseURL,
            }),
        })
        Object.defineProperty(this, 'console', {
            value: (() => {
                const $console = _.clone(console)
                $console.inspect = (object) => {
                    console.log(util.inspect(object, false, null, true))
                }
                return $console
            })()
        })
    }
    async get(type, item) {
        try {
            if (!type) {
                throw new Error('[type] is required.')
            }
            if (!item) {
                throw new Error('[item] is required.')
            }
            type = type.toLowerCase()
            if (_.isObject(item)) {
                if (item.head) {
                    item = item.head
                }
                if (type === 'item') {
                    type = 'link'
                }
                if (type === 'play') {
                    type = 'media'
                }
            }
            let url
            if (_.isObject(item) && item[type]) {
                url = item[type]
            } else if (_.includes(['section', 'item', 'seasons'], type) && _.isString(item)) {
                url = `/get_${type}/${item}/`
            }
            const { sid } = this.defaults
            const time = Math.floor(new Date().getTime() / 1000).toString()
            const res = await this.$http.get(url, {
                headers: {
                    sid,
                    time,
                }
            })
            return res.data
        } catch (e) {
            console.error(e)
        }
    }
    async get_section(sectionId) {
        try {
            if (!sectionId) {
                throw new Error('[sectionId] is required.')
            }
            const section = await this.get('section', sectionId)
            return section
        } catch (e) {
            console.error(e)
        }
    }
    
    async get_item(itemId) {
        try {
            if (!itemId) {
                throw new Error('[itemId] is required.')
            }
            const item = await this.get('item', itemId)
            return item
        } catch (e) {
            console.error(e)
        }
    }
    async get_seasons(seasonId) {
        try {
            if (!seasonId) {
                throw new Error('[seasonId] is required.')
            }
            const seasons = await this.get('seasons', seasonId)
            return seasons
        } catch (e) {
            console.error(e)
        }
    }
    async play(itemId) {
        try {
            if (!itemId) {
                throw new Error('[itemId] is required.')
            }
            const play = await this.get('play', itemId)
            return play
        } catch (e) {
            console.error(e)
        }
    }
    async playtemplate() {
        try {
            const { sid } = this.defaults
            const time = Math.floor(new Date().getTime() / 1000).toString()
            const headers = {
                sid,
                time,
            }
            const res = await this.$http.get('/playtemplate/', {
                headers,
            })
            if (!res.data.info) {
                throw new Error('cannot get playtemplate')
            }
            return res.data
        } catch (e) {
            console.error(e)
        }
    }
    async get_xml(type, MID) {
        try {
            if (!type) {
                throw new Error('[type] is required.')
            }
            if (!_.includes(['live', 'vod', 'ugc'], type.toLowerCase())) {
                throw new Error('invalid [type], only "live", "vod" or "ugc" is allowed.')
            }
            if (!MID) {
                throw new Error('[MID] is required.')
            }
            const playtemplate = await this.playtemplate()
            const info = playtemplate.info[type].replace(/{MID}/g, MID)
            const res = await this.$http.get(info)
            return xmlParser.parse(res.data)
        } catch (e) {
            console.error(e)
        }
    }
    async source(type, MID) {
        try {
            if (!type) {
                throw new Error('[type] is required.')
            }
            if (!_.includes(['live', 'vod', 'ugc'], type.toLowerCase())) {
                throw new Error('invalid [type], only "live", "vod" or "ugc" is allowed.')
            }
            if (!MID) {
                throw new Error('[MID] is required.')
            }
            if (_.isObject(MID)) {
                if (MID.mid) {
                    MID = MID.mid
                } else if (MID.head && MID.head.mid) {
                    MID = MID.head.mid
                } else {
                    throw new Error('invalid [MID].')
                }
            }
            const xml = await this.get_xml(type, MID)
            const playbackUrl = _.first(xml.Metadata.PlaybackUrls.PlaybackUrl)
            return decodeURIComponent(playbackUrl.url)
        } catch (e) {
            console.error(e)
        } 
    }
}