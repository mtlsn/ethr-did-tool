"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./src/utils");
const fs = require("fs");
const ca = '/var/run/secrets/pg_ca';
exports.production = {
    user: utils_1.udefCoalesce(process.env.POSTGRES_USER, 'postgres'),
    password: process.env.POSTGRES_PASSWORD,
    host: utils_1.udefCoalesce(process.env.POSTGRES_HOST, 'productiondb'),
    port: utils_1.udefCoalesce(process.env.POSTGRES_PORT, 5432),
    database: utils_1.udefCoalesce(process.env.POSTGRES_DATABASE, 'postgres'),
    ssl: fs.existsSync(ca) ? { ca: fs.readFileSync(ca) } : undefined,
};
exports.mocha = {
    user: utils_1.udefCoalesce(process.env.POSTGRES_USER, 'postgres'),
    password: process.env.POSTGRES_PASSWORD,
    host: 'localhost',
    port: 5434,
    database: utils_1.udefCoalesce(process.env.POSTGRES_DATABASE, 'thedude'),
};
exports.development = {
    user: utils_1.udefCoalesce(process.env.POSTGRES_USER, 'postgres'),
    password: process.env.POSTGRES_PASSWORD,
    host: 'host.docker.internal',
    database: utils_1.udefCoalesce(process.env.POSTGRES_DATABASE, 'thedude'),
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YWJhc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9kYXRhYmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVDQUF3QztBQUN4Qyx5QkFBd0I7QUFFeEIsTUFBTSxFQUFFLEdBQUcsd0JBQXdCLENBQUE7QUFFdEIsUUFBQSxVQUFVLEdBQUc7SUFDeEIsSUFBSSxFQUFFLG9CQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsVUFBVSxDQUFDO0lBQ3pELFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQjtJQUN2QyxJQUFJLEVBQUUsb0JBQVksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxjQUFjLENBQUM7SUFDN0QsSUFBSSxFQUFFLG9CQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDO0lBQ25ELFFBQVEsRUFBRSxvQkFBWSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEVBQUUsVUFBVSxDQUFDO0lBQ2pFLEdBQUcsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7Q0FDL0QsQ0FBQTtBQUNZLFFBQUEsS0FBSyxHQUFHO0lBQ25CLElBQUksRUFBRSxvQkFBWSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLFVBQVUsQ0FBQztJQUN6RCxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUI7SUFDdkMsSUFBSSxFQUFFLFdBQVc7SUFDakIsSUFBSSxFQUFFLElBQUk7SUFDVixRQUFRLEVBQUUsb0JBQVksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLFNBQVMsQ0FBQztDQUNqRSxDQUFBO0FBQ1ksUUFBQSxXQUFXLEdBQUc7SUFDekIsSUFBSSxFQUFFLG9CQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsVUFBVSxDQUFDO0lBQ3pELFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQjtJQUN2QyxJQUFJLEVBQUUsc0JBQXNCO0lBQzVCLFFBQVEsRUFBRSxvQkFBWSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEVBQUUsU0FBUyxDQUFDO0NBQ2pFLENBQUEifQ==