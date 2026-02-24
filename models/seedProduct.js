const productData = require('../script/product.json');
const { getDB } = require('../config/mongoConfig');
const { searchService } = require('../service/searchService');

const seedProduct = async () => {
    try {
        const db = getDB();
        const productsCollection = db.collection('products');

        const operations = [];

        for (const product of productData) {

            // 1️⃣ Create text for embedding
            const textToEmbed = `
Product Name: ${product.name}
Brand: ${product.brand}
Category: ${product.category}
Subcategory: ${product.subcategory}
Features: ${product.features?.join(', ')}
Description: ${product.description}
Tags: ${product.tags?.join(', ')}
`;

            // 2️⃣ Generate embedding (STORE IT!)
            const embedding = await searchService(textToEmbed, "product");

            // 3️⃣ Add embedding to product
            const productWithEmbedding = {
                ...product,
                embedding
            };

            operations.push({
                updateOne: {
                    filter: { name: product.name },
                    update: { $set: productWithEmbedding },
                    upsert: true
                }
            });
        }

        await productsCollection.bulkWrite(operations);

        console.log('✅ Products with embeddings upserted successfully');

    } catch (error) {
        console.error('❌ Error seeding product data:', error);
    }
};

module.exports = seedProduct;