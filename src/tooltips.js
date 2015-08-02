define(function (require, exports, module) {

  const Plugin = require('extplug/Plugin')
  const Events = require('plug/core/Events')
  const $ = require('jquery')

  const Tooltips = Plugin.extend({
    name: 'Emoji Tooltips',
    description: 'Shows emoji names on hover',

    map: {},

    enable() {
      $(document)
        .on('mouseenter.extplug.customemoji', '.emoji', this.onEnter.bind(this))
        .on('mouseleave.extplug.customemoji', '.emoji', this.onLeave.bind(this))
    },

    disable() {
      $(document).off('.extplug.customemoji')
    },

    onEnter(e) {
      let target = $(e.target)
      let emojiId = target.attr('class').match(/emoji-(\S+)/)
      this.debug(emojiId, emojiId&& emojiId[1] in this.map)
      if (emojiId && this.map && emojiId[1] in this.map) {
        Events.trigger('tooltip:show', `:${this.map[emojiId[1]]}:`, target, true)
      }
    },
    onLeave() {
      Events.trigger('tooltip:hide')
    }
  })

  module.exports = Tooltips

})
