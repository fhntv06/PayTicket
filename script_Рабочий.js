/* DATA */

// Элементы формы
const formSearch = document.querySelector('.form-search'),
	inputCitiesFrom = formSearch.querySelector('.input__cities-from'),
	dropdownCitiesFrom = formSearch.querySelector('.dropdown__cities-from'),
	inputCitiesTo = formSearch.querySelector('.input__cities-to'),
	dropdownCitiesTo = formSearch.querySelector('.dropdown__cities-to'),
	inputDateDepart = formSearch.querySelector('.input__date-depart'),
	cheapestTicket = document.getElementById('cheapest-ticket'),
	otherCheapTickets = document.getElementById('other-cheap-tickets'),
	warningMessage = formSearch.querySelector('.warning-message')

// API
const CITIES_API = 'data/cities.json',
	PROXY = 'https://cors-anywhere.herokuapp.com/',
	API_KEY = '7584e030e07a8ea9d8642913fd0d6e5b',
	CALENDAR = 'http://min-prices.aviasales.ru/calendar_preload'
// CITIES_API = 'http://api.travelpayouts.com/data/ru/cities.json',

// Количество карточек
const MAX_COUNT = 10

// Массив городов
let cities = []

/* /DATA */

/* FUNCTIONS */

/*
	Принимает адрес запроса и колбэк-функцию
	Запрашивает данные по адресу url и, в случае успеха,
	передает полученные данные в колбэк
*/
const getData = (url, callback, error = console.error) => {
	const request = new XMLHttpRequest()

	request.open('GET', url)

	request.addEventListener('readystatechange', () => {
		if (request.readyState !== 4) return

		if (request.status === 200) {
			callback(request.response)
		} else {
			error(request.status)
		}
	})

	request.send()
}

/*
	Живой поиск
	Принимает инпут и список. Получает данные с инпута, фильтрует
	массив городов на основании этих данных и наполняет список данными
	из отфильтрованного массива

	ДОМАШНЯЯ РАБОТА
	Добавить сортировку по алфавиту и фильтровать массив по точным совпадениям
 */
const showCitiesList = (input, list) => {
	list.textContent = ''

	if (!input.value) return

	const filterCities = cities.filter((item) => {
		const fixItem = item.name.toLowerCase();
		return fixItem.startsWith(input.value.toLowerCase()) // includes -> startsWith
	});

	filterCities.forEach(item => {
		const li = document.createElement('li')
		li.classList.add('dropdown__city')
		li.textContent = item.name
		list.append(li)
	})
}

/*
	Принимает объект события, инпут и список
	Проверет, что клик был на элементе списка, добавляет название выбранного города в инпут,
	обнуляет список
 */
const selectCity = (e, input, list) => {
	const target = e.target
	if (target.tagName !== 'LI') return

	input.value = target.textContent
	list.textContent = ''
}

/*
	Принимает код города
	Возвращает название города
*/
const getCityName = (code) => {
	const objCity = cities.find(item => item.code === code)
	return objCity.name
}

/*
	Форматирует дату
*/
const formatDate = (date) => {
	return new Date(date).toLocaleString('ru', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	})
}

/*
	Формирует ссылку для покупки билетов
*/
const getLinkAviasales = (data) => {
	let link = 'https://www.aviasales.ru/search/'
	link += data.origin

	const date = new Date(data.depart_date)

	const day = date.getDay()
	link += day < 10 ? '0' + day : day

	const month = date.getMonth + 1
	link += month < 10 ? '0' + month : month

	link += data.destination
	link += '1'

	return link
}

/*
	Создает карточку для отображения билета
*/
const createCard = (data) => {
	const ticket = document.createElement('article')
	ticket.classList.add('ticket')
	
	let deep = ''
	
	if (data) {
		deep = `
			<h3 class="agent">${data.gate}</h3>
			<div class="ticket__wrapper">
				<div class="left-side">
					<a href="${getLinkAviasales(data)}" target="_blank" class="button button__buy">Купить
						за ${data.value}₽</a>
				</div>
				<div class="right-side">
					<div class="block-left">
						<div class="city__from">Вылет из города
							<span class="city__name">${getCityName(data.origin)}</span>
						</div>
						<div class="date">${formatDate(data.depart_date)}</div>
					</div>
			
					<div class="block-right">
						<div class="changes">${data.number_of_changes ?
							'Пересадок: ' + data.number_of_changes :
							'Без пересадок'}</div>
						<div class="city__to">Город назначения:
							<span class="city__name">${getCityName(data.destination)}</span>
						</div>
					</div>
				</div>
			</div>
		`
	} else {
		deep = '<h3>К сожалению, билеты не найдены</h3>'
	}

	ticket.insertAdjacentHTML('afterbegin', deep)

	return ticket
}

/*
	Получает все бидеты, найденные по указанному пользователем направлению
	и выводит их на экран
*/
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
}


/*
	ДОМАШНЯЯ РАБОТА
	Избавиться от alert

	Принимает текст сообщения и выводит его ниже формы
*/
const createMessage = (text) => {
	cheapestTicket.style.display = 'none'
	otherCheapTickets.style.display = 'none'

	warningMessage.textContent = text
}

/* /FUNCTIONS */

/* LISTENERS */

/*
	ДОМАШНЯЯ РАБОТА
	Закрывать список при клике мимо него
*/
document.body.addEventListener('click', () => {
	dropdownCitiesFrom.textContent = ''
	dropdownCitiesTo.textContent = ''
})

// Обрабатывает ввод в инпут
inputCitiesFrom.addEventListener('input', () => {
	showCitiesList(inputCitiesFrom, dropdownCitiesFrom)
})

// Обрабатывает клики по выпадающему списку городов
dropdownCitiesFrom.addEventListener('click', (e) => {
	selectCity(e, inputCitiesFrom, dropdownCitiesFrom)
})

// Обрабатывает ввод в инпут
inputCitiesTo.addEventListener('input', () => {
	showCitiesList(inputCitiesTo, dropdownCitiesTo)
})

// Обрабатывает клики по выпадающему списку городов
dropdownCitiesTo.addEventListener('click', (e) => {
	selectCity(e, inputCitiesTo, dropdownCitiesTo)
})

/*
	Обрабатывает отправку формы
	Формирует данные для GET-запроса, вызывает getData
*/
formSearch.addEventListener('submit', (e) => {
	e.preventDefault()

	const cityFrom = cities.find(item => inputCitiesFrom.value === item.name)
	const cityTo = cities.find(item => inputCitiesTo.value === item.name)

	const formData = {
		from: cityFrom,
		to: cityTo,
		date: inputDateDepart.value
	}

	if (formData.from && formData.to) {
		const requestData = `?origin=${formData.from.code}&destination=${formData.to.code}&depart_date=${formData.date}` +
			`&one_way=true&token=${API_KEY}`

		getData(
			CALENDAR + requestData,
			response => {
				renderTickets(response, formData.date)
			},
			e => {
				createMessage('В этом направлении нет рейсов')
				console.log('Ошибка', e);
			})
	} else {
		createMessage('Введите корректное название города')
	}


})

/* /LISTENERS */

/* FUNCTION CALLS */

getData(CITIES_API, data => {
	cities = JSON.parse(data).filter(item => item.name); // Отфильтровать города без name

	// Сортировка по алфавиту
	cities.sort((a, b) =>
		a.name > b.name ? 1 :
			a.name < b.name ? -1 :
				0)
})

/* /FUNCTION CALLS */