require('dotenv').config();
const passwordManager = require('./authorization');

const testPasswords = async (password) => {
    try {
        // 테스트할 비밀번호
        const { hash, salt } = await passwordManager.createHash(password);
        console.log('생성된 해시:', hash);
        console.log('생성된 솔트:', salt);

        
    } catch (error) {
        console.error('에러 발생:', error);
    }
};

// 테스트 실행
console.log('비밀번호 관리자 테스트 시작\n');
testPasswords("1111").then(() => {
    console.log('\n비밀번호 해싱 완료');
});
