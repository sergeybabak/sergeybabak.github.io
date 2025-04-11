export default class Carousel {
        constructor(carousel) {
        // Проверка обязательных параметров
        if (!carousel?.wrapper || !carousel?.left || !carousel?.right) {
            console.error("Carousel Error: параметры 'wrapper', 'left' и 'right' обязательны для заполнения в передаваемом объекте.");
            return;
        };
        this.container = carousel.wrapper;                                  // сохраняем класс контейнера
        this.carouselContainer = document.querySelector(carousel.wrapper);  // объект контейнер
        this.countItems = this.carouselContainer.childElementCount;         // количество элементов карусели

        this.gap = 0;                                                       // отступ между элементами карусели (если нет в стилях, а нужно)
        this.itemWidth;                                                     // ширина элемента карусели, взятая по первому элементу
        this.positionArray = [];                                            // массив позицие left элементов карусели (не изменяется в процессе работы)
        this.itemsCreated = false;                                          // флаг создания стилей в первый раз (item-N)

        this.leftControl = document.querySelector(carousel.left);           // элемент управления (по заданному идентификатору) для движения карусели влево
        this.rigthControl = document.querySelector(carousel.right);         // элемент управления (по заданному идентификатору) для движения карусели вправо
        this.autoWidth = false;                                             // масштабировать ли элементы карусели к обертке

        this.setControl();                                                  // функция назаначает события нажатия на элементы управления (влево/вправо)
        this.stylesCentralItem = carousel.stylesCentralItem;
        this.itemName = `item${Carousel.instanceCount++}`;                  // Уникальное имя item для текущей карусели
        // this.itemName = carousel.itemName ? carousel.itemName : 'item';
        this.initPosition();  
    }
    
    initPosition() {
        // gap берется из слиля обертки карусели. Если его нет, то по умолчанию установлен 40
        this.gap = parseInt(window.getComputedStyle(this.carouselContainer).getPropertyValue('gap')) || this.gap;

        const central = Math.round(this.carouselContainer.offsetWidth / 2);
        const centralItem = 2;

        this.itemWidth = this.carouselContainer.firstElementChild.offsetWidth;
        const leftCentral = central - Math.round(this.itemWidth / 2); // Центрируем centralItem

        Array.from(this.carouselContainer.children).forEach((item, index) => {
            if (!this.itemsCreated) {  // Если это первый запуск
                item.classList.add(`${this.itemName}-${index + 1}`); // Добавляем класс к элементу
                
                this.addOrUpdateRule(`${this.itemName}-${index + 1}`, 'position', 'absolute');
                if ((index == centralItem - 1) && this.stylesCentralItem) {
                    let styles = this.stylesCentralItem;
                    [...item.classList].forEach(i => {
                        for (let key in styles) {
                            // удаляем стиль только если его значение равно значению центрального элемента карусели из параметра stylesCentral${this.itemName}
                            if (styles[key] == this.getStyleValue(i, key)) this.addOrUpdateRule(i, key);
                            this.addOrUpdateRule(`${this.itemName}-${centralItem}`, key, styles[key]);
                        }
                    });
                }
            }
            this.positionArray[index] = leftCentral + (index + 1 - centralItem) * (this.itemWidth + this.gap);
            this.addOrUpdateRule(`${this.itemName}-${index + 1}`, 'left', this.positionArray[index] + 'px');

        });
        this.itemsCreated = true;
    }

    // добавляет стиль в нужный класс или заменяет его значение если он есть (например: left: 100px)
    // если параметр value отсутствует, то удаляем стиль (с этим нужно осторожно. Можно удалить нужное)
    addOrUpdateRule(className, property, value) {
        let ruleFound = false; // Флаг, нашли ли мы нужное правило
    
        for (let sheet of document.styleSheets) { // Перебираем все таблицы стилей
            try {
                for (let rule of sheet.cssRules) { // Перебираем все CSS-правила внутри таблицы
                    if (rule.selectorText === `.${className}`) { // Если нашли нужный класс
                        if (value === undefined) {
                            rule.style.removeProperty(property); // Удаляем свойство
                        } else {
                            rule.style[property] = value; // Изменяем свойство
                        }
                        ruleFound = true; // Устанавливаем флаг, что правило найдено
                        break; // Прекращаем перебор, так как нашли нужное правило
                    }
                }
            } catch (e) {
                console.warn("Ошибка при обновлении стиля", e); // Ловим ошибки при доступе к таблице стилей
            }
        }
    
        // Если правило не найдено, добавляем его в первую доступную таблицу стилей
        if (!ruleFound && document.styleSheets.length > 0) {
            document.styleSheets[0].insertRule(
                `.${className} { ${property}: ${value}; }`,  // Создаём новое CSS-правило
                document.styleSheets[0].cssRules.length      // Вставляем в конец таблицы
            );
        }
    }

    // возвращает значение свойства из нужного класса (в примере про left вернет 100рх)
    getStyleValue(className, property) {
        for (let sheet of document.styleSheets) { // Перебираем все таблицы стилей
            try {
                for (let rule of sheet.cssRules) { // Перебираем все CSS-правила
                    if (rule.selectorText === `.${className}`) { // Если нашли нужный класс
                        if (!property) return true;
                        return rule.style[property] || null; // Возвращаем значение свойства или null
                    }
                }
            } catch (e) {
                console.warn("Ошибка при получении стиля", e); // Обрабатываем ошибки доступа
            }
        }
        return null; // Если стиль не найден
    }
    
    // копирование класса
    copyClass(oldClass, newClass) {
        for (let sheet of document.styleSheets) {
            try {
                for (let rule of sheet.cssRules) {
                    if (rule.selectorText === `.${oldClass}`) {
                        let newRule = `.${newClass} { ${rule.style.cssText} }`;
                        sheet.insertRule(newRule, sheet.cssRules.length);
                        return;
                    }
                }
            } catch (e) {
                console.warn("Ошибка при копировании стилей", e);
            }
        }
    }

    // удаление класса
    removeClass(className) {
        for (let sheet of document.styleSheets) {
            try {
                for (let i = 0; i < sheet.cssRules.length; i++) {
                    if (sheet.cssRules[i].selectorText === `.${className}`) {
                        sheet.deleteRule(i);
                        return;
                    }
                }
            } catch (e) {
                console.warn("Ошибка при удалении стиля", e);
            }
        }
    }

    moveItems(direction) {
        let firstElement = this.carouselContainer.firstElementChild; // Первый элемент
        let lastElement = this.carouselContainer.lastElementChild; // Последний элемент
        let shift = this.itemWidth + this.gap; // Сдвиг (ширина + gap)

        if (direction === 'left') {
            const clonedElement = firstElement.cloneNode(true); // Клонируем первый элемент
            clonedElement.classList.replace(`${this.itemName}-1`, `${this.itemName}-${this.countItems}`);
            this.carouselContainer.appendChild(clonedElement); // Добавляем копию в конец
            this.copyClass(`${this.itemName}-1`, `${this.itemName}-0`);

            // 1️⃣ Сдвигаем все элементы влево
            Array.from(this.carouselContainer.children).forEach((item, i) => {
                // исключительно для ЭТОЙ карусели. Уменьшается элемент с руководителем до общих размеров если он не главный с
                item.dataset.index === "2" && item.classList.toggle('slider__item-great', i !== 2);
                item.classList.replace(`${this.itemName}-${i + 1}`, `${this.itemName}-${i}`); // Заменяем класс
                let newLeft = this.positionArray[i] - shift; // Вычисляем новое положение
                this.addOrUpdateRule(`${this.itemName}-${i}`, 'left', `${newLeft}px`);
            });
            
            setTimeout(() => {
                this.carouselContainer.removeChild(this.carouselContainer.firstElementChild);
                this.removeClass(`${this.itemName}-0`);
                
                this.carouselItems = this.carouselContainer.querySelectorAll(':scope > div'); // Обновляем NodeList
                this.carouselArray = [...this.carouselItems]; // Обновляем массив
            }, 300);
        } else if (direction == 'right') {
            // 2️⃣ Вычисляем новую позицию (левее первого элемента)
            let newLeft = this.positionArray[0] - shift;
            const clonedElement = lastElement.cloneNode(true); // Клонируем последний элемент

            // 3️⃣ Задаем классу новый left перед тем, как изменять DOM
            this.addOrUpdateRule(`${this.itemName}-${this.countItems}`, 'left', `${newLeft}px`);

            setTimeout(() => {
                Array.from(this.carouselContainer.children).forEach((item, i) => {
                    this.addOrUpdateRule(`${this.itemName}-${i + 1}`, 'left', this.positionArray[i] + 'px');
                    let oldItem = i == 0 ? this.countItems : i;
                    let newItem = i + 1 === this.countItems ? this.countItems : (i + 1) % this.countItems;
                    item.classList.replace(`${this.itemName}-${oldItem}`, `${this.itemName}-${i + 1}`); // Заменяем класс
                    // исключительно для ЭТОЙ карусели. Уменьшается элемент с руководителем до общих размеров если он не главный сейчас
                    item.dataset.index === "2" && item.classList.toggle('slider__item-great', i !== 1);
                });
            });
            this.carouselContainer.insertBefore(lastElement, this.carouselContainer.firstChild);
        }   
    };

    setControl() {
        this.leftControl.addEventListener('click', () => { this.moveItems('left'); });
        this.rigthControl.addEventListener('click', () => { this.moveItems('right'); });
    };

    // метод для изменения какого-либо значения в конструкторе извне (например gap)
    updateSettings(newSettings) {
        Object.keys(newSettings).forEach(key => {
            if (this.hasOwnProperty(key)) { // Проверяем, существует ли свойство в объекте
                this[key] = newSettings[key];
            }
        });
    
        this.initPosition(); // Пересчитываем позиции после обновления параметров
    }
}

// Глобальный счетчик каруселей в проекте для создания уникального названия класса для управления координатами каждого элемента карусели
Carousel.instanceCount = 0; 

// запуск карусели из основного script.js
/* import Carousel from "./carousel.js";

document.addEventListener('DOMContentLoaded', () => {
    const carousel = {
        wrapper: '.gallery-container',      // обязательный параметр
        left: '.arrow_left',                // обязательный параметр
        right: '.arrow_rigth'               // обязательный параметр
        ,stylesCentralItem: {
            'transform': 'scale(1.12)',
            'background-color': 'black'
        }
    };
    const exampleCarousel = new Carousel(carousel);
    window.addEventListener("resize", () => exampleCarousel.initPosition());
});
}); */

// Пример динамического обновления gap и т.п.
/* setTimeout(() => {
    exampleCarousel.updateSettings({ 
        gap: 50, 
        autoWidth: true,
        itemWidth: 300 
    });
}, 2000); // Через 2 секунды изменятся параметры и обновится карусель */