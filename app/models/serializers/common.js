Serializers = {}

/* Provides common helpers for creating a serialized tab.
 */
Serializers.Common = {
  repeatString: function(string, times) {
    // http://stackoverflow.com/questions/202605/repeat-string-javascript
    return new Array(times + 1).join(string);
  },
}
