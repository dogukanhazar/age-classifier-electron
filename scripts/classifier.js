const { ipcRenderer, remote } = require('electron');
const { dialog } = remote;

let imagesArray = [];
let i = 0;

// init DOM property
let prevBtn = document.querySelector('#prevBtn');
let nextBtn = document.querySelector('#nextBtn');
let ageSaveBtn = document.querySelector('#ageSaveBtn');
let ageTextArea = document.querySelector('#ageTextArea');
let rowImg = document.querySelector('#rowImg');
let currentImgCount = document.querySelector('#currentImgCount');
let totalImgCount = document.querySelector('#totalImgCount');
let arrowLeft = document.querySelector('#arrowLeft');
let saveExitBtn = document.querySelector('#saveExitBtn');

// arrow left click listener
arrowLeft.addEventListener('click', () => {
	window.location.replace('../pages/index.html');
});

// prev button click listener
prevBtn.addEventListener('click', () => {
	prevImg();
});

// next button click listener
nextBtn.addEventListener('click', () => {
	nextImg();
});

// ageSaveBtn button click listener
ageSaveBtn.addEventListener('click', () => {
	changeAge();
});

// right arrow key listener
if (imagesArray) {
	document.addEventListener('keyup', (event) => {
		if (event.key === 'ArrowRight') {
			nextImg();
		}
	});
}

// left arrow key listener
if (imagesArray) {
	document.addEventListener('keyup', (event) => {
		if (event.key === 'ArrowLeft') {
			prevImg();
		}
	});
}

// ageTextArea "Enter" key listener
ageTextArea.addEventListener('keyup', (event) => {
	if (event.keyCode === 13) {
		changeAge();
	}
});

// saveExitBtn button click listener
saveExitBtn.addEventListener('click', () => {
	ipcRenderer.send('changed-images-array', imagesArray);
});

// classifier.html onLoad listener
window.onload = () => {
	// send onload message to main.js(electron)
	ipcRenderer.send('on-load-classifier-page');

	// imagesArray data main.js(electron) to mainWindow(classifier.html)
	ipcRenderer.on('images-array', (event, data) => {
		imagesArray = data;
		if (imagesArray) {
			totalImgCount.textContent = imagesArray.length;
			showImg(imagesArray[0]);
		}
	});
};

// custom functions
// ageTextArea placeholder age changer
let changeAge = () => {
	if (!(ageTextArea.value === '')) {
		if (parseInt(ageTextArea.value) > 0) {
			ageTextArea.placeholder = ageTextArea.value;
			imagesArray[i].toNewFolder = ageTextArea.value;
			ageTextArea.value = '';
			showMessage('info', 'Age Changed.');
		} else {
			ageTextArea.value = '';
			showMessage('error', 'Wrong Age!');
		}
	}
};
// electron showMessageBox dialog
let showMessage = (type, message) => {
	dialog.showMessageBox({
		type: type,
		message: message,
		title: 'Information',
	});
};

let showImg = (imageArray) => {
	rowImg.src = imageArray.path;
	ageTextArea.placeholder = imageArray.toFolder;
	currentImgCount.textContent = imageArray.id;
};

let prevImg = () => {
	if (i > 0) {
		i -= 1;
	} else {
		i = 0;
	}
	showImg(imagesArray[i]);
	ageTextArea.focus();
	ageTextArea.value = '';
};

let nextImg = () => {
	if (i < imagesArray.length - 1) {
		i += 1;
	} else {
		i = imagesArray.length - 1;
	}
	showImg(imagesArray[i]);
	ageTextArea.focus();
	ageTextArea.value = '';
};
