var MultilineString = function(lines) {
  this.lines = lines;
};
MultilineString.fromString = function(string) {
  return new MultilineString(string.split("\n"));
};

MultilineString.prototype.add = function(rhs) {
  var newLines = [];
  for (var i in this.lines) {
    newLines[i] = [this.lines[i], rhs.lines[i]].join("");
  }

  return new MultilineString(newLines);
}

MultilineString.prototype.substring = function(start, end) {
  var newLines = [];
  for (var i in this.lines) {
    newLines[i] = this.lines[i].substring(start, end);
  }

  return new MultilineString(newLines);
};

MultilineString.prototype.replace = function(regexp, string) {
  var newLines = [];
  for (var i in this.lines) {
    newLines[i] = this.lines[i].replace(regexp, string);
  }

  return new MultilineString(newLines);
};

MultilineString.prototype.split = function(string) {
  var newLines = [];
  for (var i in this.lines) {
    newLines[i] = this.lines[i].split(string);
  }

  return _(_.zip.apply(_, newLines)).map(function(l) {
    return new MultilineString(l);
  });
};

MultilineString.prototype.toString = function() {
  return this.lines.join("\n");
};

