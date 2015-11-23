'use strict';
(function() {
  var container = document.querySelector('.pictures');

  pictures.forEach(function(picture) {
    var element = getElemtentFromTemplate(picture);
    container.appendChild(element);
  });

  function getElemtentFromTemplate(data) {
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
    backgroundImage.onload = function() {
      element.style.backgroundImage = 'url(\'' + backgroundImage + ')';
    };
    backgroundImage.onerror = function() {
      element.classList.add('picture-load-failure');
    };

    backgroundImage.src = '/' + data.url;

    return element;
  }
})();
