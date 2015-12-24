'use strict';

(function() {
  var Gallery = function() {
    this.element = document.querySelector('.gallery-overlay');
    this._closeBtn = document.querySelector('.gallery-overlay-close');

    this._onPhotoClick = this._onPhotoClick.bind(this);
    this._onCloseBtnClick = this._onCloseBtnClick.bind(this);
    this._onDocumentKeyDown = this._onDocumentKeyDown.bind(this);
  };

  Gallery.prototype.show = function() {
    this.element.classList.remove('invisible');

    this._closeBtn.addEventListener('click', this._onCloseBtnClick);
    window.addEventListener('keyup', this._onDocumentKeyDown);
  };

  Gallery.prototype.hide = function() {
    this.element.classList.add('invisible');
    this._closeBtn.removeEventListener('click', this._onPhotoClick);
    window.removeEventListener('keyup', this._onDocumentKeyDown);
  };

  Gallery.prototype._onCloseBtnClick = function() {
    this.hide();
  };

  Gallery.prototype._onPhotoClick = function() {

  };

  Gallery.prototype._onDocumentKeyDown = function(event) {
    if (event.keyCode === 27) {
      this.hide();
    }
  };

  window.Gallery = Gallery;
})();
