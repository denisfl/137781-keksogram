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

    this._onPhotoClick = this._onPhotoClick.bind(this);
    this._onCloseBtnClick = this._onCloseBtnClick.bind(this);
    this._onDocumentKeyDown = this._onDocumentKeyDown.bind(this);
  };

  /**
   * Показ галереи
   * @override
   */
  Gallery.prototype.show = function() {
    this.element.classList.remove('invisible');

    this._closeBtn.addEventListener('click', this._onCloseBtnClick);
    window.addEventListener('keyup', this._onDocumentKeyDown);
  };

  /**
   * Скрытие галереи
   */
  Gallery.prototype.hide = function() {
    this.element.classList.add('invisible');
    this._closeBtn.removeEventListener('click', this._onPhotoClick);
    window.removeEventListener('keyup', this._onDocumentKeyDown);
  };

  /**
   * Обработчик клика по кнопке "Х"
   * @private
   */
  Gallery.prototype._onCloseBtnClick = function() {
    this.hide();
  };

  /**
   * Обработчик клика по одной из фотографий
   * @override
   */
  Gallery.prototype._onPhotoClick = function() {

  };

  /**
   * Обработчик клика по Esc
   * @private
   */
  Gallery.prototype._onDocumentKeyDown = function(event) {
    if (event.keyCode === 27) {
      this.hide();
    }
  };

  window.Gallery = Gallery;
})();
