import React, { useState } from "react";
import Papa from "papaparse";
import Dropzone from "react-dropzone";

import "./App.css";

const App = () => {
  const [data, setData] = useState([]);

  const handleFileDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    const text = await file.text();
    const result = Papa.parse(text, { header: true });
    setData(result.data);
  };

  const findLongestOverlap = (data) => {
    let longestOverlap = null;

    for (let i = 0; i < data.length; i++) {
      const { EmpID: EmpID1, ProjectID, DateFrom, DateTo } = data[i];
      const startDate = new Date(DateFrom);
      const endDate = DateTo === "NULL" ? new Date() : new Date(DateTo);

      for (let j = i + 1; j < data.length; j++) {
        const {
          EmpID: EmpID2,
          ProjectID: nextProjectID,
          DateFrom: nextDateFrom,
          DateTo: nextDateTo,
        } = data[j];
        if (ProjectID === nextProjectID) {
          const nextStartDate = new Date(nextDateFrom);
          const nextEndDate =
            nextDateTo === "NULL" ? new Date() : new Date(nextDateTo);

          const overlapStart =
            startDate > nextStartDate ? startDate : nextStartDate;
          const overlapEnd = endDate < nextEndDate ? endDate : nextEndDate;

          const overlapDuration = calculateBusinessDays(
            overlapStart,
            overlapEnd
          );
          if (!longestOverlap || overlapDuration > longestOverlap.overlap) {
            longestOverlap = {
              EmpID1,
              EmpID2,
              ProjectID,
              overlap: overlapDuration,
            };
          }
        }
      }
    }

    return longestOverlap;
  };

  const calculateBusinessDays = (startDate, endDate) => {
    const oneDay = 24 * 60 * 60 * 1000;
    let count = 0;
    let currentDay = new Date(startDate);

    while (currentDay <= endDate) {
      const dayOfWeek = currentDay.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      currentDay = new Date(currentDay.getTime() + oneDay);
    }

    return count;
  };

  const result = findLongestOverlap(data);
  const commonProjectExists = !!result?.ProjectID;

  return (
    <div className="container">
      <h1 className="title">Employee Projects</h1>
      <Dropzone onDrop={handleFileDrop}>
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()} className="dropzone">
            <input {...getInputProps()} />
            <p>Drag and drop a CSV file here, or click to select a file</p>
          </div>
        )}
      </Dropzone>
      {data.length > 0 && (
        <div>
          <h2 className="subtitle">All Projects</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Project ID</th>
                <th>Date From</th>
                <th>Date To</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  <td>{row.EmpID}</td>
                  <td>{row.ProjectID}</td>
                  <td>{row.DateFrom}</td>
                  <td>{row.DateTo || "NULL"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2 className="subtitle">Common Projects</h2>
          {commonProjectExists ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Employee ID #1</th>
                  <th>Employee ID #2</th>
                  <th>Project ID</th>
                  <th>Days Worked</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{result.EmpID1}</td>
                  <td>{result.EmpID2}</td>
                  <td>{result.ProjectID}</td>
                  <td>{result.overlap}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p>No common projects found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
