/* global Resizer: true */

/**
 * @fileoverview
 * @author Igor Alexeenko (o0)
 */

'use strict';

(function() {
  /** @enum {string} */
  var FileType = {
    'GIF': '',
    'JPEG': '',
    'PNG': '',
    'SVG+XML': ''
  };

  /** @enum {number} */
  var Action = {
    ERROR: 0,
    UPLOADING: 1,
    CUSTOM: 2
  };

  /**
   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
   * из ключей FileType.
   * @type {RegExp}
   */
  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

  /**
   * @type {Object.<string, string>}
   */
  var filterMap;

  /**
   * Объект, который занимается кадрированием изображения.
   * @type {Resizer}
   */
  var currentResizer;

  /**
   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
   * изображением.
   */
  function cleanupResizer() {
    if (currentResizer) {
      currentResizer.remove();
      currentResizer = null;
    }
  }

  /**
   * Ставит одну из трех случайных картинок на фон формы загрузки.
   */
  function updateBackground() {
    var images = [
      'img/logo-background-1.jpg',
      'img/logo-background-2.jpg',
      'img/logo-background-3.jpg'
    ];

    var backgroundElement = document.querySelector('.upload');
    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
  }

  var submitButton = document.getElementById('resize-fwd');
  var xInputValue = document.getElementById('resize-x');
  var yInputValue = document.getElementById('resize-y');
  var sizeInputValue = document.getElementById('resize-size');

  /**
   * Проверяет, валидны ли данные, в форме кадрирования.
   * @return {boolean}
   */
  function resizeFormIsValid() {
    var resultCheckForm;
    var xCount = parseInt(xInputValue.value, 10);
    var yCount = parseInt(yInputValue.value, 10);
    var sizeCount = parseInt(sizeInputValue.value, 10);
    if (xCount >= 0 &&
        yCount >= 0 &&
        sizeCount >= 0 &&
        (xCount + sizeCount <= currentResizer._image.naturalWidth) &&
        (yCount + sizeCount <= currentResizer._image.naturalHeight)) {
      submitButton.removeAttribute('disabled');
      resultCheckForm = true;
    } else {
      submitButton.setAttribute('disabled', 'true');
      resultCheckForm = false;
    }
    return resultCheckForm;
  }

  /**
   * Слушаем изменения инпутов
   * @event
   */
  xInputValue.addEventListener('change', setResizeParams);
  yInputValue.addEventListener('change', setResizeParams);
  sizeInputValue.addEventListener('change', setResizeParams);

  /**
   * Слушаем ресайз окна
   * @event
   */
  window.addEventListener('resizerchange', getResizeParams);

  /**
   * Получаем значения смещения для инпутов
   */
  function getResizeParams() {
    var param = currentResizer.getConstraint();

    xInputValue.value = (param.x >= 0) ? param.x : 0;
    yInputValue.value = (param.y >= 0) ? param.y : 0;
    sizeInputValue.value = (param.side >= 0) ? param.side : 0;
  }

  /**
   * Устанавливаем значения для инпутов
   */
  function setResizeParams() {
    if (resizeFormIsValid() === true) {
      currentResizer.setConstraint(+xInputValue.value, +yInputValue.value, +sizeInputValue.value);
    }
  }

  /**
   * Форма загрузки изображения.
   * @type {HTMLFormElement}
   */
  var uploadForm = document.forms['upload-select-image'];

  /**
   * Форма кадрирования изображения.
   * @type {HTMLFormElement}
   */
  var resizeForm = document.forms['upload-resize'];

  /**
   * Форма добавления фильтра.
   * @type {HTMLFormElement}
   */
  var filterForm = document.forms['upload-filter'];

  /**
   * @type {HTMLImageElement}
   */
  var filterImage = filterForm.querySelector('.filter-image-preview');

  /**
   * @type {HTMLElement}
   */
  var uploadMessage = document.querySelector('.upload-message');

  var filterFromCookies = docCookies.getItem('filterImagePreview') || '';

  /**
   * @param {Action} action
   * @param {string=} message
   * @return {Element}
   */
  function showMessage(action, message) {
    var isError = false;

    switch (action) {
      case Action.UPLOADING:
        message = message || 'Кексограмим&hellip;';
        break;

      case Action.ERROR:
        isError = true;
        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
        break;
    }

    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
    uploadMessage.classList.remove('invisible');
    uploadMessage.classList.toggle('upload-message-error', isError);
    return uploadMessage;
  }

  function hideMessage() {
    uploadMessage.classList.add('invisible');
  }

  /**
   * Вычисляем количество дней, прошедшее с моего ближайшего дня рождения
   */
  function getDate() {
    var today = new Date();
    var myBithday = new Date(today.getFullYear() + ' september 22');
    var msDay = 60 * 60 * 24 * 1000;
    var dateToExpire = +Date.now() + Math.floor((today - myBithday) / msDay) * 24 * 60 * 60 * 1000;
    return new Date(dateToExpire).toUTCString();
  }

  /**
   * Выбираем нужный фильтр
   * Вынес из функции filterForm.onchange, чтобы можно было переиспользовать
   * для сохранения в cookie
   */
  function getFilter() {
    if (!filterMap) {
      // Ленивая инициализация. Объект не создается до тех пор, пока
      // не понадобится прочитать его в первый раз, а после этого запоминается
      // навсегда.
      filterMap = {
        'none': 'filter-none',
        'chrome': 'filter-chrome',
        'sepia': 'filter-sepia'
      };
    }

    var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
      return item.checked;
    })[0].value;

    return filterMap[selectedFilter];
  }

  /**
   * Обработчик изменения изображения в форме загрузки. Если загруженный
   * файл является изображением, считывается исходник картинки, создается
   * Resizer с загруженной картинкой, добавляется в форму кадрирования
   * и показывается форма кадрирования.
   * @param {Event} evt
   */
  uploadForm.addEventListener('change', function(evt) {
    var element = evt.target;
    if (element.id === 'upload-file') {
      // Проверка типа загружаемого файла, тип должен быть изображением
      // одного из форматов: JPEG, PNG, GIF или SVG.
      if (fileRegExp.test(element.files[0].type)) {
        var fileReader = new FileReader();

        showMessage(Action.UPLOADING);

        fileReader.addEventListener('load', function() {
          cleanupResizer();

          currentResizer = new Resizer(fileReader.result);
          currentResizer.setElement(resizeForm);
          uploadMessage.classList.add('invisible');

          uploadForm.classList.add('invisible');
          resizeForm.classList.remove('invisible');

          hideMessage();
        });

        fileReader.readAsDataURL(element.files[0]);
      } else {
        // Показ сообщения об ошибке, если загружаемый файл, не является
        // поддерживаемым изображением.
        showMessage(Action.ERROR);
      }
    }
  });

  /**
   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
   * и обновляет фон.
   * @param {Event} evt
   */
  resizeForm.addEventListener('reset', function(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();

    resizeForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  });

  /**
   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
   * кропнутое изображение в форму добавления фильтра и показывает ее.
   * @param {Event} evt
   */
  resizeForm.addEventListener('submit', function(evt) {
    evt.preventDefault();

    if (resizeFormIsValid()) {
      filterImage.src = currentResizer.exportImage().src;

      resizeForm.classList.add('invisible');
      filterForm.classList.remove('invisible');

      filterImage.classList.add(filterFromCookies);

      for (var i = 0; i < filterForm['upload-filter'].length; i++) {
        filterForm['upload-filter'][i].removeAttribute('checked');
      }
      document.getElementById('upload-' + filterFromCookies).setAttribute('checked', '');
    }
  });

  /**
   * Сброс формы фильтра. Показывает форму кадрирования.
   * @param {Event} evt
   */
  filterForm.addEventListener('reset', function(evt) {
    evt.preventDefault();

    filterForm.classList.add('invisible');
    resizeForm.classList.remove('invisible');
  });

  /**
   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
   * записав сохраненный фильтр в cookie.
   * @param {Event} evt
   */
  filterForm.addEventListener('submit', function(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();
    docCookies.setItem('filterImagePreview', getFilter(), getDate());

    filterForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  });

  /**
   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
   * выбранному значению в форме.
   */
  filterForm.addEventListener('change', function() {
    // Класс перезаписывается, а не обновляется через classList потому что нужно
    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
    // состояние или просто перезаписывать.
    filterImage.className = 'filter-image-preview ' + getFilter();
  });

  cleanupResizer();
  updateBackground();
})();
