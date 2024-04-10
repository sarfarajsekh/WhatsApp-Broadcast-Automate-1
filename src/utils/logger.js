import fs from 'fs';

export class Logger {
    #logFileName
    #logDir
    constructor(logFileName, logDir) {
        this.#logDir = logDir
        this.#logFileName = logFileName
        fs.appendFileSync(`${logDir}/${logFileName}`, '')
    }

    getFileName() {
        return this.#logFileName;
    }

    setFileName(fileName) {
        this.#logFileName = fileName
    }

    log(logString) {
        fs.appendFileSync(`${this.#logDir}/${this.#logFileName}`, `${logString}\n`);
    }

    logOverwrite(logString) {
        fs.writeFileSync(`${this.#logDir}/${this.#logFileName}`, `${logString}\n`)
    }
}

export class OperationLogger extends Logger {
    constructor({operationName, groupName, logFileName}) {
        const dateAndTime = new Date().toLocaleString().replaceAll(', ', '-').replaceAll(' ', '-').replaceAll('/', '-');
        let fileName = `${groupName}-${operationName}-${dateAndTime}.csv`
        if(logFileName) {
            fileName = `${logFileName}-${dateAndTime}.csv`
        }
        super(fileName, './logs');
        this.log('Number,Success/Failure,Date,Time');
    }

    logOperationResult({success, currentNumber}) {
        let currentDate = new Date();
        let localeDate = currentDate.toLocaleDateString();
        let localeTime = currentDate.toLocaleTimeString();
        let logString = `${currentNumber},${success? 'success' : 'Failure'},${localeDate},${localeTime}`
        this.log(logString)
    }
}

export class ResultLogger extends Logger {
    constructor({groupName, logFileName}) {
        const dateAndTime = new Date().toLocaleString().replaceAll(', ', '-').replaceAll(' ', '-').replaceAll('/', '-');
        super(logFileName ? `${logFileName}.txt` : `${groupName}-${dateAndTime}.txt`, './output');
    }
}