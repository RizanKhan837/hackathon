
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const APIService = {
	sendQuery: (query) => {
		return axios.post(`${API_BASE_URL}/translate-query`, { query });
	  },
	
	  sendPdf: (pdfFile) => {
		const formData = new FormData();
		formData.append('pdfFile', pdfFile);
		return axios.post(`${API_BASE_URL}/translate-pdf`, formData, {
		  headers: {
			'Content-Type': 'multipart/form-data',
		  },
		});
	  },
	  getTableData: (result) => {
		return axios.post(`${API_BASE_URL}/translate-query-result`, { result }, {
		  headers: {
			'Content-Type': 'application/json',
		  },
		});
	  },
};

export default APIService;