module.exports = function override(config, env) {
  // webpack-dev-server의 allowedHosts 설정 추가
  // studyhalltimer.com 도메인으로 접속 허용
  
  // CRA 5.x에서는 devServer 설정을 직접 수정해야 함
  if (env === 'development') {
    // webpack-dev-server 설정
    config.devServer = config.devServer || {};
    
    // 허용할 호스트 목록 설정 (webpack-dev-server v4+)
    config.devServer.allowedHosts = 'all';
    
    // 또는 특정 호스트만 허용하려면:
    // config.devServer.allowedHosts = [
    //   'studyhalltimer.com',
    //   '.studyhalltimer.com',
    //   'localhost',
    //   '127.0.0.1'
    // ];
  }
  
  return config;
};

