// 로그를 저장하고 관리하는 클로저 함수
const logger = () => {
    let logs = [];
    const fs = require('fs');
    const path = require('path');

    // 로그 파일이 저장될 디렉토리 생성
    const LOG_DIR = path.join(__dirname, '../logs');
    if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR, { recursive: true });
    }

    // 오늘 날짜의 로그 파일명 생성
    const getLogFileName = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return path.join(LOG_DIR, `${year}-${month}-${day}.log`);
    };

    // 로그를 파일에 저장하는 함수
    const saveLogToFile = (logEntry) => {
        const logFile = getLogFileName();
        const logString = JSON.stringify(logEntry) + '\n';
        
        try {
            fs.appendFileSync(logFile, logString);
        } catch (error) {
            console.error('로그 파일 저장 중 오류 발생:', error);
        }
    };
    return {
        // 로그 추가
        addLog: (json, type = 'info') => {
            const timestamp = new Date().toISOString();
            // Add timestamp to json object
            const jsonWithTimestamp = {
                ...json,
                timestamp
            };
            saveLogToFile(jsonWithTimestamp);
            return jsonWithTimestamp;
        }
    };
};

module.exports = {
    logger
};