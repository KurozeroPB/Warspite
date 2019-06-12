module.exports = {
    apps: [{
        name: "Graf Spee",
        script: "build/src/index.js",
        instances: 1,
        autorestart: true,
        watch: false,
        exec_mode: "fork",
        env: {
            NODE_ENV: "development"
        },
        env_production: {
            NODE_ENV: "production"
        }
    }]
};
