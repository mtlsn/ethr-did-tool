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
const assert = require("assert");
const node_fetch_1 = require("node-fetch");
const baseUrl = 'http://localhost:3001';
const healthEndpoint = '/api/v1/health';
describe(`The ${healthEndpoint}`, () => {
    it('should return a 200 with a JSON response of {"success": true}.', () => __awaiter(this, void 0, void 0, function* () {
        const response = yield node_fetch_1.default(`${baseUrl}/api/v1/health`, {
            method: 'GET',
        });
        assert.equal(response.status, 200);
        const body = yield response.json();
        assert.equal(body.success, true);
    }));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlzYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3Rlc3QvbWlzYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsaUNBQWdDO0FBQ2hDLDJDQUE4QjtBQUU5QixNQUFNLE9BQU8sR0FBRyx1QkFBdUIsQ0FBQTtBQUN2QyxNQUFNLGNBQWMsR0FBRyxnQkFBZ0IsQ0FBQTtBQUV2QyxRQUFRLENBQUMsT0FBTyxjQUFjLEVBQUUsRUFBRSxHQUFHLEVBQUU7SUFDckMsRUFBRSxDQUFDLGdFQUFnRSxFQUFFLEdBQVMsRUFBRTtRQUM5RSxNQUFNLFFBQVEsR0FBRyxNQUFNLG9CQUFLLENBQUMsR0FBRyxPQUFPLGdCQUFnQixFQUFFO1lBQ3ZELE1BQU0sRUFBRSxLQUFLO1NBQ2QsQ0FBQyxDQUFBO1FBQ0YsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFBO1FBQ2xDLE1BQU0sSUFBSSxHQUFHLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBRSxDQUFBO1FBQ2xDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQTtJQUNsQyxDQUFDLENBQUEsQ0FBQyxDQUFBO0FBQ0osQ0FBQyxDQUFDLENBQUEifQ==