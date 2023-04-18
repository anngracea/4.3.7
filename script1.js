const inputSearch = document.querySelector("input");
const inputList = document.querySelector(".dropdown__list");
const repos = document.querySelector(".dropdown__repos");

//удаление фиолетового блока при нажатии на крестик
repos.addEventListener("click", function (event) {
  let target = event.target;
  if (!target.classList.contains("btn-close")) {
    return; //если нет кнопки закрытия (красный крестик на фиолетовом блоке) выход из функции 
  }

  target.parentElement.remove(); //удаляет фиолетовый блок из DOM-дерева 
});

//при клике на элемент из выпадающего списка создает фиолетовый блок (addSaved)
inputList.addEventListener("click", function (event) {
  let target = event.target;
  if (!target.classList.contains("dropdown-content")) {
    return; 
  }

  addSaved(target);
  inputSearch.value = ""; //
  removeAutocomp(); //убирает выпадающий список после клика на элемент из выпадающего списка
});

//функция убирает выпадающий список
function removeAutocomp() {
  inputList.innerHTML = "";
}

//функция показывает аутокомплит
function showAutocomp(repositories) {
  for (let repositoriesIndex = 0; repositoriesIndex < 5; repositoriesIndex++) {
    //позволяет показать только 5 элементов в списке
    let name = repositories.items[repositoriesIndex].name; //берем данные из API
    let owner = repositories.items[repositoriesIndex].owner.login; 
    let stars = repositories.items[repositoriesIndex].stargazers_count;

    let dropdownContent = `<div class="dropdown-content" data-owner="${owner}" data-stars="${stars}">${name}</div>`;
    inputList.innerHTML += dropdownContent; //создаем переменную, туда кладем созданный класс и добавляем его как список всплывающего меню
  }
}

//функция создает фиолетовый блок с данными из API
function addSaved(target) {
  let name = target.textContent;
  let owner = target.dataset.owner; // если задано свойство owner, то вытащить его 
  let stars = target.dataset.stars;

  repos.innerHTML += `<div class="chosen"> <div class="repos-info"> Name: ${name}<br> Owner: ${owner}<br> Stars: ${stars}</div><button class="btn-close"></button></div>`;
  //внутрь класса "dropdown__repos" создаем классы chosen с Name, Owner, Stars
}

// функция отправляет поисковый запрос
async function getAutocomp() {
  const urlSearchRepo = new URL("https://api.github.com/search/repositories");
  inputList.innerHTML = "";
  let repoPart = inputSearch.value; 
  if (repoPart == "") {
    removeAutocomp();
    return;
  }

  urlSearchRepo.searchParams.append("q", repoPart);  // q здесь нужен так как обозначает query
  try {
    let response = await fetch(urlSearchRepo);
    if (response.ok) {
      let repo = await response.json();
      showAutocomp(repo);
    } else {
      return null
    };
  } catch (error) {
    console.log(error);
  }
}

//
function debounce(fn, timeout) {
  let timer = null;

  return (...args) => {
    clearTimeout(timer);
    return new Promise((resolve) => {
      timer = setTimeout(() => resolve(fn(...args)), timeout);
    });
  };
}

//
const getAutocompDebounce = debounce(getAutocomp, 500);
inputSearch.addEventListener("input",(e)  => {// здесь листенер с тримом чтобы игнорить пробел
  const value = e.target.value
  e.target.value = value.trim()
  getAutocompDebounce()
});