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
const requestUtils_1 = require("../requestUtils");
exports.misc = (app) => {
    app.get('/api/v1/health', requestUtils_1.ipRateLimited(60, 'me'), requestUtils_1.apiOnly, requestUtils_1.asyncHandler(requestUtils_1.noValidator, () => __awaiter(this, void 0, void 0, function* () {
        return {
            status: 200,
            body: {
                success: true,
            },
        };
    })));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlzYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yb3V0ZXMvbWlzYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQ0Esa0RBQWlGO0FBRXBFLFFBQUEsSUFBSSxHQUFHLENBQUMsR0FBd0IsRUFBRSxFQUFFO0lBQy9DLEdBQUcsQ0FBQyxHQUFHLENBQ0wsZ0JBQWdCLEVBQ2hCLDRCQUFhLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUN2QixzQkFBTyxFQUNQLDJCQUFZLENBQUMsMEJBQVcsRUFBRSxHQUFTLEVBQUU7UUFDbkMsT0FBTztZQUNMLE1BQU0sRUFBRSxHQUFHO1lBQ1gsSUFBSSxFQUFFO2dCQUNKLE9BQU8sRUFBRSxJQUFJO2FBQ2Q7U0FDRixDQUFBO0lBQ0gsQ0FBQyxDQUFBLENBQUMsQ0FDSCxDQUFBO0FBQ0gsQ0FBQyxDQUFBIn0=