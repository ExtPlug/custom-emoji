define(function (require, exports, module) {

  const Plugin = require('extplug/Plugin')
  const Events = require('plug/core/Events')
  const $ = require('jquery')

  const Tooltips = Plugin.extend({
    name: 'Emoji Tooltips',
    description: 'Shows emoji names on hover',

    enable() {
      $(document)
        .on('mouseenter.extplug.customemoji', '.emoji-inner', this.onEnter.bind(this))
        .on('mouseleave.extplug.customemoji', '.emoji-inner', this.onLeave.bind(this))
    },

    disable() {
      $(document).off('.extplug.customemoji')
    },

    onEnter(e) {
      let target = $(e.target)
      let emojiId = target.data('emoji-name')
      if (emojiId) {
        Events.trigger('tooltip:show', `:${emojiId}:`, target, true)
      }
    },
    onLeave() {
      Events.trigger('tooltip:hide')
    }
  })

  module.exports = Tooltips

})
