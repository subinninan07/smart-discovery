const vectorSearch = require('../service/vectorSearchService');

async function searchcontroller(req, h) {
    try {
        const searchInput = req?.payload?.search;

        if (!searchInput) {
            return h.response({ error: "Search query required" }).code(400);
        }

        const results = await vectorSearch(searchInput);

        return h.response(results).code(200);

    } catch (err) {
        console.error(err);
        return h.response({ error: "Search failed" }).code(500);
    }
}

module.exports = { searchcontroller };