module.exports = {
    apps : [{
        script: 'index.js',
        instances: 4,
        exec_mode: 'cluster',
        name: 'vim-backend'
    }],
};