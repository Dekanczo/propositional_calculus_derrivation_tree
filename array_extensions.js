Array.prototype.findIndexFrom = function(predicate, start, end = this.length - 1) {
  const safelyStart = start < 0 ? 0 : start;
  const safelyEnd = end >= this.length ? this.length - 1 : end;

  for (let i = safelyStart; i <= safelyEnd; i++)
    if (predicate(this[i]))
      return i;
  
  return -1;
}

Array.prototype.findWhile = function(predicate, start, end = this.length - 1) {
  const safelyStart = start < 0 ? 0 : start;
  const safelyEnd = end >= this.length ? this.length - 1 : end;

  for (let i = safelyStart; i <= safelyEnd; i++) {
    if (!predicate(this[i]))
      return i;
  }
   
  return end + 1;
}

Array.prototype.joins = function(sep) {
  if (!this)
    return null;

  const result = [this[0]];
  for (let i = 1; i < this.length; i++) {
    result.push(sep);
    result.push(this[i]);
  }

  return result;
}