

define('extplug/custom-emoji/main',['require','exports','module','extplug/Plugin','plug/util/emoji','underscore','meld'],function (require, exports, module) {

  var Plugin = require('extplug/Plugin');
  var emoji = require('plug/util/emoji');
  var _ = require('underscore');

  var _require = require('meld');

  var around = _require.around;

  var MAX_EMOJI_SUGGESTIONS = 10;

  var CustomEmoji = Plugin.extend({
    name: 'Custom Emoji',
    description: 'Shows custom emoji defined by room settings.',

    enable: function enable() {
      var _this = this;

      this._super();
      this.ext.roomSettings.on('change:emoji', this.update, this).on('change:emotes', this.update, this);

      // remember the original emoji so we can restore them
      this.originalMap = _.clone(emoji.map);

      // plug.dj does some fancy fast lookup table thing in emoji.lookup,
      // but that doesn't seem particularly useful for a few hundred emoji.
      // so until it is, we'll just use this much simpler version...
      this.advice = around(emoji, 'lookup', function (joinpoint) {
        var query = joinpoint.args[0].toLowerCase();
        var results = _this.emojiNames.filter(function (key) {
          return key.toLowerCase().indexOf(query) === 0;
        });
        return results.sort().slice(0, MAX_EMOJI_SUGGESTIONS);
      });

      this.update();
    },

    disable: function disable() {
      this.ext.roomSettings.off('change:emoji', this.update);
      this.reset();
      this.advice.remove();
      this._super();
    },

    reset: function reset() {
      // the emoji map has to be cleared to be updated, because
      // plug retains a local reference to it. (instead of looking
      // it up on the emoji module object all the time)
      // therefore simply reassigning it doesn't work
      _.each(emoji.map, function (v, name) {
        delete emoji.map[name];
      });
      _.extend(emoji.map, this.originalMap);
    },

    update: function update() {
      var _this2 = this;

      var custom = this.ext.roomSettings.get('emotes') || this.ext.roomSettings.get('emoji');
      this.removeStyles();
      this.reset();
      if (custom) {
        (function () {
          var styles = _this2.Style();

          _.each(custom, function (emote, name) {
            var id = _.uniqueId('cust-');
            emoji.map[name] = id;

            var sel = '.emoji.emoji-' + id;
            if (typeof emote === 'string') {
              styles.set(sel, {
                'background': 'url("' + emote.replace(/"/g, '"') + '")',
                'background-position': 'center center',
                'background-size': 'contain',
                'background-repeat': 'no-repeat'
              });
            } else if (typeof emote === 'object') {
              if (emote.sheet) {
                styles.set(sel, {
                  'background-image': 'url("' + emote.sheet.replace(/"/g, '"') + '")',
                  'background-position': '' + emote.x + ' ' + emote.y,
                  'background-size': 'contain',
                  'background-repeat': 'no-repeat'
                });
              } else {
                styles.set(sel, emote);
              }
            }
          });
        })();
      }

      this.emojiNames = Object.keys(emoji.map);
    }

  });

  module.exports = CustomEmoji;
});
