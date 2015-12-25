/**
 * @fileoverview
 * @author Denis FL (denisfl)
 */

'use strict';

(function() {
  /**
   * @constructor
   */
  var Gallery = function() {
    this.element = document.querySelector('.gallery-overlay');
    this._closeBtn = document.querySelector('.gallery-overlay-close');
    this._data = null;

    this._onPhotoClick = this._onPhotoClick.bind(this);
    this._onCloseBtnClick = this._onCloseBtnClick.bind(this);
    this._onDocumentKeyDown = this._onDocumentKeyDown.bind(this);
  };

  /**
   * Показ галереи
   * @override
   */
  Gallery.prototype.render = function() {
    this.element.classList.remove('invisible');
    // var thumbnailsContainer = this.element.querySelector('.gallery-overlay-image');

    // this._data.getPictures().forEach(function(pic) {
    //   var picture = new Image();
    //   picture.src = pic;
    //   thumbnailsContainer.appendChild(picture);
    // }, this);

    this.setCurrentImage(0);

    this._closeBtn.addEventListener('click', this._onCloseBtnClick);
    window.addEventListener('keyup', this._onDocumentKeyDown);
  };

  /**
   * Скрытие галереи
   */
  Gallery.prototype.remove = function() {
    this.element.classList.add('invisible');
    this._closeBtn.removeEventListener('click', this._onPhotoClick);
    window.removeEventListener('keyup', this._onDocumentKeyDown);
  };

  /**
   * Обработчик клика по кнопке "Х"
   * @private
   */
  Gallery.prototype._onCloseBtnClick = function() {
    this.remove();
  };

  /**
   * Обработчик клика по одной из фотографий
   * @override
   */
  Gallery.prototype._onPhotoClick = function() {
    console.log(this._data);
  };

  /**
   * Обработчик клика по Esc
   * @private
   */
  Gallery.prototype._onDocumentKeyDown = function(event) {
    if (event.keyCode === 27) {
      this.remove();
    }
  };

  Gallery.prototype.setCurrentImage = function(i) {
    var image = new Image();
    image.src = this._data.getPictures()[i];

    var previewContainer = this.element.querySelector('.gallery-overlay-image');
    while (previewContainer.firstChild) {
      previewContainer.removeChild(previewContainer.firstChild);
    }

    previewContainer.appendChild(image);
  };

  window.Gallery = Gallery;
})();
