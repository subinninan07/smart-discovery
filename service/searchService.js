let client;

const initHF = async () => {
    if (!client) {
        const { InferenceClient } = await import("@huggingface/inference");
        client = new InferenceClient(process.env.HF_TOKEN);
    }
};

// Normalize vector for cosine similarity
function normalizeVector(vector) {
    const magnitude = Math.sqrt(
        vector.reduce((sum, val) => sum + val * val, 0)
    );

    return vector.map(val => val / magnitude);
}

async function searchService(text, type = "product") {
    try {
        await initHF();

        // 1️⃣ Choose correct prefix
        const prefix =
            type === "query"
                ? "Represent this query for retrieving relevant products: "
                : "Represent this product for retrieval: ";

        const output = await client.featureExtraction({
            model: "BAAI/bge-base-en-v1.5",
            inputs: prefix + text,
            provider: "hf-inference",
        });

        // 2️⃣ Flatten safely
        const rawVector = Array.isArray(output[0]) ? output[0] : output;

        // 3️⃣ Normalize
        const embedding = normalizeVector(rawVector);

        return embedding;

    } catch (err) {
        console.error("Embedding error:", err);
        throw err;
    }
}

module.exports = { searchService };