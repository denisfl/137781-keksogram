/* global Photo: true, Gallery: true */

/**
 * @fileoverview
 * @author Denis FL (denisfl)
 */

'use strict';
(function() {
  var container = document.querySelector('.pictures');
  var pictures = [];
  var filters = document.querySelector('.filters');
  var activeFilter = 'filter-popular';
  var filteredPictures = [];
  var PAGE_SIZE = 12;
  var currentPage = 0;
  var gallery = new Gallery();
  var renderedPhotos = [];

  /**
   * @event
   * @param {Boolean}
   */
  filters.addEventListener('click', function(event) {
    var clickedElement = event.target;
    if (clickedElement.classList.contains('filters-item')) {
      setActiveFilter(clickedElement.control.id);
    }
  });

  var scrollTimeout;

  /**
   * Слушаем скролл. По скроллу очищаем таймаут и
   * запускаем проверку высоты окна
   * @event
   */
  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    checkWindowsHeight();
  });

  /**
   * Проверяем высоту окна по таймауту
   * @param {number} scrollHeight
   */
  function checkWindowsHeight() {
    var scrollHeight = Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight,
      document.body.clientHeight, document.documentElement.clientHeight
    );
    scrollTimeout = setTimeout(function() {

      if (document.body.scrollTop >= scrollHeight - window.innerHeight) {
        if (currentPage < Math.ceil(filteredPictures.length / PAGE_SIZE)) {
          renderPictures(filteredPictures, ++currentPage);
        }
      }
    }, 100);
  }

  /**
   * Запускаем проверку высоты окна
   */
  checkWindowsHeight();

  /**
   * Загружаем списка фотографий
   */
  function getPictures() {
    var xhr = new XMLHttpRequest();
    container.classList.add('pictures-loading');

    xhr.open('GET', './data/pictures.json');
    xhr.onload = function(event) {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          var data = event.target.response;
          var loadedPictures = JSON.parse(data);
          container.classList.remove('pictures-loading');
          updateLoadedPictures(loadedPictures);
        } else {
          setErrorXHRLoad();
          return;
        }
      }
    };
    xhr.send();

    xhr.timeout = 1000;
    xhr.ontimeout = function() {
      setErrorXHRLoad();
    };
  }

  /**
   * Визуализация ошибки в случае неудачной загрузки фотографии
   */
  function setErrorXHRLoad() {
    container.classList.remove('pictures-loading');
    container.classList.add('pictures-failure');
  }

  getPictures();

  /**
   * Сохранение массива фотографий в переменную pictures, вызов фильтрации и отрисовки.
   * @param {Array.<Object>} loadedPictures
   */
  function updateLoadedPictures(loadedPictures) {
    pictures = loadedPictures;

    setActiveFilter();
  }

  /**
   * Отрисовка списка фотографий.
   * @param {Array.<Object>} picturesToRender
   * @param {number} pageNumber
   * @param {boolean=} replace
   */
  function renderPictures(picturesToRender, pageNumber, replace) {
    if (replace) {
      var el;
      while ((el = renderedPhotos.shift())) {
        el.remove();
        el.onGalleryClick = null;
      }
    }

    var fragment = document.createDocumentFragment();
    var from = pageNumber * PAGE_SIZE;
    var to = from + PAGE_SIZE;

    var pagePictures = picturesToRender.slice(from, to);

    renderedPhotos = renderedPhotos.concat(pagePictures.map(function(photo) {
      var photoElement = new Photo(photo);
      photoElement.render(container);
      photoElement.onGalleryClick = function() {
        gallery.data = photoElement._data;
        gallery.render();
      };
    }));

    container.appendChild(fragment);
  }

  /**
   * Установка выбранного фильтра
   * @param {string} id
   */
  function setActiveFilter(id) {
    if (activeFilter === id) {
      return;
    }

    filteredPictures = pictures.slice(0);

    switch (id) {
      case 'filter-new':
        filteredPictures = filteredPictures.filter(function(i) {
          return new Date(i.date) >= new Date('2015-10-01');
        });
        filteredPictures = filteredPictures.sort(function(a, b) {
          return b.date - a.date;
        });
        break;
      case 'filter-discussed':
        filteredPictures = filteredPictures.sort(function(a, b) {
          return b.comments - a.comments;
        });
        break;
    }

    currentPage = 0;
    renderPictures(filteredPictures, currentPage, true);
    activeFilter = id;
  }
})();
