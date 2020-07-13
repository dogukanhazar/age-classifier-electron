const { ipcRenderer } = require('electron');
const { dialog } = require('electron').remote;
const path = require('path');

// init DOM property
let inputFileBtn = document.querySelector('#inputFileBtn');
let startBtn = document.querySelector('#startBtn');
let inputChooseFolder = document.querySelector('#inputChooseFolder');

// inputFileBtn button click listener and electron show open file dialog
inputFileBtn.addEventListener('click', () => {
	dialog
		.showOpenDialog({
			properties: ['openDirectory'],
			// filters: [
			// 	{ name: 'Images', extensions: ['jpg', 'png', 'gif'] },
			// 	{ name: 'Movies', extensions: ['mkv', 'avi', 'mp4'] },
			// 	{ name: 'Custom File Type', extensions: ['as'] },
			// 	{ name: 'All Files', extensions: ['*'] },
			// ],
		})
		.then((result) => {
			if (!result.canceled) {
				var folderpath = result.filePaths[0];
				var foldername = path.parse(folderpath).base;
				inputChooseFolder.placeholder = foldername;
				ipcRenderer.send('folder-path', folderpath);
				startBtn.disabled = false;
			}
		})
		.catch((error) => {
			console.log(error);
		});
});

// startBtn button click listener and changed html page
startBtn.addEventListener('click', () => {
	// window.open('../pages/classifier.html', '_self');
	window.location.replace('../pages/classifier.html');
});
