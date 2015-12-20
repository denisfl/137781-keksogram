'use strict';

(function() {

  function Photo(data) {
    this._data = data;
  }

  Photo.prototype.render = function() {
    var template = document.querySelector('#picture-template');

    if ('content' in template) {
      this.element = template.content.children[0].cloneNode(true);
    } else {
      this.element = template.children[0].cloneNode(true);
    }

    this.element.querySelector('.picture-comments').textContent = this._data.comments;
    this.element.querySelector('.picture-likes').textContent = this._data.likes;

    var backgroundImage = new Image();
    var IMAGE_TIMEOUT = 10000;

    var imageLoadTimeout = setTimeout(function() {
      backgroundImage.src = '';
      this.element.classList.add('picture-load-failure');
    }, IMAGE_TIMEOUT);

    backgroundImage.onload = function() {
      clearTimeout(imageLoadTimeout);
      this.element.querySelector('img').setAttribute('src', '/' + this._data.url);
    }.bind(this);

    backgroundImage.onerror = function() {
      this.element.classList.add('picture-load-failure');
    }.bind(this);

    backgroundImage.src = '/' + this._data.url;
  };

  window.Photo = Photo;
})();
