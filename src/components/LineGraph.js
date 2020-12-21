import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import numeral from "numeral";

//Options for the chartjs, from the doc
const options = {
  legend: {
    display: false,
  },
  elements: {
    point: {
      radius: 0,
    },
  },
  maintainAspectRatio: false,
  tooltips: {
    mode: "index",
    intersect: false,
    callbacks: {
      label: function (tooltipItem, data) {
        return numeral(tooltipItem.value).format("+0,0");
      },
    },
  },
  scales: {
    xAxes: [
      {
        type: "time",
        time: {
          format: "MM/DD/YY",
          tooltipFormat: "ll",
        },
      },
    ],
    yAxes: [
      {
        gridlines: {
          display: false,
        },
        ticks: {
          callback: function (value, index, values) {
            return numeral(value).format("0a");
          },
        },
      },
    ],
  },
};

//With the data, need to formart it to chartjs, function get the data ([data][numberCases]) and the case type (cases,deaths,recovered), default as cases
const buildChartData = (data, casesType) => {
  let chartData = [];
  let lastDataPoint;

  for (let date in data.cases) {
    if (lastDataPoint) {
      let newDataPoint = {
        x: date,
        y: data[casesType][date] - lastDataPoint,
      };
      chartData.push(newDataPoint);
    }
    lastDataPoint = data[casesType][date];
  }
  return chartData;
};

//Main function, get the casesType (cases, deaths, recovered) to show in the chart, by default cases
function LineGraph({ casesType = "cases", country, ...props }) {
  const [data, setData] = useState({});

  //Fetch the data for the stadistics on the load. Answer: {cases: [data][numberCases],... , deaths: [data][numberCases],... recovered: [data][numberCases]... }
  useEffect(() => {
    const url =
      country === "worldwide"
        ? "https://disease.sh/v3/covid-19/historical/all?lastdays=120"
        : `https://disease.sh/v3/covid-19/historical/${country}?lastdays=120`;

    const getCountryData = async () => {
      await fetch(url)
        .then((response) => response.json())
        .then((data) => {
          if (country === "worldwide") {
            const charData = buildChartData(data, casesType);
            setData(charData);
          } else {
            const charData = buildChartData(data.timeline, casesType);
            setData(charData);
          }
        });
    };
    getCountryData();
  }, [casesType, country]);

  return (
    <div className={props.className}>
      {/*We can't load the chart with empty data or will crash, wait until the fetch is done and data.length will be more than 0 */}
      {data?.length > 0 && (
        <Line
          options={options}
          data={{
            datasets: [
              {
                backgroundColor: "rgba(204, 16, 52, 0.6)",
                borderColor: "#CC1034",
                data: data,
              },
            ],
          }}
        ></Line>
      )}
    </div>
  );
}

export default LineGraph;
