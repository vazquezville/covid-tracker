import React, { useEffect, useState } from "react";
import "./App.css";
import {
  MenuItem,
  Select,
  FormControl,
  Card,
  CardContent,
} from "@material-ui/core";
import InfoBox from "./InfoBox";
import Map from "./Map";
import Table from "./Table";
import LineGraph from "./LineGraph";
import { sortData, formatStats } from "./util";
import "leaflet/dist/leaflet.css";
import { v4 as uuidv4 } from "uuid";

function App() {
  //Setup for the countries list, fetch country list on load
  const [countries, setCountries] = useState([]);

  //Option selected in the dropdown countries, for defect worldwide, fetch the data for a specific country, get the isoCode
  const [country, setCountry] = useState("worldwide");

  //Country name only used for rename the label of the graphics frame
  const [countryName, setCountryName] = useState("Worldwide");

  //Country info state, get all the info in the load
  const [countryInfo, setCountryInfo] = useState({});

  const [tableData, setTableData] = useState([]);

  //Save the current selected type from the click in the infoboxes. Change the values in the map
  const [casesType, setCasesType] = useState("cases");

  //Map options
  const [mapCenter, setMapCenter] = useState({
    lat: 34.80746,
    lng: -40.4796,
  });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);

  //Get the current worldwide state when the app loads
  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);

  //Get the country list from disease.sh and destructure it, just getting the name and the iso2, also fill the right table data
  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({
            id: uuidv4(),
            name: country.country,
            value: country.countryInfo.iso2,
          }));

          //Sorted by cases numbers first (see util.js)
          const sortedData = sortData(data);
          setCountries(countries);
          setMapCountries(data);
          setTableData(sortedData);
        });
    };

    getCountriesData();
  }, []);

  //Triggered when a country is selected in the dropdown, select the current target value
  const onCountryChange = async (e) => {
    const countryCode = e.target.value;

    //If is selected worldwide, call the api for all, otherwise call for particular country and save all the data
    const url =
      countryCode === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setCountry(countryCode);
        setCountryInfo(data);

        //Recover the longitude and latitude for center the map view
        if (countryCode === "worldwide") {
          setMapCenter([34.80746, -40.4796]);
          setCountryName("Worldwide");
        } else {
          setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
          setCountryName(data.country);
        }
        setMapZoom(4);
      });
  };

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>Covid-19 Tracker</h1>

          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              onChange={onCountryChange}
              value={country}
            >
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {countries.map((country) => (
                <MenuItem key={uuidv4()} value={country.value}>
                  {country.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className="app__stats">
          <InfoBox
            isRed
            active={casesType === "cases"}
            onClick={(e) => setCasesType("cases")}
            title="Coronavirus Cases"
            cases={formatStats(countryInfo.todayCases)}
            total={formatStats(countryInfo.cases)}
          ></InfoBox>
          <InfoBox
            active={casesType === "recovered"}
            onClick={(e) => setCasesType("recovered")}
            title="Recovered"
            cases={formatStats(countryInfo.todayRecovered)}
            total={formatStats(countryInfo.recovered)}
          ></InfoBox>
          <InfoBox
            isRed
            active={casesType === "deaths"}
            onClick={(e) => setCasesType("deaths")}
            title="Deaths"
            cases={formatStats(countryInfo.todayDeaths)}
            total={formatStats(countryInfo.deaths)}
          ></InfoBox>
        </div>

        <Map
          countries={mapCountries}
          casesType={casesType}
          center={mapCenter}
          zoom={mapZoom}
        ></Map>
      </div>
      <Card className="app__right">
        <CardContent>
          <h3>Live cases by country</h3>
          <Table countries={tableData}></Table>
          <h3 className="app__graphTitle">
            {countryName} new {casesType}
          </h3>
          <LineGraph
            className="app__graph"
            country={country}
            casesType={casesType}
          ></LineGraph>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
