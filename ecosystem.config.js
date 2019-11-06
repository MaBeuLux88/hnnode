module.exports = {
  apps : [{
    name: 'Hnnode',
    script: 'index.js',
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      SLACK_HNMONITOR_WEBHOOK_URL:'https://hooks.slack.com/services/SOMESTUFF/FOOBAR/LettersAndNumbers'
    },
    env_production: {
      NODE_ENV: 'production',
      SLACK_HNMONITOR_WEBHOOK_URL:'https://hooks.slack.com/services/SOMESTUFF/FOOBAR/LettersAndNumbers'
    }
  }]
};
