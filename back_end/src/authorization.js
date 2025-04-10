const crypto = require('crypto');

const passwordManager = (() => {
    // 솔트 생성 함수
    const generateSalt = () => {
        return crypto.randomBytes(16).toString('hex');
    };

    // 비밀번호 해싱 함수
    const hashPassword = async (password, salt) => {
        return new Promise((resolve, reject) => {
            crypto.pbkdf2(password, salt, 10000, 64, 'sha512', (err, derivedKey) => {
                if (err) reject(err);
                resolve(derivedKey.toString('hex'));
            });
        });
    };

    return {
        // 새 비밀번호 해싱
        createHash: async (password) => {
            const salt = generateSalt();
            const hash = await hashPassword(password, salt);
            return {
                hash,
                salt
            };
        },

        // 비밀번호 검증
        verifyPassword: async (password, hash, salt) => {
            const newHash = await hashPassword(password, salt);
            return newHash === hash;
        },
        
        // hashPassword 함수도 외부에서 사용할 수 있도록 노출
        hashPassword
    };
})();

module.exports = passwordManager;