"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const environment_1 = require("./environment");
const node_fetch_1 = require("node-fetch");
const utils_1 = require("./utils");
function persistError(message, stack) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (environment_1.env.logUrl()) {
                yield utils_1.attempt(() => sendLog(message, stack), 3, 30000);
            }
            console.error(message, stack);
        }
        catch (error) {
            console.log(error);
            process.exit(1);
        }
    });
}
exports.persistError = persistError;
const sendLog = (message, stack) => __awaiter(this, void 0, void 0, function* () {
    const payload = {
        $app: 'vault',
        $type: 'event',
        $body: JSON.stringify({ message, stack, pipelineStage: environment_1.env.pipelineStage() }),
    };
    yield node_fetch_1.default(environment_1.env.logUrl(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${Buffer.from(`${environment_1.env.logUser()}:${environment_1.env.logPassword()}`).toString('base64')}`,
        },
        body: JSON.stringify(payload),
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsK0NBQWlDO0FBQ2pDLDJDQUE4QjtBQUM5QixtQ0FBK0I7QUFFL0IsU0FBc0IsWUFBWSxDQUFDLE9BQWUsRUFBRSxLQUFhOztRQUMvRCxJQUFJO1lBQ0YsSUFBSSxpQkFBRyxDQUFDLE1BQU0sRUFBRSxFQUFFO2dCQUNoQixNQUFNLGVBQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQTthQUN2RDtZQUNELE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFBO1NBQzlCO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDZCxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFBO1lBQ2xCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7U0FDaEI7SUFDSCxDQUFDO0NBQUE7QUFWRCxvQ0FVQztBQUVELE1BQU0sT0FBTyxHQUFHLENBQU8sT0FBZSxFQUFFLEtBQWEsRUFBRSxFQUFFO0lBQ3ZELE1BQU0sT0FBTyxHQUFHO1FBQ2QsSUFBSSxFQUFFLE9BQU87UUFDYixLQUFLLEVBQUUsT0FBTztRQUNkLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsaUJBQUcsQ0FBQyxhQUFhLEVBQUUsRUFBQyxDQUFDO0tBQzVFLENBQUE7SUFDRCxNQUFNLG9CQUFLLENBQUMsaUJBQUcsQ0FBQyxNQUFNLEVBQUcsRUFBRTtRQUN6QixNQUFNLEVBQUUsTUFBTTtRQUNkLE9BQU8sRUFBRTtZQUNQLGNBQWMsRUFBRSxrQkFBa0I7WUFDbEMsYUFBYSxFQUFFLFNBQVMsTUFBTSxDQUFDLElBQUksQ0FDakMsR0FBRyxpQkFBRyxDQUFDLE9BQU8sRUFBRSxJQUFJLGlCQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FDeEMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUU7U0FDdkI7UUFDRCxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUM7S0FDOUIsQ0FBQyxDQUFBO0FBQ0osQ0FBQyxDQUFBLENBQUEifQ==