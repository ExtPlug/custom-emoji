import Plugin from 'extplug/Plugin'
import Events from 'plug/core/Events'
import $ from 'jquery'

export default Plugin.extend({
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
    const target = $(e.target)
    const emojiId = target.data('emoji-name')
    if (emojiId) {
      Events.trigger('tooltip:show', `:${emojiId}:`, target, true)
    }
  },

  onLeave() {
    Events.trigger('tooltip:hide')
  }
})
