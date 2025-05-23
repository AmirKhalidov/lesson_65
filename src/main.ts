import './style.css';
import axios from 'axios';

interface ReverseGeocodeResponse {
    countryName: string;
    city: string;
    continent: string;
    continentCode: string;
    countryCode: string;
    locality: string;
    latitude: number;
    longitude: number;
}

interface Country {
    name: {
        official: string;
    };
    flags: {
        svg: string;
    };
    capital: string;
    population: number;
    area: number;
    region: string;
    subregion: string;
}

const bodyEl = document.querySelector('body') as HTMLBodyElement;
const initialHTML = bodyEl.innerHTML;

const myCountryBtn = document.querySelector(
    '#myCountryBtn'
) as HTMLButtonElement;
const countrySearchForm = document.querySelector(
    '#countrySearchForm'
) as HTMLFormElement;
const countryInput = document.querySelector(
    '#countryInput'
) as HTMLInputElement;
const countriesList = document.querySelector(
    '#countriesList'
) as HTMLUListElement;

history.replaceState({ initial: true }, '', '/');

function getMyLocation(): Promise<GeolocationCoordinates> {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (position) => resolve(position.coords),
            (error) => reject(error)
        );
    });
}

myCountryBtn?.addEventListener('click', async () => {
    try {
        const { latitude, longitude } = await getMyLocation();
        console.log(latitude, longitude);

        const { data } = await axios.get<ReverseGeocodeResponse>(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}`
        );

        const countries = await fetchCountries(data.countryName);

        const historyObject = data.countryName;

        history.pushState({ historyObject }, '', `/${historyObject}`);

        renderCountries(countries!);

        const detailsBtn = document.createElement('button');
        detailsBtn.textContent = `details about ${data.countryName}`;

        detailsBtn.addEventListener('click', async () => {
            if (countries && countries.length > 0) {
                handleCountryDetails(countries[0]);
            }
        });
    } catch (error) {
        console.error(error);
    }
});

countrySearchForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!countryInput.value) return;
    const countryInputValue = countryInput.value;

    const countries = await fetchCountries(countryInputValue);

    renderCountries(countries!);
});

async function fetchCountries(countryName: string) {
    let countries;

    try {
        const { data } = await axios.get<Country[]>(
            `https://restcountries.com/v3.1/name/${countryName}`
        );
        countries = data;
        console.log(data);

        return countries;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                const errorLi = document.createElement('p');
                errorLi.className = 'error-message';
                errorLi.textContent = 'No such a country';
                countriesList.append(errorLi);
                console.error('No such a country');
            }
        }
    }
}

function renderCountries(countries: Country[]) {
    countriesList.innerHTML = '';
    countries!.forEach((country) => {
        console.log(country);

        const flagEl = document.createElement('img');
        flagEl.src = country.flags.svg;

        const countryNameEl = document.createElement('p');
        countryNameEl.setAttribute('data-label', 'Country:');
        countryNameEl.textContent = country.name.official;

        const capitalEl = document.createElement('p');
        capitalEl.setAttribute('data-label', 'Capital:');
        capitalEl.textContent = country.capital;

        const countryDetails = document.createElement('button');
        countryDetails.textContent = `show ${country.name.official} details`;

        const countryLi = document.createElement('li');
        countryLi.append(flagEl, countryNameEl, capitalEl, countryDetails);

        countriesList.append(countryLi);

        countryDetails.addEventListener('click', () => {
            handleCountryDetails(country);
        });
    });
}

function handleCountryDetails(country: Country) {
    console.log(country);
    history.pushState(
        { countryData: country },
        '',
        `/${country.name.official}`
    );
    console.log(history);

    const populationEl = document.createElement('p');
    populationEl.setAttribute('data-label', 'Population:');
    populationEl.textContent = country.population.toLocaleString();

    const areaEl = document.createElement('p');
    areaEl.setAttribute('data-label', 'Area:');
    areaEl.textContent = `${country.area.toLocaleString()} sq.km`;

    const regionEl = document.createElement('p');
    regionEl.setAttribute('data-label', 'Region:');
    regionEl.textContent = country.region;

    const subregionEl = document.createElement('p');
    subregionEl.setAttribute('data-label', 'Subregion:');
    subregionEl.textContent = country.subregion;

    const backBtn = document.createElement('button');
    backBtn.textContent = '← back to main page';

    const detailsLi = document.createElement('li');
    detailsLi.className = 'country-details';
    detailsLi.append(populationEl, areaEl, regionEl, subregionEl, backBtn);

    bodyEl!.innerHTML = '';
    bodyEl.append(detailsLi);

    backBtn.addEventListener('click', () => {
        history.back();
    });
}

window.addEventListener('popstate', (event) => {
    if (!event.state || !event.state.countryData) {
        bodyEl.innerHTML = initialHTML;

        const myCountryBtn = document.querySelector(
            '#myCountryBtn'
        ) as HTMLButtonElement;
        const countrySearchForm = document.querySelector(
            '#countrySearchForm'
        ) as HTMLFormElement;

        myCountryBtn?.addEventListener('click', async () => {
            try {
                const { latitude, longitude } = await getMyLocation();
                const { data } = await axios.get<ReverseGeocodeResponse>(
                    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}`
                );
                const countries = await fetchCountries(data.countryName);
                renderCountries(countries!);
            } catch (error) {
                console.error(error);
            }
        });

        countrySearchForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const countryInput = document.querySelector(
                '#countryInput'
            ) as HTMLInputElement;
            if (!countryInput.value) return;
            const countries = await fetchCountries(countryInput.value);
            renderCountries(countries!);
        });
    } else {
        handleCountryDetails(event.state.countryData);
    }
});
