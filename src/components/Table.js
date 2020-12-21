import React from "react";
import "./Table.css";
import numeral from "numeral";
import { v4 as uuidv4 } from "uuid";
//The table on the right, recover the first fetch with all the countries data. Destructure the prop and put it into the table
function Table({ countries }) {
  return (
    <div className="table">
      {countries.map(({ country, cases }) => (
        <tr key={uuidv4()}>
          <td>{country}</td>
          <td>
            <strong>{numeral(cases).format("0,0")}</strong>
          </td>
        </tr>
      ))}
    </div>
  );
}

export default Table;
