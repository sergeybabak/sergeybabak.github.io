import Carousel from "./carousel.js";

document.addEventListener('DOMContentLoaded', () => {
    const body = document.querySelector('body'),
      btn = document.querySelectorAll('.button'), // все кнопки
      message = document.querySelector('.message'), // основное окно (на весь экран) с всплывающим сообщением
      message__windows = document.querySelectorAll('.message__window'), // окна с всплывающими сообщениями (2 штуки)
      message__close = document.querySelectorAll('.message__close'), // крестик для закрытия всплывающего сообщения
      offers__item = document.querySelectorAll('.offers__item'), // пункты в блоке offers
      form = document.querySelector('form');

      // функция для запрета прокрутки окна
    function preventScroll(e) {
        e.preventDefault();
    }

    // показывает одно из двух окон сообщений (0 - окно с формой, 1 - сообщение, что данные отосланы)
    function visibleElement(i) {
        displayElement();
        if (i==1) message__windows[0].classList.add('none'); // если второе окно, то убираем первое
        // показываем общее затененное окно
        message.classList.remove('hidden');
        message.classList.add('visible');
        // добавляем нужный класс для появления сообщения
        message__windows[i].classList.remove('hidden');
        message__windows[i].classList.add('visible');
        // запрещаем прокрутку окна
        window.addEventListener('wheel', preventScroll, { passive: false });
    }
    // скрываем окно сообщения (pointer-events: none;)
    function hiddenElement(i) {
        message.classList.remove('visible');
        message__windows[i].classList.remove('visible');
        message.classList.add('hidden');
        message__windows[i].classList.add('hidden');
        // разрешаем прокрутку окна
        window.removeEventListener('wheel', preventScroll, { passive: false });
    }
    // убираем окно сообщения (display: none)
    function noneElement(i) {
        message__windows.forEach((mw, item) => {
            if (item!=i) {
                message__windows[item].classList.add('none');
            } 
        });
    }
    function displayElement() {
        message__windows.forEach((mw, item) => {
            message__windows[item].classList.remove('none');
        });
    }
    // отслеживаем нажатие любой кнопки
    btn.forEach(i => {
        i.addEventListener('click', ()=> {
            if (i.innerText == 'Отримати консультацію') message__windows[0].querySelector('p').textContent = 'Отримай консультацію';
            else if (i.innerText == 'Залишити заявку') message__windows[0].querySelector('p').textContent = 'Залишити заявку';
            visibleElement(0);
            // body.classList.add('overflow');
        });
    });
    message__close.forEach((mc, i) => {
        mc.addEventListener('click', () => {
            hiddenElement(i);
            // body.classList.remove('overflow');
        });
    });
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        hiddenElement(0);
        form.reset(); // очищаем форму при ее успешной отправке
        visibleElement(1);
    });

    // работа со списком в блоке offers
    function clearClass() {
        offers__item.forEach(item => {
            if (item.classList.contains('white')) item.classList.remove('white');
        });
    }

    offers__item.forEach(item => {
        // наведение мышки на пункт
        item.addEventListener('mouseenter', () => {
            if (!item.classList.contains('white')) {
                item.classList.add('grey');
            }
        });
        // уход мышки с пункта
        item.addEventListener('mouseleave', () => {
            item.classList.remove('grey');
        });
        // уход мышки с пункта
        item.addEventListener('click', () => {
            clearClass();
            item.classList.remove('grey');
            item.classList.add('white');
        });
    });

    const hamburger = document.querySelector('.hamburger'),
        header = document.querySelector('.header'),
        mainMenu = document.querySelectorAll('.header__menu ul li a')
        //   , headerTitle = document.querySelector('.header__title')
    ;

    function showMenu() {
        if (hamburger.classList.contains('hamburger__active')) {
            header.classList.remove('header__full');
            hamburger.classList.remove('hamburger__active');
            window.removeEventListener('wheel', preventScroll, { passive: false })
        }
    }
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('hamburger__active');
        header.classList.toggle('header__full');
        // headerTitle.style.display = 'inherit';
        if (hamburger.classList.contains('hamburger__active')) window.addEventListener('wheel', preventScroll, { passive: false })
        else window.removeEventListener('wheel', preventScroll, { passive: false });
    });

    mainMenu.forEach(item => {
        item.addEventListener('click', () => {
            showMenu();
        });
    });

    // карусели
    const carousel = {
        wrapper: '.slider__wrapper',
        left: '.arrow_left',
        right: '.arrow_rigth'
        , stylesCentralItem: {
            'transform': 'scale(1.12)'
        }
    };
    const exampleCarousel = new Carousel(carousel);

    const carousel_2 = {
        wrapper: '.slider__wrapper_2',
        left: '.arrow_left_2',
        right: '.arrow_rigth_2'
    };
    const exampleCarousel_2 = new Carousel(carousel_2);

    window.addEventListener("resize", () => {
        setTimeout(() => {
            exampleCarousel.initPosition();
        }, 300);
        exampleCarousel_2.initPosition();
    });

    // стрелочка для прокрутки экрана в начало
    const scrollToTopBtn = document.querySelector('.pageup');

    window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    const screenHeight = window.innerHeight;

    if (scrollPosition > screenHeight * 1.5) {
        scrollToTopBtn.style.display = 'block';
    } else {
        scrollToTopBtn.style.display = 'none';
    }
    });
});