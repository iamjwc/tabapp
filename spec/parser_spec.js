describe("Serializers.MeasureSerializer", function() {
  var tab;
  var measure;

  describe("serializing empty measure", function() {
    beforeEach(function() {
      var column = new Column;
      measure = new Measure;
      measure.get('columns').add(column);
      
      tab = new Tab({
        numberOfStrings: 2,
        measures: [measure],
      });
    });

    it("should output an empty measure", function() {
      pending();
      var output = Serializers.MeasureSerializer.toString(measure);

      expect(output).toEqual([
        " + - ",
        "-----",
        "-----",
      ].join("\n"));
    });
  });


});
