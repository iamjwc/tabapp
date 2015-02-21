describe("Note", function() {
  var note;

  beforeEach(function() {
    note = new Note
  });


  describe("#validations", function() {
    var validAttributes;

    beforeEach(function() {
      validAttributes = {
        localPosition: 0,
        fret: 10
      };
    });

    it("should allow notes created within the length of the number of SUBDIVISIONS in a column", function() {
      var correctNote = new Note(validAttributes);

      expect(correctNote.isValid()).toBe(true)
    });

    it("should not allow notes created past the length of the number of SUBDIVISIONS in a column", function() {
      var incorrectNote = new Note(_(validAttributes).extend({
        localPosition: Column.SUBDIVISIONS
      }));

      expect(incorrectNote.isValid()).toBe(false)
    });
  });
});
