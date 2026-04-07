import Conf from 'conf';

const schema = {
    apiUrl: {
        type: 'string',
        default: 'http://localhost:3000'
    },
    dbConfig: {
        type: 'object',
        default: {}
    }
};

const config = new Conf({
    projectName: 'db-insights-cli',
    schema
});

export default config;
