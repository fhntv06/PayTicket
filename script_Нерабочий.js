  
 //Переменные
 const 
 formSearch = document.querySelector(".form-search"),
 inputCitiesTo = document.querySelector(".input__cities-to"),
 inputCitiesFrom = document.querySelector(".input__cities-from"),
 dropdownCitiesFrom =  document.querySelector(".dropdown__cities-from"),
 dropdownCitiesTo = document.querySelector(".dropdown__cities-to"),
 inputDateDepart = document.querySelector(".input__date-depart");
 
 const cheapestTicket = document.getElementById("cheapest-ticket"),
 otherCheapTickets = document.getElementById("other-cheap-tickets");
 
 MAX_COUNT = 5;
 
   const citiesApi = "data/cities.json",
   proxy = "https://cors-anywhere.herokuapp.com/",
   API_KEY = "616d3e559cf24971ab5e6f7881f8db81",
   calendar = "http://min-prices.aviasales.ru/calendar_preload";
 
     // Массив данных
     let city = [];
 
 const showCity =  (input, list) => {
         list.textContent = " ";
         
         if(input.value !== ""){
 
         
         const filterCity = city.filter((item) => {
             const fixItem = item.name.toLowerCase(); 
             return fixItem.startsWith(input.value.toLowerCase());
             //filter перебирает все и формирует массив из всех
         });
         // Добавляем элемент li в ul
         filterCity.forEach((item) => {
             const li = document.createElement("li");
             li.classList.add("dropdown__city");
             li.textContent = item.name;
             list.append(li);
         });
     }
 } 
 
 const selecter = (event, input, list) => {
     const target = event.target;
     if(target.tagName.toLowerCase() === "LI"){
         input.value = target.textContent;
         list.textContent = "";
     };
 }; 
 
 
     // API от Авиасейлс
     // объект запроса
     const getData = (url, callback) => {
         const request = new XMLHttpRequest();
     
         request.open("GET", url); // настройка запроса "куда"
     
         request.addEventListener("readystatechange", () => {
             if(request.readyState !== 4){
                 return; // завершение выполнения функции
             }
     
             if(request.status === 200){
                 callback(request.response);
             }else{
                 console.error(request.status);   
             }
         });
             
         request.send();
     }
 
 const getNameCity = (code) => {
   const objCity = city.find(item => item.code === code);
   return objCity.name;
 }
 
 const getDate = (date) => {
   return new Date(date).toLocaleString('ru', {
       year: "numeric",
       month: "long",
       day: "numeric",
       hour: "2-digit",
       minute: "2-digit"
   })
 }
 
 const getChanges = (num) => {
	if (num) {
		return num === 1 ? 'С одной пересадкой' : 'С двумя пересадками';
	} else {
		return 'Без пересадок';
	}
};

const getLinkAviasales = (data) => {
	let link = 'https://www.aviasales.ru/search/';

	link += data.origin;
	
	const date = new Date(data.depart_date);
	
	const day = date.getDate();

	link += day < 10 ? "0" + day : day;

	const month = date.getMonth() + 1;

	link += month < 10 ? "0" + month : month;

	link += data.destination;

	link += "1";

	return link;
};
 
 const createCard = (data) => {
   const ticket = document.createElement("article");
   ticket.classList.add("ticket");
 
   let deep = "";
 
   if (data) {
       deep = `
                   <h3 class="agent">${data.gate}</h3>
           <div class="ticket__wrapper">
               <div class="left-side">
                   <a href="https://www.aviasales.ru/search/SVX2905KGD1" class="button button__buy">
                   ${data.value}Руб</a>
               </div>
               <div class="right-side">
                   <div class="block-left">
                       <div class="city__from">Вылет из города
                           <span class="city__name">${getNameCity(data.origin)}</span>
                       </div>
                       <div class="date">${getDate(data.depart_date)}</div>
                   </div>
 
                   <div class="block-right">
                       <div class="changes">${getChanges(data.number_of_changes)}</div>
                       <div class="city__to">Город назначения:
                           <span class="city__name">${getNameCity(data.destination)}</span>
                       </div>
                   </div>
               </div>
           </div>
       `;
   } else {
       deep = "<h3>К сожалению на текущую дату билетов не нашлось!</h3>";
   }
 
 
   ticket.insertAdjacentHTML("afterbegin",deep);
 
   return ticket;
 
 };
 
 
 const renderAllTickets = (tickets) => {
	otherCheapTickets.style.display = 'block'
	otherCheapTickets.innerHTML = '<h2>Самые дешевые билеты на другие даты</h2>'

	tickets.sort((a, b) => {
		return new Date(a.value) - new Date(b.value)
	})

	for (let i = 0; i < tickets.length && i < MAX_COUNT; i++) {
		const ticket = createCard(tickets[i])
		otherCheapTickets.append(ticket)
	}
}

/*
	Получает самый дешевый билет на указанную дату и выводит его на экран
*/
const renderTicketsOfDate = (tickets) => {
	cheapestTicket.style.display = 'block'
	cheapestTicket.innerHTML = '<h2>Самый дешевый билет на выбранную дату</h2>'

	const ticket = createCard(tickets[0])
	cheapestTicket.append(ticket)
}

/*
	Колбэк-функция для getData
	Получает данные о билетах и дату, полученную из формы
	Выделяет билеты где depart_date === date и передает их функции renderTicketsOfDate
	Все билеты передает функции renderAllTickets
*/
const renderTickets = (data, date) => {
	const allTickets = JSON.parse(data).best_prices
	const ticketsOfDate = allTickets.filter(item => item.depart_date === date)

	renderAllTickets(allTickets)
	renderTicketsOfDate(ticketsOfDate)
};
 
document.body.addEventListener('click', () => {
	dropdownCitiesFrom.textContent = ''
	dropdownCitiesTo.textContent = ''
});

   // Список для поля "Откуда"
   inputCitiesFrom.addEventListener("input", () =>{           
     showCity(inputCitiesFrom, dropdownCitiesFrom);
 }); 
     // onclick
 dropdownCitiesFrom.addEventListener("click", (event) => {
     selecter(event, inputCitiesFrom, dropdownCitiesFrom);
 });
 
    
     // Список для поля "Куда"
 inputCitiesTo.addEventListener("input", () => {
     showCity(inputCitiesTo, dropdownCitiesTo);
 }); 
 
     // onclick
 dropdownCitiesTo.addEventListener("click", (event) => {
     selecter(event, inputCitiesTo, dropdownCitiesTo);
 });
 
 
 formSearch.addEventListener('submit', (event) => {
     event.preventDefault();
     const cityFrom =  city.find((item) => inputCitiesFrom.value === item.name);
     const cityTo =  city.find((item) => inputCitiesTo.value === item.name);
 
     const formData = {
         from: cityFrom,
         to: cityTo,
         when: inputDateDepart.value
     };
     
     // если введенные данные верные: выполняется запрос
     if (formData.from && formData.to) {
 
         const requestData = "?depart_date=" + formData.when +
     "'&origin=" + formData.from.code +
         "&destination=" + formData.to.code + 
         "&one_way=true&token";
         
         getData(calendar + requestData, (response) => {
             renderCheap(response, formData.when);
         });
 
     } else {
         alert("Введите корректное название города: ");
     }
    
 });
 
     // вызов функции
 
     getData(citiesApi, (data) => {
      
       city=JSON.parse(data).filter((item) => {
           return item.name;
       }); 
       city.sort((a,b) => {
           if(a.name > b.name) {
               return 1;
           }
           if (a.name < b.name) {
               return -1;
           }
           return 0;
       });
   });
 
 