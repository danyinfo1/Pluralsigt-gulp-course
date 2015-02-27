module.exports = function() {
    
    var client = './src/client/';
    
    var config = {
        temp: './.temp/',
        
        /**
        * File paths
        */
        alljs: [
            './src/**/*.js',
            './*.js'
        ],
        less: [client + 'styles/styles.less']
    };
    
    return config;
};