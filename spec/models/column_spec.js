describe("Column", function() {
  var column;

  beforeEach(function() {
    column = new Column
  });

  describe("#notesAtSubdivision", function() {
    it("should return an empty collection when there are no notes", function() {
      expect(column.notesAtSubdivision(0).length).toBe(0)
    });

    it("should return only the notes at that subdivision", function() {
      var incorrectNote = new Note({localPosition: 0});
      var correctNote = new Note({localPosition: 1});

      column.get('notes').add(incorrectNote);
      column.get('notes').add(correctNote);

      expect(column.notesAtSubdivision(1).length).toBe(1);
      expect(column.notesAtSubdivision(1)[0]).toBe(correctNote);
    });
  });
});
