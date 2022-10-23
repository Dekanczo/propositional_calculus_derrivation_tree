String.prototype.escaping = function() {
  return this.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

String.prototype.isIDSymbol = function(){
  return /^[A-Z\d]$/i.test(this);
}
