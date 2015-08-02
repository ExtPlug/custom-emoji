define(function (require, exports, module) {

  const Plugin = require('extplug/Plugin')
  const emoji = require('plug/util/emoji')
  const _ = require('underscore')
  const { around } = require('meld')

  const MAX_EMOJI_SUGGESTIONS = 10

  const CustomEmoji = Plugin.extend({
    name: 'Custom Emoji',
    description: 'Shows custom emoji defined by room settings.',

    enable() {
      this.listenTo(this.ext.roomSettings, 'change:emoji', this.update)
      this.listenTo(this.ext.roomSettings, 'change:emotes', this.update)

      // remember the original emoji so we can restore them
      this.originalMap = _.clone(emoji.map)

      // plug.dj does some fancy fast lookup table thing in emoji.lookup,
      // but that doesn't seem particularly useful for a few hundred emoji.
      // so until it is, we'll just use this much simpler version...
      this.advice = around(emoji, 'lookup', joinpoint => {
        let query = joinpoint.args[0].toLowerCase()
        let results = this.emojiNames.filter(key => key.toLowerCase().indexOf(query) === 0)
        return results.sort().slice(0, MAX_EMOJI_SUGGESTIONS)
      })

      this.update()
    },

    disable() {
      this.reset()
      this.advice.remove()
    },

    reset() {
      // the emoji map has to be cleared to be updated, because
      // plug retains a local reference to it. (instead of looking
      // it up on the emoji module object all the time)
      // therefore simply reassigning it doesn't work
      _.each(emoji.map, (v, name) => { delete emoji.map[name] })
      _.extend(emoji.map, this.originalMap)
    },

    update() {
      let custom = this.ext.roomSettings.get('emotes')
                || this.ext.roomSettings.get('emoji')
      this.removeStyles()
      this.reset()
      if (custom) {
        let styles = this.Style()

        _.each(custom, (emote, name) => {
          let id = _.uniqueId('cust-')
          emoji.map[name] = id

          let sel = `.emoji.emoji-${id}`
          if (typeof emote === 'string') {
            styles.set(sel, {
              'background': `url("${emote.replace(/"/g, '\"')}")`,
              'background-position': 'center center',
              'background-size': 'contain',
              'background-repeat': 'no-repeat'
            })
          }
          else if (typeof emote === 'object') {
            if (emote.sheet) {
              styles.set(sel, {
                'background-image': `url("${emote.sheet.replace(/"/g, '\"')}")`,
                'background-position': `${emote.x} ${emote.y}`,
                'background-size': 'contain',
                'background-repeat': 'no-repeat'
              })
            }
            else {
              styles.set(sel, emote)
            }
          }
        })

      }

      this.emojiNames = Object.keys(emoji.map)
    }

  })

  module.exports = CustomEmoji

})
