import { utils, writeFile } from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const exportToExcel = (data, fileName) => {
  try {
    const worksheet = utils.json_to_sheet(data);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    writeFile(workbook, `${fileName}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
  }
};

export const exportToCSV = (data, fileName) => {
  try {
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const cell = row[header]?.toString() || '';
        return cell.includes(',') ? `"${cell}"` : cell;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
  }
};

export const exportToPDF = (data, fileName, title) => {
  const doc = new jsPDF();
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(header => row[header]));

  doc.text(title, 14, 15);
  doc.autoTable({
    head: [headers],
    body: rows,
    startY: 25,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: [76, 175, 80],
      textColor: 255
    }
  });

  doc.save(`${fileName}.pdf`);
};

export const formatDataForExport = (data, type) => {
  try {
    const formattedData = data.map(item => {
      const formatted = { ...item };
      // Remove any complex objects or unnecessary fields
      delete formatted.id;
      // Format dates
      if (formatted.date) {
        formatted.date = new Date(formatted.date).toLocaleDateString();
      }
      if (formatted.startTime) {
        formatted.startTime = new Date(formatted.startTime).toLocaleString();
      }
      if (formatted.endTime) {
        formatted.endTime = new Date(formatted.endTime).toLocaleString();
      }
      // Format currency
      if (formatted.amount) {
        formatted.amount = typeof formatted.amount === 'number' 
          ? `₹${formatted.amount.toFixed(2)}`
          : formatted.amount;
      }
      return formatted;
    });

    return formattedData;
  } catch (error) {
    console.error('Error formatting data:', error);
    return data;
  }
};
