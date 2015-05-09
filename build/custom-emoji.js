

define('extplug/custom-emoji/main',['require','exports','module','extplug/Plugin','plug/util/emoji','underscore','meld'],function (require, exports, module) {

  var Plugin = require('extplug/Plugin');
  var emoji = require('plug/util/emoji');
  var _ = require('underscore');

  var _require = require('meld');

  var around = _require.around;

  var CustomEmoji = Plugin.extend({
    name: 'Custom Emoji',
    description: 'Shows custom emoji defined by room settings.',

    enable: function enable() {
      this._super();
      this.ext.roomSettings.on('change:emoji', this.update, this);
      this.originalMap = _.clone(emoji.map);
      this.advice = around(emoji, 'lookup', function (joinpoint) {
        var query = joinpoint.args[0].toLowerCase();
        var results = Object.keys(emoji.map).filter(function (key) {
          return key.toLowerCase().indexOf(query) === 0;
        });
        return results.sort().slice(0, 10);
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
      var _this = this;

      var custom = this.ext.roomSettings.get('emoji');
      this.removeStyles();
      this.reset();
      if (custom) {
        (function () {
          var styles = _this.Style();

          _.each(custom, function (emote, name) {
            var id = _.uniqueId('cust-');
            emoji.map[name] = id;

            var sel = '.emoji.emoji-' + id;
            if (typeof emote === 'string') {
              styles.set(sel, {
                background: 'url("' + emote.replace(/"/g, '"') + '")',
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
    }

  });

  module.exports = CustomEmoji;
});
