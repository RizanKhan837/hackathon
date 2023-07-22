import React, { useEffect, useState } from 'react';
import './static/style.css';
import { faCircleArrowUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import APIService from './APIService.jsx';
import * as XLSX from "xlsx"
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';

const OrdersTable = ({result}) => {
  const [orders, setOrders] = useState([]);
  const [queryResult, setQueryResult] = useState("")
  const [searchValue, setSearchValue] = useState('');
  const [tableRows, setTableRows] = useState([]);
  const [tableHeadings, setTableHeadings] = useState([]);

    // Search functionality

      /* const searchTable = () => {
      const searchInput = searchValue.toLowerCase();
      const tableRows = document.querySelectorAll('#table-data tr');
  
      tableRows.forEach((row) => {
        const rowData = row.getElementsByTagName('td');
        let match = false;
  
        Array.from(rowData).forEach((cell) => {
          if (cell.textContent.toLowerCase().includes(searchInput)) {
            match = true;
          }
        });
  
        if (match) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    }; */

    const searchTable = () => {
      const searchInput = searchValue.toLowerCase();
      const tableHeaders = document.querySelectorAll('th');
      const tableRows = document.querySelectorAll('#table-data tr');
    
      tableHeaders.forEach((header) => {
        header.style.display = ''; // Show all table headers
      });
    
      tableRows.forEach((row, rowIndex) => {
        const rowData = row.querySelectorAll('td');
        let match = false;
    
        rowData.forEach((cell, columnIndex) => {
          if (cell.textContent.toLowerCase().includes(searchInput) || searchInput === '') {
            match = true;
          }
          if (searchInput === '') { // Show the corresponding table header if searchInput is empty
            tableHeaders[columnIndex].style.display = '';
          } else if (rowIndex > 0) { // Hide the corresponding table header for non-header rows
            tableHeaders[columnIndex].style.display = 'none';
          }
        });
    
        if (match || searchInput === '') {
          row.style.display = ''; // Show row if there is a match or searchInput is empty
        } else {
          row.style.display = 'none'; // Hide row if there is no match
        }
      });
    };

    // Sorting functionality
    // const sortTable = (column, sortAsc) => {
    //   [...tableRows]
    //     .sort((a, b) => {
    //       let firstRow = a.querySelectorAll('td')[column].textContent.toLowerCase();
    //       let secondRow = b.querySelectorAll('td')[column].textContent.toLowerCase();

    //       return sortAsc ? (firstRow < secondRow ? 1 : -1) : firstRow < secondRow ? -1 : 1;
    //     })
    //     .map((sortedRow) => document.querySelector('tbody').appendChild(sortedRow));
    // };
    const sortTable = (column, sortAsc) => {
      const tableRows = document.getElementsByTagName('tr');
      const rowsArray = [...tableRows];
    
      rowsArray.sort((a, b) => {
        const firstRow = a.getElementsByTagName('td')[column].textContent.toLowerCase();
        const secondRow = b.getElementsByTagName('td')[column].textContent.toLowerCase();
    
        return sortAsc ? (firstRow < secondRow ? 1 : -1) : firstRow < secondRow ? -1 : 1;
      });
    
      const tbody = document.querySelector('tbody');
      rowsArray.forEach((sortedRow) => tbody.appendChild(sortedRow));
    };
    

    // Converting HTML table to PDF
    // const toPDF = (table) => {
    //   const htmlCode = `
    //     <link rel="stylesheet" href="style.css">
    //     <main class="table">${table.innerHTML}</main>
    //   `;

    //   const newWindow = window.open();
    //   newWindow.document.write(htmlCode);

    //   setTimeout(() => {
    //     newWindow.print();
    //     newWindow.close();
    //   }, 400);
    // };

      /* const toPDF = (tableData) => {
      // const tableData = tableRef.current.cloneNode(true); // Clone the table element to avoid modifying the original table
    
      // Remove any Font Awesome icon elements from the cloned table
      const iconElements = tableData.getElementsByClassName('FontAwesomeIcon');
      while (iconElements.length > 0) {
        iconElements[0].parentNode.removeChild(iconElements[0]);
      }
    
      const htmlCode = `
        <link rel="stylesheet" href="style.css">
        <main class="table">${tableData.innerHTML}</main>
      `;
    
      const newWindow = window.open();
      newWindow.document.write(htmlCode);
    
      setTimeout(() => {
        newWindow.print();
        newWindow.close();
      }, 400);
    }; */


/*     const toPDF = (tableElement) => {
      const doc = new jsPDF('p', 'pt');
    
      const table = tableElement.cloneNode(true);
      const rows = Array.from(table.querySelectorAll('tr'));
    
      const data = rows.map((row) => {
        const cells = Array.from(row.querySelectorAll('td, th'));
        return cells.map((cell) => cell.innerText);
      });
    
      doc.autoTable({
        head: [data[0]], // Table headers
        body: data.slice(1), // Table rows (excluding headers)
      });
    
      doc.save('table_data.pdf');
    }; */

    const toPDF = (tableElement) => {
      const doc = new jsPDF.default();
    
      const table = tableElement.cloneNode(true);
      const rows = Array.from(table.querySelectorAll('tr'));
    
      const data = rows.map((row) => {
        const cells = Array.from(row.querySelectorAll('td, th'));
        return cells.map((cell) => cell.innerText);
      });
    
      doc.autoTable({
        head: [data[0]], // Table headers
        body: data.slice(1), // Table rows (excluding headers)
      });
    
      doc.save('table_data.pdf');
    };
    
    // Converting HTML table to JSON
    const toJSON = (table) => {
      let tableData = [];
      let tHead = [];

      const tHeadings = table.querySelectorAll('th');
      const tRows = table.querySelectorAll('tbody tr');

      for (let tHeading of tHeadings) {
        let actualHead = tHeading.textContent.trim().split(' ');
        tHead.push(actualHead.splice(0, actualHead.length - 1).join(' ').toLowerCase());
      }

      tRows.forEach((row) => {
        const rowObject = {};
        const tCells = row.querySelectorAll('td');

        tCells.forEach((tCell, cellIndex) => {
          const img = tCell.querySelector('img');
          if (img) {
            rowObject['customer image'] = decodeURIComponent(img.src);
          }
          rowObject[tHead[cellIndex]] = tCell.textContent.trim();
        });
        tableData.push(rowObject);
      });

      return JSON.stringify(tableData, null, 4);
    };

    // Converting HTML table to CSV File
    const toCSV = (table) => {
      const tHeads = table.querySelectorAll('th');
      const tbodyRows = table.querySelectorAll('tbody tr');

      const headings = [...tHeads]
        .map((head) => {
          let actualHead = head.textContent.trim().split(' ');
          return actualHead.splice(0, actualHead.length - 1).join(' ').toLowerCase();
        })
        .join(',') + ',' + 'image name';

      const tableData = [...tbodyRows]
        .map((row) => {
          const cells = row.querySelectorAll('td');
          const img = decodeURIComponent(row.querySelector('img').src);
          const dataWithoutImg = [...cells].map((cell) => cell.textContent.replace(/,/g, '.').trim()).join(',');

          return dataWithoutImg + ',' + img;
        })
        .join('\n');

      return headings + '\n' + tableData;
    };

    // Converting HTML table to EXCEL File
/*     const toExcel = (table) => {
      const tHeads = table.querySelectorAll('th');
      const tbodyRows = table.querySelectorAll('tbody tr');

      const headings = [...tHeads]
        .map((head) => {
          let actualHead = head.textContent.trim().split(' ');
          return actualHead.splice(0, actualHead.length - 1).join(' ').toLowerCase();
        })
        .join('\t') + '\t' + 'image name';

      const tableData = [...tbodyRows]
        .map((row) => {
          const cells = row.querySelectorAll('td');
          const img = decodeURIComponent(row.querySelector('img').src);
          const dataWithoutImg = [...cells].map((cell) => cell.textContent.trim()).join('\t');

          return dataWithoutImg + '\t' + img;
        })
        .join('\n');

      return headings + '\n' + tableData;
    };

    const downloadFile = (data, fileType, fileName = '') => {
      const a = document.createElement('a');
      a.download = fileName;
      const mimeTypes = {
        json: 'application/json',
        csv: 'text/csv',
        excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
      a.href = `data:${mimeTypes[fileType]};charset=utf-8,${encodeURIComponent(data)}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }; */


    /* const toExcel = (tableElement) => {
      // Get the table data
      const table = tableElement.cloneNode(true);
      const rows = Array.from(table.querySelectorAll('tr'));
    
      // Create a new workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.table_to_sheet(table);
    
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet 1');
    
      // Generate a data buffer from the workbook
      const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    
      // Convert the buffer to a Blob
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
      // Create a download link and trigger the download
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'table_data.xlsx';
      link.click();
    }; */

    const toExcel = (tableElement) => {
      const table = tableElement.cloneNode(true);
      const rows = Array.from(table.querySelectorAll('tr'));
    
      const data = rows.map((row) => {
        const cells = Array.from(row.querySelectorAll('td, th'));
        return cells.map((cell) => cell.innerText);
      });
    
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet 1');
    
      const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'table_data.xlsx';
      link.click();
    };
  
    const downloadFile = (content, fileFormat, fileName) => {
      const data = new Blob([content], { type: `text/${fileFormat}` });
      const blobURL = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = blobURL;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(blobURL);
    };

    useEffect(() => {
      fetchOrders();
    }, []);
  
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:5000/orders');
        console.log(response);
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.log('Error fetching orders:', error);
      }
    };

    if (result) {
      console.log("query is passing",result);
      APIService.getTableData(result)
      .then((response) => {
        console.log('Getting Table Data')
        console.log(response)
        let data = response.data;
        setQueryResult(data);
        console.log(queryResult);
      })
      .catch((error) => {
        //setLoading(false);
        console.log('Error:', error);
      });
    }

  let content;
  if (queryResult) {
    console.log(queryResult)
    console.log("Query Result Runs")
    content = queryResult.map((order) => (
      <tr key={order.ID}>
        <td>{order.ID}</td>
        <td className="expandable-cell">
          <div className="expandable-content">{order.Name}</div>
        </td>
        <td>{order.Email_ID}</td>
        <td className="expandable-cell">
          <div className="expandable-content">{order.Phone_No}</div>
        </td>
        <td className="expandable-cell">
          <div className="expandable-content">{order.Predicted_Field}</div>
        </td>
        <td className="expandable-cell">
          <div className="expandable-content">{order.Actual_skills}</div>
        </td>
        <td className="expandable-cell">
          <div className="expandable-content">{order.Degree}</div>
        </td>
      </tr>
    ));
  } else {
    console.log("Default Query Result Runs")
    content = orders.map((order) => (
      <tr key={order.ID}>
        <td>{order.ID}</td>
        <td className="expandable-cell">
          <div className="expandable-content">{order.Name}</div>
        </td>
        <td>{order.Email_ID}</td>
        <td className="expandable-cell">
          <div className="expandable-content">{order.Phone_No}</div>
        </td>
        <td className="expandable-cell">
          <div className="expandable-content">{order.Predicted_Field}</div>
        </td>
        <td className="expandable-cell">
          <div className="expandable-content">{order.Actual_skills}</div>
        </td>
        <td className="expandable-cell">
          <div className="expandable-content">{order.Degree}</div>
        </td>
      </tr>
    ))
  }

  return (
    <div className='HTML_Table'>
      <main className="table">
        <section className="table__header">
          <h1>Customer's Orders</h1>
          <div className="input-group">
            <input type="search" placeholder="Search Data..." 
            value={searchValue} 
            onChange={(e) => {setSearchValue(e.target.value); searchTable(); }} />
            <img src="src\Components\static\images\search.png" alt="" />
          </div>
          <div className="export__file">
            <label htmlFor="export-file" className="export__file-btn" title="Export File"></label>
            <input type="checkbox" id="export-file" />
            <div className="export__file-options">
              <label>
                Export As &nbsp; &#10140;
              </label>
              <label htmlFor="export-file" id="toPDF" onClick={() => toPDF(document.getElementById('table-data'))}>
                PDF <img src="src\Components\static\images\pdf.png" alt="" />
              </label>
              {/* <label htmlFor="export-file" id="toPDF" onClick={toPDF}>
                    PDF <img src="src\Components\static\images\pdf.png" alt="" />
              </label> */}
              {/* <label htmlFor="export-file" id="toJSON" onClick={() => {toJSON(document.getElementById('table-data')); downloadFile((document.getElementById('table-data')), 'json', 'filename.json'); }} >
                JSON <img src="src\Components\static\images\json.png" alt="" />
              </label> */}
              {/* <label htmlFor="export-file" id="toCSV" onClick={() => {toCSV(document.getElementById('table-data')); downloadFile((document.getElementById('table-data')), 'csv', 'filename.csv');}}> 
                CSV <img src="src\Components\static\images\csv.png" alt="" />
              </label> */}

              <label htmlFor="export-file" id="toEXCEL" onClick={() => { toExcel(document.getElementById('table-data')); }}>
                EXCEL <img src="src\Components\static\images\excel.png" alt="" />
              </label>

            </div>
          </div>
        </section>
        <section className="table__body">
          <div className='table__body-content'>
          <table>
            <tbody id="table-data">
              <tr>
                <th onClick={() => sortTable(0, true)}> Id <span className="icon-arrow"><FontAwesomeIcon icon={faCircleArrowUp} /></span></th>
                <th onClick={() => sortTable(1, true)}> Name <span className="icon-arrow"><FontAwesomeIcon icon={faCircleArrowUp} /></span></th>
                <th onClick={() => sortTable(2, true)}> Email <span className="icon-arrow"><FontAwesomeIcon icon={faCircleArrowUp} /></span></th>
                <th onClick={() => sortTable(2, true)}> Phone <span className="icon-arrow"><FontAwesomeIcon icon={faCircleArrowUp} /></span></th>
                <th onClick={() => sortTable(3, true)}> Field <span className="icon-arrow"><FontAwesomeIcon icon={faCircleArrowUp} /></span></th>
                <th onClick={() => sortTable(4, true)}> Skills <span className="icon-arrow"><FontAwesomeIcon icon={faCircleArrowUp} /></span></th>
                <th onClick={() => sortTable(5, true)}> Degree <span className="icon-arrow"><FontAwesomeIcon icon={faCircleArrowUp} /></span></th>
              </tr>
              {content}
            </tbody>
          </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default OrdersTable;
