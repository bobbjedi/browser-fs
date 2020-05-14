


const fsCreator = onReady => {
	let fs;
	window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
	window.webkitStorageInfo.requestQuota(PERSISTENT, 1024 * 1024, 
		grantedBytes => window.requestFileSystem(PERSISTENT, grantedBytes, onInitFs, errorHandler),
		e => console.log('Error', e)
	);

	async function onInitFs(fs_) {
		fs = fs_;
		onReady && onReady(fs.name);
	}	
	function errorHandler(e) {
		console.log('Error: ' + e);
	}

	/**
	 * @param {String} name
	 */
	function readFile(name) {
		return new Promise(resolve => {
			fs.root.getFile(name, {}, function (fileEntry) {
				fileEntry.file(function (file) {
					var reader = new FileReader();
					reader.onloadend = function () {
						resolve(this.result);
					};
					reader.readAsText(file);
				}, e => { errorHandler(e); resolve(false) });
			}, e => { errorHandler(e); resolve(false) });
		});
	};
	
	/**
	 * 
	 * @param {String} name 
	 * @param {String|undefined} content 
	 * @param {Boolean|undefined} isAppend 
	 */
	
	function writeFile(name, content, isAppend) {
		return new Promise(resolve => {
			fs.root.getFile(name, { create: true }, function (fileEntry) {
				fileEntry.createWriter(function (fileWriter) {
					
					isAppend && fileWriter.seek(fileWriter.length);
					
					fileWriter.onwriteend = () => resolve(true);
					
					fileWriter.onerror = e => {
						console.log('Error writeFile', e);
						resolve(false);
					};
	
					fileWriter.write(new Blob([content], { type: "text/plain" }));
				}, e => { errorHandler(e); resolve(false) });
		
			}, e => { errorHandler(e); resolve(false) });
		});
	}

	return {
		readFile,
		writeFile
	}
};

const fs = fsCreator(async fsName => {
	console.clear();
	console.log('Opened file system: ' + fsName);

	let fileName = 'creator1ss.txt';
	console.log('Old content', await fs.readFile(fileName));
	console.log('isWrited:', await fs.writeFile(fileName, 'Test content.....' + new Date().getTime()));
	console.log('new content', await fs.readFile(fileName));
});
