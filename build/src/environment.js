"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
var PipelineStages;
(function (PipelineStages) {
    PipelineStages["development"] = "development";
    PipelineStages["staging"] = "staging";
    PipelineStages["production"] = "production";
})(PipelineStages = exports.PipelineStages || (exports.PipelineStages = {}));
function environmentVariable(name, optional) {
    const value = process.env[name];
    if ((value === undefined || value === '') &&
        (optional === false || optional === undefined)) {
        throw new Error(`Expected environment variable ${name}`);
    }
    return value;
}
const getPipelineStage = () => {
    const stage = environmentVariable('PIPELINE_STAGE');
    if (stage in PipelineStages) {
        return PipelineStages[stage];
    }
    const stagesStr = JSON.stringify(Object.keys(PipelineStages));
    throw Error(`Please define PIPELINE_STAGE as one of: ${stagesStr}.`);
};
function getTokenExpiration() {
    const variable = 'TOKEN_EXPIRATION_SECONDS';
    const value = Number(environmentVariable(variable));
    if (isNaN(value))
        throw new Error(`invalid ${variable}`);
    if (value <= 0)
        throw new Error(`${variable} must be > 0`);
    return value;
}
exports.env = {
    nodeEnv: () => environmentVariable('NODE_ENV'),
    pipelineStage: () => getPipelineStage(),
    trustProxy: () => utils_1.toBoolean(environmentVariable('TRUST_PROXY')),
    tokenExpirationSeconds: () => getTokenExpiration(),
    logUrl: () => environmentVariable('LOG_URL', true),
    logUser: () => environmentVariable('LOG_USER', true),
    logPassword: () => environmentVariable('LOG_PASSWORD', true),
    disableRateLimiting: () => utils_1.toBoolean(environmentVariable('DISABLE_RATE_LIMITING', true)),
    allowAnonymous: () => utils_1.toBoolean(environmentVariable('ALLOW_ANONYMOUS')),
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52aXJvbm1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZW52aXJvbm1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtQ0FBaUM7QUFFakMsSUFBWSxjQUlYO0FBSkQsV0FBWSxjQUFjO0lBQ3hCLDZDQUEyQixDQUFBO0lBQzNCLHFDQUFtQixDQUFBO0lBQ25CLDJDQUF5QixDQUFBO0FBQzNCLENBQUMsRUFKVyxjQUFjLEdBQWQsc0JBQWMsS0FBZCxzQkFBYyxRQUl6QjtBQUlELFNBQVMsbUJBQW1CLENBQTRCLElBQVksRUFBRSxRQUFZO0lBQ2hGLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUE7SUFFL0IsSUFDRSxDQUFDLEtBQUssS0FBSyxTQUFTLElBQUksS0FBSyxLQUFLLEVBQUUsQ0FBQztRQUNyQyxDQUFDLFFBQVEsS0FBSyxLQUFLLElBQUksUUFBUSxLQUFLLFNBQVMsQ0FBQyxFQUM5QztRQUNBLE1BQU0sSUFBSSxLQUFLLENBQUMsaUNBQWlDLElBQUksRUFBRSxDQUFDLENBQUE7S0FDekQ7SUFDRCxPQUFPLEtBQWtDLENBQUE7QUFDM0MsQ0FBQztBQUVELE1BQU0sZ0JBQWdCLEdBQUcsR0FBbUIsRUFBRTtJQUM1QyxNQUFNLEtBQUssR0FBRyxtQkFBbUIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO0lBRW5ELElBQUksS0FBSyxJQUFJLGNBQWMsRUFBRTtRQUMzQixPQUFPLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQTtLQUM3QjtJQUVELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFBO0lBQzdELE1BQU0sS0FBSyxDQUFDLDJDQUEyQyxTQUFTLEdBQUcsQ0FBQyxDQUFBO0FBQ3RFLENBQUMsQ0FBQTtBQUVELFNBQVMsa0JBQWtCO0lBQ3pCLE1BQU0sUUFBUSxHQUFHLDBCQUEwQixDQUFBO0lBQzNDLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFBO0lBQ25ELElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQztRQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsV0FBVyxRQUFRLEVBQUUsQ0FBQyxDQUFBO0lBQ3hELElBQUksS0FBSyxJQUFJLENBQUM7UUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLEdBQUcsUUFBUSxjQUFjLENBQUMsQ0FBQTtJQUMxRCxPQUFPLEtBQUssQ0FBQTtBQUNkLENBQUM7QUFFWSxRQUFBLEdBQUcsR0FBRztJQUNqQixPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsbUJBQW1CLENBQUMsVUFBVSxDQUFDO0lBQzlDLGFBQWEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRTtJQUN2QyxVQUFVLEVBQUUsR0FBRyxFQUFFLENBQUMsaUJBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUMvRCxzQkFBc0IsRUFBRSxHQUFHLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRTtJQUNsRCxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsbUJBQW1CLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQztJQUNsRCxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsbUJBQW1CLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQztJQUNwRCxXQUFXLEVBQUUsR0FBRyxFQUFFLENBQUMsbUJBQW1CLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQztJQUM1RCxtQkFBbUIsRUFBRSxHQUFHLEVBQUUsQ0FDeEIsaUJBQVMsQ0FBQyxtQkFBbUIsQ0FBQyx1QkFBdUIsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMvRCxjQUFjLEVBQUUsR0FBRyxFQUFFLENBQUMsaUJBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0NBQ3hFLENBQUEifQ==