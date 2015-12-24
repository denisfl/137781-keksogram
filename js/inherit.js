'use strict';

(function() {
  function inherit(child, parent) {
    var Child = child;
    Child.prototype = new Parent();

    var Parent = parent;
    Parent.prototype = {};
  }

  window.inherit = inherit;
})();
