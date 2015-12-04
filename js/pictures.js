'use strict';
(function() {
  var container = document.querySelector('.pictures');
  var pictures = [];
  var filters = document.querySelector('.filters');
  var activeFilter = 'filter-popular';
  var filteredPictures = [];

  filters.addEventListener('click', function(event) {
    var clickedElement = event.target;
    if (clickedElement.classList.contains('filters-item')) {
      setActiveFilter(clickedElement.control.id);
    }
  });

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

  function setErrorXHRLoad() {
    container.classList.remove('pictures-loading');
    container.classList.add('pictures-failure');
  }

  getPictures();

  function updateLoadedPictures(loadedPictures) {
    pictures = loadedPictures;

    setActiveFilter();
  }

  function setActiveFilter(id) {
    if (activeFilter === id) {
      return;
    }

    filteredPictures = pictures.slice(0);

    switch (id) {
      case 'filter-popular':
        filteredPictures = pictures;
        break;
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
    renderPictures(filteredPictures);
    activeFilter = id;
  }

  function renderPictures() {
    container.innerHTML = '';

    filteredPictures.forEach(function(picture) {
      var element = getElementFromTemplate(picture);
      container.appendChild(element);
    });
  }

  function getElementFromTemplate(data) {
    var template = document.querySelector('#picture-template');
    var element;

    if ('content' in template) {
      element = template.content.children[0].cloneNode(true);
    } else {
      element = template.children[0].cloneNode(true);
    }

    element.querySelector('.picture-comments').textContent = data.comments;
    element.querySelector('.picture-likes').textContent = data.likes;

    var backgroundImage = new Image();
    var IMAGE_TIMEOUT = 10000;

    var imageLoadTimeout = setTimeout(function() {
      backgroundImage.src = '';
      element.classList.add('picture-load-failure');
    }, IMAGE_TIMEOUT);

    backgroundImage.onload = function() {
      clearTimeout(imageLoadTimeout);
      element.querySelector('img').setAttribute('src', '/' + data.url);
    };

    backgroundImage.onerror = function() {
      element.classList.add('picture-load-failure');
    };

    backgroundImage.src = '/' + data.url;

    return element;
  }
})();
