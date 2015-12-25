/**
 * @fileoverview
 * @author Denis FL (denisfl)
 */

'use strict';

(function() {
  /**
   * @constructor
   */
  function Photo(data) {
    this._data = data;
    this._onClick = this._onClick.bind(this);
  }

  /**
   * Рендер фотографии
   * @override
   */
  Photo.prototype.render = function(container) {
    var template = document.querySelector('#picture-template');

    if ('content' in template) {
      this.element = template.content.children[0].cloneNode(true);
    } else {
      this.element = template.children[0].cloneNode(true);
    }

    this.element.querySelector('.picture-comments').textContent = this._data.comments;
    this.element.querySelector('.picture-likes').textContent = this._data.likes;

    /**
     * @type {Image}
     */
    var backgroundImage = new Image();

    /**
     * Константа таймаута
     * @const
     * @type {number}
     */
    var IMAGE_TIMEOUT = 10000;

    var imageLoadTimeout = setTimeout(function() {
      backgroundImage.src = '';
      this.element.classList.add('picture-load-failure');
    }.bind(this), IMAGE_TIMEOUT);

    backgroundImage.onload = function() {
      clearTimeout(imageLoadTimeout);
      this.element.querySelector('img').setAttribute('src', '/' + this._data.url);
    }.bind(this);

    backgroundImage.onerror = function() {
      this.element.classList.add('picture-load-failure');
    }.bind(this);

    backgroundImage.src = '/' + this._data.url;

    if (container) {
      container.appendChild(this.element);
      this.container = container;
    }

    this.element.addEventListener('click', this._onClick);
  };

  Photo.prototype.remove = function() {
    if (this.container) {
      this.container.removeChild(this.element);
      this.container = null;
    }

    this.element.removeEventListener('click', this._onClick);
  };

  Photo.prototype._onClick = function(event) {
    event.preventDefault();
    if (event.srcElement && !this.element.classList.contains('picture-load-failure')) {
      if (typeof this.onGalleryClick === 'function') {
        this.onGalleryClick();
      }
    }
  };

  Photo.prototype.onGalleryClick = null;

  window.Photo = Photo;
})();
