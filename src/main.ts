import "./style.css";
import axios from "axios";

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

const bodyEl = document.querySelector("body") as HTMLBodyElement;

const myCountryBtn = document.querySelector(
  "#myCountryBtn"
) as HTMLButtonElement;
const countrySearchForm = document.querySelector(
  "#countrySearchForm"
) as HTMLFormElement;
const countryInput = document.querySelector(
  "#countryInput"
) as HTMLInputElement;
const countriesList = document.querySelector(
  "#countriesList"
) as HTMLUListElement;

function getMyLocation(): Promise<GeolocationCoordinates> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      (error) => reject(error)
    );
  });
}

myCountryBtn?.addEventListener("click", async () => {
  try {
    const { latitude, longitude } = await getMyLocation();
    console.log(latitude, longitude);

    const { data } = await axios.get<ReverseGeocodeResponse>(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}`
    );
    console.log(data);

    const li = document.createElement("li");

    const countryName = document.createElement("p");
    countryName!.textContent = data.countryName;

    const capitalName = document.createElement("p");
    capitalName!.textContent = data.city;

    const continentName = document.createElement("p");
    continentName!.textContent = data.continent;

    const detailsBtn = document.createElement("button");
    detailsBtn.textContent = `details about ${data.countryName}`;

    detailsBtn.addEventListener("click", () => {
      const continentCode = document.createElement("p");
      continentCode.textContent = data.continentCode;

      const countryCode = document.createElement("p");
      countryCode.textContent = data.countryCode;

      const locality = document.createElement("p");
      locality.textContent = data.locality;

      const latitude = document.createElement("p");
      latitude.textContent = data.latitude + "";

      const longitude = document.createElement("p");
      longitude.textContent = data.longitude + "";

      const detailsLi = document.createElement("li");
      detailsLi.append(
        continentCode,
        countryCode,
        locality,
        latitude,
        longitude
      );
      countriesList?.append(detailsLi);
    });

    li.append(countryName, capitalName, continentName, detailsBtn);
    countriesList?.append(li);
  } catch (error) {
    console.error(error);
  }
});

countrySearchForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!countryInput.value) return;
  const countryInputValue = countryInput.value;

  let countries;

  try {
    const { data } = await axios.get<Country[]>(
      `https://restcountries.com/v3.1/name/${countryInputValue}`
    );
    countries = data;
    console.log(data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        const errorLi = document.createElement("p");
        errorLi.textContent = "No such a country";
        countriesList.append(errorLi);
        console.error("No such a country");
      }
    }
  }

  renderCountries(countries!);
});

function renderCountries(countries: Country[]) {
  countriesList.innerHTML = "";
  countries!.forEach((country) => {
    console.log(country);

    const flagEl = document.createElement("img");
    flagEl.src = country.flags.svg;

    const countryNameEl = document.createElement("p");
    countryNameEl.textContent = country.name.official;

    const capitalEl = document.createElement("p");
    capitalEl.textContent = country.capital;

    const countryDetails = document.createElement("button");
    countryDetails.textContent = `show ${country.name.official} details`;

    const countryLi = document.createElement("li");
    countryLi.append(flagEl, countryNameEl, capitalEl, countryDetails);

    countriesList.append(countryLi);

    countryDetails.addEventListener("click", () => {
      handleCountryDetails(country);
    });
  });
}

function handleCountryDetails(country: Country) {
  const historyObject = country.name.official;

  history.pushState({ historyObject }, "", `/${country.name.official}`);
  console.log(history);

  const populationEl = document.createElement("p");
  populationEl.textContent = country.population + "";

  const areaEl = document.createElement("p");
  areaEl.textContent = country.area + "";

  const regionEl = document.createElement("p");
  regionEl.textContent = country.region;

  const subregionEl = document.createElement("p");
  subregionEl.textContent = country.subregion;

  const backBtn = document.createElement("button");
  backBtn.textContent = "← back to main page";

  const detailsLi = document.createElement("li");
  detailsLi.append(populationEl, areaEl, regionEl, subregionEl, backBtn);

  bodyEl!.innerHTML = "";
  bodyEl.append(detailsLi);

  backBtn.addEventListener("click", () => {});
}
