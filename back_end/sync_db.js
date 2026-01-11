const { ObserverRelation } = require('./src/database');

async function sync() {
    try {
        await ObserverRelation.sync({ force: false, alter: true });
        console.log('ObserverRelation table synced successfully.');
    } catch (error) {
        console.error('Error syncing table:', error);
    }
}

sync();
