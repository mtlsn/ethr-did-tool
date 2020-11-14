"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regularExpressions = {
    auth: {
        uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
        fingerprint: {
            hyphen: new RegExp('-', 'g'),
            colon: new RegExp(':', 'g'),
            chars: new RegExp('^[a-fA-F0-9]{40}$'),
        },
    },
    requestUtils: {
        basicAuth: /^(?:Bearer) ([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i,
    },
};
exports.default = regularExpressions;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVndWxhckV4cHJlc3Npb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3JlZ3VsYXJFeHByZXNzaW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQWtCQSxNQUFNLGtCQUFrQixHQUFXO0lBQ2pDLElBQUksRUFBRTtRQUNKLElBQUksRUFBRSw0RUFBNEU7UUFDbEYsV0FBVyxFQUFFO1lBQ1gsTUFBTSxFQUFFLElBQUksTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7WUFDNUIsS0FBSyxFQUFFLElBQUksTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7WUFDM0IsS0FBSyxFQUFFLElBQUksTUFBTSxDQUFDLG1CQUFtQixDQUFDO1NBQ3ZDO0tBQ0Y7SUFDRCxZQUFZLEVBQUU7UUFDWixTQUFTLEVBQUUseUZBQXlGO0tBQ3JHO0NBQ0YsQ0FBQTtBQUNELGtCQUFlLGtCQUFrQixDQUFBIn0=