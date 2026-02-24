const { getDB } = require('../config/mongoConfig');
const { searchService } = require('./searchService');
const { getRedis } = require('../config/redisConfig');


async function extractPriceFilter(query) {
  const lower = query.toLowerCase();


  const match = lower.match(/(under|below|less than)\s*\$?\s*(\d+)/);
  if (match) {
    return { price: { $lte: parseInt(match[2]) } };
  }

  const matchK = lower.match(/(under|below|less than)\s*(\d+)k/);
  if (matchK) {
    return { price: { $lte: parseInt(matchK[2]) * 1000 } };
  }

  return null;
}


async function extractCategoryFilter(query) {

  try {

    if (!query) {
      return null;
    }

    const redis = getRedis();
    const lower = query.toLowerCase();

    // Fetch category mapping from Redis
    const cachedData = await redis.get("category:filters");

    if (!cachedData) {
      return null; // no config found
    }

    const categoryMap = JSON.parse(cachedData);

    // Loop through subcategories
    for (const subcategory in categoryMap) {

      const keywords = categoryMap[subcategory];

      for (let i = 0; i < keywords.length; i++) {

        if (lower.includes(keywords[i].toLowerCase())) {
          return { subcategory: subcategory };
        }
      }
    }

    return null;

  } catch (error) {
    console.error("Error in extractCategoryFilter:", error);
    return null;
  }
}



function cleanQuery(query) {
  return query
    .replace(/(under|below|less than)\s*\$?\s*\d+k?/gi, "")
    .trim();
}


async function vectorSearch(userQuery) {
  const db = getDB();
  const productsCollection = db.collection('products');

  if (!userQuery) return [];

  const priceFilter = await extractPriceFilter(userQuery);
  const categoryFilter = await extractCategoryFilter(userQuery);
  if(!categoryFilter) {
    return 'no product found'
  }

  const filters = {};
  if (priceFilter) Object.assign(filters, priceFilter);
  if (categoryFilter) Object.assign(filters, categoryFilter);


  const cleanedQuery = cleanQuery(userQuery);


  const queryVector = await searchService(cleanedQuery, "query");


  console.log("Query vector length:", queryVector.length);


  const pipeline = [
    {
      $vectorSearch: {
        index: "vector_index",
        path: "embedding",
        queryVector: queryVector,
        numCandidates: 200,
        limit: 20
      }
    }
  ];


  if (Object.keys(filters).length > 0) {
    pipeline.push({ $match: filters });
  }


  pipeline.push({
    $project: {
      name: 1,
      brand: 1,
      price: 1,
      category: 1,
      subcategory: 1,
      score: { $meta: "vectorSearchScore" }
    }
  });

  const results = await productsCollection.aggregate(pipeline).toArray();

  return results;
}

module.exports = vectorSearch;