const electron = require('electron');
const { app, BrowserWindow, ipcMain, dialog } = electron;
const path = require('path');
const fs = require('fs');

let mainWindow, imagesArray, mainFolderPath;

const createMainWindow = () => {
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		minWidth: 800,
		minHeight: 600,
		autoHideMenuBar: true,
		icon: path.join(__dirname, 'assets', 'icons', 'age-classifier.ico'),
		show: false,

		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true,
		},
	});

	// mainWindow.webContents.openDevTools();
	mainWindow.loadFile(path.join(__dirname, 'pages', 'index.html'));
	mainWindow.once('ready-to-show', () => {
		mainWindow.show();
	});
};

app.on('ready', () => {
	createMainWindow();

	// folderpath data listener from mainWindow(index.html) to main.js(electron). "data" is path for folder
	ipcMain.on('folder-path', (event, data) => {
		mainFolderPath = data;
		imagesArray = filterImgFile(data);
	});

	// classifier.html page onload listener then send imagesArray data from main.js(electron) to mainWindow(classifier.html)
	ipcMain.on('on-load-classifier-page', () => {
		mainWindow.webContents.send('images-array', imagesArray);
	});

	// changed imagesArray listener from mainWindow(classifier.html) to main.js(electron). "data" is age changed images array.
	ipcMain.on('changed-images-array', (event, data) => {
		dialog
			.showMessageBox(mainWindow, {
				//Can be "none", "info", "error", "question" or "warning".
				type: 'question',
				title: 'Information',
				message: 'Do you really want to quit?',
				detail: 'Press Yes button to save and quit',
				buttons: ['Yes', 'Cancel'],
				//The index of the button to be used to cancel the dialog, via the Esc key
				cancelId: 1,
				//Index of the button in the buttons array which will be selected by default when the message box opens.
				defaultId: 0,
				//Prevent Electron on Windows to figure out which one of the buttons are common buttons (like "Cancel" or "Yes")
				noLink: true,
				//Normalize the keyboard access keys
				normalizeAccessKeys: true,
			})
			.then(({ response }) => {
				if (response === 0) {
					// yes button pressed
					newImagesArray = newImgPath(data);
					moveImages(newImagesArray).then((resolve) => {
						if (resolve) {
							setTimeout(() => {
								clearEmptyFolder(mainFolderPath);
							}, 1000);
							setTimeout(() => {
								clearEmptyFolder(mainFolderPath);
								outOfTheApp();
							}, 1000);
						}
					});
				} else if (response === 1) {
					// cancel button pressed
				}
			});
	});
});

app.on('window-all-closed', () => {
	outOfTheApp();
});

// custom functions
let newImgPath = (imagesArray) => {
	for (i in imagesArray) {
		let splitPath = imagesArray[i].toFolderPath.split(path.sep).slice();
		splitPath[splitPath.length - 1] = imagesArray[i].toFolder;
		newFolderPath = splitPath.join(path.sep);
		newFilePath = path.join(
			newFolderPath,
			imagesArray[i].name + imagesArray[i].ext
		);
		imagesArray[i].newPath = newFilePath;
		imagesArray[i].newToFolderPath = newFolderPath;
	}
	return imagesArray;
};

let moveImages = (newImagesArray) => {
	newImagesArray.forEach((newImageObj) => {
		fs.exists(newImageObj.newToFolderPath, (response) => {
			if (!response) {
				fs.mkdir(newImageObj.newToFolderPath, (error) => {
					if (error) {
						if (error.code === 'EEXIST') {
							fs.rename(newImageObj.path, newImageObj.newPath, (error) => {
								if (error) {
									console.error(error);
								}
							});
						}
					} else {
						fs.rename(newImageObj.path, newImageObj.newPath, (error) => {
							if (error) {
								console.error(error);
							}
						});
					}
				});
			} else {
				fs.rename(newImageObj.path, newImageObj.newPath, (error) => {
					if (error) {
						console.error(error);
					}
				});
			}
		});
	});
	return Promise.resolve(true);
};

let isEmptyFolder = (dir, callback) => {
	fs.readdirSync(dir).forEach((f) => {
		let dirPath = path.join(dir, f);
		let isDirectory = fs.statSync(dirPath).isDirectory();
		if (isDirectory) {
			fs.readdirSync(dirPath).length === 0
				? callback({ dirPath: dirPath, isEmpty: true })
				: isEmptyFolder(dirPath, callback);
		}
	});
};

let clearEmptyFolder = (mainFolderPath) => {
	isEmptyFolder(mainFolderPath, (res) => {
		if (res.isEmpty) {
			fs.rmdirSync(res.dirPath);
		}
	});
};

let walkDir = (dir, callback) => {
	fs.readdirSync(dir).forEach((f) => {
		let dirPath = path.join(dir, f);
		let isDirectory = fs.statSync(dirPath).isDirectory();
		isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
	});
};

let filterImgFile = (folderPath) => {
	let imagesArray = [];
	let i = 0;
	walkDir(folderPath, (filePath) => {
		filePathParse = path.parse(filePath);
		fileExt = filePathParse.ext.toLowerCase();
		if (fileExt == '.jpg' || fileExt == '.png' || fileExt == '.jpeg') {
			i += 1;
			let image = {
				id: i,
				name: filePathParse.name,
				ext: filePathParse.ext,
				path: filePath,
				toFolderPath: filePathParse.dir,
				toFolder: path.parse(filePathParse.dir).base,
			};
			imagesArray.push(image);
		} else {
		}
	});
	return imagesArray;
};

let outOfTheApp = () => {
	app.quit();
	mainWindow = null;
};
