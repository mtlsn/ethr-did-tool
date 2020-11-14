"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const safe_regex = require("safe-regex");
const regularExpressions_1 = require("../src/regularExpressions");
const url = 'http://localhost:3001';
describe('RegEx', () => {
    it('Basic auth regular expression is safe', () => {
        assert.equal(safe_regex(regularExpressions_1.default.requestUtils.basicAuth), true);
    });
    it('Auth uuid regular expression is safe', () => {
        assert.equal(safe_regex(regularExpressions_1.default.auth.uuid), true);
    });
    it('Fingerprint regular expressions are safe', () => {
        const fingerPrintRegExps = regularExpressions_1.default.auth.fingerprint;
        for (const regExPropKey in fingerPrintRegExps) {
            const regex = fingerPrintRegExps[regExPropKey];
            assert.equal(safe_regex(regex), true);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnZXgtc2FmZXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdGVzdC9yZWdleC1zYWZldHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxpQ0FBZ0M7QUFDaEMseUNBQXlDO0FBQ3pDLGtFQUEwRDtBQUUxRCxNQUFNLEdBQUcsR0FBRyx1QkFBdUIsQ0FBQTtBQUVuQyxRQUFRLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtJQUNyQixFQUFFLENBQUMsdUNBQXVDLEVBQUUsR0FBRyxFQUFFO1FBQy9DLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLDRCQUFrQixDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQTtJQUMzRSxDQUFDLENBQUMsQ0FBQTtJQUVGLEVBQUUsQ0FBQyxzQ0FBc0MsRUFBRSxHQUFHLEVBQUU7UUFDOUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsNEJBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFBO0lBQzlELENBQUMsQ0FBQyxDQUFBO0lBRUYsRUFBRSxDQUFDLDBDQUEwQyxFQUFFLEdBQUcsRUFBRTtRQUNsRCxNQUFNLGtCQUFrQixHQUFHLDRCQUFrQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUE7UUFDOUQsS0FBSyxNQUFNLFlBQVksSUFBSSxrQkFBa0IsRUFBRTtZQUM3QyxNQUFNLEtBQUssR0FBRyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsQ0FBQTtZQUM5QyxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQTtTQUN0QztJQUNILENBQUMsQ0FBQyxDQUFBO0FBQ0osQ0FBQyxDQUFDLENBQUEifQ==